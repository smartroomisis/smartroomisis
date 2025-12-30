import { useState } from "react";
import { GlassCard } from "@/components/GlassCard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Lock, Shield, AlertCircle } from "lucide-react";

// Admin emails authorized to access
const ADMIN_EMAILS = ["admin@smartroom.com", "isis@smartroom.com"];
const ADMIN_PASSWORD = "SMART2024ISIS"; // Default password

interface AdminAuthProps {
  onAuthenticated: () => void;
}

export function AdminAuth({ onAuthenticated }: AdminAuthProps) {
  const [authMethod, setAuthMethod] = useState<"password" | "email">("password");
  const [password, setPassword] = useState("");
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handlePasswordAuth = () => {
    setIsLoading(true);
    setError("");
    
    // Simple password check (in production, use server-side validation)
    if (password === ADMIN_PASSWORD) {
      sessionStorage.setItem("admin_authenticated", "true");
      sessionStorage.setItem("admin_auth_time", Date.now().toString());
      onAuthenticated();
    } else {
      setError("Senha incorreta. Tente novamente.");
    }
    setIsLoading(false);
  };

  const handleEmailAuth = () => {
    setIsLoading(true);
    setError("");
    
    const normalizedEmail = email.toLowerCase().trim();
    if (ADMIN_EMAILS.includes(normalizedEmail)) {
      sessionStorage.setItem("admin_authenticated", "true");
      sessionStorage.setItem("admin_email", normalizedEmail);
      sessionStorage.setItem("admin_auth_time", Date.now().toString());
      onAuthenticated();
    } else {
      setError("Este email não possui acesso de administrador.");
    }
    setIsLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <GlassCard className="max-w-md w-full p-8 neon-border">
        <div className="text-center mb-8">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-primary/10 flex items-center justify-center">
            <Shield className="w-8 h-8 text-primary" />
          </div>
          <h1 className="text-2xl font-bold neon-text">Acesso Administrativo</h1>
          <p className="text-muted-foreground text-sm mt-2">
            SMART ROOM ISIS - Área Restrita
          </p>
        </div>

        {/* Auth Method Toggle */}
        <div className="flex gap-2 mb-6">
          <Button
            variant={authMethod === "password" ? "default" : "outline"}
            className="flex-1"
            onClick={() => setAuthMethod("password")}
          >
            <Lock className="w-4 h-4 mr-2" />
            Senha
          </Button>
          <Button
            variant={authMethod === "email" ? "default" : "outline"}
            className="flex-1"
            onClick={() => setAuthMethod("email")}
          >
            <Shield className="w-4 h-4 mr-2" />
            Email
          </Button>
        </div>

        {authMethod === "password" ? (
          <div className="space-y-4">
            <div>
              <Label htmlFor="password">Senha de Administrador</Label>
              <Input
                id="password"
                type="password"
                placeholder="Digite a senha"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handlePasswordAuth()}
                className="mt-2"
              />
            </div>
            <Button 
              className="w-full" 
              onClick={handlePasswordAuth}
              disabled={isLoading || !password}
            >
              Acessar Painel
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            <div>
              <Label htmlFor="email">Email do Administrador</Label>
              <Input
                id="email"
                type="email"
                placeholder="admin@smartroom.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleEmailAuth()}
                className="mt-2"
              />
            </div>
            <Button 
              className="w-full" 
              onClick={handleEmailAuth}
              disabled={isLoading || !email}
            >
              Verificar Email
            </Button>
          </div>
        )}

        {error && (
          <div className="mt-4 p-3 rounded-lg bg-destructive/10 border border-destructive/30 flex items-center gap-2 text-destructive text-sm">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            {error}
          </div>
        )}

        <p className="text-xs text-muted-foreground text-center mt-6">
          Acesso restrito a funcionários autorizados
        </p>
      </GlassCard>
    </div>
  );
}

export function checkAdminAuth(): boolean {
  const authenticated = sessionStorage.getItem("admin_authenticated");
  const authTime = sessionStorage.getItem("admin_auth_time");
  
  if (!authenticated || !authTime) return false;
  
  // Session expires after 4 hours
  const fourHours = 4 * 60 * 60 * 1000;
  if (Date.now() - parseInt(authTime) > fourHours) {
    sessionStorage.removeItem("admin_authenticated");
    sessionStorage.removeItem("admin_auth_time");
    return false;
  }
  
  return true;
}

export function logoutAdmin(): void {
  sessionStorage.removeItem("admin_authenticated");
  sessionStorage.removeItem("admin_email");
  sessionStorage.removeItem("admin_auth_time");
}
