// N8N Webhook Configuration
export const N8N_WEBHOOK_URL = "https://construens.app.n8n.cloud/webhook-test";

// Authorization Token (easy to change later)
export const AUTH_TOKEN = "SECRET_TOKEN_SJC";

// Airtable Configuration (to be configured later)
export const AIRTABLE_API_URL = "";
export const AIRTABLE_API_KEY = "";

// Room Configuration
export const ROOM_ID = "smart-room-sjc-01";

// Error messages
export const ERROR_MESSAGES = {
  CONNECTION: "Erro de conexão com a sala. Verifique sua internet ou contate o suporte.",
  ACCESS_DENIED: "Acesso negado: Nenhuma reserva ativa encontrada para este horário.",
  GENERIC: "Ocorreu um erro. Tente novamente.",
};

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

// Door Control API
export async function unlockDoor(userId: string): Promise<{ success: boolean }> {
  return apiCall(`${N8N_WEBHOOK_URL}/sensor-porta-aberta`, {
    action: "unlock",
    room_id: ROOM_ID,
    user_id: userId,
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

// Services API
export async function requestCoffee(): Promise<{ success: boolean }> {
  return apiCall(`${N8N_WEBHOOK_URL}/request-service`, {
    service: "coffee",
    room_id: ROOM_ID,
  });
}

export async function requestCleaning(): Promise<{ success: boolean }> {
  return apiCall(`${N8N_WEBHOOK_URL}/request-service`, {
    service: "cleaning",
    room_id: ROOM_ID,
  });
}
