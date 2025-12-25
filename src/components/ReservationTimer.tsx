import { useState, useEffect } from "react";
import { GlassCard } from "@/components/GlassCard";
import { Clock } from "lucide-react";
import { cn } from "@/lib/utils";

interface ReservationTimerProps {
  endTime: Date;
}

export function ReservationTimer({ endTime }: ReservationTimerProps) {
  const [timeLeft, setTimeLeft] = useState({ hours: 0, minutes: 0, seconds: 0 });
  const [isLow, setIsLow] = useState(false);

  useEffect(() => {
    const calculateTimeLeft = () => {
      const now = new Date();
      const diff = endTime.getTime() - now.getTime();

      if (diff <= 0) {
        return { hours: 0, minutes: 0, seconds: 0 };
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
  }, [endTime]);

  const formatNumber = (num: number) => num.toString().padStart(2, "0");

  return (
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
