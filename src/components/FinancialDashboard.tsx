import { useEffect, useState } from "react";
import { GlassCard } from "@/components/GlassCard";
import { fetchFinancialSummary, FinancialSummary } from "@/lib/api";
import { TrendingUp, TrendingDown, DollarSign, Coffee, Receipt, Loader2 } from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";

const COLORS = [
  "hsl(var(--primary))",
  "hsl(var(--accent))",
  "hsl(var(--warning))",
  "hsl(var(--success))",
  "hsl(var(--destructive))",
  "hsl(175 60% 40%)",
  "hsl(262 60% 50%)",
];

export function FinancialDashboard() {
  const [summary, setSummary] = useState<FinancialSummary | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadSummary();
  }, []);

  const loadSummary = async () => {
    setIsLoading(true);
    const data = await fetchFinancialSummary();
    setSummary(data);
    setIsLoading(false);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!summary) {
    return (
      <GlassCard className="text-center py-8">
        <p className="text-muted-foreground">Não foi possível carregar dados financeiros</p>
      </GlassCard>
    );
  }

  const revenueVsExpensesData = [
    { name: "Receita", value: summary.totalRevenue, fill: "hsl(var(--success))" },
    { name: "Despesas", value: summary.totalExpenses, fill: "hsl(var(--destructive))" },
    { name: "Custo Café", value: summary.coffeeCost, fill: "hsl(var(--warning))" },
  ];

  const expensesByCategoryData = Object.entries(summary.expensesByCategory).map(
    ([category, value], index) => ({
      name: category,
      value,
      fill: COLORS[index % COLORS.length],
    })
  );

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(value);
  };

  return (
    <div className="space-y-6">
      {/* Main Metrics */}
      <div className="grid gap-4 md:grid-cols-4">
        <GlassCard className="space-y-2">
          <div className="flex items-center justify-between">
            <p className="text-sm text-muted-foreground">Receita Total</p>
            <DollarSign className="w-4 h-4 text-success" />
          </div>
          <p className="text-2xl font-bold text-success">{formatCurrency(summary.totalRevenue)}</p>
          <p className="text-xs text-muted-foreground">{summary.reservationCount} reservas</p>
        </GlassCard>

        <GlassCard className="space-y-2">
          <div className="flex items-center justify-between">
            <p className="text-sm text-muted-foreground">Despesas</p>
            <Receipt className="w-4 h-4 text-destructive" />
          </div>
          <p className="text-2xl font-bold text-destructive">{formatCurrency(summary.totalExpenses)}</p>
          <p className="text-xs text-muted-foreground">Fixas + Variáveis</p>
        </GlassCard>

        <GlassCard className="space-y-2">
          <div className="flex items-center justify-between">
            <p className="text-sm text-muted-foreground">Custo Café</p>
            <Coffee className="w-4 h-4 text-warning" />
          </div>
          <p className="text-2xl font-bold text-warning">{formatCurrency(summary.coffeeCost)}</p>
          <p className="text-xs text-muted-foreground">Cápsulas consumidas</p>
        </GlassCard>

        <GlassCard className={`space-y-2 ${summary.netProfit >= 0 ? 'border-success/30' : 'border-destructive/30'}`}>
          <div className="flex items-center justify-between">
            <p className="text-sm text-muted-foreground">Lucro Líquido</p>
            {summary.netProfit >= 0 ? (
              <TrendingUp className="w-4 h-4 text-success" />
            ) : (
              <TrendingDown className="w-4 h-4 text-destructive" />
            )}
          </div>
          <p className={`text-2xl font-bold neon-text ${summary.netProfit >= 0 ? 'text-success' : 'text-destructive'}`}>
            {formatCurrency(summary.netProfit)}
          </p>
          <p className="text-xs text-muted-foreground">Receita - Custos</p>
        </GlassCard>
      </div>

      {/* Charts */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Revenue vs Expenses */}
        <GlassCard className="space-y-4">
          <h3 className="text-lg font-semibold">Receita vs Custos</h3>
          <div className="h-[250px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={revenueVsExpensesData} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis type="number" stroke="hsl(var(--muted-foreground))" fontSize={12} />
                <YAxis dataKey="name" type="category" stroke="hsl(var(--muted-foreground))" fontSize={12} width={80} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "hsl(var(--card))",
                    border: "1px solid hsl(var(--border))",
                    borderRadius: "8px",
                    color: "hsl(var(--foreground))",
                  }}
                  formatter={(value: number) => [formatCurrency(value), ""]}
                />
                <Bar dataKey="value" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </GlassCard>

        {/* Expenses by Category */}
        <GlassCard className="space-y-4">
          <h3 className="text-lg font-semibold">Despesas por Categoria</h3>
          {expensesByCategoryData.length > 0 ? (
            <div className="h-[250px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={expensesByCategoryData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={100}
                    paddingAngle={2}
                    dataKey="value"
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    labelLine={false}
                  >
                    {expensesByCategoryData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.fill} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "hsl(var(--card))",
                      border: "1px solid hsl(var(--border))",
                      borderRadius: "8px",
                      color: "hsl(var(--foreground))",
                    }}
                    formatter={(value: number) => [formatCurrency(value), ""]}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="h-[250px] flex items-center justify-center text-muted-foreground">
              Nenhuma despesa registrada
            </div>
          )}
        </GlassCard>
      </div>
    </div>
  );
}
