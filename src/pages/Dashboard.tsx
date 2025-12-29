import { StatusIndicator } from "@/components/StatusIndicator";
import { DoorControl } from "@/components/DoorControl";
import { RoomControls } from "@/components/RoomControls";
import { CoffeeControl } from "@/components/CoffeeControl";
import { WaterBanner } from "@/components/WaterBanner";
import { Services } from "@/components/Services";
import { ReservationTimer } from "@/components/ReservationTimer";
import { ReservationExpiredOverlay } from "@/components/ReservationExpiredOverlay";
import { useRoomStatus } from "@/hooks/useRoomStatus";
import { Zap, Loader2 } from "lucide-react";

export default function Dashboard() {
  const { 
    status, 
    isLoading, 
    controlsEnabled, 
    reservationId,
    reservationEndTime,
    isExpired,
    handleReservationExpiry
  } = useRoomStatus();

  // Use reservation end time or fallback to 2 hours from now
  const endTime = reservationEndTime || new Date(Date.now() + 2 * 60 * 60 * 1000);

  return (
    <div className="min-h-screen pb-24 md:pt-20 md:pb-8">
      {/* Expired Overlay */}
      {isExpired && <ReservationExpiredOverlay />}
      
      <div className="container mx-auto px-4 py-6 max-w-2xl">
        {/* Header */}
        <div className="flex items-center gap-3 mb-6 md:hidden">
          <Zap className="w-6 h-6 text-primary" />
          <h1 className="text-xl font-bold neon-text">SMART ROOM ISIS</h1>
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
            ) : isExpired ? (
              "Reserva encerrada"
            ) : controlsEnabled ? (
              "Controle sua reserva"
            ) : (
              "Sala livre - controles desabilitados"
            )}
          </p>
        </div>

        {/* Content */}
        <div className="space-y-5">
          <StatusIndicator status={isExpired ? "available" : status?.isOccupied ? "occupied" : "available"} />
          
          <ReservationTimer 
            endTime={endTime} 
            onExpired={handleReservationExpiry}
          />
          
          <DoorControl disabled={!controlsEnabled || isExpired} />
          <RoomControls disabled={!controlsEnabled || isExpired} initialBrightness={status?.currentBrightness} initialTemp={status?.currentTemp} />
          
          {/* Water Banner */}
          <WaterBanner />
          
          {/* Coffee Control */}
          <CoffeeControl disabled={!controlsEnabled || isExpired} reservationId={reservationId} />
          
          {/* Other Services (Cleaning) */}
          <Services disabled={!controlsEnabled || isExpired} />
        </div>
      </div>
    </div>
  );
}
