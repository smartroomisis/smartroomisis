import { supabase } from "@/integrations/supabase/client";

// N8N Webhook Configuration
export const N8N_WEBHOOK_URL = "https://smartroom-isis.app.n8n.cloud/webhook";

// Authorization Token (easy to change later)
export const AUTH_TOKEN = "SECRET_TOKEN_SJC";

// Room Configuration
export const ROOM_ID = "smart-room-office-01";
export const ROOM_NAME = "SMART ROOM OFFICE";

// N8N Webhook Endpoints
export const N8N_WEBHOOKS = {
  RESERVATION: `${N8N_WEBHOOK_URL}/reserva-smart-room`,
  DOOR_OPEN: `${N8N_WEBHOOK_URL}/sr-ac-abertura-remota`,
  SESSION_CLOSURE: `${N8N_WEBHOOK_URL}/session-closure`,
  ROOM_STATUS: `${N8N_WEBHOOK_URL}/room-status`,
  CONTROL_LIGHTS: `${N8N_WEBHOOK_URL}/control-lights`,
  CONTROL_HVAC: `${N8N_WEBHOOK_URL}/control-hvac`,
  COFFEE: `${N8N_WEBHOOK_URL}/preparar-cafe`,
  STAFF_AUDIT: `${N8N_WEBHOOK_URL}/staff-audit`,
};

// Pricing Configuration
export const CAPSULE_COST = 2.50;
export const CLEANING_FEE = 30.00;

// Staff list
export const STAFF_LIST = [
  { id: "staff_001", name: "João Silva" },
  { id: "staff_002", name: "Maria Santos" },
  { id: "staff_003", name: "Pedro Oliveira" },
  { id: "staff_004", name: "Ana Costa" },
];

// Error messages
export const ERROR_MESSAGES = {
  CONNECTION: "Erro de conexão com a sala. Verifique sua internet ou contate o suporte.",
  ACCESS_DENIED: "Acesso negado: Nenhuma reserva ativa encontrada para este horário.",
  OUT_OF_TIME: "Acesso fora do horário permitido.",
  GENERIC: "Ocorreu um erro. Tente novamente.",
};

// Reservation Validation Interface
export interface ReservationValidation {
  valid: boolean;
  reservation_id?: string;
  client_name?: string;
  access_code?: string | null;
  room_name?: string;
  start_time?: string;
  end_time?: string;
  status?: string;
  has_upcoming?: boolean;
  next_start_time?: string;
  error?: string;
}

// Validate reservation directly via Supabase
export async function validateReservation(
  userId?: string,
  userEmail?: string
): Promise<ReservationValidation> {
  try {
    const now = new Date();
    const todayStr = now.toISOString().split("T")[0];
    const currentTime = now.toTimeString().slice(0, 5); // HH:MM

    // Build query for active reservations today
    let query = supabase
      .from("reservations")
      .select("*")
      .eq("date", todayStr)
      .in("status", ["confirmed", "active", "ativo", "confirmado", "em uso"]);

    if (userId && userId !== "current_user_id") {
      query = query.eq("user_id", userId);
    } else if (userEmail) {
      query = query.eq("client_email", userEmail);
    }

    const { data: reservations, error } = await query;

    if (error) {
      console.error("Error fetching reservations:", error);
      return { valid: false, error: ERROR_MESSAGES.CONNECTION };
    }

    // Find reservation within current time (with 10min tolerance)
    const validRes = reservations?.find((res) => {
      const start = res.start_time; // HH:MM:SS
      const end = res.end_time;

      // Add 10 min tolerance: parse times and compare
      const startParts = start.split(":").map(Number);
      const endParts = end.split(":").map(Number);
      const nowParts = currentTime.split(":").map(Number);

      const startMin = startParts[0] * 60 + startParts[1] - 10;
      const endMin = endParts[0] * 60 + endParts[1] + 10;
      const nowMin = nowParts[0] * 60 + nowParts[1];

      return nowMin >= startMin && nowMin <= endMin;
    });

    if (validRes) {
      return {
        valid: true,
        reservation_id: validRes.id,
        client_name: validRes.client_name,
        access_code: validRes.access_code,
        room_name: validRes.room_id === ROOM_ID ? ROOM_NAME : validRes.room_id,
        start_time: `${validRes.date}T${validRes.start_time}`,
        end_time: `${validRes.date}T${validRes.end_time}`,
        status: validRes.status,
      };
    }

    // Check for upcoming reservations today
    const upcoming = reservations?.find((res) => {
      const startParts = res.start_time.split(":").map(Number);
      const nowParts = currentTime.split(":").map(Number);
      const startMin = startParts[0] * 60 + startParts[1];
      const nowMin = nowParts[0] * 60 + nowParts[1];
      return startMin > nowMin;
    });

    if (upcoming) {
      return {
        valid: false,
        has_upcoming: true,
        next_start_time: `${upcoming.date}T${upcoming.start_time}`,
        client_name: upcoming.client_name,
        error: `Acesso disponível apenas no horário da reserva (${upcoming.start_time.slice(0, 5)})`,
      };
    }

    return { valid: false, error: "Nenhuma reserva ativa encontrada para este horário" };
  } catch (err) {
    console.error("Failed to validate reservation:", err);
    return { valid: false, error: ERROR_MESSAGES.CONNECTION };
  }
}

