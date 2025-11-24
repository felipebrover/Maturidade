
import { Pillar, ClientInfoData, ClientInfoSectionId, Client, User, View, Journey, Objective, KeyResult, Initiative, Action, MaturityQuestion } from './types';

export const PILLAR_DATA: Record<Pillar, { name: string; description: string; color: string; }> = {
    [Pillar.STRATEGY]: {
        name: 'Estratégia e Direcionamento',
        description: 'Clareza na direção do negócio, ICP e posicionamento de mercado.',
        color: '#ef4444', // Red
    },
    [Pillar.GOALS]: {
        name: 'Metas e Planejamento',
        description: 'Definição, desdobramento e acompanhamento de metas comerciais.',
        color: '#f97316', // Orange
    },
    [Pillar.CHANNELS]: {
        name: 'Canais e Aquisição',
        description: 'Geração de demanda e aquisição de clientes por múltiplos canais.',
        color: '#eab308', // Yellow
    },
    [Pillar.PROCESS]: {
        name: 'Processos',
        description: 'Estruturação da jornada de compra e atividades do time comercial.',
        color: '#22c55e', // Green
    },
    [Pillar.METRICS]: {
        name: 'Métricas',
        description: 'Cultura de dados, KPIs e tomada de decisão baseada em análise.',
        color: '#3b82f6', // Blue
    },
    [Pillar.COMPENSATION]: {
        name: 'Remuneração',
        description: 'Modelo de remuneração variável e incentivos para o time.',
        color: '#8b5cf6', // Violet
    },
    [Pillar.SYSTEMS]: {
        name: 'Sistemas',
        description: 'Ferramentas, CRM e tecnologia para suportar a operação comercial.',
        color: '#ec4899', // Pink
    }
};

export const PILLARS = Object.values(Pillar) as Pillar[];

export const PILLAR_WEIGHTS: Record<Pillar, number> = {
    [Pillar.STRATEGY]: 0.20,
    [Pillar.GOALS]: 0.14,
    [Pillar.CHANNELS]: 0.12,
    [Pillar.PROCESS]: 0.17,
    [Pillar.METRICS]: 0.15,
    [Pillar.COMPENSATION]: 0.09,
    [Pillar.SYSTEMS]: 0.13
};

export const INITIAL_PILLAR_SCORE = {
    responses: Array(10).fill(0),
    goal: 0,
    notes: ''
};

export const INITIAL_USERS: User[] = [
    {
        id: 'admin-default',
        username: 'admin',
        password: 'master',
        role: 'admin'
    }
];

// Updated Order to match the Consulting Journey Flow - Removed 'basic'
export const CLIENT_INFO_SECTIONS_ORDER: ClientInfoSectionId[] = [
    'summary',      // Pré-Projeto (Assessment, Recursos, Dados)
    'background',   // Semana 1: ICP & Estratégia
    'contacts',     // Semana 2: Estrutura & Pessoas
    'funnel',       // Semana 3: Processos & Automação
    'metrics',      // Semana 3: CRM & Dados
    'materials',    // Semana 4: Playbooks & Enablement
    'goals',        // Semana 5-12: Gestão & Estratégia
    'competitors'   // Elite: Inteligência Avançada
];

