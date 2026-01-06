import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

interface PricingConfig {
  hourlyRate: number;
  progressiveDiscount: number;
  minimumHours: number;
  includedHours: number;
}

const DEFAULT_PRICING: PricingConfig = {
  hourlyRate: 85,
  progressiveDiscount: 10,
  minimumHours: 2,
  includedHours: 0,
};

export function usePricingConfig() {
  const { profile } = useAuth();
  const [config, setConfig] = useState<PricingConfig>(DEFAULT_PRICING);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPricing();
  }, [profile?.current_plan]);

  const fetchPricing = async () => {
    setLoading(true);
    try {
      const planType = profile?.current_plan || "basic";
      
      const { data, error } = await supabase
        .from("subscription_plans")
        .select("monthly_price, included_hours, min_booking_hours")
        .eq("plan_type", planType)
        .eq("is_active", true)
        .maybeSingle();

      if (error) throw error;

      if (data) {
        // Calculate hourly rate based on monthly price and included hours
        // Default to 85 if no included hours (pay-per-use)
        const hourlyRate = data.included_hours > 0 
          ? data.monthly_price / data.included_hours 
          : 85;

        setConfig({
          hourlyRate: Math.max(hourlyRate, 85), // Minimum 85/hour
          progressiveDiscount: 10, // Fixed 10% progressive discount
          minimumHours: data.min_booking_hours || 2,
          includedHours: data.included_hours || 0,
        });
      }
    } catch (error) {
      console.error("Error fetching pricing config:", error);
    } finally {
      setLoading(false);
    }
  };

  return { config, loading };
}