import { useState, useEffect, useRef } from "react";
import { GlassCard } from "@/components/GlassCard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { toast } from "@/hooks/use-toast";
import { 
  FileText, 
  Calendar as CalendarIcon, 
  Plus, 
  Check, 
  Upload,
  Trash2,
  Save,
  Camera,
  Loader2,
  AlertTriangle,
  Clock,
  Bell
} from "lucide-react";
import { format, getDate, getMonth, getYear, isSameMonth, startOfMonth, endOfMonth, eachDayOfInterval, addMonths, subMonths, isSameDay } from "date-fns";
import { ptBR } from "date-fns/locale";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { supabase } from "@/integrations/supabase/client";

interface DASPayment {
  id: string;
  referenceMonth: string;
  value: number;
  paymentDate: string | null;
  proofUrl: string | null;
  isPaid: boolean;
}

type PaymentStatus = 'paid' | 'pending' | 'alert' | 'overdue';

const STORAGE_KEY = "smart_room_das_payments";

const MONTHS = [
  "Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho",
  "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"
];

async function getStoredPayments(): Promise<DASPayment[]> {
  const { data } = await supabase
    .from("system_config")
    .select("value")
    .eq("key", STORAGE_KEY)
    .single();
  if (data?.value && Array.isArray(data.value)) {
    return data.value as unknown as DASPayment[];
  }
  return [];
}

async function savePayments(payments: DASPayment[]): Promise<void> {
  await supabase.from("system_config").upsert({
    key: STORAGE_KEY,
    value: JSON.parse(JSON.stringify(payments)),
    updated_at: new Date().toISOString(),
  });
}

// Helper to get payment status based on current date
function getPaymentStatus(payment: DASPayment): PaymentStatus {
  if (payment.isPaid) return 'paid';
  
  const now = new Date();
  const currentDay = getDate(now);
  
  // Parse reference month
  const parts = payment.referenceMonth.split('/');
  if (parts.length !== 2) return 'pending';
  
  const monthName = parts[0];
  const year = parseInt(parts[1]);
  const monthIndex = MONTHS.indexOf(monthName);
  
  if (monthIndex === -1 || isNaN(year)) return 'pending';
  
  // Check if we're in the same month as the reference
  const refDate = new Date(year, monthIndex, 1);
  const isCurrentRefMonth = isSameMonth(now, refDate);
  
  // Payment is due for the FOLLOWING month (e.g., January DAS is paid in February)
  const dueMonth = addMonths(refDate, 1);
  const isInDueMonth = isSameMonth(now, dueMonth);
  const isPastDueMonth = now > endOfMonth(dueMonth);
  
  if (isPastDueMonth) {
    return 'overdue';
  }
  
  if (isInDueMonth) {
    if (currentDay >= 20) {
      return 'overdue';
    } else if (currentDay >= 15) {
      return 'alert';
    }
  }
  
  return 'pending';
}

// Get status badge config
function getStatusBadgeConfig(status: PaymentStatus) {
  switch (status) {
    case 'paid':
      return { label: 'Pago', variant: 'outline' as const, className: 'text-success border-success' };
    case 'alert':
      return { label: 'Alerta: Vencimento Próximo', variant: 'outline' as const, className: 'text-yellow-500 border-yellow-500 bg-yellow-500/10' };
    case 'overdue':
      return { label: 'Atrasado', variant: 'destructive' as const, className: 'bg-destructive text-destructive-foreground' };
    default:
      return { label: 'Pendente', variant: 'outline' as const, className: 'text-warning border-warning' };
  }
}

