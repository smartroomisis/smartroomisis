import { useState } from "react";
import { Calendar } from "@/components/ui/calendar";
import { GlassCard } from "@/components/GlassCard";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { CalendarDays, Loader2, CheckCircle, CreditCard } from "lucide-react";
import { toast } from "@/hooks/use-toast";

const timeSlots = [
  { time: "08:00", available: true },
  { time: "09:00", available: true },
  { time: "10:00", available: false },
  { time: "11:00", available: false },
  { time: "12:00", available: true },
  { time: "13:00", available: true },
  { time: "14:00", available: true },
  { time: "15:00", available: false },
  { time: "16:00", available: true },
  { time: "17:00", available: true },
  { time: "18:00", available: true },
];

const HOURLY_RATE = 85;

export function BookingCalendar() {
  const [date, setDate] = useState<Date | undefined>(new Date());
  const [selectedSlots, setSelectedSlots] = useState<string[]>([]);
  const [paymentState, setPaymentState] = useState<"idle" | "loading" | "success">("idle");

  const toggleSlot = (time: string) => {
    setSelectedSlots((prev) =>
      prev.includes(time) ? prev.filter((t) => t !== time) : [...prev, time]
    );
  };

  const totalPrice = selectedSlots.length * HOURLY_RATE;

  const handlePayment = async () => {
    setPaymentState("loading");
    await new Promise((resolve) => setTimeout(resolve, 2500));
    setPaymentState("success");
    toast({
      title: "Reserva Confirmada!",
      description: `Sua reserva foi confirmada para ${selectedSlots.length} hora(s).`,
    });
    setTimeout(() => {
      setPaymentState("idle");
      setSelectedSlots([]);
    }, 3000);
  };

  return (
    <div className="grid gap-6 md:grid-cols-2">
      {/* Calendar */}
      <GlassCard className="p-4">
        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <CalendarDays className="w-5 h-5 text-primary" />
          Selecione a Data
        </h3>
        <Calendar
          mode="single"
          selected={date}
          onSelect={setDate}
          className="rounded-lg border-0 pointer-events-auto"
          disabled={(date) => date < new Date()}
        />
      </GlassCard>

      {/* Time Slots */}
      <div className="space-y-6">
        <GlassCard>
          <h3 className="text-lg font-semibold mb-4">Horários Disponíveis</h3>
          <div className="grid grid-cols-3 gap-2">
            {timeSlots.map((slot) => (
              <button
                key={slot.time}
                onClick={() => slot.available && toggleSlot(slot.time)}
                disabled={!slot.available}
                className={cn(
                  "p-3 rounded-lg text-sm font-medium transition-all duration-200",
                  !slot.available && "bg-muted text-muted-foreground opacity-50 cursor-not-allowed",
                  slot.available &&
                    !selectedSlots.includes(slot.time) &&
                    "bg-secondary hover:bg-secondary/80 text-secondary-foreground",
                  selectedSlots.includes(slot.time) &&
                    "bg-primary/20 text-primary border border-primary/50 neon-border"
                )}
              >
                {slot.time}
              </button>
            ))}
          </div>
        </GlassCard>

        {/* Summary */}
        <GlassCard neon={selectedSlots.length > 0}>
          <h3 className="text-lg font-semibold mb-4">Resumo</h3>
          <div className="space-y-3">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Horários selecionados</span>
              <span className="font-medium">{selectedSlots.length} hora(s)</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Valor por hora</span>
              <span className="font-medium">R$ {HOURLY_RATE},00</span>
            </div>
            <div className="h-px bg-border my-2" />
            <div className="flex justify-between">
              <span className="font-semibold">Total</span>
              <span className="text-2xl font-bold text-primary neon-text">
                R$ {totalPrice},00
              </span>
            </div>
          </div>

          <Button
            variant={paymentState === "success" ? "success" : "default"}
            className="w-full mt-4 h-12"
            disabled={selectedSlots.length === 0 || paymentState === "loading"}
            onClick={handlePayment}
          >
            {paymentState === "idle" && (
              <>
                <CreditCard className="w-5 h-5" />
                <span>Finalizar Pagamento</span>
              </>
            )}
            {paymentState === "loading" && (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                <span>Processando...</span>
              </>
            )}
            {paymentState === "success" && (
              <>
                <CheckCircle className="w-5 h-5" />
                <span>Pagamento Confirmado!</span>
              </>
            )}
          </Button>
        </GlassCard>
      </div>
    </div>
  );
}
