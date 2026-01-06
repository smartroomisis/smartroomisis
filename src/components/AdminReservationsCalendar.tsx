import { useState, useEffect } from "react";
import { Calendar } from "@/components/ui/calendar";
import { GlassCard } from "@/components/GlassCard";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { supabase } from "@/integrations/supabase/client";
import { format, parseISO, isSameDay } from "date-fns";
import { ptBR } from "date-fns/locale";
import { CalendarDays, Clock, User, CreditCard, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface Reservation {
  id: string;
  client_name: string;
  client_email: string | null;
  date: string;
  start_time: string;
  end_time: string;
  hours: number;
  status: string;
  payment_mode: string;
  total_price: number;
  room_id: string;
  notes: string | null;
}

const HOURS = Array.from({ length: 14 }, (_, i) => i + 7); // 7h to 20h

export function AdminReservationsCalendar() {
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedReservation, setSelectedReservation] = useState<Reservation | null>(null);

  useEffect(() => {
    fetchReservations();
  }, []);

  const fetchReservations = async () => {
    try {
      const { data, error } = await supabase
        .from("reservations")
        .select("*")
        .order("date", { ascending: true })
        .order("start_time", { ascending: true });

      if (error) throw error;
      setReservations(data || []);
    } catch (error) {
      console.error("Error fetching reservations:", error);
    } finally {
      setLoading(false);
    }
  };

  const reservationsForDate = reservations.filter((r) =>
    isSameDay(parseISO(r.date), selectedDate)
  );

  const datesWithReservations = reservations.map((r) => parseISO(r.date));

  const getStatusColor = (status: string) => {
    switch (status) {
      case "confirmed":
        return "bg-primary/20 text-primary border-primary/30";
      case "in_progress":
        return "bg-warning/20 text-warning border-warning/30";
      case "completed":
        return "bg-success/20 text-success border-success/30";
      case "cancelled":
        return "bg-destructive/20 text-destructive border-destructive/30";
      default:
        return "bg-muted text-muted-foreground";
    }
  };

  const getPaymentLabel = (mode: string) => {
    switch (mode) {
      case "credit":
        return "Créditos";
      case "stripe":
        return "Cartão";
      case "invoice":
        return "Fatura";
      default:
        return mode;
    }
  };

  const isHourOccupied = (hour: number) => {
    return reservationsForDate.some((r) => {
      const startHour = parseInt(r.start_time.split(":")[0]);
      const endHour = parseInt(r.end_time.split(":")[0]);
      return hour >= startHour && hour < endHour;
    });
  };

  const getReservationForHour = (hour: number): Reservation | undefined => {
    return reservationsForDate.find((r) => {
      const startHour = parseInt(r.start_time.split(":")[0]);
      return hour === startHour;
    });
  };

  const getReservationSpan = (reservation: Reservation): number => {
    const startHour = parseInt(reservation.start_time.split(":")[0]);
    const endHour = parseInt(reservation.end_time.split(":")[0]);
    return endHour - startHour;
  };

  if (loading) {
    return (
      <GlassCard className="p-6 flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </GlassCard>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <CalendarDays className="w-5 h-5 text-primary" />
        <h3 className="text-lg font-semibold">Calendário de Reservas</h3>
      </div>

      <div className="grid gap-6 lg:grid-cols-[300px_1fr]">
        {/* Calendar Picker */}
        <GlassCard className="p-4">
          <Calendar
            mode="single"
            selected={selectedDate}
            onSelect={(date) => date && setSelectedDate(date)}
            locale={ptBR}
            modifiers={{
              hasReservation: datesWithReservations,
            }}
            modifiersClassNames={{
              hasReservation: "bg-primary/20 font-bold",
            }}
            className="rounded-md"
          />

          <div className="mt-4 pt-4 border-t border-border">
            <p className="text-sm text-muted-foreground mb-2">Legenda:</p>
            <div className="space-y-2 text-xs">
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded bg-primary/20" />
                <span>Dias com reservas</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded bg-primary" />
                <span>Horário ocupado</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded bg-muted border border-border" />
                <span>Horário disponível</span>
              </div>
            </div>
          </div>
        </GlassCard>

        {/* Day View */}
        <GlassCard className="p-4">
          <h4 className="font-semibold mb-4">
            {format(selectedDate, "EEEE, dd 'de' MMMM 'de' yyyy", { locale: ptBR })}
          </h4>

          <div className="space-y-1">
            {HOURS.map((hour) => {
              const reservation = getReservationForHour(hour);
              const occupied = isHourOccupied(hour);
              const isStartOfReservation = !!reservation;

              if (occupied && !isStartOfReservation) {
                return null; // Skip hours that are part of a multi-hour reservation
              }

              const span = reservation ? getReservationSpan(reservation) : 1;

              return (
                <div
                  key={hour}
                  className={cn(
                    "flex items-stretch gap-2 min-h-[48px] transition-colors",
                    isStartOfReservation && "mb-1"
                  )}
                  style={{ height: isStartOfReservation ? `${span * 52}px` : undefined }}
                >
                  <div className="w-16 flex-shrink-0 text-sm text-muted-foreground py-2">
                    {hour.toString().padStart(2, "0")}:00
                  </div>

                  {reservation ? (
                    <button
                      onClick={() => setSelectedReservation(reservation)}
                      className={cn(
                        "flex-1 rounded-lg p-3 text-left transition-all hover:ring-2 hover:ring-primary/50",
                        getStatusColor(reservation.status)
                      )}
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-medium">{reservation.client_name}</span>
                        <Badge variant="outline" className="text-xs">
                          {reservation.hours}h
                        </Badge>
                      </div>
                      <div className="text-xs mt-1 opacity-80">
                        {reservation.start_time.slice(0, 5)} - {reservation.end_time.slice(0, 5)}
                      </div>
                    </button>
                  ) : (
                    <div className="flex-1 rounded-lg border border-dashed border-border/50 bg-muted/20 flex items-center justify-center text-xs text-muted-foreground">
                      Disponível
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {reservationsForDate.length === 0 && (
            <p className="text-center text-muted-foreground py-8">
              Nenhuma reserva para este dia
            </p>
          )}
        </GlassCard>
      </div>

      {/* Reservation Details Dialog */}
      <Dialog open={!!selectedReservation} onOpenChange={() => setSelectedReservation(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <User className="w-5 h-5 text-primary" />
              Detalhes da Reserva
            </DialogTitle>
          </DialogHeader>

          {selectedReservation && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Cliente</p>
                  <p className="font-medium">{selectedReservation.client_name}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">E-mail</p>
                  <p className="font-medium">{selectedReservation.client_email || "N/A"}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Data</p>
                  <p className="font-medium">
                    {format(parseISO(selectedReservation.date), "dd/MM/yyyy")}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Horário</p>
                  <p className="font-medium flex items-center gap-1">
                    <Clock className="w-4 h-4" />
                    {selectedReservation.start_time.slice(0, 5)} - {selectedReservation.end_time.slice(0, 5)}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Duração</p>
                  <p className="font-medium">{selectedReservation.hours} hora(s)</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Status</p>
                  <Badge className={cn("mt-1", getStatusColor(selectedReservation.status))}>
                    {selectedReservation.status}
                  </Badge>
                </div>
              </div>

              <div className="border-t border-border pt-4">
                <div className="flex items-center gap-2 mb-2">
                  <CreditCard className="w-4 h-4 text-primary" />
                  <span className="font-medium">Pagamento</span>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-muted-foreground">Método</p>
                    <p className="font-medium">{getPaymentLabel(selectedReservation.payment_mode)}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Valor Total</p>
                    <p className="font-medium text-lg text-primary">
                      R$ {selectedReservation.total_price.toFixed(2)}
                    </p>
                  </div>
                </div>
              </div>

              {selectedReservation.notes && (
                <div className="border-t border-border pt-4">
                  <p className="text-sm text-muted-foreground">Observações</p>
                  <p className="mt-1">{selectedReservation.notes}</p>
                </div>
              )}

              <div className="flex justify-end pt-4">
                <Button variant="outline" onClick={() => setSelectedReservation(null)}>
                  Fechar
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}