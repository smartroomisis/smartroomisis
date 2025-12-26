import { StatusIndicator } from "@/components/StatusIndicator";
import { DoorControl } from "@/components/DoorControl";
import { RoomControls } from "@/components/RoomControls";
import { Services } from "@/components/Services";
import { ReservationTimer } from "@/components/ReservationTimer";
import { useRoomStatus } from "@/hooks/useRoomStatus";
import { Zap, Loader2 } from "lucide-react";

export default function Dashboard() {
  // Mock end time - 2 hours from now
  const endTime = new Date(Date.now() + 2 * 60 * 60 * 1000);
  
  // Room status polling
  const { status, isLoading, controlsEnabled } = useRoomStatus();

  return (
    <div className="min-h-screen pb-24 md:pt-20 md:pb-8">
      <div className="container mx-auto px-4 py-6 max-w-2xl">
        {/* Header */}
        <div className="flex items-center gap-3 mb-6 md:hidden">
          <Zap className="w-6 h-6 text-primary" />
          <h1 className="text-xl font-bold neon-text">Smart Room SJC</h1>
        </div>

        {/* Page Title */}
        <div className="mb-6">
          <h2 className="text-2xl font-bold">Dashboard</h2>
          <p className="text-muted-foreground text-sm">
            {isLoading ? (
              <span className="flex items-center gap-2">
                <Loader2 className="w-3 h-3 animate-spin" />
                Carregando status...
              </span>
            ) : controlsEnabled ? (
              "Controle sua reserva"
            ) : (
              "Sala livre - controles desabilitados"
            )}
          </p>
        </div>

        {/* Content */}
        <div className="space-y-5">
          <StatusIndicator status={status?.isOccupied ? "occupied" : "available"} />
          <ReservationTimer endTime={endTime} />
          <DoorControl accessCode="847291" disabled={!controlsEnabled} />
          <RoomControls disabled={!controlsEnabled} initialBrightness={status?.currentBrightness} initialTemp={status?.currentTemp} />
          <Services disabled={!controlsEnabled} />
        </div>
      </div>
    </div>
  );
}
