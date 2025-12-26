import { useState, useEffect, useCallback } from "react";
import { fetchRoomStatus, RoomStatus, ERROR_MESSAGES } from "@/lib/api";
import { toast } from "@/hooks/use-toast";

const POLLING_INTERVAL = 30000; // 30 seconds

export function useRoomStatus() {
  const [status, setStatus] = useState<RoomStatus | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchStatus = useCallback(async (showError = false) => {
    try {
      const data = await fetchRoomStatus();
      setStatus(data);
      setError(null);
    } catch (err) {
      const message = err instanceof Error ? err.message : ERROR_MESSAGES.CONNECTION;
      setError(message);
      if (showError) {
        toast({
          title: "Erro de Conexão",
          description: message,
          variant: "destructive",
        });
      }
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchStatus(false); // Don't show error on initial load

    const interval = setInterval(() => fetchStatus(false), POLLING_INTERVAL);

    return () => clearInterval(interval);
  }, [fetchStatus]);

  // Derived state: controls should be enabled only when room is occupied
  const controlsEnabled = status?.isOccupied ?? false;

  return { 
    status, 
    isLoading, 
    error, 
    refetch: () => fetchStatus(true),
    controlsEnabled 
  };
}
