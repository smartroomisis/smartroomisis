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
  HelpCircle,
  Sparkles
} from "lucide-react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

const Landing = () => {
  return (
    <div className="min-h-screen bg-[hsl(220,25%,6%)]">
      {/* Navbar */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-[hsl(220,25%,6%)]/90 backdrop-blur-xl border-b border-[hsl(210,20%,18%)]/50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-gradient-to-br from-[hsl(188,85%,50%)] to-[hsl(200,80%,45%)] shadow-lg shadow-[hsl(188,85%,50%)]/25">
              <Zap className="w-5 h-5 text-[hsl(220,25%,6%)]" />
            </div>
            <span className="font-bold text-xl text-white">Smart Room</span>
          </div>
          <div className="flex items-center gap-3">
            <Link to="/auth">
              <Button variant="ghost" size="sm" className="text-[hsl(210,20%,75%)] hover:text-white hover:bg-[hsl(210,20%,15%)]">
                Entrar
              </Button>
            </Link>
            <Link to="/auth?mode=register">
              <Button size="sm" className="gap-1.5 bg-gradient-to-r from-[hsl(188,85%,50%)] to-[hsl(200,80%,45%)] hover:from-[hsl(188,85%,55%)] hover:to-[hsl(200,80%,50%)] text-[hsl(220,25%,6%)] font-semibold shadow-lg shadow-[hsl(188,85%,50%)]/25 border-0">
                Começar
                <ChevronRight className="w-4 h-4" />
              </Button>
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-32 pb-24 px-4 relative overflow-hidden">
        {/* Gradient Background */}
        <div className="absolute inset-0 bg-gradient-to-b from-[hsl(220,30%,8%)] via-[hsl(215,28%,10%)] to-[hsl(220,25%,6%)]"></div>
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[600px] bg-[hsl(188,85%,50%)]/8 rounded-full blur-[120px]"></div>
        <div className="absolute bottom-0 right-0 w-[400px] h-[400px] bg-[hsl(200,80%,40%)]/10 rounded-full blur-[100px]"></div>
        
        <div className="container mx-auto text-center max-w-4xl relative z-10">
          <div className="inline-flex items-center gap-2 bg-gradient-to-r from-[hsl(188,85%,50%)]/15 to-[hsl(200,80%,45%)]/10 border border-[hsl(188,85%,50%)]/30 rounded-full px-5 py-2 mb-8 backdrop-blur-sm">
            <Sparkles className="w-4 h-4 text-[hsl(188,85%,50%)]" />
            <span className="text-sm font-medium text-[hsl(188,85%,60%)]">100% Autônomo • Sem recepção</span>
          </div>
          
          <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold mb-6 leading-tight">
            <span className="text-white">Sua Sala de Reuniões</span>
            <span className="block mt-2 bg-gradient-to-r from-[hsl(188,85%,55%)] via-[hsl(195,80%,50%)] to-[hsl(200,75%,55%)] bg-clip-text text-transparent">
              Inteligente e Autônoma
            </span>
          </h1>
          
          <p className="text-lg md:text-xl text-[hsl(210,15%,60%)] mb-10 max-w-2xl mx-auto leading-relaxed">
            Reserve, acesse com código digital e controle tudo pelo celular. 
            <span className="text-[hsl(210,20%,75%)]"> Sem chaves físicas. Sem filas. Zero burocracia.</span>
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/auth?mode=register">
              <Button size="lg" className="w-full sm:w-auto gap-2 text-lg px-8 py-6 bg-gradient-to-r from-[hsl(188,85%,50%)] to-[hsl(200,80%,45%)] hover:from-[hsl(188,85%,55%)] hover:to-[hsl(200,80%,50%)] text-[hsl(220,25%,6%)] font-semibold shadow-xl shadow-[hsl(188,85%,50%)]/30 border-0">
                Começar Agora
                <ChevronRight className="w-5 h-5" />
              </Button>
            </Link>
            <a href="#planos">
              <Button variant="outline" size="lg" className="w-full sm:w-auto text-lg px-8 py-6 border-[hsl(210,20%,25%)] text-[hsl(210,20%,80%)] hover:bg-[hsl(210,20%,12%)] hover:text-white hover:border-[hsl(188,85%,50%)]/50 transition-all duration-300">
                Ver Planos
              </Button>
            </a>
          </div>

          {/* Hero Visual */}
          <div className="mt-16 relative">
            <div className="aspect-video max-w-3xl mx-auto rounded-3xl bg-gradient-to-br from-[hsl(215,30%,12%)] via-[hsl(220,25%,10%)] to-[hsl(225,25%,8%)] border border-[hsl(210,20%,18%)] overflow-hidden shadow-2xl shadow-black/40">
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,hsl(188,85%,50%,0.05),transparent_70%)]"></div>
              <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiMyMjIiIGZpbGwtb3BhY2l0eT0iMC4wNSI+PHBhdGggZD0iTTM2IDMwaC0ydi0yaDJ2MnptMC00aC0ydi0yaDJ2MnptLTQtMnYtMmgydjJoLTJ6Ii8+PC9nPjwvZz48L3N2Zz4=')] opacity-50"></div>
              <div className="relative h-full flex items-center justify-center">
                <div className="text-center p-8">
                  <div className="inline-flex items-center justify-center w-24 h-24 rounded-3xl bg-gradient-to-br from-[hsl(188,85%,50%)]/20 to-[hsl(200,80%,45%)]/10 mb-6 animate-float border border-[hsl(188,85%,50%)]/30 shadow-lg shadow-[hsl(188,85%,50%)]/20">
                    <DoorOpen className="w-12 h-12 text-[hsl(188,85%,55%)]" />
                  </div>
                  <p className="text-2xl font-semibold mb-2 text-white">Sala Inteligente</p>
                  <p className="text-[hsl(210,15%,55%)]">Controle total na palma da mão</p>
                </div>
              </div>
            </div>
            {/* Glow effect */}
            <div className="absolute -bottom-10 left-1/2 -translate-x-1/2 w-2/3 h-20 bg-[hsl(188,85%,50%)]/20 blur-3xl rounded-full"></div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-24 px-4 relative">
        <div className="absolute inset-0 bg-gradient-to-b from-[hsl(220,25%,6%)] via-[hsl(215,28%,9%)] to-[hsl(220,25%,6%)]"></div>
        <div className="container mx-auto relative z-10">
          <div className="text-center mb-16">
            <span className="inline-block text-sm font-semibold text-[hsl(188,85%,50%)] mb-3 uppercase tracking-wider">Recursos</span>
            <h2 className="text-3xl md:text-5xl font-bold mb-4 text-white">
              Automação Completa
            </h2>
            <p className="text-[hsl(210,15%,55%)] max-w-xl mx-auto text-lg">
              Tudo controlado pelo app. Sua experiência mais confortável e produtiva.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            <div className="group p-8 rounded-2xl bg-gradient-to-b from-[hsl(215,30%,12%)] to-[hsl(220,25%,8%)] border border-[hsl(210,20%,18%)] hover:border-[hsl(188,85%,50%)]/30 transition-all duration-500 hover:shadow-xl hover:shadow-[hsl(188,85%,50%)]/10 hover:-translate-y-1 text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-[hsl(45,100%,50%)]/20 to-[hsl(35,100%,45%)]/10 mb-6 group-hover:scale-110 transition-transform duration-300 border border-[hsl(45,100%,50%)]/20">
                <Lightbulb className="w-8 h-8 text-[hsl(45,100%,55%)]" />
              </div>
              <h3 className="font-semibold text-xl mb-3 text-white">Iluminação Inteligente</h3>
              <p className="text-[hsl(210,15%,55%)] leading-relaxed">
                Luzes que acendem automaticamente quando você entra e ajustam conforme sua preferência.
              </p>
            </div>

            <div className="group p-8 rounded-2xl bg-gradient-to-b from-[hsl(215,30%,12%)] to-[hsl(220,25%,8%)] border border-[hsl(210,20%,18%)] hover:border-[hsl(188,85%,50%)]/30 transition-all duration-500 hover:shadow-xl hover:shadow-[hsl(188,85%,50%)]/10 hover:-translate-y-1 text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-[hsl(200,80%,50%)]/20 to-[hsl(210,70%,45%)]/10 mb-6 group-hover:scale-110 transition-transform duration-300 border border-[hsl(200,80%,50%)]/20">
                <Wind className="w-8 h-8 text-[hsl(200,80%,55%)]" />
              </div>
              <h3 className="font-semibold text-xl mb-3 text-white">Climatização Automática</h3>
              <p className="text-[hsl(210,15%,55%)] leading-relaxed">
                Ar-condicionado pré-climatizado. Escolha a temperatura ideal pelo app.
              </p>
            </div>

            <div className="group p-8 rounded-2xl bg-gradient-to-b from-[hsl(215,30%,12%)] to-[hsl(220,25%,8%)] border border-[hsl(210,20%,18%)] hover:border-[hsl(188,85%,50%)]/30 transition-all duration-500 hover:shadow-xl hover:shadow-[hsl(188,85%,50%)]/10 hover:-translate-y-1 text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-[hsl(25,85%,50%)]/20 to-[hsl(15,80%,40%)]/10 mb-6 group-hover:scale-110 transition-transform duration-300 border border-[hsl(25,85%,50%)]/20">
                <Coffee className="w-8 h-8 text-[hsl(25,85%,55%)]" />
              </div>
              <h3 className="font-semibold text-xl mb-3 text-white">Café pelo App</h3>
              <p className="text-[hsl(210,15%,55%)] leading-relaxed">
                Peça seu café cortesia com um toque. A máquina prepara instantaneamente.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* How it Works Section */}
      <section id="como-funciona" className="py-24 px-4 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-[hsl(215,30%,10%)] via-[hsl(220,25%,8%)] to-[hsl(225,25%,6%)]"></div>
        <div className="absolute top-1/2 left-0 w-[300px] h-[300px] bg-[hsl(188,85%,50%)]/5 rounded-full blur-[100px]"></div>
        <div className="absolute bottom-0 right-0 w-[400px] h-[400px] bg-[hsl(200,80%,40%)]/5 rounded-full blur-[120px]"></div>
        
        <div className="container mx-auto relative z-10">
          <div className="text-center mb-16">
            <span className="inline-block text-sm font-semibold text-[hsl(188,85%,50%)] mb-3 uppercase tracking-wider">Passo a Passo</span>
            <h2 className="text-3xl md:text-5xl font-bold mb-4 text-white">
              Como Funciona
            </h2>
            <p className="text-[hsl(210,15%,55%)] max-w-xl mx-auto text-lg">
              Em 4 passos simples, você reserva e usa a sala. Sem complicação.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto">
            {/* Step 1 */}
            <div className="group p-6 rounded-2xl bg-gradient-to-b from-[hsl(215,30%,12%)] to-[hsl(220,25%,8%)] border border-[hsl(210,20%,18%)] hover:border-[hsl(188,85%,50%)]/40 transition-all duration-500 hover:shadow-xl hover:shadow-[hsl(188,85%,50%)]/10 relative">
              <div className="absolute -top-3 -left-3 w-10 h-10 rounded-xl bg-gradient-to-br from-[hsl(188,85%,50%)] to-[hsl(200,80%,45%)] flex items-center justify-center text-sm font-bold text-[hsl(220,25%,6%)] shadow-lg shadow-[hsl(188,85%,50%)]/30">
                1
              </div>
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-[hsl(188,85%,50%)]/15 to-[hsl(200,80%,45%)]/5 mb-5 mt-2 group-hover:scale-110 transition-transform duration-300 border border-[hsl(188,85%,50%)]/20">
                <Calendar className="w-8 h-8 text-[hsl(188,85%,55%)]" />
              </div>
              <h3 className="font-semibold text-lg mb-2 text-white">Escolha seu Tempo</h3>
              <p className="text-sm text-[hsl(210,15%,55%)] leading-relaxed">
                Selecione o dia e horário pelo app web. Compre créditos avulsos ou assine um plano com descontos exclusivos.
              </p>
            </div>

            {/* Step 2 */}
            <div className="group p-6 rounded-2xl bg-gradient-to-b from-[hsl(215,30%,12%)] to-[hsl(220,25%,8%)] border border-[hsl(210,20%,18%)] hover:border-[hsl(280,70%,50%)]/40 transition-all duration-500 hover:shadow-xl hover:shadow-[hsl(280,70%,50%)]/10 relative">
              <div className="absolute -top-3 -left-3 w-10 h-10 rounded-xl bg-gradient-to-br from-[hsl(280,70%,55%)] to-[hsl(260,65%,50%)] flex items-center justify-center text-sm font-bold text-white shadow-lg shadow-[hsl(280,70%,50%)]/30">
                2
              </div>
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-[hsl(280,70%,50%)]/15 to-[hsl(260,65%,45%)]/5 mb-5 mt-2 group-hover:scale-110 transition-transform duration-300 border border-[hsl(280,70%,50%)]/20">
                <KeyRound className="w-8 h-8 text-[hsl(280,70%,60%)]" />
              </div>
              <h3 className="font-semibold text-lg mb-2 text-white">Receba sua Chave Digital</h3>
              <p className="text-sm text-[hsl(210,15%,55%)] leading-relaxed">
                Ao confirmar a reserva, receba um código único de 6 dígitos via e-mail e WhatsApp. Essa é sua chave de acesso.
              </p>
            </div>

            {/* Step 3 */}
            <div className="group p-6 rounded-2xl bg-gradient-to-b from-[hsl(215,30%,12%)] to-[hsl(220,25%,8%)] border border-[hsl(210,20%,18%)] hover:border-[hsl(142,70%,45%)]/40 transition-all duration-500 hover:shadow-xl hover:shadow-[hsl(142,70%,45%)]/10 relative">
              <div className="absolute -top-3 -left-3 w-10 h-10 rounded-xl bg-gradient-to-br from-[hsl(142,70%,50%)] to-[hsl(160,65%,40%)] flex items-center justify-center text-sm font-bold text-[hsl(220,25%,6%)] shadow-lg shadow-[hsl(142,70%,45%)]/30">
                3
              </div>
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-[hsl(142,70%,45%)]/15 to-[hsl(160,65%,40%)]/5 mb-5 mt-2 group-hover:scale-110 transition-transform duration-300 border border-[hsl(142,70%,45%)]/20">
                <DoorOpen className="w-8 h-8 text-[hsl(142,70%,55%)]" />
              </div>
              <h3 className="font-semibold text-lg mb-2 text-white">Acesso Inteligente</h3>
              <p className="text-sm text-[hsl(210,15%,55%)] leading-relaxed">
                Digite o código no painel da porta. Automaticamente, a porta destranca, luzes acendem e ar-condicionado ajusta para você.
              </p>
            </div>

            {/* Step 4 */}
            <div className="group p-6 rounded-2xl bg-gradient-to-b from-[hsl(215,30%,12%)] to-[hsl(220,25%,8%)] border border-[hsl(210,20%,18%)] hover:border-[hsl(35,95%,55%)]/40 transition-all duration-500 hover:shadow-xl hover:shadow-[hsl(35,95%,55%)]/10 relative">
              <div className="absolute -top-3 -left-3 w-10 h-10 rounded-xl bg-gradient-to-br from-[hsl(35,95%,55%)] to-[hsl(25,90%,50%)] flex items-center justify-center text-sm font-bold text-[hsl(220,25%,6%)] shadow-lg shadow-[hsl(35,95%,55%)]/30">
                4
              </div>
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-[hsl(35,95%,55%)]/15 to-[hsl(25,90%,50%)]/5 mb-5 mt-2 group-hover:scale-110 transition-transform duration-300 border border-[hsl(35,95%,55%)]/20">
                <Smartphone className="w-8 h-8 text-[hsl(35,95%,60%)]" />
              </div>
              <h3 className="font-semibold text-lg mb-2 text-white">Controle Total</h3>
              <p className="text-sm text-[hsl(210,15%,55%)] leading-relaxed">
                Durante a estadia, ajuste iluminação, peça café ou estenda seu tempo. Ao sair, o sistema encerra tudo sozinho.
              </p>
            </div>
          </div>

          <div className="text-center mt-12">
            <Link to="/auth?mode=register">
              <Button size="lg" className="gap-2 px-8 py-6 bg-gradient-to-r from-[hsl(188,85%,50%)] to-[hsl(200,80%,45%)] hover:from-[hsl(188,85%,55%)] hover:to-[hsl(200,80%,50%)] text-[hsl(220,25%,6%)] font-semibold shadow-xl shadow-[hsl(188,85%,50%)]/25 border-0">
                Começar Agora
                <ChevronRight className="w-5 h-5" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="planos" className="py-24 px-4 relative">
        <div className="absolute inset-0 bg-gradient-to-b from-[hsl(220,25%,6%)] via-[hsl(215,28%,9%)] to-[hsl(220,25%,6%)]"></div>
        <div className="container mx-auto relative z-10">
          <div className="text-center mb-16">
            <span className="inline-block text-sm font-semibold text-[hsl(188,85%,50%)] mb-3 uppercase tracking-wider">Investimento</span>
            <h2 className="text-3xl md:text-5xl font-bold mb-4 text-white">
              Planos e Preços
            </h2>
            <p className="text-[hsl(210,15%,55%)] max-w-xl mx-auto text-lg">
              Escolha o plano ideal para você. Quanto mais horas, maior o desconto.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {/* On-Demand */}
            <div className="group p-8 rounded-2xl bg-gradient-to-b from-[hsl(215,30%,12%)] to-[hsl(220,25%,8%)] border border-[hsl(210,20%,18%)] hover:border-[hsl(210,20%,25%)] transition-all duration-500 hover:shadow-xl hover:shadow-black/20">
              <div className="text-center mb-8">
                <h3 className="font-semibold text-2xl mb-1 text-white">On-Demand</h3>
                <p className="text-sm text-[hsl(210,15%,55%)]">Uso avulso</p>
              </div>
              <div className="text-center mb-8">
                <span className="text-5xl font-bold text-white">R$ 45</span>
                <span className="text-[hsl(210,15%,55%)]">/hora</span>
              </div>
              <ul className="space-y-4 mb-8">
                <li className="flex items-center gap-3 text-[hsl(210,20%,75%)]">
                  <div className="w-5 h-5 rounded-full bg-[hsl(188,85%,50%)]/20 flex items-center justify-center">
                    <Check className="w-3 h-3 text-[hsl(188,85%,55%)]" />
                  </div>
                  <span>Pague apenas o que usar</span>
                </li>
                <li className="flex items-center gap-3 text-[hsl(210,20%,75%)]">
                  <div className="w-5 h-5 rounded-full bg-[hsl(188,85%,50%)]/20 flex items-center justify-center">
                    <Check className="w-3 h-3 text-[hsl(188,85%,55%)]" />
                  </div>
                  <span>Sem compromisso</span>
                </li>
                <li className="flex items-center gap-3 text-[hsl(210,20%,75%)]">
                  <div className="w-5 h-5 rounded-full bg-[hsl(188,85%,50%)]/20 flex items-center justify-center">
                    <Check className="w-3 h-3 text-[hsl(188,85%,55%)]" />
                  </div>
                  <span>1 café cortesia/sessão</span>
                </li>
              </ul>
              <Link to="/auth?mode=register&plan=ondemand">
                <Button variant="outline" className="w-full py-6 border-[hsl(210,20%,25%)] text-[hsl(210,20%,80%)] hover:bg-[hsl(210,20%,15%)] hover:text-white hover:border-[hsl(188,85%,50%)]/50 transition-all duration-300">
                  Escolher
                </Button>
              </Link>
            </div>

            {/* Pro */}
            <div className="group p-8 rounded-2xl bg-gradient-to-b from-[hsl(215,30%,14%)] to-[hsl(220,25%,9%)] border-2 border-[hsl(188,85%,50%)]/50 relative shadow-xl shadow-[hsl(188,85%,50%)]/10 hover:border-[hsl(188,85%,50%)]/70 transition-all duration-500 scale-[1.02]">
              <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-gradient-to-r from-[hsl(188,85%,50%)] to-[hsl(200,80%,45%)] text-[hsl(220,25%,6%)] text-xs font-bold px-4 py-1.5 rounded-full shadow-lg shadow-[hsl(188,85%,50%)]/30">
                MAIS POPULAR
              </div>
              <div className="text-center mb-8">
                <h3 className="font-semibold text-2xl mb-1 text-white">Pro</h3>
                <p className="text-sm text-[hsl(210,15%,55%)]">10 horas/mês</p>
              </div>
              <div className="text-center mb-8">
                <span className="text-5xl font-bold text-white">R$ 350</span>
                <span className="text-[hsl(210,15%,55%)]">/mês</span>
                <p className="text-sm text-[hsl(188,85%,55%)] mt-2 font-medium">Economia de 22%</p>
              </div>
              <ul className="space-y-4 mb-8">
                <li className="flex items-center gap-3 text-[hsl(210,20%,80%)]">
                  <div className="w-5 h-5 rounded-full bg-[hsl(188,85%,50%)]/30 flex items-center justify-center">
                    <Check className="w-3 h-3 text-[hsl(188,85%,60%)]" />
                  </div>
                  <span>10 horas incluídas</span>
                </li>
                <li className="flex items-center gap-3 text-[hsl(210,20%,80%)]">
                  <div className="w-5 h-5 rounded-full bg-[hsl(188,85%,50%)]/30 flex items-center justify-center">
                    <Check className="w-3 h-3 text-[hsl(188,85%,60%)]" />
                  </div>
                  <span>Reserva antecipada</span>
                </li>
                <li className="flex items-center gap-3 text-[hsl(210,20%,80%)]">
                  <div className="w-5 h-5 rounded-full bg-[hsl(188,85%,50%)]/30 flex items-center justify-center">
                    <Check className="w-3 h-3 text-[hsl(188,85%,60%)]" />
                  </div>
                  <span>2 cafés cortesia/sessão</span>
                </li>
              </ul>
              <Link to="/auth?mode=register&plan=pro">
                <Button className="w-full py-6 bg-gradient-to-r from-[hsl(188,85%,50%)] to-[hsl(200,80%,45%)] hover:from-[hsl(188,85%,55%)] hover:to-[hsl(200,80%,50%)] text-[hsl(220,25%,6%)] font-semibold shadow-lg shadow-[hsl(188,85%,50%)]/25 border-0">
                  Escolher
                </Button>
              </Link>
            </div>

            {/* Executive */}
            <div className="group p-8 rounded-2xl bg-gradient-to-b from-[hsl(215,30%,12%)] to-[hsl(220,25%,8%)] border border-[hsl(210,20%,18%)] hover:border-[hsl(280,70%,50%)]/40 transition-all duration-500 hover:shadow-xl hover:shadow-[hsl(280,70%,50%)]/10">
              <div className="text-center mb-8">
                <h3 className="font-semibold text-2xl mb-1 text-white">Executive</h3>
                <p className="text-sm text-[hsl(210,15%,55%)]">20 horas/mês</p>
              </div>
              <div className="text-center mb-8">
                <span className="text-5xl font-bold text-white">R$ 600</span>
                <span className="text-[hsl(210,15%,55%)]">/mês</span>
                <p className="text-sm text-[hsl(280,70%,60%)] mt-2 font-medium">Economia de 33%</p>
              </div>
              <ul className="space-y-4 mb-8">
                <li className="flex items-center gap-3 text-[hsl(210,20%,75%)]">
                  <div className="w-5 h-5 rounded-full bg-[hsl(280,70%,50%)]/20 flex items-center justify-center">
                    <Check className="w-3 h-3 text-[hsl(280,70%,60%)]" />
                  </div>
                  <span>20 horas incluídas</span>
                </li>
                <li className="flex items-center gap-3 text-[hsl(210,20%,75%)]">
                  <div className="w-5 h-5 rounded-full bg-[hsl(280,70%,50%)]/20 flex items-center justify-center">
                    <Check className="w-3 h-3 text-[hsl(280,70%,60%)]" />
                  </div>
                  <span>Prioridade nas reservas</span>
                </li>
                <li className="flex items-center gap-3 text-[hsl(210,20%,75%)]">
                  <div className="w-5 h-5 rounded-full bg-[hsl(280,70%,50%)]/20 flex items-center justify-center">
                    <Check className="w-3 h-3 text-[hsl(280,70%,60%)]" />
                  </div>
                  <span>Cafés ilimitados</span>
                </li>
              </ul>
              <Link to="/auth?mode=register&plan=executive">
                <Button variant="outline" className="w-full py-6 border-[hsl(280,70%,50%)]/30 text-[hsl(280,70%,70%)] hover:bg-[hsl(280,70%,50%)]/10 hover:text-[hsl(280,70%,80%)] hover:border-[hsl(280,70%,50%)]/50 transition-all duration-300">
                  Escolher
                </Button>
              </Link>
            </div>
          </div>

          <div className="text-center mt-10">
            <Link to="/auth?mode=register&plan=enterprise" className="inline-flex items-center gap-2 text-[hsl(188,85%,55%)] hover:text-[hsl(188,85%,65%)] text-sm font-medium transition-colors">
              Precisa de um plano corporativo? Fale conosco
              <ChevronRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section id="faq" className="py-24 px-4 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-[hsl(215,30%,8%)] via-[hsl(220,25%,6%)] to-[hsl(225,25%,8%)]"></div>
        <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-[hsl(188,85%,50%)]/5 rounded-full blur-[100px]"></div>
        
        <div className="container mx-auto max-w-3xl relative z-10">
          <div className="text-center mb-16">
            <span className="inline-block text-sm font-semibold text-[hsl(188,85%,50%)] mb-3 uppercase tracking-wider">Dúvidas</span>
            <h2 className="text-3xl md:text-5xl font-bold mb-4 text-white">
              Perguntas Frequentes
            </h2>
            <p className="text-[hsl(210,15%,55%)] text-lg">
              Tire suas dúvidas sobre a Smart Room.
            </p>
          </div>

          <Accordion type="single" collapsible className="space-y-4">
            <AccordionItem value="item-1" className="rounded-2xl bg-gradient-to-b from-[hsl(215,30%,12%)] to-[hsl(220,25%,9%)] px-6 border border-[hsl(210,20%,18%)] hover:border-[hsl(188,85%,50%)]/30 transition-colors data-[state=open]:border-[hsl(188,85%,50%)]/40">
              <AccordionTrigger className="hover:no-underline py-5">
                <div className="flex items-center gap-4 text-left">
                  <div className="w-8 h-8 rounded-lg bg-[hsl(188,85%,50%)]/15 flex items-center justify-center shrink-0">
                    <HelpCircle className="w-4 h-4 text-[hsl(188,85%,55%)]" />
                  </div>
                  <span className="text-white font-medium">E se eu chegar alguns minutos antes do meu horário?</span>
                </div>
              </AccordionTrigger>
              <AccordionContent className="text-[hsl(210,15%,60%)] pb-5 pl-12 leading-relaxed">
                Por segurança e organização, seu código de acesso só será ativado exatamente no horário reservado. Mas não se preocupe: você receberá um alerta no celular assim que a sala estiver pronta para você entrar!
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="item-2" className="rounded-2xl bg-gradient-to-b from-[hsl(215,30%,12%)] to-[hsl(220,25%,9%)] px-6 border border-[hsl(210,20%,18%)] hover:border-[hsl(188,85%,50%)]/30 transition-colors data-[state=open]:border-[hsl(188,85%,50%)]/40">
              <AccordionTrigger className="hover:no-underline py-5">
                <div className="flex items-center gap-4 text-left">
                  <div className="w-8 h-8 rounded-lg bg-[hsl(188,85%,50%)]/15 flex items-center justify-center shrink-0">
                    <HelpCircle className="w-4 h-4 text-[hsl(188,85%,55%)]" />
                  </div>
                  <span className="text-white font-medium">Esqueci de desligar o ar e as luzes ao sair. E agora?</span>
                </div>
              </AccordionTrigger>
              <AccordionContent className="text-[hsl(210,15%,60%)] pb-5 pl-12 leading-relaxed">
                Fique tranquilo(a)! A Smart Room é inteligente. Assim que o seu tempo termina, o sistema detecta o fim da sessão e desliga automaticamente todos os equipamentos e tranca a porta. Você não precisa se preocupar com nada.
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="item-3" className="rounded-2xl bg-gradient-to-b from-[hsl(215,30%,12%)] to-[hsl(220,25%,9%)] px-6 border border-[hsl(210,20%,18%)] hover:border-[hsl(188,85%,50%)]/30 transition-colors data-[state=open]:border-[hsl(188,85%,50%)]/40">
              <AccordionTrigger className="hover:no-underline py-5">
                <div className="flex items-center gap-4 text-left">
                  <div className="w-8 h-8 rounded-lg bg-[hsl(188,85%,50%)]/15 flex items-center justify-center shrink-0">
                    <HelpCircle className="w-4 h-4 text-[hsl(188,85%,55%)]" />
                  </div>
                  <span className="text-white font-medium">Como eu recebo o meu café cortesia?</span>
                </div>
              </AccordionTrigger>
              <AccordionContent className="text-[hsl(210,15%,60%)] pb-5 pl-12 leading-relaxed">
                É muito simples: dentro da sala, abra o nosso Web App no seu celular e clique no botão "Liberar Café". A máquina será ativada instantaneamente. A primeira cápsula é por nossa conta!
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="item-4" className="rounded-2xl bg-gradient-to-b from-[hsl(215,30%,12%)] to-[hsl(220,25%,9%)] px-6 border border-[hsl(210,20%,18%)] hover:border-[hsl(188,85%,50%)]/30 transition-colors data-[state=open]:border-[hsl(188,85%,50%)]/40">
              <AccordionTrigger className="hover:no-underline py-5">
                <div className="flex items-center gap-4 text-left">
                  <div className="w-8 h-8 rounded-lg bg-[hsl(188,85%,50%)]/15 flex items-center justify-center shrink-0">
                    <HelpCircle className="w-4 h-4 text-[hsl(188,85%,55%)]" />
                  </div>
                  <span className="text-white font-medium">O que eu faço se tiver algum problema técnico?</span>
                </div>
              </AccordionTrigger>
              <AccordionContent className="text-[hsl(210,15%,60%)] pb-5 pl-12 leading-relaxed">
                No seu painel de controle (no app), existe um botão chamado "Reportar Problema". Selecione a categoria (ex: ar-condicionado ou Wi-Fi) e nossa equipe de suporte receberá um alerta urgente para te ajudar remotamente ou enviar um técnico.
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="item-5" className="rounded-2xl bg-gradient-to-b from-[hsl(215,30%,12%)] to-[hsl(220,25%,9%)] px-6 border border-[hsl(210,20%,18%)] hover:border-[hsl(188,85%,50%)]/30 transition-colors data-[state=open]:border-[hsl(188,85%,50%)]/40">
              <AccordionTrigger className="hover:no-underline py-5">
                <div className="flex items-center gap-4 text-left">
                  <div className="w-8 h-8 rounded-lg bg-[hsl(188,85%,50%)]/15 flex items-center justify-center shrink-0">
                    <HelpCircle className="w-4 h-4 text-[hsl(188,85%,55%)]" />
                  </div>
                  <span className="text-white font-medium">Posso estender minha permanência se a reunião atrasar?</span>
                </div>
              </AccordionTrigger>
              <AccordionContent className="text-[hsl(210,15%,60%)] pb-5 pl-12 leading-relaxed">
                Sim! Se não houver outra reserva logo em seguida, o app mostrará o botão "Estender Reserva". Você escolhe o tempo adicional e o pagamento é feito na hora com seus créditos ou cartão cadastrado.
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="item-6" className="rounded-2xl bg-gradient-to-b from-[hsl(215,30%,12%)] to-[hsl(220,25%,9%)] px-6 border border-[hsl(210,20%,18%)] hover:border-[hsl(188,85%,50%)]/30 transition-colors data-[state=open]:border-[hsl(188,85%,50%)]/40">
              <AccordionTrigger className="hover:no-underline py-5">
                <div className="flex items-center gap-4 text-left">
                  <div className="w-8 h-8 rounded-lg bg-[hsl(188,85%,50%)]/15 flex items-center justify-center shrink-0">
                    <HelpCircle className="w-4 h-4 text-[hsl(188,85%,55%)]" />
                  </div>
                  <span className="text-white font-medium">Preciso baixar algum aplicativo?</span>
                </div>
              </AccordionTrigger>
              <AccordionContent className="text-[hsl(210,15%,60%)] pb-5 pl-12 leading-relaxed">
                Não é necessário! Nosso sistema funciona direto pelo navegador do seu celular. Para facilitar, você pode clicar em "Adicionar à Tela de Início" no seu navegador e ele funcionará exatamente como um aplicativo comum.
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 px-4 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-[hsl(220,25%,6%)] via-[hsl(215,30%,10%)] to-[hsl(220,25%,6%)]"></div>
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,hsl(188,85%,50%,0.08),transparent_70%)]"></div>
        
        <div className="container mx-auto text-center max-w-2xl relative z-10">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-[hsl(188,85%,50%)]/20 to-[hsl(200,80%,45%)]/10 mb-6 border border-[hsl(188,85%,50%)]/30">
            <Sparkles className="w-8 h-8 text-[hsl(188,85%,55%)]" />
          </div>
          <h2 className="text-3xl md:text-5xl font-bold mb-4 text-white">
            Pronto para experimentar?
          </h2>
          <p className="text-[hsl(210,15%,55%)] mb-10 text-lg">
            Cadastre-se agora e faça sua primeira reserva em menos de 2 minutos.
          </p>
          <Link to="/auth?mode=register">
            <Button size="lg" className="gap-2 text-lg px-10 py-7 bg-gradient-to-r from-[hsl(188,85%,50%)] to-[hsl(200,80%,45%)] hover:from-[hsl(188,85%,55%)] hover:to-[hsl(200,80%,50%)] text-[hsl(220,25%,6%)] font-semibold shadow-xl shadow-[hsl(188,85%,50%)]/30 border-0">
              Criar Conta Grátis
              <ChevronRight className="w-5 h-5" />
            </Button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-10 px-4 bg-[hsl(220,30%,5%)] border-t border-[hsl(210,20%,12%)]">
        <div className="container mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-gradient-to-br from-[hsl(188,85%,50%)] to-[hsl(200,80%,45%)]">
              <Zap className="w-4 h-4 text-[hsl(220,25%,6%)]" />
            </div>
            <span className="font-semibold text-white">Smart Room Office</span>
          </div>
          <p className="text-sm text-[hsl(210,15%,45%)]">
            © 2025 Smart Room Office. Todos os direitos reservados.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default Landing;
