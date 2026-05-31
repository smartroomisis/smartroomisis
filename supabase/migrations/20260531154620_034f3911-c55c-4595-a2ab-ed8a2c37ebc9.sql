UPDATE public.landing_page_config
SET content = jsonb_build_object(
  'title', 'Uma sala. Infinitas possibilidades.',
  'subtitle', 'Escolha o plano ideal para você.',
  'plans', jsonb_build_array(
    jsonb_build_object(
      'name', 'Avulso',
      'price', 'R$ 45',
      'period', '/hora',
      'subtitle', 'Uma sala completa, quando você precisar.',
      'cta', 'Reservar',
      'highlighted', false,
      'features', jsonb_build_array(
        'Uso flexível: reunião, podcast, UGC ou videoconferência',
        'TV + Assistente de voz (Alexa)',
        'Wi-Fi dedicado',
        'Estacionamento incluso',
        'Café e água disponíveis',
        'Reserva online, acesso imediato',
        'Sem mensalidade, sem fidelidade'
      )
    ),
    jsonb_build_object(
      'name', 'Profissional',
      'price', 'R$ 299',
      'period', '/mês',
      'badge', 'Cobrança mensal recorrente',
      'subtitle', 'Para quem usa com regularidade — sem abrir mão da flexibilidade.',
      'cta', 'Assinar',
      'highlighted', true,
      'features', jsonb_build_array(
        '10 horas/mês — R$29,90/h (economize 33% vs avulso)',
        'Uso flexível: reunião, podcast, UGC, treinamento ou videoconferência',
        'TV + Assistente de voz (Alexa)',
        'Wi-Fi dedicado',
        'Estacionamento incluso',
        'Café e água disponíveis',
        'Reservas prioritárias',
        'Horas não usadas acumulam por 15 dias',
        'Pode ceder horas para outra pessoa (sem necessidade de cadastro)'
      )
    ),
    jsonb_build_object(
      'name', 'Executivo',
      'price', 'R$ 599',
      'period', '/mês',
      'badge', 'Cobrança mensal recorrente',
      'subtitle', 'Para quem faz da sala parte da rotina — pessoal ou de equipe.',
      'cta', 'Assinar',
      'highlighted', false,
      'features', jsonb_build_array(
        '25 horas/mês — R$23,96/h (economize 47% vs avulso)',
        'Uso flexível: reunião, podcast, UGC, treinamento ou videoconferência',
        'TV + Assistente de voz (Alexa)',
        'Wi-Fi dedicado',
        'Estacionamento incluso',
        'Café e água disponíveis',
        'Reservas prioritárias',
        'Horas não usadas acumulam por 15 dias',
        'Pode ceder horas para outra pessoa (sem necessidade de cadastro)'
      )
    )
  )
)
WHERE section_key = 'pricing';