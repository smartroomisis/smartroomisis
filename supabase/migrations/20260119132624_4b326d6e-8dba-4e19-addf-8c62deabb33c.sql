-- Tabela para configurações gerais da landing page
CREATE TABLE public.landing_page_config (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    section_key text UNIQUE NOT NULL,
    content jsonb NOT NULL DEFAULT '{}'::jsonb,
    is_active boolean NOT NULL DEFAULT true,
    created_at timestamp with time zone NOT NULL DEFAULT now(),
    updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.landing_page_config ENABLE ROW LEVEL SECURITY;

-- Políticas RLS
CREATE POLICY "Anyone can view active landing page content"
ON public.landing_page_config
FOR SELECT
USING (is_active = true);

CREATE POLICY "Admins can manage landing page content"
ON public.landing_page_config
FOR ALL
USING (has_role(auth.uid(), 'admin'::app_role));

-- Trigger para updated_at
CREATE TRIGGER update_landing_page_config_updated_at
BEFORE UPDATE ON public.landing_page_config
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Inserir dados iniciais
INSERT INTO public.landing_page_config (section_key, content) VALUES
('hero', '{
    "title": "Sua Sala de Reunião Inteligente",
    "subtitle": "Espaço profissional equipado com tecnologia de ponta para suas reuniões, apresentações e trabalho focado.",
    "cta_primary": "Reservar Agora",
    "cta_secondary": "Ver Preços"
}'::jsonb),
('features', '{
    "title": "Por que escolher a Smart Room?",
    "subtitle": "Tecnologia e conforto para maximizar sua produtividade",
    "items": [
        {"icon": "Wifi", "title": "Internet Ultra Rápida", "description": "Conexão de fibra óptica dedicada para videoconferências sem interrupções"},
        {"icon": "Monitor", "title": "Equipamentos Premium", "description": "TV 4K, webcam HD, sistema de áudio profissional e quadro interativo"},
        {"icon": "Coffee", "title": "Café Gourmet", "description": "Máquina de café expresso com cápsulas premium inclusas"},
        {"icon": "Lock", "title": "Acesso Seguro", "description": "Entrada por código digital exclusivo, sem necessidade de recepcionista"},
        {"icon": "Zap", "title": "Reserva Instantânea", "description": "Reserve online em segundos e receba seu código de acesso imediatamente"},
        {"icon": "Shield", "title": "Privacidade Total", "description": "Sala isolada acusticamente para reuniões confidenciais"}
    ]
}'::jsonb),
('how_it_works', '{
    "title": "Como Funciona",
    "subtitle": "Em 3 passos simples você está dentro",
    "steps": [
        {"number": "1", "title": "Escolha o Horário", "description": "Selecione data e horário disponíveis no calendário online"},
        {"number": "2", "title": "Faça o Pagamento", "description": "Pague com cartão, PIX ou use seus créditos do plano"},
        {"number": "3", "title": "Acesse a Sala", "description": "Receba o código de acesso e entre na sua sala equipada"}
    ]
}'::jsonb),
('pricing', '{
    "title": "Planos e Preços",
    "subtitle": "Escolha o plano ideal para sua necessidade",
    "plans": [
        {"name": "Avulso", "price": "R$ 45", "period": "/hora", "features": ["Sem compromisso", "Café incluso", "Wi-Fi premium", "Equipamentos HD"], "highlighted": false, "cta": "Reservar"},
        {"name": "Profissional", "price": "R$ 299", "period": "/mês", "features": ["10 horas inclusas", "Hora extra: R$ 35", "Prioridade na reserva", "Suporte prioritário"], "highlighted": true, "cta": "Assinar"},
        {"name": "Executivo", "price": "R$ 599", "period": "/mês", "features": ["25 horas inclusas", "Hora extra: R$ 30", "Sala VIP disponível", "Concierge dedicado"], "highlighted": false, "cta": "Assinar"}
    ]
}'::jsonb),
('faq', '{
    "title": "Perguntas Frequentes",
    "items": [
        {"question": "Como faço para acessar a sala?", "answer": "Após a confirmação da reserva, você receberá um código de 6 dígitos por e-mail e SMS. Basta digitar o código no painel da porta para entrar."},
        {"question": "Posso cancelar minha reserva?", "answer": "Sim! Cancelamentos com mais de 24h de antecedência são reembolsados integralmente. Cancelamentos com menos de 24h são convertidos em créditos."},
        {"question": "O café está incluso?", "answer": "Sim! Todas as reservas incluem acesso à nossa máquina de café expresso com cápsulas premium. Água e chá também estão disponíveis."},
        {"question": "Posso levar convidados?", "answer": "A sala comporta até 6 pessoas confortavelmente. Não há custo adicional por convidado."},
        {"question": "E se eu precisar de mais tempo?", "answer": "Se a sala estiver disponível, você pode estender sua reserva diretamente pelo app. Será cobrado proporcionalmente."}
    ]
}'::jsonb),
('cta', '{
    "title": "Pronto para elevar suas reuniões?",
    "subtitle": "Experimente a Smart Room e descubra um novo padrão de produtividade.",
    "button_text": "Começar Agora",
    "button_link": "/auth"
}'::jsonb);