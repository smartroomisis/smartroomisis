import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { Navigation } from "@/components/Navigation";
import { useAuth } from "@/hooks/useAuth";
import Landing from "./pages/Landing";
import Dashboard from "./pages/Dashboard";
import Booking from "./pages/Booking";
import Admin from "./pages/Admin";
import Staff from "./pages/Staff";
import Profile from "./pages/Profile";
import Support from "./pages/Support";
import StaffProblems from "./pages/StaffProblems";
import StaffPayments from "./pages/StaffPayments";
import Auth from "./pages/Auth";
import AuthStaff from "./pages/AuthStaff";
import AuthAdmin from "./pages/AuthAdmin";
import NotFound from "./pages/NotFound";
import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

const queryClient = new QueryClient();

// Protected route that requires authentication
function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  return <>{children}</>;
}

// Admin-only route protection
function AdminRoute({ children }: { children: React.ReactNode }) {
  const { user, loading, isAdmin } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  // If not admin, redirect to home
  if (!isAdmin) {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
}

// Staff-only route protection
function StaffRoute({ children }: { children: React.ReactNode }) {
  const { user, loading, isAdmin, isStaff } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  // Admins can access staff routes too
  if (!isAdmin && !isStaff) {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
}

function AppContent() {
  const { user, loading, isAdmin, isStaff } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  // Determine theme class based on user role
  const getThemeClass = () => {
    if (isAdmin || isStaff) return "theme-admin";
    return "theme-client";
  };

  return (
    <div className={cn("min-h-screen bg-background", user && getThemeClass())}>
      {user && <Navigation />}
      <Routes>
        {/* Public Landing Page */}
        <Route
          path="/"
          element={
            user ? (
              isAdmin ? <Navigate to="/admin" replace /> : isStaff ? <Navigate to="/staff" replace /> : <Navigate to="/dashboard" replace />
            ) : (
              <Landing />
            )
          }
        />
        
        {/* Auth Routes - separate for each role */}
        <Route path="/auth" element={user ? <Navigate to="/dashboard" replace /> : <Auth />} />
        <Route path="/auth/staff" element={<AuthStaff />} />
        <Route path="/auth/admin" element={<AuthAdmin />} />
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/booking"
          element={
            <ProtectedRoute>
              <Booking />
            </ProtectedRoute>
          }
        />
        <Route
          path="/profile"
          element={
            <ProtectedRoute>
              <Profile />
            </ProtectedRoute>
          }
        />
        <Route
          path="/support"
          element={
            <ProtectedRoute>
              <Support />
            </ProtectedRoute>
          }
        />
        
        {/* Admin Routes */}
        <Route
          path="/admin"
          element={
            <AdminRoute>
              <Admin />
            </AdminRoute>
          }
        />
        
        {/* Staff Routes */}
        <Route
          path="/staff"
          element={
            <StaffRoute>
              <Staff />
            </StaffRoute>
          }
        />
        <Route
          path="/staff/problems"
          element={
            <StaffRoute>
              <StaffProblems />
            </StaffRoute>
          }
        />
        <Route
          path="/staff/payments"
          element={
            <StaffRoute>
              <StaffPayments />
            </StaffRoute>
          }
        />
        
        <Route path="*" element={<NotFound />} />
      </Routes>
    </div>
  );
}

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AppContent />
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
