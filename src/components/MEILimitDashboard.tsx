import { useState, useEffect } from "react";
import { GlassCard } from "@/components/GlassCard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { fetchFinancialSummary, FinancialSummary } from "@/lib/api";
import { toast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { 
  AlertTriangle, 
  TrendingUp, 
  DollarSign, 
  Lock,
  Unlock,
  Save,
  Loader2,
  Target
} from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
  ReferenceLine
} from "recharts";

interface MEIConfig {
  annualLimit: number;
  blockNewReservations: boolean;
}

const STORAGE_KEY = "smart_room_mei_config";
const DEFAULT_CONFIG: MEIConfig = {
  annualLimit: 81000,
  blockNewReservations: false
};

export function getMEIConfig(): MEIConfig {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      return { ...DEFAULT_CONFIG, ...JSON.parse(stored) };
    }
  } catch {
    console.error("Error loading MEI config");
  }
  return DEFAULT_CONFIG;
}

export function saveMEIConfig(config: MEIConfig): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(config));
}

export function isBookingBlocked(): boolean {
  const config = getMEIConfig();
  return config.blockNewReservations;
}

export function MEILimitDashboard() {
  const [config, setConfig] = useState<MEIConfig>(DEFAULT_CONFIG);
  const [summary, setSummary] = useState<FinancialSummary | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [hasChanges, setHasChanges] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setIsLoading(true);
    const { data } = await supabase
      .from("system_config")
      .select("value")
      .eq("key", STORAGE_KEY)
      .single();
    if (data?.value) {
      const merged = { ...DEFAULT_CONFIG, ...(data.value as Partial<MEIConfig>) };
      setConfig(merged);
      saveMEIConfig(merged);
    } else {
      setConfig(getMEIConfig());
    }
    const summaryData = await fetchFinancialSummary();
    setSummary(summaryData);
    setIsLoading(false);
  };

  const handleSave = async () => {
    saveMEIConfig(config);
    await supabase.from("system_config").upsert({
      key: STORAGE_KEY,
      value: JSON.parse(JSON.stringify(config)),
      updated_at: new Date().toISOString(),
    });
    setHasChanges(false);
    toast({
      title: "Configurações Salvas",
      description: "Limite MEI atualizado com sucesso."
    });
  };

  const handleBlockToggle = (checked: boolean) => {
    setConfig(prev => ({ ...prev, blockNewReservations: checked }));
    setHasChanges(true);
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

  const currentRevenue = summary?.totalRevenue || 0;
  const percentage = (currentRevenue / config.annualLimit) * 100;
  const isNearLimit = percentage >= 85;
  const isOverLimit = percentage >= 100;

  const chartData = [
    {
      name: "Faturado",
      value: currentRevenue,
      fill: isOverLimit ? "hsl(var(--destructive))" : isNearLimit ? "hsl(var(--warning))" : "hsl(var(--success))"
    },
    {
      name: "Disponível",
      value: Math.max(0, config.annualLimit - currentRevenue),
      fill: "hsl(var(--muted))"
    }
  ];

  const progressData = [
    { name: "Progresso", faturado: currentRevenue, limite: config.annualLimit }
  ];

  return (
    <div className="space-y-6">
      {/* Alert Banner */}
      {isNearLimit && (
        <div className={`p-4 rounded-lg border ${isOverLimit ? 'bg-destructive/20 border-destructive' : 'bg-warning/20 border-warning'}`}>
          <div className="flex items-center gap-3">
            <AlertTriangle className={`w-6 h-6 ${isOverLimit ? 'text-destructive' : 'text-warning'}`} />
            <div>
              <p className={`font-bold ${isOverLimit ? 'text-destructive' : 'text-warning'}`}>
                {isOverLimit ? 'LIMITE MEI ULTRAPASSADO!' : 'ATENÇÃO: Próximo do Limite MEI!'}
              </p>
              <p className="text-sm text-muted-foreground">
                {isOverLimit 
                  ? 'O faturamento anual ultrapassou o limite permitido para MEI. Considere regularizar sua situação.'
                  : `Você atingiu ${percentage.toFixed(1)}% do limite anual. Considere ativar o bloqueio de novas reservas.`
                }
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Config Card */}
      <GlassCard className="p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <Target className="w-5 h-5 text-primary" />
            <h3 className="text-lg font-semibold">Limite de Faturamento MEI</h3>
          </div>
          <Button size="sm" onClick={handleSave} disabled={!hasChanges}>
            <Save className="w-4 h-4 mr-2" />
            Salvar
          </Button>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          <div className="space-y-2">
            <Label className="flex items-center gap-2">
              <DollarSign className="w-4 h-4 text-primary" />
              Limite Anual (R$)
            </Label>
            <Input
              type="number"
              step="1000"
              min="0"
              value={config.annualLimit}
              onChange={(e) => {
                setConfig(prev => ({ ...prev, annualLimit: parseFloat(e.target.value) || 0 }));
                setHasChanges(true);
              }}
              className="font-mono"
            />
            <p className="text-xs text-muted-foreground">
              Limite atual do MEI: R$ 81.000,00/ano
            </p>
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 rounded-lg bg-secondary/50 border border-border">
              <div className="flex items-center gap-3">
                {config.blockNewReservations ? (
                  <Lock className="w-5 h-5 text-destructive" />
                ) : (
                  <Unlock className="w-5 h-5 text-success" />
                )}
                <div>
                  <p className="font-medium">Bloquear Novas Reservas</p>
                  <p className="text-xs text-muted-foreground">
                    {config.blockNewReservations 
                      ? "Novos agendamentos estão bloqueados"
                      : "Reservas habilitadas normalmente"
                    }
                  </p>
                </div>
              </div>
              <Switch
                checked={config.blockNewReservations}
                onCheckedChange={handleBlockToggle}
              />
            </div>
            {config.blockNewReservations && (
              <Badge variant="destructive" className="w-full justify-center py-2">
                <Lock className="w-4 h-4 mr-2" />
                Sistema bloqueado para novas reservas
              </Badge>
            )}
          </div>
        </div>
      </GlassCard>

      {/* Progress Display */}
      <div className="grid gap-6 md:grid-cols-2">
        <GlassCard className="p-6">
          <h4 className="text-md font-semibold mb-4">Resumo do Ano</h4>
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-muted-foreground">Faturado</span>
              <span className={`text-xl font-bold ${isNearLimit ? (isOverLimit ? 'text-destructive' : 'text-warning') : 'text-success'}`}>
                {formatCurrency(currentRevenue)}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-muted-foreground">Limite</span>
              <span className="text-xl font-bold">{formatCurrency(config.annualLimit)}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-muted-foreground">Disponível</span>
              <span className={`text-xl font-bold ${currentRevenue > config.annualLimit ? 'text-destructive' : 'text-success'}`}>
                {formatCurrency(Math.max(0, config.annualLimit - currentRevenue))}
              </span>
            </div>
            <div className="pt-4 border-t border-border">
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">Utilizado</span>
                <Badge 
                  variant={isOverLimit ? "destructive" : isNearLimit ? "secondary" : "default"}
                  className="text-lg px-3 py-1"
                >
                  {percentage.toFixed(1)}%
                </Badge>
              </div>
            </div>
          </div>
        </GlassCard>

        {/* Bar Chart */}
        <GlassCard className="p-6">
          <h4 className="text-md font-semibold mb-4">Faturado vs Limite</h4>
          <div className="h-[200px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={progressData} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis 
                  type="number" 
                  stroke="hsl(var(--muted-foreground))" 
                  fontSize={12}
                  tickFormatter={(value) => `R$ ${(value / 1000).toFixed(0)}k`}
                  domain={[0, config.annualLimit * 1.1]}
                />
                <YAxis 
                  dataKey="name" 
                  type="category" 
                  stroke="hsl(var(--muted-foreground))" 
                  fontSize={12} 
                  hide 
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "hsl(var(--card))",
                    border: "1px solid hsl(var(--border))",
                    borderRadius: "8px",
                    color: "hsl(var(--foreground))",
                  }}
                  formatter={(value: number) => [formatCurrency(value), ""]}
                />
                <ReferenceLine 
                  x={config.annualLimit * 0.85} 
                  stroke="hsl(var(--warning))" 
                  strokeDasharray="3 3"
                  label={{ value: "85%", fill: "hsl(var(--warning))", fontSize: 10 }}
                />
                <ReferenceLine 
                  x={config.annualLimit} 
                  stroke="hsl(var(--destructive))" 
                  strokeWidth={2}
                  label={{ value: "Limite", fill: "hsl(var(--destructive))", fontSize: 10 }}
                />
                <Bar 
                  dataKey="faturado" 
                  radius={[0, 4, 4, 0]} 
                  fill={isOverLimit ? "hsl(var(--destructive))" : isNearLimit ? "hsl(var(--warning))" : "hsl(var(--success))"}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </GlassCard>
      </div>

      {/* Visual Progress Bar */}
      <GlassCard className="p-6">
        <h4 className="text-md font-semibold mb-4">Progresso Anual</h4>
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span>0%</span>
            <span className="text-warning">85%</span>
            <span className="text-destructive">100%</span>
          </div>
          <div className="h-6 rounded-full bg-muted overflow-hidden relative">
            <div 
              className={`h-full rounded-full transition-all duration-500 ${
                isOverLimit ? 'bg-destructive' : isNearLimit ? 'bg-warning' : 'bg-success'
              }`}
              style={{ width: `${Math.min(100, percentage)}%` }}
            />
            <div 
              className="absolute top-0 h-full w-0.5 bg-warning"
              style={{ left: "85%" }}
            />
            <div 
              className="absolute top-0 h-full w-1 bg-destructive"
              style={{ left: "100%" }}
            />
          </div>
          <div className="flex justify-between text-sm text-muted-foreground">
            <span>{formatCurrency(0)}</span>
            <span>{formatCurrency(config.annualLimit)}</span>
          </div>
        </div>
      </GlassCard>
    </div>
  );
}
