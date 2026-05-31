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
  Sparkles,
  Wifi,
  Monitor,
  Lock,
  Shield,
  Star
} from "lucide-react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { useLandingPageConfig } from "@/hooks/useLandingPageConfig";
import { HeroCarousel } from "@/components/landing/HeroCarousel";
import { Skeleton } from "@/components/ui/skeleton";
import { ThemeToggle } from "@/components/ThemeToggle";

// Icon mapping for dynamic rendering
const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  Zap, Calendar, KeyRound, DoorOpen, Smartphone, Lightbulb, Wind, Coffee,
  ChevronRight, Check, HelpCircle, Sparkles, Wifi, Monitor, Lock, Shield, Star
};

const getIcon = (iconName: string) => {
  return iconMap[iconName] || Star;
};

// Color schemes for features and steps
const featureColors = [
  { bg: "from-[hsl(45,100%,50%)]/20 to-[hsl(35,100%,45%)]/10", border: "border-[hsl(45,100%,50%)]/20", icon: "text-[hsl(45,100%,55%)]" },
  { bg: "from-[hsl(200,80%,50%)]/20 to-[hsl(210,70%,45%)]/10", border: "border-[hsl(200,80%,50%)]/20", icon: "text-[hsl(200,80%,55%)]" },
  { bg: "from-[hsl(25,85%,50%)]/20 to-[hsl(15,80%,40%)]/10", border: "border-[hsl(25,85%,50%)]/20", icon: "text-[hsl(25,85%,55%)]" },
  { bg: "from-[hsl(188,85%,50%)]/20 to-[hsl(200,80%,45%)]/10", border: "border-[hsl(188,85%,50%)]/20", icon: "text-[hsl(188,85%,55%)]" },
  { bg: "from-[hsl(280,70%,50%)]/20 to-[hsl(260,65%,45%)]/10", border: "border-[hsl(280,70%,50%)]/20", icon: "text-[hsl(280,70%,60%)]" },
  { bg: "from-[hsl(142,70%,45%)]/20 to-[hsl(160,65%,40%)]/10", border: "border-[hsl(142,70%,45%)]/20", icon: "text-[hsl(142,70%,55%)]" },
];

const stepColors = [
  { bg: "from-[hsl(188,85%,50%)] to-[hsl(200,80%,45%)]", text: "text-[hsl(220,25%,6%)]", hover: "hover:border-[hsl(188,85%,50%)]/40", iconBg: "from-[hsl(188,85%,50%)]/15 to-[hsl(200,80%,45%)]/5", iconBorder: "border-[hsl(188,85%,50%)]/20", iconColor: "text-[hsl(188,85%,55%)]" },
  { bg: "from-[hsl(280,70%,55%)] to-[hsl(260,65%,50%)]", text: "text-white", hover: "hover:border-[hsl(280,70%,50%)]/40", iconBg: "from-[hsl(280,70%,50%)]/15 to-[hsl(260,65%,45%)]/5", iconBorder: "border-[hsl(280,70%,50%)]/20", iconColor: "text-[hsl(280,70%,60%)]" },
  { bg: "from-[hsl(142,70%,50%)] to-[hsl(160,65%,40%)]", text: "text-[hsl(220,25%,6%)]", hover: "hover:border-[hsl(142,70%,45%)]/40", iconBg: "from-[hsl(142,70%,45%)]/15 to-[hsl(160,65%,40%)]/5", iconBorder: "border-[hsl(142,70%,45%)]/20", iconColor: "text-[hsl(142,70%,55%)]" },
  { bg: "from-[hsl(35,95%,55%)] to-[hsl(25,90%,50%)]", text: "text-[hsl(220,25%,6%)]", hover: "hover:border-[hsl(35,95%,55%)]/40", iconBg: "from-[hsl(35,95%,55%)]/15 to-[hsl(25,90%,50%)]/5", iconBorder: "border-[hsl(35,95%,55%)]/20", iconColor: "text-[hsl(35,95%,60%)]" },
];

