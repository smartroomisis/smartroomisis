import { useState, useEffect } from "react";
import { GlassCard } from "@/components/GlassCard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { toast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { cn } from "@/lib/utils";
import { 
  Check, 
  Crown, 
  Zap, 
  Briefcase, 
  Building2, 
  Edit, 
  Save, 
  Loader2,
  DollarSign,
  Clock,
  Percent
} from "lucide-react";

interface Plan {
  id: string;
  plan_type: string;
  name: string;
  description: string | null;
  monthly_price: number;
  included_hours: number;
  min_booking_hours: number;
  is_active: boolean;
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

export function SubscriptionPlansEditor() {
  const [plans, setPlans] = useState<Plan[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingPlan, setEditingPlan] = useState<Plan | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    fetchPlans();
  }, []);

  const fetchPlans = async () => {
    try {
      const { data, error } = await supabase
        .from("subscription_plans")
        .select("*")
        .order("monthly_price", { ascending: true });

      if (error) throw error;
      setPlans(data || []);
    } catch (error) {
      console.error("Error fetching plans:", error);
      toast({
        title: "Erro",
        description: "Não foi possível carregar os planos.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleEditPlan = (plan: Plan) => {
    setEditingPlan({ ...plan });
  };

  const handleSavePlan = async () => {
    if (!editingPlan) return;

    setIsSaving(true);
    try {
      const { error } = await supabase
        .from("subscription_plans")
        .update({
          name: editingPlan.name,
          description: editingPlan.description,
          monthly_price: editingPlan.monthly_price,
          included_hours: editingPlan.included_hours,
          min_booking_hours: editingPlan.min_booking_hours,
          is_active: editingPlan.is_active,
        })
        .eq("id", editingPlan.id);

      if (error) throw error;

      toast({
        title: "Plano atualizado",
        description: "As alterações foram salvas com sucesso.",
      });

      setEditingPlan(null);
      fetchPlans();
    } catch (error) {
      console.error("Error saving plan:", error);
      toast({
        title: "Erro",
        description: "Não foi possível salvar as alterações.",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h3 className="text-lg font-semibold">Planos de Assinatura</h3>
        <p className="text-sm text-muted-foreground">
          Configure preços, horas incluídas e tempo mínimo de reserva
        </p>
      </div>

      {/* Plans Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {plans.map((plan) => {
          const Icon = planIcons[plan.plan_type as keyof typeof planIcons] || Zap;
          const colorClass = planColors[plan.plan_type as keyof typeof planColors] || "";

          return (
            <GlassCard
              key={plan.id}
              className={cn(
                "p-5 relative transition-all duration-300",
                colorClass,
                !plan.is_active && "opacity-60"
              )}
            >
              {!plan.is_active && (
                <Badge className="absolute -top-2 -right-2 bg-muted">
                  Inativo
                </Badge>
              )}

              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
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
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => handleEditPlan(plan)}
                >
                  <Edit className="w-4 h-4" />
                </Button>
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

              <ul className="space-y-2 text-sm">
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
              </ul>
            </GlassCard>
          );
        })}
      </div>

      {/* Edit Plan Dialog */}
      <Dialog open={!!editingPlan} onOpenChange={() => setEditingPlan(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Edit className="w-5 h-5 text-primary" />
              Editar Plano: {editingPlan?.name}
            </DialogTitle>
          </DialogHeader>

          {editingPlan && (
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="plan-name">Nome do Plano</Label>
                <Input
                  id="plan-name"
                  value={editingPlan.name}
                  onChange={(e) => setEditingPlan({ ...editingPlan, name: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="plan-description">Descrição</Label>
                <Textarea
                  id="plan-description"
                  value={editingPlan.description || ""}
                  onChange={(e) => setEditingPlan({ ...editingPlan, description: e.target.value })}
                  rows={2}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="plan-price" className="flex items-center gap-2">
                    <DollarSign className="w-4 h-4 text-primary" />
                    Preço Mensal (R$)
                  </Label>
                  <Input
                    id="plan-price"
                    type="number"
                    step="0.01"
                    min="0"
                    value={editingPlan.monthly_price}
                    onChange={(e) => setEditingPlan({ 
                      ...editingPlan, 
                      monthly_price: parseFloat(e.target.value) || 0 
                    })}
                    className="font-mono"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="plan-hours" className="flex items-center gap-2">
                    <Clock className="w-4 h-4 text-accent" />
                    Horas Incluídas
                  </Label>
                  <Input
                    id="plan-hours"
                    type="number"
                    min="0"
                    value={editingPlan.included_hours}
                    onChange={(e) => setEditingPlan({ 
                      ...editingPlan, 
                      included_hours: parseInt(e.target.value) || 0 
                    })}
                    className="font-mono"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="plan-min-hours" className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-warning" />
                  Tempo Mínimo de Reserva (horas)
                </Label>
                <Input
                  id="plan-min-hours"
                  type="number"
                  min="1"
                  max="8"
                  value={editingPlan.min_booking_hours}
                  onChange={(e) => setEditingPlan({ 
                    ...editingPlan, 
                    min_booking_hours: parseInt(e.target.value) || 1 
                  })}
                  className="font-mono"
                />
                <p className="text-xs text-muted-foreground">
                  Mínimo de horas que o cliente deve reservar
                </p>
              </div>

              <div className="flex items-center gap-2 p-3 rounded-lg bg-muted/50">
                <input
                  type="checkbox"
                  id="plan-active"
                  checked={editingPlan.is_active}
                  onChange={(e) => setEditingPlan({ ...editingPlan, is_active: e.target.checked })}
                  className="rounded"
                />
                <Label htmlFor="plan-active" className="cursor-pointer">
                  Plano ativo e visível para clientes
                </Label>
              </div>
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setEditingPlan(null)}>
              Cancelar
            </Button>
            <Button onClick={handleSavePlan} disabled={isSaving}>
              {isSaving ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin mr-2" />
                  A salvar...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4 mr-2" />
                  Salvar Alterações
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
