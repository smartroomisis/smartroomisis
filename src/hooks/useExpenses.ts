import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useStorage } from "./useStorage";
import { toast } from "@/hooks/use-toast";

export type ExpenseCategory = 
  | "utilities" 
  | "maintenance" 
  | "supplies" 
  | "cleaning" 
  | "staff" 
  | "marketing" 
  | "taxes" 
  | "rent" 
  | "other";

export type ExpenseStatus = "pending" | "approved" | "paid" | "cancelled";

export interface Expense {
  id: string;
  description: string;
  amount: number;
  category: ExpenseCategory;
  expense_date: string;
  reference_month: string | null;
  receipt_url: string | null;
  invoice_number: string | null;
  vendor_name: string | null;
  vendor_document: string | null;
  status: ExpenseStatus;
  payment_date: string | null;
  payment_proof_url: string | null;
  notes: string | null;
  created_by: string | null;
  approved_by: string | null;
  created_at: string;
  updated_at: string;
}

export interface CreateExpenseData {
  description: string;
  amount: number;
  category: ExpenseCategory;
  expense_date: string;
  reference_month?: string;
  invoice_number?: string;
  vendor_name?: string;
  vendor_document?: string;
  notes?: string;
  receipt_file?: File;
}

export const CATEGORY_LABELS: Record<ExpenseCategory, string> = {
  utilities: "Utilidades",
  maintenance: "Manutenção",
  supplies: "Insumos",
  cleaning: "Limpeza",
  staff: "Colaboradores",
  marketing: "Marketing",
  taxes: "Impostos",
  rent: "Aluguel",
  other: "Outros",
};

export function useExpenses() {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { uploadFile, isUploading } = useStorage();

  const fetchExpenses = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const { data, error: fetchError } = await supabase
        .from("expenses")
        .select("*")
        .order("expense_date", { ascending: false });

      if (fetchError) {
        console.error("Error fetching expenses:", fetchError);
        setError(fetchError.message);
        return;
      }

      setExpenses((data || []) as Expense[]);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Erro ao buscar despesas";
      setError(message);
    } finally {
      setIsLoading(false);
    }
  };

  const createExpense = async (data: CreateExpenseData): Promise<boolean> => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast({
          title: "Erro de autenticação",
          description: "Faça login novamente.",
          variant: "destructive",
        });
        return false;
      }

      // Upload receipt if provided
      let receiptUrl: string | null = null;
      if (data.receipt_file) {
        const result = await uploadFile(
          "invoices",
          data.receipt_file,
          `expenses/${data.expense_date}`
        );
        if (result.success) {
          receiptUrl = result.url || null;
        }
      }

      // Generate reference month from expense date
      const referenceMonth = data.reference_month || data.expense_date.substring(0, 7);

      const { error: insertError } = await supabase
        .from("expenses")
        .insert({
          description: data.description,
          amount: data.amount,
          category: data.category,
          expense_date: data.expense_date,
          reference_month: referenceMonth,
          receipt_url: receiptUrl,
          invoice_number: data.invoice_number || null,
          vendor_name: data.vendor_name || null,
          vendor_document: data.vendor_document || null,
          notes: data.notes || null,
          created_by: user.id,
          status: "pending",
        });

      if (insertError) {
        console.error("Error creating expense:", insertError);
        toast({
          title: "Erro ao registrar despesa",
          description: insertError.message,
          variant: "destructive",
        });
        return false;
      }

      toast({
        title: "Despesa Registrada",
        description: `${CATEGORY_LABELS[data.category]}: R$ ${data.amount.toFixed(2)}`,
      });

      await fetchExpenses();
      return true;
    } catch (err) {
      console.error("Error:", err);
      return false;
    }
  };

  const updateExpenseStatus = async (
    expenseId: string,
    status: ExpenseStatus,
    paymentProofFile?: File
  ): Promise<boolean> => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return false;

      const updateData: Record<string, any> = { status };

      if (status === "approved") {
        updateData.approved_by = user.id;
      }

      if (status === "paid") {
        updateData.payment_date = new Date().toISOString().split("T")[0];
        
        if (paymentProofFile) {
          const result = await uploadFile(
            "invoices",
            paymentProofFile,
            `proofs/${expenseId}`
          );
          if (result.success) {
            updateData.payment_proof_url = result.url;
          }
        }
      }

      const { error } = await supabase
        .from("expenses")
        .update(updateData)
        .eq("id", expenseId);

      if (error) {
        toast({
          title: "Erro ao atualizar",
          description: error.message,
          variant: "destructive",
        });
        return false;
      }

      await fetchExpenses();
      return true;
    } catch (err) {
      console.error("Error updating expense:", err);
      return false;
    }
  };

  const deleteExpense = async (expenseId: string): Promise<boolean> => {
    try {
      const { error } = await supabase
        .from("expenses")
        .delete()
        .eq("id", expenseId);

      if (error) {
        toast({
          title: "Erro ao excluir",
          description: error.message,
          variant: "destructive",
        });
        return false;
      }

      await fetchExpenses();
      return true;
    } catch (err) {
      console.error("Error deleting expense:", err);
      return false;
    }
  };

  // Computed values
  const pendingExpenses = expenses.filter((e) => e.status === "pending");
  const paidExpenses = expenses.filter((e) => e.status === "paid");
  const totalPending = pendingExpenses.reduce((sum, e) => sum + Number(e.amount), 0);
  const totalPaid = paidExpenses.reduce((sum, e) => sum + Number(e.amount), 0);

  // Group by category
  const expensesByCategory = expenses.reduce((acc, expense) => {
    const cat = expense.category;
    if (!acc[cat]) acc[cat] = 0;
    acc[cat] += Number(expense.amount);
    return acc;
  }, {} as Record<ExpenseCategory, number>);

  useEffect(() => {
    fetchExpenses();
  }, []);

  return {
    expenses,
    pendingExpenses,
    paidExpenses,
    totalPending,
    totalPaid,
    expensesByCategory,
    isLoading,
    error,
    isUploading,
    fetchExpenses,
    createExpense,
    updateExpenseStatus,
    deleteExpense,
  };
}
