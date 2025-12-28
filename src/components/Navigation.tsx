import { Link, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";
import { LayoutDashboard, Calendar, Settings, Zap, ClipboardCheck } from "lucide-react";

const navItems = [
  { path: "/", label: "Dashboard", icon: LayoutDashboard },
  { path: "/booking", label: "Reservar", icon: Calendar },
  { path: "/staff", label: "Staff", icon: ClipboardCheck },
  { path: "/admin", label: "Admin", icon: Settings },
];

export function Navigation() {
  const location = useLocation();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 glass-card border-t border-border/50 px-4 py-2 md:top-0 md:bottom-auto md:border-t-0 md:border-b">
      <div className="container mx-auto flex items-center justify-between">
        {/* Logo - visible on desktop */}
        <Link
          to="/"
          className="hidden md:flex items-center gap-2 text-primary font-semibold"
        >
          <Zap className="w-5 h-5" />
          <span className="neon-text">SMART ROOM ISIS</span>
        </Link>

        {/* Navigation Items */}
        <div className="flex items-center justify-around w-full md:w-auto md:gap-1">
          {navItems.map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.path}
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
        </div>

        {/* Spacer for desktop */}
        <div className="hidden md:block w-40" />
      </div>
    </nav>
  );
}
