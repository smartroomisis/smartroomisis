import { useState, useEffect } from "react";
import { GlassCard } from "@/components/GlassCard";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "@/hooks/use-toast";
import { getSystemConfig } from "@/components/SystemSettings";
import { PhotoUpload } from "@/components/PhotoUpload";
import { 
  DollarSign, 
  User, 
  CheckCircle, 
  Clock, 
  Image as ImageIcon,
  Loader2,
  Eye,
  Bus,
  Briefcase,
  Upload
} from "lucide-react";

interface StaffPayment {
  id: string;
  staff_name: string;
  reservation_id: string;
  cleaning_date: string;
  service_fee: number; // Restart fee
  transport_fee: number; // Transport allowance
  total: number;
  status: "Pendente" | "Pago";
  paid_date?: string;
  photo_urls?: string[];
  payment_proof_url?: string;
}

// Mock data - replace with API call
const getMockPayments = (): StaffPayment[] => {
  const config = getSystemConfig();
  return [
    {
      id: "pay_001",
      staff_name: "João Silva",
      reservation_id: "res_abc123",
      cleaning_date: "2024-01-15T14:30:00",
      service_fee: config.restartFee,
      transport_fee: config.transportAllowance,
      total: config.restartFee + config.transportAllowance,
      status: "Pendente",
      photo_urls: ["https://via.placeholder.com/300x200?text=Sala+Limpa"]
    },
    {
      id: "pay_002",
      staff_name: "Maria Santos",
      reservation_id: "res_def456",
      cleaning_date: "2024-01-15T10:00:00",
      service_fee: config.restartFee,
      transport_fee: config.transportAllowance,
      total: config.restartFee + config.transportAllowance,
      status: "Pago",
      paid_date: "2024-01-16T09:00:00",
      photo_urls: ["https://via.placeholder.com/300x200?text=Auditoria"],
      payment_proof_url: "https://via.placeholder.com/300x200?text=Comprovante"
    },
  ];
};

