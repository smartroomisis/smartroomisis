import { useState, useEffect, useCallback } from "react";
import { fetchRoomStatus, RoomStatus } from "@/lib/api";
import { toast } from "@/hooks/use-toast";

const POLLING_INTERVAL = 30000; // 30 seconds

export function useRoomStatus() {
  const [status, setStatus] = useState<RoomStatus | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchStatus = useCallback(async () => {
    try {
      const data = await fetchRoomStatus();
      setStatus(data);
      setError(null);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Erro desconhecido";
      setError(message);
      toast({
        title: "Erro de Conexão",
        description: "Erro de conexão com a sala. Verifique sua internet ou contate o suporte.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchStatus();

    const interval = setInterval(fetchStatus, POLLING_INTERVAL);

    return () => clearInterval(interval);
  }, [fetchStatus]);

  return { status, isLoading, error, refetch: fetchStatus };
}
