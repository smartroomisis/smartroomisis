import { Droplets, Leaf } from "lucide-react";

export function WaterBanner() {
  return (
    <div className="flex items-center gap-3 p-4 bg-primary/10 border border-primary/30 rounded-xl">
      <Droplets className="w-8 h-8 text-primary flex-shrink-0" />
      <div className="flex-1">
        <h4 className="font-semibold text-foreground">
          Água Gelada Purificada
        </h4>
        <p className="text-sm text-muted-foreground">
          Cortesia Ilimitada
        </p>
      </div>
      <div className="flex items-center gap-1 text-xs text-success bg-success/10 px-2 py-1 rounded-full">
        <Leaf className="w-3 h-3" />
        <span>Eco-friendly</span>
      </div>
    </div>
  );
}
