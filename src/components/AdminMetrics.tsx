import { GlassCard } from "@/components/GlassCard";
import { DollarSign, Clock, Coffee, TrendingUp } from "lucide-react";
import { cn } from "@/lib/utils";

const metrics = [
  {
    title: "Faturamento Mensal",
    value: "R$ 12.450",
    change: "+12%",
    icon: DollarSign,
    positive: true,
  },
  {
    title: "Horas Utilizadas",
    value: "156h",
    change: "+8%",
    icon: Clock,
    positive: true,
  },
  {
    title: "Nível de Café",
    value: "42%",
    change: "-18%",
    icon: Coffee,
    positive: false,
  },
];

export function AdminMetrics() {
  return (
    <div className="grid gap-4 md:grid-cols-3">
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
        </GlassCard>
      ))}
    </div>
  );
}
