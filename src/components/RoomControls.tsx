import { useState, useCallback } from "react";
import { GlassCard } from "@/components/GlassCard";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Sun, Thermometer, Minus, Plus, Sparkles, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "@/hooks/use-toast";
import { controlLights, controlHVAC, activateMeetingMode } from "@/lib/api";

// Debounce timer reference
let lightsDebounceTimer: NodeJS.Timeout | null = null;
let hvacDebounceTimer: NodeJS.Timeout | null = null;

export function RoomControls() {
  const [lightIntensity, setLightIntensity] = useState<number[]>([70]);
  const [temperature, setTemperature] = useState<number>(22);
  const [meetingMode, setMeetingMode] = useState(false);
  const [isLightsLoading, setIsLightsLoading] = useState(false);
  const [isHvacLoading, setIsHvacLoading] = useState(false);
  const [isMeetingLoading, setIsMeetingLoading] = useState(false);

  // Debounced lights control
  const handleLightsChange = useCallback((value: number[]) => {
    setLightIntensity(value);
    
    if (lightsDebounceTimer) {
      clearTimeout(lightsDebounceTimer);
    }
    
    lightsDebounceTimer = setTimeout(async () => {
      setIsLightsLoading(true);
      try {
        await controlLights(value[0], "manual");
      } catch (error) {
        toast({
          title: "Erro de Conexão",
          description: "Erro de conexão com a sala. Verifique sua internet ou contate o suporte.",
          variant: "destructive",
        });
      } finally {
        setIsLightsLoading(false);
      }
    }, 500);
  }, []);

  // Debounced HVAC control
  const handleTemperatureChange = useCallback(async (newTemp: number) => {
    setTemperature(newTemp);
    
    if (hvacDebounceTimer) {
      clearTimeout(hvacDebounceTimer);
    }
    
    hvacDebounceTimer = setTimeout(async () => {
      setIsHvacLoading(true);
      try {
        await controlHVAC(newTemp, "on");
      } catch (error) {
        toast({
          title: "Erro de Conexão",
          description: "Erro de conexão com a sala. Verifique sua internet ou contate o suporte.",
          variant: "destructive",
        });
      } finally {
        setIsHvacLoading(false);
      }
    }, 500);
  }, []);

  const handleMeetingMode = async () => {
    setIsMeetingLoading(true);
    
    try {
      await activateMeetingMode();
      setMeetingMode(true);
      setLightIntensity([50]);
      setTemperature(21);
      toast({
        title: "Modo Reunião Ativado",
        description: "Iluminação e temperatura ajustadas automaticamente.",
      });
      setTimeout(() => setMeetingMode(false), 3000);
    } catch (error) {
      toast({
        title: "Erro de Conexão",
        description: "Erro de conexão com a sala. Verifique sua internet ou contate o suporte.",
        variant: "destructive",
      });
    } finally {
      setIsMeetingLoading(false);
    }
  };

  return (
    <GlassCard className="space-y-6">
      <h3 className="text-lg font-semibold flex items-center gap-2">
        <Sparkles className="w-5 h-5 text-primary" />
        Controles da Sala
      </h3>

      {/* Lighting Control */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sun className="w-4 h-4 text-muted-foreground" />
            <span className="text-sm text-muted-foreground">Iluminação</span>
            {isLightsLoading && <Loader2 className="w-3 h-3 animate-spin text-primary" />}
          </div>
          <span className="text-sm font-medium text-primary">{lightIntensity}%</span>
        </div>
        <Slider
          value={lightIntensity}
          onValueChange={handleLightsChange}
          max={100}
          step={5}
          className="w-full"
        />
      </div>

      {/* Temperature Control */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Thermometer className="w-4 h-4 text-muted-foreground" />
            <span className="text-sm text-muted-foreground">Ar-Condicionado</span>
            {isHvacLoading && <Loader2 className="w-3 h-3 animate-spin text-primary" />}
          </div>
        </div>
        <div className="flex items-center justify-center gap-4">
          <Button
            variant="glass"
            size="icon"
            onClick={() => handleTemperatureChange(Math.max(16, temperature - 1))}
            disabled={isHvacLoading}
          >
            <Minus className="w-4 h-4" />
          </Button>
          <div className="glass-card bg-secondary/50 px-6 py-3 rounded-xl min-w-[100px] text-center">
            <span className="text-3xl font-semibold text-primary neon-text">
              {temperature}°C
            </span>
          </div>
          <Button
            variant="glass"
            size="icon"
            onClick={() => handleTemperatureChange(Math.min(30, temperature + 1))}
            disabled={isHvacLoading}
          >
            <Plus className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Meeting Mode Button */}
      <Button
        variant={meetingMode ? "success" : "neon"}
        className={cn("w-full", meetingMode && "animate-pulse")}
        onClick={handleMeetingMode}
        disabled={isMeetingLoading}
      >
        {isMeetingLoading ? (
          <Loader2 className="w-4 h-4 animate-spin" />
        ) : (
          <Sparkles className="w-4 h-4" />
        )}
        {isMeetingLoading ? "Ativando..." : meetingMode ? "Modo Reunião Ativo" : "Modo Reunião"}
      </Button>
    </GlassCard>
  );
}
