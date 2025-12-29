import { useState, useEffect } from "react";
import { GlassCard } from "@/components/GlassCard";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { toast } from "@/hooks/use-toast";
import { 
  DollarSign, 
  User, 
  CheckCircle, 
  Clock, 
  Image as ImageIcon,
  Loader2,
  Eye
} from "lucide-react";

interface StaffPayment {
  id: string;
  staff_name: string;
  reservation_id: string;
  cleaning_date: string;
  insumos_cost: number;
  cleaning_fee: number;
  total: number;
  status: "Pendente" | "Pago";
  paid_date?: string;
  photo_urls?: string[];
}

// Mock data - replace with API call
const mockPayments: StaffPayment[] = [
  {
    id: "pay_001",
    staff_name: "João Silva",
    reservation_id: "res_abc123",
    cleaning_date: "2024-01-15T14:30:00",
    insumos_cost: 12.50,
    cleaning_fee: 30.00,
    total: 42.50,
    status: "Pendente",
    photo_urls: ["https://via.placeholder.com/300x200?text=Sala+Limpa"]
  },
  {
    id: "pay_002",
    staff_name: "Maria Santos",
    reservation_id: "res_def456",
    cleaning_date: "2024-01-15T10:00:00",
    insumos_cost: 7.50,
    cleaning_fee: 30.00,
    total: 37.50,
    status: "Pago",
    paid_date: "2024-01-16T09:00:00",
    photo_urls: ["https://via.placeholder.com/300x200?text=Auditoria"]
  },
];

export function StaffPayments() {
  const [payments, setPayments] = useState<StaffPayment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [processingId, setProcessingId] = useState<string | null>(null);
  const [selectedPhoto, setSelectedPhoto] = useState<string | null>(null);

  useEffect(() => {
    // Simulate API call
    setTimeout(() => {
      setPayments(mockPayments);
      setIsLoading(false);
    }, 500);
  }, []);

  const pendingPayments = payments.filter(p => p.status === "Pendente");
  const paidPayments = payments.filter(p => p.status === "Pago");
  
  const totalPending = pendingPayments.reduce((sum, p) => sum + p.total, 0);

  // Group by staff
  const pendingByStaff = pendingPayments.reduce((acc, p) => {
    if (!acc[p.staff_name]) {
      acc[p.staff_name] = { count: 0, total: 0 };
    }
    acc[p.staff_name].count++;
    acc[p.staff_name].total += p.total;
    return acc;
  }, {} as Record<string, { count: number; total: number }>);

  const handleConfirmPayment = async (paymentId: string) => {
    setProcessingId(paymentId);
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    setPayments(prev => prev.map(p => 
      p.id === paymentId 
        ? { ...p, status: "Pago" as const, paid_date: new Date().toISOString() }
        : p
    ));
    
    setProcessingId(null);
    toast({
      title: "Pagamento Confirmado",
      description: "O status foi atualizado para 'Pago'.",
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
              <div key={name} className="flex items-center justify-between p-3 bg-secondary/30 rounded-lg">
                <div className="flex items-center gap-3">
                  <User className="w-5 h-5 text-muted-foreground" />
                  <span>{name}</span>
                  <Badge variant="secondary">{data.count} limpeza(s)</Badge>
                </div>
                <span className="font-bold text-warning">{formatCurrency(data.total)}</span>
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
                    <p className="text-muted-foreground text-xs">Insumos</p>
                    <p className="font-medium">{formatCurrency(payment.insumos_cost)}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground text-xs">Limpeza</p>
                    <p className="font-medium">{formatCurrency(payment.cleaning_fee)}</p>
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
                    onClick={() => handleConfirmPayment(payment.id)}
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
                <div className="flex items-start justify-between">
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
              Foto da Auditoria
            </DialogTitle>
          </DialogHeader>
          {selectedPhoto && (
            <img 
              src={selectedPhoto} 
              alt="Foto da auditoria" 
              className="w-full rounded-lg"
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
