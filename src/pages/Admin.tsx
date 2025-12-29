import { useState } from "react";
import { AdminMetrics } from "@/components/AdminMetrics";
import { AdminCharts } from "@/components/AdminCharts";
import { AccessLogs } from "@/components/AccessLogs";
import { DeviceStatus } from "@/components/DeviceStatus";
import { FinancialDashboard } from "@/components/FinancialDashboard";
import { ExpenseForm } from "@/components/ExpenseForm";
import { ReservationCostList } from "@/components/ReservationCostList";
import { StaffPayments } from "@/components/StaffPayments";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Zap, LayoutDashboard, DollarSign, Lock, Users } from "lucide-react";

export default function Admin() {
  const [activeTab, setActiveTab] = useState("overview");
  
  // Simple admin check - in production this would use proper auth
  const isAdmin = true; // Replace with actual auth check

  return (
    <div className="min-h-screen pb-24 md:pt-20 md:pb-8">
      <div className="container mx-auto px-4 py-6 max-w-6xl">
        {/* Header */}
        <div className="flex items-center gap-3 mb-6 md:hidden">
          <Zap className="w-6 h-6 text-primary" />
          <h1 className="text-xl font-bold neon-text">SMART ROOM ISIS</h1>
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
          <TabsList className="grid w-full grid-cols-3 lg:w-auto lg:inline-grid">
            <TabsTrigger value="overview" className="flex items-center gap-2">
              <LayoutDashboard className="w-4 h-4" />
              <span className="hidden sm:inline">Visão Geral</span>
              <span className="sm:hidden">Geral</span>
            </TabsTrigger>
            <TabsTrigger value="financial" className="flex items-center gap-2">
              <DollarSign className="w-4 h-4" />
              <span className="hidden sm:inline">Gestão Financeira</span>
              <span className="sm:hidden">Finanças</span>
              {!isAdmin && <Lock className="w-3 h-3" />}
            </TabsTrigger>
            <TabsTrigger value="staff-payments" className="flex items-center gap-2">
              <Users className="w-4 h-4" />
              <span className="hidden sm:inline">Pagamentos Staff</span>
              <span className="sm:hidden">Staff</span>
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
            {isAdmin ? (
              <>
                <FinancialDashboard />
                <div className="grid gap-6 md:grid-cols-2">
                  <ExpenseForm />
                  <ReservationCostList />
                </div>
              </>
            ) : (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <Lock className="w-12 h-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold">Acesso Restrito</h3>
                <p className="text-muted-foreground">
                  Apenas administradores podem visualizar dados financeiros.
                </p>
              </div>
            )}
          </TabsContent>

          {/* Staff Payments Tab */}
          <TabsContent value="staff-payments" className="space-y-6">
            {isAdmin ? (
              <StaffPayments />
            ) : (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <Lock className="w-12 h-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold">Acesso Restrito</h3>
                <p className="text-muted-foreground">
                  Apenas administradores podem gerenciar pagamentos.
                </p>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
