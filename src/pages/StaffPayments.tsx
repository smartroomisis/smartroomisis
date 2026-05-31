import { useState, useEffect } from "react";
import { GlassCard } from "@/components/GlassCard";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { 
  Wallet, 
  Calendar,
  CheckCircle,
  Clock,
  DollarSign
} from "lucide-react";

interface Payment {
  id: string;
  date: string;
  amount: number;
  status: "paid" | "pending";
  description: string;
}

export default function StaffPayments() {
  const { user } = useAuth();
  const [payments, setPayments] = useState<Payment[]>([]);

  useEffect(() => {
    if (!user) return;

    const fetchPayments = async () => {
      const { data, error } = await supabase
        .from("staff_payments")
        .select("id, amount, status, description, payment_date, created_at")
        .eq("staff_id", user.id)
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Error fetching staff payments:", error);
        return;
      }

      setPayments(
        (data ?? []).map((p) => ({
          id: p.id,
          date: p.payment_date ?? p.created_at,
          amount: Number(p.amount) || 0,
          status: p.status === "paid" ? "paid" : "pending",
          description: p.description ?? "",
        }))
      );
    };

    fetchPayments();
  }, [user]);

  const totalPending = payments
    .filter(p => p.status === "pending")
    .reduce((sum, p) => sum + p.amount, 0);

  const totalPaid = payments
    .filter(p => p.status === "paid")
    .reduce((sum, p) => sum + p.amount, 0);

  const formatCurrency = (value: number) => {
    return value.toLocaleString("pt-BR", {
      style: "currency",
      currency: "BRL",
    });
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString("pt-BR");
  };

  return (
    <div className="min-h-screen pb-24 md:pt-20 md:pb-8 theme-admin">
      <div className="container mx-auto px-4 py-6 max-w-2xl">
        {/* Page Title */}
        <div className="mb-6">
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Wallet className="w-6 h-6 text-primary" />
            Meus Pagamentos
          </h2>
          <p className="text-muted-foreground text-sm">
            Histórico de pagamentos por serviços realizados
          </p>
        </div>

        <div className="space-y-5">
          {/* Summary Cards */}
          <div className="grid grid-cols-2 gap-4">
            <GlassCard className="text-center">
              <div className="flex flex-col items-center gap-2">
                <div className="p-3 rounded-full bg-warning/20">
                  <Clock className="w-5 h-5 text-warning" />
                </div>
                <p className="text-xs text-muted-foreground">Pendente</p>
                <p className="text-xl font-bold text-warning">{formatCurrency(totalPending)}</p>
              </div>
            </GlassCard>
            
            <GlassCard className="text-center">
              <div className="flex flex-col items-center gap-2">
                <div className="p-3 rounded-full bg-success/20">
                  <CheckCircle className="w-5 h-5 text-success" />
                </div>
                <p className="text-xs text-muted-foreground">Total Recebido</p>
                <p className="text-xl font-bold text-success">{formatCurrency(totalPaid)}</p>
              </div>
            </GlassCard>
          </div>

          {/* Payment History */}
          <GlassCard className="space-y-4">
            <h3 className="text-lg font-semibold flex items-center gap-2">
              <Calendar className="w-5 h-5 text-primary" />
              Histórico
            </h3>
            
            <div className="space-y-3">
              {payments.map((payment) => (
                <div 
                  key={payment.id}
                  className="flex items-center justify-between p-3 rounded-lg bg-secondary/30"
                >
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-full ${
                      payment.status === "paid" 
                        ? "bg-success/20" 
                        : "bg-warning/20"
                    }`}>
                      <DollarSign className={`w-4 h-4 ${
                        payment.status === "paid" 
                          ? "text-success" 
                          : "text-warning"
                      }`} />
                    </div>
                    <div>
                      <p className="font-medium text-sm">{payment.description}</p>
                      <p className="text-xs text-muted-foreground">{formatDate(payment.date)}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-bold">{formatCurrency(payment.amount)}</p>
                    <Badge 
                      variant={payment.status === "paid" ? "default" : "secondary"}
                      className={payment.status === "paid" 
                        ? "bg-success/20 text-success" 
                        : "bg-warning/20 text-warning"
                      }
                    >
                      {payment.status === "paid" ? "Pago" : "Pendente"}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </GlassCard>
        </div>
      </div>
    </div>
  );
}
