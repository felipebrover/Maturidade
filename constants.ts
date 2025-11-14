import { Pillar, ClientInfoData, ClientInfoSectionId } from './types';
import type { Icon } from 'lucide-react';

// We can't import lucide-react here as it's a value, so we'll pass them as props.
// This file is for data constants.

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

export const PILLAR_QUESTIONS: Record<Pillar, string[]> = {
    [Pillar.STRATEGY]: [
        'O Perfil de Cliente Ideal (ICP) está claramente definido e documentado?',
        'A Proposta Única de Valor (PUV) é comunicada de forma consistente em todos os canais?',
        'Existe uma análise competitiva formal que é revisada periodicamente?',
        'Os objetivos estratégicos da área comercial estão alinhados com os objetivos globais da empresa?',
        'O posicionamento de mercado da empresa é claro e diferenciado dos concorrentes?',
        'A empresa conhece e acompanha as principais tendências do seu mercado de atuação?',
        'Existe um processo para coletar feedback do mercado e ajustar a estratégia?',
        'O product-market fit é validado e mensurado continuamente?',
        'A liderança comercial tem uma visão clara de onde a área estará em 1, 3 e 5 anos?',
        'Os critérios de entrada em novos mercados ou segmentos são bem definidos?',
    ],
    [Pillar.GOALS]: [
        'As metas de vendas são definidas usando uma metodologia clara (ex: SMART)?',
        'O processo de forecasting de vendas é estruturado e possui acurácia previsível?',
        'Existe um plano de capacidade (capacity planning) para o time de vendas?',
        'O plano de contas e territórios é definido com base em dados e potencial de mercado?',
        'As metas são desdobradas de forma clara para cada membro do time comercial?',
        'O planejamento orçamentário da área comercial está alinhado com as metas de crescimento?',
        'Existe um processo de revisão de performance (QBRs) bem estruturado?',
        'O planejamento de contratações e ramp-up de novos vendedores é proativo?',
        'As metas individuais incentivam a colaboração e o sucesso do time?',
        'O planejamento considera sazonalidades e ciclos de venda do mercado?',
    ],
    [Pillar.CHANNELS]: [
        'Os canais de aquisição de clientes (inbound, outbound, parceiros) estão diversificados?',
        'A performance de cada canal é medida e otimizada continuamente?',
        'O Custo de Aquisição de Cliente (CAC) por canal é conhecido e gerenciado?',
        'A estratégia de prospecção outbound é estruturada e segue um playbook?',
        'As campanhas de marketing geram leads qualificados (MQLs) na quantidade e qualidade esperadas?',
        'Existe um programa de parcerias ou canais indiretos em vigor?',
        'A estratégia de conteúdo suporta a jornada de compra e atrai o ICP?',
        'O processo de qualificação de leads (ex: BANT, MEDDIC) é padronizado?',
        'A taxa de conversão de lead para oportunidade é monitorada e otimizada?',
        'A empresa investe em canais de aquisição com base no LTV dos clientes que eles geram?',
    ],
    [Pillar.PROCESS]: [
        'O funil de vendas e suas etapas estão formalmente definidos no CRM?',
        'Existem critérios claros de passagem de bastão entre as etapas do funil?',
        'O processo de qualificação e passagem de leads entre Marketing e Vendas (SLA) é definido?',
        'Existe um playbook de vendas documentado e utilizado pelo time?',
        'O processo de onboarding de novos clientes é padronizado e eficaz?',
        'As atividades do time de vendas (ligações, e-mails, reuniões) são registradas de forma consistente?',
        'O processo para elaboração de propostas e precificação é padronizado?',
        'Existem processos definidos para upsell e cross-sell na base de clientes?',
        'O ciclo de vendas é medido e existem iniciativas para reduzi-lo?',
        'O processo de gestão de contratos e assinaturas é ágil e seguro?',
    ],
    [Pillar.METRICS]: [
        'Os KPIs mais importantes (ex: MRR, Churn, CAC, LTV) são acompanhados em dashboards?',
        'As taxas de conversão em cada etapa do funil de vendas são conhecidas e monitoradas?',
        'A performance individual de cada vendedor é medida com base em métricas claras?',
        'A saúde da carteira de clientes (health score) é monitorada pela área de CS?',
        'As decisões da liderança comercial são consistentemente baseadas em dados?',
        'O time tem visibilidade em tempo real do seu progresso em relação às metas?',
        'A análise de "win/loss" é feita de forma estruturada para extrair aprendizados?',
        'A velocidade das vendas (sales velocity) é calculada e otimizada?',
        'O retorno sobre o investimento (ROI) das ações de marketing e vendas é medido?',
        'Existe uma cultura de transparência e compartilhamento de métricas com o time?',
    ],
    [Pillar.COMPENSATION]: [
        'O plano de comissionamento é claro, fácil de entender e previsível?',
        'A remuneração variável está diretamente atrelada às metas estratégicas da empresa?',
        'Existem aceleradores e bônus para alta performance (over-achievement)?',
        'O plano incentiva a aquisição de novos logos e também a expansão da base?',
        'O pagamento das comissões é feito de forma pontual e sem erros?',
        'O plano de remuneração é competitivo em relação ao mercado?',
        'Existem incentivos não-financeiros (SPIFFs, reconhecimento) para motivar o time?',
        'O plano é revisado anualmente para se adaptar às mudanças de estratégia?',
        'A estrutura de remuneração é justa e percebida como tal pelo time?',
        'O plano desincentiva comportamentos indesejados (ex: descontos excessivos)?',
    ],
    [Pillar.SYSTEMS]: [
        'O CRM é a fonte central de verdade para todas as informações de clientes e negociações?',
        'A adoção das ferramentas (CRM, automação) pelo time comercial é alta?',
        'As ferramentas de vendas e marketing estão integradas para garantir um fluxo de dados consistente?',
        'O time tem acesso a ferramentas que aumentam sua produtividade (ex: automação de e-mails, sales engagement)?',
        'Os relatórios e dashboards necessários para a gestão são facilmente extraídos dos sistemas?',
        'Existe um processo de treinamento contínuo nas ferramentas utilizadas?',
        'A empresa investe em tecnologia para otimizar o processo comercial?',
        'Os sistemas fornecem os dados necessários para uma análise preditiva?',
        'A pilha de tecnologia (tech stack) é revisada para garantir que atende às necessidades do negócio?',
        'Os sistemas suportam a colaboração eficaz entre os times de Marketing, Vendas e CS?',
    ],
};

