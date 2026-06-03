import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { GlassCard } from "@/components/GlassCard";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Check, Crown, Zap, Briefcase, Building2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

interface Plan {
  id: string;
  plan_type: string;
  name: string;
  description: string;
  monthly_price: number;
  included_hours: number;
  min_booking_hours: number;
  stripe_price_id: string | null;
}

const planIcons = {
  basic: Zap,
  pro: Briefcase,
  executive: Crown,
  enterprise: Building2,
};

const planColors = {
  basic: "border-muted",
  pro: "border-primary neon-border",
  executive: "border-accent",
  enterprise: "border-warning",
};

export function SubscriptionPlans() {
  const { profile, user } = useAuth();
  const navigate = useNavigate();
  const [plans, setPlans] = useState<Plan[]>([]);
  const [loading, setLoading] = useState(true);
  const [processingId, setProcessingId] = useState<string | null>(null);

  useEffect(() => {
    fetchPlans();
  }, []);

  const fetchPlans = async () => {
    try {
      const { data, error } = await supabase
        .from("subscription_plans")
        .select("*")
        .eq("is_active", true)
        .order("monthly_price", { ascending: true });

      if (error) throw error;
      setPlans(data || []);
    } catch (error) {
      console.error("Error fetching plans:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectPlan = async (plan: Plan) => {
    // TODO: Integrate with Stripe for paid plans
    console.log("Selected plan:", plan);
  };

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="h-64 rounded-xl bg-secondary/50 animate-pulse" />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">Planos de Assinatura</h3>
          <p className="text-sm text-muted-foreground">
            Escolha o plano ideal para você
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {plans.map((plan) => {
          const Icon = planIcons[plan.plan_type as keyof typeof planIcons] || Zap;
          const isCurrentPlan = profile?.current_plan === plan.plan_type;
          const colorClass = planColors[plan.plan_type as keyof typeof planColors] || "";

          return (
            <GlassCard
              key={plan.id}
              className={cn(
                "p-5 relative transition-all duration-300",
                colorClass,
                isCurrentPlan && "ring-2 ring-primary"
              )}
            >
              {isCurrentPlan && (
                <Badge className="absolute -top-2 -right-2 bg-primary">
                  Atual
                </Badge>
              )}

              <div className="flex items-center gap-2 mb-3">
                <div className={cn(
                  "p-2 rounded-lg",
                  plan.plan_type === "pro" && "bg-primary/10",
                  plan.plan_type === "executive" && "bg-accent/10",
                  plan.plan_type === "enterprise" && "bg-warning/10",
                  plan.plan_type === "basic" && "bg-muted"
                )}>
                  <Icon className={cn(
                    "w-5 h-5",
                    plan.plan_type === "pro" && "text-primary",
                    plan.plan_type === "executive" && "text-accent",
                    plan.plan_type === "enterprise" && "text-warning",
                    plan.plan_type === "basic" && "text-muted-foreground"
                  )} />
                </div>
                <h4 className="font-semibold">{plan.name}</h4>
              </div>

              <p className="text-sm text-muted-foreground mb-4 min-h-[40px]">
                {plan.description}
              </p>

              <div className="mb-4">
                {plan.monthly_price > 0 ? (
                  <div className="flex items-baseline gap-1">
                    <span className="text-2xl font-bold">
                      R$ {plan.monthly_price.toFixed(0)}
                    </span>
                    <span className="text-sm text-muted-foreground">/mês</span>
                  </div>
                ) : plan.plan_type === "enterprise" ? (
                  <span className="text-lg font-semibold text-warning">Sob consulta</span>
                ) : (
                  <span className="text-lg font-semibold text-muted-foreground">Gratuito</span>
                )}
              </div>

              <ul className="space-y-2 mb-4 text-sm">
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-success" />
                  {plan.included_hours > 0 
                    ? `${plan.included_hours}h de crédito/mês` 
                    : plan.plan_type === "enterprise" 
                      ? "Uso ilimitado"
                      : "Pague por uso"}
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-success" />
                  Mín. {plan.min_booking_hours}h por reserva
                </li>
                {plan.plan_type === "enterprise" && (
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-success" />
                    Faturamento corporativo
                  </li>
                )}
              </ul>

              <Button
                variant={isCurrentPlan ? "secondary" : plan.plan_type === "pro" ? "default" : "outline"}
                className="w-full"
                disabled={isCurrentPlan}
                onClick={() => handleSelectPlan(plan)}
              >
                {isCurrentPlan ? "Plano Atual" : "Selecionar"}
              </Button>
            </GlassCard>
          );
        })}
      </div>
    </div>
  );
}
