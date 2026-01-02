import { useState, useEffect } from "react";
import { GlassCard } from "@/components/GlassCard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { 
  Wallet, 
  Plus, 
  Search,
  TrendingUp,
  TrendingDown,
  Clock,
  Crown
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";

interface UserProfile {
  id: string;
  email: string;
  full_name: string | null;
  current_plan: string;
  credit_hours: number;
}

const planLabels: Record<string, string> = {
  basic: "Basic",
  pro: "Pro",
  executive: "Executive",
  enterprise: "Enterprise",
};

export function AdminCreditManager() {
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<UserProfile | null>(null);
  const [creditAmount, setCreditAmount] = useState("");
  const [creditType, setCreditType] = useState<"add" | "deduct">("add");
  const [description, setDescription] = useState("");
  const { toast } = useToast();
  const { user } = useAuth();

  useEffect(() => {
    fetchUsers();
  }, []);

  useEffect(() => {
    const filtered = users.filter(
      (u) =>
        u.email.toLowerCase().includes(search.toLowerCase()) ||
        (u.full_name?.toLowerCase().includes(search.toLowerCase()) ?? false)
    );
    setFilteredUsers(filtered);
  }, [search, users]);

  const fetchUsers = async () => {
    try {
      const { data, error } = await supabase
        .from("profiles")
        .select("id, email, full_name, current_plan, credit_hours")
        .order("email");

      if (error) throw error;
      setUsers(data || []);
      setFilteredUsers(data || []);
    } catch (error) {
      console.error("Error fetching users:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenDialog = (userProfile: UserProfile) => {
    setSelectedUser(userProfile);
    setCreditAmount("");
    setCreditType("add");
    setDescription("");
    setDialogOpen(true);
  };

  const handleAdjustCredits = async () => {
    if (!selectedUser || !creditAmount || !user) return;

    const amount = parseFloat(creditAmount);
    if (isNaN(amount) || amount <= 0) {
      toast({
        title: "Valor inválido",
        description: "Informe um valor válido.",
        variant: "destructive",
      });
      return;
    }

    try {
      const adjustedAmount = creditType === "add" ? amount : -amount;
      const newBalance = selectedUser.credit_hours + adjustedAmount;

      // Update profile balance
      const { error: updateError } = await supabase
        .from("profiles")
        .update({ credit_hours: newBalance })
        .eq("id", selectedUser.id);

      if (updateError) throw updateError;

      // Create transaction record
      const { error: txError } = await supabase
        .from("credit_transactions")
        .insert({
          user_id: selectedUser.id,
          amount: adjustedAmount,
          type: creditType === "add" ? "manual_credit" : "adjustment",
          description: description || (creditType === "add" ? "Crédito manual" : "Ajuste de saldo"),
          created_by: user.id,
        });

      if (txError) throw txError;

      toast({
        title: "Créditos ajustados!",
        description: `${creditType === "add" ? "Adicionado" : "Removido"} ${amount}h para ${selectedUser.email}`,
      });

      setDialogOpen(false);
      fetchUsers();
    } catch (error) {
      console.error("Error adjusting credits:", error);
      toast({
        title: "Erro",
        description: "Erro ao ajustar créditos.",
        variant: "destructive",
      });
    }
  };

  const handleChangePlan = async (userId: string, newPlan: string) => {
    try {
      const { error } = await supabase
        .from("profiles")
        .update({ current_plan: newPlan as "basic" | "pro" | "executive" | "enterprise" })
        .eq("id", userId);

      if (error) throw error;

      toast({ title: "Plano atualizado!" });
      fetchUsers();
    } catch (error) {
      console.error("Error changing plan:", error);
      toast({
        title: "Erro",
        description: "Erro ao alterar plano.",
        variant: "destructive",
      });
    }
  };

  return (
    <GlassCard className="p-5">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Wallet className="w-5 h-5 text-primary" />
          <h3 className="font-semibold">Gerenciar Créditos</h3>
        </div>
      </div>

      <div className="relative mb-4">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input
          placeholder="Buscar usuário por email ou nome..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-10"
        />
      </div>

      {loading ? (
        <div className="h-32 flex items-center justify-center text-muted-foreground">
          Carregando...
        </div>
      ) : filteredUsers.length === 0 ? (
        <div className="h-32 flex items-center justify-center text-muted-foreground">
          Nenhum usuário encontrado
        </div>
      ) : (
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Usuário</TableHead>
                <TableHead>Plano</TableHead>
                <TableHead className="text-right">Saldo</TableHead>
                <TableHead className="text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredUsers.map((userProfile) => (
                <TableRow key={userProfile.id}>
                  <TableCell>
                    <div>
                      <p className="font-medium">{userProfile.full_name || "—"}</p>
                      <p className="text-sm text-muted-foreground">{userProfile.email}</p>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Select
                      value={userProfile.current_plan}
                      onValueChange={(value: string) => handleChangePlan(userProfile.id, value)}
                    >
                      <SelectTrigger className="w-32">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="basic">Basic</SelectItem>
                        <SelectItem value="pro">Pro</SelectItem>
                        <SelectItem value="executive">Executive</SelectItem>
                        <SelectItem value="enterprise">Enterprise</SelectItem>
                      </SelectContent>
                    </Select>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-1">
                      <Clock className="w-4 h-4 text-muted-foreground" />
                      <span className="font-medium">{userProfile.credit_hours}h</span>
                    </div>
                  </TableCell>
                  <TableCell className="text-right">
                    <Dialog open={dialogOpen && selectedUser?.id === userProfile.id} onOpenChange={setDialogOpen}>
                      <DialogTrigger asChild>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleOpenDialog(userProfile)}
                        >
                          <Plus className="w-4 h-4 mr-1" />
                          Ajustar
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>Ajustar Créditos</DialogTitle>
                        </DialogHeader>
                        <div className="space-y-4">
                          <div className="p-3 rounded-lg bg-secondary/50">
                            <p className="font-medium">{selectedUser?.full_name || selectedUser?.email}</p>
                            <p className="text-sm text-muted-foreground">
                              Saldo atual: {selectedUser?.credit_hours}h
                            </p>
                          </div>

                          <div className="flex gap-2">
                            <Button
                              variant={creditType === "add" ? "default" : "outline"}
                              className="flex-1 gap-2"
                              onClick={() => setCreditType("add")}
                            >
                              <TrendingUp className="w-4 h-4" />
                              Adicionar
                            </Button>
                            <Button
                              variant={creditType === "deduct" ? "destructive" : "outline"}
                              className="flex-1 gap-2"
                              onClick={() => setCreditType("deduct")}
                            >
                              <TrendingDown className="w-4 h-4" />
                              Remover
                            </Button>
                          </div>

                          <div className="space-y-2">
                            <Label>Quantidade de Horas</Label>
                            <Input
                              type="number"
                              value={creditAmount}
                              onChange={(e) => setCreditAmount(e.target.value)}
                              placeholder="Ex: 10"
                              min="0"
                              step="0.5"
                            />
                          </div>

                          <div className="space-y-2">
                            <Label>Descrição (opcional)</Label>
                            <Input
                              value={description}
                              onChange={(e) => setDescription(e.target.value)}
                              placeholder="Motivo do ajuste..."
                            />
                          </div>

                          <Button onClick={handleAdjustCredits} className="w-full">
                            Confirmar Ajuste
                          </Button>
                        </div>
                      </DialogContent>
                    </Dialog>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </GlassCard>
  );
}