// Updated with the Master Definitive Questionnaire (350 Questions) with Levels
export const DEFAULT_CLIENT_INFO: ClientInfoData = {
    summary: {
        title: 'Pré-Projeto: Assessment Inicial (Q1-40)',
        questions: [
            // NÍVEL 1 - ESSENCIAL (Contexto & Expectativas)
            { id: 'mq-1', question: '1. Nome da empresa e CNPJ', answer: '', isDefault: true, attachments: [], level: 'Essencial' },
            { id: 'mq-2', question: '2. Segmento de atuação principal', answer: '', isDefault: true, attachments: [], level: 'Essencial' },
            { id: 'mq-3', question: '3. Tempo de mercado', answer: '', isDefault: true, attachments: [], level: 'Essencial' },
            { id: 'mq-4', question: '4. Faturamento anual aproximado', answer: '', isDefault: true, attachments: [], level: 'Essencial' },
            { id: 'mq-5', question: '5. Número total de funcionários', answer: '', isDefault: true, attachments: [], level: 'Essencial' },
            { id: 'mq-6', question: '6. Número de pessoas no comercial', answer: '', isDefault: true, attachments: [], level: 'Essencial' },
            { id: 'mq-7', question: '7. Principal produto/serviço vendido', answer: '', isDefault: true, attachments: [], level: 'Essencial' },
            { id: 'mq-8', question: '8. Ticket médio atual', answer: '', isDefault: true, attachments: [], level: 'Essencial' },
            { id: 'mq-9', question: '9. Modelo de receita (recorrente, transacional, projeto)', answer: '', isDefault: true, attachments: [], level: 'Essencial' },
            { id: 'mq-10', question: '10. Principais desafios comerciais hoje (top 3)', answer: '', isDefault: true, attachments: [], level: 'Essencial' },
            { id: 'mq-11', question: '11. O que seria sucesso em 90 dias?', answer: '', isDefault: true, attachments: [], level: 'Essencial' },
            { id: 'mq-12', question: '12. Qual o maior medo sobre o projeto?', answer: '', isDefault: true, attachments: [], level: 'Essencial' },
            { id: 'mq-13', question: '13. Quem são os patrocinadores internos?', answer: '', isDefault: true, attachments: [], level: 'Essencial' },
            { id: 'mq-14', question: '14. Orçamento disponível para melhorias', answer: '', isDefault: true, attachments: [], level: 'Essencial' },
            { id: 'mq-15', question: '15. Prazo máximo para ver resultados', answer: '', isDefault: true, attachments: [], level: 'Essencial' },
            
            // NÍVEL 2 - PROFISSIONAL (Maturidade Atual & Recursos)
            { id: 'mq-16', question: '16. Existe processo comercial documentado? (enviar se sim)', answer: '', isDefault: true, attachments: [], level: 'Profissional' },
            { id: 'mq-17', question: '17. Usam CRM? Qual? Há quanto tempo?', answer: '', isDefault: true, attachments: [], level: 'Profissional' },
            { id: 'mq-18', question: '18. Taxa de conversão atual (lead → cliente)', answer: '', isDefault: true, attachments: [], level: 'Profissional' },
            { id: 'mq-19', question: '19. Ciclo médio de vendas em dias', answer: '', isDefault: true, attachments: [], level: 'Profissional' },
            { id: 'mq-20', question: '20. CAC (Custo de Aquisição) calculado?', answer: '', isDefault: true, attachments: [], level: 'Profissional' },
            { id: 'mq-21', question: '21. LTV (Lifetime Value) conhecido?', answer: '', isDefault: true, attachments: [], level: 'Profissional' },
            { id: 'mq-22', question: '22. Principais KPIs acompanhados hoje', answer: '', isDefault: true, attachments: [], level: 'Profissional' },
            { id: 'mq-23', question: '23. Existe área de Customer Success?', answer: '', isDefault: true, attachments: [], level: 'Profissional' },
            { id: 'mq-24', question: '24. Taxa de churn mensal/anual', answer: '', isDefault: true, attachments: [], level: 'Profissional' },
            { id: 'mq-25', question: '25. NPS atual (se medido)', answer: '', isDefault: true, attachments: [], level: 'Profissional' },
            { id: 'mq-26', question: '26. Lista completa de ferramentas atuais', answer: '', isDefault: true, attachments: [], level: 'Profissional' },
            { id: 'mq-27', question: '27. Orçamento mensal para ferramentas', answer: '', isDefault: true, attachments: [], level: 'Profissional' },
            { id: 'mq-28', question: '28. Orçamento para contratações', answer: '', isDefault: true, attachments: [], level: 'Profissional' },
            { id: 'mq-29', question: '29. Disponibilidade da liderança (horas/semana)', answer: '', isDefault: true, attachments: [], level: 'Profissional' },
            { id: 'mq-30', question: '30. Documentos existentes (playbooks, políticas, etc)', answer: '', isDefault: true, attachments: [], level: 'Profissional' },
            
            // NÍVEL 3 - ELITE (Dados Profundos)
            { id: 'mq-31', question: '31. P&L dos últimos 12 meses (enviar planilha)', answer: '', isDefault: true, attachments: [], level: 'Elite' },
            { id: 'mq-32', question: '32. Dados de vendas mensais - 24 meses (Excel)', answer: '', isDefault: true, attachments: [], level: 'Elite' },
            { id: 'mq-33', question: '33. Funil completo com conversões por etapa', answer: '', isDefault: true, attachments: [], level: 'Elite' },
            { id: 'mq-34', question: '34. Pipeline atual detalhado (screenshot/export)', answer: '', isDefault: true, attachments: [], level: 'Elite' },
            { id: 'mq-35', question: '35. Histórico de win/loss reasons', answer: '', isDefault: true, attachments: [], level: 'Elite' },
            { id: 'mq-36', question: '36. Análise de cohort de clientes', answer: '', isDefault: true, attachments: [], level: 'Elite' },
            { id: 'mq-37', question: '37. Dados de produtividade por vendedor', answer: '', isDefault: true, attachments: [], level: 'Elite' },
            { id: 'mq-38', question: '38. Investimento em marketing por canal', answer: '', isDefault: true, attachments: [], level: 'Elite' },
            { id: 'mq-39', question: '39. ROI por canal de aquisição', answer: '', isDefault: true, attachments: [], level: 'Elite' },
            { id: 'mq-40', question: '40. Forecast accuracy histórico', answer: '', isDefault: true, attachments: [], level: 'Elite' }
        ]
    },
    background: {
        title: 'Semana 1: ICP & Estratégia (Q41-90)',
        questions: [
            // NÍVEL 1 - ESSENCIAL (Clientes & Mercado)
            { id: 'mq-41', question: '41. Lista dos 20 melhores clientes (nome, faturamento conosco, tempo de casa)', answer: '', isDefault: true, attachments: [], level: 'Essencial' },
            { id: 'mq-42', question: '42. Lista dos 10 piores clientes ou churns recentes', answer: '', isDefault: true, attachments: [], level: 'Essencial' },
            { id: 'mq-43', question: '43. Por que os melhores compraram? (principais motivos)', answer: '', isDefault: true, attachments: [], level: 'Essencial' },
            { id: 'mq-44', question: '44. Por que os piores cancelaram/não renovaram?', answer: '', isDefault: true, attachments: [], level: 'Essencial' },
            { id: 'mq-45', question: '45. Perfil ideal: porte, setor, localização', answer: '', isDefault: true, attachments: [], level: 'Essencial' },
            { id: 'mq-46', question: '46. Perfil a evitar (red flags)', answer: '', isDefault: true, attachments: [], level: 'Essencial' },
            { id: 'mq-47', question: '47. Top 5 concorrentes diretos', answer: '', isDefault: true, attachments: [], level: 'Essencial' },
            { id: 'mq-48', question: '48. Onde ganhamos dos concorrentes?', answer: '', isDefault: true, attachments: [], level: 'Essencial' },
            { id: 'mq-49', question: '49. Onde perdemos para concorrentes?', answer: '', isDefault: true, attachments: [], level: 'Essencial' },
            { id: 'mq-50', question: '50. Proposta de valor em 1 parágrafo', answer: '', isDefault: true, attachments: [], level: 'Essencial' },
            
            // NÍVEL 2 - PROFISSIONAL (Persona & Jornada)
            { id: 'mq-51', question: '51. Cargo do decisor típico', answer: '', isDefault: true, attachments: [], level: 'Profissional' },
            { id: 'mq-52', question: '52. Cargo do usuário típico', answer: '', isDefault: true, attachments: [], level: 'Profissional' },
            { id: 'mq-53', question: '53. Cargo do influenciador', answer: '', isDefault: true, attachments: [], level: 'Profissional' },
            { id: 'mq-54', question: '54. Idade média e formação', answer: '', isDefault: true, attachments: [], level: 'Profissional' },
            { id: 'mq-55', question: '55. Principais dores (ranquear 1-10)', answer: '', isDefault: true, attachments: [], level: 'Profissional' },
            { id: 'mq-56', question: '56. Principais objetivos (ranquear 1-10)', answer: '', isDefault: true, attachments: [], level: 'Profissional' },
            { id: 'mq-57', question: '57. Objeções mais comuns (top 10)', answer: '', isDefault: true, attachments: [], level: 'Profissional' },
            { id: 'mq-58', question: '58. Onde consomem conteúdo', answer: '', isDefault: true, attachments: [], level: 'Profissional' },
            { id: 'mq-59', question: '59. Eventos que participam', answer: '', isDefault: true, attachments: [], level: 'Profissional' },
            { id: 'mq-60', question: '60. Orçamento típico disponível', answer: '', isDefault: true, attachments: [], level: 'Profissional' },
            { id: 'mq-61', question: '61. Como descobrem vocês?', answer: '', isDefault: true, attachments: [], level: 'Profissional' },
            { id: 'mq-62', question: '62. Primeiras perguntas que fazem', answer: '', isDefault: true, attachments: [], level: 'Profissional' },
            { id: 'mq-63', question: '63. Informações que solicitam', answer: '', isDefault: true, attachments: [], level: 'Profissional' },
            { id: 'mq-64', question: '64. Comparações que fazem', answer: '', isDefault: true, attachments: [], level: 'Profissional' },
            { id: 'mq-65', question: '65. Critérios de decisão (ordem de importância)', answer: '', isDefault: true, attachments: [], level: 'Profissional' },
            { id: 'mq-66', question: '66. Quantas reuniões até fechar?', answer: '', isDefault: true, attachments: [], level: 'Profissional' },
            { id: 'mq-67', question: '67. Quantas pessoas envolvidas?', answer: '', isDefault: true, attachments: [], level: 'Profissional' },
            { id: 'mq-68', question: '68. Tempo médio de decisão', answer: '', isDefault: true, attachments: [], level: 'Profissional' },
            { id: 'mq-69', question: '69. Gatilhos de urgência', answer: '', isDefault: true, attachments: [], level: 'Profissional' },
            { id: 'mq-70', question: '70. Motivos de procrastinação', answer: '', isDefault: true, attachments: [], level: 'Profissional' },
            
            // NÍVEL 3 - ELITE (Inteligência Competitiva & Psicografia)
            { id: 'mq-71', question: '71. Matriz comparativa detalhada (funcionalidades)', answer: '', isDefault: true, attachments: [], level: 'Elite' },
            { id: 'mq-72', question: '72. Pricing dos concorrentes (se conhecido)', answer: '', isDefault: true, attachments: [], level: 'Elite' },
            { id: 'mq-73', question: '73. Pontos fortes de cada concorrente', answer: '', isDefault: true, attachments: [], level: 'Elite' },
            { id: 'mq-74', question: '74. Pontos fracos exploráveis', answer: '', isDefault: true, attachments: [], level: 'Elite' },
            { id: 'mq-75', question: '75. Win rate vs. cada concorrente', answer: '', isDefault: true, attachments: [], level: 'Elite' },
            { id: 'mq-76', question: '76. Positioning único nosso', answer: '', isDefault: true, attachments: [], level: 'Elite' },
            { id: 'mq-77', question: '77. Diferenciais não copiáveis', answer: '', isDefault: true, attachments: [], level: 'Elite' },
            { id: 'mq-78', question: '78. Features em desenvolvimento', answer: '', isDefault: true, attachments: [], level: 'Elite' },
            { id: 'mq-79', question: '79. Roadmap próximos 12 meses', answer: '', isDefault: true, attachments: [], level: 'Elite' },
            { id: 'mq-80', question: '80. Parcerias estratégicas atuais/futuras', answer: '', isDefault: true, attachments: [], level: 'Elite' },
            { id: 'mq-81', question: '81. Valores principais da persona (top 5)', answer: '', isDefault: true, attachments: [], level: 'Elite' },
            { id: 'mq-82', question: '82. Medos profissionais (top 5)', answer: '', isDefault: true, attachments: [], level: 'Elite' },
            { id: 'mq-83', question: '83. Aspirações de carreira', answer: '', isDefault: true, attachments: [], level: 'Elite' },
            { id: 'mq-84', question: '84. Estilo de tomada de decisão (analítico, emocional, etc)', answer: '', isDefault: true, attachments: [], level: 'Elite' },
            { id: 'mq-85', question: '85. Influenciadores que seguem', answer: '', isDefault: true, attachments: [], level: 'Elite' },
            { id: 'mq-86', question: '86. Comunidades que participam', answer: '', isDefault: true, attachments: [], level: 'Elite' },
            { id: 'mq-87', question: '87. Tipo de conteúdo preferido', answer: '', isDefault: true, attachments: [], level: 'Elite' },
            { id: 'mq-88', question: '88. Linguagem/jargões que usam', answer: '', isDefault: true, attachments: [], level: 'Elite' },
            { id: 'mq-89', question: '89. Preconceitos do mercado', answer: '', isDefault: true, attachments: [], level: 'Elite' },
            { id: 'mq-90', question: '90. Crenças limitantes comuns', answer: '', isDefault: true, attachments: [], level: 'Elite' },
        ]
    },
    contacts: {
        title: 'Semana 2: Estrutura & Pessoas (Q91-130)',
        questions: [
            // NÍVEL 1 - ESSENCIAL (Organograma)
            { id: 'mq-91', question: '91. Estrutura atual do comercial (organograma ou descritivo)', answer: '', isDefault: true, attachments: [], level: 'Essencial' },
            { id: 'mq-92', question: '92. Nome completo e cargo de cada pessoa', answer: '', isDefault: true, attachments: [], level: 'Essencial' },
            { id: 'mq-93', question: '93. Tempo de empresa de cada um', answer: '', isDefault: true, attachments: [], level: 'Essencial' },
            { id: 'mq-94', question: '94. Quem reporta para quem', answer: '', isDefault: true, attachments: [], level: 'Essencial' },
            { id: 'mq-95', question: '95. Principais responsabilidades de cada um (3-5 por pessoa)', answer: '', isDefault: true, attachments: [], level: 'Essencial' },
            { id: 'mq-96', question: '96. Gaps óbvios (o que ninguém faz)', answer: '', isDefault: true, attachments: [], level: 'Essencial' },
            { id: 'mq-97', question: '97. Sobreposições (mais de uma pessoa fazendo)', answer: '', isDefault: true, attachments: [], level: 'Essencial' },
            { id: 'mq-98', question: '98. Cargos em aberto', answer: '', isDefault: true, attachments: [], level: 'Essencial' },
            { id: 'mq-99', question: '99. Planos de contratação próximos 3 meses', answer: '', isDefault: true, attachments: [], level: 'Essencial' },
            { id: 'mq-100', question: '100. Orçamento para novas contratações', answer: '', isDefault: true, attachments: [], level: 'Essencial' },
            
            // NÍVEL 2 - PROFISSIONAL (Competências & Cultura)
            { id: 'mq-101', question: '101. Top 3 performers (nome e por quê)', answer: '', isDefault: true, attachments: [], level: 'Profissional' },
            { id: 'mq-102', question: '102. Bottom 3 performers (nome e gaps)', answer: '', isDefault: true, attachments: [], level: 'Profissional' },
            { id: 'mq-103', question: '103. Habilidades mais importantes para sucesso', answer: '', isDefault: true, attachments: [], level: 'Profissional' },
            { id: 'mq-104', question: '104. Habilidades mais deficientes no time', answer: '', isDefault: true, attachments: [], level: 'Profissional' },
            { id: 'mq-105', question: '105. Tempo médio até produtividade', answer: '', isDefault: true, attachments: [], level: 'Profissional' },
            { id: 'mq-106', question: '106. Turnover dos últimos 12 meses', answer: '', isDefault: true, attachments: [], level: 'Profissional' },
            { id: 'mq-107', question: '107. Principais motivos de saída', answer: '', isDefault: true, attachments: [], level: 'Profissional' },
            { id: 'mq-108', question: '108. Custo de replacement', answer: '', isDefault: true, attachments: [], level: 'Profissional' },
            { id: 'mq-109', question: '109. Programa de onboarding atual (duração, conteúdo)', answer: '', isDefault: true, attachments: [], level: 'Profissional' },
            { id: 'mq-110', question: '110. Treinamentos realizados último ano', answer: '', isDefault: true, attachments: [], level: 'Profissional' },
            { id: 'mq-111', question: '111. Frequência de 1:1s', answer: '', isDefault: true, attachments: [], level: 'Profissional' },
            { id: 'mq-112', question: '112. Frequência de reuniões de time', answer: '', isDefault: true, attachments: [], level: 'Profissional' },
            { id: 'mq-113', question: '113. Como é feito feedback', answer: '', isDefault: true, attachments: [], level: 'Profissional' },
            { id: 'mq-114', question: '114. Como são celebradas vitórias', answer: '', isDefault: true, attachments: [], level: 'Profissional' },
            { id: 'mq-115', question: '115. Como são tratados erros', answer: '', isDefault: true, attachments: [], level: 'Profissional' },
            { id: 'mq-116', question: '116. Rituais existentes', answer: '', isDefault: true, attachments: [], level: 'Profissional' },
            { id: 'mq-117', question: '117. Valores culturais do time', answer: '', isDefault: true, attachments: [], level: 'Profissional' },
            { id: 'mq-118', question: '118. Comportamentos incentivados', answer: '', isDefault: true, attachments: [], level: 'Profissional' },
            { id: 'mq-119', question: '119. Comportamentos inaceitáveis', answer: '', isDefault: true, attachments: [], level: 'Profissional' },
            { id: 'mq-120', question: '120. Nível de colaboração (1-10)', answer: '', isDefault: true, attachments: [], level: 'Profissional' },
            
            // NÍVEL 3 - ELITE (Assessment Profundo)
            { id: 'mq-121', question: '121. Avaliação de competências por pessoa (matriz)', answer: '', isDefault: true, attachments: [], level: 'Elite' },
            { id: 'mq-122', question: '122. Aspirações de carreira individuais', answer: '', isDefault: true, attachments: [], level: 'Elite' },
            { id: 'mq-123', question: '123. PDI existente por pessoa', answer: '', isDefault: true, attachments: [], level: 'Elite' },
            { id: 'mq-124', question: '124. Feedback 360 (se disponível)', answer: '', isDefault: true, attachments: [], level: 'Elite' },
            { id: 'mq-125', question: '125. Testes comportamentais (DISC, etc)', answer: '', isDefault: true, attachments: [], level: 'Elite' },
            { id: 'mq-126', question: '126. Mapeamento de potencial (9-box)', answer: '', isDefault: true, attachments: [], level: 'Elite' },
            { id: 'mq-127', question: '127. Riscos de perda (flight risk)', answer: '', isDefault: true, attachments: [], level: 'Elite' },
            { id: 'mq-128', question: '128. Sucessão planejada', answer: '', isDefault: true, attachments: [], level: 'Elite' },
            { id: 'mq-129', question: '129. Gaps de liderança', answer: '', isDefault: true, attachments: [], level: 'Elite' },
            { id: 'mq-130', question: '130. Benchmark de salários vs. mercado', answer: '', isDefault: true, attachments: [], level: 'Elite' }
        ]
    },
    funnel: {
        title: 'Semana 3: Processos & Automação (Q131-140, 151-160, 171-180)',
        questions: [
            // NÍVEL 1 - ESSENCIAL (Funil)
            { id: 'mq-131', question: '131. Etapas atuais do funil (nomes exatos)', answer: '', isDefault: true, attachments: [], level: 'Essencial' },
            { id: 'mq-132', question: '132. Conversão % em cada etapa', answer: '', isDefault: true, attachments: [], level: 'Essencial' },
            { id: 'mq-133', question: '133. Tempo médio em cada etapa', answer: '', isDefault: true, attachments: [], level: 'Essencial' },
            { id: 'mq-134', question: '134. Volume em cada etapa hoje', answer: '', isDefault: true, attachments: [], level: 'Essencial' },
            { id: 'mq-135', question: '135. Critérios para avançar de etapa', answer: '', isDefault: true, attachments: [], level: 'Essencial' },
            { id: 'mq-136', question: '136. Quem é responsável por cada etapa', answer: '', isDefault: true, attachments: [], level: 'Essencial' },
            { id: 'mq-137', question: '137. Materiais usados em cada etapa', answer: '', isDefault: true, attachments: [], level: 'Essencial' },
            { id: 'mq-138', question: '138. Principais gargalos', answer: '', isDefault: true, attachments: [], level: 'Essencial' },
            { id: 'mq-139', question: '139. Onde mais perdem negócios', answer: '', isDefault: true, attachments: [], level: 'Essencial' },
            { id: 'mq-140', question: '140. SLA de resposta ao cliente', answer: '', isDefault: true, attachments: [], level: 'Essencial' },
            
            // NÍVEL 2 - PROFISSIONAL (Processos Detalhados)
            { id: 'mq-151', question: '151. Processo de qualificação (BANT, MEDDIC, etc?)', answer: '', isDefault: true, attachments: [], level: 'Profissional' },
            { id: 'mq-152', question: '152. Script de prospecção atual', answer: '', isDefault: true, attachments: [], level: 'Profissional' },
            { id: 'mq-153', question: '153. Script de discovery', answer: '', isDefault: true, attachments: [], level: 'Profissional' },
            { id: 'mq-154', question: '154. Processo de demo/apresentação', answer: '', isDefault: true, attachments: [], level: 'Profissional' },
            { id: 'mq-155', question: '155. Processo de proposta', answer: '', isDefault: true, attachments: [], level: 'Profissional' },
            { id: 'mq-156', question: '156. Processo de negociação', answer: '', isDefault: true, attachments: [], level: 'Profissional' },
            { id: 'mq-157', question: '157. Processo de fechamento', answer: '', isDefault: true, attachments: [], level: 'Profissional' },
            { id: 'mq-158', question: '158. Handoff para Customer Success', answer: '', isDefault: true, attachments: [], level: 'Profissional' },
            { id: 'mq-159', question: '159. Processo de renovação', answer: '', isDefault: true, attachments: [], level: 'Profissional' },
            { id: 'mq-160', question: '160. Processo de upsell', answer: '', isDefault: true, attachments: [], level: 'Profissional' },
            
            // NÍVEL 3 - ELITE (Automação & Workflows)
            { id: 'mq-171', question: '171. Lista de processos manuais hoje', answer: '', isDefault: true, attachments: [], level: 'Elite' },
            { id: 'mq-172', question: '172. Processos que querem automatizar', answer: '', isDefault: true, attachments: [], level: 'Elite' },
            { id: 'mq-173', question: '173. Triggers desejados', answer: '', isDefault: true, attachments: [], level: 'Elite' },
            { id: 'mq-174', question: '174. Notificações necessárias', answer: '', isDefault: true, attachments: [], level: 'Elite' },
            { id: 'mq-175', question: '175. Workflows aprovados', answer: '', isDefault: true, attachments: [], level: 'Elite' },
            { id: 'mq-176', question: '176. Sequências de follow-up', answer: '', isDefault: true, attachments: [], level: 'Elite' },
            { id: 'mq-177', question: '177. Lead scoring atual', answer: '', isDefault: true, attachments: [], level: 'Elite' },
            { id: 'mq-178', question: '178. Lead routing rules', answer: '', isDefault: true, attachments: [], level: 'Elite' },
            { id: 'mq-179', question: '179. Campos customizados necessários', answer: '', isDefault: true, attachments: [], level: 'Elite' },
            { id: 'mq-180', question: '180. Relatórios customizados desejados', answer: '', isDefault: true, attachments: [], level: 'Elite' }
        ]
    },
    metrics: {
        title: 'Semana 3: CRM, Dados & Métricas (Q141-150, 161-170, 181-190)',
        questions: [
            // NÍVEL 1 - ESSENCIAL (CRM & Ferramentas)
            { id: 'mq-141', question: '141. CRM atual (nome, versão, plano)', answer: '', isDefault: true, attachments: [], level: 'Essencial' },
            { id: 'mq-142', question: '142. Nível de adoção (% uso real)', answer: '', isDefault: true, attachments: [], level: 'Essencial' },
            { id: 'mq-143', question: '143. Principais problemas do CRM', answer: '', isDefault: true, attachments: [], level: 'Essencial' },
            { id: 'mq-144', question: '144. Integrações funcionando', answer: '', isDefault: true, attachments: [], level: 'Essencial' },
            { id: 'mq-145', question: '145. Outras ferramentas de vendas', answer: '', isDefault: true, attachments: [], level: 'Essencial' },
            { id: 'mq-146', question: '146. Ferramentas de comunicação', answer: '', isDefault: true, attachments: [], level: 'Essencial' },
            { id: 'mq-147', question: '147. Como registram atividades', answer: '', isDefault: true, attachments: [], level: 'Essencial' },
            { id: 'mq-148', question: '148. Relatórios mais importantes', answer: '', isDefault: true, attachments: [], level: 'Essencial' },
            { id: 'mq-149', question: '149. Quem administra o CRM', answer: '', isDefault: true, attachments: [], level: 'Essencial' },
            { id: 'mq-150', question: '150. Orçamento para ferramentas', answer: '', isDefault: true, attachments: [], level: 'Essencial' },
            
            // NÍVEL 2 - PROFISSIONAL (Métricas & KPIs)
            { id: 'mq-161', question: '161. Dashboard atual (print)', answer: '', isDefault: true, attachments: [], level: 'Profissional' },
            { id: 'mq-162', question: '162. KPIs por cargo', answer: '', isDefault: true, attachments: [], level: 'Profissional' },
            { id: 'mq-163', question: '163. Metas individuais', answer: '', isDefault: true, attachments: [], level: 'Profissional' },
            { id: 'mq-164', question: '164. Como calculam comissão', answer: '', isDefault: true, attachments: [], level: 'Profissional' },
            { id: 'mq-165', question: '165. Forecast process', answer: '', isDefault: true, attachments: [], level: 'Profissional' },
            { id: 'mq-166', question: '166. Accuracy do forecast', answer: '', isDefault: true, attachments: [], level: 'Profissional' },
            { id: 'mq-167', question: '167. Pipeline coverage ratio', answer: '', isDefault: true, attachments: [], level: 'Profissional' },
            { id: 'mq-168', question: '168. Velocidade de vendas', answer: '', isDefault: true, attachments: [], level: 'Profissional' },
            { id: 'mq-169', question: '169. Win rate por fonte', answer: '', isDefault: true, attachments: [], level: 'Profissional' },
            { id: 'mq-170', question: '170. Deal size médio por fonte', answer: '', isDefault: true, attachments: [], level: 'Profissional' },
            
            // NÍVEL 3 - ELITE (Dados & Analytics)
            { id: 'mq-181', question: '181. Qualidade dos dados (auditoria)', answer: '', isDefault: true, attachments: [], level: 'Elite' },
            { id: 'mq-182', question: '182. Dados faltantes críticos', answer: '', isDefault: true, attachments: [], level: 'Elite' },
            { id: 'mq-183', question: '183. Fontes de dados (todas)', answer: '', isDefault: true, attachments: [], level: 'Elite' },
            { id: 'mq-184', question: '184. Data warehouse/lake?', answer: '', isDefault: true, attachments: [], level: 'Elite' },
            { id: 'mq-185', question: '185. BI tools em uso', answer: '', isDefault: true, attachments: [], level: 'Elite' },
            { id: 'mq-186', question: '186. Dashboards existentes', answer: '', isDefault: true, attachments: [], level: 'Elite' },
            { id: 'mq-187', question: '187. Análises preditivas?', answer: '', isDefault: true, attachments: [], level: 'Elite' },
            { id: 'mq-188', question: '188. Machine learning em uso?', answer: '', isDefault: true, attachments: [], level: 'Elite' },
            { id: 'mq-189', question: '189. APIs disponíveis', answer: '', isDefault: true, attachments: [], level: 'Elite' },
            { id: 'mq-190', question: '190. Documentação técnica', answer: '', isDefault: true, attachments: [], level: 'Elite' }
        ]
    },
    materials: {
        title: 'Semana 4: Playbooks & Enablement (Q191-240)',
        questions: [
            // NÍVEL 1 - ESSENCIAL (Materiais de Vendas & Scripts)
            { id: 'mq-191', question: '191. Apresentação comercial atual (PDF/PPT)', answer: '', isDefault: true, attachments: [], level: 'Essencial' },
            { id: 'mq-192', question: '192. Cases de sucesso documentados', answer: '', isDefault: true, attachments: [], level: 'Essencial' },
            { id: 'mq-193', question: '193. Proposta padrão', answer: '', isDefault: true, attachments: [], level: 'Essencial' },
            { id: 'mq-194', question: '194. Contrato padrão', answer: '', isDefault: true, attachments: [], level: 'Essencial' },
            { id: 'mq-195', question: '195. Tabela de preços', answer: '', isDefault: true, attachments: [], level: 'Essencial' },
            { id: 'mq-196', question: '196. Política de descontos', answer: '', isDefault: true, attachments: [], level: 'Essencial' },
            { id: 'mq-197', question: '197. FAQ para vendedores', answer: '', isDefault: true, attachments: [], level: 'Essencial' },
            { id: 'mq-198', question: '198. Battle cards (se existem)', answer: '', isDefault: true, attachments: [], level: 'Essencial' },
            { id: 'mq-199', question: '199. Materiais para cada etapa', answer: '', isDefault: true, attachments: [], level: 'Essencial' },
            { id: 'mq-200', question: '200. Quem cria conteúdo de vendas', answer: '', isDefault: true, attachments: [], level: 'Essencial' },
            { id: 'mq-201', question: '201. Enviar 20 conversas de WhatsApp bem-sucedidas', answer: '', isDefault: true, attachments: [], level: 'Essencial' },
            { id: 'mq-202', question: '202. Enviar 20 conversas que não converteram', answer: '', isDefault: true, attachments: [], level: 'Essencial' },
            { id: 'mq-203', question: '203. Templates de email atuais (todos)', answer: '', isDefault: true, attachments: [], level: 'Essencial' },
            { id: 'mq-204', question: '204. Scripts de ligação (se existem)', answer: '', isDefault: true, attachments: [], level: 'Essencial' },
            { id: 'mq-205', question: '205. Mensagens LinkedIn', answer: '', isDefault: true, attachments: [], level: 'Essencial' },
            { id: 'mq-206', question: '206. Roteiro de discovery', answer: '', isDefault: true, attachments: [], level: 'Essencial' },
            { id: 'mq-207', question: '207. Roteiro de demo', answer: '', isDefault: true, attachments: [], level: 'Essencial' },
            { id: 'mq-208', question: '208. Respostas para objeções top 10', answer: '', isDefault: true, attachments: [], level: 'Essencial' },
            { id: 'mq-209', question: '209. Técnicas de fechamento usadas', answer: '', isDefault: true, attachments: [], level: 'Essencial' },
            { id: 'mq-210', question: '210. Follow-up sequences', answer: '', isDefault: true, attachments: [], level: 'Essencial' },
            
            // NÍVEL 2 - PROFISSIONAL (Metodologia & CS)
            { id: 'mq-211', question: '211. Metodologia de vendas atual', answer: '', isDefault: true, attachments: [], level: 'Profissional' },
            { id: 'mq-212', question: '212. Como treinam novos vendedores', answer: '', isDefault: true, attachments: [], level: 'Profissional' },
            { id: 'mq-213', question: '213. Materiais de treinamento', answer: '', isDefault: true, attachments: [], level: 'Profissional' },
            { id: 'mq-214', question: '214. Frequência de reciclagem', answer: '', isDefault: true, attachments: [], level: 'Profissional' },
            { id: 'mq-215', question: '215. Role-plays realizados', answer: '', isDefault: true, attachments: [], level: 'Profissional' },
            { id: 'mq-216', question: '216. Certificações requeridas', answer: '', isDefault: true, attachments: [], level: 'Profissional' },
            { id: 'mq-217', question: '217. Shadowing process', answer: '', isDefault: true, attachments: [], level: 'Profissional' },
            { id: 'mq-218', question: '218. Mentoria estruturada?', answer: '', isDefault: true, attachments: [], level: 'Profissional' },
            { id: 'mq-219', question: '219. Documentação do processo', answer: '', isDefault: true, attachments: [], level: 'Profissional' },
            { id: 'mq-220', question: '220. Wiki/knowledge base interna', answer: '', isDefault: true, attachments: [], level: 'Profissional' },
            { id: 'mq-221', question: '221. Processo de onboarding cliente', answer: '', isDefault: true, attachments: [], level: 'Profissional' },
            { id: 'mq-222', question: '222. Tempo até first value', answer: '', isDefault: true, attachments: [], level: 'Profissional' },
            { id: 'mq-223', question: '223. Success metrics', answer: '', isDefault: true, attachments: [], level: 'Profissional' },
            { id: 'mq-224', question: '224. Health score usado', answer: '', isDefault: true, attachments: [], level: 'Profissional' },
            { id: 'mq-225', question: '225. Processo de QBR', answer: '', isDefault: true, attachments: [], level: 'Profissional' },
            { id: 'mq-226', question: '226. Triggers de churn', answer: '', isDefault: true, attachments: [], level: 'Profissional' },
            { id: 'mq-227', question: '227. Processo de save', answer: '', isDefault: true, attachments: [], level: 'Profissional' },
            { id: 'mq-228', question: '228. NPS e como melhorar', answer: '', isDefault: true, attachments: [], level: 'Profissional' },
            { id: 'mq-229', question: '229. Upsell process', answer: '', isDefault: true, attachments: [], level: 'Profissional' },
            { id: 'mq-230', question: '230. Referral program', answer: '', isDefault: true, attachments: [], level: 'Profissional' },
            
            // NÍVEL 3 - ELITE (Advanced Enablement)
            { id: 'mq-231', question: '231. Gravações de calls (enviar 20)', answer: '', isDefault: true, attachments: [], level: 'Elite' },
            { id: 'mq-232', question: '232. Win/loss interviews (últimos 30)', answer: '', isDefault: true, attachments: [], level: 'Elite' },
            { id: 'mq-233', question: '233. Competitive positioning docs', answer: '', isDefault: true, attachments: [], level: 'Elite' },
            { id: 'mq-234', question: '234. ROI calculators', answer: '', isDefault: true, attachments: [], level: 'Elite' },
            { id: 'mq-235', question: '235. Business case templates', answer: '', isDefault: true, attachments: [], level: 'Elite' },
            { id: 'mq-236', question: '236. Value engineering process', answer: '', isDefault: true, attachments: [], level: 'Elite' },
            { id: 'mq-237', question: '237. Proof of concept process', answer: '', isDefault: true, attachments: [], level: 'Elite' },
            { id: 'mq-238', question: '238. Reference customer program', answer: '', isDefault: true, attachments: [], level: 'Elite' },
            { id: 'mq-239', question: '239. Partner enablement', answer: '', isDefault: true, attachments: [], level: 'Elite' },
            { id: 'mq-240', question: '240. Ecosystem plays', answer: '', isDefault: true, attachments: [], level: 'Elite' }
        ]
    },
    goals: {
        title: 'Semana 5-12: Gestão & Estratégia (Q241-300)',
        questions: [
            // NÍVEL 1 - ESSENCIAL (Liderança & Remuneração)
            { id: 'mq-241', question: '241. Rotina atual dos gestores', answer: '', isDefault: true, attachments: [], level: 'Essencial' },
            { id: 'mq-242', question: '242. Reuniões recorrentes (agenda)', answer: '', isDefault: true, attachments: [], level: 'Essencial' },
            { id: 'mq-243', question: '243. Como acompanham o time', answer: '', isDefault: true, attachments: [], level: 'Essencial' },
            { id: 'mq-244', question: '244. Como dão feedback', answer: '', isDefault: true, attachments: [], level: 'Essencial' },
            { id: 'mq-245', question: '245. Como desenvolvem pessoas', answer: '', isDefault: true, attachments: [], level: 'Essencial' },
            { id: 'mq-246', question: '246. Principais desafios de gestão', answer: '', isDefault: true, attachments: [], level: 'Essencial' },
            { id: 'mq-247', question: '247. Ferramentas de gestão usadas', answer: '', isDefault: true, attachments: [], level: 'Essencial' },
            { id: 'mq-248', question: '248. Relatórios gerenciais', answer: '', isDefault: true, attachments: [], level: 'Essencial' },
            { id: 'mq-249', question: '249. Comunicação com diretoria', answer: '', isDefault: true, attachments: [], level: 'Essencial' },
            { id: 'mq-250', question: '250. OKRs/metas do time', answer: '', isDefault: true, attachments: [], level: 'Essencial' },
            { id: 'mq-251', question: '251. Estrutura salarial atual (ranges)', answer: '', isDefault: true, attachments: [], level: 'Essencial' },
            { id: 'mq-252', question: '252. Modelo de comissão atual', answer: '', isDefault: true, attachments: [], level: 'Essencial' },
            { id: 'mq-253', question: '253. Aceleradores/desaceleradores', answer: '', isDefault: true, attachments: [], level: 'Essencial' },
            { id: 'mq-254', question: '254. SPIFFs ou incentivos especiais', answer: '', isDefault: true, attachments: [], level: 'Essencial' },
            { id: 'mq-255', question: '255. Benefícios oferecidos', answer: '', isDefault: true, attachments: [], level: 'Essencial' },
            { id: 'mq-256', question: '256. Budget para aumentos', answer: '', isDefault: true, attachments: [], level: 'Essencial' },
            { id: 'mq-257', question: '257. Últimos reajustes quando', answer: '', isDefault: true, attachments: [], level: 'Essencial' },
            { id: 'mq-258', question: '258. Turnover por salário?', answer: '', isDefault: true, attachments: [], level: 'Essencial' },
            { id: 'mq-259', question: '259. Benchmark mercado conhecido?', answer: '', isDefault: true, attachments: [], level: 'Essencial' },
            { id: 'mq-260', question: '260. Satisfação com modelo atual', answer: '', isDefault: true, attachments: [], level: 'Essencial' },
            
            // NÍVEL 2 - PROFISSIONAL (Forecast, Planning & Desenvolvimento)
            { id: 'mq-261', question: '261. Como fazem forecast hoje', answer: '', isDefault: true, attachments: [], level: 'Profissional' },
            { id: 'mq-262', question: '262. Accuracy histórico', answer: '', isDefault: true, attachments: [], level: 'Profissional' },
            { id: 'mq-263', question: '263. Método usado (bottom-up, top-down)', answer: '', isDefault: true, attachments: [], level: 'Profissional' },
            { id: 'mq-264', question: '264. Frequência de revisão', answer: '', isDefault: true, attachments: [], level: 'Profissional' },
            { id: 'mq-265', question: '265. Ferramentas de forecast', answer: '', isDefault: true, attachments: [], level: 'Profissional' },
            { id: 'mq-266', question: '266. Cenários considerados', answer: '', isDefault: true, attachments: [], level: 'Profissional' },
            { id: 'mq-267', question: '267. Sazonalidade mappada', answer: '', isDefault: true, attachments: [], level: 'Profissional' },
            { id: 'mq-268', question: '268. Territory planning', answer: '', isDefault: true, attachments: [], level: 'Profissional' },
            { id: 'mq-269', question: '269. Quota setting process', answer: '', isDefault: true, attachments: [], level: 'Profissional' },
            { id: 'mq-270', question: '270. Account planning', answer: '', isDefault: true, attachments: [], level: 'Profissional' },
            { id: 'mq-271', question: '271. Plano de carreira existente', answer: '', isDefault: true, attachments: [], level: 'Profissional' },
            { id: 'mq-272', question: '272. Critérios de promoção', answer: '', isDefault: true, attachments: [], level: 'Profissional' },
            { id: 'mq-273', question: '273. Timeline típico de progressão', answer: '', isDefault: true, attachments: [], level: 'Profissional' },
            { id: 'mq-274', question: '274. PDI estruturado?', answer: '', isDefault: true, attachments: [], level: 'Profissional' },
            { id: 'mq-275', question: '275. Budget para desenvolvimento', answer: '', isDefault: true, attachments: [], level: 'Profissional' },
            { id: 'mq-276', question: '276. Treinamentos disponíveis', answer: '', isDefault: true, attachments: [], level: 'Profissional' },
            { id: 'mq-277', question: '277. Mentoria/coaching', answer: '', isDefault: true, attachments: [], level: 'Profissional' },
            { id: 'mq-278', question: '278. Certificações pagas', answer: '', isDefault: true, attachments: [], level: 'Profissional' },
            { id: 'mq-279', question: '279. Conferências/eventos', answer: '', isDefault: true, attachments: [], level: 'Profissional' },
            { id: 'mq-280', question: '280. Sucessão planejada', answer: '', isDefault: true, attachments: [], level: 'Profissional' },
            
            // NÍVEL 3 - ELITE (Estratégia Avançada & Transf. Digital)
            { id: 'mq-281', question: '281. Visão 3 anos', answer: '', isDefault: true, attachments: [], level: 'Elite' },
            { id: 'mq-282', question: '282. Plano de crescimento', answer: '', isDefault: true, attachments: [], level: 'Elite' },
            { id: 'mq-283', question: '283. Novos mercados/produtos', answer: '', isDefault: true, attachments: [], level: 'Elite' },
            { id: 'mq-284', question: '284. M&A considerations', answer: '', isDefault: true, attachments: [], level: 'Elite' },
            { id: 'mq-285', question: '285. Investimento necessário', answer: '', isDefault: true, attachments: [], level: 'Elite' },
            { id: 'mq-286', question: '286. Riscos mapeados', answer: '', isDefault: true, attachments: [], level: 'Elite' },
            { id: 'mq-287', question: '287. Cenários de contingência', answer: '', isDefault: true, attachments: [], level: 'Elite' },
            { id: 'mq-288', question: '288. Dependências críticas', answer: '', isDefault: true, attachments: [], level: 'Elite' },
            { id: 'mq-289', question: '289. Partnerships estratégicas', answer: '', isDefault: true, attachments: [], level: 'Elite' },
            { id: 'mq-290', question: '290. Exit strategy (se aplicável)', answer: '', isDefault: true, attachments: [], level: 'Elite' },
            { id: 'mq-291', question: '291. Maturidade digital atual (1-10)', answer: '', isDefault: true, attachments: [], level: 'Elite' },
            { id: 'mq-292', question: '292. Roadmap tecnológico', answer: '', isDefault: true, attachments: [], level: 'Elite' },
            { id: 'mq-293', question: '293. AI/ML initiatives', answer: '', isDefault: true, attachments: [], level: 'Elite' },
            { id: 'mq-294', question: '294. Automação planejada', answer: '', isDefault: true, attachments: [], level: 'Elite' },
            { id: 'mq-295', question: '295. Digital selling capabilities', answer: '', isDefault: true, attachments: [], level: 'Elite' },
            { id: 'mq-296', question: '296. E-commerce/self-service', answer: '', isDefault: true, attachments: [], level: 'Elite' },
            { id: 'mq-297', question: '297. Marketplace strategy', answer: '', isDefault: true, attachments: [], level: 'Elite' },
            { id: 'mq-298', question: '298. API economy participation', answer: '', isDefault: true, attachments: [], level: 'Elite' },
            { id: 'mq-299', question: '299. Data monetization', answer: '', isDefault: true, attachments: [], level: 'Elite' },
            { id: 'mq-300', question: '300. Innovation pipeline', answer: '', isDefault: true, attachments: [], level: 'Elite' }
        ]
    },
    competitors: {
        title: 'Elite: Perguntas Especiais (Q301-350)',
        questions: [
             // NÍVEL 3 - ELITE (Todas são Elite)
            { id: 'mq-301', question: '301. Dados de navegação do site (Analytics)', answer: '', isDefault: true, attachments: [], level: 'Elite' },
            { id: 'mq-302', question: '302. Heatmaps de comportamento', answer: '', isDefault: true, attachments: [], level: 'Elite' },
            { id: 'mq-303', question: '303. Gravações de sessões', answer: '', isDefault: true, attachments: [], level: 'Elite' },
            { id: 'mq-304', question: '304. A/B tests realizados', answer: '', isDefault: true, attachments: [], level: 'Elite' },
            { id: 'mq-305', question: '305. Conversion rate optimization', answer: '', isDefault: true, attachments: [], level: 'Elite' },
            { id: 'mq-306', question: '306. SEO/SEM data', answer: '', isDefault: true, attachments: [], level: 'Elite' },
            { id: 'mq-307', question: '307. Social listening insights', answer: '', isDefault: true, attachments: [], level: 'Elite' },
            { id: 'mq-308', question: '308. Review sites monitoring', answer: '', isDefault: true, attachments: [], level: 'Elite' },
            { id: 'mq-309', question: '309. Brand sentiment analysis', answer: '', isDefault: true, attachments: [], level: 'Elite' },
            { id: 'mq-310', question: '310. Competitive intelligence sources', answer: '', isDefault: true, attachments: [], level: 'Elite' },
            { id: 'mq-311', question: '311. Margem por produto/serviço', answer: '', isDefault: true, attachments: [], level: 'Elite' },
            { id: 'mq-312', question: '312. Curva ABC de clientes', answer: '', isDefault: true, attachments: [], level: 'Elite' },
            { id: 'mq-313', question: '313. Concentration risk', answer: '', isDefault: true, attachments: [], level: 'Elite' },
            { id: 'mq-314', question: '314. Cohort analysis completo', answer: '', isDefault: true, attachments: [], level: 'Elite' },
            { id: 'mq-315', question: '315. Unit economics detalhado', answer: '', isDefault: true, attachments: [], level: 'Elite' },
            { id: 'mq-316', question: '316. Burn rate e runway', answer: '', isDefault: true, attachments: [], level: 'Elite' },
            { id: 'mq-317', question: '317. Working capital needs', answer: '', isDefault: true, attachments: [], level: 'Elite' },
            { id: 'mq-318', question: '318. Investment thesis', answer: '', isDefault: true, attachments: [], level: 'Elite' },
            { id: 'mq-319', question: '319. Board reporting pack', answer: '', isDefault: true, attachments: [], level: 'Elite' },
            { id: 'mq-320', question: '320. Investor expectations', answer: '', isDefault: true, attachments: [], level: 'Elite' },
            { id: 'mq-321', question: '321. Matriz de influência/interesse', answer: '', isDefault: true, attachments: [], level: 'Elite' },
            { id: 'mq-322', question: '322. Hidden influencers', answer: '', isDefault: true, attachments: [], level: 'Elite' },
            { id: 'mq-323', question: '323. Detractors identificados', answer: '', isDefault: true, attachments: [], level: 'Elite' },
            { id: 'mq-324', question: '324. Political considerations', answer: '', isDefault: true, attachments: [], level: 'Elite' },
            { id: 'mq-325', question: '325. Change agents internos', answer: '', isDefault: true, attachments: [], level: 'Elite' },
            { id: 'mq-326', question: '326. Resistência esperada onde', answer: '', isDefault: true, attachments: [], level: 'Elite' },
            { id: 'mq-327', question: '327. Quick wins políticos', answer: '', isDefault: true, attachments: [], level: 'Elite' },
            { id: 'mq-328', question: '328. Tabus organizacionais', answer: '', isDefault: true, attachments: [], level: 'Elite' },
            { id: 'mq-329', question: '329. Sacred cows (intocáveis)', answer: '', isDefault: true, attachments: [], level: 'Elite' },
            { id: 'mq-330', question: '330. Power dynamics', answer: '', isDefault: true, attachments: [], level: 'Elite' },
            { id: 'mq-331', question: '331. Regulamentações aplicáveis', answer: '', isDefault: true, attachments: [], level: 'Elite' },
            { id: 'mq-332', question: '332. Certificações necessárias', answer: '', isDefault: true, attachments: [], level: 'Elite' },
            { id: 'mq-333', question: '333. Auditorias recentes', answer: '', isDefault: true, attachments: [], level: 'Elite' },
            { id: 'mq-334', question: '334. Findings de auditoria', answer: '', isDefault: true, attachments: [], level: 'Elite' },
            { id: 'mq-335', question: '335. Políticas limitantes', answer: '', isDefault: true, attachments: [], level: 'Elite' },
            { id: 'mq-336', question: '336. Contratos problemáticos', answer: '', isDefault: true, attachments: [], level: 'Elite' },
            { id: 'mq-337', question: '337. Acordos trabalhistas', answer: '', isDefault: true, attachments: [], level: 'Elite' },
            { id: 'mq-338', question: '338. LGPD/GDPR compliance', answer: '', isDefault: true, attachments: [], level: 'Elite' },
            { id: 'mq-339', question: '339. Segurança da informação', answer: '', isDefault: true, attachments: [], level: 'Elite' },
            { id: 'mq-340', question: '340. Business continuity plan', answer: '', isDefault: true, attachments: [], level: 'Elite' },
            { id: 'mq-341', question: '341. Parceiros atuais', answer: '', isDefault: true, attachments: [], level: 'Elite' },
            { id: 'mq-342', question: '342. Canal indireto %', answer: '', isDefault: true, attachments: [], level: 'Elite' },
            { id: 'mq-343', question: '343. Partner program', answer: '', isDefault: true, attachments: [], level: 'Elite' },
            { id: 'mq-344', question: '344. Co-selling motions', answer: '', isDefault: true, attachments: [], level: 'Elite' },
            { id: 'mq-345', question: '345. Marketplace presence', answer: '', isDefault: true, attachments: [], level: 'Elite' },
            { id: 'mq-346', question: '346. Integration partners', answer: '', isDefault: true, attachments: [], level: 'Elite' },
            { id: 'mq-347', question: '347. Technology alliances', answer: '', isDefault: true, attachments: [], level: 'Elite' },
            { id: 'mq-348', question: '348. Referral sources', answer: '', isDefault: true, attachments: [], level: 'Elite' },
            { id: 'mq-349', question: '349. Influencer relationships', answer: '', isDefault: true, attachments: [], level: 'Elite' },
            { id: 'mq-350', question: '350. Community building', answer: '', isDefault: true, attachments: [], level: 'Elite' }
        ]
    }
};

