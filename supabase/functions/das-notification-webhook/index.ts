import { serve } from "https://deno.land/std@0.190.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface PaymentStatus {
  referenceMonth: string;
  value: number;
  status: 'paid' | 'pending' | 'alert' | 'overdue';
}

interface NotificationRequest {
  type: 'day15' | 'day20';
  payments: PaymentStatus[];
  date: string;
  alertEmail?: string;
}

const N8N_WEBHOOK_URL = Deno.env.get('N8N_DAS_WEBHOOK_URL') || 'https://construens.app.n8n.cloud/webhook/das-notification';

serve(async (req: Request) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const body: NotificationRequest = await req.json();
    console.log('DAS Notification Request:', JSON.stringify(body, null, 2));

    const { type, payments, date, alertEmail } = body;

    // Filter only unpaid payments
    const pendingPayments = payments.filter(p => p.status !== 'paid');
    
    if (pendingPayments.length === 0) {
      console.log('No pending payments to notify');
      return new Response(
        JSON.stringify({ success: true, message: 'No pending payments' }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Prepare notification payload for n8n
    const notificationPayload = {
      type,
      date,
      alertEmail: alertEmail || 'admin@smartroom.com',
      pendingCount: pendingPayments.length,
      payments: pendingPayments.map(p => ({
        referenceMonth: p.referenceMonth,
        value: p.value,
        status: p.status,
        statusLabel: p.status === 'alert' ? 'Vencimento Próximo' : p.status === 'overdue' ? 'Atrasado' : 'Pendente',
      })),
      summary: {
        totalPending: pendingPayments.reduce((sum, p) => sum + p.value, 0),
        alertCount: pendingPayments.filter(p => p.status === 'alert').length,
        overdueCount: pendingPayments.filter(p => p.status === 'overdue').length,
      },
      message: type === 'day15' 
        ? `⚠️ ALERTA DAS-MEI: ${pendingPayments.length} pagamento(s) com vencimento próximo (dia 20)`
        : `🚨 URGENTE DAS-MEI: ${pendingPayments.length} pagamento(s) vencendo HOJE (dia 20)`,
    };

    console.log('Sending to n8n webhook:', N8N_WEBHOOK_URL);
    console.log('Payload:', JSON.stringify(notificationPayload, null, 2));

    const webhookToken = Deno.env.get('N8N_WEBHOOK_TOKEN');
    if (!webhookToken) {
      console.error('N8N_WEBHOOK_TOKEN not configured');
      return new Response(
        JSON.stringify({ success: false, error: 'Service temporarily unavailable' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Send to n8n webhook
    const webhookResponse = await fetch(N8N_WEBHOOK_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${webhookToken}`,
      },
      body: JSON.stringify(notificationPayload),
    });

    const webhookResult = await webhookResponse.text();
    console.log('Webhook response:', webhookResponse.status, webhookResult);

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: `Notification sent for ${type}`,
        pendingCount: pendingPayments.length,
        webhookStatus: webhookResponse.status,
      }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('Error in das-notification-webhook:', error);
    return new Response(
      JSON.stringify({ success: false, error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
