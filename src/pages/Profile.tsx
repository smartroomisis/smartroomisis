import { useAuth } from "@/hooks/useAuth";
import { WalletBalance } from "@/components/WalletBalance";
import { GlassCard } from "@/components/GlassCard";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { 
  User, 
  Building2, 
  Mail, 
  Phone, 
  CreditCard, 
  LogOut,
  Loader2,
  Crown,
  CalendarDays,
  Clock,
  X
} from "lucide-react";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { cancelReservation } from "@/lib/api";
import { toast } from "@/hooks/use-toast";

interface EnterpriseCompany {
  name: string;
  email_domain: string;
}

interface UserReservation {
  id: string;
  date: string;
  start_time: string;
  end_time: string;
  hours: number;
  status: string;
  refund_reason?: string | null;
}

export default function Profile() {
  const { user, profile, isEnterprise, signOut, loading } = useAuth();
  const [company, setCompany] = useState<EnterpriseCompany | null>(null);
  const [loadingCompany, setLoadingCompany] = useState(false);
  const [reservations, setReservations] = useState<UserReservation[]>([]);
  const [loadingReservations, setLoadingReservations] = useState(false);
  const [cancelTarget, setCancelTarget] = useState<UserReservation | null>(null);
  const [cancelling, setCancelling] = useState(false);

  useEffect(() => {
    if (profile?.enterprise_company_id) {
      fetchCompany(profile.enterprise_company_id);
    }
  }, [profile?.enterprise_company_id]);

  useEffect(() => {
    if (user?.id) {
      fetchReservations(user.id);
    }
  }, [user?.id]);

  const fetchReservations = async (userId: string) => {
    setLoadingReservations(true);
    try {
      const { data, error } = await supabase
        .from("reservations")
        .select("id, date, start_time, end_time, hours, status, refund_reason")
        .eq("user_id", userId)
        .order("created_at", { ascending: false })
        .limit(10);

      if (!error && data) {
        setReservations(data as UserReservation[]);
      }
    } catch (err) {
      console.error("Error fetching reservations:", err);
    } finally {
      setLoadingReservations(false);
    }
  };

  const handleConfirmCancel = async () => {
    if (!cancelTarget) return;
    setCancelling(true);
    try {
      const result = await cancelReservation(cancelTarget.id);
      if (result.success) {
        const refund = result.refundAmount ?? 0;
        toast({
          title: "Reserva cancelada",
          description: `Valor do reembolso: ${refund.toLocaleString("pt-BR", {
            style: "currency",
            currency: "BRL",
          })}`,
        });
        if (user?.id) await fetchReservations(user.id);
      } else {
        toast({
          title: "Erro ao cancelar",
          description: result.error ?? "Tente novamente.",
          variant: "destructive",
        });
      }
    } finally {
      setCancelling(false);
      setCancelTarget(null);
    }
  };



  const getReservationStatusBadge = (status: string) => {
    switch (status) {
      case "confirmed":
        return <Badge className="bg-success/20 text-success">Confirmada</Badge>;
      case "cancelled":
        return <Badge className="bg-destructive/20 text-destructive">Cancelada</Badge>;
      default:
        return <Badge className="bg-warning/20 text-warning">Pendente</Badge>;
    }
  };

  const formatDate = (dateStr: string) =>
    new Date(dateStr + "T00:00:00").toLocaleDateString("pt-BR");

  const formatTime = (timeStr: string) => timeStr?.slice(0, 5) ?? "";

  const fetchCompany = async (companyId: string) => {
    setLoadingCompany(true);
    try {
      const { data, error } = await supabase
        .from("enterprise_companies")
        .select("name, email_domain")
        .eq("id", companyId)
        .single();

      if (!error && data) {
        setCompany(data);
      }
    } catch (err) {
      console.error("Error fetching company:", err);
    } finally {
      setLoadingCompany(false);
    }
  };

  const getPlanBadge = () => {
    switch (profile?.current_plan) {
      case "enterprise":
        return <Badge className="bg-accent text-accent-foreground">Enterprise</Badge>;
      case "executive":
        return <Badge className="bg-primary text-primary-foreground">Executive</Badge>;
      case "pro":
        return <Badge className="bg-primary/80 text-primary-foreground">Pro</Badge>;
      default:
        return <Badge variant="secondary">Basic</Badge>;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center theme-client">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen pb-24 md:pt-20 md:pb-8 theme-client">
      <div className="container mx-auto px-4 py-6 max-w-2xl">
        {/* Page Title */}
        <div className="mb-6">
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <User className="w-6 h-6 text-primary" />
            Meu Perfil
          </h2>
          <p className="text-muted-foreground text-sm">
            Gerencie suas informações e saldo
          </p>
        </div>

        <div className="space-y-5">
          {/* Enterprise Welcome Banner */}
          {isEnterprise && company && (
            <GlassCard className="bg-accent/10 border-accent/30">
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-full bg-accent/20">
                  <Building2 className="w-6 h-6 text-accent" />
                </div>
                <div className="flex-1">
                  <p className="text-sm text-muted-foreground">Bem-vindo, colaborador</p>
                  <h3 className="text-lg font-bold text-accent">{company.name}</h3>
                </div>
                <Crown className="w-8 h-8 text-accent" />
              </div>
            </GlassCard>
          )}

          {/* User Info Card */}
          <GlassCard className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold">Informações</h3>
              {getPlanBadge()}
            </div>

            <div className="space-y-3">
              <div className="flex items-center gap-3 p-3 rounded-lg bg-secondary/30">
                <Mail className="w-5 h-5 text-muted-foreground" />
                <div>
                  <p className="text-xs text-muted-foreground">E-mail</p>
                  <p className="font-medium">{profile?.email || user?.email}</p>
                </div>
              </div>

              {profile?.full_name && (
                <div className="flex items-center gap-3 p-3 rounded-lg bg-secondary/30">
                  <User className="w-5 h-5 text-muted-foreground" />
                  <div>
                    <p className="text-xs text-muted-foreground">Nome</p>
                    <p className="font-medium">{profile.full_name}</p>
                  </div>
                </div>
              )}

              {profile?.phone && (
                <div className="flex items-center gap-3 p-3 rounded-lg bg-secondary/30">
                  <Phone className="w-5 h-5 text-muted-foreground" />
                  <div>
                    <p className="text-xs text-muted-foreground">Telefone</p>
                    <p className="font-medium">{profile.phone}</p>
                  </div>
                </div>
              )}

              <div className="flex items-center gap-3 p-3 rounded-lg bg-secondary/30">
                <CreditCard className="w-5 h-5 text-muted-foreground" />
                <div>
                  <p className="text-xs text-muted-foreground">Plano Atual</p>
                  <p className="font-medium capitalize">{profile?.current_plan || "Basic"}</p>
                </div>
              </div>
            </div>
          </GlassCard>

          {/* Wallet Balance */}
          <WalletBalance />

          {/* My Reservations */}
          <GlassCard className="space-y-4">
            <h3 className="text-lg font-semibold flex items-center gap-2">
              <CalendarDays className="w-5 h-5 text-primary" />
              Minhas Reservas
            </h3>

            {loadingReservations ? (
              <div className="flex justify-center py-4">
                <Loader2 className="w-5 h-5 animate-spin text-primary" />
              </div>
            ) : reservations.length === 0 ? (
              <p className="text-sm text-muted-foreground">Nenhuma reserva encontrada.</p>
            ) : (
              <div className="space-y-3">
                {reservations.map((reservation) => (
                  <div
                    key={reservation.id}
                    className="flex items-center justify-between p-3 rounded-lg bg-secondary/30"
                  >
                    <div>
                      <p className="font-medium text-sm">{formatDate(reservation.date)}</p>
                      <p className="text-xs text-muted-foreground flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {formatTime(reservation.start_time)}–{formatTime(reservation.end_time)}
                        <span className="ml-1">· {reservation.hours}h</span>
                      </p>
                    </div>
                    {getReservationStatusBadge(reservation.status)}
                  </div>
                ))}
              </div>
            )}
          </GlassCard>



          {/* Logout Button */}
          <Button 
            variant="outline" 
            className="w-full" 
            onClick={signOut}
          >
            <LogOut className="w-4 h-4 mr-2" />
            Sair da Conta
          </Button>
        </div>
      </div>
    </div>
  );
}
