import { Resend } from 'https://esm.sh/resend@2.0.0'
import { createClient } from 'npm:@supabase/supabase-js@2.75.1'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers':
    'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
}

function escapeHtml(text: string | null | undefined): string {
  if (!text) return ''
  const map: Record<string, string> = {
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#039;',
  }
  return String(text).replace(/[&<>"']/g, (c) => map[c])
}

interface TransactionalEmailRequest {
  template: 'welcome' | 'order_confirmation' | 'order_delivered' | 'contact_form_confirmation'
  to: string
  data: Record<string, unknown>
}

const SENDER_FROM = 'Atlaas Go <noreply@notify.atlaasgo.com>'

const BRAND = {
  primary: 'hsl(168, 58%, 29%)',
  primaryLight: 'hsl(168, 58%, 39%)',
  accent: 'hsl(15, 60%, 48%)',
  foreground: 'hsl(222.2, 84%, 4.9%)',
  mutedFg: 'hsl(215.4, 16.3%, 46.9%)',
  secondary: 'hsl(44, 41%, 73%)',
  bg: '#ffffff',
  borderRadius: '8px',
}

function wrapEmail(title: string, body: string): string {
  return `<!DOCTYPE html>
<html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>${escapeHtml(title)}</title></head>
<body style="margin:0;padding:0;background:#f4f4f5;font-family:'Segoe UI',Arial,sans-serif;">
<table width="100%" cellpadding="0" cellspacing="0" style="background:#f4f4f5;padding:40px 20px;">
<tr><td align="center">
<table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;background:${BRAND.bg};border-radius:12px;overflow:hidden;box-shadow:0 2px 8px rgba(0,0,0,0.06);">
<tr><td style="background:${BRAND.primary};padding:32px 40px;text-align:center;">
<h1 style="margin:0;color:#fff;font-size:24px;font-weight:700;letter-spacing:-0.5px;">Atlaas Go</h1>
</td></tr>
<tr><td style="padding:40px;">
${body}
</td></tr>
<tr><td style="padding:24px 40px;background:#fafafa;border-top:1px solid #eee;text-align:center;">
<p style="margin:0;color:${BRAND.mutedFg};font-size:12px;">© ${new Date().getFullYear()} Atlaas Go. All rights reserved.</p>
<p style="margin:8px 0 0;color:${BRAND.mutedFg};font-size:12px;">Questions? <a href="mailto:support@atlaasgo.com" style="color:${BRAND.primary};">support@atlaasgo.com</a></p>
</td></tr>
</table>
</td></tr></table>
</body></html>`
}

function renderWelcome(data: Record<string, unknown>): { subject: string; html: string } {
  const name = escapeHtml(data.name as string) || 'there'
  const body = `
<h2 style="margin:0 0 16px;color:${BRAND.foreground};font-size:22px;">Welcome aboard, ${name}! 🎉</h2>
<p style="color:${BRAND.mutedFg};font-size:15px;line-height:1.6;margin:0 0 24px;">
  We're thrilled to have you join Atlaas Go — Morocco's favorite food delivery platform.
</p>
<table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:24px;">
  <tr><td style="padding:12px 16px;background:#f0fdf9;border-radius:${BRAND.borderRadius};border-left:4px solid ${BRAND.primary};">
    <p style="margin:0;color:${BRAND.foreground};font-size:14px;"><strong>🍽 Browse</strong> hundreds of restaurants near you</p>
  </td></tr>
  <tr><td style="height:8px;"></td></tr>
  <tr><td style="padding:12px 16px;background:#fff7ed;border-radius:${BRAND.borderRadius};border-left:4px solid ${BRAND.accent};">
    <p style="margin:0;color:${BRAND.foreground};font-size:14px;"><strong>🚀 Track</strong> your orders in real time</p>
  </td></tr>
  <tr><td style="height:8px;"></td></tr>
  <tr><td style="padding:12px 16px;background:#fef9ee;border-radius:${BRAND.borderRadius};border-left:4px solid ${BRAND.secondary};">
    <p style="margin:0;color:${BRAND.foreground};font-size:14px;"><strong>⭐ Earn</strong> loyalty points with every order</p>
  </td></tr>
</table>
<a href="https://atlaas-go-delivery.lovable.app/restaurants" style="display:inline-block;background:${BRAND.primary};color:#fff;padding:14px 32px;border-radius:${BRAND.borderRadius};text-decoration:none;font-weight:600;font-size:15px;">Start Exploring →</a>`
  return { subject: 'Welcome to Atlaas Go! 🎉', html: wrapEmail('Welcome to Atlaas Go', body) }
}

function renderOrderConfirmation(data: Record<string, unknown>): { subject: string; html: string } {
  const orderId = escapeHtml(data.orderId as string) || 'N/A'
  const restaurantName = escapeHtml(data.restaurantName as string) || 'Restaurant'
  const total = escapeHtml(String(data.total ?? '0.00'))
  const deliveryAddress = escapeHtml(data.deliveryAddress as string) || ''
  const items = (data.items as Array<{ name: string; quantity: number; price: number }>) || []

  const itemsHtml = items.map(item => `
    <tr>
      <td style="padding:8px 0;color:${BRAND.foreground};font-size:14px;border-bottom:1px solid #f0f0f0;">${escapeHtml(item.name)}</td>
      <td style="padding:8px 0;text-align:center;color:${BRAND.mutedFg};font-size:14px;border-bottom:1px solid #f0f0f0;">×${item.quantity}</td>
      <td style="padding:8px 0;text-align:right;color:${BRAND.foreground};font-size:14px;border-bottom:1px solid #f0f0f0;">${(item.quantity * item.price).toFixed(2)} MAD</td>
    </tr>`).join('')

  const body = `
<h2 style="margin:0 0 8px;color:${BRAND.foreground};font-size:22px;">Order Confirmed! ✅</h2>
<p style="color:${BRAND.mutedFg};font-size:14px;margin:0 0 24px;">Order <strong style="color:${BRAND.primary};">#${orderId}</strong> from <strong>${restaurantName}</strong></p>
<table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:24px;">
  <tr style="background:#f9f9f9;">
    <th style="padding:10px 0;text-align:left;color:${BRAND.mutedFg};font-size:12px;text-transform:uppercase;">Item</th>
    <th style="padding:10px 0;text-align:center;color:${BRAND.mutedFg};font-size:12px;text-transform:uppercase;">Qty</th>
    <th style="padding:10px 0;text-align:right;color:${BRAND.mutedFg};font-size:12px;text-transform:uppercase;">Price</th>
  </tr>
  ${itemsHtml}
</table>
<table width="100%" cellpadding="0" cellspacing="0" style="background:#f0fdf9;border-radius:${BRAND.borderRadius};padding:16px;margin-bottom:24px;">
  <tr>
    <td style="padding:4px 16px;color:${BRAND.mutedFg};font-size:14px;">Total</td>
    <td style="padding:4px 16px;text-align:right;color:${BRAND.primary};font-size:20px;font-weight:700;">${total} MAD</td>
  </tr>
  <tr>
    <td style="padding:4px 16px;color:${BRAND.mutedFg};font-size:13px;">Delivery to</td>
    <td style="padding:4px 16px;text-align:right;color:${BRAND.foreground};font-size:13px;">${deliveryAddress}</td>
  </tr>
</table>
<a href="https://atlaas-go-delivery.lovable.app/orders" style="display:inline-block;background:${BRAND.primary};color:#fff;padding:14px 32px;border-radius:${BRAND.borderRadius};text-decoration:none;font-weight:600;font-size:15px;">Track Your Order →</a>`
  return { subject: `Order Confirmed #${orderId} ✅`, html: wrapEmail('Order Confirmation', body) }
}

function renderOrderDelivered(data: Record<string, unknown>): { subject: string; html: string } {
  const orderId = escapeHtml(data.orderId as string) || 'N/A'
  const restaurantName = escapeHtml(data.restaurantName as string) || 'Restaurant'
  const body = `
<div style="text-align:center;margin-bottom:24px;">
  <div style="font-size:48px;margin-bottom:16px;">🎊</div>
  <h2 style="margin:0 0 8px;color:${BRAND.foreground};font-size:22px;">Your Order Has Been Delivered!</h2>
  <p style="color:${BRAND.mutedFg};font-size:14px;margin:0;">Order <strong style="color:${BRAND.primary};">#${orderId}</strong> from <strong>${restaurantName}</strong></p>
</div>
<div style="background:#f0fdf9;border-radius:${BRAND.borderRadius};padding:20px;text-align:center;margin-bottom:24px;">
  <p style="margin:0 0 8px;color:${BRAND.foreground};font-size:15px;font-weight:600;">How was your experience?</p>
  <p style="margin:0;color:${BRAND.mutedFg};font-size:13px;">Your feedback helps us improve!</p>
</div>
<div style="text-align:center;">
  <a href="https://atlaas-go-delivery.lovable.app/orders" style="display:inline-block;background:${BRAND.primary};color:#fff;padding:14px 32px;border-radius:${BRAND.borderRadius};text-decoration:none;font-weight:600;font-size:15px;">Rate Your Order →</a>
</div>`
  return { subject: `Order Delivered #${orderId} 🎊`, html: wrapEmail('Order Delivered', body) }
}

function renderContactFormConfirmation(data: Record<string, unknown>): { subject: string; html: string } {
  const name = escapeHtml(data.name as string) || 'there'
  const body = `
<h2 style="margin:0 0 16px;color:${BRAND.foreground};font-size:22px;">We've received your message! 📬</h2>
<p style="color:${BRAND.mutedFg};font-size:15px;line-height:1.6;margin:0 0 24px;">
  Hi ${name}, thanks for reaching out. Our support team will review your message and get back to you within <strong>24 hours</strong>.
</p>
<div style="background:#f9f9f9;border-radius:${BRAND.borderRadius};padding:20px;margin-bottom:24px;border-left:4px solid ${BRAND.primary};">
  <p style="margin:0;color:${BRAND.foreground};font-size:14px;"><strong>What happens next?</strong></p>
  <ul style="margin:12px 0 0;padding-left:20px;color:${BRAND.mutedFg};font-size:14px;line-height:1.8;">
    <li>Our team reviews your message</li>
    <li>You'll receive a reply via email</li>
    <li>Urgent? Call us at +212 XXX-XXXXXX</li>
  </ul>
</div>
<a href="https://atlaas-go-delivery.lovable.app/help" style="display:inline-block;background:${BRAND.primary};color:#fff;padding:14px 32px;border-radius:${BRAND.borderRadius};text-decoration:none;font-weight:600;font-size:15px;">Visit Help Center →</a>`
  return { subject: 'We received your message — Atlaas Go 📬', html: wrapEmail('Message Received', body) }
}

const TEMPLATES: Record<string, (data: Record<string, unknown>) => { subject: string; html: string }> = {
  welcome: renderWelcome,
  order_confirmation: renderOrderConfirmation,
  order_delivered: renderOrderDelivered,
  contact_form_confirmation: renderContactFormConfirmation,
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const resendApiKey = Deno.env.get('RESEND_API_KEY')
    if (!resendApiKey) {
      return new Response(JSON.stringify({ error: 'RESEND_API_KEY not configured' }), {
        status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    const resend = new Resend(resendApiKey)
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY')!

    // Validate auth
    const authHeader = req.headers.get('Authorization')
    if (!authHeader?.startsWith('Bearer ')) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    const supabase = createClient(supabaseUrl, supabaseAnonKey, {
      global: { headers: { Authorization: authHeader } },
    })
    const token = authHeader.replace('Bearer ', '')
    const { data: claimsData, error: claimsError } = await supabase.auth.getClaims(token)
    if (claimsError || !claimsData?.claims) {
      return new Response(JSON.stringify({ error: 'Invalid token' }), {
        status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    const { template, to, data }: TransactionalEmailRequest = await req.json()

    if (!template || !TEMPLATES[template]) {
      return new Response(JSON.stringify({ error: 'Invalid template', valid: Object.keys(TEMPLATES) }), {
        status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    if (!to || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(to)) {
      return new Response(JSON.stringify({ error: 'Invalid email address' }), {
        status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    const { subject, html } = TEMPLATES[template](data || {})

    const emailResponse = await resend.emails.send({
      from: SENDER_FROM,
      to: [to],
      subject,
      html,
    })

    console.log('Resend email sent:', emailResponse)

    // Log to email_send_log for tracking
    const serviceSupabase = createClient(supabaseUrl, Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!)
    await serviceSupabase.from('email_send_log').insert({
      message_id: emailResponse?.data?.id || crypto.randomUUID(),
      template_name: template,
      recipient_email: to,
      status: 'sent',
    })

    return new Response(JSON.stringify({ success: true, id: emailResponse?.data?.id }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  } catch (error) {
    console.error('Error:', error)
    const errorMsg = error instanceof Error ? error.message : 'Unknown error'
    return new Response(JSON.stringify({ error: errorMsg }), {
      status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }
})
