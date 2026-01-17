import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Clock, Shield, Coffee, XCircle, Users, Trash2 } from "lucide-react";

interface TermsOfUseModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function TermsOfUseModal({ open, onOpenChange }: TermsOfUseModalProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg max-h-[85vh]">
        <DialogHeader>
          <DialogTitle className="text-xl">Termos de Uso</DialogTitle>
          <p className="text-sm text-muted-foreground">
            O que você precisa saber (Resumo Amigável)
          </p>
        </DialogHeader>
        
        <ScrollArea className="h-[60vh] pr-4">
          <p className="text-sm text-muted-foreground mb-6">
            Para garantir que a Smart Room seja incrível para todos, ao utilizar nossa sala, você concorda que:
          </p>

          <div className="space-y-5">
            <div className="flex gap-3">
              <div className="shrink-0 w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                <Clock className="w-5 h-5 text-primary" />
              </div>
              <div>
                <h4 className="font-medium mb-1">Uso do Tempo</h4>
                <p className="text-sm text-muted-foreground">
                  Sua chave digital funciona apenas no horário reservado. Extensões dependem de disponibilidade e serão cobradas à parte.
                </p>
              </div>
            </div>

            <div className="flex gap-3">
              <div className="shrink-0 w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                <Shield className="w-5 h-5 text-primary" />
              </div>
              <div>
                <h4 className="font-medium mb-1">Cuidado com o Espaço</h4>
                <p className="text-sm text-muted-foreground">
                  A sala é monitorada por sensores inteligentes. Por favor, cuide dos equipamentos e do mobiliário. Danos identificados pela auditoria de limpeza pós-uso poderão ser cobrados no cartão cadastrado.
                </p>
              </div>
            </div>

            <div className="flex gap-3">
              <div className="shrink-0 w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                <Coffee className="w-5 h-5 text-primary" />
              </div>
              <div>
                <h4 className="font-medium mb-1">Consumo de Café</h4>
                <p className="text-sm text-muted-foreground">
                  Você tem direito a 2 cafés cortesia por sessão. Cápsulas adicionais são pagas.
                </p>
              </div>
            </div>

            <div className="flex gap-3">
              <div className="shrink-0 w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                <XCircle className="w-5 h-5 text-primary" />
              </div>
              <div>
                <h4 className="font-medium mb-1">Política de Cancelamento</h4>
                <p className="text-sm text-muted-foreground">
                  Cancelamentos feitos com até 2 horas de antecedência geram reembolso de 85% em créditos.
                </p>
              </div>
            </div>

            <div className="flex gap-3">
              <div className="shrink-0 w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                <Users className="w-5 h-5 text-primary" />
              </div>
              <div>
                <h4 className="font-medium mb-1">Segurança</h4>
                <p className="text-sm text-muted-foreground">
                  Não compartilhe seu código de acesso com terceiros. Você é responsável por quem entra na sala durante o seu período de reserva.
                </p>
              </div>
            </div>

            <div className="flex gap-3">
              <div className="shrink-0 w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                <Trash2 className="w-5 h-5 text-primary" />
              </div>
              <div>
                <h4 className="font-medium mb-1">Limpeza</h4>
                <p className="text-sm text-muted-foreground">
                  Lixo deve ser depositado nos locais indicados.
                </p>
              </div>
            </div>
          </div>

          <div className="mt-6 p-4 bg-muted/50 rounded-lg">
            <p className="text-xs text-muted-foreground text-center">
              Ao criar sua conta, você concorda com estes termos e nossa política de privacidade.
            </p>
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}
