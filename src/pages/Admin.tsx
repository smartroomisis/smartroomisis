import { useState } from "react";
import { AdminMetrics } from "@/components/AdminMetrics";
import { AdminCharts } from "@/components/AdminCharts";
import { AccessLogs } from "@/components/AccessLogs";
import { DeviceStatus } from "@/components/DeviceStatus";
import { FinancialDashboard } from "@/components/FinancialDashboard";
import { ExpenseForm } from "@/components/ExpenseForm";
import { ReservationCostList } from "@/components/ReservationCostList";
import { StaffPayments } from "@/components/StaffPayments";
import { StaffManagement } from "@/components/StaffManagement";
import { SystemSettings } from "@/components/SystemSettings";
import { CouponManager } from "@/components/CouponManager";
import { ManagementReports } from "@/components/ManagementReports";
import { DASMEIControl } from "@/components/DASMEIControl";
import { MEILimitDashboard } from "@/components/MEILimitDashboard";
import { EnterpriseCompanies } from "@/components/EnterpriseCompanies";
import { AdminCreditManager } from "@/components/AdminCreditManager";
import { SubscriptionPlansEditor } from "@/components/SubscriptionPlansEditor";
import { AdminReservationCalendar } from "@/components/AdminReservationCalendar";
import { useAuth } from "@/hooks/useAuth";
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
  Target,
  Building2,
  Wallet,
  CreditCard,
  Calendar
} from "lucide-react";

export default function Admin() {
  const [activeTab, setActiveTab] = useState("reservations");
  const { signOut, isAdmin } = useAuth();

  // This page is already protected by AdminRoute, but double-check
  if (!isAdmin) {
    return null;
  }

  return (
    <div className="min-h-screen pb-24 md:pt-20 md:pb-8 theme-admin">
      <div className="container mx-auto px-4 py-6 max-w-6xl">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3 md:hidden">
            <Zap className="w-6 h-6 text-primary" />
            <h1 className="text-xl font-bold neon-text">ADMIN PANEL</h1>
          </div>
          <div className="hidden md:block" />
          <Button variant="outline" size="sm" onClick={signOut}>
            <LogOut className="w-4 h-4 mr-2" />
            Sair
          </Button>
        </div>

        {/* Page Title */}
        <div className="mb-6">
          <h2 className="text-2xl font-bold">Painel Administrativo</h2>
          <p className="text-muted-foreground text-sm">
            Reservas, financeiro e configurações do sistema
          </p>
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-4 lg:grid-cols-10 lg:w-auto lg:inline-grid gap-1">
            <TabsTrigger value="reservations" className="flex items-center gap-2">
              <Calendar className="w-4 h-4" />
              <span className="hidden sm:inline">Reservas</span>
            </TabsTrigger>
            <TabsTrigger value="financial" className="flex items-center gap-2">
              <DollarSign className="w-4 h-4" />
              <span className="hidden sm:inline">Financeiro</span>
            </TabsTrigger>
            <TabsTrigger value="companies" className="flex items-center gap-2">
              <Building2 className="w-4 h-4" />
              <span className="hidden sm:inline">Empresas</span>
            </TabsTrigger>
            <TabsTrigger value="credits" className="flex items-center gap-2">
              <Wallet className="w-4 h-4" />
              <span className="hidden sm:inline">Créditos</span>
            </TabsTrigger>
            <TabsTrigger value="plans" className="flex items-center gap-2">
              <CreditCard className="w-4 h-4" />
              <span className="hidden sm:inline">Planos</span>
            </TabsTrigger>
            <TabsTrigger value="staff" className="flex items-center gap-2">
              <Users className="w-4 h-4" />
              <span className="hidden sm:inline">Colaboradores</span>
            </TabsTrigger>
            <TabsTrigger value="reports" className="flex items-center gap-2">
              <FileBarChart className="w-4 h-4" />
              <span className="hidden sm:inline">Relatórios</span>
            </TabsTrigger>
            <TabsTrigger value="mei" className="flex items-center gap-2">
              <Target className="w-4 h-4" />
              <span className="hidden sm:inline">MEI</span>
            </TabsTrigger>
            <TabsTrigger value="das" className="flex items-center gap-2">
              <FileText className="w-4 h-4" />
              <span className="hidden sm:inline">DAS</span>
            </TabsTrigger>
            <TabsTrigger value="settings" className="flex items-center gap-2">
              <Settings className="w-4 h-4" />
              <span className="hidden sm:inline">Config</span>
            </TabsTrigger>
          </TabsList>

          {/* Reservations Calendar Tab */}
          <TabsContent value="reservations" className="space-y-6">
            <AdminReservationCalendar />
          </TabsContent>

          {/* Financial Tab */}
          <TabsContent value="financial" className="space-y-6">
            <FinancialDashboard />
            <div className="grid gap-6 md:grid-cols-2">
              <ExpenseForm />
              <ReservationCostList />
            </div>
          </TabsContent>

          {/* Enterprise Companies Tab */}
          <TabsContent value="companies" className="space-y-6">
            <EnterpriseCompanies />
          </TabsContent>

          {/* Credits Management Tab */}
          <TabsContent value="credits" className="space-y-6">
            <AdminCreditManager />
          </TabsContent>

          {/* Subscription Plans Tab - with editable pricing */}
          <TabsContent value="plans" className="space-y-6">
            <SubscriptionPlansEditor />
          </TabsContent>

          {/* Staff Management Tab */}
          <TabsContent value="staff" className="space-y-6">
            <StaffManagement />
            <StaffPayments />
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

          {/* Settings Tab - without pricing (moved to Plans) */}
          <TabsContent value="settings" className="space-y-6">
            <SystemSettings />
            <CouponManager />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
