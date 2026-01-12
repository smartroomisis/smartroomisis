import { useState, useRef } from "react";
import { GlassCard } from "@/components/GlassCard";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { toast } from "@/hooks/use-toast";
import { useStaffPayments, StaffPayment } from "@/hooks/useStaffPayments";
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
  Upload,
  XCircle
} from "lucide-react";

export function StaffPayments() {
  const {
    payments,
    pendingPayments,
    paidPayments,
    totalPending,
    totalPaid,
    isLoading,
    isUploading,
    confirmPayment,
    cancelPayment,
  } = useStaffPayments();

  const [selectedPhoto, setSelectedPhoto] = useState<string | null>(null);
  const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);
  const [selectedPayment, setSelectedPayment] = useState<StaffPayment | null>(null);
  const [proofFile, setProofFile] = useState<File | null>(null);
  const [processingId, setProcessingId] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Group by staff
  const pendingByStaff = pendingPayments.reduce((acc, p) => {
    const name = p.staff_name || "Desconhecido";
    if (!acc[name]) {
      acc[name] = { count: 0, total: 0 };
    }
    acc[name].count++;
    acc[name].total += Number(p.amount);
    return acc;
  }, {} as Record<string, { count: number; total: number }>);

  const openConfirmDialog = (payment: StaffPayment) => {
    setSelectedPayment(payment);
    setProofFile(null);
    setConfirmDialogOpen(true);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setProofFile(file);
    }
  };

  const handleConfirmPayment = async () => {
    if (!selectedPayment || !proofFile) {
      toast({
        title: "Comprovante Obrigatório",
        description: "Por favor, envie o comprovante de pagamento antes de confirmar.",
        variant: "destructive",
      });
      return;
    }

    setProcessingId(selectedPayment.id);
    
    const success = await confirmPayment(selectedPayment.id, proofFile, "PIX");
    
    if (success) {
      setConfirmDialogOpen(false);
      setSelectedPayment(null);
      setProofFile(null);
    }
    
    setProcessingId(null);
  };

  const handleCancelPayment = async (paymentId: string) => {
    setProcessingId(paymentId);
    await cancelPayment(paymentId);
    setProcessingId(null);
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

  const getFeeTypeLabel = (type: string) => {
    const labels: Record<string, string> = {
      cleaning: "Limpeza",
      extra_service: "Serviço Extra",
      bonus: "Bônus",
      other: "Outro",
    };
    return labels[type] || type;
  };

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
          <p className="text-2xl font-bold text-success">{formatCurrency(totalPaid)}</p>
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
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <User className="w-5 h-5 text-muted-foreground" />
                    <span>{name}</span>
                    <Badge variant="secondary">{data.count} serviço(s)</Badge>
                  </div>
                  <span className="font-bold text-warning">{formatCurrency(data.total)}</span>
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
                      {getFeeTypeLabel(payment.fee_type)}
                    </p>
                    {payment.description && (
                      <p className="text-xs text-muted-foreground">
                        {payment.description}
                      </p>
                    )}
                    <p className="text-xs text-muted-foreground">
                      {formatDate(payment.created_at)}
                    </p>
                  </div>
                  <div className="text-right">
                    <Badge variant="outline" className="text-warning border-warning">
                      {payment.status === "approved" ? "Aprovado" : "Pendente"}
                    </Badge>
                    <p className="font-bold text-primary mt-1">{formatCurrency(Number(payment.amount))}</p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleCancelPayment(payment.id)}
                    disabled={processingId === payment.id}
                  >
                    <XCircle className="w-4 h-4 mr-1" />
                    Cancelar
                  </Button>
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
                      {getFeeTypeLabel(payment.fee_type)} - {payment.description || ""}
                    </p>
                    {payment.paid_at && (
                      <p className="text-xs text-success">
                        Pago em: {formatDate(payment.paid_at)}
                      </p>
                    )}
                  </div>
                  <div className="text-right">
                    <Badge variant="outline" className="text-success border-success">
                      Pago
                    </Badge>
                    <p className="font-bold mt-1">{formatCurrency(Number(payment.amount))}</p>
                  </div>
                </div>
                {payment.payment_proof_url && (
                  <div className="flex justify-end">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-5 px-2 text-xs"
                      onClick={() => setSelectedPhoto(payment.payment_proof_url!)}
                    >
                      <Eye className="w-3 h-3 mr-1" />
                      Ver Comprovante
                    </Button>
                  </div>
                )}
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
              alt="Comprovante" 
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
                <p className="text-sm text-muted-foreground">
                  {getFeeTypeLabel(selectedPayment.fee_type)}
                </p>
                <div className="pt-2 border-t border-border">
                  <p className="text-sm">
                    <span className="text-muted-foreground">Total:</span>
                    <span className="font-bold text-primary ml-2">
                      {formatCurrency(Number(selectedPayment.amount))}
                    </span>
                  </p>
                </div>
              </div>

              <div className="space-y-2">
                <Label className="flex items-center gap-2">
                  <Upload className="w-4 h-4" />
                  Comprovante de Pagamento *
                </Label>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*,application/pdf"
                  onChange={handleFileChange}
                  className="hidden"
                />
                <Button
                  type="button"
                  variant="outline"
                  className="w-full"
                  onClick={() => fileInputRef.current?.click()}
                >
                  {proofFile ? proofFile.name : "Selecionar Arquivo"}
                </Button>
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
              disabled={processingId !== null || !proofFile || isUploading}
            >
              {isUploading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin mr-1" />
                  Enviando...
                </>
              ) : (
                <>
                  <CheckCircle className="w-4 h-4 mr-1" />
                  Confirmar
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