// Trigger webhook for n8n notifications
async function triggerDASWebhook(payments: DASPayment[], type: 'day15' | 'day20') {
  try {
    const pendingPayments = payments.filter(p => !p.isPaid);
    const statuses = pendingPayments.map(p => ({
      referenceMonth: p.referenceMonth,
      value: p.value,
      status: getPaymentStatus(p),
    }));
    
    const response = await supabase.functions.invoke('das-notification-webhook', {
      body: {
        type,
        payments: statuses,
        date: new Date().toISOString(),
      }
    });
    
    console.log('Webhook triggered:', response);
    return response;
  } catch (error) {
    console.error('Error triggering webhook:', error);
  }
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
  const [calendarMonth, setCalendarMonth] = useState(new Date());
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    getStoredPayments().then(setPayments);
  }, []);

  // Check if webhook should be triggered on day 15 or 20
  useEffect(() => {
    const now = new Date();
    const currentDay = getDate(now);
    const lastTriggerKey = `das_webhook_${getMonth(now)}_${getYear(now)}`;
    const lastTrigger = localStorage.getItem(lastTriggerKey);
    
    if ((currentDay === 15 || currentDay === 20) && lastTrigger !== currentDay.toString()) {
      const type = currentDay === 15 ? 'day15' : 'day20';
      triggerDASWebhook(payments, type);
      localStorage.setItem(lastTriggerKey, currentDay.toString());
    }
  }, [payments]);

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

  // Generate calendar days
  const calendarDays = eachDayOfInterval({
    start: startOfMonth(calendarMonth),
    end: endOfMonth(calendarMonth)
  });

  const firstDayOfWeek = startOfMonth(calendarMonth).getDay();
  const emptyDays = Array(firstDayOfWeek).fill(null);

  const isDueDate = (day: Date) => getDate(day) === 20;
  const isAlertDate = (day: Date) => getDate(day) === 15;
  const isToday = (day: Date) => isSameDay(day, new Date());

  // Manual webhook trigger for testing
  const handleManualWebhookTrigger = async (type: 'day15' | 'day20') => {
    await triggerDASWebhook(payments, type);
    toast({
      title: "Webhook Disparado",
      description: `Notificação ${type === 'day15' ? 'dia 15' : 'dia 20'} enviada.`
    });
  };

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

      {/* Fiscal Calendar */}
      <GlassCard className="p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <CalendarIcon className="w-5 h-5 text-primary" />
            <h3 className="text-lg font-semibold">Calendário Fiscal</h3>
          </div>
          <div className="flex gap-2">
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => setCalendarMonth(subMonths(calendarMonth, 1))}
            >
              ←
            </Button>
            <span className="px-4 py-1 text-sm font-medium">
              {format(calendarMonth, 'MMMM yyyy', { locale: ptBR })}
            </span>
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => setCalendarMonth(addMonths(calendarMonth, 1))}
            >
              →
            </Button>
          </div>
        </div>

        {/* Calendar Grid */}
        <div className="grid grid-cols-7 gap-1 mb-4">
          {['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'].map(day => (
            <div key={day} className="text-center text-xs text-muted-foreground py-2 font-medium">
              {day}
            </div>
          ))}
          {emptyDays.map((_, i) => (
            <div key={`empty-${i}`} className="h-10" />
          ))}
          {calendarDays.map(day => {
            const dayNumber = getDate(day);
            const isDue = isDueDate(day);
            const isAlert = isAlertDate(day);
            const today = isToday(day);
            
            return (
              <div
                key={day.toISOString()}
                className={`
                  h-10 flex items-center justify-center rounded-md text-sm relative
                  ${today ? 'bg-primary text-primary-foreground font-bold' : ''}
                  ${isDue && !today ? 'bg-destructive/20 text-destructive font-bold border border-destructive/50' : ''}
                  ${isAlert && !today && !isDue ? 'bg-yellow-500/20 text-yellow-600 font-medium border border-yellow-500/50' : ''}
                  ${!isDue && !isAlert && !today ? 'hover:bg-secondary/50' : ''}
                `}
              >
                {dayNumber}
                {isDue && (
                  <span className="absolute -top-1 -right-1 w-2 h-2 bg-destructive rounded-full" />
                )}
                {isAlert && !isDue && (
                  <span className="absolute -top-1 -right-1 w-2 h-2 bg-yellow-500 rounded-full" />
                )}
              </div>
            );
          })}
        </div>

        {/* Legend */}
        <div className="flex flex-wrap gap-4 text-xs border-t border-border pt-4">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded bg-yellow-500/20 border border-yellow-500/50" />
            <span className="text-muted-foreground">Dia 15 - Alerta</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded bg-destructive/20 border border-destructive/50" />
            <span className="text-muted-foreground">Dia 20 - Vencimento DAS</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded bg-primary" />
            <span className="text-muted-foreground">Hoje</span>
          </div>
        </div>

        {/* Manual Webhook Triggers (for testing) */}
        <div className="mt-4 pt-4 border-t border-border">
          <p className="text-xs text-muted-foreground mb-2 flex items-center gap-1">
            <Bell className="w-3 h-3" />
            Disparar Notificação Manual (n8n/Webhook)
          </p>
          <div className="flex gap-2">
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => handleManualWebhookTrigger('day15')}
            >
              <AlertTriangle className="w-3 h-3 mr-1 text-yellow-500" />
              Notificação Dia 15
            </Button>
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => handleManualWebhookTrigger('day20')}
            >
              <Clock className="w-3 h-3 mr-1 text-destructive" />
              Notificação Dia 20
            </Button>
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
            {pendingPayments.map(payment => {
              const status = getPaymentStatus(payment);
              const badgeConfig = getStatusBadgeConfig(status);
              
              return (
                <div 
                  key={payment.id} 
                  className={`
                    p-4 rounded-lg border
                    ${status === 'overdue' ? 'bg-destructive/10 border-destructive/30' : ''}
                    ${status === 'alert' ? 'bg-yellow-500/10 border-yellow-500/30' : ''}
                    ${status === 'pending' ? 'bg-warning/5 border-warning/20' : ''}
                  `}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <CalendarIcon className={`w-4 h-4 ${status === 'overdue' ? 'text-destructive' : status === 'alert' ? 'text-yellow-500' : 'text-warning'}`} />
                        <span className="font-medium">{payment.referenceMonth}</span>
                        <Badge variant={badgeConfig.variant} className={badgeConfig.className}>
                          {status === 'alert' && <AlertTriangle className="w-3 h-3 mr-1" />}
                          {status === 'overdue' && <Clock className="w-3 h-3 mr-1" />}
                          {badgeConfig.label}
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
              );
            })}
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
                      <CalendarIcon className="w-4 h-4 text-success" />
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

// Export function for other components to access DAS paid amount
export async function getDASPaidThisYear(): Promise<number> {
  const payments = await getStoredPayments();
  const currentYear = new Date().getFullYear();
  return payments
    .filter(p => p.isPaid && p.referenceMonth.includes(currentYear.toString()))
    .reduce((sum, p) => sum + p.value, 0);
}
