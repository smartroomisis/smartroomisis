import { useState, useEffect } from "react";
import { GlassCard } from "@/components/GlassCard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "@/hooks/use-toast";
import { submitStaffAudit, updateRoomStatus, getLastReservation, STAFF_LIST, ROOM_ID } from "@/lib/api";
import { PhotoUpload } from "@/components/PhotoUpload";
import { 
  Zap, 
  ClipboardCheck, 
  Coffee, 
  Droplets, 
  Trash2, 
  Tv,
  AlertTriangle,
  Loader2,
  CheckCircle,
  Sparkles,
  Armchair,
  User,
  RefreshCw,
  AlertCircle
} from "lucide-react";

interface ChecklistItem {
  id: string;
  label: string;
  icon: React.ElementType;
  checked: boolean;
}

// Cleaning checklist (Álcool 70%)
const initialCleaningChecklist: ChecklistItem[] = [
  { id: "toilet", label: "Vaso sanitário higienizado", icon: Droplets, checked: false },
  { id: "sink", label: "Pia limpa e desinfetada", icon: Droplets, checked: false },
  { id: "faucet", label: "Torneira higienizada", icon: Droplets, checked: false },
  { id: "mirror", label: "Espelho limpo", icon: Sparkles, checked: false },
  { id: "remotes", label: "Comandos (TV/Ar) desinfetados", icon: Tv, checked: false },
  { id: "handles", label: "Maçanetas limpas", icon: Sparkles, checked: false },
  { id: "switches", label: "Interruptores desinfetados", icon: Sparkles, checked: false },
  { id: "surfaces", label: "Superfícies de mesa limpas", icon: Sparkles, checked: false },
];

// Organization checklist
const initialOrganizationChecklist: ChecklistItem[] = [
  { id: "chairs", label: "Cadeiras alinhadas simetricamente", icon: Armchair, checked: false },
  { id: "cables", label: "Cabos HDMI/Adaptadores organizados", icon: Tv, checked: false },
  { id: "trash", label: "Lixeiras esvaziadas e sacos trocados", icon: Trash2, checked: false },
  { id: "supplies", label: "Café/Açúcar/Copos repostos", icon: Coffee, checked: false },
];