export const INITIAL_PILLAR_SCORE = { responses: Array(10).fill(0), goal: 80, notes: '' };

export const CLIENT_INFO_SECTIONS_ORDER: ClientInfoSectionId[] = [
    'summary', 'basic', 'metrics', 'funnel', 'competitors', 'materials', 'background', 'goals', 'contacts'
];

export const DEFAULT_CLIENT_INFO: ClientInfoData = {
    summary: {
        title: 'Resumo Executivo',
        questions: [
            { id: 's1', question: 'Qual é a descrição geral do cliente e seu principal negócio?', answer: '', isDefault: true, attachments: [] },
            { id: 's2', question: 'Qual o principal problema que a nossa solução resolve para ele?', answer: '', isDefault: true, attachments: [] },
        ],
    },
    basic: {
        title: 'Dados Básicos',
        questions: [
            { id: 'b1', question: 'Nome da Empresa', answer: '', isDefault: true, attachments: [] },
            { id: 'b2', question: 'Setor de Atuação', answer: '', isDefault: true, attachments: [] },
            { id: 'b3', question: 'Tamanho da Empresa (nº de funcionários)', answer: '', isDefault: true, attachments: [] },
            { id: 'b4', question: 'Localização (Sede)', answer: '', isDefault: true, attachments: [] },
        ],
    },
    metrics: {
        title: 'Métricas Principais',
        questions: [
            { id: 'm1', question: 'Receita Anual (faturamento)', answer: '', isDefault: true, attachments: [] },
            { id: 'm2', question: 'Taxa de Crescimento Anual (%)', answer: '', isDefault: true, attachments: [] },
            { id: 'm3', question: 'Principais KPIs que eles acompanham', answer: '', isDefault: true, attachments: [] },
        ],
    },
    funnel: {
        title: 'Funil de Vendas',
        questions: [
            { id: 'f1', question: 'Quais são as principais etapas do funil de vendas do cliente?', answer: '', isDefault: true, attachments: [] },
            { id: 'f2', question: 'Métricas de conversão entre as etapas', answer: '', isDefault: true, attachments: [] },
            { id: 'f3', question: 'Qual a duração média do ciclo de vendas?', answer: '', isDefault: true, attachments: [] },
        ],
    },
    competitors: {
        title: 'Concorrentes',
        questions: [
            { id: 'c1', question: 'Quem são os principais concorrentes?', answer: '', isDefault: true, attachments: [] },
            { id: 'c2', question: 'Quais são os nossos principais diferenciais competitivos na visão deles?', answer: '', isDefault: true, attachments: [] },
        ],
    },
    materials: {
        title: 'Materiais de Apoio',
        questions: [
            { id: 'ma1', question: 'Links para documentos importantes (apresentações, propostas)', answer: '', isDefault: true, attachments: [] },
            { id: 'ma2', question: 'Links para o site, blog, redes sociais', answer: '', isDefault: true, attachments: [] },
        ],
    },
    background: {
        title: 'Histórico e Desafios',
        questions: [
            { id: 'bg1', question: 'Qual a história da empresa?', answer: '', isDefault: true, attachments: [] },
            { id: 'bg2', question: 'Quais foram os principais desafios que os levaram a nos contratar?', answer: '', isDefault: true, attachments: [] },
        ],
    },
    goals: {
        title: 'Objetivos',
        questions: [
            { id: 'g1', question: 'Quais são as metas de curto, médio e longo prazo do cliente?', answer: '', isDefault: true, attachments: [] },
            { id: 'g2', question: 'Qual é o roadmap de produto/serviço deles?', answer: '', isDefault: true, attachments: [] },
        ],
    },
    contacts: {
        title: 'Contatos Chave',
        questions: [
            { id: 'ct1', question: 'Quem é o principal decisor? (Nome, Cargo, Contato)', answer: '', isDefault: true, attachments: [] },
            { id: 'ct2', question: 'Quem é o principal ponto de contato no dia-a-dia? (Nome, Cargo, Contato)', answer: '', isDefault: true, attachments: [] },
        ],
    },
};

