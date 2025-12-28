import { supabase } from "@/integrations/supabase/client";

// N8N Webhook Configuration
export const N8N_WEBHOOK_URL = "https://construens.app.n8n.cloud/webhook";
export const N8N_WEBHOOK_TEST_URL = "https://construens.app.n8n.cloud/webhook-test";

// Authorization Token (easy to change later)
export const AUTH_TOKEN = "SECRET_TOKEN_SJC";

// Room Configuration
export const ROOM_ID = "smart-room-isis-01";
export const ROOM_NAME = "SMART ROOM ISIS";

// Error messages
export const ERROR_MESSAGES = {
  CONNECTION: "Erro de conexão com a sala. Verifique sua internet ou contate o suporte.",
  ACCESS_DENIED: "Acesso negado: Nenhuma reserva ativa encontrada para este horário.",
  OUT_OF_TIME: "Acesso fora do horário permitido.",
  GENERIC: "Ocorreu um erro. Tente novamente.",
};

// Validate reservation via Airtable before unlocking door
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

export async function validateReservation(
  userId?: string, 
  userEmail?: string
): Promise<ReservationValidation> {
  try {
    const { data, error } = await supabase.functions.invoke('validate-reservation', {
      body: { user_id: userId, user_email: userEmail },
    });

    if (error) {
      console.error('Reservation validation error:', error);
      return { valid: false, error: ERROR_MESSAGES.ACCESS_DENIED };
    }

    return data as ReservationValidation;
  } catch (err) {
    console.error('Failed to validate reservation:', err);
    return { valid: false, error: ERROR_MESSAGES.CONNECTION };
  }
}

// Update reservation status in Airtable
export async function updateReservationStatus(
  reservationId: string,
  newStatus: string = "Em uso"
): Promise<{ success: boolean }> {
  try {
    const { data, error } = await supabase.functions.invoke('update-reservation-status', {
      body: { reservation_id: reservationId, new_status: newStatus },
    });

    if (error) {
      console.error('Failed to update reservation status:', error);
      return { success: false };
    }

    return { success: data?.success ?? true };
  } catch (err) {
    console.error('Error updating reservation status:', err);
    return { success: false };
  }
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
      "Authorization": `Bearer ${AUTH_TOKEN}`,
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

  // Handle empty responses
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
      "Authorization": `Bearer ${AUTH_TOKEN}`,
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

// Door Control API - with Airtable reservation validation
export async function unlockDoor(
  userId: string, 
  userEmail?: string,
  reservationId?: string
): Promise<{ success: boolean; reservationId?: string }> {
  return apiCall(`${N8N_WEBHOOK_URL}/sensor-porta-aberta`, {
    action: "unlock",
    room_id: ROOM_ID,
    user_id: userId,
    reservation_id: reservationId,
  });
}

// Lights Control API
export async function controlLights(
  brightness: number,
  mode: "manual" | "auto" = "manual"
): Promise<{ success: boolean }> {
  return apiCall(`${N8N_WEBHOOK_URL}/control-lights`, {
    brightness,
    mode,
  });
}

// Meeting Mode API
export async function activateMeetingMode(): Promise<{ success: boolean }> {
  return apiCall(`${N8N_WEBHOOK_URL}/control-lights`, {
    scene: "meeting",
    action: "activate",
  });
}

// HVAC Control API
export async function controlHVAC(
  targetTemp: number,
  power: "on" | "off" = "on"
): Promise<{ success: boolean }> {
  return apiCall(`${N8N_WEBHOOK_URL}/control-hvac`, {
    target_temp: targetTemp,
    power,
  });
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

// Fetch Room Status from n8n (GET request for polling)
export async function fetchRoomStatus(): Promise<RoomStatus> {
  try {
    // Try to get status from n8n
    const data = await apiGet<RoomStatus>(`${N8N_WEBHOOK_URL}/room-status?room_id=${ROOM_ID}`);
    return {
      isOccupied: data.isOccupied ?? true,
      isReady: data.isReady ?? true,
      currentTemp: data.currentTemp ?? 22,
      currentBrightness: data.currentBrightness ?? 70,
      doorStatus: data.doorStatus ?? "locked",
      lastUpdated: new Date().toISOString(),
    };
  } catch {
    // Fallback to mock data if endpoint not configured
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

// Services API - Coffee with reservation tracking
export async function requestCoffee(
  reservationId?: string,
  type: "courtesy" | "extra" = "courtesy"
): Promise<{ success: boolean }> {
  return apiCall(`${N8N_WEBHOOK_URL}/preparar-cafe`, {
    service: "coffee",
    room_id: ROOM_ID,
    reservation_id: reservationId,
    type,
  });
}

export async function requestCleaning(): Promise<{ success: boolean }> {
  return apiCall(`${N8N_WEBHOOK_TEST_URL}/request-service`, {
    service: "cleaning",
    room_id: ROOM_ID,
  });
}

// Staff Audit API
export interface StaffAuditData {
  room_id: string;
  reservation_id: string;
  coffee_capsules_remaining: number;
  checklist: Record<string, boolean>;
  damage_report: string | null;
}

export async function submitStaffAudit(data: StaffAuditData): Promise<{ success: boolean }> {
  return apiCall(`${N8N_WEBHOOK_URL}/staff-audit`, data as unknown as Record<string, unknown>);
}

// Financial API
export interface Expense {
  id?: string;
  date: string;
  category: string;
  amount: number;
  description: string;
}

export interface FinancialSummary {
  totalRevenue: number;
  totalExpenses: number;
  coffeeCost: number;
  netProfit: number;
  reservationCount: number;
  expensesByCategory: Record<string, number>;
}

export async function createExpense(expense: Omit<Expense, 'id'>): Promise<{ success: boolean }> {
  const { data, error } = await supabase.functions.invoke('manage-expenses', {
    body: expense,
  });

  if (error) {
    console.error('Failed to create expense:', error);
    throw new Error('Erro ao registrar despesa');
  }

  return data;
}

export async function fetchExpenses(): Promise<Expense[]> {
  const { data, error } = await supabase.functions.invoke('manage-expenses', {
    body: {},
  });

  if (error) {
    console.error('Failed to fetch expenses:', error);
    return [];
  }

  return data?.expenses || [];
}

export async function fetchFinancialSummary(): Promise<FinancialSummary | null> {
  const { data, error } = await supabase.functions.invoke('manage-expenses', {
    body: {},
  });

  if (error) {
    console.error('Failed to fetch financial summary:', error);
    return null;
  }

  return data?.summary || null;
}
