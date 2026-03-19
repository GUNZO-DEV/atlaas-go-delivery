import { Resend } from 'https://esm.sh/resend@2.0.0'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const resendApiKey = Deno.env.get('RESEND_API_KEY')
const SENDER_FROM = 'Atlaas Go <noreply@notify.atlaasgo.com>'

const BRAND = {
  primary: 'hsl(168, 58%, 29%)',
  foreground: 'hsl(222.2, 84%, 4.9%)',
  mutedFg: 'hsl(215.4, 16.3%, 46.9%)',
  borderRadius: '8px',
}

function escapeHtml(text: string | null | undefined): string {
  if (!text) return ''
  const map: Record<string, string> = {
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#039;',
  }
  return String(text).replace(/[&<>"']/g, (c) => map[c])
}

function wrapAuthEmail(title: string, body: string): string {
  return `<!DOCTYPE html>
<html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>${escapeHtml(title)}</title></head>
<body style="margin:0;padding:0;background:#f4f4f5;font-family:'Segoe UI',Arial,sans-serif;">
<table width="100%" cellpadding="0" cellspacing="0" style="background:#f4f4f5;padding:40px 20px;">
<tr><td align="center">
<table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;background:#ffffff;border-radius:12px;overflow:hidden;box-shadow:0 2px 8px rgba(0,0,0,0.06);">
<tr><td style="background:${BRAND.primary};padding:32px 40px;text-align:center;">
<h1 style="margin:0;color:#fff;font-size:24px;font-weight:700;">Atlaas Go</h1>
</td></tr>
<tr><td style="padding:40px;">
${body}
</td></tr>
<tr><td style="padding:24px 40px;background:#fafafa;border-top:1px solid #eee;text-align:center;">
<p style="margin:0;color:${BRAND.mutedFg};font-size:12px;">© ${new Date().getFullYear()} Atlaas Go</p>
<p style="margin:8px 0 0;color:${BRAND.mutedFg};font-size:11px;">If you didn't request this email, you can safely ignore it.</p>
</td></tr>
</table>
</td></tr></table>
</body></html>`
}

interface AuthEmailPayload {
  user: {
    email: string
    user_metadata?: { full_name?: string }
  }
  email_data: {
    token?: string
    token_hash?: string
    redirect_to?: string
    confirmation_url?: string
    email_action_type: string
    token_new?: string
    token_hash_new?: string
  }
}

function renderAuthEmail(payload: AuthEmailPayload): { subject: string; html: string } | null {
  const { user, email_data } = payload
  const name = escapeHtml(user.user_metadata?.full_name) || 'there'
  const actionType = email_data.email_action_type
  const confirmUrl = email_data.confirmation_url || '#'

  switch (actionType) {
    case 'signup': {
      const body = `
<h2 style="margin:0 0 16px;color:${BRAND.foreground};font-size:22px;">Verify your email ✉️</h2>
<p style="color:${BRAND.mutedFg};font-size:15px;line-height:1.6;margin:0 0 24px;">
  Hi ${name}, thanks for signing up for Atlaas Go! Please confirm your email address to get started.
</p>
<a href="${escapeHtml(confirmUrl)}" style="display:inline-block;background:${BRAND.primary};color:#fff;padding:14px 32px;border-radius:${BRAND.borderRadius};text-decoration:none;font-weight:600;font-size:15px;">Confirm Email →</a>
<p style="color:${BRAND.mutedFg};font-size:13px;margin:24px 0 0;">This link expires in 24 hours.</p>`
      return { subject: 'Confirm your Atlaas Go account', html: wrapAuthEmail('Confirm Email', body) }
    }

    case 'recovery': {
      const body = `
<h2 style="margin:0 0 16px;color:${BRAND.foreground};font-size:22px;">Reset your password 🔐</h2>
<p style="color:${BRAND.mutedFg};font-size:15px;line-height:1.6;margin:0 0 24px;">
  Hi ${name}, we received a request to reset your password. Click the button below to set a new one.
</p>
<a href="${escapeHtml(confirmUrl)}" style="display:inline-block;background:${BRAND.primary};color:#fff;padding:14px 32px;border-radius:${BRAND.borderRadius};text-decoration:none;font-weight:600;font-size:15px;">Reset Password →</a>
<p style="color:${BRAND.mutedFg};font-size:13px;margin:24px 0 0;">This link expires in 1 hour. If you didn't request a reset, ignore this email.</p>`
      return { subject: 'Reset your Atlaas Go password', html: wrapAuthEmail('Reset Password', body) }
    }

    case 'magiclink': {
      const body = `
<h2 style="margin:0 0 16px;color:${BRAND.foreground};font-size:22px;">Sign in to Atlaas Go ✨</h2>
<p style="color:${BRAND.mutedFg};font-size:15px;line-height:1.6;margin:0 0 24px;">
  Hi ${name}, click the button below to sign in to your account. No password needed!
</p>
<a href="${escapeHtml(confirmUrl)}" style="display:inline-block;background:${BRAND.primary};color:#fff;padding:14px 32px;border-radius:${BRAND.borderRadius};text-decoration:none;font-weight:600;font-size:15px;">Sign In →</a>
<p style="color:${BRAND.mutedFg};font-size:13px;margin:24px 0 0;">This link expires in 10 minutes.</p>`
      return { subject: 'Sign in to Atlaas Go', html: wrapAuthEmail('Magic Link', body) }
    }

    case 'invite': {
      const body = `
<h2 style="margin:0 0 16px;color:${BRAND.foreground};font-size:22px;">You're invited! 🎉</h2>
<p style="color:${BRAND.mutedFg};font-size:15px;line-height:1.6;margin:0 0 24px;">
  You've been invited to join Atlaas Go. Click below to accept the invitation and set up your account.
</p>
<a href="${escapeHtml(confirmUrl)}" style="display:inline-block;background:${BRAND.primary};color:#fff;padding:14px 32px;border-radius:${BRAND.borderRadius};text-decoration:none;font-weight:600;font-size:15px;">Accept Invitation →</a>`
      return { subject: "You're invited to Atlaas Go!", html: wrapAuthEmail('Invitation', body) }
    }

    case 'email_change': {
      const body = `
<h2 style="margin:0 0 16px;color:${BRAND.foreground};font-size:22px;">Confirm email change 📧</h2>
<p style="color:${BRAND.mutedFg};font-size:15px;line-height:1.6;margin:0 0 24px;">
  Hi ${name}, please confirm your new email address by clicking the button below.
</p>
<a href="${escapeHtml(confirmUrl)}" style="display:inline-block;background:${BRAND.primary};color:#fff;padding:14px 32px;border-radius:${BRAND.borderRadius};text-decoration:none;font-weight:600;font-size:15px;">Confirm New Email →</a>`
      return { subject: 'Confirm your new email — Atlaas Go', html: wrapAuthEmail('Email Change', body) }
    }

    default:
      return null
  }
}

Deno.serve(async (req) => {
  try {
    if (!resendApiKey) {
      console.error('RESEND_API_KEY not configured')
      return new Response(JSON.stringify({ error: 'Email service not configured' }), {
        status: 500, headers: { 'Content-Type': 'application/json' },
      })
    }

    const resend = new Resend(resendApiKey)
    const payload: AuthEmailPayload = await req.json()

    console.log('Auth email hook received:', payload.email_data?.email_action_type, payload.user?.email)

    const rendered = renderAuthEmail(payload)
    if (!rendered) {
      console.warn('Unknown auth email type:', payload.email_data?.email_action_type)
      return new Response(JSON.stringify({ error: 'Unknown email type' }), {
        status: 400, headers: { 'Content-Type': 'application/json' },
      })
    }

    const emailResponse = await resend.emails.send({
      from: SENDER_FROM,
      to: [payload.user.email],
      subject: rendered.subject,
      html: rendered.html,
    })

    console.log('Auth email sent via Resend:', emailResponse)

    // Log to email_send_log
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    const supabase = createClient(supabaseUrl, supabaseServiceKey)
    await supabase.from('email_send_log').insert({
      message_id: emailResponse?.data?.id || crypto.randomUUID(),
      template_name: `auth_${payload.email_data.email_action_type}`,
      recipient_email: payload.user.email,
      status: 'sent',
    })

    return new Response(JSON.stringify({ success: true }), {
      headers: { 'Content-Type': 'application/json' },
    })
  } catch (error) {
    console.error('Auth email hook error:', error)
    return new Response(JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }), {
      status: 500, headers: { 'Content-Type': 'application/json' },
    })
  }
})
