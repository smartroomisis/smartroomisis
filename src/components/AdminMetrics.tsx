import { GlassCard } from "@/components/GlassCard";
import { Skeleton } from "@/components/ui/skeleton";
import { DollarSign, Clock, Coffee, TrendingUp } from "lucide-react";
import { cn } from "@/lib/utils";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

interface Metric {
  title: string;
  value: string;
  change: string;
  icon: typeof DollarSign;
  positive: boolean;
}

export function AdminMetrics() {
  const [metrics, setMetrics] = useState<Metric[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMetrics = async () => {
      setLoading(true);
      try {
        const now = new Date();
        const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
        const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);
        const startStr = startOfMonth.toISOString().split("T")[0];
        const endStr = endOfMonth.toISOString().split("T")[0];

        const { data: reservations } = await supabase
          .from("reservations")
          .select("total_price, hours")
          .eq("status", "confirmed")
          .gte("date", startStr)
          .lte("date", endStr);

        const { data: audits } = await supabase
          .from("staff_audits")
          .select("coffee_capsules_used")
          .gte("created_at", startOfMonth.toISOString())
          .lte("created_at", endOfMonth.toISOString());

        const revenue = (reservations ?? []).reduce(
          (sum, r) => sum + (Number(r.total_price) || 0),
          0
        );
        const hoursUsed = (reservations ?? []).reduce(
          (sum, r) => sum + (Number(r.hours) || 0),
          0
        );
        const capsules = (audits ?? []).reduce(
          (sum, a) => sum + (Number(a.coffee_capsules_used) || 0),
          0
        );

        // Total available hours in the month (24h * days in month)
        const daysInMonth = endOfMonth.getDate();
        const totalMonthHours = daysInMonth * 24;
        const vacancyHours = Math.max(totalMonthHours - hoursUsed, 0);

        const formatCurrency = (value: number) =>
          value.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

        setMetrics([
          {
            title: "Faturamento Mensal",
            value: formatCurrency(revenue),
            change: "",
            icon: DollarSign,
            positive: true,
          },
          {
            title: "Horas Utilizadas",
            value: `${hoursUsed}h`,
            change: "",
            icon: Clock,
            positive: true,
          },
          {
            title: "Cápsulas Consumidas",
            value: `${capsules}`,
            change: "",
            icon: Coffee,
            positive: false,
          },
          {
            title: "Tempo Vacância",
            value: `${vacancyHours}h`,
            change: "",
            icon: Clock,
            positive: true,
          },
        ]);
      } catch (error) {
        console.error("Error fetching admin metrics:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchMetrics();
  }, []);

  if (loading) {
    return (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, index) => (
          <GlassCard key={index}>
            <div className="flex items-start justify-between">
              <div className="space-y-2">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-8 w-28" />
              </div>
              <Skeleton className="h-9 w-9 rounded-lg" />
            </div>
            <div className="mt-3">
              <Skeleton className="h-4 w-32" />
            </div>
          </GlassCard>
        ))}
      </div>
    );
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {metrics.map((metric, index) => (
        <GlassCard
          key={metric.title}
          className="animate-fade-in"
          style={{ animationDelay: `${index * 100}ms` } as React.CSSProperties}
        >
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm text-muted-foreground">{metric.title}</p>
              <p className="text-3xl font-bold mt-1 text-primary neon-text">
                {metric.value}
              </p>
            </div>
            <div
              className={cn(
                "p-2 rounded-lg",
                metric.positive ? "bg-primary/10" : "bg-warning/10"
              )}
            >
              <metric.icon
                className={cn(
                  "w-5 h-5",
                  metric.positive ? "text-primary" : "text-warning"
                )}
              />
            </div>
          </div>
          {metric.change && (
            <div className="mt-3 flex items-center gap-1">
              <TrendingUp
                className={cn(
                  "w-4 h-4",
                  metric.positive ? "text-success" : "text-destructive rotate-180"
                )}
              />
              <span
                className={cn(
                  "text-sm font-medium",
                  metric.positive ? "text-success" : "text-destructive"
                )}
              >
                {metric.change}
              </span>
              <span className="text-xs text-muted-foreground">vs mês anterior</span>
            </div>
          )}
        </GlassCard>
      ))}
    </div>
  );
}
