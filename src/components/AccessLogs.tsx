import { GlassCard } from "@/components/GlassCard";
import { ScrollArea } from "@/components/ui/scroll-area";
import { User, Clock, DoorOpen } from "lucide-react";

const logs = [
  {
    id: 1,
    user: "Carlos Silva",
    action: "Entrada",
    time: "14:32",
    date: "Hoje",
  },
  {
    id: 2,
    user: "Ana Costa",
    action: "Saída",
    time: "13:15",
    date: "Hoje",
  },
  {
    id: 3,
    user: "João Mendes",
    action: "Entrada",
    time: "11:00",
    date: "Hoje",
  },
  {
    id: 4,
    user: "Maria Santos",
    action: "Saída",
    time: "10:45",
    date: "Hoje",
  },
  {
    id: 5,
    user: "Pedro Lima",
    action: "Entrada",
    time: "09:30",
    date: "Ontem",
  },
  {
    id: 6,
    user: "Lucia Ferreira",
    action: "Saída",
    time: "18:00",
    date: "Ontem",
  },
];

export function AccessLogs() {
  return (
    <GlassCard>
      <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
        <DoorOpen className="w-5 h-5 text-primary" />
        Últimos Acessos
      </h3>

      <ScrollArea className="h-[300px]">
        <div className="space-y-3">
          {logs.map((log, index) => (
            <div
              key={log.id}
              className="flex items-center gap-4 p-3 rounded-lg bg-secondary/50 transition-all hover:bg-secondary animate-slide-in-right"
              style={{ animationDelay: `${index * 50}ms` }}
            >
              <div className="flex items-center justify-center w-10 h-10 rounded-full bg-primary/10">
                <User className="w-5 h-5 text-primary" />
              </div>

              <div className="flex-1">
                <p className="font-medium text-sm">{log.user}</p>
                <p className="text-xs text-muted-foreground">{log.action}</p>
              </div>

              <div className="text-right">
                <div className="flex items-center gap-1 text-sm text-muted-foreground">
                  <Clock className="w-3 h-3" />
                  <span>{log.time}</span>
                </div>
                <p className="text-xs text-muted-foreground">{log.date}</p>
              </div>
            </div>
          ))}
        </div>
      </ScrollArea>
    </GlassCard>
  );
}
