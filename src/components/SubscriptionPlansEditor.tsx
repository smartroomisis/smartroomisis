import { useState, useEffect } from "react";
import { GlassCard } from "@/components/GlassCard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import { 
  Check, 
  Crown, 
  Zap, 
  Briefcase, 
  Building2, 
  Pencil, 
  Loader2,
  DollarSign,
  Clock,
  Save
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
}

const planIcons = {
  basic: Zap,
  pro: Briefcase,
  executive: Crown,
  enterprise: Building2,
};

const planColors = {
  basic: "border-muted",
  pro: "border-primary",
  executive: "border-accent",
  enterprise: "border-warning",
};

export function SubscriptionPlansEditor() {
  const [plans, setPlans] = useState<Plan[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editingPlan, setEditingPlan] = useState<Plan | null>(null);
  const [editForm, setEditForm] = useState({
    name: "",
    description: "",
    monthly_price: 0,
    included_hours: 0,
    min_booking_hours: 1,
  });

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
        description: "Não foi possível carregar os planos",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (plan: Plan) => {
    setEditingPlan(plan);
    setEditForm({
      name: plan.name,
      description: plan.description || "",
      monthly_price: plan.monthly_price,
      included_hours: plan.included_hours,
      min_booking_hours: plan.min_booking_hours,
    });
  };

  const handleSave = async () => {
    if (!editingPlan) return;

    setSaving(true);
    try {
      const { error } = await supabase
        .from("subscription_plans")
        .update({
          name: editForm.name,
          description: editForm.description || null,
          monthly_price: editForm.monthly_price,
          included_hours: editForm.included_hours,
          min_booking_hours: editForm.min_booking_hours,
        })
        .eq("id", editingPlan.id);

      if (error) throw error;

      toast({
        title: "Sucesso",
        description: "Plano atualizado com sucesso",
      });

      setEditingPlan(null);
      fetchPlans();
    } catch (error) {
      console.error("Error updating plan:", error);
      toast({
        title: "Erro",
        description: "Não foi possível atualizar o plano",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  const togglePlanStatus = async (plan: Plan) => {
    try {
      const { error } = await supabase
        .from("subscription_plans")
        .update({ is_active: !plan.is_active })
        .eq("id", plan.id);

      if (error) throw error;

      toast({
        title: "Sucesso",
        description: `Plano ${plan.is_active ? "desativado" : "ativado"}`,
      });

      fetchPlans();
    } catch (error) {
      console.error("Error toggling plan status:", error);
      toast({
        title: "Erro",
        description: "Não foi possível alterar o status do plano",
        variant: "destructive",
      });
    }
  };

  if (loading) {
    return (
      <GlassCard className="p-6 flex items-center justify-center min-h-[300px]">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </GlassCard>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">Gerenciar Planos de Assinatura</h3>
          <p className="text-sm text-muted-foreground">
            Edite valores, horas mínimas e benefícios de cada plano
          </p>
        </div>
      </div>

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
                <Badge variant="secondary" className="absolute -top-2 -right-2">
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
                  onClick={() => handleEdit(plan)}
                >
                  <Pencil className="w-4 h-4" />
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
              </ul>

              <Button
                variant="outline"
                size="sm"
                className="w-full"
                onClick={() => togglePlanStatus(plan)}
              >
                {plan.is_active ? "Desativar" : "Ativar"} Plano
              </Button>
            </GlassCard>
          );
        })}
      </div>

      {/* Edit Dialog */}
      <Dialog open={!!editingPlan} onOpenChange={() => setEditingPlan(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Pencil className="w-5 h-5 text-primary" />
              Editar Plano
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Nome do Plano</Label>
              <Input
                value={editForm.name}
                onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label>Descrição</Label>
              <Textarea
                value={editForm.description}
                onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
                rows={3}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="flex items-center gap-1">
                  <DollarSign className="w-4 h-4" />
                  Preço Mensal (R$)
                </Label>
                <Input
                  type="number"
                  min="0"
                  step="0.01"
                  value={editForm.monthly_price}
                  onChange={(e) => setEditForm({ ...editForm, monthly_price: parseFloat(e.target.value) || 0 })}
                />
              </div>

              <div className="space-y-2">
                <Label className="flex items-center gap-1">
                  <Clock className="w-4 h-4" />
                  Horas Incluídas
                </Label>
                <Input
                  type="number"
                  min="0"
                  value={editForm.included_hours}
                  onChange={(e) => setEditForm({ ...editForm, included_hours: parseInt(e.target.value) || 0 })}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label className="flex items-center gap-1">
                <Clock className="w-4 h-4" />
                Mínimo de Horas por Reserva
              </Label>
              <Input
                type="number"
                min="1"
                value={editForm.min_booking_hours}
                onChange={(e) => setEditForm({ ...editForm, min_booking_hours: parseInt(e.target.value) || 1 })}
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setEditingPlan(null)}>
              Cancelar
            </Button>
            <Button onClick={handleSave} disabled={saving}>
              {saving ? (
                <Loader2 className="w-4 h-4 animate-spin mr-2" />
              ) : (
                <Save className="w-4 h-4 mr-2" />
              )}
              Salvar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}