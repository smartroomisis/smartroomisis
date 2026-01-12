import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useStorage } from "./useStorage";
import { toast } from "@/hooks/use-toast";

export interface StaffPayment {
  id: string;
  staff_id: string;
  audit_id: string | null;
  reservation_id: string | null;
  amount: number;
  fee_type: "cleaning" | "extra_service" | "bonus" | "other";
  description: string | null;
  status: "pending" | "approved" | "paid" | "cancelled";
  payment_proof_url: string | null;
  payment_date: string | null;
  payment_method: string | null;
  approved_by: string | null;
  approved_at: string | null;
  paid_by: string | null;
  paid_at: string | null;
  created_at: string;
  updated_at: string;
  // Joined data
  staff_name?: string;
  staff_email?: string;
}

export interface CreatePaymentData {
  staff_id: string;
  audit_id?: string;
  reservation_id?: string;
  amount: number;
  fee_type: "cleaning" | "extra_service" | "bonus" | "other";
  description?: string;
}

export function useStaffPayments() {
  const [payments, setPayments] = useState<StaffPayment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { uploadFile, isUploading } = useStorage();

  const fetchPayments = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const { data, error: fetchError } = await supabase
        .from("staff_payments")
        .select(`
          *,
          profiles:staff_id (full_name, email)
        `)
        .order("created_at", { ascending: false });

      if (fetchError) {
        console.error("Error fetching payments:", fetchError);
        setError(fetchError.message);
        return;
      }

      const formattedPayments = (data || []).map((payment: any) => ({
        ...payment,
        staff_name: payment.profiles?.full_name || "Desconhecido",
        staff_email: payment.profiles?.email || "",
      }));

      setPayments(formattedPayments);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Erro ao buscar pagamentos";
      setError(message);
    } finally {
      setIsLoading(false);
    }
  };

  const createPayment = async (data: CreatePaymentData): Promise<boolean> => {
    try {
      const { error: insertError } = await supabase
        .from("staff_payments")
        .insert({
          staff_id: data.staff_id,
          audit_id: data.audit_id || null,
          reservation_id: data.reservation_id || null,
          amount: data.amount,
          fee_type: data.fee_type,
          description: data.description || null,
          status: "pending",
        });

      if (insertError) {
        console.error("Error creating payment:", insertError);
        toast({
          title: "Erro ao criar pagamento",
          description: insertError.message,
          variant: "destructive",
        });
        return false;
      }

      await fetchPayments();
      return true;
    } catch (err) {
      console.error("Error:", err);
      return false;
    }
  };

  const approvePayment = async (paymentId: string): Promise<boolean> => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return false;

      const { error } = await supabase
        .from("staff_payments")
        .update({
          status: "approved",
          approved_by: user.id,
          approved_at: new Date().toISOString(),
        })
        .eq("id", paymentId);

      if (error) {
        toast({
          title: "Erro ao aprovar",
          description: error.message,
          variant: "destructive",
        });
        return false;
      }

      await fetchPayments();
      return true;
    } catch (err) {
      console.error("Error approving payment:", err);
      return false;
    }
  };

  const confirmPayment = async (
    paymentId: string,
    proofFile: File,
    paymentMethod: string = "PIX"
  ): Promise<boolean> => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return false;

      // Upload proof to storage
      const uploadResult = await uploadFile(
        "payment-proofs",
        proofFile,
        `payments/${paymentId}`
      );

      if (!uploadResult.success) {
        toast({
          title: "Erro no upload",
          description: uploadResult.error || "Falha ao enviar comprovante",
          variant: "destructive",
        });
        return false;
      }

      // Update payment record
      const { error } = await supabase
        .from("staff_payments")
        .update({
          status: "paid",
          payment_proof_url: uploadResult.url,
          payment_date: new Date().toISOString().split("T")[0],
          payment_method: paymentMethod,
          paid_by: user.id,
          paid_at: new Date().toISOString(),
        })
        .eq("id", paymentId);

      if (error) {
        toast({
          title: "Erro ao confirmar pagamento",
          description: error.message,
          variant: "destructive",
        });
        return false;
      }

      toast({
        title: "Pagamento Confirmado",
        description: "Comprovante salvo com sucesso.",
      });

      await fetchPayments();
      return true;
    } catch (err) {
      console.error("Error confirming payment:", err);
      return false;
    }
  };

  const cancelPayment = async (paymentId: string): Promise<boolean> => {
    try {
      const { error } = await supabase
        .from("staff_payments")
        .update({ status: "cancelled" })
        .eq("id", paymentId);

      if (error) {
        toast({
          title: "Erro ao cancelar",
          description: error.message,
          variant: "destructive",
        });
        return false;
      }

      await fetchPayments();
      return true;
    } catch (err) {
      console.error("Error cancelling payment:", err);
      return false;
    }
  };

  // Computed values
  const pendingPayments = payments.filter((p) => p.status === "pending" || p.status === "approved");
  const paidPayments = payments.filter((p) => p.status === "paid");
  const totalPending = pendingPayments.reduce((sum, p) => sum + Number(p.amount), 0);
  const totalPaid = paidPayments.reduce((sum, p) => sum + Number(p.amount), 0);

  useEffect(() => {
    fetchPayments();
  }, []);

  return {
    payments,
    pendingPayments,
    paidPayments,
    totalPending,
    totalPaid,
    isLoading,
    error,
    isUploading,
    fetchPayments,
    createPayment,
    approvePayment,
    confirmPayment,
    cancelPayment,
  };
}
