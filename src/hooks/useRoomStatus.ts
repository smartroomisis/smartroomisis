import { useState, useEffect, useCallback } from "react";
import { 
  fetchRoomStatus, 
  RoomStatus, 
  ERROR_MESSAGES, 
  validateReservation,
  updateRoomStatus,
  turnOffHardware,
  ROOM_ID
} from "@/lib/api";
import { toast } from "@/hooks/use-toast";

const POLLING_INTERVAL = 30000; // 30 seconds

export function useRoomStatus() {
  const [status, setStatus] = useState<RoomStatus | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [reservationId, setReservationId] = useState<string | undefined>(undefined);
  const [reservationEndTime, setReservationEndTime] = useState<Date | null>(null);
  const [isExpired, setIsExpired] = useState(false);

  const fetchStatus = useCallback(async (showError = false) => {
    try {
      const data = await fetchRoomStatus();
      setStatus(data);
      setError(null);
      
      // Also fetch reservation info
      const validation = await validateReservation("current_user_id");
      if (validation.valid && validation.reservation_id) {
        setReservationId(validation.reservation_id);
        
        // Set end time from reservation
        if (validation.end_time) {
          setReservationEndTime(new Date(validation.end_time));
        }
      }
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

  // Handle reservation expiry
  const handleReservationExpiry = useCallback(async () => {
    if (isExpired || !reservationId) return;
    
    setIsExpired(true);
    
    // Turn off hardware
    try {
      await turnOffHardware(reservationId);
      console.log("Hardware turned off successfully");
    } catch (err) {
      console.error("Failed to turn off hardware:", err);
    }
    
    // Update room status to "Awaiting Cleaning"
    try {
      await updateRoomStatus(ROOM_ID, "Aguardando Limpeza");
      console.log("Room status updated to Awaiting Cleaning");
    } catch (err) {
      console.error("Failed to update room status:", err);
    }
  }, [isExpired, reservationId]);

  useEffect(() => {
    fetchStatus(false); // Don't show error on initial load

    const interval = setInterval(() => fetchStatus(false), POLLING_INTERVAL);

    return () => clearInterval(interval);
  }, [fetchStatus]);

  // Derived state: controls should be enabled only when room is occupied and not expired
  const controlsEnabled = (status?.isOccupied ?? false) && !isExpired;

  return { 
    status, 
    isLoading, 
    error, 
    refetch: () => fetchStatus(true),
    controlsEnabled,
    reservationId,
    reservationEndTime,
    isExpired,
    handleReservationExpiry
  };
}
