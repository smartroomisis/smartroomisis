import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface AirtableRecord {
  id: string;
  fields: {
    'Status'?: string;
    'Início'?: string;
    'Fim'?: string;
    'Email'?: string;
    'Nome'?: string;
    'user_id'?: string;
    [key: string]: unknown;
  };
}

interface AirtableResponse {
  records: AirtableRecord[];
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { user_id, user_email } = await req.json();
    
    console.log(`Validating reservation for user: ${user_id || user_email}`);

    const AIRTABLE_API_KEY = Deno.env.get('AIRTABLE_API_KEY');
    const AIRTABLE_BASE_ID = Deno.env.get('AIRTABLE_BASE_ID');
    
    if (!AIRTABLE_API_KEY || !AIRTABLE_BASE_ID) {
      console.error('Missing Airtable configuration');
      return new Response(
        JSON.stringify({ 
          valid: false, 
          error: 'Configuração do Airtable não encontrada' 
        }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Table name from user's Airtable URL
    const tableName = 'Reservas';
    
    // Build filter formula to find active reservations for this user
    // Check if current time is between start and end, and status is active
    const now = new Date().toISOString();
    
    // Airtable API URL with filter
    const airtableUrl = `https://api.airtable.com/v0/${AIRTABLE_BASE_ID}/${encodeURIComponent(tableName)}`;
    
    console.log(`Fetching reservations from Airtable: ${airtableUrl}`);
    
    const response = await fetch(airtableUrl, {
      headers: {
        'Authorization': `Bearer ${AIRTABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`Airtable API error: ${response.status} - ${errorText}`);
      return new Response(
        JSON.stringify({ 
          valid: false, 
          error: 'Erro ao consultar reservas' 
        }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const data: AirtableResponse = await response.json();
    console.log(`Found ${data.records.length} total records in Reservas table`);

    // Find a valid reservation for the current user and time
    const currentTime = new Date();
    
    const validReservation = data.records.find((record) => {
      const fields = record.fields;
      
      // Check status is active or confirmed
      const status = fields['Status']?.toLowerCase();
      const isActiveStatus = status === 'ativo' || status === 'confirmado' || status === 'active' || status === 'confirmed';
      
      if (!isActiveStatus) {
        console.log(`Record ${record.id} skipped - status: ${status}`);
        return false;
      }
      
      // Check time range
      const startTime = fields['Início'] ? new Date(fields['Início']) : null;
      const endTime = fields['Fim'] ? new Date(fields['Fim']) : null;
      
      if (!startTime || !endTime) {
        console.log(`Record ${record.id} skipped - missing time fields`);
        return false;
      }
      
      const isWithinTimeRange = currentTime >= startTime && currentTime <= endTime;
      
      if (!isWithinTimeRange) {
        console.log(`Record ${record.id} skipped - outside time range: ${startTime} - ${endTime}`);
        return false;
      }
      
      // Check if user matches (by email or user_id)
      const recordEmail = fields['Email']?.toLowerCase();
      const recordUserId = fields['user_id'];
      
      const userMatches = 
        (user_email && recordEmail === user_email.toLowerCase()) ||
        (user_id && recordUserId === user_id);
      
      if (!userMatches) {
        console.log(`Record ${record.id} skipped - user mismatch`);
        return false;
      }
      
      console.log(`Found valid reservation: ${record.id}`);
      return true;
    });

    if (validReservation) {
      return new Response(
        JSON.stringify({ 
          valid: true, 
          reservation_id: validReservation.id,
          reservation_name: validReservation.fields['Nome'] || 'Reserva',
          message: 'Reserva válida encontrada'
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    } else {
      console.log('No valid reservation found for user');
      return new Response(
        JSON.stringify({ 
          valid: false, 
          error: 'Nenhuma reserva ativa encontrada para este horário'
        }),
        { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

  } catch (error) {
    console.error('Error validating reservation:', error);
    return new Response(
      JSON.stringify({ 
        valid: false, 
        error: 'Erro interno ao validar reserva' 
      }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
