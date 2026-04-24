import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "npm:@supabase/supabase-js@2.75.1";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
};

interface PushPayload {
  userId: string;
  title: string;
  body: string;
  url?: string;
  tag?: string;
  icon?: string;
}

// ──────────────── FCM v1 Auth (Service Account) ────────────────

function base64UrlEncode(data: Uint8Array): string {
  return btoa(String.fromCharCode(...data))
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=/g, '');
}

async function getAccessToken(serviceAccount: any): Promise<string> {
  const now = Math.floor(Date.now() / 1000);
  const header = { alg: 'RS256', typ: 'JWT' };
  const payload = {
    iss: serviceAccount.client_email,
    sub: serviceAccount.client_email,
    aud: 'https://oauth2.googleapis.com/token',
    iat: now,
    exp: now + 3600,
    scope: 'https://www.googleapis.com/auth/firebase.messaging',
  };

  const encoder = new TextEncoder();
  const headerB64 = base64UrlEncode(encoder.encode(JSON.stringify(header)));
  const payloadB64 = base64UrlEncode(encoder.encode(JSON.stringify(payload)));
  const unsignedToken = `${headerB64}.${payloadB64}`;

  // Import RSA private key
  const pemContent = serviceAccount.private_key
    .replace(/-----BEGIN PRIVATE KEY-----/g, '')
    .replace(/-----END PRIVATE KEY-----/g, '')
    .replace(/\n/g, '');
  const binaryKey = Uint8Array.from(atob(pemContent), c => c.charCodeAt(0));

  const cryptoKey = await crypto.subtle.importKey(
    'pkcs8',
    binaryKey,
    { name: 'RSASSA-PKCS1-v1_5', hash: 'SHA-256' },
    false,
    ['sign']
  );

  const signature = await crypto.subtle.sign(
    'RSASSA-PKCS1-v1_5',
    cryptoKey,
    encoder.encode(unsignedToken)
  );

  const signatureB64 = base64UrlEncode(new Uint8Array(signature));
  const jwt = `${unsignedToken}.${signatureB64}`;

  // Exchange JWT for access token
  const tokenResponse = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: `grant_type=urn:ietf:params:oauth:grant-type:jwt-bearer&assertion=${jwt}`,
  });

  if (!tokenResponse.ok) {
    const errText = await tokenResponse.text();
    throw new Error(`OAuth token exchange failed: ${errText}`);
  }

  const tokenData = await tokenResponse.json();
  return tokenData.access_token;
}

async function sendFCMv1(accessToken: string, projectId: string, message: any): Promise<boolean> {
  try {
    const response = await fetch(
      `https://fcm.googleapis.com/v1/projects/${projectId}/messages:send`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ message }),
      }
    );

    if (!response.ok) {
      const errText = await response.text();
      console.error(`FCM v1 send failed [${response.status}]:`, errText);
      return false;
    }
    return true;
  } catch (error) {
    console.error('FCM v1 send error:', error);
    return false;
  }
}

// ──────────────── Web Push (VAPID) ────────────────

const VAPID_PUBLIC_KEY = Deno.env.get('VAPID_PUBLIC_KEY');
const VAPID_PRIVATE_KEY = Deno.env.get('VAPID_PRIVATE_KEY');
const VAPID_SUBJECT = Deno.env.get('VAPID_SUBJECT') || 'mailto:support@atlaas.ma';

async function sendWebPush(subscription: { endpoint: string; p256dh: string; auth: string }, payload: object): Promise<boolean> {
  if (!VAPID_PUBLIC_KEY || !VAPID_PRIVATE_KEY) {
    console.log('VAPID keys not configured, skipping web push');
    return false;
  }

  try {
    const response = await fetch(subscription.endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/octet-stream',
        'TTL': '86400',
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      console.error('Web push failed:', response.status, await response.text());
      return false;
    }
    return true;
  } catch (error) {
    console.error('Error sending web push:', error);
    return false;
  }
}

// ──────────────── Main Handler ────────────────

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { userId, title, body, url, tag, icon }: PushPayload = await req.json();

    if (!userId || !title || !body) {
      return new Response(
        JSON.stringify({ error: 'Missing required fields: userId, title, body' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
      );
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const notificationPayload = {
      title,
      body,
      icon: icon || '/atlaas-icon-512.png',
      badge: '/atlaas-favicon.png',
      tag: tag || 'order-update',
      data: { url: url || '/' },
      requireInteraction: true,
    };

    let totalSent = 0;
    let totalFailed = 0;

    // ── 1. Web Push (browser subscriptions) ──
    const { data: webSubs, error: webSubError } = await supabase
      .from('push_subscriptions')
      .select('endpoint, p256dh, auth')
      .eq('user_id', userId);

    if (!webSubError && webSubs && webSubs.length > 0) {
      const failedEndpoints: string[] = [];
      for (const sub of webSubs) {
        const success = await sendWebPush(sub, notificationPayload);
        if (success) totalSent++;
        else failedEndpoints.push(sub.endpoint);
      }
      // Cleanup expired web push subscriptions
      if (failedEndpoints.length > 0) {
        await supabase.from('push_subscriptions').delete().in('endpoint', failedEndpoints);
        totalFailed += failedEndpoints.length;
      }
    }

    // ── 2. FCM v1 (mobile/Capacitor tokens) ──
    const serviceAccountJson = Deno.env.get('FIREBASE_SERVICE_ACCOUNT_JSON');
    if (serviceAccountJson) {
      try {
        const serviceAccount = JSON.parse(serviceAccountJson);
        const projectId = serviceAccount.project_id;

        const { data: fcmTokens, error: fcmError } = await supabase
          .from('fcm_tokens')
          .select('token, platform')
          .eq('user_id', userId);

        if (!fcmError && fcmTokens && fcmTokens.length > 0) {
          const accessToken = await getAccessToken(serviceAccount);
          const failedTokenIds: string[] = [];

          for (const tokenRow of fcmTokens) {
            const fcmMessage = {
              token: tokenRow.token,
              notification: { title, body },
              data: { url: url || '/', tag: tag || 'order-update' },
              android: {
                priority: 'high' as const,
                notification: {
                  icon: 'ic_notification',
                  color: '#FF6B00',
                  sound: 'default',
                  click_action: 'FCM_PLUGIN_ACTIVITY',
                },
              },
              apns: {
                payload: {
                  aps: {
                    alert: { title, body },
                    badge: 1,
                    sound: 'default',
                  },
                },
              },
              webpush: {
                notification: {
                  icon: icon || '/atlaas-icon-512.png',
                  badge: '/atlaas-favicon.png',
                  requireInteraction: true,
                },
                fcm_options: { link: url || '/' },
              },
            };

            const success = await sendFCMv1(accessToken, projectId, fcmMessage);
            if (success) totalSent++;
            else failedTokenIds.push(tokenRow.token);
          }

          // Cleanup invalid FCM tokens
          if (failedTokenIds.length > 0) {
            await supabase.from('fcm_tokens').delete().in('token', failedTokenIds);
            totalFailed += failedTokenIds.length;
          }
        }
      } catch (fcmErr) {
        console.error('FCM v1 error:', fcmErr);
      }
    } else {
      console.log('FIREBASE_SERVICE_ACCOUNT_JSON not set, skipping FCM');
    }

    console.log(`Push notifications sent: ${totalSent}, failed: ${totalFailed}`);

    return new Response(
      JSON.stringify({
        success: true,
        message: `Sent ${totalSent} notifications`,
        sent: totalSent,
        failed: totalFailed,
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
    );
  } catch (error) {
    console.error('Error in send-push-notification:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    );
  }
});
