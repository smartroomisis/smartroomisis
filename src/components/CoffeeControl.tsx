import { useState, useEffect } from "react";
import { GlassCard } from "@/components/GlassCard";
import { Button } from "@/components/ui/button";
import { toast } from "@/hooks/use-toast";
import { requestCoffee } from "@/lib/api";
import { Coffee, Loader2, Gift, CreditCard, CheckCircle } from "lucide-react";

interface CoffeeControlProps {
  disabled?: boolean;
  reservationId?: string;
}

const COOLDOWN_SECONDS = 30;
const MAX_COURTESY_COFFEES = 2;
const STORAGE_KEY_PREFIX = "coffee_courtesy_";

export function CoffeeControl({ disabled = false, reservationId }: CoffeeControlProps) {
  const [courtesyUsed, setCourtesyUsed] = useState(0);
  const [cooldownRemaining, setCooldownRemaining] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [lastRequestSuccess, setLastRequestSuccess] = useState(false);

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

  const courtesyDisabled = disabled || courtesyUsed >= MAX_COURTESY_COFFEES || cooldownRemaining > 0 || isLoading;
  const extraDisabled = disabled || cooldownRemaining > 0 || isLoading;

  return (
    <GlassCard className="space-y-4">
      <h3 className="text-lg font-semibold flex items-center gap-2">
        <Coffee className="w-5 h-5 text-primary" />
        Nespresso
        {disabled && <span className="text-xs text-muted-foreground">(desabilitado)</span>}
      </h3>

      {/* Cooldown Timer */}
      {cooldownRemaining > 0 && (
        <div className="flex items-center gap-2 p-3 bg-warning/10 border border-warning/30 rounded-lg">
          <Loader2 className="w-4 h-4 animate-spin text-warning" />
          <span className="text-sm text-warning">
            Aquecendo máquina... {cooldownRemaining}s
          </span>
        </div>
      )}

      {/* Success Message */}
      {lastRequestSuccess && (
        <div className="flex items-center gap-2 p-3 bg-success/10 border border-success/30 rounded-lg">
          <CheckCircle className="w-4 h-4 text-success" />
          <span className="text-sm text-success">Café em preparação!</span>
        </div>
      )}

      <div className="flex gap-3">
        {/* Courtesy Coffee Button */}
        <Button
          variant={courtesyUsed >= MAX_COURTESY_COFFEES ? "outline" : "glass"}
          className="flex-1 h-14 flex-col gap-1"
          onClick={() => handlePrepareCoffee("courtesy")}
          disabled={courtesyDisabled}
        >
          {isLoading ? (
            <Loader2 className="w-5 h-5 animate-spin" />
          ) : (
            <>
              <div className="flex items-center gap-2">
                <Gift className="w-4 h-4" />
                <span className="text-sm">Café Cortesia</span>
              </div>
              <span className="text-xs text-muted-foreground">
                {courtesyUsed}/{MAX_COURTESY_COFFEES} utilizados
              </span>
            </>
          )}
        </Button>

        {/* Extra Coffee Button */}
        <Button
          variant="glass"
          className="flex-1 h-14 flex-col gap-1"
          onClick={() => handlePrepareCoffee("extra")}
          disabled={extraDisabled}
        >
          {isLoading ? (
            <Loader2 className="w-5 h-5 animate-spin" />
          ) : (
            <>
              <div className="flex items-center gap-2">
                <CreditCard className="w-4 h-4" />
                <span className="text-sm">Café Extra</span>
              </div>
              <span className="text-xs text-muted-foreground">R$ 5,00</span>
            </>
          )}
        </Button>
      </div>
    </GlassCard>
  );
}
