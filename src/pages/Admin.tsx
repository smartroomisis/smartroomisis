import { useState, useEffect } from "react";
import { AdminMetrics } from "@/components/AdminMetrics";
import { AdminCharts } from "@/components/AdminCharts";
import { AccessLogs } from "@/components/AccessLogs";
import { DeviceStatus } from "@/components/DeviceStatus";
import { FinancialDashboard } from "@/components/FinancialDashboard";
import { ExpenseForm } from "@/components/ExpenseForm";
import { ReservationCostList } from "@/components/ReservationCostList";
import { StaffPayments } from "@/components/StaffPayments";
import { SystemSettings } from "@/components/SystemSettings";
import { CouponManager } from "@/components/CouponManager";
import { ManagementReports } from "@/components/ManagementReports";
import { DASMEIControl } from "@/components/DASMEIControl";
import { MEILimitDashboard } from "@/components/MEILimitDashboard";
import { AdminAuth, checkAdminAuth, logoutAdmin } from "@/components/AdminAuth";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { 
  Zap, 
  LayoutDashboard, 
  DollarSign, 
  Users, 
  Settings, 
  LogOut,
  FileBarChart,
  FileText,
  Target
} from "lucide-react";

export default function Admin() {
  const [activeTab, setActiveTab] = useState("overview");
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    setIsAuthenticated(checkAdminAuth());
  }, []);

  const handleLogout = () => {
    logoutAdmin();
    setIsAuthenticated(false);
  };

  if (!isAuthenticated) {
    return <AdminAuth onAuthenticated={() => setIsAuthenticated(true)} />;
  }

  return (
    <div className="min-h-screen pb-24 md:pt-20 md:pb-8">
      <div className="container mx-auto px-4 py-6 max-w-6xl">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3 md:hidden">
            <Zap className="w-6 h-6 text-primary" />
            <h1 className="text-xl font-bold neon-text">SMART ROOM ISIS</h1>
          </div>
          <div className="hidden md:block" />
          <Button variant="outline" size="sm" onClick={handleLogout}>
            <LogOut className="w-4 h-4 mr-2" />
            Sair
          </Button>
        </div>

        {/* Page Title */}
        <div className="mb-6">
          <h2 className="text-2xl font-bold">Painel Administrativo</h2>
          <p className="text-muted-foreground text-sm">
            Métricas e monitoramento da sala
          </p>
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-4 lg:grid-cols-7 lg:w-auto lg:inline-grid">
            <TabsTrigger value="overview" className="flex items-center gap-2">
              <LayoutDashboard className="w-4 h-4" />
              <span className="hidden sm:inline">Visão Geral</span>
              <span className="sm:hidden">Geral</span>
            </TabsTrigger>
            <TabsTrigger value="financial" className="flex items-center gap-2">
              <DollarSign className="w-4 h-4" />
              <span className="hidden sm:inline">Financeiro</span>
              <span className="sm:hidden">$</span>
            </TabsTrigger>
            <TabsTrigger value="reports" className="flex items-center gap-2">
              <FileBarChart className="w-4 h-4" />
              <span className="hidden sm:inline">Relatórios</span>
              <span className="sm:hidden">Rel</span>
            </TabsTrigger>
            <TabsTrigger value="mei" className="flex items-center gap-2">
              <Target className="w-4 h-4" />
              <span className="hidden sm:inline">Limite MEI</span>
              <span className="sm:hidden">MEI</span>
            </TabsTrigger>
            <TabsTrigger value="das" className="flex items-center gap-2">
              <FileText className="w-4 h-4" />
              <span className="hidden sm:inline">DAS-MEI</span>
              <span className="sm:hidden">DAS</span>
            </TabsTrigger>
            <TabsTrigger value="staff-payments" className="flex items-center gap-2">
              <Users className="w-4 h-4" />
              <span className="hidden sm:inline">Staff</span>
              <span className="sm:hidden">Staff</span>
            </TabsTrigger>
            <TabsTrigger value="settings" className="flex items-center gap-2">
              <Settings className="w-4 h-4" />
              <span className="hidden sm:inline">Config</span>
              <span className="sm:hidden">⚙️</span>
            </TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            <AdminMetrics />
            <AdminCharts />
            <div className="grid gap-6 md:grid-cols-2">
              <AccessLogs />
              <DeviceStatus />
            </div>
          </TabsContent>

          {/* Financial Tab */}
          <TabsContent value="financial" className="space-y-6">
            <FinancialDashboard />
            <div className="grid gap-6 md:grid-cols-2">
              <ExpenseForm />
              <ReservationCostList />
            </div>
          </TabsContent>

          {/* Reports Tab */}
          <TabsContent value="reports" className="space-y-6">
            <ManagementReports />
          </TabsContent>

          {/* MEI Limit Tab */}
          <TabsContent value="mei" className="space-y-6">
            <MEILimitDashboard />
          </TabsContent>

          {/* DAS-MEI Tab */}
          <TabsContent value="das" className="space-y-6">
            <DASMEIControl />
          </TabsContent>

          {/* Staff Payments Tab */}
          <TabsContent value="staff-payments" className="space-y-6">
            <StaffPayments />
          </TabsContent>

          {/* Settings Tab */}
          <TabsContent value="settings" className="space-y-6">
            <SystemSettings />
            <CouponManager />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}