// Update reservation status directly in Supabase
export async function updateReservationStatus(
  reservationId: string,
  newStatus: string = "Em uso"
): Promise<{ success: boolean }> {
  try {
    const { error } = await supabase
      .from("reservations")
      .update({ status: newStatus })
      .eq("id", reservationId);

    if (error) {
      console.error("Failed to update reservation status:", error);
      return { success: false };
    }

    return { success: true };
  } catch (err) {
    console.error("Error updating reservation status:", err);
    return { success: false };
  }
}

// Get user credit hours from profiles table
export async function getUserCreditHours(userId: string): Promise<number> {
  try {
    const { data, error } = await supabase
      .from("profiles")
      .select("credit_hours")
      .eq("id", userId)
      .single();

    if (error || !data) {
      console.error("Error fetching credit hours:", error);
      return 0;
    }

    return data.credit_hours || 0;
  } catch (err) {
    console.error("Failed to fetch credit hours:", err);
    return 0;
  }
}

// Create reservation via n8n webhook
export interface CreateReservationPayload {
  user_id: string;
  user_email: string;
  client_name: string;
  room_id: string;
  date: string;
  start_time: string;
  end_time: string;
  hours: number;
  payment_mode: "credit" | "stripe" | "invoice";
  total_price?: number;
  company_id?: string;
  company_name?: string;
}

export interface CreateReservationResponse {
  success: boolean;
  reservation_id?: string;
  access_code?: string;
  error?: string;
}

export async function createReservation(
  payload: CreateReservationPayload
): Promise<CreateReservationResponse> {
  try {
    const result = await apiCall<CreateReservationResponse>(N8N_WEBHOOKS.RESERVATION, {
      ...payload,
      timestamp: new Date().toISOString(),
    });
    return result;
  } catch (err) {
    console.error("Failed to create reservation:", err);
    return { success: false, error: ERROR_MESSAGES.CONNECTION };
  }
}

// Update room status (for admin panel)
export async function updateRoomStatus(
  roomId: string,
  status: "Disponível" | "Ocupado" | "Aguardando Limpeza"
): Promise<{ success: boolean }> {
  return apiCall(`${N8N_WEBHOOK_URL}/room-status-update`, {
    room_id: roomId,
    status,
  });
}

