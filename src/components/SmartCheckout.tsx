import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { 
  CreditCard, 
  Wallet, 
  Building2, 
  Clock, 
  ArrowRight,
  Loader2,
  CheckCircle,
  QrCode
} from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { createReservation, ROOM_ID } from "@/lib/api";
import { PixPaymentModal } from "@/components/PixPaymentModal";

interface SmartCheckoutProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  hoursRequested: number;
  pricePerHour: number;
  onSuccess: (paymentMode: "credit" | "stripe" | "invoice" | "pix") => void;
  reservationDetails?: {
    date: string;
    startTime: string;
    endTime: string;
  };
}

export function SmartCheckout({
  open,
  onOpenChange,
  hoursRequested,
  pricePerHour,
  onSuccess,
  reservationDetails,
}: SmartCheckoutProps) {
  const { profile, isEnterprise, refetchProfile } = useAuth();
  const [loading, setLoading] = useState(false);
  const [paymentMode, setPaymentMode] = useState<"credit" | "stripe" | "invoice" | "pix" | null>(null);
  const [showPixModal, setShowPixModal] = useState(false);
  const { toast } = useToast();

  const userCredits = profile?.credit_hours || 0;
  const hasEnoughCredits = userCredits >= hoursRequested;
  const hoursFromCredits = Math.min(userCredits, hoursRequested);
  const hoursToCharge = hoursRequested - hoursFromCredits;
  const totalPrice = hoursToCharge * pricePerHour;
  const fullPrice = hoursRequested * pricePerHour;

  const handlePayWithCredits = async () => {
    if (!profile) return;
    
    setLoading(true);
    setPaymentMode("credit");

    try {
      // Create reservation via n8n webhook
      const reservationResult = await createReservation({
        user_id: profile.id,
        user_email: profile.email,
        client_name: profile.full_name || profile.email,
        room_id: ROOM_ID,
        date: reservationDetails?.date || new Date().toLocaleDateString("pt-BR"),
        start_time: reservationDetails?.startTime || "",
        end_time: reservationDetails?.endTime || "",
        hours: hoursRequested,
        payment_mode: "credit",
      });

      if (!reservationResult.success) {
        throw new Error(reservationResult.error || "Erro ao criar reserva");
      }

      // Deduct credits from wallet
      const newBalance = userCredits - hoursRequested;
      
      const { error: updateError } = await supabase
        .from("profiles")
        .update({ credit_hours: newBalance })
        .eq("id", profile.id);

      if (updateError) throw updateError;

      // Log transaction
      const { error: txError } = await supabase
        .from("credit_transactions")
        .insert({
          user_id: profile.id,
          amount: -hoursRequested,
          type: "booking_debit",
          description: `Reserva: ${reservationDetails?.date} ${reservationDetails?.startTime}-${reservationDetails?.endTime}`,
          reservation_id: reservationResult.reservation_id,
        });

      if (txError) throw txError;

      await refetchProfile?.();
      
      toast({
        title: "Reserva confirmada!",
        description: `${hoursRequested}h debitadas do seu saldo. Código: ${reservationResult.access_code || "N/A"}`,
      });

      onSuccess("credit");
    } catch (error) {
      console.error("Error processing credit payment:", error);
      toast({
        title: "Erro",
        description: error instanceof Error ? error.message : "Erro ao processar pagamento.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleEnterpriseBooking = async () => {
    if (!profile) return;
    
    setLoading(true);
    setPaymentMode("invoice");

    try {
      // Create reservation via n8n webhook
      const reservationResult = await createReservation({
        user_id: profile.id,
        user_email: profile.email,
        client_name: profile.full_name || profile.email,
        room_id: ROOM_ID,
        date: reservationDetails?.date || new Date().toLocaleDateString("pt-BR"),
        start_time: reservationDetails?.startTime || "",
        end_time: reservationDetails?.endTime || "",
        hours: hoursRequested,
        payment_mode: "invoice",
        company_id: profile.enterprise_company_id || undefined,
      });

      if (!reservationResult.success) {
        throw new Error(reservationResult.error || "Erro ao criar reserva");
      }

      // Log usage for corporate billing
      const { error } = await supabase
        .from("enterprise_usage_logs")
        .insert({
          company_id: profile.enterprise_company_id,
          user_id: profile.id,
          hours_used: hoursRequested,
          booking_date: reservationDetails?.date || new Date().toISOString().split("T")[0],
          description: `Reserva: ${reservationDetails?.startTime}-${reservationDetails?.endTime}`,
          reservation_id: reservationResult.reservation_id,
        });

      if (error) throw error;

      toast({
        title: "Reserva confirmada!",
        description: `Uso registrado para faturamento corporativo. Código: ${reservationResult.access_code || "N/A"}`,
      });

      onSuccess("invoice");
    } catch (error) {
      console.error("Error logging enterprise usage:", error);
      toast({
        title: "Erro",
        description: error instanceof Error ? error.message : "Erro ao registrar uso.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleStripePayment = async () => {
    if (!profile) return;
    
    setLoading(true);
    setPaymentMode("stripe");

    try {
      // Create reservation via n8n webhook
      const reservationResult = await createReservation({
        user_id: profile.id,
        user_email: profile.email,
        client_name: profile.full_name || profile.email,
        room_id: ROOM_ID,
        date: reservationDetails?.date || new Date().toLocaleDateString("pt-BR"),
        start_time: reservationDetails?.startTime || "",
        end_time: reservationDetails?.endTime || "",
        hours: hoursRequested,
        payment_mode: "stripe",
        total_price: totalPrice > 0 ? totalPrice : hoursRequested * pricePerHour,
      });

      if (!reservationResult.success) {
        throw new Error(reservationResult.error || "Erro ao criar reserva");
      }

      // Call Stripe checkout edge function
      const { data, error } = await supabase.functions.invoke("stripe-checkout", {
        body: {
          hours: hoursToCharge > 0 ? hoursToCharge : hoursRequested,
          price_per_hour: pricePerHour,
          reservation_id: reservationResult.reservation_id,
          user_email: profile.email,
          reservation_date: reservationDetails?.date || new Date().toLocaleDateString("pt-BR"),
          start_time: reservationDetails?.startTime || "",
          end_time: reservationDetails?.endTime || "",
        },
      });

      if (error) throw error;

      if (data?.url) {
        // Redirect to Stripe Checkout
        window.location.href = data.url;
      } else {
        throw new Error("Não foi possível criar sessão de pagamento");
      }
    } catch (error) {
      console.error("Error processing Stripe payment:", error);
      toast({
        title: "Erro",
        description: error instanceof Error ? error.message : "Erro ao processar pagamento.",
        variant: "destructive",
      });
      setLoading(false);
    }
  };

  const handlePixPayment = () => {
    setPaymentMode("pix");
    setShowPixModal(true);
  };

  const handlePixConfirmed = async () => {
    // The reservation is created and confirmed via the n8n PIX flow inside
    // PixPaymentModal, so here we only finalize the checkout UI.
    toast({
      title: "Reserva confirmada!",
      description: "Pagamento PIX recebido com sucesso.",
    });
    onSuccess("pix");
    onOpenChange(false);
  };

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Confirmar Reserva</DialogTitle>
            <DialogDescription>
              {reservationDetails?.date} • {reservationDetails?.startTime} - {reservationDetails?.endTime}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            {/* Reservation Summary */}
            <div className="p-4 rounded-lg bg-secondary/50 space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Duração</span>
                <span className="font-medium">{hoursRequested}h</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Valor/hora</span>
                <span className="font-medium">R$ {pricePerHour.toFixed(2)}</span>
              </div>
              <div className="border-t border-border pt-2 mt-2 flex justify-between">
                <span className="font-medium">Total</span>
                <span className="font-bold text-lg">R$ {fullPrice.toFixed(2)}</span>
              </div>
            </div>

            {/* Enterprise User */}
            {isEnterprise && (
              <div className="p-4 rounded-lg border border-warning/30 bg-warning/5">
                <div className="flex items-center gap-2 mb-2">
                  <Building2 className="w-5 h-5 text-warning" />
                  <span className="font-semibold text-warning">Plano Corporativo</span>
                </div>
                <p className="text-sm text-muted-foreground mb-3">
                  Sua reserva será registrada para faturamento da empresa.
                </p>
                <Button
                  className="w-full gap-2"
                  onClick={handleEnterpriseBooking}
                  disabled={loading}
                >
                  {loading && paymentMode === "invoice" ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <>
                      <CheckCircle className="w-4 h-4" />
                      Confirmar Reserva
                    </>
                  )}
                </Button>
              </div>
            )}

            {/* Regular User Options */}
            {!isEnterprise && (
              <>
                {/* Credit Balance */}
                <div className="p-4 rounded-lg border border-border">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <Wallet className="w-5 h-5 text-primary" />
                      <span className="font-medium">Seu Saldo</span>
                    </div>
                    <Badge variant="outline" className="gap-1">
                      <Clock className="w-3 h-3" />
                      {userCredits}h
                    </Badge>
                  </div>

                  {hasEnoughCredits ? (
                    <>
                      <p className="text-sm text-success mb-3">
                        ✓ Você tem saldo suficiente para esta reserva
                      </p>
                      <Button
                        className="w-full gap-2"
                        onClick={handlePayWithCredits}
                        disabled={loading}
                      >
                        {loading && paymentMode === "credit" ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          <>
                            <Wallet className="w-4 h-4" />
                            Usar Créditos ({hoursRequested}h)
                          </>
                        )}
                      </Button>
                    </>
                  ) : userCredits > 0 ? (
                    <>
                      <div className="text-sm space-y-1 mb-3">
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Usar do saldo</span>
                          <span className="text-success">{hoursFromCredits}h grátis</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">A pagar</span>
                          <span>{hoursToCharge}h = R$ {totalPrice.toFixed(2)}</span>
                        </div>
                      </div>
                      
                      {/* Payment Options */}
                      <div className="space-y-2">
                        <Button
                          className="w-full gap-2"
                          onClick={handleStripePayment}
                          disabled={loading}
                        >
                          {loading && paymentMode === "stripe" ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                          ) : (
                            <>
                              <CreditCard className="w-4 h-4" />
                              Pagar com Cartão
                              <ArrowRight className="w-4 h-4" />
                            </>
                          )}
                        </Button>
                        <Button
                          variant="outline"
                          className="w-full gap-2"
                          onClick={handlePixPayment}
                          disabled={loading}
                        >
                          <QrCode className="w-4 h-4" />
                          Pagar com PIX
                        </Button>
                      </div>
                    </>
                  ) : (
                    <>
                      <p className="text-sm text-muted-foreground mb-3">
                        Sem créditos disponíveis. Escolha como pagar:
                      </p>
                      <div className="space-y-2">
                        <Button
                          className="w-full gap-2"
                          onClick={handleStripePayment}
                          disabled={loading}
                        >
                          {loading && paymentMode === "stripe" ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                          ) : (
                            <>
                              <CreditCard className="w-4 h-4" />
                              Pagar com Cartão
                              <ArrowRight className="w-4 h-4" />
                            </>
                          )}
                        </Button>
                        <Button
                          variant="outline"
                          className="w-full gap-2"
                          onClick={handlePixPayment}
                          disabled={loading}
                        >
                          <QrCode className="w-4 h-4" />
                          Pagar com PIX
                        </Button>
                      </div>
                    </>
                  )}
                </div>
              </>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* PIX Payment Modal */}
      <PixPaymentModal
        open={showPixModal}
        onOpenChange={setShowPixModal}
        amount={totalPrice > 0 ? totalPrice : fullPrice}
        description={`Reserva Smart Room - ${reservationDetails?.date}`}
        onPaymentConfirmed={handlePixConfirmed}
      />
    </>
  );
}
