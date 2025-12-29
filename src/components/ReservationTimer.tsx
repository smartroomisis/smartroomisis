import { useState, useEffect, useCallback } from "react";
import { GlassCard } from "@/components/GlassCard";
import { Clock, AlertTriangle } from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "@/hooks/use-toast";

interface ReservationTimerProps {
  endTime: Date;
  onExpired?: () => void;
  onWarning?: () => void;
}

export function ReservationTimer({ endTime, onExpired, onWarning }: ReservationTimerProps) {
  const [timeLeft, setTimeLeft] = useState({ hours: 0, minutes: 0, seconds: 0 });
  const [isLow, setIsLow] = useState(false);
  const [showWarningBanner, setShowWarningBanner] = useState(false);
  const [isExpired, setIsExpired] = useState(false);
  const [warningShown, setWarningShown] = useState(false);

  const handleExpiry = useCallback(() => {
    if (!isExpired) {
      setIsExpired(true);
      onExpired?.();
      toast({
        title: "Reserva Encerrada",
        description: "O tempo da sua reserva acabou. Por favor, aguarde instruções.",
        variant: "destructive",
      });
    }
  }, [isExpired, onExpired]);

  const handleWarning = useCallback(() => {
    if (!warningShown) {
      setWarningShown(true);
      setShowWarningBanner(true);
      onWarning?.();
      toast({
        title: "Aviso",
        description: "A sua reserva encerra em 10 minutos. Por favor, organize seus pertences.",
      });
    }
  }, [warningShown, onWarning]);

  useEffect(() => {
    const calculateTimeLeft = () => {
      const now = new Date();
      const diff = endTime.getTime() - now.getTime();

      if (diff <= 0) {
        handleExpiry();
        return { hours: 0, minutes: 0, seconds: 0 };
      }

      // Show warning at 10 minutes
      if (diff <= 10 * 60 * 1000 && diff > 0) {
        handleWarning();
      }

      const hours = Math.floor(diff / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((diff % (1000 * 60)) / 1000);

      setIsLow(diff < 15 * 60 * 1000); // Less than 15 minutes

      return { hours, minutes, seconds };
    };

    setTimeLeft(calculateTimeLeft());
    const interval = setInterval(() => {
      setTimeLeft(calculateTimeLeft());
    }, 1000);

    return () => clearInterval(interval);
  }, [endTime, handleExpiry, handleWarning]);

  const formatNumber = (num: number) => num.toString().padStart(2, "0");

  if (isExpired) {
    return (
      <GlassCard className="text-center bg-destructive/20 border-destructive/50">
        <div className="flex flex-col items-center gap-3 py-4">
          <AlertTriangle className="w-12 h-12 text-destructive animate-pulse" />
          <div>
            <h3 className="text-xl font-bold text-destructive">Reserva Encerrada</h3>
            <p className="text-muted-foreground text-sm mt-1">
              O tempo da sua reserva acabou. Por favor, organize seus pertences.
            </p>
          </div>
        </div>
      </GlassCard>
    );
  }

  return (
    <div className="space-y-3">
      {/* Warning Banner */}
      {showWarningBanner && (
        <div className="bg-warning/20 border border-warning/50 rounded-xl p-4 flex items-center gap-3 animate-pulse">
          <AlertTriangle className="w-6 h-6 text-warning flex-shrink-0" />
          <div>
            <p className="font-semibold text-warning">A sua reserva encerra em breve!</p>
            <p className="text-sm text-muted-foreground">
              Por favor, organize os seus pertences e as cadeiras.
            </p>
          </div>
        </div>
      )}

      <GlassCard
        className={cn(
          "text-center transition-all duration-300",
          isLow && "neon-border !border-warning/50"
        )}
        neon={!isLow}
      >
        <div className="flex items-center justify-center gap-2 mb-3">
          <Clock className={cn("w-5 h-5", isLow ? "text-warning" : "text-primary")} />
          <span className="text-sm text-muted-foreground">Tempo Restante</span>
        </div>

        <div className="flex items-center justify-center gap-2">
          <TimeUnit value={formatNumber(timeLeft.hours)} label="HRS" isLow={isLow} />
          <span className={cn("text-3xl font-light", isLow ? "text-warning" : "text-primary")}>:</span>
          <TimeUnit value={formatNumber(timeLeft.minutes)} label="MIN" isLow={isLow} />
          <span className={cn("text-3xl font-light", isLow ? "text-warning" : "text-primary")}>:</span>
          <TimeUnit value={formatNumber(timeLeft.seconds)} label="SEG" isLow={isLow} />
        </div>
      </GlassCard>
    </div>
  );
}

function TimeUnit({ value, label, isLow }: { value: string; label: string; isLow: boolean }) {
  return (
    <div className="flex flex-col items-center">
      <span
        className={cn(
          "text-4xl md:text-5xl font-bold font-mono transition-colors",
          isLow ? "text-warning" : "text-primary neon-text"
        )}
      >
        {value}
      </span>
      <span className="text-[10px] text-muted-foreground mt-1">{label}</span>
    </div>
  );
}
