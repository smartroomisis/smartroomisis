import { cn } from "@/lib/utils";
import { ReactNode, CSSProperties } from "react";

interface GlassCardProps {
  children: ReactNode;
  className?: string;
  neon?: boolean;
  animate?: boolean;
  style?: CSSProperties;
}

export function GlassCard({ children, className, neon = false, animate = false, style }: GlassCardProps) {
  return (
    <div
      className={cn(
        "glass-card p-5 transition-all duration-300",
        neon && "neon-border",
        animate && "animate-fade-in",
        className
      )}
      style={style}
    >
      {children}
    </div>
  );
}
