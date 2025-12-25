import { useState, useEffect, useMemo } from "react";

export interface Reservation {
  id: string;
  startTime: Date;
  endTime: Date;
  roomId: string;
  userId: string;
  status: "pending" | "active" | "completed" | "cancelled";
}

// Mock data - will be replaced with Airtable API
const mockReservations: Reservation[] = [
  {
    id: "res-001",
    startTime: new Date(Date.now() - 30 * 60 * 1000), // Started 30 min ago
    endTime: new Date(Date.now() + 90 * 60 * 1000), // Ends in 90 min
    roomId: "room-sjc-01",
    userId: "user-001",
    status: "active",
  },
];

export function useReservation(userId?: string) {
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulate API call to Airtable
    const fetchReservations = async () => {
      setLoading(true);
      await new Promise((resolve) => setTimeout(resolve, 500));
      setReservations(mockReservations);
      setLoading(false);
    };

    fetchReservations();
  }, [userId]);

  const activeReservation = useMemo(() => {
    const now = new Date();
    return reservations.find(
      (res) =>
        res.status === "active" &&
        res.startTime <= now &&
        res.endTime > now
    );
  }, [reservations]);

  const hasActiveReservation = Boolean(activeReservation);

  return {
    reservations,
    activeReservation,
    hasActiveReservation,
    loading,
    setReservations,
  };
}
