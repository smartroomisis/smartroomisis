import { useState, useEffect, useRef } from "react";
import { GlassCard } from "@/components/GlassCard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { toast } from "@/hooks/use-toast";
import { 
  FileText, 
  Calendar, 
  Plus, 
  Check, 
  Upload,
  Trash2,
  Save,
  Camera,
  Loader2
} from "lucide-react";
import { format } from "date-fns";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

interface DASPayment {
  id: string;
  referenceMonth: string;
  value: number;
  paymentDate: string | null;
  proofUrl: string | null;
  isPaid: boolean;
}

const STORAGE_KEY = "smart_room_das_payments";

const MONTHS = [
  "Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho",
  "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"
];

function getStoredPayments(): DASPayment[] {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      return JSON.parse(stored);
    }
  } catch {
    console.error("Error loading DAS payments");
  }
  return [];
}

function savePayments(payments: DASPayment[]): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(payments));
}

export function DASMEIControl() {
  const [payments, setPayments] = useState<DASPayment[]>([]);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [newPayment, setNewPayment] = useState({
    referenceMonth: `${MONTHS[new Date().getMonth()]}/${new Date().getFullYear()}`,
    value: 71.60
  });
  const [uploadingId, setUploadingId] = useState<string | null>(null);
  const [tempProofUrl, setTempProofUrl] = useState<string>("");
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setPayments(getStoredPayments());
  }, []);

  const handleAddPayment = () => {
    const payment: DASPayment = {
      id: crypto.randomUUID(),
      referenceMonth: newPayment.referenceMonth,
      value: newPayment.value,
      paymentDate: null,
      proofUrl: null,
      isPaid: false
    };

    const updated = [...payments, payment];
    setPayments(updated);
    savePayments(updated);
    setIsAddDialogOpen(false);
    
    toast({
      title: "DAS Adicionado",
      description: `DAS de ${payment.referenceMonth} adicionado com sucesso.`
    });
  };

  const handleMarkAsPaid = (id: string) => {
    const updated = payments.map(p => {
      if (p.id === id) {
        return {
          ...p,
          isPaid: true,
          paymentDate: format(new Date(), "yyyy-MM-dd"),
          proofUrl: tempProofUrl || p.proofUrl
        };
      }
      return p;
    });
    setPayments(updated);
    savePayments(updated);
    setUploadingId(null);
    setTempProofUrl("");
    
    toast({
      title: "Pagamento Confirmado",
      description: "DAS marcado como pago com sucesso."
    });
  };

  const handleDeletePayment = (id: string) => {
    const updated = payments.filter(p => p.id !== id);
    setPayments(updated);
    savePayments(updated);
    
    toast({
      title: "DAS Removido",
      description: "Registro removido com sucesso."
    });
  };

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setIsUploading(true);
    const file = files[0];
    
    const reader = new FileReader();
    const base64 = await new Promise<string>((resolve) => {
      reader.onload = () => resolve(reader.result as string);
      reader.readAsDataURL(file);
    });
    
    setTempProofUrl(base64);
    setIsUploading(false);
    
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(value);
  };

  const currentYear = new Date().getFullYear();
  const totalPaidThisYear = payments
    .filter(p => p.isPaid && p.referenceMonth.includes(currentYear.toString()))
    .reduce((sum, p) => sum + p.value, 0);

  const pendingPayments = payments.filter(p => !p.isPaid);
  const paidPayments = payments.filter(p => p.isPaid);

  return (
    <div className="space-y-6">
      {/* Header */}
      <GlassCard className="p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <FileText className="w-5 h-5 text-primary" />
            <h3 className="text-lg font-semibold">Controle DAS-MEI</h3>
          </div>
          
          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogTrigger asChild>
              <Button size="sm">
                <Plus className="w-4 h-4 mr-2" />
                Adicionar DAS
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Adicionar DAS-MEI</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 pt-4">
                <div className="space-y-2">
                  <Label>Mês de Referência</Label>
                  <Input
                    value={newPayment.referenceMonth}
                    onChange={(e) => setNewPayment(prev => ({ ...prev, referenceMonth: e.target.value }))}
                    placeholder="Ex: Janeiro/2024"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Valor (R$)</Label>
                  <Input
                    type="number"
                    step="0.01"
                    value={newPayment.value}
                    onChange={(e) => setNewPayment(prev => ({ ...prev, value: parseFloat(e.target.value) || 0 }))}
                  />
                </div>
                <Button onClick={handleAddPayment} className="w-full">
                  <Save className="w-4 h-4 mr-2" />
                  Salvar
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <div className="p-4 rounded-lg bg-primary/10 border border-primary/30">
            <p className="text-sm text-muted-foreground">Total Pago em {currentYear}</p>
            <p className="text-2xl font-bold text-primary">{formatCurrency(totalPaidThisYear)}</p>
          </div>
          <div className="p-4 rounded-lg bg-warning/10 border border-warning/30">
            <p className="text-sm text-muted-foreground">Pendentes</p>
            <p className="text-2xl font-bold text-warning">{pendingPayments.length} meses</p>
          </div>
        </div>
      </GlassCard>

      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileSelect}
        className="hidden"
      />

      {/* Pending Payments */}
      {pendingPayments.length > 0 && (
        <GlassCard className="p-6">
          <h4 className="text-md font-semibold mb-4 text-warning">Pagamentos Pendentes</h4>
          <div className="space-y-3">
            {pendingPayments.map(payment => (
              <div key={payment.id} className="p-4 rounded-lg bg-warning/5 border border-warning/20">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-warning" />
                      <span className="font-medium">{payment.referenceMonth}</span>
                      <Badge variant="outline" className="text-warning border-warning">
                        Pendente
                      </Badge>
                    </div>
                    <p className="text-lg font-bold mt-1">{formatCurrency(payment.value)}</p>
                  </div>
                  <div className="flex gap-2">
                    {uploadingId === payment.id ? (
                      <div className="space-y-2">
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => fileInputRef.current?.click()}
                          disabled={isUploading}
                        >
                          {isUploading ? (
                            <Loader2 className="w-4 h-4 mr-1 animate-spin" />
                          ) : (
                            <Camera className="w-4 h-4 mr-1" />
                          )}
                          {tempProofUrl ? "Alterar" : "Comprovante"}
                        </Button>
                        {tempProofUrl && (
                          <p className="text-xs text-success">✓ Foto anexada</p>
                        )}
                        <div className="flex gap-2">
                          <Button 
                            size="sm" 
                            onClick={() => handleMarkAsPaid(payment.id)}
                            disabled={!tempProofUrl}
                          >
                            <Check className="w-4 h-4 mr-1" />
                            Confirmar
                          </Button>
                          <Button 
                            size="sm" 
                            variant="ghost"
                            onClick={() => {
                              setUploadingId(null);
                              setTempProofUrl("");
                            }}
                          >
                            Cancelar
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <>
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => setUploadingId(payment.id)}
                        >
                          <Upload className="w-4 h-4 mr-1" />
                          Pagar
                        </Button>
                        <Button 
                          size="sm" 
                          variant="ghost"
                          onClick={() => handleDeletePayment(payment.id)}
                        >
                          <Trash2 className="w-4 h-4 text-destructive" />
                        </Button>
                      </>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </GlassCard>
      )}

      {/* Paid Payments */}
      {paidPayments.length > 0 && (
        <GlassCard className="p-6">
          <h4 className="text-md font-semibold mb-4 text-success">Pagamentos Realizados</h4>
          <div className="space-y-3">
            {paidPayments.map(payment => (
              <div key={payment.id} className="p-4 rounded-lg bg-success/5 border border-success/20">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-success" />
                      <span className="font-medium">{payment.referenceMonth}</span>
                      <Badge variant="outline" className="text-success border-success">
                        <Check className="w-3 h-3 mr-1" />
                        Pago
                      </Badge>
                    </div>
                    <p className="text-lg font-bold mt-1">{formatCurrency(payment.value)}</p>
                    {payment.paymentDate && (
                      <p className="text-xs text-muted-foreground mt-1">
                        Pago em: {format(new Date(payment.paymentDate), "dd/MM/yyyy")}
                      </p>
                    )}
                  </div>
                  {payment.proofUrl && (
                    <a 
                      href={payment.proofUrl} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-xs text-primary hover:underline"
                    >
                      Ver Comprovante
                    </a>
                  )}
                </div>
              </div>
            ))}
          </div>
        </GlassCard>
      )}
    </div>
  );
}