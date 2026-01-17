import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { 
  Zap, 
  Calendar, 
  KeyRound, 
  DoorOpen, 
  Smartphone,
  Lightbulb,
  Wind,
  Coffee,
  ChevronRight,
  Check,
  HelpCircle
} from "lucide-react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

const Landing = () => {
  return (
    <div className="min-h-screen theme-landing">
      {/* Navbar */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-lg border-b border-border/50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-lg bg-primary/10">
              <Zap className="w-6 h-6 text-primary" />
            </div>
            <span className="font-bold text-lg">Smart Room</span>
          </div>
          <div className="flex items-center gap-3">
            <Link to="/auth">
              <Button variant="ghost" size="sm">Entrar</Button>
            </Link>
            <Link to="/auth?mode=register">
              <Button size="sm" className="gap-1">
                Começar
                <ChevronRight className="w-4 h-4" />
              </Button>
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-28 pb-20 px-4 gradient-hero">
        <div className="container mx-auto text-center max-w-4xl">
          <div className="inline-flex items-center gap-2 bg-primary/10 border border-primary/20 rounded-full px-4 py-1.5 mb-6">
            <span className="w-2 h-2 bg-primary rounded-full animate-pulse"></span>
            <span className="text-sm text-primary">100% Autônomo • Sem recepção</span>
          </div>
          
          <h1 className="text-4xl md:text-6xl font-bold mb-6 leading-tight">
            Sua Sala de Reuniões
            <span className="text-gradient block">Inteligente e Autônoma</span>
          </h1>
          
          <p className="text-lg md:text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            Reserve, acesse com código digital e controle tudo pelo celular. 
            Sem chaves físicas. Sem filas. Zero burocracia.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/auth?mode=register">
              <Button size="lg" className="w-full sm:w-auto gap-2 text-lg px-8">
                Começar Agora
                <ChevronRight className="w-5 h-5" />
              </Button>
            </Link>
            <a href="#planos">
              <Button variant="outline" size="lg" className="w-full sm:w-auto text-lg px-8">
                Ver Planos
              </Button>
            </a>
          </div>

          {/* Hero Visual */}
          <div className="mt-12 relative">
            <div className="aspect-video max-w-3xl mx-auto rounded-2xl bg-gradient-to-br from-card to-secondary border border-border overflow-hidden">
              <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiMyMjIiIGZpbGwtb3BhY2l0eT0iMC4xIj48cGF0aCBkPSJNMzYgMzBoLTJ2LTJoMnYyem0wLTRoLTJ2LTJoMnYyem0tNC0ydi0yaDJ2Mmgtei8+PC9nPjwvZz48L3N2Zz4=')] opacity-50"></div>
              <div className="relative h-full flex items-center justify-center">
                <div className="text-center p-8">
                  <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-primary/20 mb-4 animate-float">
                    <DoorOpen className="w-10 h-10 text-primary" />
                  </div>
                  <p className="text-2xl font-semibold mb-2">Sala Inteligente</p>
                  <p className="text-muted-foreground">Controle total na palma da mão</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-4 bg-card/30">
        <div className="container mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Automação Completa
            </h2>
            <p className="text-muted-foreground max-w-xl mx-auto">
              Tudo controlado pelo app. Sua experiência mais confortável e produtiva.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6 max-w-4xl mx-auto">
            <div className="glass-card-solid p-6 hover-lift text-center">
              <div className="inline-flex items-center justify-center w-14 h-14 rounded-xl bg-primary/10 mb-4">
                <Lightbulb className="w-7 h-7 text-primary" />
              </div>
              <h3 className="font-semibold text-lg mb-2">Iluminação Inteligente</h3>
              <p className="text-sm text-muted-foreground">
                Luzes que acendem automaticamente quando você entra e ajustam conforme sua preferência.
              </p>
            </div>

            <div className="glass-card-solid p-6 hover-lift text-center">
              <div className="inline-flex items-center justify-center w-14 h-14 rounded-xl bg-primary/10 mb-4">
                <Wind className="w-7 h-7 text-primary" />
              </div>
              <h3 className="font-semibold text-lg mb-2">Climatização Automática</h3>
              <p className="text-sm text-muted-foreground">
                Ar-condicionado pré-climatizado. Escolha a temperatura ideal pelo app.
              </p>
            </div>

            <div className="glass-card-solid p-6 hover-lift text-center">
              <div className="inline-flex items-center justify-center w-14 h-14 rounded-xl bg-primary/10 mb-4">
                <Coffee className="w-7 h-7 text-primary" />
              </div>
              <h3 className="font-semibold text-lg mb-2">Café pelo App</h3>
              <p className="text-sm text-muted-foreground">
                Peça seu café cortesia com um toque. A máquina prepara instantaneamente.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* How it Works Section */}
      <section id="como-funciona" className="py-20 px-4">
        <div className="container mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Como Funciona
            </h2>
            <p className="text-muted-foreground max-w-xl mx-auto">
              Em 4 passos simples, você reserva e usa a sala. Sem complicação.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto">
            {/* Step 1 */}
            <div className="glass-card-solid p-6 hover-lift group relative">
              <div className="absolute -top-3 -left-3 w-8 h-8 rounded-full bg-primary flex items-center justify-center text-sm font-bold text-primary-foreground">
                1
              </div>
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-primary/10 mb-4 group-hover:bg-primary/20 transition-colors">
                <Calendar className="w-8 h-8 text-primary" />
              </div>
              <h3 className="font-semibold text-lg mb-2">Escolha seu Tempo</h3>
              <p className="text-sm text-muted-foreground">
                Selecione o dia e horário pelo app web. Compre créditos avulsos ou assine um plano com descontos exclusivos.
              </p>
            </div>

            {/* Step 2 */}
            <div className="glass-card-solid p-6 hover-lift group relative">
              <div className="absolute -top-3 -left-3 w-8 h-8 rounded-full bg-primary flex items-center justify-center text-sm font-bold text-primary-foreground">
                2
              </div>
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-primary/10 mb-4 group-hover:bg-primary/20 transition-colors">
                <KeyRound className="w-8 h-8 text-primary" />
              </div>
              <h3 className="font-semibold text-lg mb-2">Receba sua Chave Digital</h3>
              <p className="text-sm text-muted-foreground">
                Ao confirmar a reserva, receba um código único de 6 dígitos via e-mail e WhatsApp. Essa é sua chave de acesso.
              </p>
            </div>

            {/* Step 3 */}
            <div className="glass-card-solid p-6 hover-lift group relative">
              <div className="absolute -top-3 -left-3 w-8 h-8 rounded-full bg-primary flex items-center justify-center text-sm font-bold text-primary-foreground">
                3
              </div>
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-primary/10 mb-4 group-hover:bg-primary/20 transition-colors">
                <DoorOpen className="w-8 h-8 text-primary" />
              </div>
              <h3 className="font-semibold text-lg mb-2">Acesso Inteligente</h3>
              <p className="text-sm text-muted-foreground">
                Digite o código no painel da porta. Automaticamente, a porta destranca, luzes acendem e ar-condicionado ajusta para você.
              </p>
            </div>

            {/* Step 4 */}
            <div className="glass-card-solid p-6 hover-lift group relative">
              <div className="absolute -top-3 -left-3 w-8 h-8 rounded-full bg-primary flex items-center justify-center text-sm font-bold text-primary-foreground">
                4
              </div>
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-primary/10 mb-4 group-hover:bg-primary/20 transition-colors">
                <Smartphone className="w-8 h-8 text-primary" />
              </div>
              <h3 className="font-semibold text-lg mb-2">Controle Total</h3>
              <p className="text-sm text-muted-foreground">
                Durante a estadia, ajuste iluminação, peça café ou estenda seu tempo. Ao sair, o sistema encerra tudo sozinho.
              </p>
            </div>
          </div>

          <div className="text-center mt-10">
            <Link to="/auth?mode=register">
              <Button size="lg" className="gap-2">
                Começar Agora
                <ChevronRight className="w-5 h-5" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="planos" className="py-20 px-4 bg-card/30">
        <div className="container mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Planos e Preços
            </h2>
            <p className="text-muted-foreground max-w-xl mx-auto">
              Escolha o plano ideal para você. Quanto mais horas, maior o desconto.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6 max-w-4xl mx-auto">
            {/* On-Demand */}
            <div className="glass-card-solid p-6 hover-lift">
              <div className="text-center mb-6">
                <h3 className="font-semibold text-xl mb-1">On-Demand</h3>
                <p className="text-sm text-muted-foreground">Uso avulso</p>
              </div>
              <div className="text-center mb-6">
                <span className="text-4xl font-bold">R$ 45</span>
                <span className="text-muted-foreground">/hora</span>
              </div>
              <ul className="space-y-3 mb-6">
                <li className="flex items-center gap-2 text-sm">
                  <Check className="w-4 h-4 text-primary" />
                  <span>Pague apenas o que usar</span>
                </li>
                <li className="flex items-center gap-2 text-sm">
                  <Check className="w-4 h-4 text-primary" />
                  <span>Sem compromisso</span>
                </li>
                <li className="flex items-center gap-2 text-sm">
                  <Check className="w-4 h-4 text-primary" />
                  <span>1 café cortesia/sessão</span>
                </li>
              </ul>
              <Link to="/auth?mode=register&plan=ondemand">
                <Button variant="outline" className="w-full">Escolher</Button>
              </Link>
            </div>

            {/* Pro */}
            <div className="glass-card-solid p-6 hover-lift border-primary/50 relative">
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-primary text-primary-foreground text-xs font-semibold px-3 py-1 rounded-full">
                MAIS POPULAR
              </div>
              <div className="text-center mb-6">
                <h3 className="font-semibold text-xl mb-1">Pro</h3>
                <p className="text-sm text-muted-foreground">10 horas/mês</p>
              </div>
              <div className="text-center mb-6">
                <span className="text-4xl font-bold">R$ 350</span>
                <span className="text-muted-foreground">/mês</span>
                <p className="text-sm text-primary mt-1">Economia de 22%</p>
              </div>
              <ul className="space-y-3 mb-6">
                <li className="flex items-center gap-2 text-sm">
                  <Check className="w-4 h-4 text-primary" />
                  <span>10 horas incluídas</span>
                </li>
                <li className="flex items-center gap-2 text-sm">
                  <Check className="w-4 h-4 text-primary" />
                  <span>Reserva antecipada</span>
                </li>
                <li className="flex items-center gap-2 text-sm">
                  <Check className="w-4 h-4 text-primary" />
                  <span>2 cafés cortesia/sessão</span>
                </li>
              </ul>
              <Link to="/auth?mode=register&plan=pro">
                <Button className="w-full">Escolher</Button>
              </Link>
            </div>

            {/* Executive */}
            <div className="glass-card-solid p-6 hover-lift">
              <div className="text-center mb-6">
                <h3 className="font-semibold text-xl mb-1">Executive</h3>
                <p className="text-sm text-muted-foreground">20 horas/mês</p>
              </div>
              <div className="text-center mb-6">
                <span className="text-4xl font-bold">R$ 600</span>
                <span className="text-muted-foreground">/mês</span>
                <p className="text-sm text-primary mt-1">Economia de 33%</p>
              </div>
              <ul className="space-y-3 mb-6">
                <li className="flex items-center gap-2 text-sm">
                  <Check className="w-4 h-4 text-primary" />
                  <span>20 horas incluídas</span>
                </li>
                <li className="flex items-center gap-2 text-sm">
                  <Check className="w-4 h-4 text-primary" />
                  <span>Prioridade nas reservas</span>
                </li>
                <li className="flex items-center gap-2 text-sm">
                  <Check className="w-4 h-4 text-primary" />
                  <span>Cafés ilimitados</span>
                </li>
              </ul>
              <Link to="/auth?mode=register&plan=executive">
                <Button variant="outline" className="w-full">Escolher</Button>
              </Link>
            </div>
          </div>

          <div className="text-center mt-8">
            <Link to="/auth?mode=register&plan=enterprise" className="text-primary hover:underline text-sm">
              Precisa de um plano corporativo? Fale conosco →
            </Link>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section id="faq" className="py-20 px-4">
        <div className="container mx-auto max-w-3xl">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Perguntas Frequentes
            </h2>
            <p className="text-muted-foreground">
              Tire suas dúvidas sobre a Smart Room.
            </p>
          </div>

          <Accordion type="single" collapsible className="space-y-3">
            <AccordionItem value="item-1" className="glass-card-solid px-6 border-none">
              <AccordionTrigger className="hover:no-underline py-4">
                <div className="flex items-center gap-3 text-left">
                  <HelpCircle className="w-5 h-5 text-primary shrink-0" />
                  <span>E se eu chegar alguns minutos antes do meu horário?</span>
                </div>
              </AccordionTrigger>
              <AccordionContent className="text-muted-foreground pb-4 pl-8">
                Por segurança e organização, seu código de acesso só será ativado exatamente no horário reservado. Mas não se preocupe: você receberá um alerta no celular assim que a sala estiver pronta para você entrar!
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="item-2" className="glass-card-solid px-6 border-none">
              <AccordionTrigger className="hover:no-underline py-4">
                <div className="flex items-center gap-3 text-left">
                  <HelpCircle className="w-5 h-5 text-primary shrink-0" />
                  <span>Esqueci de desligar o ar e as luzes ao sair. E agora?</span>
                </div>
              </AccordionTrigger>
              <AccordionContent className="text-muted-foreground pb-4 pl-8">
                Fique tranquilo(a)! A Smart Room é inteligente. Assim que o seu tempo termina, o sistema detecta o fim da sessão e desliga automaticamente todos os equipamentos e tranca a porta. Você não precisa se preocupar com nada.
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="item-3" className="glass-card-solid px-6 border-none">
              <AccordionTrigger className="hover:no-underline py-4">
                <div className="flex items-center gap-3 text-left">
                  <HelpCircle className="w-5 h-5 text-primary shrink-0" />
                  <span>Como eu recebo o meu café cortesia?</span>
                </div>
              </AccordionTrigger>
              <AccordionContent className="text-muted-foreground pb-4 pl-8">
                É muito simples: dentro da sala, abra o nosso Web App no seu celular e clique no botão "Liberar Café". A máquina será ativada instantaneamente. A primeira cápsula é por nossa conta!
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="item-4" className="glass-card-solid px-6 border-none">
              <AccordionTrigger className="hover:no-underline py-4">
                <div className="flex items-center gap-3 text-left">
                  <HelpCircle className="w-5 h-5 text-primary shrink-0" />
                  <span>O que eu faço se tiver algum problema técnico?</span>
                </div>
              </AccordionTrigger>
              <AccordionContent className="text-muted-foreground pb-4 pl-8">
                No seu painel de controle (no app), existe um botão chamado "Reportar Problema". Selecione a categoria (ex: ar-condicionado ou Wi-Fi) e nossa equipe de suporte receberá um alerta urgente para te ajudar remotamente ou enviar um técnico.
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="item-5" className="glass-card-solid px-6 border-none">
              <AccordionTrigger className="hover:no-underline py-4">
                <div className="flex items-center gap-3 text-left">
                  <HelpCircle className="w-5 h-5 text-primary shrink-0" />
                  <span>Posso estender minha permanência se a reunião atrasar?</span>
                </div>
              </AccordionTrigger>
              <AccordionContent className="text-muted-foreground pb-4 pl-8">
                Sim! Se não houver outra reserva logo em seguida, o app mostrará o botão "Estender Reserva". Você escolhe o tempo adicional e o pagamento é feito na hora com seus créditos ou cartão cadastrado.
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="item-6" className="glass-card-solid px-6 border-none">
              <AccordionTrigger className="hover:no-underline py-4">
                <div className="flex items-center gap-3 text-left">
                  <HelpCircle className="w-5 h-5 text-primary shrink-0" />
                  <span>Preciso baixar algum aplicativo?</span>
                </div>
              </AccordionTrigger>
              <AccordionContent className="text-muted-foreground pb-4 pl-8">
                Não é necessário! Nosso sistema funciona direto pelo navegador do seu celular. Para facilitar, você pode clicar em "Adicionar à Tela de Início" no seu navegador e ele funcionará exatamente como um aplicativo comum.
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 bg-gradient-to-b from-card/50 to-background">
        <div className="container mx-auto text-center max-w-2xl">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Pronto para experimentar?
          </h2>
          <p className="text-muted-foreground mb-8">
            Cadastre-se agora e faça sua primeira reserva em menos de 2 minutos.
          </p>
          <Link to="/auth?mode=register">
            <Button size="lg" className="gap-2 text-lg px-8">
              Criar Conta Grátis
              <ChevronRight className="w-5 h-5" />
            </Button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 px-4 border-t border-border">
        <div className="container mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <Zap className="w-5 h-5 text-primary" />
            <span className="font-semibold">Smart Room Office</span>
          </div>
          <p className="text-sm text-muted-foreground">
            © 2025 Smart Room Office. Todos os direitos reservados.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default Landing;
