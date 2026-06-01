import { useState, useEffect } from "react";
import { Calendar } from "@/components/ui/calendar";
import { GlassCard } from "@/components/GlassCard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { CalendarDays, Loader2, CheckCircle, Ticket, X } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { getSystemConfig } from "@/components/SystemSettings";
import { validateCoupon, useCoupon } from "@/components/CouponManager";
import { SmartCheckout } from "@/components/SmartCheckout";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";

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

interface PriceBreakdown {
  baseTotal: number;
  progressiveDiscount: number;
  couponDiscount: number;
  finalTotal: number;
}

function calculatePrice(
  hoursSelected: number,
  hourlyRate: number,
  progressiveDiscountPercent: number,
  couponDiscountPercent: number
): PriceBreakdown {
  if (hoursSelected === 0) {
    return { baseTotal: 0, progressiveDiscount: 0, couponDiscount: 0, finalTotal: 0 };
  }

  // First hour at full price
  const firstHour = hourlyRate;
  
  // Remaining hours with progressive discount
  const remainingHours = hoursSelected - 1;
  const discountedHourPrice = hourlyRate * (1 - progressiveDiscountPercent / 100);
  const remainingTotal = remainingHours * discountedHourPrice;
  
  const baseTotal = hoursSelected * hourlyRate;
  const progressiveDiscount = remainingHours * hourlyRate * (progressiveDiscountPercent / 100);
  
  const subtotal = firstHour + remainingTotal;
  const couponDiscount = subtotal * (couponDiscountPercent / 100);
  
  const finalTotal = subtotal - couponDiscount;

  return {
    baseTotal,
    progressiveDiscount,
    couponDiscount,
    finalTotal: Math.max(0, finalTotal),
  };
}