export default function Staff() {
  const [staffId, setStaffId] = useState("");
  const [reservationId, setReservationId] = useState("");
  const [clientName, setClientName] = useState("");
  const [isLoadingReservation, setIsLoadingReservation] = useState(true);
  const [reservationError, setReservationError] = useState<string | null>(null);
  const [coffeeCapsulesRemaining, setCoffeeCapsulesRemaining] = useState<number>(20);
  const [cleaningChecklist, setCleaningChecklist] = useState<ChecklistItem[]>(initialCleaningChecklist);
  const [organizationChecklist, setOrganizationChecklist] = useState<ChecklistItem[]>(initialOrganizationChecklist);
  const [damageReport, setDamageReport] = useState("");
  const [photos, setPhotos] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const selectedStaff = STAFF_LIST.find(s => s.id === staffId);

  // Auto-fetch last reservation on mount
  useEffect(() => {
    fetchLastReservation();
  }, []);

  const fetchLastReservation = async () => {
    setIsLoadingReservation(true);
    setReservationError(null);
    
    try {
      const result = await getLastReservation();
      
      if (result.success && result.reservation_id) {
        setReservationId(result.reservation_id);
        setClientName(result.client_name || "");
        setReservationError(null);
      } else {
        setReservationError(result.error || "Nenhuma reserva encontrada para limpeza");
      }
    } catch (err) {
      console.error("Error fetching reservation:", err);
      setReservationError("Erro ao buscar reserva. Tente novamente.");
    } finally {
      setIsLoadingReservation(false);
    }
  };

  const toggleCleaningItem = (id: string) => {
    setCleaningChecklist((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, checked: !item.checked } : item
      )
    );
  };

  const toggleOrganizationItem = (id: string) => {
    setOrganizationChecklist((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, checked: !item.checked } : item
      )
    );
  };

  const allCleaningChecked = cleaningChecklist.every((item) => item.checked);
  const allOrganizationChecked = organizationChecklist.every((item) => item.checked);
  const hasPhotos = photos.length > 0;

  const handleSubmit = async () => {
    if (!staffId) {
      toast({
        title: "Campo obrigatório",
        description: "Selecione o colaborador.",
        variant: "destructive",
      });
      return;
    }

    if (!reservationId.trim()) {
      toast({
        title: "Campo obrigatório",
        description: "Nenhuma reserva identificada. Clique em 'Recarregar' para buscar novamente.",
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

    if (!allCleaningChecked) {
      toast({
        title: "Checklist de Higienização incompleto",
        description: "Complete todos os itens de higienização antes de finalizar.",
        variant: "destructive",
      });
      return;
    }

    if (!allOrganizationChecked) {
      toast({
        title: "Checklist de Organização incompleto",
        description: "Complete todos os itens de organização antes de finalizar.",
        variant: "destructive",
      });
      return;
    }

    if (!hasPhotos) {
      toast({
        title: "Fotos obrigatórias",
        description: "Adicione pelo menos uma foto para liberar a sala.",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      // Submit audit data
      await submitStaffAudit({
        room_id: ROOM_ID,
        reservation_id: reservationId,
        staff_id: staffId,
        staff_name: selectedStaff?.name || "",
        coffee_capsules_remaining: coffeeCapsulesRemaining,
        cleaning_checklist: cleaningChecklist.reduce((acc, item) => {
          acc[item.id] = item.checked;
          return acc;
        }, {} as Record<string, boolean>),
        organization_checklist: organizationChecklist.reduce((acc, item) => {
          acc[item.id] = item.checked;
          return acc;
        }, {} as Record<string, boolean>),
        damage_report: damageReport.trim() || null,
        photo_urls: photos,
      });

      // Update room status to Available
      await updateRoomStatus(ROOM_ID, "Disponível");

      setIsSuccess(true);
      toast({
        title: "Manutenção Finalizada",
        description: "Sala liberada com sucesso para próxima reserva!",
      });

      // Reset form after success
      setTimeout(() => {
        setIsSuccess(false);
        setStaffId("");
        setReservationId("");
        setClientName("");
        setCoffeeCapsulesRemaining(20);
        setCleaningChecklist(initialCleaningChecklist);
        setOrganizationChecklist(initialOrganizationChecklist);
        setDamageReport("");
        setPhotos([]);
        // Fetch next reservation
        fetchLastReservation();
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
    <div className="min-h-screen pb-24 md:pt-20 md:pb-8 theme-admin">
      <div className="container mx-auto px-4 py-6 max-w-2xl">
        {/* Header */}
        <div className="flex items-center gap-3 mb-6 md:hidden">
          <Zap className="w-6 h-6 text-primary" />
          <h1 className="text-xl font-bold neon-text">SMART ROOM OFFICE</h1>
        </div>

        {/* Page Title */}
        <div className="mb-6">
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <ClipboardCheck className="w-6 h-6 text-primary" />
            Área do Staff
          </h2>
          <p className="text-muted-foreground text-sm">
            Auditoria e Higienização da Sala
          </p>
        </div>

        <div className="space-y-5">
          {/* Staff & Reservation */}
          <GlassCard className="space-y-4">
            <h3 className="text-lg font-semibold flex items-center gap-2">
              <User className="w-5 h-5 text-primary" />
              Identificação
            </h3>
            
            <div className="space-y-3">
              <div>
                <Label htmlFor="staff">Colaborador *</Label>
                <Select value={staffId} onValueChange={setStaffId}>
                  <SelectTrigger className="mt-1">
                    <SelectValue placeholder="Selecione o colaborador" />
                  </SelectTrigger>
                  <SelectContent>
                    {STAFF_LIST.map((staff) => (
                      <SelectItem key={staff.id} value={staff.id}>
                        {staff.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="room">Sala</Label>
                <Input 
                  id="room" 
                  value="SMART ROOM OFFICE" 
                  disabled 
                  className="mt-1 bg-muted/50"
                />
              </div>
              
              <div>
                <div className="flex items-center justify-between">
                  <Label htmlFor="reservation">ID da Última Reserva</Label>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={fetchLastReservation}
                    disabled={isLoadingReservation}
                    className="h-7 text-xs"
                  >
                    {isLoadingReservation ? (
                      <Loader2 className="w-3 h-3 animate-spin mr-1" />
                    ) : (
                      <RefreshCw className="w-3 h-3 mr-1" />
                    )}
                    Recarregar
                  </Button>
                </div>
                
                {isLoadingReservation ? (
                  <div className="mt-1 flex items-center gap-2 p-3 rounded-md bg-muted/50 text-muted-foreground text-sm">
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Buscando última reserva...
                  </div>
                ) : reservationError ? (
                  <div className="mt-1 flex items-center gap-2 p-3 rounded-md bg-warning/10 text-warning text-sm border border-warning/20">
                    <AlertCircle className="w-4 h-4 flex-shrink-0" />
                    <span>{reservationError}</span>
                  </div>
                ) : (
                  <div className="mt-1 space-y-2">
                    <Input
                      id="reservation"
                      value={reservationId}
                      disabled
                      className="bg-muted/50 font-mono text-sm"
                    />
                    {clientName && (
                      <p className="text-xs text-muted-foreground">
                        Cliente: <span className="font-medium">{clientName}</span>
                      </p>
                    )}
                  </div>
                )}
              </div>
            </div>
          </GlassCard>

          {/* Cleaning Checklist (Álcool 70%) */}
          <GlassCard className="space-y-4">
            <h3 className="text-lg font-semibold flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-primary" />
              Checklist de Higienização (Álcool 70%)
            </h3>
            
            <div className="space-y-2">
              {cleaningChecklist.map((item) => (
                <div
                  key={item.id}
                  className="flex items-center gap-3 p-3 rounded-lg bg-secondary/30 hover:bg-secondary/50 transition-colors cursor-pointer"
                  onClick={() => toggleCleaningItem(item.id)}
                >
                  <Checkbox
                    id={`cleaning-${item.id}`}
                    checked={item.checked}
                    onCheckedChange={() => toggleCleaningItem(item.id)}
                  />
                  <item.icon className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                  <Label htmlFor={`cleaning-${item.id}`} className="cursor-pointer text-sm flex-1">
                    {item.label}
                  </Label>
                </div>
              ))}
            </div>
          </GlassCard>

          {/* Organization Checklist */}
          <GlassCard className="space-y-4">
            <h3 className="text-lg font-semibold flex items-center gap-2">
              <Armchair className="w-5 h-5 text-primary" />
              Checklist de Organização
            </h3>
            
            <div className="space-y-2">
              {organizationChecklist.map((item) => (
                <div
                  key={item.id}
                  className="flex items-center gap-3 p-3 rounded-lg bg-secondary/30 hover:bg-secondary/50 transition-colors cursor-pointer"
                  onClick={() => toggleOrganizationItem(item.id)}
                >
                  <Checkbox
                    id={`org-${item.id}`}
                    checked={item.checked}
                    onCheckedChange={() => toggleOrganizationItem(item.id)}
                  />
                  <item.icon className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                  <Label htmlFor={`org-${item.id}`} className="cursor-pointer text-sm flex-1">
                    {item.label}
                  </Label>
                </div>
              ))}
            </div>
          </GlassCard>

          {/* Coffee Audit */}
          <GlassCard className="space-y-4">
            <h3 className="text-lg font-semibold flex items-center gap-2">
              <Coffee className="w-5 h-5 text-primary" />
              Controlo de Café
            </h3>
            
            <div>
              <Label htmlFor="capsules">Cápsulas Restantes (Estoque inicial: 20) *</Label>
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

          {/* Photo Evidence */}
          <GlassCard className="space-y-4">
            <h3 className="text-lg font-semibold flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-primary" />
              Evidências Fotográficas
            </h3>
            
            <PhotoUpload
              photos={photos}
              onPhotosChange={setPhotos}
              maxPhotos={5}
              required={true}
            />
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
            disabled={isSubmitting || isSuccess || isLoadingReservation}
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