const Landing = () => {
  const { data: sections, isLoading } = useLandingPageConfig();

  const getSection = (key: string) => sections?.find(s => s.section_key === key && s.is_active);
  
  const heroSection = getSection("hero");
  const featuresSection = getSection("features");
  const howItWorksSection = getSection("how_it_works");
  const pricingSection = getSection("pricing");
  const faqSection = getSection("faq");
  const ctaSection = getSection("cta");

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[hsl(220,25%,6%)] flex items-center justify-center">
        <div className="text-center space-y-4">
          <Skeleton className="w-16 h-16 rounded-xl mx-auto" />
          <Skeleton className="w-48 h-6 mx-auto" />
        </div>
      </div>
    );
  }

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
          <div className="flex items-center gap-2">
            <ThemeToggle />
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
      {heroSection && (
        <section className="pt-32 pb-24 px-4 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-b from-[hsl(220,30%,8%)] via-[hsl(215,28%,10%)] to-[hsl(220,25%,6%)]"></div>
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[600px] bg-[hsl(188,85%,50%)]/8 rounded-full blur-[120px]"></div>
          <div className="absolute bottom-0 right-0 w-[400px] h-[400px] bg-[hsl(200,80%,40%)]/10 rounded-full blur-[100px]"></div>
          
          <div className="container mx-auto text-center max-w-4xl relative z-10">
            {heroSection.content.badge_text && (
              <div className="inline-flex items-center gap-2 bg-gradient-to-r from-[hsl(188,85%,50%)]/15 to-[hsl(200,80%,45%)]/10 border border-[hsl(188,85%,50%)]/30 rounded-full px-5 py-2 mb-8 backdrop-blur-sm">
                <Sparkles className="w-4 h-4 text-[hsl(188,85%,50%)]" />
                <span className="text-sm font-medium text-[hsl(188,85%,60%)]">{heroSection.content.badge_text}</span>
              </div>
            )}
            
            <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold mb-6 leading-tight">
              <span className="text-white">{heroSection.content.title?.split(" ").slice(0, 3).join(" ")}</span>
              <span className="block mt-2 bg-gradient-to-r from-[hsl(188,85%,55%)] via-[hsl(195,80%,50%)] to-[hsl(200,75%,55%)] bg-clip-text text-transparent">
                {heroSection.content.title?.split(" ").slice(3).join(" ") || "Inteligente e Autônoma"}
              </span>
            </h1>
            
            <p className="text-lg md:text-xl text-[hsl(210,15%,60%)] mb-10 max-w-2xl mx-auto leading-relaxed">
              {heroSection.content.subtitle}
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/auth?mode=register">
                <Button size="lg" className="w-full sm:w-auto gap-2 text-lg px-8 py-6 bg-gradient-to-r from-[hsl(188,85%,50%)] to-[hsl(200,80%,45%)] hover:from-[hsl(188,85%,55%)] hover:to-[hsl(200,80%,50%)] text-[hsl(220,25%,6%)] font-semibold shadow-xl shadow-[hsl(188,85%,50%)]/30 border-0">
                  {heroSection.content.cta_primary || "Começar Agora"}
                  <ChevronRight className="w-5 h-5" />
                </Button>
              </Link>
              <a href="#planos">
                <Button variant="outline" size="lg" className="w-full sm:w-auto text-lg px-8 py-6 border-[hsl(210,20%,25%)] text-[hsl(210,20%,80%)] hover:bg-[hsl(210,20%,12%)] hover:text-white hover:border-[hsl(188,85%,50%)]/50 transition-all duration-300">
                  {heroSection.content.cta_secondary || "Ver Planos"}
                </Button>
              </a>
            </div>

            {/* Hero Carousel */}
            <div className="mt-16 relative">
              <HeroCarousel items={heroSection.content.carousel_items || []} />
              <div className="absolute -bottom-10 left-1/2 -translate-x-1/2 w-2/3 h-20 bg-[hsl(188,85%,50%)]/20 blur-3xl rounded-full"></div>
            </div>
          </div>
        </section>
      )}

      {/* Features Section */}
      {featuresSection && (
        <section className="py-24 px-4 relative">
          <div className="absolute inset-0 bg-gradient-to-b from-[hsl(220,25%,6%)] via-[hsl(215,28%,9%)] to-[hsl(220,25%,6%)]"></div>
          <div className="container mx-auto relative z-10">
            <div className="text-center mb-16">
              <span className="inline-block text-sm font-semibold text-[hsl(188,85%,50%)] mb-3 uppercase tracking-wider">Recursos</span>
              <h2 className="text-3xl md:text-5xl font-bold mb-4 text-white">
                {featuresSection.content.title}
              </h2>
              <p className="text-[hsl(210,15%,55%)] max-w-xl mx-auto text-lg">
                {featuresSection.content.subtitle}
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
              {featuresSection.content.items?.map((item: any, index: number) => {
                const colors = featureColors[index % featureColors.length];
                const IconComponent = getIcon(item.icon);
                return (
                  <div key={index} className="group p-8 rounded-2xl bg-gradient-to-b from-[hsl(215,30%,12%)] to-[hsl(220,25%,8%)] border border-[hsl(210,20%,18%)] hover:border-[hsl(188,85%,50%)]/30 transition-all duration-500 hover:shadow-xl hover:shadow-[hsl(188,85%,50%)]/10 hover:-translate-y-1 text-center">
                    <div className={`inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br ${colors.bg} mb-6 group-hover:scale-110 transition-transform duration-300 ${colors.border}`}>
                      <IconComponent className={`w-8 h-8 ${colors.icon}`} />
                    </div>
                    <h3 className="font-semibold text-xl mb-3 text-white">{item.title}</h3>
                    <p className="text-[hsl(210,15%,55%)] leading-relaxed">
                      {item.description}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>
        </section>
      )}

      {/* How it Works Section */}
      {howItWorksSection && (
        <section id="como-funciona" className="py-24 px-4 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-[hsl(215,30%,10%)] via-[hsl(220,25%,8%)] to-[hsl(225,25%,6%)]"></div>
          <div className="absolute top-1/2 left-0 w-[300px] h-[300px] bg-[hsl(188,85%,50%)]/5 rounded-full blur-[100px]"></div>
          <div className="absolute bottom-0 right-0 w-[400px] h-[400px] bg-[hsl(200,80%,40%)]/5 rounded-full blur-[120px]"></div>
          
          <div className="container mx-auto relative z-10">
            <div className="text-center mb-16">
              <span className="inline-block text-sm font-semibold text-[hsl(188,85%,50%)] mb-3 uppercase tracking-wider">Passo a Passo</span>
              <h2 className="text-3xl md:text-5xl font-bold mb-4 text-white">
                {howItWorksSection.content.title}
              </h2>
              <p className="text-[hsl(210,15%,55%)] max-w-xl mx-auto text-lg">
                {howItWorksSection.content.subtitle}
              </p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto">
              {howItWorksSection.content.steps?.map((step: any, index: number) => {
                const colors = stepColors[index % stepColors.length];
                const IconComponent = getIcon(step.icon || "Zap");
                return (
                  <div key={index} className={`group p-6 rounded-2xl bg-gradient-to-b from-[hsl(215,30%,12%)] to-[hsl(220,25%,8%)] border border-[hsl(210,20%,18%)] ${colors.hover} transition-all duration-500 hover:shadow-xl relative`}>
                    <div className={`absolute -top-3 -left-3 w-10 h-10 rounded-xl bg-gradient-to-br ${colors.bg} flex items-center justify-center text-sm font-bold ${colors.text} shadow-lg`}>
                      {step.number || index + 1}
                    </div>
                    <div className={`inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br ${colors.iconBg} mb-5 mt-2 group-hover:scale-110 transition-transform duration-300 ${colors.iconBorder}`}>
                      <IconComponent className={`w-8 h-8 ${colors.iconColor}`} />
                    </div>
                    <h3 className="font-semibold text-lg mb-2 text-white">{step.title}</h3>
                    <p className="text-sm text-[hsl(210,15%,55%)] leading-relaxed">
                      {step.description}
                    </p>
                  </div>
                );
              })}
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
      )}

      {/* Pricing Section */}
      {pricingSection && (
        <section id="planos" className="py-24 px-4 relative">
          <div className="absolute inset-0 bg-gradient-to-b from-[hsl(220,25%,6%)] via-[hsl(215,28%,9%)] to-[hsl(220,25%,6%)]"></div>
          <div className="container mx-auto relative z-10">
            <div className="text-center mb-16">
              <span className="inline-block text-sm font-semibold text-[hsl(188,85%,50%)] mb-3 uppercase tracking-wider">Investimento</span>
              <h2 className="text-3xl md:text-5xl font-bold mb-4 text-white">
                {pricingSection.content.title}
              </h2>
              <p className="text-[hsl(210,15%,55%)] max-w-xl mx-auto text-lg">
                {pricingSection.content.subtitle}
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
              {pricingSection.content.plans?.map((plan: any, index: number) => (
                <div key={index} className={`group p-8 rounded-2xl bg-gradient-to-b ${plan.highlighted ? 'from-[hsl(215,30%,14%)] to-[hsl(220,25%,9%)] border-2 border-[hsl(188,85%,50%)]/50 shadow-xl shadow-[hsl(188,85%,50%)]/10 scale-[1.02]' : 'from-[hsl(215,30%,12%)] to-[hsl(220,25%,8%)] border border-[hsl(210,20%,18%)]'} hover:border-[hsl(210,20%,25%)] transition-all duration-500 hover:shadow-xl relative`}>
                  {plan.highlighted && (
                    <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-gradient-to-r from-[hsl(188,85%,50%)] to-[hsl(200,80%,45%)] text-[hsl(220,25%,6%)] text-xs font-bold px-4 py-1.5 rounded-full shadow-lg shadow-[hsl(188,85%,50%)]/30">
                      MAIS POPULAR
                    </div>
                  )}
                  <div className="text-center mb-6">
                    <h3 className="font-semibold text-2xl mb-2 text-white">{plan.name}</h3>
                    {plan.subtitle && (
                      <p className="text-sm text-[hsl(210,20%,70%)] max-w-[260px] mx-auto leading-snug">{plan.subtitle}</p>
                    )}
                  </div>
                  <div className="text-center mb-8">
                    <div className="flex items-baseline justify-center gap-1">
                      <span className="text-5xl font-bold text-white">{plan.price}</span>
                      <span className="text-sm text-[hsl(210,15%,55%)]">{plan.period}</span>
                    </div>
                    {plan.badge && (
                      <span className="inline-block mt-3 text-xs font-medium text-[hsl(188,85%,55%)] bg-[hsl(188,85%,50%)]/10 border border-[hsl(188,85%,50%)]/30 px-3 py-1 rounded-full">
                        {plan.badge}
                      </span>
                    )}
                  </div>
                  <ul className="space-y-4 mb-8">
                    {plan.features?.map((feature: string, featureIndex: number) => (
                      <li key={featureIndex} className="flex items-center gap-3 text-[hsl(210,20%,75%)]">
                        <div className={`w-5 h-5 rounded-full ${plan.highlighted ? 'bg-[hsl(188,85%,50%)]/30' : 'bg-[hsl(188,85%,50%)]/20'} flex items-center justify-center`}>
                          <Check className={`w-3 h-3 ${plan.highlighted ? 'text-[hsl(188,85%,60%)]' : 'text-[hsl(188,85%,55%)]'}`} />
                        </div>
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>
                  <Link to={`/auth?mode=register&plan=${plan.name?.toLowerCase()}`}>
                    <Button className={`w-full py-6 ${plan.highlighted ? 'bg-gradient-to-r from-[hsl(188,85%,50%)] to-[hsl(200,80%,45%)] hover:from-[hsl(188,85%,55%)] hover:to-[hsl(200,80%,50%)] text-[hsl(220,25%,6%)] font-semibold shadow-lg shadow-[hsl(188,85%,50%)]/25 border-0' : 'border-[hsl(210,20%,25%)] text-[hsl(210,20%,80%)] hover:bg-[hsl(210,20%,15%)] hover:text-white hover:border-[hsl(188,85%,50%)]/50'}`} variant={plan.highlighted ? "default" : "outline"}>
                      {plan.cta || "Escolher"}
                    </Button>
                  </Link>
                </div>
              ))}
            </div>

            <div className="text-center mt-10">
              <Link to="/auth?mode=register&plan=enterprise" className="inline-flex items-center gap-2 text-[hsl(188,85%,55%)] hover:text-[hsl(188,85%,65%)] text-sm font-medium transition-colors">
                Precisa de um plano corporativo? Fale conosco
                <ChevronRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </section>
      )}

      {/* FAQ Section */}
      {faqSection && (
        <section id="faq" className="py-24 px-4 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-[hsl(215,30%,8%)] via-[hsl(220,25%,6%)] to-[hsl(225,25%,8%)]"></div>
          <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-[hsl(188,85%,50%)]/5 rounded-full blur-[100px]"></div>
          
          <div className="container mx-auto max-w-3xl relative z-10">
            <div className="text-center mb-16">
              <span className="inline-block text-sm font-semibold text-[hsl(188,85%,50%)] mb-3 uppercase tracking-wider">Dúvidas</span>
              <h2 className="text-3xl md:text-5xl font-bold mb-4 text-white">
                {faqSection.content.title}
              </h2>
              <p className="text-[hsl(210,15%,55%)] text-lg">
                Tire suas dúvidas sobre a Smart Room.
              </p>
            </div>

            <Accordion type="single" collapsible className="space-y-4">
              {faqSection.content.items?.map((item: any, index: number) => (
                <AccordionItem key={index} value={`item-${index}`} className="rounded-2xl bg-gradient-to-b from-[hsl(215,30%,12%)] to-[hsl(220,25%,9%)] px-6 border border-[hsl(210,20%,18%)] hover:border-[hsl(188,85%,50%)]/30 transition-colors data-[state=open]:border-[hsl(188,85%,50%)]/40">
                  <AccordionTrigger className="hover:no-underline py-5">
                    <div className="flex items-center gap-4 text-left">
                      <div className="w-8 h-8 rounded-lg bg-[hsl(188,85%,50%)]/15 flex items-center justify-center shrink-0">
                        <HelpCircle className="w-4 h-4 text-[hsl(188,85%,55%)]" />
                      </div>
                      <span className="text-white font-medium">{item.question}</span>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent className="text-[hsl(210,15%,60%)] pb-5 pl-12 leading-relaxed">
                    {item.answer}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </div>
        </section>
      )}

      {/* CTA Section */}
      {ctaSection && (
        <section className="py-24 px-4 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-b from-[hsl(220,25%,6%)] via-[hsl(215,30%,10%)] to-[hsl(220,25%,6%)]"></div>
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,hsl(188,85%,50%,0.08),transparent_70%)]"></div>
          
          <div className="container mx-auto text-center max-w-2xl relative z-10">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-[hsl(188,85%,50%)]/20 to-[hsl(200,80%,45%)]/10 mb-6 border border-[hsl(188,85%,50%)]/30">
              <Sparkles className="w-8 h-8 text-[hsl(188,85%,55%)]" />
            </div>
            <h2 className="text-3xl md:text-5xl font-bold mb-4 text-white">
              {ctaSection.content.title}
            </h2>
            <p className="text-[hsl(210,15%,55%)] mb-10 text-lg">
              {ctaSection.content.subtitle}
            </p>
            <Link to={ctaSection.content.button_link || "/auth?mode=register"}>
              <Button size="lg" className="gap-2 text-lg px-10 py-7 bg-gradient-to-r from-[hsl(188,85%,50%)] to-[hsl(200,80%,45%)] hover:from-[hsl(188,85%,55%)] hover:to-[hsl(200,80%,50%)] text-[hsl(220,25%,6%)] font-semibold shadow-xl shadow-[hsl(188,85%,50%)]/30 border-0">
                {ctaSection.content.button_text || "Criar Conta Grátis"}
                <ChevronRight className="w-5 h-5" />
              </Button>
            </Link>
          </div>
        </section>
      )}

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
