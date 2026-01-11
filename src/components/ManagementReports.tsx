import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { GlassCard } from "@/components/GlassCard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line
} from "recharts";
import { 
  Download, 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  Calendar,
  Users,
  Clock,
  FileBarChart,
  Loader2,
  Building2,
  Filter
} from "lucide-react";
import { format, subDays, startOfMonth, endOfMonth, parseISO } from "date-fns";
import { ptBR } from "date-fns/locale";
import { toast } from "sonner";

interface ReservationData {
  id: string;
  date: string;
  client_name: string;
  client_email: string | null;
  hours: number;
  total_price: number;
  status: string;
  payment_mode: string;
  room_id: string;
}

interface DailyStats {
  date: string;
  reservations: number;
  revenue: number;
  hours: number;
}

interface PlanDistribution {
  name: string;
  value: number;
  color: string;
}

const COLORS = ['hsl(142, 76%, 36%)', 'hsl(221, 83%, 53%)', 'hsl(262, 83%, 58%)', 'hsl(220, 14%, 46%)'];

export function ManagementReports() {
  const [isLoading, setIsLoading] = useState(true);
  const [startDate, setStartDate] = useState(format(startOfMonth(new Date()), 'yyyy-MM-dd'));
  const [endDate, setEndDate] = useState(format(endOfMonth(new Date()), 'yyyy-MM-dd'));
  const [reportType, setReportType] = useState<'reservations' | 'financial' | 'users'>('reservations');
  
  // KPIs
  const [totalRevenue, setTotalRevenue] = useState(0);
  const [totalReservations, setTotalReservations] = useState(0);
  const [totalHours, setTotalHours] = useState(0);
  const [averageTicket, setAverageTicket] = useState(0);
  const [growthRate, setGrowthRate] = useState(0);
  
  // Chart data
  const [dailyStats, setDailyStats] = useState<DailyStats[]>([]);
  const [planDistribution, setPlanDistribution] = useState<PlanDistribution[]>([]);
  const [topClients, setTopClients] = useState<{ name: string; total: number; hours: number }[]>([]);
  
  // Table data
  const [reservations, setReservations] = useState<ReservationData[]>([]);

  useEffect(() => {
    loadReportData();
  }, [startDate, endDate]);

  const loadReportData = async () => {
    setIsLoading(true);
    try {
      // Fetch reservations for the period
      const { data: reservationsData, error } = await supabase
        .from('reservations')
        .select('*')
        .gte('date', startDate)
        .lte('date', endDate)
        .order('date', { ascending: false });

      if (error) throw error;

      const data = (reservationsData || []) as ReservationData[];
      setReservations(data);

      // Calculate KPIs - only count confirmed/completed
      const confirmedReservations = data.filter(r => r.status === 'confirmed' || r.status === 'completed');
      const revenue = confirmedReservations.reduce((sum, r) => sum + Number(r.total_price), 0);
      const hours = confirmedReservations.reduce((sum, r) => sum + Number(r.hours), 0);
      
      setTotalRevenue(revenue);
      setTotalReservations(confirmedReservations.length);
      setTotalHours(hours);
      setAverageTicket(confirmedReservations.length > 0 ? revenue / confirmedReservations.length : 0);

      // Calculate growth rate (compare with previous period)
      const periodDays = Math.ceil((new Date(endDate).getTime() - new Date(startDate).getTime()) / (1000 * 60 * 60 * 24));
      const previousStart = format(subDays(new Date(startDate), periodDays), 'yyyy-MM-dd');
      const previousEnd = format(subDays(new Date(startDate), 1), 'yyyy-MM-dd');

      const { data: previousData } = await supabase
        .from('reservations')
        .select('total_price')
        .gte('date', previousStart)
        .lte('date', previousEnd)
        .in('status', ['confirmed', 'completed']);

      const previousRevenue = (previousData || []).reduce((sum, r) => sum + Number(r.total_price), 0);
      const growth = previousRevenue > 0 ? ((revenue - previousRevenue) / previousRevenue) * 100 : 0;
      setGrowthRate(growth);

      // Calculate daily stats for chart
      const dailyMap = new Map<string, DailyStats>();
      confirmedReservations.forEach(r => {
        const existing = dailyMap.get(r.date) || { date: r.date, reservations: 0, revenue: 0, hours: 0 };
        existing.reservations += 1;
        existing.revenue += Number(r.total_price);
        existing.hours += Number(r.hours);
        dailyMap.set(r.date, existing);
      });
      
      const sortedStats = Array.from(dailyMap.values()).sort((a, b) => a.date.localeCompare(b.date));
      setDailyStats(sortedStats.map(s => ({
        ...s,
        date: format(parseISO(s.date), 'dd/MM', { locale: ptBR })
      })));

      // Calculate payment mode distribution
      const paymentModes = confirmedReservations.reduce((acc, r) => {
        const mode = r.payment_mode || 'credit';
        acc[mode] = (acc[mode] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);

      const modeLabels: Record<string, string> = {
        credit: 'Créditos',
        pix: 'PIX',
        card: 'Cartão',
        enterprise: 'Empresa',
        stripe: 'Stripe'
      };

      setPlanDistribution(Object.entries(paymentModes).map(([key, value], index) => ({
        name: modeLabels[key] || key,
        value,
        color: COLORS[index % COLORS.length]
      })));

      // Calculate top clients
      const clientMap = new Map<string, { name: string; total: number; hours: number }>();
      confirmedReservations.forEach(r => {
        const key = r.client_email || r.client_name;
        const existing = clientMap.get(key) || { name: r.client_name, total: 0, hours: 0 };
        existing.total += Number(r.total_price);
        existing.hours += Number(r.hours);
        clientMap.set(key, existing);
      });

      const sortedClients = Array.from(clientMap.values())
        .sort((a, b) => b.total - a.total)
        .slice(0, 5);
      setTopClients(sortedClients);

    } catch (error) {
      console.error('Error loading report data:', error);
      toast.error('Erro ao carregar relatórios');
    } finally {
      setIsLoading(false);
    }
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  const exportToCSV = () => {
    const headers = ['Data', 'Cliente', 'Email', 'Horas', 'Valor', 'Status', 'Pagamento'];
    const rows = reservations.map(r => [
      format(parseISO(r.date), 'dd/MM/yyyy'),
      r.client_name,
      r.client_email || '',
      r.hours,
      r.total_price,
      r.status,
      r.payment_mode
    ]);

    const csvContent = [
      headers.join(';'),
      ...rows.map(row => row.join(';'))
    ].join('\n');

    const blob = new Blob(['\ufeff' + csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `relatorio-${startDate}-${endDate}.csv`;
    link.click();
    
    toast.success('Relatório exportado com sucesso!');
  };

  const getStatusLabel = (status: string) => {
    const labels: Record<string, string> = {
      confirmed: 'Confirmada',
      completed: 'Concluída',
      cancelled: 'Cancelada',
      pending: 'Pendente'
    };
    return labels[status] || status;
  };

  const getStatusColor = (status: string) => {
    if (status === 'confirmed' || status === 'completed') return 'bg-green-500/20 text-green-500';
    if (status === 'cancelled') return 'bg-red-500/20 text-red-500';
    return 'bg-yellow-500/20 text-yellow-500';
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h3 className="text-xl font-bold flex items-center gap-2">
            <FileBarChart className="w-5 h-5 text-primary" />
            Relatórios Gerenciais
          </h3>
          <p className="text-sm text-muted-foreground">
            Análise completa de reservas, receitas e ocupação
          </p>
        </div>
        <Button onClick={exportToCSV} variant="outline">
          <Download className="w-4 h-4 mr-2" />
          Exportar CSV
        </Button>
      </div>

      {/* Filters */}
      <GlassCard className="p-4">
        <div className="flex items-center gap-2 mb-4">
          <Filter className="w-4 h-4 text-primary" />
          <span className="font-medium">Filtros</span>
        </div>
        <div className="flex flex-wrap gap-4 items-end">
          <div className="space-y-2">
            <Label>Data Inicial</Label>
            <Input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="w-40"
            />
          </div>
          <div className="space-y-2">
            <Label>Data Final</Label>
            <Input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="w-40"
            />
          </div>
          <div className="space-y-2">
            <Label>Tipo de Relatório</Label>
            <Select value={reportType} onValueChange={(v: 'reservations' | 'financial' | 'users') => setReportType(v)}>
              <SelectTrigger className="w-40">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="reservations">Reservas</SelectItem>
                <SelectItem value="financial">Financeiro</SelectItem>
                <SelectItem value="users">Clientes</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </GlassCard>

      {/* KPIs */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <GlassCard className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Receita Total</p>
              <p className="text-2xl font-bold">{formatCurrency(totalRevenue)}</p>
            </div>
            <div className={`p-3 rounded-full ${growthRate >= 0 ? 'bg-green-500/20' : 'bg-red-500/20'}`}>
              <DollarSign className={`w-5 h-5 ${growthRate >= 0 ? 'text-green-500' : 'text-red-500'}`} />
            </div>
          </div>
          <div className={`flex items-center gap-1 mt-2 text-xs ${growthRate >= 0 ? 'text-green-500' : 'text-red-500'}`}>
            {growthRate >= 0 ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
            {Math.abs(growthRate).toFixed(1)}% vs período anterior
          </div>
        </GlassCard>

        <GlassCard className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Reservas</p>
              <p className="text-2xl font-bold">{totalReservations}</p>
            </div>
            <div className="p-3 rounded-full bg-primary/20">
              <Calendar className="w-5 h-5 text-primary" />
            </div>
          </div>
          <p className="text-xs text-muted-foreground mt-2">
            No período selecionado
          </p>
        </GlassCard>

        <GlassCard className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Horas Reservadas</p>
              <p className="text-2xl font-bold">{totalHours}h</p>
            </div>
            <div className="p-3 rounded-full bg-blue-500/20">
              <Clock className="w-5 h-5 text-blue-500" />
            </div>
          </div>
          <p className="text-xs text-muted-foreground mt-2">
            Total de horas ocupadas
          </p>
        </GlassCard>

        <GlassCard className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Ticket Médio</p>
              <p className="text-2xl font-bold">{formatCurrency(averageTicket)}</p>
            </div>
            <div className="p-3 rounded-full bg-purple-500/20">
              <Users className="w-5 h-5 text-purple-500" />
            </div>
          </div>
          <p className="text-xs text-muted-foreground mt-2">
            Por reserva
          </p>
        </GlassCard>
      </div>

      {/* Charts */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Revenue Chart */}
        <GlassCard className="p-4">
          <h4 className="font-semibold mb-4 flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-primary" />
            Receita por Dia
          </h4>
          {dailyStats.length > 0 ? (
            <ResponsiveContainer width="100%" height={250}>
              <LineChart data={dailyStats}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(220, 14%, 20%)" />
                <XAxis dataKey="date" stroke="hsl(220, 14%, 46%)" fontSize={12} />
                <YAxis stroke="hsl(220, 14%, 46%)" fontSize={12} />
                <Tooltip 
                  formatter={(value: number) => formatCurrency(value)}
                  labelStyle={{ color: 'hsl(0, 0%, 100%)' }}
                  contentStyle={{ 
                    backgroundColor: 'hsl(220, 14%, 10%)', 
                    border: '1px solid hsl(220, 14%, 20%)',
                    borderRadius: '8px'
                  }}
                />
                <Line 
                  type="monotone" 
                  dataKey="revenue" 
                  stroke="hsl(142, 76%, 36%)" 
                  strokeWidth={2}
                  dot={{ fill: 'hsl(142, 76%, 36%)' }}
                  name="Receita"
                />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex items-center justify-center h-[250px] text-muted-foreground">
              Sem dados para o período
            </div>
          )}
        </GlassCard>

        {/* Payment Distribution */}
        <GlassCard className="p-4">
          <h4 className="font-semibold mb-4 flex items-center gap-2">
            <DollarSign className="w-4 h-4 text-primary" />
            Formas de Pagamento
          </h4>
          {planDistribution.length > 0 ? (
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie
                  data={planDistribution}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={90}
                  paddingAngle={5}
                  dataKey="value"
                  label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                >
                  {planDistribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex items-center justify-center h-[250px] text-muted-foreground">
              Sem dados para o período
            </div>
          )}
        </GlassCard>

        {/* Reservations per Day */}
        <GlassCard className="p-4">
          <h4 className="font-semibold mb-4 flex items-center gap-2">
            <Calendar className="w-4 h-4 text-primary" />
            Reservas por Dia
          </h4>
          {dailyStats.length > 0 ? (
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={dailyStats}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(220, 14%, 20%)" />
                <XAxis dataKey="date" stroke="hsl(220, 14%, 46%)" fontSize={12} />
                <YAxis stroke="hsl(220, 14%, 46%)" fontSize={12} />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'hsl(220, 14%, 10%)', 
                    border: '1px solid hsl(220, 14%, 20%)',
                    borderRadius: '8px'
                  }}
                />
                <Bar 
                  dataKey="reservations" 
                  fill="hsl(221, 83%, 53%)" 
                  radius={[4, 4, 0, 0]}
                  name="Reservas"
                />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex items-center justify-center h-[250px] text-muted-foreground">
              Sem dados para o período
            </div>
          )}
        </GlassCard>

        {/* Top Clients */}
        <GlassCard className="p-4">
          <h4 className="font-semibold mb-4 flex items-center gap-2">
            <Building2 className="w-4 h-4 text-primary" />
            Top 5 Clientes
          </h4>
          {topClients.length > 0 ? (
            <div className="space-y-3">
              {topClients.map((client, index) => (
                <div key={index} className="flex items-center justify-between p-2 rounded-lg bg-muted/30">
                  <div className="flex items-center gap-3">
                    <span className="w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center text-xs font-bold">
                      {index + 1}
                    </span>
                    <div>
                      <p className="font-medium text-sm">{client.name}</p>
                      <p className="text-xs text-muted-foreground">{client.hours}h reservadas</p>
                    </div>
                  </div>
                  <p className="font-semibold text-primary">{formatCurrency(client.total)}</p>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex items-center justify-center h-[200px] text-muted-foreground">
              Sem dados para o período
            </div>
          )}
        </GlassCard>
      </div>

      {/* Reservations Table */}
      <GlassCard className="p-4">
        <h4 className="font-semibold mb-4">Detalhamento de Reservas</h4>
        {reservations.length > 0 ? (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Data</TableHead>
                  <TableHead>Cliente</TableHead>
                  <TableHead>Horas</TableHead>
                  <TableHead>Valor</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Pagamento</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {reservations.slice(0, 10).map((reservation) => (
                  <TableRow key={reservation.id}>
                    <TableCell>{format(parseISO(reservation.date), 'dd/MM/yyyy')}</TableCell>
                    <TableCell>{reservation.client_name}</TableCell>
                    <TableCell>{reservation.hours}h</TableCell>
                    <TableCell>{formatCurrency(reservation.total_price)}</TableCell>
                    <TableCell>
                      <span className={`px-2 py-1 rounded-full text-xs ${getStatusColor(reservation.status)}`}>
                        {getStatusLabel(reservation.status)}
                      </span>
                    </TableCell>
                    <TableCell className="capitalize">{reservation.payment_mode}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            {reservations.length > 10 && (
              <p className="text-sm text-muted-foreground mt-2 text-center">
                Mostrando 10 de {reservations.length} reservas. Exporte para ver todas.
              </p>
            )}
          </div>
        ) : (
          <div className="flex items-center justify-center py-8 text-muted-foreground">
            Nenhuma reserva encontrada no período selecionado
          </div>
        )}
      </GlassCard>
    </div>
  );
}
