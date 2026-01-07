import { useState, useEffect } from "react";
import { GlassCard } from "@/components/GlassCard";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { supabase } from "@/integrations/supabase/client";
import { cn } from "@/lib/utils";
import { 
  ChevronLeft, 
  ChevronRight, 
  Calendar, 
  Clock, 
  User, 
  Mail,
  Loader2,
  CalendarDays
} from "lucide-react";
import { format, startOfWeek, addDays, addWeeks, subWeeks, isSameDay, parseISO, startOfMonth, endOfMonth, eachDayOfInterval, addMonths, subMonths, isSameMonth } from "date-fns";
import { ptBR } from "date-fns/locale";

interface Reservation {
  id: string;
  client_name: string;
  client_email: string | null;
  date: string;
  start_time: string;
  end_time: string;
  hours: number;
  status: string;
  total_price: number;
  notes: string | null;
  payment_mode: string;
}

type ViewMode = "week" | "month";

export function AdminReservationCalendar() {
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [viewMode, setViewMode] = useState<ViewMode>("week");
  const [selectedReservation, setSelectedReservation] = useState<Reservation | null>(null);

  useEffect(() => {
    fetchReservations();
  }, [currentDate, viewMode]);

  const fetchReservations = async () => {
    try {
      setLoading(true);
      
      let startDate: Date;
      let endDate: Date;

      if (viewMode === "week") {
        startDate = startOfWeek(currentDate, { weekStartsOn: 1 });
        endDate = addDays(startDate, 6);
      } else {
        startDate = startOfMonth(currentDate);
        endDate = endOfMonth(currentDate);
      }

      const { data, error } = await supabase
        .from("reservations")
        .select("*")
        .gte("date", format(startDate, "yyyy-MM-dd"))
        .lte("date", format(endDate, "yyyy-MM-dd"))
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

  const navigatePrevious = () => {
    if (viewMode === "week") {
      setCurrentDate(prev => subWeeks(prev, 1));
    } else {
      setCurrentDate(prev => subMonths(prev, 1));
    }
  };

  const navigateNext = () => {
    if (viewMode === "week") {
      setCurrentDate(prev => addWeeks(prev, 1));
    } else {
      setCurrentDate(prev => addMonths(prev, 1));
    }
  };

  const goToToday = () => {
    setCurrentDate(new Date());
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case "confirmed":
      case "confirmada":
        return "bg-success/20 text-success border-success/30";
      case "em uso":
      case "in_use":
        return "bg-primary/20 text-primary border-primary/30";
      case "cancelled":
      case "cancelada":
        return "bg-destructive/20 text-destructive border-destructive/30";
      case "aguardando limpeza":
        return "bg-warning/20 text-warning border-warning/30";
      default:
        return "bg-muted text-muted-foreground border-border";
    }
  };

  const formatTime = (time: string) => {
    return time.substring(0, 5);
  };

  const getReservationsForDate = (date: Date) => {
    const dateStr = format(date, "yyyy-MM-dd");
    return reservations.filter(r => r.date === dateStr);
  };

  const hours = Array.from({ length: 12 }, (_, i) => i + 8); // 08:00 to 19:00

  const weekDays = viewMode === "week" 
    ? Array.from({ length: 7 }, (_, i) => addDays(startOfWeek(currentDate, { weekStartsOn: 1 }), i))
    : eachDayOfInterval({ start: startOfMonth(currentDate), end: endOfMonth(currentDate) });

  const renderWeekView = () => (
    <div className="overflow-x-auto">
      <div className="min-w-[800px]">
        {/* Header with days */}
        <div className="grid grid-cols-8 gap-1 mb-2">
          <div className="p-2 text-center text-xs font-medium text-muted-foreground">
            Hora
          </div>
          {weekDays.slice(0, 7).map((day) => (
            <div
              key={day.toISOString()}
              className={cn(
                "p-2 text-center rounded-lg",
                isSameDay(day, new Date()) && "bg-primary/10"
              )}
            >
              <div className="text-xs font-medium text-muted-foreground">
                {format(day, "EEE", { locale: ptBR })}
              </div>
              <div className={cn(
                "text-lg font-bold",
                isSameDay(day, new Date()) && "text-primary"
              )}>
                {format(day, "dd")}
              </div>
            </div>
          ))}
        </div>

        {/* Time grid */}
        <div className="grid grid-cols-8 gap-1">
          {hours.map((hour) => (
            <>
              <div key={`hour-${hour}`} className="p-2 text-xs text-muted-foreground text-right pr-4">
                {`${hour.toString().padStart(2, "0")}:00`}
              </div>
              {weekDays.slice(0, 7).map((day) => {
                const dayReservations = getReservationsForDate(day);
                const hourReservations = dayReservations.filter(r => {
                  const startHour = parseInt(r.start_time.split(":")[0]);
                  const endHour = parseInt(r.end_time.split(":")[0]);
                  return hour >= startHour && hour < endHour;
                });

                return (
                  <div
                    key={`${day.toISOString()}-${hour}`}
                    className={cn(
                      "min-h-[40px] border border-border/30 rounded relative",
                      isSameDay(day, new Date()) && "bg-primary/5"
                    )}
                  >
                    {hourReservations.map((res) => {
                      const startHour = parseInt(res.start_time.split(":")[0]);
                      if (hour === startHour) {
                        return (
                          <button
                            key={res.id}
                            onClick={() => setSelectedReservation(res)}
                            className={cn(
                              "absolute inset-x-0.5 rounded px-1 py-0.5 text-xs font-medium truncate cursor-pointer hover:opacity-80 transition-opacity border",
                              getStatusColor(res.status)
                            )}
                            style={{
                              height: `${res.hours * 40 - 4}px`,
                              zIndex: 10,
                            }}
                          >
                            {res.client_name}
                          </button>
                        );
                      }
                      return null;
                    })}
                  </div>
                );
              })}
            </>
          ))}
        </div>
      </div>
    </div>
  );

  const renderMonthView = () => (
    <div className="grid grid-cols-7 gap-1">
      {/* Week day headers */}
      {["Seg", "Ter", "Qua", "Qui", "Sex", "Sáb", "Dom"].map((day) => (
        <div key={day} className="p-2 text-center text-xs font-medium text-muted-foreground">
          {day}
        </div>
      ))}
      
      {/* Empty cells for days before month start */}
      {Array.from({ length: (startOfMonth(currentDate).getDay() + 6) % 7 }).map((_, i) => (
        <div key={`empty-${i}`} className="min-h-[80px] p-1" />
      ))}

      {/* Days of month */}
      {weekDays.map((day) => {
        if (!isSameMonth(day, currentDate)) return null;
        
        const dayReservations = getReservationsForDate(day);
        
        return (
          <div
            key={day.toISOString()}
            className={cn(
              "min-h-[80px] p-1 border border-border/30 rounded-lg",
              isSameDay(day, new Date()) && "bg-primary/10 border-primary/30"
            )}
          >
            <div className={cn(
              "text-sm font-medium mb-1",
              isSameDay(day, new Date()) && "text-primary"
            )}>
              {format(day, "d")}
            </div>
            <div className="space-y-0.5">
              {dayReservations.slice(0, 3).map((res) => (
                <button
                  key={res.id}
                  onClick={() => setSelectedReservation(res)}
                  className={cn(
                    "w-full text-left px-1 py-0.5 rounded text-xs truncate border",
                    getStatusColor(res.status)
                  )}
                >
                  {formatTime(res.start_time)} {res.client_name}
                </button>
              ))}
              {dayReservations.length > 3 && (
                <div className="text-xs text-muted-foreground pl-1">
                  +{dayReservations.length - 3} mais
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );

  return (
    <div className="space-y-4">
      {/* Controls */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <Button variant="outline" size="icon" onClick={navigatePrevious}>
            <ChevronLeft className="w-4 h-4" />
          </Button>
          <Button variant="outline" size="icon" onClick={navigateNext}>
            <ChevronRight className="w-4 h-4" />
          </Button>
          <Button variant="outline" size="sm" onClick={goToToday}>
            Hoje
          </Button>
          <h3 className="text-lg font-semibold ml-2">
            {viewMode === "week" 
              ? `Semana de ${format(startOfWeek(currentDate, { weekStartsOn: 1 }), "dd MMM", { locale: ptBR })}`
              : format(currentDate, "MMMM yyyy", { locale: ptBR })
            }
          </h3>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant={viewMode === "week" ? "default" : "outline"}
            size="sm"
            onClick={() => setViewMode("week")}
          >
            <Calendar className="w-4 h-4 mr-1" />
            Semana
          </Button>
          <Button
            variant={viewMode === "month" ? "default" : "outline"}
            size="sm"
            onClick={() => setViewMode("month")}
          >
            <CalendarDays className="w-4 h-4 mr-1" />
            Mês
          </Button>
        </div>
      </div>

      {/* Calendar */}
      <GlassCard className="p-4">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        ) : viewMode === "week" ? renderWeekView() : renderMonthView()}
      </GlassCard>

      {/* Legend */}
      <div className="flex flex-wrap items-center gap-4 text-sm">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded bg-success/50" />
          <span className="text-muted-foreground">Confirmada</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded bg-primary/50" />
          <span className="text-muted-foreground">Em uso</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded bg-warning/50" />
          <span className="text-muted-foreground">Aguardando limpeza</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded bg-destructive/50" />
          <span className="text-muted-foreground">Cancelada</span>
        </div>
      </div>

      {/* Reservation Details Dialog */}
      <Dialog open={!!selectedReservation} onOpenChange={() => setSelectedReservation(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Calendar className="w-5 h-5 text-primary" />
              Detalhes da Reserva
            </DialogTitle>
          </DialogHeader>

          {selectedReservation && (
            <div className="space-y-4">
              <div className="p-4 rounded-lg bg-secondary/30 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <User className="w-4 h-4 text-muted-foreground" />
                    <span className="font-medium">{selectedReservation.client_name}</span>
                  </div>
                  <Badge className={cn("border", getStatusColor(selectedReservation.status))}>
                    {selectedReservation.status}
                  </Badge>
                </div>

                {selectedReservation.client_email && (
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Mail className="w-4 h-4" />
                    <span>{selectedReservation.client_email}</span>
                  </div>
                )}

                <div className="flex items-center gap-2 text-sm">
                  <Calendar className="w-4 h-4 text-muted-foreground" />
                  <span>
                    {format(parseISO(selectedReservation.date), "dd 'de' MMMM 'de' yyyy", { locale: ptBR })}
                  </span>
                </div>

                <div className="flex items-center gap-2 text-sm">
                  <Clock className="w-4 h-4 text-muted-foreground" />
                  <span>
                    {formatTime(selectedReservation.start_time)} - {formatTime(selectedReservation.end_time)}
                    {" "}({selectedReservation.hours}h)
                  </span>
                </div>

                <div className="pt-3 border-t border-border">
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Valor Total</span>
                    <span className="text-xl font-bold text-primary">
                      R$ {selectedReservation.total_price.toFixed(2)}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-sm text-muted-foreground mt-1">
                    <span>Modo de pagamento</span>
                    <Badge variant="outline">{selectedReservation.payment_mode}</Badge>
                  </div>
                </div>

                {selectedReservation.notes && (
                  <div className="pt-3 border-t border-border">
                    <span className="text-xs text-muted-foreground">Observações:</span>
                    <p className="text-sm mt-1">{selectedReservation.notes}</p>
                  </div>
                )}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