export const CONSULTING_JOURNEY_TEMPLATE: Journey = {
    id: 'template-consulting-12-weeks',
    name: 'Planejamento 12 Semanas – Marcos de Progresso',
    color: '#4f46e5',
    progress: 0,
    objectives: [
        // Obj 1: Pré-Projeto
        {
            id: 'obj-0',
            name: 'Pré-Projeto (Diagnóstico)',
            progress: 0,
            keyResults: [
                {
                    id: 'kr-0',
                    name: 'Semana 0 — Diagnóstico Inicial',
                    progress: 0,
                    initiatives: [
                        {
                            id: 'init-0',
                            name: 'Coleta de Base',
                            progress: 0,
                            actions: [
                                { id: 'act-0-1', name: 'Matriz de Maturidade preenchida (score inicial registrado)', isCompleted: false },
                                { id: 'act-0-2', name: '3 principais dores comerciais identificadas', isCompleted: false },
                                { id: 'act-0-3', name: 'Meta de faturamento para 90 dias definida', isCompleted: false }
                            ]
                        }
                    ]
                }
            ]
        },
        // Obj 2: Fase 1
        {
            id: 'obj-1',
            name: 'Fase 1 — Estruturação',
            progress: 0,
            keyResults: [
               // Week 1
               {
                   id: 'kr-1',
                   name: 'Semana 1 — Estratégia',
                   progress: 0,
                   initiatives: [{
                       id: 'init-1',
                       name: 'ICP e Posicionamento',
                       progress: 0,
                       actions: [
                           { id: 'act-1-1', name: 'ICP documentado (1 página com critérios objetivos)', isCompleted: false },
                           { id: 'act-1-2', name: 'Proposta de valor única definida (1 parágrafo)', isCompleted: false },
                           { id: 'act-1-3', name: 'Top 3 concorrentes mapeados (tabela comparativa)', isCompleted: false }
                       ]
                   }]
               },
               // Week 2
               {
                   id: 'kr-2',
                   name: 'Semana 2 — Estrutura',
                   progress: 0,
                   initiatives: [{
                       id: 'init-2',
                       name: 'Organização de Equipe',
                       progress: 0,
                       actions: [
                           { id: 'act-2-1', name: 'Organograma comercial aprovado (cargos e responsabilidades)', isCompleted: false },
                           { id: 'act-2-2', name: 'Gaps de equipe identificados (lista de contratações necessárias)', isCompleted: false },
                           { id: 'act-2-3', name: 'Matriz RACI de vendas criada (quem faz o quê)', isCompleted: false }
                       ]
                   }]
               },
               // Week 3
               {
                   id: 'kr-3',
                   name: 'Semana 3 — Dados',
                   progress: 0,
                   initiatives: [{
                       id: 'init-3',
                       name: 'Métricas e Conversões',
                       progress: 0,
                       actions: [
                           { id: 'act-3-1', name: 'Funil desenhado com conversões (% por etapa)', isCompleted: false },
                           { id: 'act-3-2', name: 'CAC e LTV calculados', isCompleted: false },
                           { id: 'act-3-3', name: 'Meta trimestral desdobrada (por mês/semana/pessoa)', isCompleted: false }
                           ]
                   }]
               },
               // Week 4
               {
                   id: 'kr-4',
                   name: 'Semana 4 — Processo',
                   progress: 0,
                   initiatives: [{
                       id: 'init-4',
                       name: 'Estruturação Comercial',
                       progress: 0,
                       actions: [
                           { id: 'act-4-1', name: 'Playbook Comercial V1 entregue (mínimo 30 páginas)', isCompleted: false },
                           { id: 'act-4-2', name: 'Scripts oficiais de vendas aprovados', isCompleted: false },
                           { id: 'act-4-3', name: 'SLA de atendimento definido (tempos máximos por etapa)', isCompleted: false }
                           ]
                   }]
               }
            ]
        },
        // Obj 3: Fase 2
        {
            id: 'obj-2',
            name: 'Fase 2 — Operacionalização',
            progress: 0,
            keyResults: [
                // Week 5
                {
                    id: 'kr-5',
                    name: 'Semana 5 — Gestão',
                    progress: 0,
                    initiatives: [{
                        id: 'init-5',
                        name: 'Liderança e Controle',
                        progress: 0,
                        actions: [
                            { id: 'act-5-1', name: 'Playbook do Gestor entregue (rotinas e rituais)', isCompleted: false },
                            { id: 'act-5-2', name: 'Dashboard de KPIs implementado (5–7 indicadores)', isCompleted: false },
                            { id: 'act-5-3', name: 'Agenda semanal padrão definida', isCompleted: false }
                        ]
                    }]
                },
                // Week 6
                {
                    id: 'kr-6',
                    name: 'Semana 6 — Customer Success',
                    progress: 0,
                    initiatives: [{
                        id: 'init-6',
                        name: 'Sucesso do Cliente',
                        progress: 0,
                        actions: [
                            { id: 'act-6-1', name: 'Processo de onboarding mapeado (passo a passo)', isCompleted: false },
                            { id: 'act-6-2', name: 'Principais motivos de churn identificados (top 5)', isCompleted: false },
                            { id: 'act-6-3', name: 'Time to value definido (dias até primeiro resultado)', isCompleted: false }
                        ]
                    }]
                },
                // Week 7
                {
                    id: 'kr-7',
                    name: 'Semana 7 — Rotina',
                    progress: 0,
                    initiatives: [{
                        id: 'init-7',
                        name: 'Execução Comercial',
                        progress: 0,
                        actions: [
                            { id: 'act-7-1', name: 'Rotina diária do vendedor padronizada', isCompleted: false },
                            { id: 'act-7-2', name: 'Checklist de atividades obrigatórias criado', isCompleted: false },
                            { id: 'act-7-3', name: 'Mínimo de atividades/dia definido (ligações, reuniões, propostas)', isCompleted: false }
                        ]
                    }]
                },
                // Week 8
                {
                    id: 'kr-8',
                    name: 'Semana 8 — Previsibilidade',
                    progress: 0,
                    initiatives: [{
                        id: 'init-8',
                        name: 'Pipeline e Forecast',
                        progress: 0,
                        actions: [
                            { id: 'act-8-1', name: 'Modelo de forecast implementado', isCompleted: false },
                            { id: 'act-8-2', name: 'Pipeline coverage ratio calculado (3x–4x)', isCompleted: false },
                            { id: 'act-8-3', name: 'Acurácia do forecast >70%', isCompleted: false }
                        ]
                    }]
                }
            ]
        },
        // Obj 4: Fase 3
        {
            id: 'obj-3',
            name: 'Fase 3 — Consolidação',
            progress: 0,
            keyResults: [
                // Week 9
                {
                    id: 'kr-9',
                    name: 'Semana 9 — Liderança',
                    progress: 0,
                    initiatives: [{
                        id: 'init-9',
                        name: 'Desenvolvimento de Líderes',
                        progress: 0,
                        actions: [
                            { id: 'act-9-1', name: 'PDI de cada líder criado (90 dias)', isCompleted: false },
                            { id: 'act-9-2', name: 'Modelo de 1:1 implementado (pauta e frequência)', isCompleted: false },
                            { id: 'act-9-3', name: 'Matriz de competências-chave (skills) criada', isCompleted: false }
                        ]
                    }]
                },
                // Week 10
                {
                    id: 'kr-10',
                    name: 'Semana 10 — Carreira',
                    progress: 0,
                    initiatives: [{
                        id: 'init-10',
                        name: 'Estrutura Organizacional',
                        progress: 0,
                        actions: [
                            { id: 'act-10-1', name: 'Descrição de cargos finalizada (Job Descriptions)', isCompleted: false },
                            { id: 'act-10-2', name: 'Trilha de carreira desenhada (progressão clara)', isCompleted: false },
                            { id: 'act-10-3', name: 'Critérios de promoção definidos (objetivos e subjetivos)', isCompleted: false }
                        ]
                    }]
                },
                // Week 11
                {
                    id: 'kr-11',
                    name: 'Semana 11 — Remuneração',
                    progress: 0,
                    initiatives: [{
                        id: 'init-11',
                        name: 'Estrutura de Incentivos',
                        progress: 0,
                        actions: [
                            { id: 'act-11-1', name: 'Modelo de comissionamento aprovado', isCompleted: false },
                            { id: 'act-11-2', name: 'Simulador de ganhos criado', isCompleted: false },
                            { id: 'act-11-3', name: 'Meta OTE definida por cargo', isCompleted: false }
                        ]
                    }]
                },
                // Week 12
                {
                    id: 'kr-12',
                    name: 'Semana 12 — Futuro',
                    progress: 0,
                    initiatives: [{
                        id: 'init-12',
                        name: 'Estratégia e Autonomia',
                        progress: 0,
                        actions: [
                            { id: 'act-12-1', name: 'Roadmap de 12 meses criado (marcos trimestrais)', isCompleted: false },
                            { id: 'act-12-2', name: 'Matriz de Maturidade final aplicada (score >80%)', isCompleted: false },
                            { id: 'act-12-3', name: 'Plano de Sustentação definido (como manter resultados)', isCompleted: false }
                        ]
                    }]
                }
            ]
        }
    ]
};

