import { useState, useEffect } from "react";
import { GlassCard } from "@/components/GlassCard";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  Wallet, 
  Clock, 
  TrendingDown, 
  TrendingUp, 
  History,
  Crown,
  Building2
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

interface CreditTransaction {
  id: string;
  amount: number;
  type: string;
  description: string | null;
  created_at: string;
}

const planBadges = {
  basic: { label: "Basic", className: "bg-muted text-muted-foreground" },
  pro: { label: "Pro", className: "bg-primary/20 text-primary border-primary/30" },
  executive: { label: "Executive", className: "bg-accent/20 text-accent border-accent/30" },
  enterprise: { label: "Enterprise", className: "bg-warning/20 text-warning border-warning/30" },
};

export function WalletBalance() {
  const { profile, isEnterprise } = useAuth();
  const [transactions, setTransactions] = useState<CreditTransaction[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchTransactions = async () => {
    if (!profile) return;
    
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("credit_transactions")
        .select("*")
        .eq("user_id", profile.id)
        .order("created_at", { ascending: false })
        .limit(20);

      if (error) throw error;
      setTransactions(data || []);
    } catch (error) {
      console.error("Error fetching transactions:", error);
    } finally {
      setLoading(false);
    }
  };

  if (!profile) return null;

  const planBadge = planBadges[profile.current_plan];

  return (
    <GlassCard className="p-4">
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-primary/10">
            {isEnterprise ? (
              <Building2 className="w-5 h-5 text-warning" />
            ) : (
              <Wallet className="w-5 h-5 text-primary" />
            )}
          </div>
          <div>
            <h3 className="font-semibold">Saldo de Horas</h3>
            <Badge variant="outline" className={planBadge.className}>
              {profile.current_plan === "enterprise" && <Crown className="w-3 h-3 mr-1" />}
              {planBadge.label}
            </Badge>
          </div>
        </div>

        <Dialog>
          <DialogTrigger asChild>
            <Button 
              variant="ghost" 
              size="sm" 
              className="gap-1"
              onClick={fetchTransactions}
            >
              <History className="w-4 h-4" />
              Histórico
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Histórico de Créditos</DialogTitle>
            </DialogHeader>
            <div className="max-h-80 overflow-y-auto space-y-2">
              {loading ? (
                <p className="text-center text-muted-foreground py-4">Carregando...</p>
              ) : transactions.length === 0 ? (
                <p className="text-center text-muted-foreground py-4">
                  Nenhuma transação encontrada
                </p>
              ) : (
                transactions.map((tx) => (
                  <div 
                    key={tx.id}
                    className="flex items-center justify-between p-3 rounded-lg bg-secondary/50"
                  >
                    <div className="flex items-center gap-2">
                      {tx.amount > 0 ? (
                        <TrendingUp className="w-4 h-4 text-success" />
                      ) : (
                        <TrendingDown className="w-4 h-4 text-destructive" />
                      )}
                      <div>
                        <p className="text-sm font-medium">
                          {tx.description || tx.type}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {format(new Date(tx.created_at), "dd MMM yyyy, HH:mm", { locale: ptBR })}
                        </p>
                      </div>
                    </div>
                    <span className={tx.amount > 0 ? "text-success font-medium" : "text-destructive font-medium"}>
                      {tx.amount > 0 ? "+" : ""}{tx.amount}h
                    </span>
                  </div>
                ))
              )}
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {isEnterprise ? (
        <div className="text-center py-4">
          <p className="text-2xl font-bold text-warning">Uso Corporativo</p>
          <p className="text-sm text-muted-foreground">
            Faturamento por contrato
          </p>
        </div>
      ) : (
        <div className="flex items-center justify-center gap-2 py-4">
          <Clock className="w-6 h-6 text-primary" />
          <span className="text-3xl font-bold">{profile.credit_hours}</span>
          <span className="text-muted-foreground">horas</span>
        </div>
      )}

      {profile.current_plan === "basic" && (
        <p className="text-xs text-center text-muted-foreground mt-2">
          Plano on-demand • Pagamento por reserva
        </p>
      )}
    </GlassCard>
  );
}
