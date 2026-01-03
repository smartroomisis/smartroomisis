import { useAuth } from "@/hooks/useAuth";
import { WalletBalance } from "@/components/WalletBalance";
import { GlassCard } from "@/components/GlassCard";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  User, 
  Building2, 
  Mail, 
  Phone, 
  CreditCard, 
  LogOut,
  Loader2,
  Crown
} from "lucide-react";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

interface EnterpriseCompany {
  name: string;
  email_domain: string;
}

export default function Profile() {
  const { user, profile, isEnterprise, signOut, loading } = useAuth();
  const [company, setCompany] = useState<EnterpriseCompany | null>(null);
  const [loadingCompany, setLoadingCompany] = useState(false);

  useEffect(() => {
    if (profile?.enterprise_company_id) {
      fetchCompany(profile.enterprise_company_id);
    }
  }, [profile?.enterprise_company_id]);

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