// Generic API call with error handling and auth header
async function apiCall<T>(
  endpoint: string,
  payload: Record<string, unknown>,
  method: "POST" | "GET" = "POST"
): Promise<T> {
  const options: RequestInit = {
    method,
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${AUTH_TOKEN}`,
    },
  };

  if (method === "POST") {
    options.body = JSON.stringify(payload);
  }

  const response = await fetch(endpoint, options);

  if (!response.ok) {
    if (response.status === 401 || response.status === 403) {
      throw new Error(ERROR_MESSAGES.ACCESS_DENIED);
    }
    throw new Error(ERROR_MESSAGES.CONNECTION);
  }

  const text = await response.text();
  if (!text) {
    return { success: true } as T;
  }

  try {
    return JSON.parse(text);
  } catch {
    return { success: true } as T;
  }
}

// GET request for status polling
async function apiGet<T>(endpoint: string): Promise<T> {
  const response = await fetch(endpoint, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${AUTH_TOKEN}`,
    },
  });

  if (!response.ok) {
    throw new Error(ERROR_MESSAGES.CONNECTION);
  }

  const text = await response.text();
  if (!text) {
    throw new Error(ERROR_MESSAGES.GENERIC);
  }

  return JSON.parse(text);
}

// Door Control API
export async function unlockDoor(
  userId: string,
  userEmail?: string,
  reservationId?: string,
  clientName?: string
): Promise<{ success: boolean; reservationId?: string }> {
  return apiCall(N8N_WEBHOOKS.DOOR_OPEN, {
    action: "unlock",
    room_id: ROOM_ID,
    user_id: userId,
    user_email: userEmail,
    reservation_id: reservationId,
    client_name: clientName,
    timestamp: new Date().toISOString(),
  });
}

// Lights Control API
export async function controlLights(
  brightness: number,
  mode: "manual" | "auto" = "manual"
): Promise<{ success: boolean }> {
  return apiCall(N8N_WEBHOOKS.CONTROL_LIGHTS, {
    brightness,
    mode,
  });
}

// Meeting Mode API
export async function activateMeetingMode(): Promise<{ success: boolean }> {
  return apiCall(N8N_WEBHOOKS.CONTROL_LIGHTS, {
    scene: "meeting",
    action: "activate",
  });
}

// HVAC Control API
export async function controlHVAC(
  targetTemp: number,
  power: "on" | "off" = "on"
): Promise<{ success: boolean }> {
  return apiCall(N8N_WEBHOOKS.CONTROL_HVAC, {
    target_temp: targetTemp,
    power,
  });
}

// Turn off hardware and trigger session closure
export async function triggerSessionClosure(
  reservationId: string,
  clientName?: string,
  endTime?: string
): Promise<{ success: boolean }> {
  // Also update reservation status in Supabase
  await updateReservationStatus(reservationId, "Aguardando Limpeza");

  return apiCall(N8N_WEBHOOKS.SESSION_CLOSURE, {
    room_id: ROOM_ID,
    reservation_id: reservationId,
    client_name: clientName,
    end_time: endTime,
    actions: ["turn_off_ac", "turn_off_tv"],
    new_status: "Aguardando Limpeza",
    reason: "reservation_ended",
    timestamp: new Date().toISOString(),
  });
}

// Legacy function for backwards compatibility
export async function turnOffHardware(
  reservationId: string
): Promise<{ success: boolean }> {
  return triggerSessionClosure(reservationId);
}

// Room Status Interface
export interface RoomStatus {
  isOccupied: boolean;
  isReady: boolean;
  currentTemp: number;
  currentBrightness: number;
  doorStatus: "locked" | "unlocked";
  lastUpdated: string;
}

// Fetch Room Status from n8n
export async function fetchRoomStatus(): Promise<RoomStatus> {
  try {
    const data = await apiGet<RoomStatus>(`${N8N_WEBHOOKS.ROOM_STATUS}?room_id=${ROOM_ID}`);
    return {
      isOccupied: data.isOccupied ?? true,
      isReady: data.isReady ?? true,
      currentTemp: data.currentTemp ?? 22,
      currentBrightness: data.currentBrightness ?? 70,
      doorStatus: data.doorStatus ?? "locked",
      lastUpdated: new Date().toISOString(),
    };
  } catch {
    return {
      isOccupied: true,
      isReady: true,
      currentTemp: 22,
      currentBrightness: 70,
      doorStatus: "locked",
      lastUpdated: new Date().toISOString(),
    };
  }
}