export const DUMMY_CLIENTS_DATA = [
    {
        id: 'client-1',
        name: 'Nexus Corp',
        onboardingDate: new Date(new Date().setDate(new Date().getDate() - 90)).toISOString(),
        assessments: [
            {
                id: 'assessment-1-1',
                date: new Date(new Date().setDate(new Date().getDate() - 30)).toISOString(),
                scores: {
                    [Pillar.STRATEGY]: { responses: [100, 100, 75, 75, 50, 50, 50, 50, 25, 25], goal: 85, notes: 'ICP definido, mas PUV precisa de refinamento.' }, // Avg: 60
                    [Pillar.GOALS]: { responses: [100, 100, 100, 100, 100, 100, 100, 100, 75, 75], goal: 95, notes: 'Metas SMART bem definidas e desdobradas.' }, // Avg: 95
                    [Pillar.CHANNELS]: { responses: [100, 100, 100, 100, 100, 100, 75, 75, 75, 75], goal: 90, notes: 'Canal de inbound marketing muito maduro.' }, // Avg: 90
                    [Pillar.PROCESS]: { responses: [50, 50, 50, 25, 25, 25, 25, 0, 0, 0], goal: 75, notes: 'Processo de vendas pouco estruturado e sem playbook.' }, // Avg: 25
                    [Pillar.METRICS]: { responses: [100, 100, 100, 100, 100, 75, 75, 75, 75, 100], goal: 95, notes: 'Dashboards em tempo real para KPIs core.' }, // Avg: 90
                    [Pillar.COMPENSATION]: { responses: [75, 75, 50, 50, 50, 50, 25, 25, 0, 0], goal: 80, notes: 'Plano de remuneração incentiva apenas novos logos.' }, // Avg: 40
                    [Pillar.SYSTEMS]: { responses: [75, 75, 75, 75, 50, 50, 25, 25, 0, 0], goal: 85, notes: 'CRM implementado, mas baixa adoção do time.' }, // Avg: 45
                },
                overallMaturity: 64, // Recalculated
            },
            {
                id: 'assessment-1-2',
                date: new Date(new Date().setDate(new Date().getDate() - 7)).toISOString(),
                scores: {
                    [Pillar.STRATEGY]: { responses: [100, 100, 75, 75, 75, 50, 50, 50, 25, 25], goal: 85, notes: 'PUV ajustada com base em feedback de mercado.' }, // Avg: 63
                    [Pillar.GOALS]: { responses: [100, 100, 100, 100, 100, 100, 100, 100, 75, 75], goal: 95, notes: 'Metas continuam sendo atingidas consistentemente.' }, // Avg: 95
                    [Pillar.CHANNELS]: { responses: [100, 100, 100, 100, 100, 100, 100, 75, 75, 75], goal: 90, notes: 'Iniciamos testes com canal de parcerias.' }, // Avg: 93
                    [Pillar.PROCESS]: { responses: [75, 50, 50, 50, 25, 25, 25, 0, 0, 0], goal: 75, notes: 'Primeira versão do playbook de vendas documentada.' }, // Avg: 30
                    [Pillar.METRICS]: { responses: [100, 100, 100, 100, 100, 75, 75, 75, 75, 100], goal: 95, notes: 'Métricas de conversão do funil sendo acompanhadas.' }, // Avg: 90
                    [Pillar.COMPENSATION]: { responses: [75, 75, 75, 50, 50, 50, 25, 25, 0, 0], goal: 80, notes: 'Iniciada discussão para revisão do plano de comissão.' }, // Avg: 45
                    [Pillar.SYSTEMS]: { responses: [100, 75, 75, 75, 50, 50, 50, 25, 0, 0], goal: 85, notes: 'Treinamento de CRM realizado, adoção aumentou 20%.' }, // Avg: 50
                },
                overallMaturity: 67, // Recalculated
            }
        ],
        deliverables: [],
        weeklyPlans: [],
        clientInfo: {
            ...DEFAULT_CLIENT_INFO,
            basic: {
                ...DEFAULT_CLIENT_INFO.basic,
                questions: [
                    { ...DEFAULT_CLIENT_INFO.basic.questions[0], answer: 'Nexus Corp'},
                    { ...DEFAULT_CLIENT_INFO.basic.questions[1], answer: 'Tecnologia B2B'},
                    { ...DEFAULT_CLIENT_INFO.basic.questions[2], answer: '250 funcionários'},
                    { ...DEFAULT_CLIENT_INFO.basic.questions[3], answer: 'São Paulo, SP'},
                ]
            }
        },
    }
];