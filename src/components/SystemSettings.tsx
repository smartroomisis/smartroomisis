import { useState, useEffect } from "react";
import { format } from "date-fns";
import { GlassCard } from "@/components/GlassCard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { toast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { cn } from "@/lib/utils";
import { Settings, DollarSign, Save, RotateCcw, User, Mail, Ban, CalendarIcon, Trash2, Loader2 } from "lucide-react";

interface BlockedSlot {
  id: string;
  date: string;
  start_time: string;
  end_time: string;
  reason: string | null;
}

function BlockedSlotsManager() {
  const { user } = useAuth();
  const [slots, setSlots] = useState<BlockedSlot[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [date, setDate] = useState<Date | undefined>();
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");
  const [reason, setReason] = useState("");

  const fetchSlots = async () => {
    setLoading(true);
    const today = new Date().toISOString().split("T")[0];
    const { data, error } = await supabase
      .from("blocked_slots")
      .select("id, date, start_time, end_time, reason")
      .gte("date", today)
      .order("date", { ascending: true })
      .order("start_time", { ascending: true });
    if (!error && data) setSlots(data as BlockedSlot[]);
    setLoading(false);
  };

  useEffect(() => {
    fetchSlots();
  }, []);

  const handleSave = async () => {
    if (!date || !startTime || !endTime) {
      toast({
        title: "Dados incompletos",
        description: "Informe a data e os horários de início e fim.",
        variant: "destructive",
      });
      return;
    }
    setSaving(true);
    const { error } = await supabase.from("blocked_slots").insert({
      date: format(date, "yyyy-MM-dd"),
      start_time: startTime,
      end_time: endTime,
      reason: reason || null,
      created_by: user?.id ?? null,
    });
    setSaving(false);
    if (error) {
      toast({ title: "Erro ao salvar", description: error.message, variant: "destructive" });
      return;
    }
    toast({ title: "Bloqueio criado", description: "O horário foi bloqueado com sucesso." });
    setDate(undefined);
    setStartTime("");
    setEndTime("");
    setReason("");
    fetchSlots();
  };

  const handleDelete = async (id: string) => {
    const { error } = await supabase.from("blocked_slots").delete().eq("id", id);
    if (error) {
      toast({ title: "Erro ao remover", description: error.message, variant: "destructive" });
      return;
    }
    setSlots((prev) => prev.filter((s) => s.id !== id));
    toast({ title: "Bloqueio removido" });
  };

  return (
    <GlassCard className="p-6">
      <div className="flex items-center gap-3 mb-6">
        <Ban className="w-5 h-5 text-destructive" />
        <h3 className="text-lg font-semibold">Bloqueio de Horários</h3>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-2">
          <Label className="flex items-center gap-2">
            <CalendarIcon className="w-4 h-4 text-primary" />
            Data
          </Label>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className={cn("w-full justify-start text-left font-normal", !date && "text-muted-foreground")}
              >
                <CalendarIcon className="w-4 h-4 mr-2" />
                {date ? format(date, "dd/MM/yyyy") : "Selecione a data"}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                mode="single"
                selected={date}
                onSelect={setDate}
                initialFocus
                className={cn("p-3 pointer-events-auto")}
              />
            </PopoverContent>
          </Popover>
        </div>

        <div className="space-y-2">
          <Label>Motivo</Label>
          <Input
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            placeholder="Ex: Manutenção"
          />
        </div>

        <div className="space-y-2">
          <Label>Hora Início</Label>
          <Input type="time" value={startTime} onChange={(e) => setStartTime(e.target.value)} />
        </div>

        <div className="space-y-2">
          <Label>Hora Fim</Label>
          <Input type="time" value={endTime} onChange={(e) => setEndTime(e.target.value)} />
        </div>
      </div>

      <Button className="mt-4" onClick={handleSave} disabled={saving}>
        {saving ? <Loader2 className="w-4 h-4 mr-1 animate-spin" /> : <Save className="w-4 h-4 mr-1" />}
        Salvar Bloqueio
      </Button>

      <div className="mt-6 space-y-2">
        <h4 className="text-sm font-medium text-muted-foreground">Bloqueios ativos</h4>
        {loading ? (
          <div className="flex items-center gap-2 text-sm text-muted-foreground py-4">
            <Loader2 className="w-4 h-4 animate-spin" /> Carregando...
          </div>
        ) : slots.length === 0 ? (
          <p className="text-sm text-muted-foreground py-2">Nenhum bloqueio ativo.</p>
        ) : (
          slots.map((slot) => (
            <div
              key={slot.id}
              className="flex items-center justify-between p-3 rounded-lg bg-secondary/30 border border-border"
            >
              <div className="text-sm">
                <span className="font-medium">
                  {format(new Date(`${slot.date}T00:00:00`), "dd/MM/yyyy")}
                </span>
                <span className="text-muted-foreground ml-2">
                  {slot.start_time.slice(0, 5)}–{slot.end_time.slice(0, 5)}
                </span>
                {slot.reason && (
                  <span className="text-muted-foreground ml-2">• {slot.reason}</span>
                )}
              </div>
              <Button variant="ghost" size="sm" onClick={() => handleDelete(slot.id)}>
                <Trash2 className="w-4 h-4 text-destructive" />
              </Button>
            </div>
          ))
        )}
      </div>
    </GlassCard>
  );
}

export interface SystemConfig {
  hourlyRate: number;
  coffeePricePerCapsule: number;
  minimumHours: number;
  progressiveDiscount: number;
  restartFee: number;
  transportAllowance: number;
  alertEmail: string;
}

const DEFAULT_CONFIG: SystemConfig = {
  hourlyRate: 85,
  coffeePricePerCapsule: 2.50,
  minimumHours: 1,
  progressiveDiscount: 10,
  restartFee: 30,
  transportAllowance: 10,
  alertEmail: '',
};

const STORAGE_KEY = "smart_room_system_config";

export function getSystemConfig(): SystemConfig {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      return { ...DEFAULT_CONFIG, ...JSON.parse(stored) };
    }
  } catch {
    console.error("Error loading system config");
  }
  return DEFAULT_CONFIG;
}