// Coffee service
export async function requestCoffee(
  reservationId?: string,
  type: "courtesy" | "extra" = "courtesy"
): Promise<{ success: boolean }> {
  return apiCall(N8N_WEBHOOKS.COFFEE, {
    service: "coffee",
    room_id: ROOM_ID,
    reservation_id: reservationId,
    type,
  });
}

export async function requestCleaning(): Promise<{ success: boolean }> {
  return apiCall(`${N8N_WEBHOOK_URL}/request-service`, {
    service: "cleaning",
    room_id: ROOM_ID,
  });
}

// Staff Audit
export interface StaffAuditData {
  room_id: string;
  reservation_id: string;
  staff_id: string;
  staff_name: string;
  coffee_capsules_remaining: number;
  cleaning_checklist: Record<string, boolean>;
  organization_checklist: Record<string, boolean>;
  damage_report: string | null;
  photo_urls: string[];
}

export async function submitStaffAudit(data: StaffAuditData): Promise<{ success: boolean }> {
  const capsulesUsed = 20 - data.coffee_capsules_remaining;
  const insumosCost = capsulesUsed * CAPSULE_COST;

  const payload = {
    ...data,
    capsules_used: capsulesUsed,
    insumos_cost: insumosCost,
    cleaning_fee: CLEANING_FEE,
    total_cost: insumosCost + CLEANING_FEE,
    submitted_at: new Date().toISOString(),
  };

  return apiCall(N8N_WEBHOOKS.STAFF_AUDIT, payload as unknown as Record<string, unknown>);
}

// Financial API
export interface Expense {
  id?: string;
  date: string;
  category: string;
  amount: number;
  description: string;
  payment_status?: "Pendente" | "Pago";
  paid_date?: string;
}

export interface FinancialSummary {
  totalRevenue: number;
  totalExpenses: number;
  coffeeCost: number;
  netProfit: number;
  reservationCount: number;
  expensesByCategory: Record<string, number>;
}

export async function createExpense(expense: Omit<Expense, "id">): Promise<{ success: boolean }> {
  const { data, error } = await supabase.functions.invoke("manage-expenses", {
    body: { ...expense, action: "create" },
  });

  if (error) {
    console.error("Failed to create expense:", error);
    throw new Error("Erro ao registrar despesa");
  }

  return data;
}

export async function fetchExpenses(): Promise<Expense[]> {
  const { data, error } = await supabase.functions.invoke("manage-expenses", {
    body: { action: "list" },
  });

  if (error) {
    console.error("Failed to fetch expenses:", error);
    return [];
  }

  return data?.expenses || [];
}

export async function fetchFinancialSummary(): Promise<FinancialSummary | null> {
  const { data, error } = await supabase.functions.invoke("manage-expenses", {
    body: { action: "summary" },
  });

  if (error) {
    console.error("Failed to fetch financial summary:", error);
    return null;
  }

  return data?.summary || null;
}

// Get last reservation for staff cleaning (directly from Supabase)
export interface LastReservation {
  success: boolean;
  reservation_id?: string;
  client_name?: string;
  room_name?: string;
  end_time?: string;
  status?: string;
  error?: string;
}

export async function getLastReservation(): Promise<LastReservation> {
  try {
    const twoHoursAgo = new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString();

    const { data, error } = await supabase
      .from("reservations")
      .select("*")
      .or("status.eq.Aguardando Limpeza,status.eq.concluído,status.eq.finalizado")
      .gte("updated_at", twoHoursAgo)
      .order("updated_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (error) {
      console.error("Failed to get last reservation:", error);
      return { success: false, error: "Erro ao buscar última reserva" };
    }

    if (!data) {
      return { success: false, error: "Nenhuma reserva recente encontrada para limpeza" };
    }

    return {
      success: true,
      reservation_id: data.id,
      client_name: data.client_name,
      room_name: data.room_id === ROOM_ID ? ROOM_NAME : data.room_id,
      end_time: `${data.date}T${data.end_time}`,
      status: data.status,
    };
  } catch (err) {
    console.error("Error getting last reservation:", err);
    return { success: false, error: "Erro de conexão" };
  }
}
