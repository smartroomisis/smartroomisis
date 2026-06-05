import { useState, useEffect } from "react";
import { useNavigate, useSearchParams, Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { GlassCard } from "@/components/GlassCard";
import { TermsOfUseModal } from "@/components/TermsOfUseModal";
import { GoogleAuthButton } from "@/components/GoogleAuthButton";
import { 
  Zap, 
  Loader2, 
  Mail, 
  Lock, 
  User, 
  ArrowRight, 
  ArrowLeft,
  Phone,
  Building2,
  FileText,
  Globe,
  CreditCard,
  Clock,
  Users
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { z } from "zod";

type ProfileType = "ondemand" | "subscription" | "corporate" | null;

const baseSchema = z.object({
  fullName: z.string().min(2, "Nome deve ter pelo menos 2 caracteres").max(100),
  email: z.string().email("Email inválido").max(255),
  phone: z.string().min(10, "WhatsApp inválido").max(20),
  password: z.string().min(6, "Senha deve ter pelo menos 6 caracteres").max(100),
  acceptTerms: z.literal(true, {
    errorMap: () => ({ message: "Você deve aceitar os termos de uso" }),
  }),
});

const corporateSchema = baseSchema.extend({
  companyName: z.string().min(2, "Razão social é obrigatória").max(200),
  cnpj: z.string().min(14, "CNPJ inválido").max(18),
  companyDomain: z.string().min(3, "Domínio inválido").max(100),
});

export default function Auth() {
  const [searchParams] = useSearchParams();
  const initialMode = searchParams.get("mode") === "register" ? "register" : "login";
  const initialPlan = searchParams.get("plan") as ProfileType;
  
  const [mode, setMode] = useState<"login" | "register">(initialMode);
  const [selectedProfile, setSelectedProfile] = useState<ProfileType>(initialPlan || null);
  const [loading, setLoading] = useState(false);
  const [termsOpen, setTermsOpen] = useState(false);
  
  // Form fields
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [companyName, setCompanyName] = useState("");
  const [cnpj, setCnpj] = useState("");
  const [companyDomain, setCompanyDomain] = useState("");
  const [acceptTerms, setAcceptTerms] = useState(false);
  
  const navigate = useNavigate();
  const { toast } = useToast();

  const getRedirectPath = async (userId: string): Promise<string> => {
    try {
      const { data: roles, error } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", userId);

      if (error) {
        console.error("Error fetching roles:", error);
        return "/dashboard";
      }

      const roleNames = roles?.map((r) => r.role) || [];
      
      if (roleNames.includes("admin")) {
        return "/admin";
      }
      if (roleNames.includes("staff")) {
        return "/staff";
      }
      return "/dashboard";
    } catch (error) {
      console.error("Error in getRedirectPath:", error);
      return "/dashboard";
    }
  };

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (session?.user) {
        setTimeout(async () => {
          const path = await getRedirectPath(session.user.id);
          navigate(path, { replace: true });
        }, 0);
      }
    });

    supabase.auth.getSession().then(async ({ data: { session } }) => {
      if (session?.user) {
        const path = await getRedirectPath(session.user.id);
        navigate(path, { replace: true });
      }
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

  const formatPhone = (value: string) => {
    const numbers = value.replace(/\D/g, "");
    if (numbers.length <= 2) return numbers;
    if (numbers.length <= 7) return `(${numbers.slice(0, 2)}) ${numbers.slice(2)}`;
    return `(${numbers.slice(0, 2)}) ${numbers.slice(2, 7)}-${numbers.slice(7, 11)}`;
  };

  const formatCNPJ = (value: string) => {
    const numbers = value.replace(/\D/g, "");
    if (numbers.length <= 2) return numbers;
    if (numbers.length <= 5) return `${numbers.slice(0, 2)}.${numbers.slice(2)}`;
    if (numbers.length <= 8) return `${numbers.slice(0, 2)}.${numbers.slice(2, 5)}.${numbers.slice(5)}`;
    if (numbers.length <= 12) return `${numbers.slice(0, 2)}.${numbers.slice(2, 5)}.${numbers.slice(5, 8)}/${numbers.slice(8)}`;
    return `${numbers.slice(0, 2)}.${numbers.slice(2, 5)}.${numbers.slice(5, 8)}/${numbers.slice(8, 12)}-${numbers.slice(12, 14)}`;
  };

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (mode === "login") {
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
        const { error } = await supabase.auth.signInWithPassword({
          email: email.trim(),
          password,
        });

        if (error) throw error;

        toast({
          title: "Login realizado!",
          description: "Bem-vindo de volta!",
        });
      } catch (error: any) {
        toast({
          title: "Erro",
          description: error.message || "Ocorreu um erro. Tente novamente.",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
      return;
    }

    // Registration validation
    try {
      const formData = {
        fullName: fullName.trim(),
        email: email.trim(),
        phone: phone.replace(/\D/g, ""),
        password,
        acceptTerms,
        ...(selectedProfile === "corporate" && {
          companyName: companyName.trim(),
          cnpj: cnpj.replace(/\D/g, ""),
          companyDomain: companyDomain.trim(),
        }),
      };

      const schema = selectedProfile === "corporate" ? corporateSchema : baseSchema;
      schema.parse(formData);

      setLoading(true);

      const { error } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
        options: {
          emailRedirectTo: `${window.location.origin}/`,
          data: {
            full_name: formData.fullName,
            phone: formData.phone,
            profile_type: selectedProfile,
            ...(selectedProfile === "corporate" && {
              company_name: formData.companyName,
              cnpj: formData.cnpj,
              company_domain: formData.companyDomain,
            }),
          },
        },
      });

      if (error) {
        if (error.message.includes("already registered")) {
          throw new Error("Este email já está cadastrado. Tente fazer login.");
        }
        throw error;
      }

      toast({
        title: "Conta criada!",
        description: "Você já pode fazer login.",
      });
      setMode("login");
    } catch (error: any) {
      if (error instanceof z.ZodError) {
        toast({
          title: "Erro de validação",
          description: error.errors[0].message,
          variant: "destructive",
        });
      } else {
        toast({
          title: "Erro",
          description: error.message || "Ocorreu um erro. Tente novamente.",
          variant: "destructive",
        });
      }
    } finally {
      setLoading(false);
    }
  };

  const profileCards = [
    {
      id: "ondemand" as ProfileType,
      icon: Clock,
      title: "On-Demand",
      description: "Uso avulso, pague por hora",
    },
    {
      id: "subscription" as ProfileType,
      icon: CreditCard,
      title: "Assinatura",
      description: "Membro com benefícios",
    },
    {
      id: "corporate" as ProfileType,
      icon: Users,
      title: "Corporativo",
      description: "Contas para empresas",
    },
  ];

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-8 theme-landing">
      <div className="w-full max-w-md">
        {/* Logo */}
        <Link to="/" className="flex items-center justify-center gap-3 mb-8 group">
          <div className="p-3 rounded-xl bg-primary/10 glow-primary group-hover:bg-primary/20 transition-colors">
            <Zap className="w-8 h-8 text-primary" />
          </div>
          <div>
            <h1 className="text-2xl font-bold neon-text">SMART ROOM — Login e Cadastro</h1>
            <p className="text-sm text-muted-foreground">Sala de reuniões inteligente</p>
          </div>
        </Link>

        <GlassCard className="p-6">
          {mode === "login" ? (
            <>
              <div className="mb-6">
                <h2 className="text-xl font-bold">Entrar</h2>
                <p className="text-sm text-muted-foreground">
                  Faça login para acessar sua conta
                </p>
              </div>

              <form onSubmit={handleAuth} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      id="email"
                      type="email"
                      placeholder="seu@email.com"
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

                <Button type="submit" className="w-full gap-2" disabled={loading}>
                  {loading ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <>
                      Entrar
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </Button>
              </form>

              <div className="relative my-6">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t border-border" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-card px-2 text-muted-foreground">ou continue com</span>
                </div>
              </div>

              <GoogleAuthButton mode="login" />

              <div className="mt-6 text-center">
                <button
                  type="button"
                  onClick={() => setMode("register")}
                  className="text-sm text-muted-foreground hover:text-primary transition-colors"
                >
                  Não tem conta? Cadastre-se
                </button>
              </div>
            </>
          ) : (
            <>
              {/* Registration Flow */}
              {!selectedProfile ? (
                <>
                  <div className="mb-6">
                    <h2 className="text-xl font-bold">Criar conta</h2>
                    <p className="text-sm text-muted-foreground">
                      Escolha seu tipo de acesso
                    </p>
                  </div>

                  <div className="space-y-3">
                    {profileCards.map((card) => (
                      <button
                        key={card.id}
                        onClick={() => setSelectedProfile(card.id)}
                        className="w-full p-4 rounded-xl border border-border bg-card/50 hover:border-primary/50 hover:bg-card transition-all text-left group"
                      >
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                            <card.icon className="w-6 h-6 text-primary" />
                          </div>
                          <div className="flex-1">
                            <h3 className="font-semibold">{card.title}</h3>
                            <p className="text-sm text-muted-foreground">{card.description}</p>
                          </div>
                          <ArrowRight className="w-5 h-5 text-muted-foreground group-hover:text-primary transition-colors" />
                        </div>
                      </button>
                    ))}
                  </div>

                  <div className="mt-6 text-center">
                    <button
                      type="button"
                      onClick={() => setMode("login")}
                      className="text-sm text-muted-foreground hover:text-primary transition-colors"
                    >
                      Já tem conta? Faça login
                    </button>
                  </div>
                </>
              ) : (
                <>
                  <div className="mb-6">
                    <button
                      onClick={() => setSelectedProfile(null)}
                      className="flex items-center gap-1 text-sm text-muted-foreground hover:text-primary transition-colors mb-3"
                    >
                      <ArrowLeft className="w-4 h-4" />
                      Voltar
                    </button>
                    <h2 className="text-xl font-bold">
                      {profileCards.find(c => c.id === selectedProfile)?.title}
                    </h2>
                    <p className="text-sm text-muted-foreground">
                      Preencha seus dados para criar sua conta
                    </p>
                  </div>

                  <form onSubmit={handleAuth} className="space-y-4">
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

                    <div className="space-y-2">
                      <Label htmlFor="email">Email</Label>
                      <div className="relative">
                        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                        <Input
                          id="email"
                          type="email"
                          placeholder="seu@email.com"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          className="pl-10"
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="phone">WhatsApp</Label>
                      <div className="relative">
                        <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                        <Input
                          id="phone"
                          type="tel"
                          placeholder="(11) 99999-9999"
                          value={phone}
                          onChange={(e) => setPhone(formatPhone(e.target.value))}
                          className="pl-10"
                          maxLength={15}
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

                    {/* Corporate Fields */}
                    {selectedProfile === "corporate" && (
                      <>
                        <div className="pt-2 border-t border-border">
                          <p className="text-sm text-muted-foreground mb-3">Dados da empresa</p>
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="companyName">Razão Social</Label>
                          <div className="relative">
                            <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                            <Input
                              id="companyName"
                              type="text"
                              placeholder="Empresa LTDA"
                              value={companyName}
                              onChange={(e) => setCompanyName(e.target.value)}
                              className="pl-10"
                            />
                          </div>
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="cnpj">CNPJ</Label>
                          <div className="relative">
                            <FileText className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                            <Input
                              id="cnpj"
                              type="text"
                              placeholder="00.000.000/0001-00"
                              value={cnpj}
                              onChange={(e) => setCnpj(formatCNPJ(e.target.value))}
                              className="pl-10"
                              maxLength={18}
                            />
                          </div>
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="companyDomain">Domínio da Empresa</Label>
                          <div className="relative">
                            <Globe className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                            <Input
                              id="companyDomain"
                              type="text"
                              placeholder="empresa.com.br"
                              value={companyDomain}
                              onChange={(e) => setCompanyDomain(e.target.value)}
                              className="pl-10"
                            />
                          </div>
                        </div>
                      </>
                    )}

                    {/* Terms of Use */}
                    <div className="flex items-start gap-2 pt-2">
                      <Checkbox
                        id="terms"
                        checked={acceptTerms}
                        onCheckedChange={(checked) => setAcceptTerms(checked === true)}
                      />
                      <label htmlFor="terms" className="text-sm text-muted-foreground leading-tight cursor-pointer">
                        Li e concordo com os{" "}
                        <button
                          type="button"
                          onClick={() => setTermsOpen(true)}
                          className="text-primary hover:underline"
                        >
                          Termos de Uso
                        </button>
                      </label>
                    </div>

                    <Button type="submit" className="w-full gap-2" disabled={loading}>
                      {loading ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <>
                          Criar conta
                          <ArrowRight className="w-4 h-4" />
                        </>
                      )}
                    </Button>
                  </form>

                  <div className="mt-6 text-center">
                    <button
                      type="button"
                      onClick={() => setMode("login")}
                      className="text-sm text-muted-foreground hover:text-primary transition-colors"
                    >
                      Já tem conta? Faça login
                    </button>
                  </div>
                </>
              )}
            </>
          )}
        </GlassCard>
      </div>

      <TermsOfUseModal open={termsOpen} onOpenChange={setTermsOpen} />
    </div>
  );
}
