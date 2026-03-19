import { supabase } from "@/integrations/supabase/client";

type EmailTemplate = 'welcome' | 'order_confirmation' | 'order_delivered' | 'contact_form_confirmation';

interface SendEmailOptions {
  template: EmailTemplate;
  to: string;
  data?: Record<string, unknown>;
}

export async function sendTransactionalEmail({ template, to, data = {} }: SendEmailOptions) {
  const { data: result, error } = await supabase.functions.invoke('send-transactional-email', {
    body: { template, to, data },
  });

  if (error) {
    console.error('Failed to send transactional email:', error);
    throw error;
  }

  return result;
}