export const DUMMY_CLIENTS_DATA: Client[] = [
    {
        id: 'client-integro',
        name: 'Íntegro Proteção Veicular',
        onboardingDate: '2025-11-01T09:00:00.000Z',
        assessments: [
            {
                id: 'assess-integro-1',
                date: '2025-11-06T09:00:00.000Z',
                scores: {
                    [Pillar.STRATEGY]: { responses: [0, 0, 0, 0, 0, 25, 0, 0, 0, 0], goal: 80, notes: 'Falta de estratégia e direcionamento claros.' },
                    [Pillar.GOALS]: { responses: [0, 0, 50, 100, 50, 50, 50, 0, 0, 0], goal: 80, notes: 'Metas existem, mas não são bem planejadas ou desdobradas.' },
                    [Pillar.CHANNELS]: { responses: [50, 0, 0, 0, 0, 0, 25, 25, 0, 0], goal: 80, notes: 'Ações isoladas com influenciador, mas sem processos para converter leads.' },
                    [Pillar.PROCESS]: { responses: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0], goal: 80, notes: 'Completa falta de processos e playbooks.' },
                    [Pillar.METRICS]: { responses: [0, 0, 0, 0, 0, 0, 0, 25, 0, 0], goal: 80, notes: 'Falta de cultura de dados e acompanhamento de KPIs.' },
                    [Pillar.COMPENSATION]: { responses: [100, 0, 0, 50, 50, 0, 0, 0, 0, 0], goal: 80, notes: 'Estrutura de remuneração e desenvolvimento de liderança incipiente.' },
                    [Pillar.SYSTEMS]: { responses: [25, 0, 0, 100, 100, 100, 0, 0, 0, 0], goal: 80, notes: 'Sistemas e dados desorganizados.' }
                },
                overallMaturity: 12
            },
            {
                id: 'assess-integro-2',
                date: '2025-11-13T09:00:00.000Z',
                scores: {
                    [Pillar.STRATEGY]: { responses: [0, 75, 50, 0, 0, 25, 0, 0, 0, 0], goal: 80, notes: 'Progresso com a definição do ICP.' },
                    [Pillar.GOALS]: { responses: [0, 0, 50, 100, 50, 50, 50, 0, 0, 0], goal: 80, notes: 'Metas existem, mas não são bem planejadas ou desdobradas.' },
                    [Pillar.CHANNELS]: { responses: [50, 0, 0, 0, 0, 0, 25, 25, 0, 0], goal: 80, notes: 'Ações isoladas com influenciador, mas sem processos para converter leads.' },
                    [Pillar.PROCESS]: { responses: [25, 0, 0, 25, 0, 0, 0, 0, 50, 0], goal: 80, notes: 'Início da formalização com a prévia do Playbook de Vendas.' },
                    [Pillar.METRICS]: { responses: [0, 0, 0, 0, 0, 0, 0, 25, 0, 0], goal: 80, notes: 'Falta de cultura de dados e acompanhamento de KPIs.' },
                    [Pillar.COMPENSATION]: { responses: [100, 0, 0, 50, 50, 0, 0, 0, 0, 0], goal: 80, notes: 'Estrutura de remuneração e desenvolvimento de liderança incipiente.' },
                    [Pillar.SYSTEMS]: { responses: [25, 0, 0, 100, 100, 100, 0, 0, 0, 0], goal: 80, notes: 'Sistemas e dados desorganizados.' }
                },
                overallMaturity: 16
            },
            {
                id: 'assess-integro-3',
                date: '2025-11-20T09:00:00.000Z',
                scores: {
                    [Pillar.STRATEGY]: { responses: [0, 75, 50, 0, 0, 25, 0, 0, 0, 0], goal: 80, notes: 'Estratégia consolidada com ICP e Playbook.' },
                    [Pillar.GOALS]: { responses: [50, 25, 25, 100, 50, 50, 50, 75, 75, 75], goal: 80, notes: 'Prévia do Planejamento Trimestral apresentada, definindo metas e rituais.' },
                    [Pillar.CHANNELS]: { responses: [50, 25, 25, 25, 25, 25, 25, 25, 25, 25], goal: 80, notes: 'Playbook definiu processos claros, scripts e cadências para os canais.' },
                    [Pillar.PROCESS]: { responses: [100, 75, 75, 75, 25, 25, 25, 50, 50, 50], goal: 80, notes: 'Playbook de Vendas completo entregue, formalizando e padronizando processos.' },
                    [Pillar.METRICS]: { responses: [0, 0, 0, 0, 0, 0, 0, 25, 0, 0], goal: 80, notes: 'Ainda sem avanço significativo, aguardando implementação do CRM.' },
                    [Pillar.COMPENSATION]: { responses: [100, 0, 0, 50, 50, 0, 0, 0, 0, 0], goal: 80, notes: 'Estrutura de remuneração e desenvolvimento de liderança incipiente.' },
                    [Pillar.SYSTEMS]: { responses: [50, 25, 25, 100, 100, 100, 25, 25, 25, 25], goal: 80, notes: 'Implementação parcial do CRM iniciada, funil customizado.' }
                },
                overallMaturity: 24
            }
        ],
        deliverables: [],
        clientInfo: JSON.parse(JSON.stringify(DEFAULT_CLIENT_INFO)),
        chatSessions: [],
        diagnosticSummary: '',
        journeys: [CONSULTING_JOURNEY_TEMPLATE]
    },
    {
        id: 'client-cj',
        name: 'CJ Consultoria Financeira',
        onboardingDate: '2025-11-10T09:00:00.000Z',
        assessments: [
            {
                id: 'assess-cj-1',
                date: '2025-11-16T09:00:00.000Z',
                scores: {
                    [Pillar.STRATEGY]: { responses: [100, 0, 0, 75, 75, 75, 75, 75, 0, 75], goal: 80, notes: 'Nenhuma nota.' },
                    [Pillar.GOALS]: { responses: [100, 100, 0, 75, 0, 0, 100, 100, 0, 0], goal: 80, notes: 'Nenhuma nota.' },
                    [Pillar.CHANNELS]: { responses: [0, 100, 100, 100, 0, 0, 0, 0, 0, 50], goal: 80, notes: 'Nenhuma nota.' },
                    [Pillar.PROCESS]: { responses: [0, 0, 0, 50, 0, 0, 100, 0, 0, 100], goal: 80, notes: 'Nenhuma nota.' },
                    [Pillar.METRICS]: { responses: [25, 25, 25, 0, 100, 25, 25, 100, 0, 100], goal: 80, notes: 'Nenhuma nota.' },
                    [Pillar.COMPENSATION]: { responses: [100, 100, 0, 100, 0, 50, 100, 25, 100, 0], goal: 80, notes: 'Nenhuma nota.' },
                    [Pillar.SYSTEMS]: { responses: [100, 0, 0, 100, 100, 100, 75, 0, 0, 100], goal: 80, notes: 'Nenhuma nota.' }
                },
                overallMaturity: 40
            },
            {
                id: 'assess-cj-2',
                date: '2025-11-23T09:00:00.000Z',
                scores: {
                    [Pillar.STRATEGY]: { responses: [100, 75, 50, 75, 75, 75, 75, 75, 25, 75], goal: 80, notes: 'Nenhuma nota.' },
                    [Pillar.GOALS]: { responses: [100, 100, 0, 75, 0, 0, 100, 100, 0, 0], goal: 80, notes: 'Nenhuma nota.' },
                    [Pillar.CHANNELS]: { responses: [0, 100, 100, 100, 0, 0, 0, 0, 0, 50], goal: 80, notes: 'Nenhuma nota.' },
                    [Pillar.PROCESS]: { responses: [25, 25, 25, 50, 25, 25, 100, 25, 25, 100], goal: 80, notes: 'Nenhuma nota.' },
                    [Pillar.METRICS]: { responses: [25, 25, 25, 0, 100, 25, 25, 100, 0, 100], goal: 80, notes: 'Nenhuma nota.' },
                    [Pillar.COMPENSATION]: { responses: [100, 100, 0, 100, 0, 50, 100, 25, 100, 0], goal: 80, notes: 'Nenhuma nota.' },
                    [Pillar.SYSTEMS]: { responses: [100, 0, 0, 100, 100, 100, 75, 0, 0, 100], goal: 80, notes: 'Nenhuma nota.' }
                },
                overallMaturity: 45
            },
            {
                id: 'assess-cj-3',
                date: '2025-11-21T09:00:00.000Z',
                scores: {
                    [Pillar.STRATEGY]: {
                        responses: [100, 100, 75, 100, 100, 75, 100, 75, 75, 75],
                        goal: 80,
                        notes: 'Planejamento Estratégico de 90 páginas entregue. Cenários, roadmaps e base operacional definidos.'
                    },
                    [Pillar.GOALS]: {
                        responses: [100, 100, 50, 75, 75, 75, 100, 50, 75, 50],
                        goal: 80,
                        notes: 'Metas, OKRs e Capacity Planning (667-978 vendas/mês) definidos para toda a estrutura.'
                    },
                    [Pillar.CHANNELS]: {
                        responses: [50, 50, 50, 50, 25, 50, 50, 50, 50, 50],
                        goal: 80,
                        notes: 'Mapeamento de praças e histórico de leads realizado, mas falta otimização.'
                    },
                    [Pillar.PROCESS]: {
                        responses: [25, 25, 25, 25, 0, 25, 25, 25, 0, 25],
                        goal: 80,
                        notes: 'CRÍTICO: Playbook atrasado por falta de dados históricos. Avanço de apenas 10% vs 45% esperado.'
                    },
                    [Pillar.METRICS]: {
                        responses: [25, 25, 25, 25, 0, 50, 25, 25, 25, 25],
                        goal: 80,
                        notes: 'Dados históricos de 12 meses incompletos impediram diagnóstico profundo e cálculo de ROI.'
                    },
                    [Pillar.COMPENSATION]: {
                        responses: [75, 75, 50, 75, 50, 50, 50, 50, 50, 75],
                        goal: 80,
                        notes: 'Metas estruturadas para Vendedores, Gestor e Diretoria.'
                    },
                    [Pillar.SYSTEMS]: {
                        responses: [50, 50, 50, 50, 50, 50, 50, 50, 50, 50],
                        goal: 80,
                        notes: 'Manutenção da estrutura atual.'
                    }
                },
                overallMaturity: 51
            }
        ],
        deliverables: [],
        clientInfo: JSON.parse(JSON.stringify(DEFAULT_CLIENT_INFO)),
        chatSessions: [],
        diagnosticSummary: `📊 Relatório Semanal de Avanço | Projeto CJ - Semana 2\n\nData: 21 de Novembro de 2025\nResponsável: Guilherme - BS Labs / Consultoria Comercial CJ\nStatus Geral: 🟡 Atenção (Recuperação em Andamento)\n\n1. Resumo Executivo\n\nA Semana 2 foi marcada por uma decisão estratégica de priorizar a qualidade estrutural em detrimento do volume de entregas parciais. Atingimos 51% de Maturidade Comercial. Embora represente uma evolução de +6% em relação à Semana 1, ficamos 7% abaixo do projetado (58%). Este desvio deve-se ao atraso na captura de dados históricos críticos, o que impactou a confecção do Playbook e do Diagnóstico profundo. Decisão Tomada: Em vez de entregar 4 documentos incompletos, focamos 100% da energia na entrega de um Planejamento Estratégico Robusto, que foi finalizado com excelência.\n\n📉 O "Placar" da Semana\n\n- Maturidade Inicial: 40%\n- Maturidade Semana 1: 45% (+5%)\n- Maturidade Atual (S2): 51% (+6%)\n- Meta Projetada (S2): 58% (-7% Gap)\n- Meta Semana 3: 62% (Foco em Recuperação)\n\n2. Entregas da Semana\n\n✅ Entregue com Excelência (100%)\n- Planejamento Estratégico Completo (90 Páginas): Base Operacional, Cenários Matemáticos, Metas/OKRs e Capacity Planning.\n\n🟡 Entregas Parciais (Bloqueadas por Dados)\n- Diagnóstico Comercial (60%)\n- Funil Comercial (70%)\n- Framework de Governança (40%)\n\n3. Análise de Desvios\n\nO pilar de "Processos e Playbooks" teve o maior gap, avançando apenas 10% (esperado era 45%). Causas: Atraso no envio de dados e follow-up menos agressivo. Preferimos garantir a fundação estratégica agora para acelerar a execução nas próximas semanas.`,
        journeys: []
    },
    {
        id: 'client-bs-atual',
        name: 'BS Atual',
        onboardingDate: '2025-11-01T09:00:00.000Z',
        assessments: [
            {
                id: 'assess-bs-atual-1',
                date: '2025-11-20T09:00:00.000Z',
                scores: {
                    [Pillar.STRATEGY]: { responses: [100, 100, 100, 25, 0, 0, 100, 100, 100, 75], goal: 80, notes: 'Nenhuma nota.' },
                    [Pillar.GOALS]: { responses: [100, 100, 100, 100, 100, 50, 100, 100, 100, 100], goal: 80, notes: 'Nenhuma nota.' },
                    [Pillar.CHANNELS]: { responses: [100, 100, 100, 25, 100, 100, 100, 75, 100, 100], goal: 80, notes: 'Nenhuma nota.' },
                    [Pillar.PROCESS]: { responses: [0, 0, 0, 0, 0, 0, 100, 100, 100, 100], goal: 80, notes: 'Nenhuma nota.' },
                    [Pillar.METRICS]: { responses: [100, 75, 100, 25, 100, 100, 100, 100, 100, 100], goal: 80, notes: 'Nenhuma nota.' },
                    [Pillar.COMPENSATION]: { responses: [100, 100, 0, 100, 0, 75, 100, 0, 100, 100], goal: 80, notes: 'Nenhuma nota.' },
                    [Pillar.SYSTEMS]: { responses: [100, 100, 100, 100, 100, 100, 75, 0, 0, 100], goal: 80, notes: 'Nenhuma nota.' }
                },
                overallMaturity: 78
            }
        ],
        deliverables: [],
        clientInfo: JSON.parse(JSON.stringify(DEFAULT_CLIENT_INFO)),
        chatSessions: [],
        diagnosticSummary: '',
        journeys: []
    }
];

