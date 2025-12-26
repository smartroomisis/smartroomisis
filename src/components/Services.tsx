import { useState } from "react";
import { GlassCard } from "@/components/GlassCard";
import { Button } from "@/components/ui/button";
import { Coffee, Sparkles, Loader2, CheckCircle } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { requestCoffee, requestCleaning, ERROR_MESSAGES } from "@/lib/api";
import { cn } from "@/lib/utils";

type ServiceState = "idle" | "loading" | "success";

interface ServicesProps {
  disabled?: boolean;
}

export function Services({ disabled = false }: ServicesProps) {
  const [coffeeState, setCoffeeState] = useState<ServiceState>("idle");
  const [cleaningState, setCleaningState] = useState<ServiceState>("idle");

  const handleService = async (
    service: "coffee" | "cleaning",
    setState: (s: ServiceState) => void
  ) => {
    if (disabled) return;
    
    setState("loading");
    
    try {
      if (service === "coffee") {
        await requestCoffee();
      } else {
        await requestCleaning();
      }
      
      setState("success");
      toast({
        title: service === "coffee" ? "Café Solicitado" : "Limpeza Acionada",
        description:
          service === "coffee"
            ? "Seu café chegará em breve!"
            : "Equipe de limpeza a caminho.",
      });
    } catch (error) {
      setState("idle");
      const message = error instanceof Error ? error.message : ERROR_MESSAGES.CONNECTION;
      toast({
        title: "Erro de Conexão",
        description: message,
        variant: "destructive",
      });
      return;
    }
    
    setTimeout(() => setState("idle"), 3000);
  };

  const renderButton = (
    service: "coffee" | "cleaning",
    state: ServiceState,
    setState: (s: ServiceState) => void
  ) => {
    const isCoffee = service === "coffee";
    const Icon = isCoffee ? Coffee : Sparkles;
    const label = isCoffee ? "Solicitar Café" : "Acionar Limpeza";

    return (
      <Button
        variant={state === "success" ? "success" : "glass"}
        className="flex-1 h-14"
        onClick={() => handleService(service, setState)}
        disabled={state === "loading" || disabled}
      >
        {state === "idle" && (
          <>
            <Icon className="w-5 h-5" />
            <span>{label}</span>
          </>
        )}
        {state === "loading" && (
          <>
            <Loader2 className="w-5 h-5 animate-spin" />
            <span>Solicitando...</span>
          </>
        )}
        {state === "success" && (
          <>
            <CheckCircle className="w-5 h-5" />
            <span>Solicitado!</span>
          </>
        )}
      </Button>
    );
  };

  return (
    <GlassCard className={cn("space-y-4", disabled && "opacity-50")}>
      <h3 className="text-lg font-semibold flex items-center gap-2">
        <Coffee className="w-5 h-5 text-primary" />
        Serviços
        {disabled && <span className="text-xs text-muted-foreground">(desabilitado)</span>}
      </h3>

      <div className="flex gap-3">
        {renderButton("coffee", coffeeState, setCoffeeState)}
        {renderButton("cleaning", cleaningState, setCleaningState)}
      </div>
    </GlassCard>
  );
}
