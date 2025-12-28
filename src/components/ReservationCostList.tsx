import { useEffect, useState } from "react";
import { GlassCard } from "@/components/GlassCard";
import { Loader2, Calculator } from "lucide-react";

interface ReservationCost {
  id: string;
  clientName: string;
  date: string;
  fixedCost: number;
  coffeeCost: number;
  totalCost: number;
}

// Mock data - would come from Airtable in production
const mockReservationCosts: ReservationCost[] = [
  { id: "1", clientName: "João Silva", date: "2024-01-15", fixedCost: 45, coffeeCost: 6, totalCost: 51 },
  { id: "2", clientName: "Maria Santos", date: "2024-01-14", fixedCost: 45, coffeeCost: 9, totalCost: 54 },
  { id: "3", clientName: "Carlos Oliveira", date: "2024-01-13", fixedCost: 45, coffeeCost: 3, totalCost: 48 },
  { id: "4", clientName: "Ana Costa", date: "2024-01-12", fixedCost: 45, coffeeCost: 6, totalCost: 51 },
  { id: "5", clientName: "Pedro Lima", date: "2024-01-11", fixedCost: 45, coffeeCost: 0, totalCost: 45 },
];

export function ReservationCostList() {
  const [costs, setCosts] = useState<ReservationCost[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Simulate API call
    setTimeout(() => {
      setCosts(mockReservationCosts);
      setIsLoading(false);
    }, 500);
  }, []);

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
