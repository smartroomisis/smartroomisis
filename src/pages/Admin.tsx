import { AdminMetrics } from "@/components/AdminMetrics";
import { AccessLogs } from "@/components/AccessLogs";
import { DeviceStatus } from "@/components/DeviceStatus";
import { Zap } from "lucide-react";

export default function Admin() {
  return (
    <div className="min-h-screen pb-24 md:pt-20 md:pb-8">
      <div className="container mx-auto px-4 py-6 max-w-6xl">
        {/* Header */}
        <div className="flex items-center gap-3 mb-6 md:hidden">
          <Zap className="w-6 h-6 text-primary" />
          <h1 className="text-xl font-bold neon-text">Smart Room SJC</h1>
        </div>

        {/* Page Title */}
        <div className="mb-6">
          <h2 className="text-2xl font-bold">Painel Administrativo</h2>
          <p className="text-muted-foreground text-sm">
            Métricas e monitoramento da sala
          </p>
        </div>

        {/* Metrics */}
        <AdminMetrics />

        {/* Logs and Devices */}
        <div className="grid gap-6 md:grid-cols-2 mt-6">
          <AccessLogs />
          <DeviceStatus />
        </div>
      </div>
    </div>
  );
}
