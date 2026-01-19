import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export interface LandingPageSection {
  id: string;
  section_key: string;
  content: Record<string, any>;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export const useLandingPageConfig = () => {
  return useQuery({
    queryKey: ["landing-page-config"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("landing_page_config")
        .select("*")
        .order("section_key");

      if (error) throw error;
      return data as LandingPageSection[];
    },
  });
};

export const useLandingPageSection = (sectionKey: string) => {
  return useQuery({
    queryKey: ["landing-page-config", sectionKey],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("landing_page_config")
        .select("*")
        .eq("section_key", sectionKey)
        .single();

      if (error) throw error;
      return data as LandingPageSection;
    },
  });
};

export const useUpdateLandingPageSection = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      sectionKey,
      content,
    }: {
      sectionKey: string;
      content: Record<string, any>;
    }) => {
      const { data, error } = await supabase
        .from("landing_page_config")
        .update({ content })
        .eq("section_key", sectionKey)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["landing-page-config"] });
      toast.success("Seção atualizada com sucesso!");
    },
    onError: (error: Error) => {
      toast.error("Erro ao atualizar seção: " + error.message);
    },
  });
};

export const useToggleLandingPageSection = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      sectionKey,
      isActive,
    }: {
      sectionKey: string;
      isActive: boolean;
    }) => {
      const { data, error } = await supabase
        .from("landing_page_config")
        .update({ is_active: isActive })
        .eq("section_key", sectionKey)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["landing-page-config"] });
      toast.success("Visibilidade atualizada!");
    },
    onError: (error: Error) => {
      toast.error("Erro ao alterar visibilidade: " + error.message);
    },
  });
};
