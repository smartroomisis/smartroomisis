import { useState } from "react";
import { Button } from "@/components/ui/button";
import { GlassCard } from "@/components/GlassCard";
import { Fingerprint, Loader2, CheckCircle2, Key } from "lucide-react";
import { cn } from "@/lib/utils";

interface DoorControlProps {
  accessCode: string;
}

export function DoorControl({ accessCode }: DoorControlProps) {
  const [state, setState] = useState<"idle" | "loading" | "success">("idle");

  const handleOpenDoor = async () => {
    setState("loading");
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 2000));
    setState("success");
    setTimeout(() => setState("idle"), 3000);
  };

  return (
    <GlassCard className="space-y-5">
      <h3 className="text-lg font-semibold flex items-center gap-2">
        <Key className="w-5 h-5 text-primary" />
        Controle de Acesso
      </h3>

      {/* Access Code */}
      <div className="glass-card bg-secondary/50 p-4 rounded-lg">
        <p className="text-xs text-muted-foreground mb-1">Código de Acesso</p>
        <p className="text-2xl font-mono font-bold tracking-widest text-primary neon-text">
          {accessCode}
        </p>
      </div>

      {/* Biometric Button */}
      <Button
        variant="biometric"
        size="xl"
        className={cn(
          "w-full h-20 rounded-2xl text-lg font-semibold relative overflow-hidden",
          state === "success" && "!border-success !text-success"
        )}
        onClick={handleOpenDoor}
        disabled={state === "loading"}
      >
        {state === "idle" && (
          <>
            <Fingerprint className="w-7 h-7" />
            <span>Abrir Porta</span>
          </>
        )}
        {state === "loading" && (
          <>
            <Loader2 className="w-7 h-7 animate-spin" />
            <span>Autenticando...</span>
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
