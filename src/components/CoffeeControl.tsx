import { useState, useEffect } from "react";
import { GlassCard } from "@/components/GlassCard";
import { Button } from "@/components/ui/button";
import { toast } from "@/hooks/use-toast";
import { requestCoffee } from "@/lib/api";
import { PixPaymentModal } from "@/components/PixPaymentModal";
import { Coffee, Loader2, Gift, CreditCard, CheckCircle, Sparkles } from "lucide-react";

interface CoffeeControlProps {
  disabled?: boolean;
  reservationId?: string;
}

const COOLDOWN_SECONDS = 30;
const MAX_COURTESY_COFFEES = 2;
const STORAGE_KEY_PREFIX = "coffee_courtesy_";
const COFFEE_PRICE = 5.00;

export function CoffeeControl({ disabled = false, reservationId }: CoffeeControlProps) {
  const [courtesyUsed, setCourtesyUsed] = useState(0);
  const [cooldownRemaining, setCooldownRemaining] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [lastRequestSuccess, setLastRequestSuccess] = useState(false);
  const [showPixModal, setShowPixModal] = useState(false);

  // Load courtesy count from localStorage based on reservationId
  useEffect(() => {
    if (reservationId) {
      const stored = localStorage.getItem(`${STORAGE_KEY_PREFIX}${reservationId}`);
      if (stored) {
        setCourtesyUsed(parseInt(stored, 10));
      } else {
        setCourtesyUsed(0);
      }
    }
  }, [reservationId]);

  // Cooldown timer
  useEffect(() => {
    if (cooldownRemaining > 0) {
      const timer = setTimeout(() => {
        setCooldownRemaining((prev) => prev - 1);
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [cooldownRemaining]);

  const startCooldown = () => {
    setCooldownRemaining(COOLDOWN_SECONDS);
  };

  const handlePrepareCoffee = async (type: "courtesy" | "extra") => {
    if (disabled || cooldownRemaining > 0 || isLoading) return;

    if (type === "courtesy" && courtesyUsed >= MAX_COURTESY_COFFEES) {
      toast({
        title: "Limite atingido",
        description: "Você já utilizou seus 2 cafés cortesia desta reserva.",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    startCooldown();

    try {
      await requestCoffee(reservationId, type);
      
      setLastRequestSuccess(true);
      setTimeout(() => setLastRequestSuccess(false), 3000);

      if (type === "courtesy" && reservationId) {
        const newCount = courtesyUsed + 1;
        setCourtesyUsed(newCount);
        localStorage.setItem(`${STORAGE_KEY_PREFIX}${reservationId}`, newCount.toString());
      }

      toast({
        title: "Café Solicitado! ☕",
        description: type === "courtesy" 
          ? `Seu café cortesia está sendo preparado! (${courtesyUsed + 1}/${MAX_COURTESY_COFFEES})`
          : "Seu café extra está sendo preparado!",
      });
    } catch (error) {
      setCooldownRemaining(0);
      const message = error instanceof Error ? error.message : "Erro ao solicitar café";
      toast({
        title: "Falha na solicitação",
        description: message,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleBuyCoffee = () => {
    setShowPixModal(true);
  };

  const handlePixPaymentConfirmed = () => {
    // After PIX payment, prepare the coffee
    handlePrepareCoffee("extra");
    toast({
      title: "Máquina liberada! ☕",
      description: "Aproveite seu café.",
    });
  };

  const hasCourtesy = courtesyUsed < MAX_COURTESY_COFFEES;
  const courtesyRemaining = MAX_COURTESY_COFFEES - courtesyUsed;
  const buttonDisabled = disabled || cooldownRemaining > 0 || isLoading;

  return (
    <>
      <GlassCard className="space-y-4">
        <h3 className="text-lg font-semibold flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-primary" />
          Cafeteria Isis
          {disabled && <span className="text-xs text-muted-foreground">(desabilitado)</span>}
        </h3>

        {/* Cooldown Timer */}
        {cooldownRemaining > 0 && (
          <div className="flex items-center gap-2 p-3 bg-warning/10 border border-warning/30 rounded-lg">
            <Loader2 className="w-4 h-4 animate-spin text-warning" />
            <span className="text-sm text-warning">
              Preparando café... {cooldownRemaining}s
            </span>
          </div>
        )}

        {/* Success Message */}
        {lastRequestSuccess && (
          <div className="flex items-center gap-2 p-3 bg-success/10 border border-success/30 rounded-lg">
            <CheckCircle className="w-4 h-4 text-success" />
            <span className="text-sm text-success">Máquina liberada! Aproveite seu café.</span>
          </div>
        )}

        {/* Coffee Options */}
        <div className="space-y-3">
          {/* Courtesy Coffee - Show if has courtesy remaining */}
          {hasCourtesy && (
            <Button
              variant="glass"
              className="w-full h-14 flex items-center justify-between px-4"
              onClick={() => handlePrepareCoffee("courtesy")}
              disabled={buttonDisabled}
            >
              {isLoading ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <>
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-primary/20 rounded-full">
                      <Gift className="w-4 h-4 text-primary" />
                    </div>
                    <div className="text-left">
                      <p className="text-sm font-medium">Liberar Café Cortesia</p>
                      <p className="text-xs text-muted-foreground">
                        Restam {courtesyRemaining} de {MAX_COURTESY_COFFEES}
                      </p>
                    </div>
                  </div>
                  <Coffee className="w-5 h-5 text-primary" />
                </>
              )}
            </Button>
          )}

          {/* Buy Coffee - Show if no courtesy or as additional option */}
          <Button
            variant={hasCourtesy ? "outline" : "glass"}
            className="w-full h-14 flex items-center justify-between px-4"
            onClick={handleBuyCoffee}
            disabled={disabled}
          >
            <div className="flex items-center gap-3">
              <div className="p-2 bg-accent/20 rounded-full">
                <CreditCard className="w-4 h-4 text-accent" />
              </div>
              <div className="text-left">
                <p className="text-sm font-medium">
                  {hasCourtesy ? "Comprar Café Adicional" : "Comprar Café"}
                </p>
                <p className="text-xs text-muted-foreground">
                  R$ {COFFEE_PRICE.toFixed(2)} via PIX
                </p>
              </div>
            </div>
            <Coffee className="w-5 h-5" />
          </Button>
        </div>

        {/* Info */}
        <p className="text-xs text-center text-muted-foreground">
          Nespresso • Cápsulas variadas disponíveis
        </p>
      </GlassCard>

      {/* PIX Payment Modal */}
      <PixPaymentModal
        open={showPixModal}
        onOpenChange={setShowPixModal}
        amount={COFFEE_PRICE}
        description="Café Extra - Smart Room Office"
        onPaymentConfirmed={handlePixPaymentConfirmed}
      />
    </>
  );
}
