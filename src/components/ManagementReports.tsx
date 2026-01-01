import { useState, useEffect } from "react";
import { GlassCard } from "@/components/GlassCard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { fetchFinancialSummary, fetchExpenses, FinancialSummary, Expense } from "@/lib/api";
import { getSystemConfig } from "@/components/SystemSettings";
import { 
  FileDown, 
  Calendar, 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  Loader2,
  Filter,
  Receipt,
  Briefcase,
  Coffee
} from "lucide-react";
import { format, parseISO, isWithinInterval, startOfMonth, endOfMonth } from "date-fns";
import { ptBR } from "date-fns/locale";

interface ReportData {
  grossRevenue: number;
  cleaningCost: number;
  suppliesCost: number;
  fixedCost: number;
  transportCost: number;
  coffeeCost: number;
  netProfit: number;
  reservationCount: number;
}

export function ManagementReports() {
  const [startDate, setStartDate] = useState(format(startOfMonth(new Date()), "yyyy-MM-dd"));
  const [endDate, setEndDate] = useState(format(endOfMonth(new Date()), "yyyy-MM-dd"));
  const [summary, setSummary] = useState<FinancialSummary | null>(null);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [reportData, setReportData] = useState<ReportData | null>(null);

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    if (summary && expenses) {
      calculateReport();
    }
  }, [startDate, endDate, summary, expenses]);

  const loadData = async () => {
    setIsLoading(true);
    const [summaryData, expensesData] = await Promise.all([
      fetchFinancialSummary(),
      fetchExpenses()
    ]);
    setSummary(summaryData);
    setExpenses(expensesData);
    setIsLoading(false);
  };

  const calculateReport = () => {
    if (!summary) return;

    const config = getSystemConfig();
    const start = parseISO(startDate);
    const end = parseISO(endDate);

    // Filter expenses by date range
    const filteredExpenses = expenses.filter(exp => {
      const expDate = parseISO(exp.date);
      return isWithinInterval(expDate, { start, end });
    });

    // Calculate costs by category
    const cleaningCost = summary.reservationCount * config.restartFee;
    const transportCost = summary.reservationCount * config.transportAllowance;
    const suppliesCost = filteredExpenses
      .filter(e => e.category === "Insumos" || e.category === "Materiais")
      .reduce((sum, e) => sum + e.amount, 0);
    const fixedCost = filteredExpenses
      .filter(e => e.category === "Aluguel" || e.category === "Internet" || e.category === "Energia")
      .reduce((sum, e) => sum + e.amount, 0);

    const totalCosts = cleaningCost + transportCost + suppliesCost + fixedCost + summary.coffeeCost;

    setReportData({
      grossRevenue: summary.totalRevenue,
      cleaningCost,
      suppliesCost,
      fixedCost,
      transportCost,
      coffeeCost: summary.coffeeCost,
      netProfit: summary.totalRevenue - totalCosts,
      reservationCount: summary.reservationCount
    });
  };

  const exportToCSV = () => {
    if (!reportData) return;

    const headers = [
      "Período",
      "Faturamento Bruto",
      "Custo Limpeza",
      "Custo Insumos",
      "Custos Fixos",
      "Custo Transporte",
      "Custo Café",
      "Lucro Líquido",
      "Reservas"
    ];

    const data = [
      `${format(parseISO(startDate), "dd/MM/yyyy")} a ${format(parseISO(endDate), "dd/MM/yyyy")}`,
      reportData.grossRevenue.toFixed(2),
      reportData.cleaningCost.toFixed(2),
      reportData.suppliesCost.toFixed(2),
      reportData.fixedCost.toFixed(2),
      reportData.transportCost.toFixed(2),
      reportData.coffeeCost.toFixed(2),
      reportData.netProfit.toFixed(2),
      reportData.reservationCount.toString()
    ];

    // Add expense details
    const expenseLines = expenses.map(exp => [
      format(parseISO(exp.date), "dd/MM/yyyy"),
      exp.category,
      exp.description,
      exp.amount.toFixed(2)
    ].join(";"));

    const csvContent = [
      headers.join(";"),
      data.join(";"),
      "",
      "Data;Categoria;Descrição;Valor",
      ...expenseLines
    ].join("\n");

    const blob = new Blob(["\ufeff" + csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `relatorio_${startDate}_${endDate}.csv`;
    link.click();
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(value);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Date Filters */}
      <GlassCard className="p-6">
        <div className="flex items-center gap-3 mb-4">
          <Filter className="w-5 h-5 text-primary" />
          <h3 className="text-lg font-semibold">Filtros do Relatório</h3>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          <div className="space-y-2">
            <Label className="flex items-center gap-2">
              <Calendar className="w-4 h-4" />
              Data Inicial
            </Label>
            <Input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label className="flex items-center gap-2">
              <Calendar className="w-4 h-4" />
              Data Final
            </Label>
            <Input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
            />
          </div>

          <div className="flex items-end">
            <Button onClick={exportToCSV} className="w-full">
              <FileDown className="w-4 h-4 mr-2" />
              Exportar CSV
            </Button>
          </div>
        </div>
      </GlassCard>

      {/* Summary Cards */}
      {reportData && (
        <>
          <div className="grid gap-4 md:grid-cols-3">
            <GlassCard className="space-y-2">
              <div className="flex items-center justify-between">
                <p className="text-sm text-muted-foreground">Faturamento Bruto</p>
                <DollarSign className="w-4 h-4 text-success" />
              </div>
              <p className="text-2xl font-bold text-success">{formatCurrency(reportData.grossRevenue)}</p>
              <p className="text-xs text-muted-foreground">{reportData.reservationCount} reservas no período</p>
            </GlassCard>

            <GlassCard className="space-y-2">
              <div className="flex items-center justify-between">
                <p className="text-sm text-muted-foreground">Total de Custos</p>
                <Receipt className="w-4 h-4 text-destructive" />
              </div>
              <p className="text-2xl font-bold text-destructive">
                {formatCurrency(
                  reportData.cleaningCost + 
                  reportData.suppliesCost + 
                  reportData.fixedCost + 
                  reportData.transportCost + 
                  reportData.coffeeCost
                )}
              </p>
              <p className="text-xs text-muted-foreground">Limpeza + Insumos + Fixos</p>
            </GlassCard>

            <GlassCard className={`space-y-2 ${reportData.netProfit >= 0 ? 'border-success/30' : 'border-destructive/30'}`}>
              <div className="flex items-center justify-between">
                <p className="text-sm text-muted-foreground">Lucro Líquido</p>
                {reportData.netProfit >= 0 ? (
                  <TrendingUp className="w-4 h-4 text-success" />
                ) : (
                  <TrendingDown className="w-4 h-4 text-destructive" />
                )}
              </div>
              <p className={`text-2xl font-bold ${reportData.netProfit >= 0 ? 'text-success' : 'text-destructive'}`}>
                {formatCurrency(reportData.netProfit)}
              </p>
              <p className="text-xs text-muted-foreground">Receita - Todos os custos</p>
            </GlassCard>
          </div>

          {/* Cost Breakdown */}
          <GlassCard className="p-6">
            <h3 className="text-lg font-semibold mb-4">Detalhamento de Custos</h3>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
              <div className="p-4 rounded-lg bg-accent/10 border border-accent/30">
                <div className="flex items-center gap-2 mb-2">
                  <Briefcase className="w-4 h-4 text-accent" />
                  <span className="text-sm font-medium">Limpeza</span>
                </div>
                <p className="text-lg font-bold text-accent">{formatCurrency(reportData.cleaningCost)}</p>
              </div>

              <div className="p-4 rounded-lg bg-primary/10 border border-primary/30">
                <div className="flex items-center gap-2 mb-2">
                  <Receipt className="w-4 h-4 text-primary" />
                  <span className="text-sm font-medium">Transporte</span>
                </div>
                <p className="text-lg font-bold text-primary">{formatCurrency(reportData.transportCost)}</p>
              </div>

              <div className="p-4 rounded-lg bg-warning/10 border border-warning/30">
                <div className="flex items-center gap-2 mb-2">
                  <Coffee className="w-4 h-4 text-warning" />
                  <span className="text-sm font-medium">Café</span>
                </div>
                <p className="text-lg font-bold text-warning">{formatCurrency(reportData.coffeeCost)}</p>
              </div>

              <div className="p-4 rounded-lg bg-secondary border border-border">
                <div className="flex items-center gap-2 mb-2">
                  <Receipt className="w-4 h-4" />
                  <span className="text-sm font-medium">Insumos</span>
                </div>
                <p className="text-lg font-bold">{formatCurrency(reportData.suppliesCost)}</p>
              </div>

              <div className="p-4 rounded-lg bg-secondary border border-border">
                <div className="flex items-center gap-2 mb-2">
                  <Receipt className="w-4 h-4" />
                  <span className="text-sm font-medium">Fixos</span>
                </div>
                <p className="text-lg font-bold">{formatCurrency(reportData.fixedCost)}</p>
              </div>
            </div>
          </GlassCard>
        </>
      )}
    </div>
  );
}
