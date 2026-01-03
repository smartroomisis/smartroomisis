import { GlassCard } from "@/components/GlassCard";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "@/hooks/use-toast";
import { useState } from "react";
import { 
  Headphones, 
  MessageSquare, 
  Mail, 
  Phone,
  Send,
  Loader2
} from "lucide-react";

export default function Support() {
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!subject.trim() || !message.trim()) {
      toast({
        title: "Campos obrigatórios",
        description: "Preencha o assunto e a mensagem.",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);
    
    // Simulate sending support request
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    toast({
      title: "Mensagem enviada!",
      description: "Responderemos em até 24 horas úteis.",
    });
    
    setSubject("");
    setMessage("");
    setIsSubmitting(false);
  };

  return (
    <div className="min-h-screen pb-24 md:pt-20 md:pb-8 theme-client">
      <div className="container mx-auto px-4 py-6 max-w-2xl">
        {/* Page Title */}
        <div className="mb-6">
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Headphones className="w-6 h-6 text-primary" />
            Suporte
          </h2>
          <p className="text-muted-foreground text-sm">
            Como podemos ajudá-lo?
          </p>
        </div>

        <div className="space-y-5">
          {/* Contact Info */}
          <GlassCard className="space-y-4">
            <h3 className="text-lg font-semibold">Canais de Atendimento</h3>
            
            <div className="grid gap-3">
              <a 
                href="mailto:suporte@smartroomisis.com"
                className="flex items-center gap-3 p-3 rounded-lg bg-secondary/30 hover:bg-secondary/50 transition-colors"
              >
                <Mail className="w-5 h-5 text-primary" />
                <div>
                  <p className="text-xs text-muted-foreground">E-mail</p>
                  <p className="font-medium">suporte@smartroomisis.com</p>
                </div>
              </a>
              
              <a 
                href="https://wa.me/5512999999999"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-3 p-3 rounded-lg bg-secondary/30 hover:bg-secondary/50 transition-colors"
              >
                <Phone className="w-5 h-5 text-success" />
                <div>
                  <p className="text-xs text-muted-foreground">WhatsApp</p>
                  <p className="font-medium">(12) 99999-9999</p>
                </div>
              </a>
            </div>
          </GlassCard>

          {/* Contact Form */}
          <GlassCard className="space-y-4">
            <h3 className="text-lg font-semibold flex items-center gap-2">
              <MessageSquare className="w-5 h-5 text-primary" />
              Enviar Mensagem
            </h3>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="subject">Assunto</Label>
                <Input
                  id="subject"
                  placeholder="Ex: Problema com a reserva"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  className="mt-1"
                />
              </div>
              
              <div>
                <Label htmlFor="message">Mensagem</Label>
                <Textarea
                  id="message"
                  placeholder="Descreva sua dúvida ou problema..."
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  rows={5}
                  className="mt-1"
                />
              </div>
              
              <Button 
                type="submit" 
                className="w-full"
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Enviando...
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4 mr-2" />
                    Enviar Mensagem
                  </>
                )}
              </Button>
            </form>
          </GlassCard>

          {/* FAQ */}
          <GlassCard className="space-y-4">
            <h3 className="text-lg font-semibold">Perguntas Frequentes</h3>
            
            <div className="space-y-3">
              <div className="p-3 rounded-lg bg-secondary/30">
                <p className="font-medium text-sm">Como faço para cancelar uma reserva?</p>
                <p className="text-xs text-muted-foreground mt-1">
                  Acesse "Minhas Reservas" e clique em cancelar até 24h antes do horário agendado.
                </p>
              </div>
              
              <div className="p-3 rounded-lg bg-secondary/30">
                <p className="font-medium text-sm">Como funciona o saldo de créditos?</p>
                <p className="text-xs text-muted-foreground mt-1">
                  Créditos são renovados mensalmente conforme seu plano. O saldo não utilizado expira no fim do mês.
                </p>
              </div>
              
              <div className="p-3 rounded-lg bg-secondary/30">
                <p className="font-medium text-sm">Posso mudar meu plano?</p>
                <p className="text-xs text-muted-foreground mt-1">
                  Sim, entre em contato conosco para upgrade ou downgrade do seu plano.
                </p>
              </div>
            </div>
          </GlassCard>
        </div>
      </div>
    </div>
  );
}
