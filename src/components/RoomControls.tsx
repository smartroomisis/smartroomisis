import { useState, useCallback, useEffect } from "react";
import { GlassCard } from "@/components/GlassCard";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Sun, Thermometer, Minus, Plus, Sparkles, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "@/hooks/use-toast";
import { controlLights, controlHVAC, activateMeetingMode, ERROR_MESSAGES } from "@/lib/api";

// Debounce timer reference
let lightsDebounceTimer: ReturnType<typeof setTimeout> | null = null;
let hvacDebounceTimer: ReturnType<typeof setTimeout> | null = null;

interface RoomControlsProps {
  disabled?: boolean;
  initialBrightness?: number;
  initialTemp?: number;
}

export function RoomControls({ disabled = false, initialBrightness = 70, initialTemp = 22 }: RoomControlsProps) {
  const [lightIntensity, setLightIntensity] = useState<number[]>([initialBrightness]);
  const [temperature, setTemperature] = useState<number>(initialTemp);
  const [meetingMode, setMeetingMode] = useState(false);
  const [isLightsLoading, setIsLightsLoading] = useState(false);
  const [isHvacLoading, setIsHvacLoading] = useState(false);
  const [isMeetingLoading, setIsMeetingLoading] = useState(false);

  // Sync with server values when they change
  useEffect(() => {
    if (initialBrightness !== undefined) setLightIntensity([initialBrightness]);
  }, [initialBrightness]);

  useEffect(() => {
    if (initialTemp !== undefined) setTemperature(initialTemp);
  }, [initialTemp]);

  // Debounced lights control
  const handleLightsChange = useCallback((value: number[]) => {
    if (disabled) return;
    setLightIntensity(value);
    
    if (lightsDebounceTimer) {
      clearTimeout(lightsDebounceTimer);
    }
    
    lightsDebounceTimer = setTimeout(async () => {
      setIsLightsLoading(true);
      try {
        await controlLights(value[0], "manual");
      } catch (error) {
        const message = error instanceof Error ? error.message : ERROR_MESSAGES.CONNECTION;
        toast({
          title: "Erro de Conexão",
          description: message,
          variant: "destructive",
        });
      } finally {
        setIsLightsLoading(false);
      }
    }, 500);
  }, [disabled]);

  // Debounced HVAC control
  const handleTemperatureChange = useCallback(async (newTemp: number) => {
    if (disabled) return;
    setTemperature(newTemp);
    
    if (hvacDebounceTimer) {
      clearTimeout(hvacDebounceTimer);
    }
    
    hvacDebounceTimer = setTimeout(async () => {
      setIsHvacLoading(true);
      try {
        await controlHVAC(newTemp, "on");
      } catch (error) {
        const message = error instanceof Error ? error.message : ERROR_MESSAGES.CONNECTION;
        toast({
          title: "Erro de Conexão",
          description: message,
          variant: "destructive",
        });
      } finally {
        setIsHvacLoading(false);
      }
    }, 500);
  }, [disabled]);

  const handleMeetingMode = async () => {
    if (disabled) return;
    
    // Optimistic UI update - immediately reflect changes
    setMeetingMode(true);
    setLightIntensity([50]);
    setTemperature(21);
    setIsMeetingLoading(true);
    
    try {
      await activateMeetingMode();
      toast({
        title: "Modo Reunião Ativado",
        description: "Iluminação e temperatura ajustadas automaticamente.",
      });
      setTimeout(() => setMeetingMode(false), 3000);
    } catch (error) {
      // Revert optimistic update on error
      setMeetingMode(false);
      const message = error instanceof Error ? error.message : ERROR_MESSAGES.CONNECTION;
      toast({
        title: "Erro de Conexão",
        description: message,
        variant: "destructive",
      });
    } finally {
      setIsMeetingLoading(false);
    }
  };

  return (
    <GlassCard className={cn("space-y-6", disabled && "opacity-50")}>
      <h3 className="text-lg font-semibold flex items-center gap-2">
        <Sparkles className="w-5 h-5 text-primary" />
        Controles da Sala
        {disabled && <span className="text-xs text-muted-foreground">(desabilitado)</span>}
      </h3>

      {/* Lighting Control */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sun className={cn("w-4 h-4", meetingMode ? "text-primary" : "text-muted-foreground")} />
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
          disabled={disabled}
        />
      </div>

      {/* Temperature Control */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Thermometer className={cn("w-4 h-4", meetingMode ? "text-primary" : "text-muted-foreground")} />
            <span className="text-sm text-muted-foreground">Ar-Condicionado</span>
            {isHvacLoading && <Loader2 className="w-3 h-3 animate-spin text-primary" />}
          </div>
        </div>
        <div className="flex items-center justify-center gap-4">
          <Button
            variant="glass"
            size="icon"
            onClick={() => handleTemperatureChange(Math.max(16, temperature - 1))}
            disabled={isHvacLoading || disabled}
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
            disabled={isHvacLoading || disabled}
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
        disabled={isMeetingLoading || disabled}
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
