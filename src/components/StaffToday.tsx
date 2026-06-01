import { useState, useEffect } from "react";
import { GlassCard } from "@/components/GlassCard";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { ROOM_ID } from "@/lib/api";
import {
  DoorOpen,
  DoorClosed,
  Clock,
  Calendar,
  Loader2,
  UserCheck,
  CheckCircle2,
} from "lucide-react";

interface TodayReservation {
  id: string;
  client_name: string;
  start_time: string;
  end_time: string;
  status: string;
  checked_in_at: string | null;
}

interface RoomStatusRow {
  status: string;
  is_occupied: boolean;
}

function getStatusBadge(status: string) {
  const s = status.toLowerCase();
  if (["confirmed", "confirmado"].includes(s)) {
    return <Badge className="bg-success/20 text-success border-success/30">Confirmada</Badge>;
  }
  if (["pending", "pendente"].includes(s)) {
    return <Badge className="bg-warning/20 text-warning border-warning/30">Pendente</Badge>;
  }
  if (["cancelled", "canceled", "cancelado"].includes(s)) {
    return <Badge className="bg-destructive/20 text-destructive border-destructive/30">Cancelada</Badge>;
  }
  return <Badge variant="secondary">{status}</Badge>;
}

const formatTime = (t: string) => t?.slice(0, 5) ?? "";

export function StaffToday() {
  const [roomStatus, setRoomStatus] = useState<RoomStatusRow | null>(null);
  const [reservations, setReservations] = useState<TodayReservation[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [checkingInId, setCheckingInId] = useState<string | null>(null);

  const todayStr = new Date().toISOString().split("T")[0];

  const fetchData = async () => {
    setIsLoading(true);

    const [{ data: statusData }, { data: resData }] = await Promise.all([
      supabase
        .from("room_status")
        .select("status, is_occupied")
        .eq("room_id", ROOM_ID)
        .maybeSingle(),
      supabase
        .from("reservations")
        .select("id, client_name, start_time, end_time, status, checked_in_at")
        .eq("date", todayStr)
        .order("start_time", { ascending: true }),
    ]);

    setRoomStatus(statusData ?? null);
    setReservations((resData as TodayReservation[]) ?? []);
    setIsLoading(false);
  };

  useEffect(() => {
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Compute minutes until next confirmed reservation today
  const nextReservationMinutes = (() => {
    const now = new Date();
    const nowMin = now.getHours() * 60 + now.getMinutes();
    const upcoming = reservations
      .filter((r) => ["confirmed", "confirmado", "pending", "pendente"].includes(r.status.toLowerCase()))
      .map((r) => {
        const [h, m] = r.start_time.split(":").map(Number);
        return h * 60 + m;
      })
      .filter((min) => min > nowMin)
      .sort((a, b) => a - b);
    return upcoming.length > 0 ? upcoming[0] - nowMin : null;
  })();

  const isOccupied = roomStatus?.is_occupied ?? false;

  const handleCheckIn = async (id: string) => {
    setCheckingInId(id);
    const { error } = await supabase
      .from("reservations")
      .update({ checked_in_at: new Date().toISOString() })
      .eq("id", id);

    if (error) {
      toast({
        title: "Erro ao registrar chegada",
        description: error.message,
        variant: "destructive",
      });
    } else {
      toast({
        title: "Chegada registrada",
        description: "O check-in do cliente foi registrado com sucesso.",
      });
      setReservations((prev) =>
        prev.map((r) =>
          r.id === id ? { ...r, checked_in_at: new Date().toISOString() } : r
        )
      );
    }
    setCheckingInId(null);
  };

  // Room status card visuals
  let statusLabel: string;
  let statusColor: string;
  let StatusIcon = DoorOpen;

  if (isOccupied) {
    statusLabel = "Sala Ocupada";
    statusColor = "text-destructive";
    StatusIcon = DoorClosed;
  } else if (nextReservationMinutes !== null && nextReservationMinutes <= 60) {
    statusLabel = `Próxima reserva em ${nextReservationMinutes} min`;
    statusColor = "text-warning";
    StatusIcon = Clock;
  } else {
    statusLabel = "Sala Livre";
    statusColor = "text-success";
    StatusIcon = DoorOpen;
  }

  return (
    <div className="space-y-5">
      {/* Room status card */}
      <GlassCard className="space-y-3">
        <h3 className="text-lg font-semibold flex items-center gap-2">
          <Calendar className="w-5 h-5 text-primary" />
          Status da Sala
        </h3>
        {isLoading ? (
          <div className="flex items-center gap-2 text-muted-foreground text-sm">
            <Loader2 className="w-4 h-4 animate-spin" />
            Carregando status...
          </div>
        ) : (
          <div className="flex items-center gap-3">
            <StatusIcon className={`w-8 h-8 ${statusColor}`} />
            <span className={`text-xl font-bold ${statusColor}`}>{statusLabel}</span>
          </div>
        )}
      </GlassCard>

      {/* Today's reservations */}
      <GlassCard className="space-y-4">
        <h3 className="text-lg font-semibold flex items-center gap-2">
          <Clock className="w-5 h-5 text-primary" />
          Reservas de Hoje
        </h3>

        {isLoading ? (
          <div className="flex items-center gap-2 text-muted-foreground text-sm">
            <Loader2 className="w-4 h-4 animate-spin" />
            Carregando reservas...
          </div>
        ) : reservations.length === 0 ? (
          <p className="text-sm text-muted-foreground py-6 text-center">
            Nenhuma reserva para hoje
          </p>
        ) : (
          <div className="space-y-3">
            {reservations.map((res) => {
              const canCheckIn =
                ["confirmed", "confirmado"].includes(res.status.toLowerCase()) &&
                !res.checked_in_at;

              return (
                <div
                  key={res.id}
                  className="p-3 rounded-lg bg-secondary/30 space-y-2"
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-mono text-sm font-medium">
                      {formatTime(res.start_time)} – {formatTime(res.end_time)}
                    </span>
                    {getStatusBadge(res.status)}
                  </div>
                  <p className="text-sm text-muted-foreground">{res.client_name}</p>

                  {res.checked_in_at ? (
                    <div className="flex items-center gap-1.5 text-xs text-success">
                      <CheckCircle2 className="w-4 h-4" />
                      Chegada registrada
                    </div>
                  ) : canCheckIn ? (
                    <Button
                      size="sm"
                      variant="outline"
                      className="w-full"
                      onClick={() => handleCheckIn(res.id)}
                      disabled={checkingInId === res.id}
                    >
                      {checkingInId === res.id ? (
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      ) : (
                        <UserCheck className="w-4 h-4 mr-2" />
                      )}
                      Registrar chegada
                    </Button>
                  ) : null}
                </div>
              );
            })}
          </div>
        )}
      </GlassCard>
    </div>
  );
}
