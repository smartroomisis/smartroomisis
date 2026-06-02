import { useEffect, useState } from "react";
import { GlassCard } from "@/components/GlassCard";
import { Skeleton } from "@/components/ui/skeleton";
import { Coffee, CalendarDays } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
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

interface CoffeeData {
  day: string;
  cups: number;
}

interface OccupancyData {
  week: string;
  hours: number;
  percentage: number;
}

const WEEKDAY_LABELS = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];
const WEEKLY_MAX_HOURS = 70; // 10h/dia × 7 dias

export function AdminCharts() {
  const [coffeeConsumptionData, setCoffeeConsumptionData] = useState<CoffeeData[]>([]);
  const [roomOccupancyData, setRoomOccupancyData] = useState<OccupancyData[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadChartData();
  }, []);

  const loadChartData = async () => {
    setIsLoading(true);
    await Promise.all([loadCoffeeData(), loadOccupancyData()]);
    setIsLoading(false);
  };

  const loadCoffeeData = async () => {
    const today = new Date();
    const start = new Date(today);
    start.setDate(today.getDate() - 6);
    start.setHours(0, 0, 0, 0);

    const { data } = await supabase
      .from("staff_audits")
      .select("created_at, coffee_capsules_used")
      .gte("created_at", start.toISOString());

    // Build the last 7 days in order
    const days: CoffeeData[] = [];
    const totalsByDate: Record<string, number> = {};

    for (let i = 6; i >= 0; i--) {
      const d = new Date(today);
      d.setDate(today.getDate() - i);
      const key = d.toISOString().split("T")[0];
      totalsByDate[key] = 0;
      days.push({ day: WEEKDAY_LABELS[d.getDay()], cups: 0 });
    }

    (data || []).forEach((row) => {
      if (!row.created_at) return;
      const key = new Date(row.created_at).toISOString().split("T")[0];
      if (key in totalsByDate) {
        totalsByDate[key] += row.coffee_capsules_used || 0;
      }
    });

    const orderedKeys = Object.keys(totalsByDate);
    setCoffeeConsumptionData(
      orderedKeys.map((key, idx) => ({ day: days[idx].day, cups: totalsByDate[key] }))
    );
  };

  const loadOccupancyData = async () => {
    const today = new Date();
    const start = new Date(today);
    start.setDate(today.getDate() - 27); // last 4 weeks (28 days)
    start.setHours(0, 0, 0, 0);
    const startDate = start.toISOString().split("T")[0];

    const { data } = await supabase
      .from("reservations")
      .select("date, hours")
      .eq("status", "confirmed")
      .gte("date", startDate);

    // 4 week buckets
    const buckets: OccupancyData[] = [];
    for (let w = 0; w < 4; w++) {
      buckets.push({ week: `Sem ${w + 1}`, hours: 0, percentage: 0 });
    }

    (data || []).forEach((row) => {
      if (!row.date) return;
      const d = new Date(`${row.date}T00:00:00`);
      const diffDays = Math.floor((d.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
      const weekIndex = Math.min(3, Math.max(0, Math.floor(diffDays / 7)));
      buckets[weekIndex].hours += Number(row.hours) || 0;
    });

    buckets.forEach((b) => {
      b.percentage = Math.round((b.hours / WEEKLY_MAX_HOURS) * 100);
    });

    setRoomOccupancyData(buckets);
  };

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
          {isLoading ? (
            <Skeleton className="h-full w-full" />
          ) : (
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
          )}
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
          {isLoading ? (
            <Skeleton className="h-full w-full" />
          ) : (
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
          )}
        </div>
      </GlassCard>
    </div>
  );
}
