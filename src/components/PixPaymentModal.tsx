import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { toast } from "@/hooks/use-toast";
import { 
  QrCode, 
  Copy, 
  CheckCircle, 
  Loader2,
  Timer,
  RefreshCw
} from "lucide-react";
import { cn } from "@/lib/utils";

interface PixPaymentModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  amount: number;
  description: string;
  onPaymentConfirmed?: () => void;
}

export function PixPaymentModal({
  open,
  onOpenChange,
  amount,
  description,
  onPaymentConfirmed,
}: PixPaymentModalProps) {
  const [copied, setCopied] = useState(false);
  const [status, setStatus] = useState<"pending" | "waiting" | "confirmed">("pending");
  const [countdown, setCountdown] = useState(300); // 5 minutes

  // Mock PIX code - in production this would come from backend
  const pixCode = `00020126580014BR.GOV.BCB.PIX0136smartroom-${Date.now()}5204000053039865802BR5925SMART ROOM OFFICE SJC6009SAO PAULO62070503***6304${Math.random().toString(36).substring(7).toUpperCase()}`;

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

  const handleCopyCode = async () => {
    try {
      await navigator.clipboard.writeText(pixCode);
      setCopied(true);
      setStatus("waiting");
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
                {pixCode.substring(0, 60)}...
              </p>
            </div>

            <Button
              className={cn(
                "w-full gap-2",
                copied && "bg-success hover:bg-success"
              )}
              onClick={handleCopyCode}
              disabled={status === "confirmed"}
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

          {/* Simulate Payment (Dev only) */}
          {status === "waiting" && (
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
