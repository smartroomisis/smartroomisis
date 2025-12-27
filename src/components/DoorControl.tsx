import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { GlassCard } from "@/components/GlassCard";
import { Fingerprint, Loader2, CheckCircle2, Key, Keyboard, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import { 
  unlockDoor, 
  validateReservation, 
  updateReservationStatus,
  ERROR_MESSAGES,
  ReservationValidation 
} from "@/lib/api";
import { toast } from "@/hooks/use-toast";

interface DoorControlProps {
  userId?: string;
  userEmail?: string;
  disabled?: boolean;
}

export function DoorControl({ 
  userId = "current_user_id", 
  userEmail,
  disabled = false 
}: DoorControlProps) {
  const [state, setState] = useState<"idle" | "validating" | "unlocking" | "success" | "blocked">("idle");
  const [reservation, setReservation] = useState<ReservationValidation | null>(null);
  const [blockMessage, setBlockMessage] = useState<string>("");

  // Check reservation status on mount and periodically
  useEffect(() => {
    const checkReservation = async () => {
      const result = await validateReservation(userId, userEmail);
      setReservation(result);
      
      if (!result.valid && result.has_upcoming) {
        setState("blocked");
        setBlockMessage(result.error || "Acesso disponível apenas no horário da reserva");
      } else if (!result.valid) {
        setState("blocked");
        setBlockMessage("Nenhuma reserva ativa encontrada");
      } else {
        setState("idle");
        setBlockMessage("");
      }
    };

    checkReservation();
    const interval = setInterval(checkReservation, 30000); // Check every 30s
    
    return () => clearInterval(interval);
  }, [userId, userEmail]);

  const handleOpenDoor = async () => {
    if (disabled || state === "blocked") return;
    
    setState("validating");
    
    try {
      // Step 1: Validate reservation in Airtable
      const validation = await validateReservation(userId, userEmail);
      setReservation(validation);
      
      if (!validation.valid) {
        setState("blocked");
        setBlockMessage(validation.error || ERROR_MESSAGES.OUT_OF_TIME);
        toast({
          title: "Acesso Negado",
          description: validation.error || ERROR_MESSAGES.OUT_OF_TIME,
          variant: "destructive",
        });
        return;
      }
      
      // Step 2: Unlock door via n8n with reservation ID and client name
      setState("unlocking");
      await unlockDoor(userId, userEmail, validation.reservation_id);
      
      // Step 3: Update reservation status to "Em uso" in Airtable
      if (validation.reservation_id) {
        await updateReservationStatus(validation.reservation_id, "Em uso");
      }
      
      setState("success");
      toast({
        title: "Acesso liberado!",
        description: `Bem-vindo à ${validation.room_name || 'Smart Room SJC'}, ${validation.client_name || 'Usuário'}!`,
      });
      
      setTimeout(() => setState("idle"), 3000);
    } catch (error) {
      setState("idle");
      const message = error instanceof Error ? error.message : "Falha na comunicação. Tente novamente ou chame o suporte";
      toast({
        title: "Erro de Comunicação",
        description: message,
        variant: "destructive",
      });
    }
  };

  const isButtonDisabled = disabled || state === "validating" || state === "unlocking" || state === "blocked";
  const accessCode = reservation?.access_code;
  const showEmergencyAccess = reservation?.valid && accessCode;

  return (
    <GlassCard className={cn("space-y-5", disabled && "opacity-50")}>
      <h3 className="text-lg font-semibold flex items-center gap-2">
        <Key className="w-5 h-5 text-primary" />
        Controle de Acesso
      </h3>

      {/* Blocked State Message */}
      {state === "blocked" && blockMessage && (
        <div className="glass-card bg-destructive/10 border border-destructive/30 p-4 rounded-lg flex items-center gap-3">
          <AlertCircle className="w-5 h-5 text-destructive flex-shrink-0" />
          <p className="text-sm text-destructive">{blockMessage}</p>
        </div>
      )}

      {/* Emergency Access Code - Only shown when reservation is confirmed */}
      {showEmergencyAccess && (
        <div className="glass-card bg-secondary/50 p-4 rounded-lg space-y-2">
          <div className="flex items-center gap-2 text-muted-foreground">
            <Keyboard className="w-4 h-4" />
            <p className="text-xs">Acesso de Emergência</p>
          </div>
          <p className="text-xs text-muted-foreground">Código para abertura manual:</p>
          <p className="text-2xl font-mono font-bold tracking-widest text-primary neon-text">
            {accessCode}
          </p>
        </div>
      )}

      {/* Biometric Button */}
      <Button
        variant="biometric"
        size="xl"
        className={cn(
          "w-full h-20 rounded-2xl text-lg font-semibold relative overflow-hidden transition-all duration-300",
          state === "success" && "!border-success !bg-success/20 !text-success",
          state === "blocked" && "!border-muted !bg-muted/20 !text-muted-foreground cursor-not-allowed",
          disabled && "cursor-not-allowed"
        )}
        onClick={handleOpenDoor}
        disabled={isButtonDisabled}
      >
        {state === "idle" && (
          <>
            <Fingerprint className="w-7 h-7" />
            <span>Abrir Porta</span>
          </>
        )}
        {state === "blocked" && (
          <>
            <AlertCircle className="w-7 h-7" />
            <span>Aguardando Horário</span>
          </>
        )}
        {state === "validating" && (
          <>
            <Loader2 className="w-7 h-7 animate-spin" />
            <span>Verificando acesso...</span>
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

      {/* Reservation Info */}
      {reservation?.valid && (
        <div className="text-xs text-muted-foreground text-center">
          <p>Reserva: {reservation.client_name} • {reservation.room_name}</p>
          {reservation.end_time && (
            <p>Válida até {new Date(reservation.end_time).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}</p>
          )}
        </div>
      )}
    </GlassCard>
  );
}