export function BookingCalendar() {
  const [date, setDate] = useState<Date | undefined>(new Date());
  const [selectedSlots, setSelectedSlots] = useState<string[]>([]);
  const [showCheckout, setShowCheckout] = useState(false);
  const [couponCode, setCouponCode] = useState("");
  const [appliedCoupon, setAppliedCoupon] = useState<{ code: string; discount: number } | null>(null);
  const [blockedTimes, setBlockedTimes] = useState<string[]>([]);

  const { profile } = useAuth();
  const config = getSystemConfig();

  useEffect(() => {
    if (!date) {
      setBlockedTimes([]);
      return;
    }
    const dateStr = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
    supabase
      .from("blocked_slots")
      .select("start_time, end_time")
      .eq("date", dateStr)
      .then(({ data }) => {
        if (!data) {
          setBlockedTimes([]);
          return;
        }
        const blocked: string[] = [];
        data.forEach((b) => {
          const startHour = parseInt(b.start_time.slice(0, 2), 10);
          const endHour = parseInt(b.end_time.slice(0, 2), 10);
          for (let h = startHour; h < endHour; h++) {
            blocked.push(`${String(h).padStart(2, "0")}:00`);
          }
        });
        setBlockedTimes(blocked);
        setSelectedSlots((prev) => prev.filter((t) => !blocked.includes(t)));
      });
  }, [date]);

  const toggleSlot = (time: string) => {
    setSelectedSlots((prev) =>
      prev.includes(time) ? prev.filter((t) => t !== time) : [...prev, time]
    );
  };

  const handleApplyCoupon = () => {
    if (!couponCode.trim()) return;

    const result = validateCoupon(couponCode);
    if (result.valid) {
      setAppliedCoupon({ code: couponCode.toUpperCase(), discount: result.discount });
      toast({
        title: "Cupom Aplicado!",
        description: result.message,
      });
    } else {
      toast({
        title: "Cupom Inválido",
        description: result.message,
        variant: "destructive",
      });
    }
    setCouponCode("");
  };

  const handleRemoveCoupon = () => {
    setAppliedCoupon(null);
    toast({
      title: "Cupom Removido",
    });
  };

  const priceBreakdown = calculatePrice(
    selectedSlots.length,
    config.hourlyRate,
    config.progressiveDiscount,
    appliedCoupon?.discount || 0
  );

  const handleReserve = () => {
    if (selectedSlots.length < config.minimumHours) {
      toast({
        title: "Mínimo não atingido",
        description: `A reserva mínima é de ${config.minimumHours} hora(s)`,
        variant: "destructive",
      });
      return;
    }
    setShowCheckout(true);
  };

  const handleCheckoutSuccess = (paymentMode: "credit" | "stripe" | "invoice") => {
    // Mark coupon as used
    if (appliedCoupon) {
      useCoupon(appliedCoupon.code);
    }
    
    toast({
      title: "Reserva Confirmada!",
      description: `Sua reserva foi confirmada para ${selectedSlots.length} hora(s). Modo: ${paymentMode}`,
    });
    
    setShowCheckout(false);
    setSelectedSlots([]);
    setAppliedCoupon(null);
  };

  // Get sorted selected slots for time range
  const sortedSlots = [...selectedSlots].sort();
  const startTime = sortedSlots[0] || "08:00";
  const endTime = sortedSlots.length > 0 
    ? `${(parseInt(sortedSlots[sortedSlots.length - 1].split(":")[0]) + 1).toString().padStart(2, "0")}:00`
    : "09:00";

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
          {config.minimumHours > 1 && (
            <p className="text-xs text-muted-foreground mt-3">
              * Reserva mínima: {config.minimumHours} hora(s)
            </p>
          )}
        </GlassCard>

        {/* Coupon Section */}
        <GlassCard>
          <h3 className="text-sm font-medium mb-3 flex items-center gap-2">
            <Ticket className="w-4 h-4 text-primary" />
            Cupom de Desconto
          </h3>
          {appliedCoupon ? (
            <div className="flex items-center justify-between p-3 rounded-lg bg-success/10 border border-success/30">
              <div className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-success" />
                <span className="font-mono font-bold text-success">{appliedCoupon.code}</span>
                <span className="text-sm text-success">-{appliedCoupon.discount}%</span>
              </div>
              <Button variant="ghost" size="sm" onClick={handleRemoveCoupon}>
                <X className="w-4 h-4" />
              </Button>
            </div>
          ) : (
            <div className="flex gap-2">
              <Input
                placeholder="Digite o cupom"
                value={couponCode}
                onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                onKeyDown={(e) => e.key === "Enter" && handleApplyCoupon()}
                className="font-mono uppercase"
              />
              <Button variant="outline" onClick={handleApplyCoupon}>
                Aplicar
              </Button>
            </div>
          )}
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
              <span className="font-medium">R$ {config.hourlyRate.toFixed(2)}</span>
            </div>
            
            {selectedSlots.length > 1 && config.progressiveDiscount > 0 && (
              <div className="flex justify-between text-sm text-success">
                <span>Desconto progressivo ({config.progressiveDiscount}%)</span>
                <span>- R$ {priceBreakdown.progressiveDiscount.toFixed(2)}</span>
              </div>
            )}
            
            {appliedCoupon && priceBreakdown.couponDiscount > 0 && (
              <div className="flex justify-between text-sm text-success">
                <span>Cupom {appliedCoupon.code} ({appliedCoupon.discount}%)</span>
                <span>- R$ {priceBreakdown.couponDiscount.toFixed(2)}</span>
              </div>
            )}
            
            <div className="h-px bg-border my-2" />
            <div className="flex justify-between">
              <span className="font-semibold">Total</span>
              <span className="text-2xl font-bold text-primary neon-text">
                R$ {priceBreakdown.finalTotal.toFixed(2)}
              </span>
            </div>

            {/* Credit balance info */}
            {profile && (
              <div className="mt-2 p-2 rounded-lg bg-secondary/30 text-xs">
                <span className="text-muted-foreground">Saldo disponível: </span>
                <span className="font-bold text-primary">{profile.credit_hours}h</span>
              </div>
            )}
          </div>

          <Button
            className="w-full mt-4 h-12"
            disabled={selectedSlots.length < config.minimumHours}
            onClick={handleReserve}
          >
            <CalendarDays className="w-5 h-5 mr-2" />
            Reservar {selectedSlots.length} hora(s)
          </Button>
        </GlassCard>
      </div>

      {/* Smart Checkout Dialog */}
      <SmartCheckout
        open={showCheckout}
        onOpenChange={setShowCheckout}
        hoursRequested={selectedSlots.length}
        pricePerHour={config.hourlyRate}
        onSuccess={handleCheckoutSuccess}
        reservationDetails={{
          date: date?.toLocaleDateString("pt-BR") || "",
          startTime,
          endTime,
        }}
      />
    </div>
  );
}
