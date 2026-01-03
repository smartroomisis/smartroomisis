import { BookingCalendar } from "@/components/BookingCalendar";
import { Zap } from "lucide-react";

export default function Booking() {
  return (
    <div className="min-h-screen pb-24 md:pt-20 md:pb-8 theme-client">
      <div className="container mx-auto px-4 py-6 max-w-4xl">
        {/* Header */}
        <div className="flex items-center gap-3 mb-6 md:hidden">
          <Zap className="w-6 h-6 text-primary" />
          <h1 className="text-xl font-bold neon-text">Smart Room SJC</h1>
        </div>

        {/* Page Title */}
        <div className="mb-6">
          <h2 className="text-2xl font-bold">Agendar Reserva</h2>
          <p className="text-muted-foreground text-sm">
            Escolha a data e horário da sua reunião
          </p>
        </div>

        {/* Booking Calendar */}
        <BookingCalendar />
      </div>
    </div>
  );
}
