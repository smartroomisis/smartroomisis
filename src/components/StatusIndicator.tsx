import { cn } from "@/lib/utils";
import { CheckCircle, Clock } from "lucide-react";

interface StatusIndicatorProps {
  status: "available" | "occupied";
  className?: string;
}

export function StatusIndicator({ status, className }: StatusIndicatorProps) {
  const isAvailable = status === "available";

  return (
    <div
      className={cn(
        "relative glass-card p-6 overflow-hidden transition-all duration-500",
        isAvailable ? "neon-border" : "border-warning/30",
        className
      )}
    >
      {/* Background glow effect */}
      <div
        className={cn(
          "absolute inset-0 opacity-20 blur-3xl transition-colors duration-500",
          isAvailable ? "bg-primary" : "bg-warning"
        )}
      />

      {/* Content */}
      <div className="relative z-10 flex items-center gap-4">
        <div
          className={cn(
            "flex items-center justify-center w-14 h-14 rounded-full transition-all duration-500",
            isAvailable
              ? "bg-primary/20 text-primary animate-glow"
              : "bg-warning/20 text-warning"
          )}
        >
          {isAvailable ? (
            <CheckCircle className="w-7 h-7" />
          ) : (
            <Clock className="w-7 h-7" />
          )}
        </div>

        <div className="flex-1">
          <p className="text-sm text-muted-foreground mb-1">Status da Sala</p>
          <h3
            className={cn(
              "text-xl font-semibold transition-colors duration-500",
              isAvailable ? "text-primary neon-text" : "text-warning"
            )}
          >
            {isAvailable ? "Pronta para Uso" : "Ocupada"}
          </h3>
        </div>

        {/* Pulse indicator */}
        <div className="relative">
          <div
            className={cn(
              "w-3 h-3 rounded-full",
              isAvailable ? "bg-primary" : "bg-warning"
            )}
          />
          <div
            className={cn(
              "absolute inset-0 w-3 h-3 rounded-full animate-ping",
              isAvailable ? "bg-primary" : "bg-warning"
            )}
          />
        </div>
      </div>
    </div>
  );
}