export const CLIENT_ACCESSIBLE_VIEWS: { id: View; label: string }[] = [
    { id: 'dashboard', label: 'Dashboard' },
    { id: 'evolution', label: 'Evolução' },
    { id: 'timeline', label: 'Timeline' },
    { id: 'planning', label: 'Planejamento' },
    { id: 'library', label: 'Biblioteca' },
    { id: 'chatbot', label: 'Chat IA' }
];

export const PILLAR_QUESTIONS: Record<Pillar, MaturityQuestion[]> = {
    [Pillar.STRATEGY]: [
        {
            id: '1.1',
            question: 'A empresa possui missão, visão e valores formalizados, documentados, amplamente comunicados e revisados anualmente?',
            options: {
                0: 'Não existem',
                25: 'Existem informalmente',
                50: 'Documentados mas não comunicados',
                75: 'Documentados e comunicados',
                100: 'Documentados, comunicados, vividos e revisados anualmente'
            }
        },
        {
            id: '1.2',
            question: 'Existe um ICP (Ideal Customer Profile) claramente definido com critérios objetivos, score de qualificação e red flags documentadas?',
            options: {
                0: 'Não existe ICP',
                25: 'Noção vaga do cliente ideal',
                50: 'ICP básico definido',
                75: 'ICP detalhado com critérios',
                100: 'ICP com scoring, red flags e revisão trimestral'
            }
        },
        {
            id: '1.3',
            question: 'A proposta de valor única está definida, diferenciada da concorrência e validada com clientes?',
            options: {
                0: 'Não existe',
                25: 'Genérica e não diferenciada',
                50: 'Definida mas não validada',
                75: 'Definida e parcialmente validada',
                100: 'Única, validada e com casos de sucesso comprovados'
            }
        },
        {
            id: '1.4',
            question: 'Existe análise de mercado completa incluindo TAM, SAM, SOM e competitive positioning atualizada?',
            options: {
                0: 'Nenhuma análise',
                25: 'Conhecimento informal do mercado',
                50: 'Análise básica de mercado',
                75: 'TAM/SAM definidos',
                100: 'TAM/SAM/SOM calculados + positioning + atualizados semestralmente'
            }
        },
        {
            id: '1.5',
            question: 'A estratégia comercial está formalizada com OKRs claros, roadmap 24 meses e alinhada ao planejamento estratégico?',
            options: {
                0: 'Não existe estratégia',
                25: 'Estratégia informal',
                50: 'Estratégia documentada básica',
                75: 'Estratégia com metas claras',
                100: 'Estratégia com OKRs, roadmap 24 meses e revisão trimestral'
            }
        },
        {
            id: '1.6',
            question: 'O discurso comercial é consistente, alinhado à proposta de valor e padronizado em toda equipe?',
            options: {
                0: 'Cada um fala diferente',
                25: 'Alguma consistência',
                50: 'Pitch básico definido',
                75: 'Pitch padronizado e treinado',
                100: 'Storytelling consistente, testado e otimizado continuamente'
            }
        },
        {
            id: '1.7',
            question: 'Existe visão de expansão clara com metas de crescimento, novos mercados e produtos definidos?',
            options: {
                0: 'Sem visão de futuro',
                25: 'Ideias vagas de crescimento',
                50: 'Metas de crescimento básicas',
                75: 'Plano de expansão definido',
                100: 'Roadmap detalhado com marcos, investimentos e ROI projetado'
            }
        },
        {
            id: '1.8',
            question: 'A cultura comercial reflete os valores da empresa e é mensurada através de comportamentos observáveis?',
            options: {
                0: 'Desalinhamento total',
                25: 'Algum alinhamento',
                50: 'Valores conhecidos mas não praticados',
                75: 'Valores praticados pela maioria',
                100: 'Cultura forte, mensurada e reconhecida'
            }
        },
        {
            id: '1.9',
            question: 'As decisões comerciais são tomadas com base em dados, estratégia e ROI ao invés de urgência ou intuição?',
            options: {
                0: 'Decisões por impulso',
                25: 'Algumas decisões planejadas',
                50: 'Mix de planejamento e urgência',
                75: 'Maioria baseada em dados',
                100: '100% data-driven com framework de decisão'
            }
        },
        {
            id: '1.10',
            question: 'Existe processo de revisão estratégica estruturado com análise de resultados, mercado e ajustes?',
            options: {
                0: 'Nunca revisa',
                25: 'Revisa quando lembra',
                50: 'Revisão anual informal',
                75: 'Revisão anual estruturada',
                100: 'Revisão trimestral com metodologia e action plans'
            }
        }
    ],
    [Pillar.GOALS]: [
        {
            id: '2.1',
            question: 'As metas comerciais estão formalizadas, documentadas e baseadas em análise histórica e capacidade?',
            options: {
                0: 'Não existem metas',
                25: 'Metas informais',
                50: 'Metas documentadas sem base',
                75: 'Metas baseadas em histórico',
                100: 'Metas bottom-up + top-down com análise completa'
            }
        },
        {
            id: '2.2',
            question: 'As metas estão desdobradas por área, equipe e indivíduo com clareza de contribuição?',
            options: {
                0: 'Sem desdobramento',
                25: 'Apenas meta global',
                50: 'Desdobradas por área',
                75: 'Desdobradas até equipes',
                100: 'Cascateadas até indivíduo com ownership claro'
            }
        },
        {
            id: '2.3',
            question: 'O processo de forecast é estruturado, preciso (>85% accuracy) e revisado semanalmente?',
            options: {
                0: 'Não existe forecast',
                25: 'Chute informal',
                50: 'Forecast mensal básico',
                75: 'Forecast semanal estruturado',
                100: 'Forecast com 85%+ accuracy, IA e cenários'
            }
        },
        {
            id: '2.4',
            question: 'Existe sistema de acompanhamento em tempo real com dashboards, alertas e rituais de gestão?',
            options: {
                0: 'Sem acompanhamento',
                25: 'Planilha mensal',
                50: 'Relatórios semanais',
                75: 'Dashboard atualizado diariamente',
                100: 'Real-time dashboard com alertas e BI'
            }
        },
        {
            id: '2.5',
            question: 'Os ajustes de rota são feitos proativamente baseados em leading indicators?',
            options: {
                0: 'Nunca ajusta',
                25: 'Ajusta no fim do período',
                50: 'Ajusta mensalmente',
                75: 'Ajusta quinzenalmente',
                100: 'Ajuste semanal com triggers automáticos'
            }
        },
        {
            id: '2.6',
            question: 'A equipe entende suas metas, como são calculadas e o que precisam fazer para atingir?',
            options: {
                0: 'Não conhecem as metas',
                25: 'Conhecem superficialmente',
                50: 'Conhecem mas não entendem',
                75: 'Entendem as metas',
                100: 'Dominam metas, cálculo e plano de ação'
            }
        },
        {
            id: '2.7',
            question: 'Existe planejamento de capacidade alinhando metas com recursos disponíveis?',
            options: {
                0: 'Sem planejamento',
                25: 'Metas desconectadas de recursos',
                50: 'Algum alinhamento',
                75: 'Capacidade considerada',
                100: 'Capacity planning completo com simulações'
            }
        },
        {
            id: '2.8',
            question: 'As metas incluem indicadores qualitativos como NPS, qualidade e margem?',
            options: {
                0: 'Apenas volume',
                25: 'Volume e faturamento',
                50: 'Inclui ticket médio',
                75: 'Inclui satisfação',
                100: 'Balanced scorecard completo'
            }
        },
        {
            id: '2.9',
            question: 'O processo de definição de metas envolve o time e considera feedback e condições de mercado?',
            options: {
                0: 'Top-down autoritário',
                25: 'Top-down com comunicação',
                50: 'Alguma consulta ao time',
                75: 'Processo participativo',
                100: 'Colaborativo com buy-in total'
            }
        },
        {
            id: '2.10',
            question: 'Existe análise de variância mensal comparando realizado vs. planejado com root cause?',
            options: {
                0: 'Sem análise',
                25: 'Olha resultado final',
                50: 'Compara mas sem análise',
                75: 'Análise básica de gaps',
                100: 'Variance analysis com root cause e action plans'
            }
        }
    ],
    [Pillar.CHANNELS]: [
        {
            id: '3.1',
            question: 'A empresa opera múltiplos canais de aquisição otimizados e com processos específicos?',
            options: {
                0: 'Um canal apenas',
                25: '2 canais básicos',
                50: '3+ canais ativos',
                75: 'Multi-canal com processos',
                100: 'Omnichannel otimizado com atribuição'
            }
        },
        {
            id: '3.2',
            question: 'O CAC (Custo de Aquisição) é medido, controlado e otimizado por canal com LTV/CAC > 3?',
            options: {
                0: 'Não mede CAC',
                25: 'Noção vaga de custo',
                50: 'CAC global calculado',
                75: 'CAC por canal',
                100: 'CAC por canal com LTV/CAC > 3 e otimização contínua'
            }
        },
        {
            id: '3.3',
            question: 'Existe estratégia de marketing digital completa incluindo SEO, SEM, Social e Content?',
            options: {
                0: 'Sem presença digital',
                25: 'Website básico',
                50: 'Algumas ações digitais',
                75: 'Estratégia digital ativa',
                100: 'Digital completo com automação e personalização'
            }
        },
        {
            id: '3.4',
            question: 'O processo de geração de demanda está integrado entre Marketing, Vendas e CS?',
            options: {
                0: 'Silos totais',
                25: 'Alguma comunicação',
                50: 'Reuniões periódicas',
                75: 'Processos integrados',
                100: 'Revenue team integrado com SLA'
            }
        },
        {
            id: '3.5',
            question: 'Existe programa estruturado de indicações, parcerias e channel partners?',
            options: {
                0: 'Sem programa',
                25: 'Indicações esporádicas',
                50: 'Incentivo informal',
                75: 'Programa de indicação',
                100: 'Referral + Partners + Afiliados ativos'
            }
        },
        {
            id: '3.6',
            question: 'O ROI de cada canal é medido, comparado e usado para alocação de recursos?',
            options: {
                0: 'Sem medição',
                25: 'Custo apenas',
                50: 'Receita por canal',
                75: 'ROI básico',
                100: 'ROI completo com attribution e otimização'
            }
        },
        {
            id: '3.7',
            question: 'Novos canais são testados sistematicamente com metodologia e budget definido?',
            options: {
                0: 'Nunca testa',
                25: 'Testa aleatoriamente',
                50: 'Testa quando sobra verba',
                75: 'Testes planejados',
                100: 'Innovation budget com metodologia de teste'
            }
        },
        {
            id: '3.8',
            question: 'Existe estratégia de Account-Based Marketing para contas estratégicas?',
            options: {
                0: 'Não existe',
                25: 'Algumas ações isoladas',
                50: 'Lista de contas-alvo',
                75: 'ABM básico implementado',
                100: 'ABM completo com personalização e multi-touch'
            }
        },
        {
            id: '3.9',
            question: 'O funil contempla toda jornada desde awareness até advocacy com métricas?',
            options: {
                0: 'Apenas vendas',
                25: 'Vendas e pós-venda',
                50: 'Marketing e vendas',
                75: 'Jornada completa mapeada',
                100: 'Full funnel com métricas e otimização'
            }
        },
        {
            id: '3.10',
            question: 'A velocidade e custo de aquisição melhoram consistentemente (MoM)?',
            options: {
                0: 'Piorando',
                25: 'Estagnado',
                50: 'Melhora esporádica',
                75: 'Melhora frequente',
                100: 'Melhoria contínua mensal comprovada'
            }
        }
    ],
    [Pillar.PROCESS]: [
        {
            id: '4.1',
            question: 'Existem playbooks completos e atualizados para vendas, CS, onboarding e marketing?',
            options: {
                0: 'Nenhum playbook',
                25: 'Algumas anotações',
                50: 'Playbook básico desatualizado',
                75: 'Playbooks documentados',
                100: 'Playbooks completos, vivos e certificados'
            }
        },
        {
            id: '4.2',
            question: 'Os processos comerciais estão mapeados em detalhe com responsáveis e SLAs claros?',
            options: {
                0: 'Sem processos',
                25: 'Processos informais',
                50: 'Alguns processos documentados',
                75: 'Maioria mapeada',
                100: '100% mapeado com BPMN e SLAs'
            }
        },
        {
            id: '4.3',
            question: 'O time aplica consistentemente os processos com aderência > 90%?',
            options: {
                0: 'Cada um faz como quer',
                25: 'Baixa aderência',
                50: 'Aderência parcial',
                75: 'Boa aderência',
                100: '90%+ aderência medida e auditada'
            }
        },
        {
            id: '4.4',
            question: 'Existe automação elimiando trabalho manual e aumentando produtividade?',
            options: {
                0: 'Tudo manual',
                25: 'Alguma ferramenta',
                50: 'Automações básicas',
                75: 'Boa automação',
                100: 'Hiper-automação com IA/ML'
            }
        },
        {
            id: '4.5',
            question: 'Os processos são revisados e otimizados trimestralmente com base em dados?',
            options: {
                0: 'Nunca revisa',
                25: 'Revisa quando quebra',
                50: 'Revisão anual',
                75: 'Revisão semestral',
                100: 'Revisão trimestral com A/B testing'
            }
        },
        {
            id: '4.6',
            question: 'Existe controle de qualidade com auditorias, scorecards e feedback contínuo?',
            options: {
                0: 'Sem controle',
                25: 'Controle reativo',
                50: 'Algumas auditorias',
                75: 'Auditorias regulares',
                100: 'QA contínuo com scorecards e coaching'
            }
        },
        {
            id: '4.7',
            question: 'O onboarding de novos colaboradores é estruturado com trilha e certificação?',
            options: {
                0: 'Sem onboarding',
                25: 'Shadowing apenas',
                50: 'Treinamento básico',
                75: 'Programa estruturado',
                100: 'Academia com trilhas e certificação'
            }
        },
        {
            id: '4.8',
            question: 'Os handoffs entre áreas (Marketing→Sales→CS) são padronizados e sem perda?',
            options: {
                0: 'Muita perda',
                25: 'Handoff problemático',
                50: 'Processo básico',
                75: 'Handoff estruturado',
                100: 'Seamless com 0% de perda'
            }
        },
        {
            id: '4.9',
            question: 'Existe gestão de conhecimento com wiki, FAQs e melhores práticas documentadas?',
            options: {
                0: 'Conhecimento perdido',
                25: 'Alguma documentação',
                50: 'Documentação dispersa',
                75: 'Base de conhecimento',
                100: 'Knowledge management com IA'
            }
        },
        {
            id: '4.10',
            question: 'O tempo de ciclo dos processos melhora consistentemente (redução mensal)?',
            options: {
                0: 'Aumentando',
                25: 'Estagnado',
                50: 'Melhora eventual',
                75: 'Melhora frequente',
                100: 'Otimização contínua com Lean/Six Sigma'
            }
        }
    ],
    [Pillar.METRICS]: [
        {
            id: '5.1',
            question: 'KPIs estão definidos para empresa, área, equipe e indivíduo com metas claras?',
            options: {
                0: 'Sem KPIs',
                25: 'Métricas informais',
                50: 'KPIs básicos',
                75: 'KPIs estruturados',
                100: 'KPI tree completa com OKRs'
            }
        },
        {
            id: '5.2',
            question: 'Existe single source of truth com dados confiáveis, acessíveis e em tempo real?',
            options: {
                0: 'Dados caóticos',
                25: 'Planilhas dispersas',
                50: 'Alguma centralização',
                75: 'BI centralizado',
                100: 'Data warehouse com governance'
            }
        },
        {
            id: '5.3',
            question: 'As decisões são tomadas baseadas em dados com análises estatísticas?',
            options: {
                0: 'Intuição apenas',
                25: 'Alguns dados',
                50: 'Mix dados/intuição',
                75: 'Data-driven',
                100: 'Data science com predictive analytics'
            }
        },
        {
            id: '5.4',
            question: 'Métricas de produtividade (atividades, conversões, velocidade) são monitoradas?',
            options: {
                0: 'Não monitora',
                25: 'Volume apenas',
                50: 'Atividades básicas',
                75: 'Produtividade medida',
                100: 'Productivity score com benchmarks'
            }
        },
        {
            id: '5.5',
            question: 'Análises de cohort, LTV, churn e unit economics são realizadas mensalmente?',
            options: {
                0: 'Nenhuma análise',
                25: 'Churn básico',
                50: 'LTV calculado',
                75: 'Cohort analysis',
                100: 'Unit economics completo com modeling'
            }
        },
        {
            id: '5.6',
            question: 'Dashboards executivos e operacionais são atualizados em tempo real?',
            options: {
                0: 'Sem dashboards',
                25: 'Relatório mensal',
                50: 'Dashboard semanal',
                75: 'Dashboard diário',
                100: 'Real-time com alerts e mobile'
            }
        },
        {
            id: '5.7',
            question: 'Leading indicators são monitorados para previsão e ajuste proativo?',
            options: {
                0: 'Só lagging',
                25: 'Poucos leading',
                50: 'Mix de indicators',
                75: 'Leading priorizados',
                100: 'Predictive model com ML'
            }
        },
        {
            id: '5.8',
            question: 'Existe benchmarking interno e externo com análise de performance?',
            options: {
                0: 'Sem comparação',
                25: 'Comparação informal',
                50: 'Benchmark interno',
                75: 'Benchmark externo',
                100: 'Benchmark contínuo com best practices'
            }
        },
        {
            id: '5.9',
            question: 'O ROI de cada iniciativa é medido e usado para priorização?',
            options: {
                0: 'Sem medição ROI',
                25: 'ROI estimado',
                50: 'ROI de grandes projetos',
                75: 'ROI da maioria',
                100: 'ROI de tudo com portfolio management'
            }
        },
        {
            id: '5.10',
            question: 'A cultura é data-driven com letramento de dados em todos níveis?',
            options: {
                0: 'Analfabetismo de dados',
                25: 'Poucos entendem',
                50: 'Liderança entende',
                75: 'Maioria entende',
                100: 'Data literacy universal com certificação'
            }
        }
    ],
    [Pillar.COMPENSATION]: [
        {
            id: '6.1',
            question: 'O modelo de remuneração variável é simples, transparente e motivador?',
            options: {
                0: 'Sem variável',
                25: 'Complexo e confuso',
                50: 'Existe mas não motiva',
                75: 'Claro e motivador',
                100: 'Best-in-class com simulador'
            }
        },
        {
            id: '6.2',
            question: 'A remuneração está alinhada aos objetivos estratégicos da empresa?',
            options: {
                0: 'Desalinhado',
                25: 'Algum alinhamento',
                50: 'Parcialmente alinhado',
                75: 'Bem alinhado',
                100: 'Perfectly aligned com balanced scorecard'
            }
        },
        {
            id: '6.3',
            question: 'Existem aceleradores para performance excepcional e reconhecimento?',
            options: {
                0: 'Sem aceleradores',
                25: 'Bônus eventual',
                50: 'Aceleradores básicos',
                75: 'Aceleradores estruturados',
                100: 'Multi-tier com SPIFs e club'
            }
        },
        {
            id: '6.4',
            question: 'O pagamento é previsível, pontual e vinculado a resultados verificáveis?',
            options: {
                0: 'Imprevisível',
                25: 'Atrasos frequentes',
                50: 'Geralmente pontual',
                75: 'Sempre pontual',
                100: 'Automated com transparência total'
            }
        },
        {
            id: '6.5',
            question: 'A remuneração total é competitiva com mercado (P75+)?',
            options: {
                0: 'Muito abaixo',
                25: 'Abaixo do mercado',
                50: 'Na média (P50)',
                75: 'Acima da média (P60-75)',
                100: 'Top of market (P75-90)'
            }
        },
        {
            id: '6.6',
            question: 'Existe remuneração variável para não-vendedores alinhada a resultados?',
            options: {
                0: 'Só vendas tem',
                25: 'Bônus anual genérico',
                50: 'PLR básico',
                75: 'Variável estruturado',
                100: 'All-company variable comp'
            }
        },
        {
            id: '6.7',
            question: 'O modelo inclui benefícios não-financeiros valorizados pela equipe?',
            options: {
                0: 'Sem benefícios',
                25: 'Benefícios básicos',
                50: 'Pacote standard',
                75: 'Bons benefícios',
                100: 'Benefícios flexíveis premium'
            }
        },
        {
            id: '6.8',
            question: 'Existe transparência total sobre ganhos, cálculos e rankings?',
            options: {
                0: 'Caixa preta',
                25: 'Pouca transparência',
                50: 'Cálculo disponível',
                75: 'Transparente',
                100: 'Real-time earnings dashboard'
            }
        },
        {
            id: '6.9',
            question: 'O plano é revisado anualmente com input do time e mercado?',
            options: {
                0: 'Nunca revisa',
                25: 'Revisa raramente',
                50: 'Revisa sem método',
                75: 'Revisão anual',
                100: 'Annual comp review com consultoria'
            }
        },
        {
            id: '6.10',
            question: 'A satisfação com remuneração é > 80% em pesquisa anônima?',
            options: {
                0: 'Insatisfação geral',
                25: '<40% satisfeitos',
                50: '50-60% satisfeitos',
                75: '70-80% satisfeitos',
                100: '>80% satisfeitos com eNPS alto'
            }
        }
    ],
    [Pillar.SYSTEMS]: [
        {
            id: '7.1',
            question: 'CRM está implementado, adotado (>95% uso) e integrado ao stack?',
            options: {
                0: 'Sem CRM',
                25: 'CRM básico pouco usado',
                50: 'CRM com adoção parcial',
                75: 'Boa adoção CRM',
                100: 'CRM central com 95%+ adoption'
            }
        },
        {
            id: '7.2',
            question: 'Existe stack moderno incluindo Sales Engagement, Intelligence e Analytics?',
            options: {
                0: 'Apenas planilhas',
                25: 'CRM apenas',
                50: 'CRM + email',
                75: 'Stack funcional',
                100: 'Best-in-class stack otimizado'
            }
        },
        {
            id: '7.3',
            question: 'Integrações entre sistemas eliminam trabalho duplicado e erros?',
            options: {
                0: 'Sistemas isolados',
                25: 'Integrações manuais',
                50: 'Algumas APIs',
                75: 'Bem integrado',
                100: 'Full integration com iPaaS'
            }
        },
        {
            id: '7.4',
            question: 'Automação com IA/ML está implementada para scoring, forecasting e insights?',
            options: {
                0: 'Zero automação',
                25: 'Automações básicas',
                50: 'Workflows automatizados',
                75: 'IA em algumas áreas',
                100: 'AI-first com ML models'
            }
        },
        {
            id: '7.5',
            question: 'A higiene de dados é mantida com >95% completude e acurácia?',
            options: {
                0: 'Dados caóticos',
                25: 'Muitos erros',
                50: 'Qualidade mediana',
                75: 'Boa qualidade',
                100: '95%+ data quality com MDM'
            }
        },
        {
            id: '7.6',
            question: 'Ferramentas de comunicação e colaboração são integradas e eficientes?',
            options: {
                0: 'Email apenas',
                25: 'Ferramentas dispersas',
                50: 'Algumas ferramentas',
                75: 'Suite colaborativo',
                100: 'Unified communications'
            }
        },
        {
            id: '7.7',
            question: 'Segurança, compliance e LGPD são garantidos com certificações?',
            options: {
                0: 'Sem segurança',
                25: 'Segurança básica',
                50: 'Algumas políticas',
                75: 'Compliance básico',
                100: 'SOC2, ISO, LGPD certificados'
            }
        },
        {
            id: '7.8',
            question: 'O stack é escalável, cloud-native e preparado para crescimento 10x?',
            options: {
                0: 'Legacy limitado',
                25: 'Parcialmente cloud',
                50: 'Cloud básico',
                75: 'Cloud escalável',
                100: 'Cloud-native auto-scaling'
            }
        },
        {
            id: '7.9',
            question: 'Existe conversation/revenue intelligence capturando insights de vendas?',
            options: {
                0: 'Sem captura',
                25: 'Notas manuais',
                50: 'Gravação básica',
                75: 'Call recording',
                100: 'Full conversation intelligence'
            }
        },
        {
            id: '7.10',
            question: 'O ROI da tecnologia é medido e otimizado continuamente?',
            options: {
                0: 'Sem medição',
                25: 'Custo apenas',
                50: 'Alguma análise',
                75: 'ROI calculado',
                100: 'Tech ROI optimization continuous'
            }
        }
    ]
};
