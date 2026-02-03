import { useState, useEffect } from "react";
import { GlassCard } from "@/components/GlassCard";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { 
  Hand, 
  Loader2, 
  CheckCircle, 
  Clock,
  MapPin,
  User
} from "lucide-react";

interface PendingService {
  id: string;
  reservation_id: string | null;
  room_id: string;
  status: string;
  created_at: string;
  staff_id: string | null;
  reservation?: {
    client_name: string;
    date: string;
    end_time: string;
  };
}

export function ServiceClaimCard() {
  const { user, profile } = useAuth();
  const [pendingServices, setPendingServices] = useState<PendingService[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [claimingId, setClaimingId] = useState<string | null>(null);

  // Fetch pending services
  const fetchPendingServices = async () => {
    try {
      const { data, error } = await supabase
        .from("staff_audits")
        .select(`
          id,
          reservation_id,
          room_id,
          status,
          created_at,
          staff_id
        `)
        .eq("status", "pending")
        .is("staff_id", null)
        .order("created_at", { ascending: true });

      if (error) throw error;
      
      // Fetch reservation details for each service
      const servicesWithDetails = await Promise.all(
        (data || []).map(async (service) => {
          if (service.reservation_id) {
            const { data: reservation } = await supabase
              .from("reservations")
              .select("client_name, date, end_time")
              .eq("id", service.reservation_id)
              .single();
            
            return { ...service, reservation };
          }
          return service;
        })
      );

      setPendingServices(servicesWithDetails);
    } catch (err) {
      console.error("Error fetching pending services:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchPendingServices();

    // Subscribe to realtime changes
    const channel = supabase
      .channel("staff_audits_changes")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "staff_audits",
        },
        () => {
          fetchPendingServices();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const handleClaimService = async (serviceId: string) => {
    if (!user?.id) {
      toast({
        title: "Erro",
        description: "Faça login novamente.",
        variant: "destructive",
      });
      return;
    }

    setClaimingId(serviceId);

    try {
      // Update the audit to claim it
      const { error } = await supabase
        .from("staff_audits")
        .update({ 
          staff_id: user.id,
          status: "in_progress"
        })
        .eq("id", serviceId)
        .is("staff_id", null); // Only if not already claimed

      if (error) throw error;

      toast({
        title: "Serviço Reivindicado! ✓",
        description: "Agora você pode prosseguir com a limpeza.",
      });

      // Remove from local state
      setPendingServices(prev => prev.filter(s => s.id !== serviceId));
    } catch (err) {
      console.error("Error claiming service:", err);
      toast({
        title: "Erro ao reivindicar",
        description: "Serviço pode já ter sido reivindicado por outro colaborador.",
        variant: "destructive",
      });
      fetchPendingServices();
    } finally {
      setClaimingId(null);
    }
  };

  if (isLoading) {
    return (
      <GlassCard className="space-y-4">
        <div className="flex items-center justify-center py-6">
          <Loader2 className="w-6 h-6 animate-spin text-primary" />
        </div>
      </GlassCard>
    );
  }

  if (pendingServices.length === 0) {
    return (
      <GlassCard className="space-y-4">
        <h3 className="text-lg font-semibold flex items-center gap-2">
          <Hand className="w-5 h-5 text-primary" />
          Serviços Disponíveis
        </h3>
        <div className="flex items-center gap-3 p-4 bg-success/10 border border-success/30 rounded-lg">
          <CheckCircle className="w-5 h-5 text-success" />
          <p className="text-sm text-success">
            Nenhum serviço pendente no momento.
          </p>
        </div>
      </GlassCard>
    );
  }

  return (
    <GlassCard className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold flex items-center gap-2">
          <Hand className="w-5 h-5 text-primary" />
          Serviços Disponíveis
        </h3>
        <Badge variant="outline" className="gap-1">
          <Clock className="w-3 h-3" />
          {pendingServices.length} pendente(s)
        </Badge>
      </div>

      <div className="space-y-3">
        {pendingServices.map((service) => (
          <div
            key={service.id}
            className="p-4 bg-warning/10 border border-warning/30 rounded-lg space-y-3"
          >
            <div className="flex items-start justify-between">
              <div className="space-y-1">
                <div className="flex items-center gap-2 text-sm">
                  <MapPin className="w-4 h-4 text-warning" />
                  <span className="font-medium">SMART ROOM OFFICE</span>
                </div>
                {service.reservation && (
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <User className="w-3 h-3" />
                    <span>Cliente: {service.reservation.client_name}</span>
                  </div>
                )}
                <p className="text-xs text-muted-foreground">
                  Aguardando limpeza desde {new Date(service.created_at).toLocaleTimeString("pt-BR", {
                    hour: "2-digit",
                    minute: "2-digit"
                  })}
                </p>
              </div>
              <Badge className="bg-warning text-warning-foreground">
                Pendente
              </Badge>
            </div>

            <Button
              className="w-full gap-2"
              variant="default"
              onClick={() => handleClaimService(service.id)}
              disabled={claimingId === service.id}
            >
              {claimingId === service.id ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Reivindicando...
                </>
              ) : (
                <>
                  <Hand className="w-4 h-4" />
                  Reivindicar Serviço
                </>
              )}
            </Button>
          </div>
        ))}
      </div>
    </GlassCard>
  );
}
