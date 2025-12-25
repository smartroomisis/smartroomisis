import { useState } from "react";
import { GlassCard } from "@/components/GlassCard";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Sun, Thermometer, Minus, Plus, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "@/hooks/use-toast";

export function RoomControls() {
  const [lightIntensity, setLightIntensity] = useState([70]);
  const [temperature, setTemperature] = useState(22);
  const [meetingMode, setMeetingMode] = useState(false);

  const handleMeetingMode = () => {
    setMeetingMode(true);
    setLightIntensity([50]);
    setTemperature(21);
    toast({
      title: "Modo Reunião Ativado",
      description: "Iluminação e temperatura ajustadas automaticamente.",
    });
    setTimeout(() => setMeetingMode(false), 3000);
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
          </div>
          <span className="text-sm font-medium text-primary">{lightIntensity}%</span>
        </div>
        <Slider
          value={lightIntensity}
          onValueChange={setLightIntensity}
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
          </div>
        </div>
        <div className="flex items-center justify-center gap-4">
          <Button
            variant="glass"
            size="icon"
            onClick={() => setTemperature((t) => Math.max(16, t - 1))}
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
            onClick={() => setTemperature((t) => Math.min(30, t + 1))}
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
      >
        <Sparkles className="w-4 h-4" />
        {meetingMode ? "Modo Reunião Ativo" : "Modo Reunião"}
      </Button>
    </GlassCard>
  );
}
