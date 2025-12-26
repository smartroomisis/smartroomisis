// N8N Webhook Configuration
export const N8N_WEBHOOK_URL = "https://construens.app.n8n.cloud/webhook-test";

// Airtable Configuration (to be configured later)
export const AIRTABLE_API_URL = "";
export const AIRTABLE_API_KEY = "";

// Room Configuration
export const ROOM_ID = "smart-room-sjc-01";

// Generic API call with error handling
async function apiCall<T>(
  endpoint: string,
  payload: Record<string, unknown>
): Promise<T> {
  const response = await fetch(endpoint, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    throw new Error("Erro de conexão com a sala. Verifique sua internet ou contate o suporte.");
  }

  return response.json();
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

// Room Status from Airtable
export interface RoomStatus {
  isReady: boolean;
  currentTemp: number;
  currentBrightness: number;
  doorStatus: "locked" | "unlocked";
  lastUpdated: string;
}

export async function fetchRoomStatus(): Promise<RoomStatus> {
  // This will be replaced with actual Airtable API call
  // For now, return mock data
  if (!AIRTABLE_API_URL || !AIRTABLE_API_KEY) {
    return {
      isReady: true,
      currentTemp: 22,
      currentBrightness: 70,
      doorStatus: "locked",
      lastUpdated: new Date().toISOString(),
    };
  }

  const response = await fetch(
    `${AIRTABLE_API_URL}/Status%20da%20Sala?maxRecords=1`,
    {
      headers: {
        Authorization: `Bearer ${AIRTABLE_API_KEY}`,
      },
    }
  );

  if (!response.ok) {
    throw new Error("Erro ao buscar status da sala.");
  }

  const data = await response.json();
  const record = data.records[0]?.fields;

  return {
    isReady: record?.isReady ?? true,
    currentTemp: record?.currentTemp ?? 22,
    currentBrightness: record?.currentBrightness ?? 70,
    doorStatus: record?.doorStatus ?? "locked",
    lastUpdated: new Date().toISOString(),
  };
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
