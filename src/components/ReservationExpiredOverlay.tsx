import { AlertTriangle, Lock } from "lucide-react";
import { GlassCard } from "./GlassCard";

interface ReservationExpiredOverlayProps {
  roomName?: string;
}

export function ReservationExpiredOverlay({ roomName = "SMART ROOM OFFICE" }: ReservationExpiredOverlayProps) {
  return (
    <div className="fixed inset-0 z-50 bg-background/95 backdrop-blur-sm flex items-center justify-center p-4">
      <GlassCard className="max-w-md w-full text-center space-y-6 py-8">
        <div className="flex justify-center">
          <div className="relative">
            <Lock className="w-20 h-20 text-destructive" />
            <AlertTriangle className="w-8 h-8 text-warning absolute -bottom-1 -right-1 animate-pulse" />
          </div>
        </div>

        <div className="space-y-2">
          <h2 className="text-2xl font-bold text-destructive">Reserva Encerrada</h2>
          <p className="text-muted-foreground">
            O tempo da sua reserva em <span className="text-foreground font-medium">{roomName}</span> terminou.
          </p>
        </div>

        <div className="bg-secondary/50 rounded-lg p-4 text-sm text-muted-foreground">
          <p>Por favor:</p>
          <ul className="mt-2 space-y-1 text-left list-disc list-inside">
            <li>Organize seus pertences</li>
            <li>Alinhe as cadeiras</li>
            <li>Recolha seu lixo</li>
            <li>Deixe a sala preparada para o próximo usuário</li>
          </ul>
        </div>

        <p className="text-xs text-muted-foreground">
          Os controles da sala foram bloqueados automaticamente.
        </p>
      </GlassCard>
    </div>
  );
}
