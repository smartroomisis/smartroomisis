import { GlassCard } from "@/components/GlassCard";
import { Coffee, CalendarDays } from "lucide-react";
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

// Mock data - will be replaced with Airtable 'Consumo e Insumos' table
const coffeeConsumptionData = [
  { day: "Seg", cups: 12 },
  { day: "Ter", cups: 19 },
  { day: "Qua", cups: 8 },
  { day: "Qui", cups: 15 },
  { day: "Sex", cups: 22 },
  { day: "Sáb", cups: 5 },
  { day: "Dom", cups: 2 },
];

// Mock data - will be replaced with Airtable occupancy data
const roomOccupancyData = [
  { week: "Sem 1", hours: 32, percentage: 45 },
  { week: "Sem 2", hours: 48, percentage: 68 },
  { week: "Sem 3", hours: 41, percentage: 58 },
  { week: "Sem 4", hours: 56, percentage: 80 },
];

export function AdminCharts() {
  return (
    <div className="grid gap-6 md:grid-cols-2 mt-6">
      {/* Coffee Consumption Chart */}
      <GlassCard className="space-y-4">
        <div className="flex items-center gap-2">
          <Coffee className="w-5 h-5 text-warning" />
          <h3 className="text-lg font-semibold">Consumo de Café</h3>
        </div>
        <p className="text-sm text-muted-foreground">
          Xícaras consumidas por dia (última semana)
        </p>
        <div className="h-[200px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={coffeeConsumptionData}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis 
                dataKey="day" 
                stroke="hsl(var(--muted-foreground))"
                fontSize={12}
              />
              <YAxis 
                stroke="hsl(var(--muted-foreground))"
                fontSize={12}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: "hsl(var(--card))",
                  border: "1px solid hsl(var(--border))",
                  borderRadius: "8px",
                  color: "hsl(var(--foreground))",
                }}
                labelStyle={{ color: "hsl(var(--foreground))" }}
              />
              <Bar 
                dataKey="cups" 
                fill="hsl(var(--warning))" 
                radius={[4, 4, 0, 0]}
                name="Xícaras"
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </GlassCard>

      {/* Room Occupancy Chart */}
      <GlassCard className="space-y-4">
        <div className="flex items-center gap-2">
          <CalendarDays className="w-5 h-5 text-primary" />
          <h3 className="text-lg font-semibold">Ocupação da Sala</h3>
        </div>
        <p className="text-sm text-muted-foreground">
          Taxa de ocupação por semana (último mês)
        </p>
        <div className="h-[200px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={roomOccupancyData}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis 
                dataKey="week" 
                stroke="hsl(var(--muted-foreground))"
                fontSize={12}
              />
              <YAxis 
                stroke="hsl(var(--muted-foreground))"
                fontSize={12}
                tickFormatter={(value) => `${value}%`}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: "hsl(var(--card))",
                  border: "1px solid hsl(var(--border))",
                  borderRadius: "8px",
                  color: "hsl(var(--foreground))",
                }}
                labelStyle={{ color: "hsl(var(--foreground))" }}
                formatter={(value: number) => [`${value}%`, "Ocupação"]}
              />
              <defs>
                <linearGradient id="occupancyGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                </linearGradient>
              </defs>
              <Area
                type="monotone"
                dataKey="percentage"
                stroke="hsl(var(--primary))"
                strokeWidth={2}
                fill="url(#occupancyGradient)"
                name="Ocupação"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </GlassCard>
    </div>
  );
}
