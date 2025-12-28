import { useState } from "react";
import { GlassCard } from "@/components/GlassCard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { toast } from "@/hooks/use-toast";
import { submitStaffAudit } from "@/lib/api";
import { 
  Zap, 
  ClipboardCheck, 
  Coffee, 
  Droplets, 
  Trash2, 
  Tv,
  AlertTriangle,
  Loader2,
  CheckCircle
} from "lucide-react";

interface ChecklistItem {
  id: string;
  label: string;
  icon: React.ElementType;
  checked: boolean;
}

const initialChecklist: ChecklistItem[] = [
  { id: "water", label: "Purificador de água higienizado e copos de papel repostos", icon: Droplets, checked: false },
  { id: "bathroom", label: "Banheiro: Papel higiênico verificado e Sabão líquido abastecido", icon: Droplets, checked: false },
  { id: "hygiene", label: "Higiene: Lixeiras esvaziadas, sacos trocados e superfícies limpas", icon: Trash2, checked: false },
  { id: "organization", label: "Organização: Cabos HDMI/Adaptadores organizados e Ar-condicionado/Luzes testados", icon: Tv, checked: false },
];

export default function Staff() {
  const [roomId] = useState("smart-room-isis-01");
  const [reservationId, setReservationId] = useState("");
  const [coffeeCapsulesRemaining, setCoffeeCapsulesRemaining] = useState<number>(20);
  const [checklist, setChecklist] = useState<ChecklistItem[]>(initialChecklist);
  const [damageReport, setDamageReport] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const toggleChecklistItem = (id: string) => {
    setChecklist((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, checked: !item.checked } : item
      )
    );
  };

  const allChecked = checklist.every((item) => item.checked);

  const handleSubmit = async () => {
    if (!reservationId.trim()) {
      toast({
        title: "Campo obrigatório",
        description: "Informe o ID da última reserva.",
        variant: "destructive",
      });
      return;
    }

    if (coffeeCapsulesRemaining < 0 || coffeeCapsulesRemaining > 20) {
      toast({
        title: "Valor inválido",
        description: "O número de cápsulas deve estar entre 0 e 20.",
        variant: "destructive",
      });
      return;
    }

    if (!allChecked) {
      toast({
        title: "Checklist incompleto",
        description: "Complete todos os itens do checklist antes de finalizar.",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      await submitStaffAudit({
        room_id: roomId,
        reservation_id: reservationId,
        coffee_capsules_remaining: coffeeCapsulesRemaining,
        checklist: checklist.reduce((acc, item) => {
          acc[item.id] = item.checked;
          return acc;
        }, {} as Record<string, boolean>),
        damage_report: damageReport.trim() || null,
      });

      setIsSuccess(true);
      toast({
        title: "Manutenção Finalizada",
        description: "Sala liberada com sucesso para próxima reserva!",
      });

      // Reset form after success
      setTimeout(() => {
        setIsSuccess(false);
        setReservationId("");
        setCoffeeCapsulesRemaining(20);
        setChecklist(initialChecklist);
        setDamageReport("");
      }, 3000);
    } catch (error) {
      const message = error instanceof Error ? error.message : "Erro ao enviar dados";
      toast({
        title: "Erro",
        description: message,
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen pb-24 md:pt-20 md:pb-8">
      <div className="container mx-auto px-4 py-6 max-w-2xl">
        {/* Header */}
        <div className="flex items-center gap-3 mb-6 md:hidden">
          <Zap className="w-6 h-6 text-primary" />
          <h1 className="text-xl font-bold neon-text">SMART ROOM ISIS</h1>
        </div>

        {/* Page Title */}
        <div className="mb-6">
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <ClipboardCheck className="w-6 h-6 text-primary" />
            Área do Staff
          </h2>
          <p className="text-muted-foreground text-sm">
            Manutenção e Check-out da Sala
          </p>
        </div>

        <div className="space-y-5">
          {/* Room & Reservation */}
          <GlassCard className="space-y-4">
            <h3 className="text-lg font-semibold">Identificação</h3>
            
            <div className="space-y-3">
              <div>
                <Label htmlFor="room">Sala</Label>
                <Input 
                  id="room" 
                  value="SMART ROOM ISIS" 
                  disabled 
                  className="mt-1 bg-muted/50"
                />
              </div>
              
              <div>
                <Label htmlFor="reservation">ID da Última Reserva *</Label>
                <Input
                  id="reservation"
                  value={reservationId}
                  onChange={(e) => setReservationId(e.target.value)}
                  placeholder="Ex: rec123abc..."
                  className="mt-1"
                />
              </div>
            </div>
          </GlassCard>

          {/* Coffee Audit */}
          <GlassCard className="space-y-4">
            <h3 className="text-lg font-semibold flex items-center gap-2">
              <Coffee className="w-5 h-5 text-primary" />
              Auditoria de Café
            </h3>
            
            <div>
              <Label htmlFor="capsules">Cápsulas de Café Restantes (Estoque inicial: 20) *</Label>
              <Input
                id="capsules"
                type="number"
                min={0}
                max={20}
                value={coffeeCapsulesRemaining}
                onChange={(e) => setCoffeeCapsulesRemaining(Number(e.target.value))}
                className="mt-1 w-32"
              />
              <p className="text-xs text-muted-foreground mt-1">
                Consumidas: {20 - coffeeCapsulesRemaining} cápsulas
              </p>
            </div>
          </GlassCard>

          {/* Hospitality Checklist */}
          <GlassCard className="space-y-4">
            <h3 className="text-lg font-semibold">Checklist de Hospitalidade</h3>
            
            <div className="space-y-3">
              {checklist.map((item) => (
                <div
                  key={item.id}
                  className="flex items-start gap-3 p-3 rounded-lg bg-secondary/30 hover:bg-secondary/50 transition-colors cursor-pointer"
                  onClick={() => toggleChecklistItem(item.id)}
                >
                  <Checkbox
                    id={item.id}
                    checked={item.checked}
                    onCheckedChange={() => toggleChecklistItem(item.id)}
                    className="mt-0.5"
                  />
                  <div className="flex items-center gap-2 flex-1">
                    <item.icon className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                    <Label htmlFor={item.id} className="cursor-pointer text-sm">
                      {item.label}
                    </Label>
                  </div>
                </div>
              ))}
            </div>
          </GlassCard>

          {/* Damage Report */}
          <GlassCard className="space-y-4">
            <h3 className="text-lg font-semibold flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-warning" />
              Relato de Danos
            </h3>
            
            <Textarea
              placeholder="Descreva aqui avarias ou itens quebrados encontrados na sala..."
              value={damageReport}
              onChange={(e) => setDamageReport(e.target.value)}
              rows={3}
            />
          </GlassCard>

          {/* Submit Button */}
          <Button
            size="lg"
            className="w-full h-14"
            onClick={handleSubmit}
            disabled={isSubmitting || isSuccess}
            variant={isSuccess ? "default" : "default"}
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin mr-2" />
                Enviando...
              </>
            ) : isSuccess ? (
              <>
                <CheckCircle className="w-5 h-5 mr-2" />
                Sala Liberada!
              </>
            ) : (
              <>
                <ClipboardCheck className="w-5 h-5 mr-2" />
                Finalizar Manutenção e Liberar Sala
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}
