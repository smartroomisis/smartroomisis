import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@14.21.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface CheckoutRequest {
  hours: number;
  price_per_hour: number;
  reservation_id: string;
  user_email: string;
  reservation_date: string;
  start_time: string;
  end_time: string;
}

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const stripeKey = Deno.env.get("STRIPE_SECRET_KEY");
    if (!stripeKey) {
      throw new Error("Stripe secret key not configured");
    }

    const stripe = new Stripe(stripeKey, {
      apiVersion: "2023-10-16",
    });

    const body: CheckoutRequest = await req.json();
    const { hours, price_per_hour, reservation_id, user_email, reservation_date, start_time, end_time } = body;

    const totalAmount = Math.round(hours * price_per_hour * 100); // Convert to cents

    // Create Stripe checkout session
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card", "pix"],
      line_items: [
        {
          price_data: {
            currency: "brl",
            product_data: {
              name: `Reserva Smart Room Office`,
              description: `${hours}h em ${reservation_date} (${start_time} - ${end_time})`,
            },
            unit_amount: totalAmount,
          },
          quantity: 1,
        },
      ],
      mode: "payment",
      success_url: `${req.headers.get("origin")}/dashboard?payment=success&reservation=${reservation_id}`,
      cancel_url: `${req.headers.get("origin")}/booking?payment=cancelled`,
      customer_email: user_email,
      metadata: {
        reservation_id,
        hours: hours.toString(),
        reservation_date,
        start_time,
        end_time,
      },
    });

    return new Response(
      JSON.stringify({ url: session.url, session_id: session.id }),
      { 
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      }
    );
  } catch (error) {
    console.error("Stripe checkout error:", error);
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { 
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 500,
      }
    );
  }
});
