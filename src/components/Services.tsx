import { useState } from "react";
import { GlassCard } from "@/components/GlassCard";
import { Button } from "@/components/ui/button";
import { Coffee, Sparkles, Loader2, CheckCircle } from "lucide-react";
import { toast } from "@/hooks/use-toast";

type ServiceState = "idle" | "loading" | "success";

export function Services() {
  const [coffeeState, setCoffeeState] = useState<ServiceState>("idle");
  const [cleaningState, setCleaningState] = useState<ServiceState>("idle");

  const handleService = async (
    service: "coffee" | "cleaning",
    setState: (s: ServiceState) => void
  ) => {
    setState("loading");
    await new Promise((resolve) => setTimeout(resolve, 1500));
    setState("success");
    toast({
      title: service === "coffee" ? "Café Solicitado" : "Limpeza Acionada",
      description:
        service === "coffee"
          ? "Seu café chegará em breve!"
          : "Equipe de limpeza a caminho.",
    });
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
        disabled={state === "loading"}
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
    <GlassCard className="space-y-4">
      <h3 className="text-lg font-semibold flex items-center gap-2">
        <Coffee className="w-5 h-5 text-primary" />
        Serviços
      </h3>

      <div className="flex gap-3">
        {renderButton("coffee", coffeeState, setCoffeeState)}
        {renderButton("cleaning", cleaningState, setCleaningState)}
      </div>
    </GlassCard>
  );
}
