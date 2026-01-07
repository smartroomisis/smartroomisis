import { Link, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { 
  LayoutDashboard, 
  Calendar, 
  Settings, 
  Zap, 
  ClipboardCheck,
  User,
  Headphones,
  AlertTriangle,
  Wallet,
  LogOut
} from "lucide-react";

interface NavItem {
  path: string;
  label: string;
  icon: React.ElementType;
  roles: string[];
}

// Navigation items based on role
const allNavItems: NavItem[] = [
  // Client menu items
  { path: "/", label: "Início", icon: LayoutDashboard, roles: ["user"] },
  { path: "/booking", label: "Reservar", icon: Calendar, roles: ["user"] },
  { path: "/profile", label: "Perfil", icon: User, roles: ["user"] },
  { path: "/support", label: "Suporte", icon: Headphones, roles: ["user"] },
  
  // Staff menu items
  { path: "/staff", label: "Limpeza", icon: ClipboardCheck, roles: ["staff"] },
  { path: "/staff/problems", label: "Problemas", icon: AlertTriangle, roles: ["staff"] },
  { path: "/staff/payments", label: "Pagamentos", icon: Wallet, roles: ["staff"] },
  
  // Admin menu items
  { path: "/admin", label: "Painel", icon: Settings, roles: ["admin"] },
];

export function Navigation() {
  const location = useLocation();
  const { roles, isAdmin, isStaff, profile, signOut } = useAuth();

  // Determine which nav items to show based on user role
  const getNavItems = () => {
    if (isAdmin) {
      return allNavItems.filter(item => item.roles.includes("admin"));
    }
    if (isStaff) {
      return allNavItems.filter(item => item.roles.includes("staff"));
    }
    // Default to user/client view
    return allNavItems.filter(item => item.roles.includes("user"));
  };

  const navItems = getNavItems();

  // Get theme class based on role
  const getThemeClass = () => {
    if (isAdmin || isStaff) return "theme-admin";
    return "theme-client";
  };

  // Get brand text based on role
  const getBrandText = () => {
    if (isAdmin) return "ADMIN PANEL";
    if (isStaff) return "STAFF PANEL";
    return "SMART ROOM OFFICE";
  };

  return (
    <nav className={cn(
      "fixed bottom-0 left-0 right-0 z-50 glass-card border-t border-border/50 px-4 py-2 md:top-0 md:bottom-auto md:border-t-0 md:border-b",
      getThemeClass()
    )}>
      <div className="container mx-auto flex items-center justify-between">
        {/* Logo - visible on desktop */}
        <Link
          to={isAdmin ? "/admin" : isStaff ? "/staff" : "/"}
          className="hidden md:flex items-center gap-2 text-primary font-semibold"
        >
          <Zap className="w-5 h-5" />
          <span className="neon-text">{getBrandText()}</span>
        </Link>

        {/* Navigation Items */}
        <div className="flex items-center justify-around w-full md:w-auto md:gap-1">
          {navItems.map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={`${item.path}-${item.label}`}
                to={item.path}
                className={cn(
                  "flex flex-col md:flex-row items-center gap-1 md:gap-2 px-4 py-2 rounded-lg transition-all duration-200",
                  isActive
                    ? "text-primary bg-primary/10"
                    : "text-muted-foreground hover:text-foreground hover:bg-secondary"
                )}
              >
                <item.icon className={cn("w-5 h-5", isActive && "glow-primary")} />
                <span className="text-xs md:text-sm font-medium">{item.label}</span>
              </Link>
            );
          })}

          {/* Logout button for mobile */}
          <button
            onClick={signOut}
            className="flex flex-col md:hidden items-center gap-1 px-4 py-2 rounded-lg transition-all duration-200 text-muted-foreground hover:text-destructive hover:bg-destructive/10"
          >
            <LogOut className="w-5 h-5" />
            <span className="text-xs font-medium">Sair</span>
          </button>
        </div>

        {/* User info and logout for desktop */}
        <div className="hidden md:flex items-center gap-3">
          {profile?.enterprise_company_id && (
            <span className="text-xs px-2 py-1 bg-accent/20 text-accent rounded-full">
              Corporativo
            </span>
          )}
          {isAdmin && (
            <span className="text-xs px-2 py-1 bg-primary/20 text-primary rounded-full">
              Admin
            </span>
          )}
          {isStaff && !isAdmin && (
            <span className="text-xs px-2 py-1 bg-accent/20 text-accent rounded-full">
              Staff
            </span>
          )}
          <Button variant="ghost" size="sm" onClick={signOut} className="text-muted-foreground hover:text-destructive">
            <LogOut className="w-4 h-4 mr-1" />
            Sair
          </Button>
        </div>
      </div>
    </nav>
  );
}
