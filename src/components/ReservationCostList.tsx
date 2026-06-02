import { useEffect, useState } from "react";
import { GlassCard } from "@/components/GlassCard";
import { Loader2, Calculator } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

interface ReservationCost {
  id: string;
  clientName: string;
  date: string;
  fixedCost: number;
  coffeeCost: number;
  totalCost: number;
}

const PRICING_STORAGE_KEY = "smart_room_pricing_config";
const DEFAULT_HOURLY_RATE = 85;

export function ReservationCostList() {
  const [costs, setCosts] = useState<ReservationCost[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadCosts();
  }, []);

  const loadCosts = async () => {
    setIsLoading(true);

    // Base hourly rate from system_config
    let hourlyRate = DEFAULT_HOURLY_RATE;
    const { data: configData } = await supabase
      .from("system_config")
      .select("value")
      .eq("key", PRICING_STORAGE_KEY)
      .single();
    if (configData?.value && typeof configData.value === "object") {
      const cfg = configData.value as { hourlyRate?: number };
      if (typeof cfg.hourlyRate === "number") hourlyRate = cfg.hourlyRate;
    }

    const { data } = await supabase
      .from("reservations")
      .select("id, client_name, date, total_price")
      .eq("status", "confirmed")
      .order("date", { ascending: false })
      .limit(10);

    const mapped: ReservationCost[] = (data || []).map((r) => {
      const totalCost = Number(r.total_price) || 0;
      const fixedCost = hourlyRate;
      const coffeeCost = Math.max(0, totalCost - fixedCost);
      return {
        id: r.id,
        clientName: r.client_name,
        date: r.date,
        fixedCost,
        coffeeCost,
        totalCost,
      };
    });

    setCosts(mapped);
    setIsLoading(false);
  };


  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(value);
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString("pt-BR");
  };

  if (isLoading) {
    return (
      <GlassCard className="flex items-center justify-center py-8">
        <Loader2 className="w-6 h-6 animate-spin text-primary" />
      </GlassCard>
    );
  }

  return (
    <GlassCard className="space-y-4">
      <h3 className="text-lg font-semibold flex items-center gap-2">
        <Calculator className="w-5 h-5 text-primary" />
        Custo por Reserva
      </h3>

      <p className="text-sm text-muted-foreground">
        Custo fixo proporcional + Cápsulas consumidas (R$ 3/unidade)
      </p>

      <div className="space-y-2">
        {costs.map((cost) => (
          <div
            key={cost.id}
            className="flex items-center justify-between p-3 rounded-lg bg-secondary/30 hover:bg-secondary/50 transition-colors"
          >
            <div>
              <p className="font-medium">{cost.clientName}</p>
              <p className="text-xs text-muted-foreground">{formatDate(cost.date)}</p>
            </div>
            <div className="text-right">
              <p className="font-bold text-primary">{formatCurrency(cost.totalCost)}</p>
              <p className="text-xs text-muted-foreground">
                Fixo: {formatCurrency(cost.fixedCost)} | Café: {formatCurrency(cost.coffeeCost)}
              </p>
            </div>
          </div>
        ))}
      </div>

      {costs.length === 0 && (
        <p className="text-center text-muted-foreground py-4">
          Nenhuma reserva encontrada
        </p>
      )}
    </GlassCard>
  );
}
