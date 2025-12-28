import { useState } from "react";
import { GlassCard } from "@/components/GlassCard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "@/hooks/use-toast";
import { createExpense } from "@/lib/api";
import { Receipt, Loader2, CheckCircle, Plus } from "lucide-react";

const EXPENSE_CATEGORIES = [
  "Aluguel/Condomínio",
  "Energia",
  "Internet",
  "Limpeza",
  "Insumos",
  "Marketing",
  "Outros",
];

export function ExpenseForm({ onSuccess }: { onSuccess?: () => void }) {
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [category, setCategory] = useState("");
  const [amount, setAmount] = useState("");
  const [description, setDescription] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!date || !category || !amount) {
      toast({
        title: "Campos obrigatórios",
        description: "Preencha data, categoria e valor.",
        variant: "destructive",
      });
      return;
    }

    const numericAmount = parseFloat(amount.replace(",", "."));
    if (isNaN(numericAmount) || numericAmount <= 0) {
      toast({
        title: "Valor inválido",
        description: "Informe um valor numérico positivo.",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      await createExpense({
        date,
        category,
        amount: numericAmount,
        description: description.trim(),
      });

      setIsSuccess(true);
      toast({
        title: "Despesa Registrada",
        description: `${category}: R$ ${numericAmount.toFixed(2)}`,
      });

      // Reset form
      setTimeout(() => {
        setIsSuccess(false);
        setCategory("");
        setAmount("");
        setDescription("");
        onSuccess?.();
      }, 2000);
    } catch (error) {
      const message = error instanceof Error ? error.message : "Erro ao registrar";
      toast({
        title: "Erro",
        description: message,
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <GlassCard className="space-y-4">
      <h3 className="text-lg font-semibold flex items-center gap-2">
        <Receipt className="w-5 h-5 text-primary" />
        Lançamento de Despesa
      </h3>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="expense-date">Data</Label>
            <Input
              id="expense-date"
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="mt-1"
            />
          </div>

          <div>
            <Label htmlFor="expense-amount">Valor (R$)</Label>
            <Input
              id="expense-amount"
              type="text"
              placeholder="0,00"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="mt-1"
            />
          </div>
        </div>

        <div>
          <Label htmlFor="expense-category">Categoria</Label>
          <Select value={category} onValueChange={setCategory}>
            <SelectTrigger className="mt-1">
              <SelectValue placeholder="Selecione uma categoria" />
            </SelectTrigger>
            <SelectContent>
              {EXPENSE_CATEGORIES.map((cat) => (
                <SelectItem key={cat} value={cat}>
                  {cat}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label htmlFor="expense-description">Descrição</Label>
          <Textarea
            id="expense-description"
            placeholder="Detalhes da despesa (opcional)"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="mt-1"
            rows={2}
          />
        </div>

        <Button
          type="submit"
          className="w-full"
          disabled={isSubmitting || isSuccess}
        >
          {isSubmitting ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin mr-2" />
              Registrando...
            </>
          ) : isSuccess ? (
            <>
              <CheckCircle className="w-4 h-4 mr-2" />
              Registrado!
            </>
          ) : (
            <>
              <Plus className="w-4 h-4 mr-2" />
              Registrar Despesa
            </>
          )}
        </Button>
      </form>
    </GlassCard>
  );
}
