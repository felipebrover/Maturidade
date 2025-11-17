import { Pillar, ClientInfoData, ClientInfoSectionId, Client, User, View, Journey, WeeklyPlan } from './types';
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
        'A empresa possui missão, visão e valores formalizados e comunicados?',
        'Existe posicionamento estratégico claro (ICP e proposta de valor)?',
        'A liderança e o time conhecem o ICP e as red flags?',
        'Existe visão de longo prazo (12-24 meses)?',
        'Estratégia comercial alinhada ao plano global?',
        'Objetivos claros de expansão (faturamento, base, mercado)?',
        'Discurso comercial coerente com a proposta de valor?',
        'Cultura comercial reflete os valores da empresa?',
        'Decisões baseadas na estratégia (não em urgência)?',
        'Existe revisão estratégica anual?',
    ],
    [Pillar.GOALS]: [
        'Metas formalizadas e documentadas?',
        'Metas desdobradas por área e indivíduo?',
        'Metas baseadas em dados (histórico, CAC, LTV)?',
        'Acompanhamento regular (reuniões, dashboards)?',
        'Ajustes de rota quando necessário?',
        'Previsibilidade de receita (forecast)?',
        'Equipe entende as metas e como atingi-las?',
        'Revisão frequente entre gestor e time?',
        'Visibilidade em tempo real dos resultados?',
        'Metas qualitativas (margem, retenção)?',
    ],
    [Pillar.CHANNELS]: [
        'Empresa opera múltiplos canais (indicação, digital, outbound)?',
        'Processos claros por canal (funil, script, cadência)?',
        'Controle de CAC por canal?',
        'Planeamento e orçamento de mídia definidos?',
        'Acompanhamento de ROI por canal?',
        'Revisão periódica de performance (mensal/trimestral)?',
        'Teste ativo de novos canais?',
        'Marketing e vendas reúnem-se para alinhar performance?',
        'Integração marketing <> vendas <> CS?',
        'Funil contempla aquisição, ativação e retenção?',
    ],
    [Pillar.PROCESS]: [
        'Existem playbooks formalizados (vendas, onboarding, marketing)?',
        'Playbooks revisados periodicamente?',
        'Time aplica os playbooks no dia a dia?',
        'Processos mapeados para cada etapa do funil?',
        'Responsáveis claros pela manutenção dos processos?',
        'Processos acessíveis e padronizados?',
        'Automação existente (CRM, e-mails, relatórios)?',
        'Indicadores de eficiência por etapa do funil?',
        'Time participa na revisão e melhoria dos processos?',
        'Controle de qualidade na execução comercial?',
    ],
    [Pillar.METRICS]: [
        'Indicadores definidos por área e pessoa?',
        'Metas trimestrais e histórico de longo prazo?',
        'Acompanhamento regular (reuniões, relatórios)?',
        'Indicadores conectados à estratégia global?',
        'Liderança toma decisões com base nos dados?',
        'Time entende e age sobre os indicadores?',
        'Indicadores de produtividade claros?',
        'Indicadores de resultado (faturamento, conversão, churn)?',
        'Dados centralizados (painel único, BI)?',
        'Governança de dados com responsável definido?',
    ],
    [Pillar.COMPENSATION]: [
        'Modelo de remuneração formalizado (fixo + variável)?',
        'Remuneração alinhada às metas e resultados?',
        'Progressão de carreira definida?',
        'Sistema de comissão compreendido pelo time?',
        'Revisões periódicas da política de remuneração?',
        'Rotinas de feedback e acompanhamento (1:1, PDI)?',
        'Avaliação da liderança baseada em performance?',
        'Plano de sucessão e formação de líderes?',
        'Cultura de reconhecimento ativa?',
        'Estímulo ao desenvolvimento técnico e comportamental?',
    ],
    [Pillar.SYSTEMS]: [
        'Sistemas utilizados (CRM, ERP, BI, automação)?',
        'Uso padronizado entre os usuários?',
        'Integração entre sistemas (CRM <> Marketing <> Financeiro <> CS)?',
        'Responsável técnico designado?',
        'Revisão tecnológica regular?',
        'Time treinado para uso eficiente?',
        'Comercial acompanha CAC, LTV, ROI, ROE?',
        'Controlo de payback e margem de contribuição por canal?',
        'Forecast preciso e atualizado?',
        'Decisões comerciais baseadas em dados financeiros?',
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

export const CLIENT_ACCESSIBLE_VIEWS: { id: View; label: string }[] = [
    { id: 'dashboard', label: 'Dashboard' },
    { id: 'evolution', label: 'Evolução' },
    { id: 'timeline', label: 'Timeline' },
    { id: 'library', label: 'Biblioteca' },
    { id: 'planning', label: 'Planejamento' },
    { id: 'chatbot', label: 'Chat IA' },
];

export const INITIAL_USERS: User[] = [
    {
        id: 'user-admin-default',
        username: 'admin',
        password: 'master',
        role: 'admin',
    },
];

// --- ÍNTEGRO DATA ---

const integroJourneys: Journey[] = [
    {
        id: 'j-integro-1',
        name: "Planejamento Trimestral Íntegro (Nov/24 - Jan/25)",
        color: '#8b5cf6', // Violet
        objectives: [
            {
                id: 'o-integro-1',
                name: "O1 – Bater 2.000 placas até 31/01",
                keyResults: [
                    { id: 'k-integro-1-1', name: "Atingir 23-28 novos leads/dia por vendedor (Realista)", progress: 0, initiatives: [
                        {
                            id: 'i-integro-1-1', name: "Acelerar Geração de Leads", actions: [
                                { id: 'a-integro-1', name: "Ativar IA para SDR/BDR", isCompleted: false, isInKanban: true },
                                { id: 'a-integro-2', name: "Rodar campanha de Tráfego Pago (Novembro)", isCompleted: false, isInKanban: false },
                                { id: 'a-integro-3', name: "Rodar campanha de Tráfego Pago (Dezembro)", isCompleted: false, isInKanban: false },
                                { id: 'a-integro-4', name: "Rodar campanha de Tráfego Pago (Janeiro)", isCompleted: false, isInKanban: false },
                            ]
                        },
                        {
                            id: 'i-integro-1-2', name: "Otimizar Processo de Vendas", actions: [
                                { id: 'a-integro-5', name: "Implementar rituais diários e semanais de OKR", isCompleted: false, isInKanban: true },
                                { id: 'a-integro-6', name: "Realizar auditoria de CRM 2x/dia", isCompleted: false, isInKanban: false },
                            ]
                        },
                    ] },
                    { id: 'k-integro-1-2', name: "Realizar 80-120 Follow-ups/dia (Realista)", progress: 0, initiatives: [] },
                    { id: 'k-inteгро-1-3', name: "Gerar 10-12 Indicações/semana (Realista)", progress: 0, initiatives: [] },
                    { id: 'k-integro-1-4', name: "Realizar 4-5 Reativações/semana (Realista)", progress: 0, initiatives: [] },
                    { id: 'k-integro-1-5', name: "Realizar 1 prospecção ativa com orçamento/dia (Realista)", progress: 0, initiatives: [] },
                    { id: 'k-integro-1-6', name: "Manter conversão semanal em 14,7% (Realista)", progress: 0, initiatives: [] },
                ],
            },
            {
                id: 'o-integro-2',
                name: "O2 — Garantir disciplina operacional e previsibilidade",
                keyResults: [
                     { id: 'k-integro-2-1', name: "Implementar ritual diário (15’) e semanal (45’)", progress: 0, initiatives: [
                        {
                            id: 'i-integro-2-1', name: "Implementar Rituais de Gestão", actions: [
                                { id: 'a-integro-7', name: "Estruturar e iniciar ritual diário (daily)", isCompleted: false, isInKanban: true },
                                { id: 'a-integro-8', name: "Estruturar e iniciar ritual semanal", isCompleted: false, isInKanban: true },
                            ]
                        },
                     ] },
                     { id: 'k-integro-2-2', name: "Acompanhar KPIs diariamente", progress: 0, initiatives: [] },
                     { id: 'k-integro-2-3', name: "Manter SLA de resposta ≤ 5 min", progress: 0, initiatives: [] },
                     { id: 'k-integro-2-4', name: "Realizar auditoria do CRM 2x/dia", progress: 0, initiatives: [
                        {
                            id: 'i-integro-2-2', name: "Garantir Qualidade de Dados no CRM", actions: [
                                { id: 'a-integro-9', name: "Definir processo de auditoria do CRM", isCompleted: false, isInKanban: true },
                                { id: 'a-integro-10', name: "Executar auditorias diárias do CRM", isCompleted: false, isInKanban: true },
                            ]
                        },
                     ] },
                     { id: 'k-integro-2-5', name: "Gerar relatório quinzenal de conversão", progress: 0, initiatives: [] },
                     { id: 'k-integro-2-6', name: "Garantir operação no cenário realista diariamente", progress: 0, initiatives: [] },
                ],
            },
            {
                id: 'o-integro-3',
                name: "O3 — Garantir demanda contínua, nutrição e aumento de LTV",
                keyResults: [
                    { id: 'k-integro-3-1', name: "Manter CPL ≤ R$ 8,00", progress: 0, initiatives: [
                        {
                            id: 'i-integro-3-1', name: "Estruturar Marketing Digital", actions: [
                                { id: 'a-integro-11', name: "Configurar RD Station Marketing", isCompleted: false, isInKanban: true },
                                { id: 'a-integro-12', name: "Criar 2 novos criativos para campanha", isCompleted: false, isInKanban: true },
                                { id: 'a-integro-13', name: "Criar públicos Lookalike e Retargeting", isCompleted: false, isInKanban: true },
                                { id: 'a-integro-14', name: "Desenvolver painel de métricas de marketing", isCompleted: false, isInKanban: true },
                                { id: 'a-integro-20', name: "Criar 3 novos criativos para teste A/B", isCompleted: false, isInKanban: true },
                            ]
                        },
                    ] },
                    { id: 'k-integro-3-2', name: "Implementar 4 fluxos automatizados de nutrição", progress: 0, initiatives: [
                        {
                            id: 'i-integro-3-2', name: "Implementar Nutrição e Retenção", actions: [
                                { id: 'a-integro-15', name: "Configurar fluxo de nutrição inicial", isCompleted: false, isInKanban: true },
                                { id: 'a-integro-16', name: "Configurar 2 fluxos no RD Station (Semana 2)", isCompleted: false, isInKanban: true },
                                { id: 'a-integro-17', name: "Configurar 2 fluxos no RD Station (Semana 3)", isCompleted: false, isInKanban: true },
                                { id: 'a-integro-18', name: "Planejar reimpacto da base para Janeiro", isCompleted: false, isInKanban: true },
                                { id: 'a-integro-19', name: "Criar conteúdo social de autoridade", isCompleted: false, isInKanban: true },
                                { id: 'a-integro-21', name: "Realizar primeira reativação quinzenal via RD Station", isCompleted: false, isInKanban: true },
                            ]
                        },
                    ] },
                    { id: 'k-integro-3-3', name: "Testar 2 criativos novos por semana (A/B)", progress: 0, initiatives: [] },
                    { id: 'k-integro-3-4', name: "Realizar reativação quinzenal via RD Station", progress: 0, initiatives: [] },
                    { id: 'k-integro-3-5', name: "Aumentar % de leads de canais não pagos", progress: 0, initiatives: [] },
                    { id: 'k-integro-3-6', name: "Criar públicos Lookalike + Retarget", progress: 0, initiatives: [] },
                    { id: 'k-integro-3-7', name: "Criar painel de CAC, CPL, ROI e LTV", progress: 0, initiatives: [] },
                ],
            },
        ]
    }
];

export const DUMMY_CLIENTS_DATA: Client[] = [
    {
        id: 'client-integro',
        name: 'Íntegro Proteção Veicular',
        logoUrl: '',
        onboardingDate: new Date(new Date().setDate(new Date().getDate() - 9)).toISOString(),
        assessments: [
            {
                id: 'assessment-integro-1',
                date: new Date(new Date().setDate(new Date().getDate() - 14)).toISOString(),
                scores: {
                    [Pillar.STRATEGY]: { responses: [0, 0, 0, 0, 0, 25, 0, 0, 0, 0], goal: 80, notes: 'Falta de estratégia e direcionamento claros.' },
                    [Pillar.GOALS]: { responses: [0, 0, 0, 25, 50, 50, 0, 25, 100, 50], goal: 80, notes: 'Metas existem, mas não são bem planejadas ou desdobradas.' },
                    [Pillar.CHANNELS]: { responses: [50, 0, 0, 0, 25, 0, 0, 0, 0, 25], goal: 80, notes: 'Ações isoladas com influenciador, mas sem processos para converter leads.' },
                    [Pillar.PROCESS]: { responses: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0], goal: 80, notes: 'Completa falta de processos e playbooks.' },
                    [Pillar.METRICS]: { responses: [0, 0, 0, 0, 0, 0, 0, 25, 0, 0], goal: 80, notes: 'Falta de cultura de dados e acompanhamento de KPIs.' },
                    [Pillar.COMPENSATION]: { responses: [0, 0, 0, 100, 0, 0, 0, 0, 50, 25], goal: 80, notes: 'Estrutura de remuneração e desenvolvimento de liderança incipiente.' },
                    [Pillar.SYSTEMS]: { responses: [25, 0, 0, 100, 100, 25, 0, 0, 0, 0], goal: 80, notes: 'Sistemas e dados desorganizados.' },
                },
                overallMaturity: 13,
            },
            {
                id: 'assessment-integro-2',
                date: new Date(new Date().setDate(new Date().getDate() - 7)).toISOString(),
                scores: {
                    [Pillar.STRATEGY]: { responses: [0, 100, 0, 0, 0, 25, 0, 0, 0, 0], goal: 80, notes: 'Progresso com a definição do ICP.' },
                    [Pillar.GOALS]: { responses: [0, 0, 0, 25, 50, 50, 0, 25, 100, 50], goal: 80, notes: 'Metas existem, mas não são bem planejadas ou desdobradas.' },
                    [Pillar.CHANNELS]: { responses: [50, 0, 0, 0, 25, 0, 0, 0, 0, 25], goal: 80, notes: 'Ações isoladas com influenciador, mas sem processos para converter leads.' },
                    [Pillar.PROCESS]: { responses: [50, 0, 0, 50, 0, 0, 0, 0, 0, 0], goal: 80, notes: 'Início da formalização com a prévia do Playbook de Vendas.' },
                    [Pillar.METRICS]: { responses: [0, 0, 0, 0, 0, 0, 0, 25, 0, 0], goal: 80, notes: 'Falta de cultura de dados e acompanhamento de KPIs.' },
                    [Pillar.COMPENSATION]: { responses: [0, 0, 0, 100, 0, 0, 0, 0, 50, 25], goal: 80, notes: 'Estrutura de remuneração e desenvolvimento de liderança incipiente.' },
                    [Pillar.SYSTEMS]: { responses: [25, 0, 0, 100, 100, 25, 0, 0, 0, 0], goal: 80, notes: 'Sistemas e dados desorganizados.' },
                },
                overallMaturity: 16,
            },
            {
                id: 'assessment-integro-3',
                date: new Date().toISOString(),
                scores: {
                    [Pillar.STRATEGY]: { responses: [0, 100, 0, 0, 0, 25, 0, 0, 0, 0], goal: 80, notes: 'Estratégia consolidada com ICP e Playbook.' },
                    [Pillar.GOALS]: { responses: [50, 50, 25, 50, 50, 50, 25, 25, 50, 25], goal: 80, notes: 'Prévia do Planejamento Trimestral apresentada, definindo metas e rituais.' },
                    [Pillar.CHANNELS]: { responses: [50, 50, 0, 0, 25, 0, 0, 0, 50, 25], goal: 80, notes: 'Playbook definiu processos claros, scripts e cadências para os canais.' },
                    [Pillar.PROCESS]: { responses: [100, 50, 50, 50, 50, 50, 50, 0, 0, 0], goal: 80, notes: 'Playbook de Vendas completo entregue, formalizando e padronizando processos.' },
                    [Pillar.METRICS]: { responses: [0, 0, 0, 0, 0, 0, 0, 25, 0, 0], goal: 80, notes: 'Ainda sem avanço significativo, aguardando implementação do CRM.' },
                    [Pillar.COMPENSATION]: { responses: [0, 0, 0, 100, 0, 0, 0, 0, 50, 25], goal: 80, notes: 'Estrutura de remuneração e desenvolvimento de liderança incipiente.' },
                    [Pillar.SYSTEMS]: { responses: [25, 50, 50, 100, 100, 25, 0, 0, 0, 0], goal: 80, notes: 'Implementação parcial do CRM iniciada, funil customizado.' },
                },
                overallMaturity: 24,
            },
        ],
        deliverables: [],
        weeklyPlans: [],
        clientInfo: {
            summary: {
                title: 'Resumo Executivo',
                questions: [
                    { id: 's1', question: 'Qual é a descrição geral do cliente e seu principal negócio?', answer: 'Íntegro Proteção Veicular é uma empresa de proteção veicular, com foco principal (carro-chefe) em motos populares.', isDefault: true, attachments: [] },
                    { id: 's2', question: 'Qual o principal problema que a nossa solução resolve para ele?', answer: 'A Íntegro oferece segurança e tranquilidade contra roubo, furto, acidentes e imprevistos. Para quem já possui proteção, busca oferecer melhorias no serviço (suporte, reboque), na cobertura do plano e/ou um valor mais justo.', isDefault: true, attachments: [] },
                ],
            },
            basic: {
                title: 'Dados Básicos',
                questions: [
                    { id: 'b1', question: 'Nome da Empresa', answer: 'Íntegro Proteção Veicular', isDefault: true, attachments: [] },
                    { id: 'b2', question: 'Setor de Atuação', answer: 'Proteção Veicular', isDefault: true, attachments: [] },
                    { id: 'b3', question: 'Tamanho da Empresa (nº de funcionários)', answer: '', isDefault: true, attachments: [] },
                    { id: 'b4', question: 'Localização (Sede)', answer: '', isDefault: true, attachments: [] },
                ],
            },
            metrics: { title: 'Métricas Principais', questions: DEFAULT_CLIENT_INFO.metrics.questions },
            funnel: { title: 'Funil de Vendas', questions: DEFAULT_CLIENT_INFO.funnel.questions },
            competitors: {
                title: 'Concorrentes',
                questions: [
                    { id: 'c1', question: 'Quem são os principais concorrentes?', answer: 'VIPSE e VIPSeg.', isDefault: true, attachments: [] },
                    { id: 'c2', question: 'Quais são os nossos principais diferenciais competitivos na visão deles?', answer: 'Atualmente, operam dentro dos padrões de qualidade do mercado. A Proposta de Valor Única (PUV) ainda será desenvolvida durante a consultoria.', isDefault: true, attachments: [] },
                ],
            },
            materials: { title: 'Materiais de Apoio', questions: DEFAULT_CLIENT_INFO.materials.questions },
            background: {
                title: 'Histórico e Desafios',
                questions: [
                    { id: 'bg1', question: 'Qual a história da empresa?', answer: '', isDefault: true, attachments: [] },
                    { id: 'bg2', question: 'Quais foram os principais desafios que os levaram a nos contratar?', answer: 'O cliente percebe que está "deixando muito dinheiro na mesa" devido à completa falta de uma estrutura comercial organizada. Ações de marketing isoladas (contrato com influenciador, início de tráfego pago) geraram leads, mas a falta de processos comerciais resultou em atendimento lento, muitos leads perdidos no follow-up e incapacidade de converter a demanda gerada.', isDefault: true, attachments: [] },
                ],
            },
            goals: {
                title: 'Objetivos',
                questions: [
                    { id: 'g1', question: 'Quais são as metas de curto, médio e longo prazo do cliente?', answer: 'Atingir 1.000 novas placas até Dezembro/2025. O sucesso da consultoria será medido pela evolução semanal/mensal da pontuação de maturidade, com o objetivo de ultrapassar 80% em todos os pilares.', isDefault: true, attachments: [] },
                    { id: 'g2', question: 'Qual é o roadmap de produto/serviço deles?', answer: '', isDefault: true, attachments: [] },
                ],
            },
            contacts: {
                title: 'Contatos Chave',
                questions: [
                    { id: 'ct1', question: 'Quem é o principal decisor? (Nome, Cargo, Contato)', answer: 'Alex', isDefault: true, attachments: [] },
                    { id: 'ct2', question: 'Quem é o principal ponto de contato no dia-a-dia? (Nome, Cargo, Contato)', answer: 'Alex', isDefault: true, attachments: [] },
                ],
            },
        },
        chatSessions: [],
        journeys: integroJourneys,
    },
    {
        id: 'client-cj',
        name: 'CJ Consultoria Financeira',
        logoUrl: '',
        onboardingDate: new Date(new Date().setDate(new Date().getDate() - 1)).toISOString(),
        assessments: [
            {
                id: 'assessment-cj-1',
                date: new Date(new Date().setDate(new Date().getDate() - 1)).toISOString(),
                scores: {
                    [Pillar.STRATEGY]: { responses: [100, 75, 0, 50, 50, 50, 75, 75, 0, 0], goal: 80, notes: '' },
                    [Pillar.GOALS]: { responses: [100, 100, 0, 75, 0, 0, 100, 100, 0, 0], goal: 80, notes: '' },
                    [Pillar.CHANNELS]: { responses: [0, 25, 100, 100, 0, 0, 0, 50, 0, 50], goal: 80, notes: '' },
                    [Pillar.PROCESS]: { responses: [0, 0, 0, 50, 0, 0, 100, 0, 0, 100], goal: 80, notes: '' },
                    [Pillar.METRICS]: { responses: [25, 25, 25, 0, 100, 25, 0, 100, 0, 100], goal: 80, notes: '' },
                    [Pillar.COMPENSATION]: { responses: [0, 0, 0, 100, 0, 75, 100, 0, 100, 100], goal: 80, notes: '' },
                    [Pillar.SYSTEMS]: { responses: [100, 0, 0, 100, 100, 100, 0, 25, 0, 50], goal: 80, notes: '' },
                },
                overallMaturity: 41,
            },
            {
                id: 'assessment-cj-2',
                date: new Date().toISOString(),
                scores: {
                    [Pillar.STRATEGY]: { responses: [100, 100, 25, 75, 50, 50, 100, 75, 0, 0], goal: 80, notes: 'ICP completo forneceu clareza estratégica, mas o conhecimento ainda precisa ser disseminado para o time.' },
                    [Pillar.GOALS]: { responses: [100, 100, 0, 75, 50, 0, 100, 100, 0, 0], goal: 80, notes: 'Início da preparação para o planejamento trimestral.' },
                    [Pillar.CHANNELS]: { responses: [0, 25, 100, 100, 0, 0, 0, 50, 0, 50], goal: 80, notes: '' },
                    [Pillar.PROCESS]: { responses: [25, 25, 0, 75, 0, 25, 100, 0, 0, 100], goal: 80, notes: 'Estrutura inicial do Playbook de Vendas criada, formalizando processos empíricos.' },
                    [Pillar.METRICS]: { responses: [25, 25, 25, 0, 100, 25, 0, 100, 0, 100], goal: 80, notes: '' },
                    [Pillar.COMPENSATION]: { responses: [0, 0, 0, 100, 0, 75, 100, 0, 100, 100], goal: 80, notes: '' },
                    [Pillar.SYSTEMS]: { responses: [100, 0, 0, 100, 100, 100, 0, 25, 0, 50], goal: 80, notes: '' },
                },
                overallMaturity: 45,
            }
        ],
        deliverables: [],
        weeklyPlans: [],
        clientInfo: {
            summary: {
                title: 'Resumo Executivo',
                questions: [
                    { id: 's1', question: 'Qual é a descrição geral do cliente e seu principal negócio?', answer: 'CJ Consultoria Financeira é uma empresa especializada em renegociação de dívidas (extrajudicial). O carro-chefe é o financiamento de veículo.', isDefault: true, attachments: [] },
                    { id: 's2', question: 'Qual o principal problema que a nossa solução resolve para ele?', answer: 'Reduzir a dívida do cliente em até 80% de desconto, ajudando-os a sair de juros abusivos, limpar o nome, reduzir parcelas ou quitar a dívida mais rápido.', isDefault: true, attachments: [] },
                ],
            },
            basic: {
                title: 'Dados Básicos',
                questions: [
                    { id: 'b1', question: 'Nome da Empresa', answer: 'CJ Consultoria Financeira', isDefault: true, attachments: [] },
                    { id: 'b2', question: 'Setor de Atuação', answer: 'Consultoria Financeira / Renegociação de Dívidas', isDefault: true, attachments: [] },
                    { id: 'b3', question: 'Tamanho da Empresa (nº de funcionários)', answer: '', isDefault: true, attachments: [] },
                    { id: 'b4', question: 'Localização (Sede)', answer: '', isDefault: true, attachments: [] },
                ],
            },
            metrics: {
                 title: 'Métricas Principais',
                questions: [
                    { id: 'm1', question: 'Receita Anual (faturamento)', answer: 'Meta de faturamento de R$ 600k para Nov + Dez.', isDefault: true, attachments: [] },
                    { id: 'm2', question: 'Taxa de Crescimento Anual (%)', answer: '', isDefault: true, attachments: [] },
                    { id: 'm3', question: 'Principais KPIs que eles acompanham', answer: '', isDefault: true, attachments: [] },
                ],
            },
            funnel: { title: 'Funil de Vendas', questions: DEFAULT_CLIENT_INFO.funnel.questions },
            competitors: {
                title: 'Concorrentes',
                questions: [
                    { id: 'c1', question: 'Quem são os principais concorrentes?', answer: 'Nacional G3, 7 Capital, Consult.', isDefault: true, attachments: [] },
                    { id: 'c2', question: 'Quais são os nossos principais diferenciais competitivos na visão deles?', answer: 'Quantidade de resultados positivos, alto volume de indicações, atendimento personalizado, transparência e segurança.', isDefault: true, attachments: [] },
                ],
            },
            materials: { title: 'Materiais de Apoio', questions: DEFAULT_CLIENT_INFO.materials.questions },
            background: {
                title: 'Histórico e Desafios',
                questions: [
                    { id: 'bg1', question: 'Qual a história da empresa?', answer: '', isDefault: true, attachments: [] },
                    { id: 'bg2', question: 'Quais foram os principais desafios que os levaram a nos contratar?', answer: 'O desafio principal é interno e estratégico: 1. Definir metas de vendas baseadas na saúde financeira da empresa. 2. Ajustar o caixa para garantir pagamento de metas e bonificações. 3. Organizar cargos de liderança. 4. Planejar a expansão (abertura de filiais) de forma estruturada.', isDefault: true, attachments: [] },
                ],
            },
            goals: {
                title: 'Objetivos',
                questions: [
                    { id: 'g1', question: 'Quais são as metas de curto, médio e longo prazo do cliente?', answer: 'Objetivo em 90 dias: 1. Ter um planejamento para abrir novas filiais "de forma inteligente". 2. Criar campanhas de marketing "assertivas" para aumentar a quantidade de leads.', isDefault: true, attachments: [] },
                    { id: 'g2', question: 'Qual é o roadmap de produto/serviço deles?', answer: '', isDefault: true, attachments: [] },
                ],
            },
            contacts: {
                title: 'Contatos Chave',
                questions: [
                    { id: 'ct1', question: 'Quem é o principal decisor? (Nome, Cargo, Contato)', answer: 'Francisco (Diretor Geral) | 81 99527-3613', isDefault: true, attachments: [] },
                    { id: 'ct2', question: 'Quem é o principal ponto de contato no dia-a-dia? (Nome, Cargo, Contato)', answer: 'Ítalo (Gerente Comercial) | 81 98335-7456', isDefault: true, attachments: [] },
                ],
            },
        },
        chatSessions: [],
        // FIX: Added missing 'journeys' property to satisfy the Client type.
        journeys: [],
    },
    {
        id: 'client-paggpix',
        name: 'Paggpix',
        logoUrl: '',
        onboardingDate: new Date(new Date().setDate(new Date().getDate() - 2)).toISOString(),
        assessments: [
            {
                id: 'assessment-paggpix-1',
                date: new Date().toISOString(),
                scores: {
                    [Pillar.STRATEGY]: { responses: [100, 0, 0, 50, 50, 100, 0, 100, 50, 75], goal: 80, notes: '' },
                    [Pillar.GOALS]: { responses: [100, 100, 75, 100, 100, 100, 100, 100, 100, 75], goal: 80, notes: '' },
                    [Pillar.CHANNELS]: { responses: [0, 100, 100, 0, 0, 0, 25, 0, 50, 100], goal: 80, notes: '' },
                    [Pillar.PROCESS]: { responses: [0, 0, 0, 50, 100, 75, 25, 50, 50, 100], goal: 80, notes: '' },
                    [Pillar.METRICS]: { responses: [0, 100, 100, 0, 100, 0, 0, 50, 100, 100], goal: 80, notes: '' },
                    [Pillar.COMPENSATION]: { responses: [100, 100, 0, 100, 100, 50, 0, 0, 100, 100], goal: 80, notes: '' },
                    [Pillar.SYSTEMS]: { responses: [100, 100, 0, 0, 100, 0, 0, 50, 100, 100], goal: 80, notes: '' },
                },
                overallMaturity: 58,
            },
        ],
        deliverables: [],
        weeklyPlans: [],
        clientInfo: JSON.parse(JSON.stringify(DEFAULT_CLIENT_INFO)),
        chatSessions: [],
        diagnosticSummary: '',
        journeys: [],
    },
    {
        id: 'client-bs-seguros',
        name: 'BS Seguros',
        logoUrl: '',
        onboardingDate: new Date(new Date().setDate(new Date().getDate() - 1)).toISOString(),
        assessments: [
            {
                id: 'assessment-bs-seguros-1',
                date: new Date().toISOString(),
                scores: {
                    [Pillar.STRATEGY]: { responses: [100, 100, 75, 25, 0, 0, 100, 100, 100, 75], goal: 80, notes: '' },
                    [Pillar.GOALS]: { responses: [100, 100, 100, 100, 100, 50, 100, 100, 100, 100], goal: 80, notes: '' },
                    [Pillar.CHANNELS]: { responses: [100, 100, 100, 25, 100, 100, 75, 100, 100, 100], goal: 80, notes: '' },
                    [Pillar.PROCESS]: { responses: [0, 0, 0, 0, 0, 0, 100, 100, 100, 100], goal: 80, notes: '' },
                    [Pillar.METRICS]: { responses: [100, 75, 100, 25, 100, 100, 100, 100, 100, 100], goal: 80, notes: '' },
                    [Pillar.COMPENSATION]: { responses: [100, 100, 0, 100, 0, 50, 100, 25, 100, 100], goal: 80, notes: '' },
                    [Pillar.SYSTEMS]: { responses: [100, 100, 100, 100, 100, 100, 75, 0, 0, 100], goal: 80, notes: '' },
                },
                overallMaturity: 77,
            },
        ],
        deliverables: [],
        weeklyPlans: [],
        clientInfo: JSON.parse(JSON.stringify(DEFAULT_CLIENT_INFO)),
        chatSessions: [],
        diagnosticSummary: '',
        journeys: [],
    }
];