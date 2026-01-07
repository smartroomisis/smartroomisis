import { useState, useEffect } from "react";
import { GlassCard } from "@/components/GlassCard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { toast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { 
  User, 
  Plus, 
  Loader2, 
  Mail, 
  Phone, 
  Briefcase,
  CheckCircle,
  XCircle
} from "lucide-react";

interface StaffMember {
  id: string;
  email: string;
  full_name: string | null;
  phone: string | null;
  created_at: string;
}

export function StaffManagement() {
  const [staffList, setStaffList] = useState<StaffMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Form state
  const [newStaffName, setNewStaffName] = useState("");
  const [newStaffEmail, setNewStaffEmail] = useState("");
  const [newStaffPhone, setNewStaffPhone] = useState("");
  const [newStaffRole, setNewStaffRole] = useState("Colaborador");

  useEffect(() => {
    fetchStaffMembers();
  }, []);

  const fetchStaffMembers = async () => {
    try {
      setLoading(true);
      
      // Get all users with staff role
      const { data: staffRoles, error: rolesError } = await supabase
        .from("user_roles")
        .select("user_id")
        .eq("role", "staff");

      if (rolesError) throw rolesError;

      if (!staffRoles || staffRoles.length === 0) {
        setStaffList([]);
        return;
      }

      const staffUserIds = staffRoles.map(r => r.user_id);

      // Get profiles for these users
      const { data: profiles, error: profilesError } = await supabase
        .from("profiles")
        .select("id, email, full_name, phone, created_at")
        .in("id", staffUserIds);

      if (profilesError) throw profilesError;
      setStaffList(profiles || []);
    } catch (error) {
      console.error("Error fetching staff members:", error);
      toast({
        title: "Erro",
        description: "Não foi possível carregar a lista de colaboradores.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleAddStaff = async () => {
    if (!newStaffName.trim() || !newStaffEmail.trim()) {
      toast({
        title: "Campos obrigatórios",
        description: "Nome e e-mail são obrigatórios.",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      // Check if user already exists
      const { data: existingProfile, error: checkError } = await supabase
        .from("profiles")
        .select("id")
        .eq("email", newStaffEmail.toLowerCase())
        .maybeSingle();

      if (checkError && checkError.code !== "PGRST116") throw checkError;

      if (existingProfile) {
        // User exists, check if already has staff role
        const { data: existingRole, error: roleCheckError } = await supabase
          .from("user_roles")
          .select("id")
          .eq("user_id", existingProfile.id)
          .eq("role", "staff")
          .maybeSingle();

        if (roleCheckError && roleCheckError.code !== "PGRST116") throw roleCheckError;

        if (existingRole) {
          toast({
            title: "Colaborador já existe",
            description: "Este e-mail já está registado como staff.",
            variant: "destructive",
          });
          return;
        }

        // Add staff role to existing user
        const { error: addRoleError } = await supabase
          .from("user_roles")
          .insert({ user_id: existingProfile.id, role: "staff" });

        if (addRoleError) throw addRoleError;

        // Update profile with name if provided
        if (newStaffName.trim()) {
          await supabase
            .from("profiles")
            .update({ 
              full_name: newStaffName.trim(),
              phone: newStaffPhone.trim() || null
            })
            .eq("id", existingProfile.id);
        }

        toast({
          title: "Sucesso",
          description: "Utilizador existente foi adicionado como colaborador.",
        });
      } else {
        // User doesn't exist - they need to register first
        toast({
          title: "Utilizador não encontrado",
          description: "O colaborador precisa registar-se em /auth/staff primeiro. Depois aparecerá nesta lista.",
          variant: "destructive",
        });
        return;
      }

      // Reset form and refresh list
      setNewStaffName("");
      setNewStaffEmail("");
      setNewStaffPhone("");
      setNewStaffRole("Colaborador");
      setIsDialogOpen(false);
      fetchStaffMembers();
    } catch (error) {
      console.error("Error adding staff:", error);
      toast({
        title: "Erro",
        description: "Não foi possível adicionar o colaborador.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <User className="w-5 h-5 text-primary" />
            Gestão de Colaboradores
          </h3>
          <p className="text-sm text-muted-foreground">
            {staffList.length} colaborador(es) registado(s)
          </p>
        </div>
        <Button onClick={() => setIsDialogOpen(true)}>
          <Plus className="w-4 h-4 mr-2" />
          Adicionar Staff
        </Button>
      </div>

      {/* Staff List */}
      {staffList.length === 0 ? (
        <GlassCard className="p-8 text-center">
          <User className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
          <h4 className="font-medium mb-2">Nenhum colaborador registado</h4>
          <p className="text-sm text-muted-foreground mb-4">
            Os colaboradores precisam registar-se em /auth/staff para aparecer aqui.
          </p>
          <Button variant="outline" onClick={() => setIsDialogOpen(true)}>
            <Plus className="w-4 h-4 mr-2" />
            Adicionar Primeiro Colaborador
          </Button>
        </GlassCard>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {staffList.map((staff) => (
            <GlassCard key={staff.id} className="p-4">
              <div className="flex items-start gap-3">
                <div className="p-2 rounded-full bg-primary/10">
                  <User className="w-5 h-5 text-primary" />
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="font-medium truncate">
                    {staff.full_name || "Sem nome"}
                  </h4>
                  <div className="flex items-center gap-1 text-sm text-muted-foreground mt-1">
                    <Mail className="w-3 h-3" />
                    <span className="truncate">{staff.email}</span>
                  </div>
                  {staff.phone && (
                    <div className="flex items-center gap-1 text-sm text-muted-foreground mt-1">
                      <Phone className="w-3 h-3" />
                      <span>{staff.phone}</span>
                    </div>
                  )}
                  <div className="flex items-center gap-2 mt-3">
                    <Badge variant="secondary" className="text-xs">
                      <Briefcase className="w-3 h-3 mr-1" />
                      Staff
                    </Badge>
                    <span className="text-xs text-muted-foreground">
                      Desde {formatDate(staff.created_at)}
                    </span>
                  </div>
                </div>
              </div>
            </GlassCard>
          ))}
        </div>
      )}

      {/* Add Staff Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Plus className="w-5 h-5 text-primary" />
              Adicionar Colaborador
            </DialogTitle>
            <DialogDescription>
              Adicione um utilizador existente como colaborador ou convide-o a registar-se.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="name">Nome Completo *</Label>
              <Input
                id="name"
                placeholder="Nome do colaborador"
                value={newStaffName}
                onChange={(e) => setNewStaffName(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">E-mail *</Label>
              <Input
                id="email"
                type="email"
                placeholder="email@exemplo.com"
                value={newStaffEmail}
                onChange={(e) => setNewStaffEmail(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone">Telefone</Label>
              <Input
                id="phone"
                placeholder="(00) 00000-0000"
                value={newStaffPhone}
                onChange={(e) => setNewStaffPhone(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="role">Denominação</Label>
              <Input
                id="role"
                placeholder="Ex: Colaborador, Auxiliar..."
                value={newStaffRole}
                onChange={(e) => setNewStaffRole(e.target.value)}
              />
            </div>

            <div className="p-3 rounded-lg bg-muted/50 text-sm">
              <p className="text-muted-foreground">
                <strong>Nota:</strong> Se o utilizador ainda não tiver conta, ele precisa registar-se em{" "}
                <code className="px-1 py-0.5 rounded bg-background">/auth/staff</code>
              </p>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={handleAddStaff} disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin mr-2" />
                  A adicionar...
                </>
              ) : (
                <>
                  <CheckCircle className="w-4 h-4 mr-2" />
                  Adicionar
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
