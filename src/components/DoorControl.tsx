import { useState } from "react";
import { Button } from "@/components/ui/button";
import { GlassCard } from "@/components/GlassCard";
import { Fingerprint, Loader2, CheckCircle2, Key } from "lucide-react";
import { cn } from "@/lib/utils";
import { unlockDoor, validateReservation, ERROR_MESSAGES } from "@/lib/api";
import { toast } from "@/hooks/use-toast";

interface DoorControlProps {
  accessCode: string;
  userId?: string;
  userEmail?: string;
  disabled?: boolean;
}

export function DoorControl({ 
  accessCode, 
  userId = "current_user_id", 
  userEmail,
  disabled = false 
}: DoorControlProps) {
  const [state, setState] = useState<"idle" | "validating" | "unlocking" | "success">("idle");

  const handleOpenDoor = async () => {
    if (disabled) return;
    
    setState("validating");
    
    try {
      // Step 1: Validate reservation in Airtable
      const validation = await validateReservation(userId, userEmail);
      
      if (!validation.valid) {
        setState("idle");
        toast({
          title: "Acesso Negado",
          description: validation.error || ERROR_MESSAGES.OUT_OF_TIME,
          variant: "destructive",
        });
        return;
      }
      
      // Step 2: Unlock door via n8n with reservation ID
      setState("unlocking");
      await unlockDoor(userId, userEmail, validation.reservation_id);
      
      setState("success");
      toast({
        title: "Acesso liberado!",
        description: `Reserva: ${validation.reservation_name || 'Confirmada'}`,
      });
      setTimeout(() => setState("idle"), 3000);
    } catch (error) {
      setState("idle");
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
        disabled={state === "validating" || state === "unlocking" || disabled}
      >
        {state === "idle" && (
          <>
            <Fingerprint className="w-7 h-7" />
            <span>{disabled ? "Sala Livre" : "Abrir Porta"}</span>
          </>
        )}
        {state === "validating" && (
          <>
            <Loader2 className="w-7 h-7 animate-spin" />
            <span>Verificando reserva...</span>
          </>
        )}
        {state === "unlocking" && (
          <>
            <Loader2 className="w-7 h-7 animate-spin" />
            <span>Liberando acesso...</span>
          </>
        )}
        {state === "success" && (
          <>
            <CheckCircle2 className="w-7 h-7" />
            <span>Porta Aberta!</span>
          </>
        )}

        {/* Shimmer effect during loading */}
        {(state === "validating" || state === "unlocking") && (
          <div className="absolute inset-0 animate-shimmer" />
        )}
      </Button>
    </GlassCard>
  );
}
