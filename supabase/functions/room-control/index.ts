import { createClient } from "npm:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const N8N_WEBHOOK_BASE = Deno.env.get("N8N_WEBHOOK_URL");

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Validate caller JWT
    const authHeader = req.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return new Response(JSON.stringify({ success: false, error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_ANON_KEY")!,
      { global: { headers: { Authorization: authHeader } } }
    );

    const token = authHeader.replace("Bearer ", "");
    const { data: claims, error: authError } = await supabase.auth.getClaims(token);
    if (authError || !claims?.claims) {
      return new Response(JSON.stringify({ success: false, error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const N8N_AUTH_TOKEN = Deno.env.get("N8N_AUTH_TOKEN");
    if (!N8N_AUTH_TOKEN) {
      console.error("[room-control] Missing N8N_AUTH_TOKEN");
      return new Response(JSON.stringify({ success: false, error: "Service configuration error" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (!N8N_WEBHOOK_BASE) {
      console.error("[room-control] Missing N8N_WEBHOOK_URL");
      return new Response(JSON.stringify({ success: false, error: "Service configuration error" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { endpoint, method = "POST", payload } = await req.json();

    if (typeof endpoint !== "string" || !endpoint.startsWith(N8N_WEBHOOK_BASE)) {
      return new Response(JSON.stringify({ success: false, error: "Invalid endpoint" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const options: RequestInit = {
      method,
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${N8N_AUTH_TOKEN}`,
      },
    };
    if (method === "POST" && payload !== undefined) {
      options.body = JSON.stringify(payload);
    }

    const upstream = await fetch(endpoint, options);
    const text = await upstream.text();

    return new Response(text || JSON.stringify({ success: upstream.ok }), {
      status: upstream.ok ? 200 : upstream.status,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("[room-control] Error:", error);
    return new Response(JSON.stringify({ success: false, error: "Internal server error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
