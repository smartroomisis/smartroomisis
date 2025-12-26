import { useState } from "react";
import { Button } from "@/components/ui/button";
import { GlassCard } from "@/components/GlassCard";
import { Fingerprint, Loader2, CheckCircle2, Key } from "lucide-react";
import { cn } from "@/lib/utils";
import { unlockDoor, ERROR_MESSAGES } from "@/lib/api";
import { toast } from "@/hooks/use-toast";

interface DoorControlProps {
  accessCode: string;
  userId?: string;
  disabled?: boolean;
}

export function DoorControl({ accessCode, userId = "current_user_id", disabled = false }: DoorControlProps) {
  const [state, setState] = useState<"idle" | "loading" | "success">("idle");

  const handleOpenDoor = async () => {
    if (disabled) return;
    
    setState("loading");
    
    try {
      await unlockDoor(userId);
      setState("success");
      toast({
        title: "Acesso liberado!",
        description: "A porta foi desbloqueada com sucesso.",
      });
      setTimeout(() => setState("idle"), 3000);
    } catch (error) {
      setState("idle"); // Return to normal state on error
      const message = error instanceof Error ? error.message : ERROR_MESSAGES.ACCESS_DENIED;
      toast({
        title: "Acesso Negado",
        description: message,
        variant: "destructive",
      });
    }
  };

  return (
    <GlassCard className={cn("space-y-5", disabled && "opacity-50")}>
      <h3 className="text-lg font-semibold flex items-center gap-2">
        <Key className="w-5 h-5 text-primary" />
        Controle de Acesso
      </h3>

      {/* Access Code */}
      <div className="glass-card bg-secondary/50 p-4 rounded-lg">
        <p className="text-xs text-muted-foreground mb-1">Código de Acesso</p>
        <p className="text-2xl font-mono font-bold tracking-widest text-primary neon-text">
          {disabled ? "------" : accessCode}
        </p>
      </div>

      {/* Biometric Button */}
      <Button
        variant="biometric"
        size="xl"
        className={cn(
          "w-full h-20 rounded-2xl text-lg font-semibold relative overflow-hidden",
          state === "success" && "!border-success !text-success",
          disabled && "cursor-not-allowed"
        )}
        onClick={handleOpenDoor}
        disabled={state === "loading" || disabled}
      >
        {state === "idle" && (
          <>
            <Fingerprint className="w-7 h-7" />
            <span>{disabled ? "Sala Livre" : "Abrir Porta"}</span>
          </>
        )}
        {state === "loading" && (
          <>
            <Loader2 className="w-7 h-7 animate-spin" />
            <span>Processando...</span>
          </>
        )}
        {state === "success" && (
          <>
            <CheckCircle2 className="w-7 h-7" />
            <span>Porta Aberta!</span>
          </>
        )}

        {/* Shimmer effect during loading */}
        {state === "loading" && (
          <div className="absolute inset-0 animate-shimmer" />
        )}
      </Button>
    </GlassCard>
  );
}