export function StaffPayments() {
  const [payments, setPayments] = useState<StaffPayment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [processingId, setProcessingId] = useState<string | null>(null);
  const [selectedPhoto, setSelectedPhoto] = useState<string | null>(null);
  const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);
  const [selectedPayment, setSelectedPayment] = useState<StaffPayment | null>(null);
  const [proofPhotos, setProofPhotos] = useState<string[]>([]);
  const config = getSystemConfig();

  useEffect(() => {
    // Simulate API call
    setTimeout(() => {
      setPayments(getMockPayments());
      setIsLoading(false);
    }, 500);
  }, []);

  const pendingPayments = payments.filter(p => p.status === "Pendente");
  const paidPayments = payments.filter(p => p.status === "Pago");
  
  const totalPending = pendingPayments.reduce((sum, p) => sum + p.total, 0);

  // Group by staff
  const pendingByStaff = pendingPayments.reduce((acc, p) => {
    if (!acc[p.staff_name]) {
      acc[p.staff_name] = { count: 0, total: 0, service: 0, transport: 0 };
    }
    acc[p.staff_name].count++;
    acc[p.staff_name].total += p.total;
    acc[p.staff_name].service += p.service_fee;
    acc[p.staff_name].transport += p.transport_fee;
    return acc;
  }, {} as Record<string, { count: number; total: number; service: number; transport: number }>);

  const openConfirmDialog = (payment: StaffPayment) => {
    setSelectedPayment(payment);
    setProofPhotos([]);
    setConfirmDialogOpen(true);
  };

  const handleConfirmPayment = async () => {
    if (!selectedPayment) return;
    if (proofPhotos.length === 0) {
      toast({
        title: "Comprovante Obrigatório",
        description: "Por favor, envie o comprovante de pagamento antes de confirmar.",
        variant: "destructive",
      });
      return;
    }

    setProcessingId(selectedPayment.id);
    
    // Simulate API call - In real implementation, save service_fee and transport_fee separately
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    setPayments(prev => prev.map(p => 
      p.id === selectedPayment.id 
        ? { 
            ...p, 
            status: "Pago" as const, 
            paid_date: new Date().toISOString(),
            payment_proof_url: proofPhotos[0]
          }
        : p
    ));
    
    setProcessingId(null);
    setConfirmDialogOpen(false);
    setSelectedPayment(null);
    setProofPhotos([]);
    
    toast({
      title: "Pagamento Confirmado",
      description: `Serviço: R$ ${selectedPayment.service_fee.toFixed(2)} | Transporte: R$ ${selectedPayment.transport_fee.toFixed(2)}`,
    });
  };

  const formatCurrency = (value: number) => 
    new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);

  const formatDate = (date: string) => 
    new Date(date).toLocaleDateString('pt-BR', { 
      day: '2-digit', 
      month: '2-digit', 
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <GlassCard className="text-center">
          <div className="flex items-center justify-center gap-2 mb-2">
            <Clock className="w-5 h-5 text-warning" />
            <span className="text-sm text-muted-foreground">Total Pendente</span>
          </div>
          <p className="text-2xl font-bold text-warning">{formatCurrency(totalPending)}</p>
          <p className="text-xs text-muted-foreground">{pendingPayments.length} pagamento(s)</p>
        </GlassCard>

        <GlassCard className="text-center">
          <div className="flex items-center justify-center gap-2 mb-2">
            <CheckCircle className="w-5 h-5 text-success" />
            <span className="text-sm text-muted-foreground">Pagos Este Mês</span>
          </div>
          <p className="text-2xl font-bold text-success">
            {formatCurrency(paidPayments.reduce((sum, p) => sum + p.total, 0))}
          </p>
          <p className="text-xs text-muted-foreground">{paidPayments.length} pagamento(s)</p>
        </GlassCard>

        <GlassCard className="text-center">
          <div className="flex items-center justify-center gap-2 mb-2">
            <User className="w-5 h-5 text-primary" />
            <span className="text-sm text-muted-foreground">Colaboradores</span>
          </div>
          <p className="text-2xl font-bold text-primary">{Object.keys(pendingByStaff).length}</p>
          <p className="text-xs text-muted-foreground">com pendências</p>
        </GlassCard>
      </div>

      {/* Pending by Staff */}
      {Object.keys(pendingByStaff).length > 0 && (
        <GlassCard>
          <h3 className="font-semibold mb-4 flex items-center gap-2">
            <DollarSign className="w-5 h-5 text-warning" />
            A Pagar por Colaborador
          </h3>
          <div className="space-y-2">
            {Object.entries(pendingByStaff).map(([name, data]) => (
              <div key={name} className="p-3 bg-secondary/30 rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-3">
                    <User className="w-5 h-5 text-muted-foreground" />
                    <span>{name}</span>
                    <Badge variant="secondary">{data.count} limpeza(s)</Badge>
                  </div>
                  <span className="font-bold text-warning">{formatCurrency(data.total)}</span>
                </div>
                <div className="flex gap-4 text-xs text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <Briefcase className="w-3 h-3" />
                    Serviço: {formatCurrency(data.service)}
                  </span>
                  <span className="flex items-center gap-1">
                    <Bus className="w-3 h-3" />
                    Transporte: {formatCurrency(data.transport)}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </GlassCard>
      )}

      {/* Pending Payments List */}
      <GlassCard>
        <h3 className="font-semibold mb-4 flex items-center gap-2">
          <Clock className="w-5 h-5 text-warning" />
          Pagamentos Pendentes
        </h3>
        
        {pendingPayments.length === 0 ? (
          <p className="text-muted-foreground text-center py-4">
            Nenhum pagamento pendente.
          </p>
        ) : (
          <div className="space-y-3">
            {pendingPayments.map((payment) => (
              <div key={payment.id} className="p-4 bg-secondary/30 rounded-lg space-y-3">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="font-medium">{payment.staff_name}</p>
                    <p className="text-xs text-muted-foreground">
                      Reserva: {payment.reservation_id}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {formatDate(payment.cleaning_date)}
                    </p>
                  </div>
                  <Badge variant="outline" className="text-warning border-warning">
                    Pendente
                  </Badge>
                </div>

                <div className="grid grid-cols-3 gap-2 text-sm">
                  <div>
                    <p className="text-muted-foreground text-xs flex items-center gap-1">
                      <Briefcase className="w-3 h-3" /> Serviço
                    </p>
                    <p className="font-medium">{formatCurrency(payment.service_fee)}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground text-xs flex items-center gap-1">
                      <Bus className="w-3 h-3" /> Transporte
                    </p>
                    <p className="font-medium">{formatCurrency(payment.transport_fee)}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground text-xs">Total</p>
                    <p className="font-bold text-primary">{formatCurrency(payment.total)}</p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  {payment.photo_urls && payment.photo_urls.length > 0 && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setSelectedPhoto(payment.photo_urls![0])}
                    >
                      <Eye className="w-4 h-4 mr-1" />
                      Ver Foto
                    </Button>
                  )}
                  <Button
                    size="sm"
                    className="ml-auto"
                    onClick={() => openConfirmDialog(payment)}
                    disabled={processingId === payment.id}
                  >
                    {processingId === payment.id ? (
                      <Loader2 className="w-4 h-4 animate-spin mr-1" />
                    ) : (
                      <CheckCircle className="w-4 h-4 mr-1" />
                    )}
                    Confirmar Pagamento
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </GlassCard>

      {/* Paid Payments List */}
      <GlassCard>
        <h3 className="font-semibold mb-4 flex items-center gap-2">
          <CheckCircle className="w-5 h-5 text-success" />
          Histórico de Pagamentos
        </h3>
        
        {paidPayments.length === 0 ? (
          <p className="text-muted-foreground text-center py-4">
            Nenhum pagamento registrado.
          </p>
        ) : (
          <div className="space-y-3">
            {paidPayments.map((payment) => (
              <div key={payment.id} className="p-4 bg-secondary/30 rounded-lg">
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <p className="font-medium">{payment.staff_name}</p>
                    <p className="text-xs text-muted-foreground">
                      Limpeza: {formatDate(payment.cleaning_date)}
                    </p>
                    {payment.paid_date && (
                      <p className="text-xs text-success">
                        Pago em: {formatDate(payment.paid_date)}
                      </p>
                    )}
                  </div>
                  <div className="text-right">
                    <Badge variant="outline" className="text-success border-success">
                      Pago
                    </Badge>
                    <p className="font-bold mt-1">{formatCurrency(payment.total)}</p>
                  </div>
                </div>
                <div className="flex gap-4 text-xs text-muted-foreground border-t border-border pt-2 mt-2">
                  <span className="flex items-center gap-1">
                    <Briefcase className="w-3 h-3" />
                    Serviço: {formatCurrency(payment.service_fee)}
                  </span>
                  <span className="flex items-center gap-1">
                    <Bus className="w-3 h-3" />
                    Transporte: {formatCurrency(payment.transport_fee)}
                  </span>
                  {payment.payment_proof_url && (
                    <Button
                      variant="ghost"
                      size="sm"
                      className="ml-auto h-5 px-2 text-xs"
                      onClick={() => setSelectedPhoto(payment.payment_proof_url!)}
                    >
                      <Upload className="w-3 h-3 mr-1" />
                      Comprovante
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </GlassCard>

      {/* Photo Dialog */}
      <Dialog open={!!selectedPhoto} onOpenChange={() => setSelectedPhoto(null)}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <ImageIcon className="w-5 h-5" />
              Visualização
            </DialogTitle>
          </DialogHeader>
          {selectedPhoto && (
            <img 
              src={selectedPhoto} 
              alt="Foto" 
              className="w-full rounded-lg"
            />
          )}
        </DialogContent>
      </Dialog>

      {/* Payment Confirmation Dialog */}
      <Dialog open={confirmDialogOpen} onOpenChange={setConfirmDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <CheckCircle className="w-5 h-5 text-success" />
              Confirmar Pagamento
            </DialogTitle>
            <DialogDescription>
              Envie o comprovante de pagamento para confirmar.
            </DialogDescription>
          </DialogHeader>
          
          {selectedPayment && (
            <div className="space-y-4">
              <div className="p-3 bg-secondary/30 rounded-lg space-y-2">
                <p className="font-medium">{selectedPayment.staff_name}</p>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div>
                    <p className="text-muted-foreground text-xs flex items-center gap-1">
                      <Briefcase className="w-3 h-3" /> Serviço
                    </p>
                    <p className="font-medium">{formatCurrency(selectedPayment.service_fee)}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground text-xs flex items-center gap-1">
                      <Bus className="w-3 h-3" /> Transporte
                    </p>
                    <p className="font-medium">{formatCurrency(selectedPayment.transport_fee)}</p>
                  </div>
                </div>
                <div className="pt-2 border-t border-border">
                  <p className="text-sm">
                    <span className="text-muted-foreground">Total:</span>
                    <span className="font-bold text-primary ml-2">
                      {formatCurrency(selectedPayment.total)}
                    </span>
                  </p>
                </div>
              </div>

              <div className="space-y-2">
                <Label className="flex items-center gap-2">
                  <Upload className="w-4 h-4" />
                  Comprovante de Pagamento *
                </Label>
                <PhotoUpload
                  photos={proofPhotos}
                  onPhotosChange={setProofPhotos}
                  maxPhotos={1}
                />
                <p className="text-xs text-muted-foreground">
                  Obrigatório: Envie o comprovante para confirmar o pagamento
                </p>
              </div>
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setConfirmDialogOpen(false)}>
              Cancelar
            </Button>
            <Button 
              onClick={handleConfirmPayment}
              disabled={processingId !== null || proofPhotos.length === 0}
            >
              {processingId ? (
                <Loader2 className="w-4 h-4 animate-spin mr-1" />
              ) : (
                <CheckCircle className="w-4 h-4 mr-1" />
              )}
              Confirmar Pagamento
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
