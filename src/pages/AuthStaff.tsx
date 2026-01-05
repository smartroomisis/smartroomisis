import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { GlassCard } from "@/components/GlassCard";
import { ClipboardCheck, Loader2, Mail, Lock, User, ArrowRight } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function AuthStaff() {
  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (session?.user) {
        setTimeout(async () => {
          // Check if user has staff role
          const { data: roles } = await supabase
            .from("user_roles")
            .select("role")
            .eq("user_id", session.user.id);
          
          const roleNames = roles?.map((r) => r.role) || [];
          if (roleNames.includes("staff") || roleNames.includes("admin")) {
            navigate("/staff", { replace: true });
          } else {
            toast({
              title: "Acesso negado",
              description: "Você não tem permissão de staff.",
              variant: "destructive",
            });
            await supabase.auth.signOut();
          }
        }, 0);
      }
    });

    supabase.auth.getSession().then(async ({ data: { session } }) => {
      if (session?.user) {
        const { data: roles } = await supabase
          .from("user_roles")
          .select("role")
          .eq("user_id", session.user.id);
        
        const roleNames = roles?.map((r) => r.role) || [];
        if (roleNames.includes("staff") || roleNames.includes("admin")) {
          navigate("/staff", { replace: true });
        }
      }
    });

    return () => subscription.unsubscribe();
  }, [navigate, toast]);

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email || !password) {
      toast({
        title: "Campos obrigatórios",
        description: "Por favor, preencha email e senha.",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);

    try {
      if (isLogin) {
        const { data, error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });

        if (error) throw error;

        // Verify staff role
        const { data: roles } = await supabase
          .from("user_roles")
          .select("role")
          .eq("user_id", data.user.id);

        const roleNames = roles?.map((r) => r.role) || [];
        if (!roleNames.includes("staff") && !roleNames.includes("admin")) {
          await supabase.auth.signOut();
          throw new Error("Você não tem permissão de staff. Use o login de cliente.");
        }

        toast({
          title: "Login realizado!",
          description: "Bem-vindo, Staff!",
        });
      } else {
        // Staff registration - create user first
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: `${window.location.origin}/auth/staff`,
            data: {
              full_name: fullName,
            },
          },
        });

        if (error) {
          if (error.message.includes("already registered")) {
            throw new Error("Este email já está cadastrado. Tente fazer login.");
          }
          throw error;
        }

        if (data.user) {
          // Add staff role
          const { error: roleError } = await supabase
            .from("user_roles")
            .insert({ user_id: data.user.id, role: "staff" });

          if (roleError) {
            console.error("Error adding staff role:", roleError);
          }
        }

        toast({
          title: "Conta Staff criada!",
          description: "Você já pode fazer login.",
        });
        setIsLogin(true);
      }
    } catch (error: any) {
      console.error("Auth error:", error);
      toast({
        title: "Erro",
        description: error.message || "Ocorreu um erro. Tente novamente.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-8 theme-admin">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="flex items-center justify-center gap-3 mb-8">
          <div className="p-3 rounded-xl bg-accent/10">
            <ClipboardCheck className="w-8 h-8 text-accent" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-accent">STAFF PANEL</h1>
            <p className="text-sm text-muted-foreground">Acesso para funcionários</p>
          </div>
        </div>

        <GlassCard className="p-6 border-accent/30">
          <div className="mb-6">
            <h2 className="text-xl font-bold">
              {isLogin ? "Entrar como Staff" : "Cadastrar Staff"}
            </h2>
            <p className="text-sm text-muted-foreground">
              {isLogin 
                ? "Faça login para acessar o painel de staff" 
                : "Crie sua conta de funcionário"}
            </p>
          </div>

          <form onSubmit={handleAuth} className="space-y-4">
            {!isLogin && (
              <div className="space-y-2">
                <Label htmlFor="fullName">Nome completo</Label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    id="fullName"
                    type="text"
                    placeholder="Seu nome"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  id="email"
                  type="email"
                  placeholder="staff@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Senha</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            <Button
              type="submit"
              className="w-full gap-2 bg-accent hover:bg-accent/90"
              disabled={loading}
            >
              {loading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <>
                  {isLogin ? "Entrar" : "Cadastrar"}
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </Button>
          </form>

          <div className="mt-6 text-center">
            <button
              type="button"
              onClick={() => setIsLogin(!isLogin)}
              className="text-sm text-muted-foreground hover:text-accent transition-colors"
            >
              {isLogin 
                ? "Não tem conta? Cadastre-se como Staff" 
                : "Já tem conta? Faça login"}
            </button>
          </div>
        </GlassCard>
      </div>
    </div>
  );
}
