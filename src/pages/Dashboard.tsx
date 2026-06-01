import { StatusIndicator } from "@/components/StatusIndicator";
import { DoorControl } from "@/components/DoorControl";
import { RoomControls } from "@/components/RoomControls";
import { CoffeeControl } from "@/components/CoffeeControl";
import { WaterBanner } from "@/components/WaterBanner";
import { Services } from "@/components/Services";
import { ReservationTimer } from "@/components/ReservationTimer";
import { ReservationExpiredOverlay } from "@/components/ReservationExpiredOverlay";
import { GlassCard } from "@/components/GlassCard";
import { WalletBalance } from "@/components/WalletBalance";
import { useRoomStatus } from "@/hooks/useRoomStatus";
import { useAuth } from "@/hooks/useAuth";
import { Zap, Loader2, AlertCircle, Clock, Building2 } from "lucide-react";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

export default function Dashboard() {
  const { 
    status, 
    isLoading, 
    controlsEnabled, 
    reservationId,
    reservationEndTime,
    isExpired,
    noActiveReservation,
    reservationMessage,
    handleReservationExpiry
  } = useRoomStatus();

  const { profile, isEnterprise, user } = useAuth();
  const [companyName, setCompanyName] = useState<string | null>(null);
  const [nextReservation, setNextReservation] = useState<{ date: string; start_time: string } | null>(null);

  useEffect(() => {
    if (profile?.enterprise_company_id) {
      fetchCompanyName(profile.enterprise_company_id);
    }
  }, [profile?.enterprise_company_id]);

  useEffect(() => {
    if (noActiveReservation && user?.id) {
      fetchNextReservation(user.id);
    } else {
      setNextReservation(null);
    }
  }, [noActiveReservation, user?.id]);

  const fetchNextReservation = async (userId: string) => {
    try {
      const today = new Date().toISOString().split("T")[0];
      const { data } = await supabase
        .from("reservations")
        .select("date, start_time")
        .eq("user_id", userId)
        .eq("status", "confirmed")
        .gte("date", today)
        .order("date", { ascending: true })
        .order("start_time", { ascending: true })
        .limit(1)
        .maybeSingle();
      setNextReservation(data ?? null);
    } catch (err) {
      console.error("Error fetching next reservation:", err);
    }
  };

  const fetchCompanyName = async (companyId: string) => {
    try {
      const { data } = await supabase
        .from("enterprise_companies")
        .select("name")
        .eq("id", companyId)
        .single();
      
      if (data) {
        setCompanyName(data.name);
      }
    } catch (err) {
      console.error("Error fetching company:", err);
    }
  };

  // Use reservation end time or fallback to 2 hours from now
  const endTime = reservationEndTime || new Date(Date.now() + 2 * 60 * 60 * 1000);

  return (
    <div className="min-h-screen pb-24 md:pt-20 md:pb-8 theme-client">
      {/* Expired Overlay */}
      {isExpired && <ReservationExpiredOverlay />}
      
      <div className="container mx-auto px-4 py-6 max-w-2xl">
        {/* Header */}
        <div className="flex items-center gap-3 mb-6 md:hidden">
          <Zap className="w-6 h-6 text-primary" />
          <h1 className="text-xl font-bold neon-text">SMART ROOM OFFICE</h1>
        </div>

        {/* Enterprise Welcome Banner */}
        {isEnterprise && companyName && (
          <GlassCard className="mb-5 bg-accent/10 border-accent/30">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-full bg-accent/20">
                <Building2 className="w-5 h-5 text-accent" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Colaborador</p>
                <p className="font-semibold text-accent">{companyName}</p>
              </div>
            </div>
          </GlassCard>
        )}

        {/* Page Title */}
        <div className="mb-6">
          <h2 className="text-2xl font-bold">Início</h2>
          <p className="text-muted-foreground text-sm">
            {isLoading ? (
              <span className="flex items-center gap-2">
                <Loader2 className="w-3 h-3 animate-spin" />
                Carregando status...
              </span>
            ) : isExpired ? (
              "Reserva encerrada"
            ) : noActiveReservation ? (
              "Sem reserva ativa"
            ) : controlsEnabled ? (
              "Controle sua reserva"
            ) : (
              "Sala livre - controles desabilitados"
            )}
          </p>
        </div>

        {/* Wallet Balance - Visible for all users */}
        <div className="mb-5">
          <WalletBalance />
        </div>

        {/* Next upcoming reservation */}
        {noActiveReservation && nextReservation && (
          <GlassCard className="mb-5 bg-primary/5 border-primary/30">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-full bg-primary/10">
                <Clock className="w-5 h-5 text-primary" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Sua próxima reserva</p>
                <p className="font-semibold text-primary">
                  {new Date(`${nextReservation.date}T00:00:00`).toLocaleDateString("pt-BR")} às {nextReservation.start_time.slice(0, 5)}
                </p>
              </div>
            </div>
          </GlassCard>
        )}



        {/* No Active Reservation Message */}
        {!isLoading && noActiveReservation && !isExpired && (
          <GlassCard className="mb-5 border-warning/30 bg-warning/5">
            <div className="flex items-start gap-3">
              <div className="p-2 rounded-full bg-warning/10">
                <AlertCircle className="w-5 h-5 text-warning" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-warning mb-1">Nenhuma reserva ativa</h3>
                <p className="text-sm text-muted-foreground">
                  {reservationMessage || "Nenhuma reserva ativa encontrada para este usuário no momento."}
                </p>
                {reservationMessage?.includes("Próxima reserva") && (
                  <div className="mt-2 flex items-center gap-2 text-sm text-primary">
                    <Clock className="w-4 h-4" />
                    <span>Aguarde o horário da sua reserva para acessar os controles.</span>
                  </div>
                )}
              </div>
            </div>
          </GlassCard>
        )}

        {/* Content */}
        <div className="space-y-5">
          <StatusIndicator status={isExpired ? "available" : status?.isOccupied ? "occupied" : "available"} />
          
          {/* Only show timer if there's an active reservation */}
          {!noActiveReservation && !isLoading && (
            <ReservationTimer 
              endTime={endTime} 
              onExpired={handleReservationExpiry}
            />
          )}
          
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
