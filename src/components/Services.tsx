import { useState } from "react";
import { GlassCard } from "@/components/GlassCard";
import { Button } from "@/components/ui/button";
import { Sparkles, Loader2, CheckCircle } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { requestCleaning, ERROR_MESSAGES } from "@/lib/api";
import { cn } from "@/lib/utils";

type ServiceState = "idle" | "loading" | "success";

interface ServicesProps {
  disabled?: boolean;
}

export function Services({ disabled = false }: ServicesProps) {
  const [cleaningState, setCleaningState] = useState<ServiceState>("idle");

  const handleCleaning = async () => {
    if (disabled) return;
    
    setCleaningState("loading");
    
    try {
      await requestCleaning();
      
      setCleaningState("success");
      toast({
        title: "Limpeza Acionada",
        description: "Equipe de limpeza a caminho.",
      });
    } catch (error) {
      setCleaningState("idle");
      const message = error instanceof Error ? error.message : ERROR_MESSAGES.CONNECTION;
      toast({
        title: "Erro de Conexão",
        description: message,
        variant: "destructive",
      });
      return;
    }
    
    setTimeout(() => setCleaningState("idle"), 3000);
  };

  return (
    <GlassCard className={cn("space-y-4", disabled && "opacity-50")}>
      <h3 className="text-lg font-semibold flex items-center gap-2">
        <Sparkles className="w-5 h-5 text-primary" />
        Serviços
        {disabled && <span className="text-xs text-muted-foreground">(desabilitado)</span>}
      </h3>

      <Button
        variant={cleaningState === "success" ? "default" : "glass"}
        className="w-full h-14"
        onClick={handleCleaning}
        disabled={cleaningState === "loading" || disabled}
      >
        {cleaningState === "idle" && (
          <>
            <Sparkles className="w-5 h-5" />
            <span>Acionar Limpeza</span>
          </>
        )}
        {cleaningState === "loading" && (
          <>
            <Loader2 className="w-5 h-5 animate-spin" />
            <span>Solicitando...</span>
          </>
        )}
        {cleaningState === "success" && (
          <>
            <CheckCircle className="w-5 h-5" />
            <span>Solicitado!</span>
          </>
        )}
      </Button>
    </GlassCard>
  );
}
