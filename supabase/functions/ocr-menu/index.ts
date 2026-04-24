import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "npm:@supabase/supabase-js@2.75.1";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
};

// ──────────────── Google Auth (Service Account) ────────────────

function base64UrlEncode(data: Uint8Array): string {
  return btoa(String.fromCharCode(...data))
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=/g, '');
}

async function getGoogleAccessToken(serviceAccount: any): Promise<string> {
  const now = Math.floor(Date.now() / 1000);
  const header = { alg: 'RS256', typ: 'JWT' };
  const payload = {
    iss: serviceAccount.client_email,
    sub: serviceAccount.client_email,
    aud: 'https://oauth2.googleapis.com/token',
    iat: now,
    exp: now + 3600,
    scope: 'https://www.googleapis.com/auth/cloud-vision',
  };

  const encoder = new TextEncoder();
  const headerB64 = base64UrlEncode(encoder.encode(JSON.stringify(header)));
  const payloadB64 = base64UrlEncode(encoder.encode(JSON.stringify(payload)));
  const unsignedToken = `${headerB64}.${payloadB64}`;

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

  const tokenResponse = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: `grant_type=urn:ietf:params:oauth:grant-type:jwt-bearer&assertion=${jwt}`,
  });

  if (!tokenResponse.ok) {
    throw new Error(`Google OAuth failed: ${await tokenResponse.text()}`);
  }

  const tokenData = await tokenResponse.json();
  return tokenData.access_token;
}

// ──────────────── Menu Item Parser ────────────────

interface ParsedMenuItem {
  name: string;
  price: number | null;
  description: string;
  category: string;
}

function parseMenuText(rawText: string): ParsedMenuItem[] {
  const lines = rawText.split('\n').map(l => l.trim()).filter(Boolean);
  const items: ParsedMenuItem[] = [];
  let currentCategory = 'General';

  // Price patterns: 25 MAD, 25.00, 25 DH, 25dh, 25,00
  const pricePattern = /(\d+[.,]?\d*)\s*(MAD|DH|دره?م|\.00)?/i;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    // Detect category headers (all caps, no price, short)
    if (line === line.toUpperCase() && line.length < 40 && !pricePattern.test(line) && line.length > 2) {
      currentCategory = line.charAt(0) + line.slice(1).toLowerCase();
      continue;
    }

    // Try to extract item with price
    const priceMatch = line.match(pricePattern);
    if (priceMatch) {
      const price = parseFloat(priceMatch[1].replace(',', '.'));
      const name = line.replace(priceMatch[0], '').replace(/[.\-–—…]+$/, '').trim();
      
      if (name.length > 1) {
        // Check next line for description
        let description = '';
        if (i + 1 < lines.length && !pricePattern.test(lines[i + 1]) && lines[i + 1] !== lines[i + 1].toUpperCase()) {
          description = lines[i + 1];
          i++; // Skip description line
        }

        items.push({ name, price, description, category: currentCategory });
      }
    } else if (line.length > 3 && line.length < 60 && !line.startsWith('#')) {
      // Line without price — could be an item name, check next line for price
      if (i + 1 < lines.length) {
        const nextPriceMatch = lines[i + 1].match(pricePattern);
        if (nextPriceMatch && lines[i + 1].replace(nextPriceMatch[0], '').trim().length < 5) {
          const price = parseFloat(nextPriceMatch[1].replace(',', '.'));
          items.push({ name: line, price, description: '', category: currentCategory });
          i++;
          continue;
        }
      }
    }
  }

  return items;
}

// ──────────────── Main Handler ────────────────

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Auth check
    const authHeader = req.headers.get('Authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_ANON_KEY')!,
      { global: { headers: { Authorization: authHeader } } }
    );

    const token = authHeader.replace('Bearer ', '');
    const { data: claimsData, error: claimsError } = await supabase.auth.getClaims(token);
    if (claimsError || !claimsData?.claims) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }

    // Get image data from request
    const { imageBase64, imageUrl } = await req.json();

    if (!imageBase64 && !imageUrl) {
      return new Response(
        JSON.stringify({ error: 'Provide imageBase64 or imageUrl' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Get service account for Google Vision
    const serviceAccountJson = Deno.env.get('FIREBASE_SERVICE_ACCOUNT_JSON');
    if (!serviceAccountJson) {
      return new Response(
        JSON.stringify({ error: 'Vision API not configured' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const serviceAccount = JSON.parse(serviceAccountJson);
    const accessToken = await getGoogleAccessToken(serviceAccount);

    // Build Vision API request
    const imageSource = imageBase64
      ? { content: imageBase64 }
      : { source: { imageUri: imageUrl } };

    const visionResponse = await fetch(
      'https://vision.googleapis.com/v1/images:annotate',
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          requests: [{
            image: imageSource,
            features: [
              { type: 'TEXT_DETECTION', maxResults: 1 },
              { type: 'DOCUMENT_TEXT_DETECTION', maxResults: 1 },
            ],
          }],
        }),
      }
    );

    if (!visionResponse.ok) {
      const errText = await visionResponse.text();
      console.error('Vision API error:', errText);
      return new Response(
        JSON.stringify({ error: `Vision API failed: ${visionResponse.status}` }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const visionData = await visionResponse.json();
    const annotations = visionData.responses?.[0];
    
    if (annotations?.error) {
      return new Response(
        JSON.stringify({ error: annotations.error.message }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const rawText = annotations?.fullTextAnnotation?.text || annotations?.textAnnotations?.[0]?.description || '';

    if (!rawText) {
      return new Response(
        JSON.stringify({ rawText: '', items: [], message: 'No text detected in image' }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Parse menu items from OCR text
    const items = parseMenuText(rawText);

    return new Response(
      JSON.stringify({
        rawText,
        items,
        itemCount: items.length,
      }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('OCR error:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
