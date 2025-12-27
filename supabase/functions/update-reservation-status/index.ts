import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { reservation_id, new_status } = await req.json();
    
    if (!reservation_id) {
      return new Response(
        JSON.stringify({ success: false, error: 'reservation_id é obrigatório' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`Updating reservation ${reservation_id} status to: ${new_status}`);

    const AIRTABLE_API_KEY = Deno.env.get('AIRTABLE_API_KEY');
    const AIRTABLE_BASE_ID = Deno.env.get('AIRTABLE_BASE_ID');
    
    if (!AIRTABLE_API_KEY || !AIRTABLE_BASE_ID) {
      console.error('Missing Airtable configuration');
      return new Response(
        JSON.stringify({ success: false, error: 'Configuração do Airtable não encontrada' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const tableName = 'Reservas';
    const airtableUrl = `https://api.airtable.com/v0/${AIRTABLE_BASE_ID}/${encodeURIComponent(tableName)}/${reservation_id}`;
    
    console.log(`Updating Airtable record: ${airtableUrl}`);
    
    const response = await fetch(airtableUrl, {
      method: 'PATCH',
      headers: {
        'Authorization': `Bearer ${AIRTABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        fields: {
          'Status': new_status || 'Em uso'
        }
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`Airtable PATCH error: ${response.status} - ${errorText}`);
      return new Response(
        JSON.stringify({ success: false, error: 'Erro ao atualizar status da reserva' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const data = await response.json();
    console.log(`Successfully updated reservation ${reservation_id} to status: ${new_status}`);
    
    return new Response(
      JSON.stringify({ 
        success: true, 
        reservation_id: data.id,
        new_status: data.fields['Status'],
        message: 'Status atualizado com sucesso'
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error updating reservation status:', error);
    return new Response(
      JSON.stringify({ success: false, error: 'Erro interno ao atualizar status' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
