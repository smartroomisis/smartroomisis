import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useStorage } from "./useStorage";
import { toast } from "@/hooks/use-toast";

export interface StaffAudit {
  id: string;
  reservation_id: string | null;
  staff_id: string | null;
  room_id: string;
  cleaning_checklist: Record<string, boolean>;
  organization_checklist: Record<string, boolean>;
  coffee_capsules_used: number | null;
  coffee_capsules_remaining: number | null;
  has_damage: boolean | null;
  damage_description: string | null;
  photo_urls: string[] | null;
  status: string;
  notes: string | null;
  created_at: string;
  completed_at: string | null;
  reviewed_at: string | null;
  reviewed_by: string | null;
  // Joined data
  staff_name?: string;
  reservation_client_name?: string;
}

export interface CreateAuditData {
  reservation_id?: string;
  room_id: string;
  cleaning_checklist: Record<string, boolean>;
  organization_checklist: Record<string, boolean>;
  coffee_capsules_used: number;
  coffee_capsules_remaining: number;
  has_damage: boolean;
  damage_description?: string;
  photo_base64?: string[]; // Base64 photos to upload
  notes?: string;
}

export function useStaffAudits() {
  const [audits, setAudits] = useState<StaffAudit[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { uploadBase64Images, isUploading } = useStorage();

  const fetchAudits = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const { data, error: fetchError } = await supabase
        .from("staff_audits")
        .select(`
          *,
          profiles:staff_id (full_name),
          reservations:reservation_id (client_name)
        `)
        .order("created_at", { ascending: false });

      if (fetchError) {
        console.error("Error fetching audits:", fetchError);
        setError(fetchError.message);
        return;
      }

      const formattedAudits = (data || []).map((audit: any) => ({
        ...audit,
        cleaning_checklist: audit.cleaning_checklist || {},
        organization_checklist: audit.organization_checklist || {},
        staff_name: audit.profiles?.full_name || "Desconhecido",
        reservation_client_name: audit.reservations?.client_name || "N/A",
      }));

      setAudits(formattedAudits);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Erro ao buscar auditorias";
      setError(message);
    } finally {
      setIsLoading(false);
    }
  };

  const createAudit = async (data: CreateAuditData): Promise<boolean> => {
    try {
      // Get current user
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast({
          title: "Erro de autenticação",
          description: "Faça login novamente.",
          variant: "destructive",
        });
        return false;
      }

      // Upload photos to storage if provided
      let photoUrls: string[] = [];
      if (data.photo_base64 && data.photo_base64.length > 0) {
        const folder = `audits/${data.reservation_id || "general"}`;
        photoUrls = await uploadBase64Images("audit-photos", data.photo_base64, folder);
      }

      // Create audit record
      const { error: insertError } = await supabase
        .from("staff_audits")
        .insert({
          reservation_id: data.reservation_id || null,
          staff_id: user.id,
          room_id: data.room_id,
          cleaning_checklist: data.cleaning_checklist,
          organization_checklist: data.organization_checklist,
          coffee_capsules_used: data.coffee_capsules_used,
          coffee_capsules_remaining: data.coffee_capsules_remaining,
          has_damage: data.has_damage,
          damage_description: data.damage_description || null,
          photo_urls: photoUrls,
          notes: data.notes || null,
          status: "completed",
          completed_at: new Date().toISOString(),
        });

      if (insertError) {
        console.error("Error creating audit:", insertError);
        toast({
          title: "Erro ao salvar",
          description: insertError.message,
          variant: "destructive",
        });
        return false;
      }

      toast({
        title: "Auditoria Salva",
        description: "Dados salvos com sucesso no banco de dados.",
      });

      // Refresh list
      await fetchAudits();
      return true;
    } catch (err) {
      const message = err instanceof Error ? err.message : "Erro desconhecido";
      toast({
        title: "Erro",
        description: message,
        variant: "destructive",
      });
      return false;
    }
  };

  const updateAuditStatus = async (
    auditId: string,
    status: "pending" | "completed" | "reviewed"
  ): Promise<boolean> => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      const updateData: any = { status };
      
      if (status === "reviewed" && user) {
        updateData.reviewed_at = new Date().toISOString();
        updateData.reviewed_by = user.id;
      }

      const { error } = await supabase
        .from("staff_audits")
        .update(updateData)
        .eq("id", auditId);

      if (error) {
        toast({
          title: "Erro ao atualizar",
          description: error.message,
          variant: "destructive",
        });
        return false;
      }

      await fetchAudits();
      return true;
    } catch (err) {
      console.error("Error updating audit:", err);
      return false;
    }
  };

  useEffect(() => {
    fetchAudits();
  }, []);

  return {
    audits,
    isLoading,
    error,
    isUploading,
    fetchAudits,
    createAudit,
    updateAuditStatus,
  };
}
