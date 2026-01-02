import { useState, useEffect } from "react";
import { GlassCard } from "@/components/GlassCard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { 
  Building2, 
  Plus, 
  Pencil, 
  Trash2, 
  Globe,
  Mail,
  Phone,
  Infinity,
  Clock
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface Company {
  id: string;
  name: string;
  email_domain: string;
  contact_name: string | null;
  contact_email: string | null;
  contact_phone: string | null;
  is_unlimited: boolean;
  monthly_hours_limit: number | null;
  billing_email: string | null;
  notes: string | null;
  is_active: boolean;
}

export function EnterpriseCompanies() {
  const [companies, setCompanies] = useState<Company[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingCompany, setEditingCompany] = useState<Company | null>(null);
  const { toast } = useToast();

  const [formData, setFormData] = useState({
    name: "",
    email_domain: "",
    contact_name: "",
    contact_email: "",
    contact_phone: "",
    is_unlimited: true,
    monthly_hours_limit: "",
    billing_email: "",
    notes: "",
    is_active: true,
  });

  useEffect(() => {
    fetchCompanies();
  }, []);

  const fetchCompanies = async () => {
    try {
      const { data, error } = await supabase
        .from("enterprise_companies")
        .select("*")
        .order("name");

      if (error) throw error;
      setCompanies(data || []);
    } catch (error) {
      console.error("Error fetching companies:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenDialog = (company?: Company) => {
    if (company) {
      setEditingCompany(company);
      setFormData({
        name: company.name,
        email_domain: company.email_domain,
        contact_name: company.contact_name || "",
        contact_email: company.contact_email || "",
        contact_phone: company.contact_phone || "",
        is_unlimited: company.is_unlimited,
        monthly_hours_limit: company.monthly_hours_limit?.toString() || "",
        billing_email: company.billing_email || "",
        notes: company.notes || "",
        is_active: company.is_active,
      });
    } else {
      setEditingCompany(null);
      setFormData({
        name: "",
        email_domain: "",
        contact_name: "",
        contact_email: "",
        contact_phone: "",
        is_unlimited: true,
        monthly_hours_limit: "",
        billing_email: "",
        notes: "",
        is_active: true,
      });
    }
    setDialogOpen(true);
  };

  const handleSave = async () => {
    if (!formData.name || !formData.email_domain) {
      toast({
        title: "Campos obrigatórios",
        description: "Nome e domínio de email são obrigatórios.",
        variant: "destructive",
      });
      return;
    }

    try {
      const payload = {
        name: formData.name,
        email_domain: formData.email_domain.toLowerCase(),
        contact_name: formData.contact_name || null,
        contact_email: formData.contact_email || null,
        contact_phone: formData.contact_phone || null,
        is_unlimited: formData.is_unlimited,
        monthly_hours_limit: formData.monthly_hours_limit ? parseFloat(formData.monthly_hours_limit) : null,
        billing_email: formData.billing_email || null,
        notes: formData.notes || null,
        is_active: formData.is_active,
      };

      if (editingCompany) {
        const { error } = await supabase
          .from("enterprise_companies")
          .update(payload)
          .eq("id", editingCompany.id);

        if (error) throw error;
        toast({ title: "Empresa atualizada!" });
      } else {
        const { error } = await supabase
          .from("enterprise_companies")
          .insert(payload);

        if (error) throw error;
        toast({ title: "Empresa cadastrada!" });
      }

      setDialogOpen(false);
      fetchCompanies();
    } catch (error: any) {
      console.error("Error saving company:", error);
      toast({
        title: "Erro",
        description: error.message || "Erro ao salvar empresa.",
        variant: "destructive",
      });
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Tem certeza que deseja excluir esta empresa?")) return;

    try {
      const { error } = await supabase
        .from("enterprise_companies")
        .delete()
        .eq("id", id);

      if (error) throw error;
      toast({ title: "Empresa excluída!" });
      fetchCompanies();
    } catch (error) {
      console.error("Error deleting company:", error);
      toast({
        title: "Erro",
        description: "Erro ao excluir empresa.",
        variant: "destructive",
      });
    }
  };

  return (
    <GlassCard className="p-5">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Building2 className="w-5 h-5 text-warning" />
          <h3 className="font-semibold">Empresas Corporativas</h3>
        </div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button size="sm" onClick={() => handleOpenDialog()}>
              <Plus className="w-4 h-4 mr-1" />
              Nova Empresa
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                {editingCompany ? "Editar Empresa" : "Nova Empresa"}
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Nome da Empresa *</Label>
                  <Input
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="Empresa LTDA"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Domínio de Email *</Label>
                  <div className="relative">
                    <Globe className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      value={formData.email_domain}
                      onChange={(e) => setFormData({ ...formData, email_domain: e.target.value })}
                      placeholder="empresa.com.br"
                      className="pl-10"
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Nome do Contato</Label>
                  <Input
                    value={formData.contact_name}
                    onChange={(e) => setFormData({ ...formData, contact_name: e.target.value })}
                    placeholder="João Silva"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Email do Contato</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      value={formData.contact_email}
                      onChange={(e) => setFormData({ ...formData, contact_email: e.target.value })}
                      placeholder="contato@empresa.com"
                      className="pl-10"
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Telefone</Label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      value={formData.contact_phone}
                      onChange={(e) => setFormData({ ...formData, contact_phone: e.target.value })}
                      placeholder="(11) 99999-9999"
                      className="pl-10"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Email para Faturamento</Label>
                  <Input
                    value={formData.billing_email}
                    onChange={(e) => setFormData({ ...formData, billing_email: e.target.value })}
                    placeholder="financeiro@empresa.com"
                  />
                </div>
              </div>

              <div className="flex items-center justify-between p-3 rounded-lg bg-secondary/50">
                <div className="flex items-center gap-2">
                  <Infinity className="w-4 h-4 text-warning" />
                  <span className="text-sm">Uso Ilimitado</span>
                </div>
                <Switch
                  checked={formData.is_unlimited}
                  onCheckedChange={(checked) => setFormData({ ...formData, is_unlimited: checked })}
                />
              </div>

              {!formData.is_unlimited && (
                <div className="space-y-2">
                  <Label>Limite de Horas Mensais</Label>
                  <div className="relative">
                    <Clock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      type="number"
                      value={formData.monthly_hours_limit}
                      onChange={(e) => setFormData({ ...formData, monthly_hours_limit: e.target.value })}
                      placeholder="50"
                      className="pl-10"
                    />
                  </div>
                </div>
              )}

              <div className="space-y-2">
                <Label>Observações</Label>
                <Textarea
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  placeholder="Notas internas..."
                  rows={3}
                />
              </div>

              <div className="flex items-center justify-between p-3 rounded-lg bg-secondary/50">
                <span className="text-sm">Empresa Ativa</span>
                <Switch
                  checked={formData.is_active}
                  onCheckedChange={(checked) => setFormData({ ...formData, is_active: checked })}
                />
              </div>

              <Button onClick={handleSave} className="w-full">
                {editingCompany ? "Salvar Alterações" : "Cadastrar Empresa"}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {loading ? (
        <div className="h-32 flex items-center justify-center text-muted-foreground">
          Carregando...
        </div>
      ) : companies.length === 0 ? (
        <div className="h-32 flex items-center justify-center text-muted-foreground">
          Nenhuma empresa cadastrada
        </div>
      ) : (
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Empresa</TableHead>
                <TableHead>Domínio</TableHead>
                <TableHead>Limite</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {companies.map((company) => (
                <TableRow key={company.id}>
                  <TableCell className="font-medium">{company.name}</TableCell>
                  <TableCell className="text-muted-foreground">
                    @{company.email_domain}
                  </TableCell>
                  <TableCell>
                    {company.is_unlimited ? (
                      <Badge variant="outline" className="text-warning border-warning/30">
                        <Infinity className="w-3 h-3 mr-1" />
                        Ilimitado
                      </Badge>
                    ) : (
                      <span>{company.monthly_hours_limit}h/mês</span>
                    )}
                  </TableCell>
                  <TableCell>
                    <Badge variant={company.is_active ? "default" : "secondary"}>
                      {company.is_active ? "Ativa" : "Inativa"}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleOpenDialog(company)}
                      >
                        <Pencil className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDelete(company.id)}
                      >
                        <Trash2 className="w-4 h-4 text-destructive" />
                      </Button>
                    </div>
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
