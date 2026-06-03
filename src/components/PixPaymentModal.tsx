import { useState, useEffect, useRef } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { toast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { requestPixReservation } from "@/lib/api";
import { 
  QrCode, 
  Copy, 
  CheckCircle, 
  Loader2,
  RefreshCw
} from "lucide-react";
import { cn } from "@/lib/utils";

interface PixPaymentModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  amount: number;
  description: string;
  onPaymentConfirmed?: () => void;
  // When provided, the modal requests a real PIX charge from n8n and polls
  // the reservations table until the payment is confirmed.
  reservationPayload?: Record<string, unknown>;
}

export function PixPaymentModal({
  open,
  onOpenChange,
  amount,
  description,
  onPaymentConfirmed,
  reservationPayload,
}: PixPaymentModalProps) {
  const [copied, setCopied] = useState(false);
  const [status, setStatus] = useState<"loading" | "pending" | "waiting" | "confirmed" | "error">("pending");
  const [countdown, setCountdown] = useState(300); // 5 minutes
  const [pixCode, setPixCode] = useState("");
  const [reservationId, setReservationId] = useState<string | null>(null);
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const useBackend = !!reservationPayload;

  // Request a real PIX code from n8n when the modal opens
  useEffect(() => {
    if (!open || !useBackend) return;

    let cancelled = false;
    setStatus("loading");
    setPixCode("");
    setReservationId(null);
    setCountdown(300);

    (async () => {
      const result = await requestPixReservation(reservationPayload!);
      if (cancelled) return;

      if (!result.success || !result.pixCode || !result.reservationId) {
        setStatus("error");
        toast({
          title: "Erro ao gerar PIX",
          description: result.error || "Tente novamente.",
          variant: "destructive",
        });
        return;
      }

      setPixCode(result.pixCode);
      setReservationId(result.reservationId);
      setStatus("waiting");
    })();

    return () => {
      cancelled = true;
    };
  }, [open, useBackend]);

  // Fallback static code for non-reservation usage (e.g. coffee)
  useEffect(() => {
    if (open && !useBackend) {
      setStatus("pending");
      setCountdown(300);
      setPixCode(
        `00020126580014BR.GOV.BCB.PIX0136smartroom-${Date.now()}5204000053039865802BR5925SMART ROOM OFFICE SJC6009SAO PAULO62070503***6304`
      );
    }
  }, [open, useBackend]);

  // Countdown timer
  useEffect(() => {
    if (open && status === "waiting") {
      const timer = setInterval(() => {
        setCountdown((prev) => {
          if (prev <= 1) {
            clearInterval(timer);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);

      return () => clearInterval(timer);
    }
  }, [open, status]);

  // Poll the reservations table for payment confirmation
  useEffect(() => {
    if (!open || !useBackend || !reservationId || status !== "waiting") return;

    pollRef.current = setInterval(async () => {
      const { data, error } = await supabase
        .from("reservations")
        .select("status")
        .eq("id", reservationId)
        .single();

      if (error) return;

      if (data?.status === "confirmed") {
        if (pollRef.current) clearInterval(pollRef.current);
        setStatus("confirmed");
        toast({
          title: "Pagamento Confirmado! ✓",
          description: "Sua reserva foi confirmada com sucesso.",
        });
        setTimeout(() => {
          onPaymentConfirmed?.();
          onOpenChange(false);
        }, 1500);
      }
    }, 3000);

    return () => {
      if (pollRef.current) clearInterval(pollRef.current);
    };
  }, [open, useBackend, reservationId, status]);

  const handleCopyCode = async () => {
    try {
      await navigator.clipboard.writeText(pixCode);
      setCopied(true);
      if (!useBackend) setStatus("waiting");
      toast({
        title: "Código PIX Copiado!",
        description: "Cole no seu aplicativo de banco.",
      });
      setTimeout(() => setCopied(false), 3000);
    } catch (err) {
      toast({
        title: "Erro ao copiar",
        description: "Tente copiar manualmente.",
        variant: "destructive",
      });
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const handleSimulatePayment = () => {
    setStatus("confirmed");
    toast({
      title: "Pagamento Confirmado! ✓",
      description: "Seu pedido foi processado com sucesso.",
    });
    setTimeout(() => {
      onPaymentConfirmed?.();
      onOpenChange(false);
      setStatus("pending");
      setCountdown(300);
    }, 2000);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <QrCode className="w-5 h-5 text-primary" />
            Pagar com PIX
          </DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Amount */}
          <div className="p-4 bg-primary/10 rounded-lg text-center">
            <p className="text-sm text-muted-foreground">Valor a pagar</p>
            <p className="text-3xl font-bold text-primary">
              R$ {amount.toFixed(2)}
            </p>
          </div>

          {/* QR Code Placeholder */}
          <div className="aspect-square max-w-[200px] mx-auto bg-card rounded-xl p-4 flex items-center justify-center border border-border">
            <div className="w-full h-full bg-secondary rounded-lg flex items-center justify-center">
              <QrCode className="w-24 h-24 text-muted-foreground" />
            </div>
          </div>

          {/* Status Messages */}
          {status === "loading" && (
            <div className="flex items-center justify-center gap-2 p-3 bg-secondary/50 rounded-lg">
              <Loader2 className="w-4 h-4 animate-spin text-muted-foreground" />
              <span className="text-sm text-muted-foreground">Gerando código PIX...</span>
            </div>
          )}

          {status === "error" && (
            <p className="text-center text-sm text-destructive">
              Não foi possível gerar o código PIX. Feche e tente novamente.
            </p>
          )}

          {status === "pending" && (
            <p className="text-center text-sm text-muted-foreground">
              Escaneie o QR Code ou copie o código abaixo
            </p>
          )}

          {status === "waiting" && (
            <div className="flex items-center justify-center gap-2 p-3 bg-warning/10 border border-warning/30 rounded-lg">
              <Loader2 className="w-4 h-4 animate-spin text-warning" />
              <span className="text-sm text-warning">
                Aguardando pagamento...
              </span>
              <span className="text-sm font-mono text-warning">
                {formatTime(countdown)}
              </span>
            </div>
          )}

          {status === "confirmed" && (
            <div className="flex items-center justify-center gap-2 p-3 bg-success/10 border border-success/30 rounded-lg">
              <CheckCircle className="w-5 h-5 text-success" />
              <span className="text-sm font-medium text-success">
                Pagamento Confirmado!
              </span>
            </div>
          )}

          {/* PIX Code */}
          <div className="space-y-2">
            <div className="p-3 bg-secondary/50 rounded-lg">
              <p className="text-xs font-mono text-muted-foreground break-all line-clamp-2">
                {pixCode ? `${pixCode.substring(0, 60)}...` : "—"}
              </p>
            </div>

            <Button
              className={cn(
                "w-full gap-2",
                copied && "bg-success hover:bg-success"
              )}
              onClick={handleCopyCode}
              disabled={status === "confirmed" || status === "loading" || !pixCode}
            >
              {copied ? (
                <>
                  <CheckCircle className="w-4 h-4" />
                  Código Copiado!
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4" />
                  Copiar Código PIX
                </>
              )}
            </Button>
          </div>

          {/* Simulate Payment (Dev only) - only without backend confirmation */}
          {!useBackend && status === "waiting" && (
            <Button
              variant="outline"
              className="w-full gap-2"
              onClick={handleSimulatePayment}
            >
              <RefreshCw className="w-4 h-4" />
              Simular Confirmação (DEV)
            </Button>
          )}

          {/* Instructions */}
          <div className="text-xs text-muted-foreground space-y-1">
            <p>1. Abra o app do seu banco</p>
            <p>2. Escolha pagar via PIX</p>
            <p>3. Cole o código ou escaneie o QR Code</p>
            <p>4. Confirme o pagamento</p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
