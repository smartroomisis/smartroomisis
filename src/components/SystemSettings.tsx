import { useState, useEffect } from "react";
import { GlassCard } from "@/components/GlassCard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "@/hooks/use-toast";
import { Settings, DollarSign, Clock, Percent, Save, RotateCcw } from "lucide-react";

export interface SystemConfig {
  hourlyRate: number;
  coffeePricePerCapsule: number;
  minimumHours: number;
  progressiveDiscount: number;
}

const DEFAULT_CONFIG: SystemConfig = {
  hourlyRate: 85,
  coffeePricePerCapsule: 2.50,
  minimumHours: 1,
  progressiveDiscount: 10,
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

  const handleChange = (field: keyof SystemConfig, value: number) => {
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
        {/* Hourly Rate */}
        <div className="space-y-2">
          <Label className="flex items-center gap-2">
            <DollarSign className="w-4 h-4 text-primary" />
            Valor da Hora Base (R$)
          </Label>
          <Input
            type="number"
            step="0.01"
            min="0"
            value={config.hourlyRate}
            onChange={(e) => handleChange("hourlyRate", parseFloat(e.target.value) || 0)}
            className="font-mono"
          />
          <p className="text-xs text-muted-foreground">
            Preço base para a primeira hora de reserva
          </p>
        </div>

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

        {/* Minimum Hours */}
        <div className="space-y-2">
          <Label className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-accent" />
            Tempo Mínimo de Reserva
          </Label>
          <Select
            value={config.minimumHours.toString()}
            onValueChange={(v) => handleChange("minimumHours", parseInt(v))}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="1">1 hora</SelectItem>
              <SelectItem value="2">2 horas</SelectItem>
              <SelectItem value="3">3 horas</SelectItem>
              <SelectItem value="4">4 horas</SelectItem>
            </SelectContent>
          </Select>
          <p className="text-xs text-muted-foreground">
            Mínimo de horas por reserva
          </p>
        </div>

        {/* Progressive Discount */}
        <div className="space-y-2">
          <Label className="flex items-center gap-2">
            <Percent className="w-4 h-4 text-success" />
            Desconto Progressivo (%)
          </Label>
          <Input
            type="number"
            step="1"
            min="0"
            max="50"
            value={config.progressiveDiscount}
            onChange={(e) => handleChange("progressiveDiscount", parseFloat(e.target.value) || 0)}
            className="font-mono"
          />
          <p className="text-xs text-muted-foreground">
            Desconto aplicado a partir da 2ª hora
          </p>
        </div>
      </div>

      {/* Preview Section */}
      <div className="mt-6 p-4 rounded-lg bg-secondary/50 border border-border">
        <h4 className="text-sm font-medium mb-3">Prévia de Cálculo (3 horas)</h4>
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <span className="text-muted-foreground">1ª hora:</span>
            <span className="ml-2 font-mono">R$ {config.hourlyRate.toFixed(2)}</span>
          </div>
          <div>
            <span className="text-muted-foreground">2ª hora:</span>
            <span className="ml-2 font-mono">
              R$ {(config.hourlyRate * (1 - config.progressiveDiscount / 100)).toFixed(2)}
            </span>
            <span className="text-success text-xs ml-1">(-{config.progressiveDiscount}%)</span>
          </div>
          <div>
            <span className="text-muted-foreground">3ª hora:</span>
            <span className="ml-2 font-mono">
              R$ {(config.hourlyRate * (1 - config.progressiveDiscount / 100)).toFixed(2)}
            </span>
            <span className="text-success text-xs ml-1">(-{config.progressiveDiscount}%)</span>
          </div>
          <div className="col-span-2 pt-2 border-t border-border">
            <span className="font-medium">Total:</span>
            <span className="ml-2 font-mono text-primary font-bold">
              R$ {(
                config.hourlyRate + 
                (config.hourlyRate * (1 - config.progressiveDiscount / 100)) * 2
              ).toFixed(2)}
            </span>
          </div>
        </div>
      </div>
    </GlassCard>
  );
}