export function saveSystemConfig(config: SystemConfig): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(config));
}

export function SystemSettings() {
  const [config, setConfig] = useState<SystemConfig>(DEFAULT_CONFIG);
  const [hasChanges, setHasChanges] = useState(false);

  useEffect(() => {
    setConfig(getSystemConfig());
  }, []);

  const handleChange = (field: keyof SystemConfig, value: number | string) => {
    setConfig(prev => ({ ...prev, [field]: value }));
    setHasChanges(true);
  };

  const handleSave = () => {
    saveSystemConfig(config);
    setHasChanges(false);
    toast({
      title: "Configurações Salvas",
      description: "Os novos valores foram aplicados com sucesso.",
    });
  };

  const handleReset = () => {
    setConfig(DEFAULT_CONFIG);
    saveSystemConfig(DEFAULT_CONFIG);
    setHasChanges(false);
    toast({
      title: "Valores Restaurados",
      description: "Configurações restauradas para os valores padrão.",
    });
  };

  return (
    <GlassCard className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <Settings className="w-5 h-5 text-primary" />
          <h3 className="text-lg font-semibold">Configurações do Sistema</h3>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={handleReset}>
            <RotateCcw className="w-4 h-4 mr-1" />
            Restaurar
          </Button>
          <Button size="sm" onClick={handleSave} disabled={!hasChanges}>
            <Save className="w-4 h-4 mr-1" />
            Salvar
          </Button>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Coffee Price */}
        <div className="space-y-2">
          <Label className="flex items-center gap-2">
            <DollarSign className="w-4 h-4 text-warning" />
            Valor do Café (R$)
          </Label>
          <Input
            type="number"
            step="0.01"
            min="0"
            value={config.coffeePricePerCapsule}
            onChange={(e) => handleChange("coffeePricePerCapsule", parseFloat(e.target.value) || 0)}
            className="font-mono"
          />
          <p className="text-xs text-muted-foreground">
            Preço por cápsula extra consumida
          </p>
        </div>

        {/* Restart Fee */}
        <div className="space-y-2">
          <Label className="flex items-center gap-2">
            <DollarSign className="w-4 h-4 text-accent" />
            Valor Base do Restart (R$)
          </Label>
          <Input
            type="number"
            step="0.01"
            min="0"
            value={config.restartFee}
            onChange={(e) => handleChange("restartFee", parseFloat(e.target.value) || 0)}
            className="font-mono"
          />
          <p className="text-xs text-muted-foreground">
            Valor fixo pela limpeza da sala
          </p>
        </div>

        {/* Transport Allowance */}
        <div className="space-y-2">
          <Label className="flex items-center gap-2">
            <DollarSign className="w-4 h-4 text-primary" />
            Auxílio Transporte (R$)
          </Label>
          <Input
            type="number"
            step="0.01"
            min="0"
            value={config.transportAllowance}
            onChange={(e) => handleChange("transportAllowance", parseFloat(e.target.value) || 0)}
            className="font-mono"
          />
          <p className="text-xs text-muted-foreground">
            Valor fixo pago por deslocamento
          </p>
        </div>

        {/* Alert Email */}
        <div className="space-y-2 md:col-span-2">
          <Label className="flex items-center gap-2">
            <Mail className="w-4 h-4 text-primary" />
            E-mail para Alertas Fiscais
          </Label>
          <Input
            type="email"
            value={config.alertEmail}
            onChange={(e) => handleChange("alertEmail", e.target.value)}
            placeholder="seu@email.com"
            className="font-mono"
          />
          <p className="text-xs text-muted-foreground">
            E-mail que receberá alertas de vencimento do DAS-MEI
          </p>
        </div>
      </div>

      {/* Staff Payment Preview */}
      <div className="mt-6 p-4 rounded-lg bg-accent/10 border border-accent/30">
        <h4 className="text-sm font-medium mb-3 flex items-center gap-2">
          <User className="w-4 h-4 text-accent" />
          Prévia de Pagamento Staff
        </h4>
        <div className="grid grid-cols-3 gap-4 text-sm">
          <div>
            <span className="text-muted-foreground">Restart:</span>
            <span className="ml-2 font-mono">R$ {config.restartFee.toFixed(2)}</span>
          </div>
          <div>
            <span className="text-muted-foreground">Transporte:</span>
            <span className="ml-2 font-mono">R$ {config.transportAllowance.toFixed(2)}</span>
          </div>
          <div className="text-right">
            <span className="font-medium">Total a Receber:</span>
            <span className="ml-2 font-mono text-accent font-bold">
              R$ {(config.restartFee + config.transportAllowance).toFixed(2)}
            </span>
          </div>
        </div>
      </div>

    </GlassCard>
  );
}
