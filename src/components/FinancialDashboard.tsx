import { useEffect, useState } from "react";
import { GlassCard } from "@/components/GlassCard";
import { fetchFinancialSummary, FinancialSummary } from "@/lib/api";
import { getSystemConfig } from "@/components/SystemSettings";
import { getDASPaidThisYear } from "@/components/DASMEIControl";
import { TrendingUp, TrendingDown, DollarSign, Coffee, Receipt, Loader2, Bus, Briefcase, FileText } from "lucide-react";
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
  const [dasPaidThisYear, setDasPaidThisYear] = useState(0);

  useEffect(() => {
    loadSummary();
  }, []);

  const loadSummary = async () => {
    setIsLoading(true);
    const data = await fetchFinancialSummary();
    setSummary(data);
    setDasPaidThisYear(await getDASPaidThisYear());
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

  const config = getSystemConfig();
  
  // Calculate staff costs based on reservation count
  const staffServiceCost = summary.reservationCount * config.restartFee;
  const staffTransportCost = summary.reservationCount * config.transportAllowance;
  const totalStaffCost = staffServiceCost + staffTransportCost;
  
  // Get DAS paid this year (loaded in state)

  // Adjusted net profit considering all costs including DAS taxes
  const adjustedNetProfit = summary.totalRevenue - summary.totalExpenses - summary.coffeeCost - totalStaffCost - dasPaidThisYear;

  const revenueVsExpensesData = [
    { name: "Receita", value: summary.totalRevenue, fill: "hsl(var(--success))" },
    { name: "Despesas", value: summary.totalExpenses, fill: "hsl(var(--destructive))" },
    { name: "Custo Café", value: summary.coffeeCost, fill: "hsl(var(--warning))" },
    { name: "Staff (Serviço)", value: staffServiceCost, fill: "hsl(var(--accent))" },
    { name: "Staff (Transporte)", value: staffTransportCost, fill: "hsl(var(--primary))" },
    { name: "Impostos (DAS)", value: dasPaidThisYear, fill: "hsl(262 60% 50%)" },
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
      <div className="grid gap-4 md:grid-cols-3">
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

        <GlassCard className="space-y-2">
          <div className="flex items-center justify-between">
            <p className="text-sm text-muted-foreground">Custo Staff</p>
            <Briefcase className="w-4 h-4 text-accent" />
          </div>
          <p className="text-2xl font-bold text-accent">{formatCurrency(totalStaffCost)}</p>
          <div className="text-xs text-muted-foreground space-y-0.5">
            <p className="flex items-center gap-1">
              <Briefcase className="w-3 h-3" /> Serviço: {formatCurrency(staffServiceCost)}
            </p>
            <p className="flex items-center gap-1">
              <Bus className="w-3 h-3" /> Transporte: {formatCurrency(staffTransportCost)}
            </p>
          </div>
        </GlassCard>

        {/* DAS Taxes */}
        <GlassCard className="space-y-2">
          <div className="flex items-center justify-between">
            <p className="text-sm text-muted-foreground">Impostos (DAS)</p>
            <FileText className="w-4 h-4 text-purple-500" />
          </div>
          <p className="text-2xl font-bold text-purple-500">{formatCurrency(dasPaidThisYear)}</p>
          <p className="text-xs text-muted-foreground">Total pago em {new Date().getFullYear()}</p>
        </GlassCard>
      </div>

      {/* Net Profit Card */}
      <GlassCard className={`space-y-2 ${adjustedNetProfit >= 0 ? 'border-success/30' : 'border-destructive/30'}`}>
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">Lucro Líquido</p>
          {adjustedNetProfit >= 0 ? (
            <TrendingUp className="w-4 h-4 text-success" />
          ) : (
            <TrendingDown className="w-4 h-4 text-destructive" />
          )}
        </div>
        <p className={`text-2xl font-bold neon-text ${adjustedNetProfit >= 0 ? 'text-success' : 'text-destructive'}`}>
          {formatCurrency(adjustedNetProfit)}
        </p>
        <p className="text-xs text-muted-foreground">
          Receita - Despesas - Café - Staff - Impostos (DAS)
        </p>
      </GlassCard>

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
