import { GlassCard } from "@/components/GlassCard";
import { Wifi, WifiOff, Lightbulb, Thermometer, Camera, Lock, Speaker } from "lucide-react";
import { cn } from "@/lib/utils";

const devices = [
  { name: "Iluminação Principal", icon: Lightbulb, online: true },
  { name: "Ar-Condicionado", icon: Thermometer, online: true },
  { name: "Câmera de Segurança", icon: Camera, online: true },
  { name: "Fechadura Inteligente", icon: Lock, online: true },
  { name: "Sistema de Áudio", icon: Speaker, online: false },
];

export function DeviceStatus() {
  const onlineCount = devices.filter((d) => d.online).length;

  return (
    <GlassCard>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold flex items-center gap-2">
          <Wifi className="w-5 h-5 text-primary" />
          Status dos Dispositivos
        </h3>
        <span className="text-sm text-muted-foreground">
          {onlineCount}/{devices.length} online
        </span>
      </div>

      <div className="space-y-3">
        {devices.map((device, index) => (
          <div
            key={device.name}
            className="flex items-center gap-3 p-3 rounded-lg bg-secondary/50 animate-fade-in"
            style={{ animationDelay: `${index * 50}ms` }}
          >
            <div
              className={cn(
                "p-2 rounded-lg",
                device.online ? "bg-primary/10" : "bg-destructive/10"
              )}
            >
              <device.icon
                className={cn(
                  "w-4 h-4",
                  device.online ? "text-primary" : "text-destructive"
                )}
              />
            </div>

            <span className="flex-1 text-sm font-medium">{device.name}</span>

            <div className="flex items-center gap-2">
              {device.online ? (
                <>
                  <Wifi className="w-4 h-4 text-success" />
                  <span className="text-xs text-success font-medium">Online</span>
                </>
              ) : (
                <>
                  <WifiOff className="w-4 h-4 text-destructive" />
                  <span className="text-xs text-destructive font-medium">Offline</span>
                </>
              )}
            </div>
          </div>
        ))}
      </div>
    </GlassCard>
  );
}
