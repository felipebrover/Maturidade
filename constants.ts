
import { Pillar, ClientInfoData, ClientInfoSectionId, Client, User, View, Journey } from './types';
import type { Icon } from 'lucide-react';

// We can't import lucide-react here as it's a value, so we'll pass them as props.
// This file is for data constants.

export const BSLABS_LOGO_BASE64 = `data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wCEAAkGBxISEhUSEhIVFRUVFRUVFRUVFRUVFRUVFRUWFhUVFRUYHSggGBolHRUVITEhJSkrLi4uFx8zODMtNygtLisBCgoKDg0OGxAQGy0lICUtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLf/AABEIAOEA4QMBEQACEQEDEQH/xAAcAAEAAgMBAQEAAAAAAAAAAAAABgcDBAUBAgj/xABFEAACAQMCAwQFBgsIAgMAAAABAgADBBESIQUGMUEHEyJRYXGBkQjSoaKxwfAUIzNCUmJygrLS4RYkQ1Pxg5PC0jVjg//EABgBAQEBAQEAAAAAAAAAAAAAAAABAgME/8QAHxEBAQEBAAMAAgMBAAAAAAAAAAERIQISUQMTMVEE/9oADAMBAAIRAxEAPwDuEREBERAREQEREBERAREQEREBERAREQEREBERAREQEREBERAREQEREBERAREQEREBERAREQEREBERAREQEREBERAREQEREBERAREQEREBERAREQEREBERAREQEREBERAREQEREBERAREQEREBERAREQEREBERAREQEREBERAREQEREBERAREQEREBERAREQEREBERAREQEREBERAREQEREBERAREQEREBERAREQEREBERAREQEREBERAREQEREBERAREQEREBERAREQEREBERAREQEREBERAREQEREBERAREQEREBERAREQEREBERAREQEREBERAREQEREBERAREQEREBERAREQEREBERAREQEREBERAREQEREBERAREQEREBERAREQEREBERAREQEREBERAREQEREBERAREQEREBERAREQEREBERAREQEREBERAREQEREBERAREQEREBERAREQEREBERAREQEREBERAREQEREBERAREQEREBERAREQEREBERAREQEREBERAREQEREBERAREQEREBERAREQEREBERAREQEREBERAREQEREBERAREQEREBERAREQEREBERAREQEREBERAREQEREBERAREQEREBERAREQEREBERAREQEREBERAREQEREBERAREQEREBERAREQEREBERAREQEREBERAREQEREBERAREQEREBERAREQEREBERAREQEREBERAREQEREBERAREQEREBERAREQEREBERAREQEREBERAREQEREBERAREQEREBERAREQEREBERAREQEREBERAREQEREBERAREQEREBERAREQEREBERAREQEREBERAREQEREBERAREQEREBERAREQEREBERAREQEREBERAREQEREBERAREQEREBERAREQEREBERAREQEREBERAREQEREBERAREQEREBERAREQEREBERAREQEREBERAREQEREBERAREQEREBERAREQEREBERAREQEREBERAREQEREBERAREQEREBERAREQEREBERAREQEREBERAREQEREBERAREQEREBERAREQEREBERAREQEREBERAREQEREBERAREQEREBERAREQEREBERAREQEREBERAREQEREBERAREQEREBERAREQEREBERAREQEREBERAREQEREBERAREQEREBERAREQEREBERAREQEREBERAREQEREBERAREQEREBERAREQEREBERAREQEREBERAREQEREBERAREQEREBERAREQEREBERAREQEREBERAREQEREBERAREQEREBERAREQEREBERAREQEREBERAREQEREBERAREQEREBERAREQEREBERAREQEREBERAREQEREBERAREQEREBERAREQEREBERAREQEREBERAREQEREBERAREQEREBERAREQEREBERAREQEREBERAREQEREBERAREQEREBERAREQEREBERAREQEREBERAREQEREBERAREQEREBERAREQEREBERAREQEREBERAREQEREBERAREQEREBERAREQEREBERAREQEREBERAREQEREBERAREQEREBERAREQEREBERAREQEREBERAREQEREBERAREQEREBERAREQEREBERAREQEREBERAREQEREBERAREQEREBERAREQEREBERAREQEREBERAREQEREBERAREQEREBERAREQEREBERAREQEREBERAREQEREBERAREQEREBERAREQEREBERAREQEREBERAREQEREBERAREQEREBERAREQEREBERAREQEREBERAREQEREBERAREQEREBERAREQEREBERAREQEREBERAREQEREBERAREQEREBERAREQEREBERAREQEREBERAREQEREBERAREQEREBERAREQEREBERAREQEREBERAREQEREBERAREQEREBERAREQEREBERAREQEREBERAREQEREBERAREQEREBERAREQEREBERAREQEREBERAREQEREBERAREQEREBERAREQEREBERAREQEREBERAREQEREBERAREQEREBERAREQEREBERAREQEREBERAREQEREBERAREQEREBERAREQEREBERAREQEREBERAREQEREBERAREQEREBERAREQEREBERAREQEREBERAREQEREBERAREQEREBERAREQEREBERAREQEREBERAREQEREBERAREQEREBERAREQEREBERAREQEREBERAREQEREBERAREQEREBERAREQEREBERAREQEREBERAREQEREBERAREQEREBERAREQEREBERAREQEREBERAREQEREBERAREQEREBERAREQEREBERAREQEREBERAREQEREBERAREQEREBERAREQEREBERAREQEREBERAREQEREBERAREQEREBERAREQEREBERAREQEREBERAREQEREBERAREQEREBERAREQEREBERAREQEREBERAREQEREBERAREQEREBERAREQEREBERAREQEREBERAREQEREBERAREQEREBERAREQEREBERAREQEREBERAREQEREBERAREQEREBERAREQEREBERAREQEREBERAREQEREBERAREQEREBERAREQEREBERAREQEREBERAREQEREBERAREQEREBERAREQEREBERAREQEREBERAREQEREBERAREQEREBERAREQEREBERAREQEREBERAREQEREBERAREQEREBERAREQEREBERAREQEREBERAREQEREBERAREQEREBERAREQEREBERAREQEREBERAREQEREBERAREQEREBERAREQEREBERAREQEREBERAREQEREBERAREQEREBERAREQEREBERAREQEREBERAREQEREBERAREQEREBERAREQEREBERAREQEREBERAREQEREBERAREQEREBERAREQEREBERAREQEREBERAREQEREBERAREQEREBERAREQEREBERAREQEREBERAREQEREBERAREQEREBERAREQEREBERAREQEREBERAREQEREBERAREQEREBERAREQEREBERAREQEREBERAREQEREBERAREQEREBERAREQEREBERAREQEREBERAREQEREBERAREQEREBERAREQEREBERAREQEREBERAREQEREBERAREQEREBERAREQEREBERAREQEREBERAREQEREBERAREQEREBERAREQEREBERAREQEREBERAREQEREBERAREQEREBERAREQEREBERAREQEREBERAREQEREBERAREQEREBERAREQEREBERAREQEREBERAREQEREBERAREQEREBERAREQEREBERAREQEREBERAREQEREBERAREQEREBERAREQEREBERAREQEREBERAREQEREBERAREQEREBERAREQEREBERAREQEREBERAREQEREBERAREQEREBERAREQEREBERAREQEREBERAREQEREBERAREQEREBERAREQEREBERAREQEREBERAREQEREBERAREQEREBERAREQEREBERAREQEREBERAREQEREBERAREQEREBERAREQEREBERAREQEREBERAREQEREBERAREQEREBERAREQEREBERAREQEREBERAREQEREBERAREQEREBERAREQEREBERAREQEREBERAREQEREBERAREQEREBERAREQEREBERAREQEREBERAREQEREBERAREQEREBERAREQEREBERAREQEREBERAREQEREBERAREQEREBERAREQEREBERAREQEREBERAREQEREBERAREQEREBERAREQEREBERAREQEREBERAREQEREBERAREQEREBERAREQEREBERAREQEREBERAREQEREBERAREQEREBERAREQEREBERAREQEREBERAREQEREBERAREQEREBERAREQEREBERAREQEREBERAREQEREBERAREQEREBERAREQEREBERAREQEREBERAREQEREBERAREQEREBERAREQEREBERAREQEREBERAREQEREBERAREQEREBERAREQEREBERAREQEREBERAREQEREBERAREQEREBERAREQEREBERAREQEREBERAREQEREBERAREQEREBERAREQEREBERAREQEREBERAREQEREBERAREQEREBERAREQEREBERAREQEREBERAREQEREBERAREQEREBERAREQEREBERAREQEREBERAREQEREBERAREQEREBERAREQEREBERAREQEREBERAREQEREBERAREQEREBERAREQEREBERAREQEREBERAREQEREBERAREQEREBERAREQEREBERAREQEREBERAREQEREBERAREQEREBERAREQEREBERAREQEREBERAREQEREBERAREQEREBERAREQEREBERAREQEREBERAREQEREBERAREQEREBERAREQEREBERAREQEREBERAREQEREBERAREQEREBERAREQEREBERAREQEREBERAREQEREBERAREQEREBERAREQEREBERAREQEREBERAREQEREBERAREQEREBERAREQEREBERAREQEREBERAREQEREBERAREQEREBERAREQEREBERAREQEREBERAREQEREBERAREQEREBERAREQEREBERAREQEREBERAREQEREBERAREQEREBERAREQEREBERAREQEREBERAREQEREBERAREQEREBERAREQEREBERAREQEREBERAREQEREBERAREQEREBERAREQEREBERAREQEREBERAREQEREBERAREQEREBERAREQEREBERAREQEREBERAREQEREBERAREQEREBERAREQEREBERAREQEREBERAREQEREBERAREQEREBERAREQEREBERAREQEREBERAREQEREBERAREQEREBERAREQEREBERAREQEREBERAREQEREBERAREQEREBERAREQEREBERAREQEREBERAREQEREBERAREQEREBERAREQEREBERAREQEREBERAREQEREBERAREQEREBERAREQEREBERAREQEREBERAREQEREBERAREQEREBERAREQEREBERAREQEREBERAREQEREBERAREQEREBERAREQEREBERAREQEREBERAREQEREBERAREQEREBERAREQEREBERAREQEREBERAREQEREBERAREQEREBERAREQEREBERAREQEREBERAREQEREBERAREQEREBERAREQEREBERAREQEREBERAREQEREBERAREQEREBERAREQEREBERAREQEREBERAREQEREBERAREQEREBERAREQEREBERAREQEREBERAREQEREBERAREQEREBERAREQEREBERAREQEREBERAREQEREBERAREQEREBERAREQEREBERAREQEREBERAREQEREBERAREQEREBERAREQEREBERAREQEREBERAREQEREBERAREQEREBERAREQEREBERAREQEREBERAREQEREBERAREQEREBERAREQEREBERAREQEREBERAREQEREBERAREQEREBERAREQEREBERAREQEREBERAREQEREBERAREQEREBERAREQEREBERAREQEREBERAREQEREBERAREQEREBERAREQEREBERAREQEREBERAREQEREBERAREQEREBERAREQEREBERAREQEREBERAREQEREBERAREQEREBERAREQEREBERAREQEREBERAREQEREBERAREQEREBERAREQEREBERAREQEREBERAREQEREBERAREQEREBERAREQEREBERAREQEREBERAREQEREBERAREQEREBERAREQEREBERAREQEREBERAREQEREBERAREQEREBERAREQEREBERAREQEREBERAREQEREBERAREQEREBERAREQEREBERAREQEREBERAREQEREBERAREQEREBERAREQEREBERAREQEREBERAREQEREBERAREQEREBERAREQEREBERAREQEREBERAREQEREBERAREQEREBERAREQEREBERAREQEREBERAREQEREBERAREQEREBERAREQEREBERAREQEREBERAREQEREBERAREQEREBERAREQEREBERAREQEREBERAREQEREBERAREQEREBERAREQEREBERAREQEREBERAREQEREBERAREQEREBERAREQEREBERAREQEREBERAREQEREBERAREQEREBERAREQEREBERAREQEREBERAREQEREBERAREQEREBERAREQEREBERAREQEREBERAREQEREBERAREQEREBERAREQEREBERAREQEREBERAREQEREBERAREQEREBERAREQEREBERAREQEREBERAREQEREBERAREQEREBERAREQEREBERAREQEREBERAREQEREBERAREQEREBERAREQEREBERAREQEREBERAREQEREBERAREQEREBERAREQEREBERAREQEREBERAREQEREBERAREQEREBERAREQEREBERAREQEREBERAREQEREBERAREQEREBERAREQEREBERAREQEREBERAREQEREBERAREQEREBERAREQEREBERAREQEREBERAREQEREBERAREQEREBERAREQEREBERAREQEREBERAREQEREBERAREQEREBERAREQEREBERAREQEREBERAREQEREBERAREQEREBERAREQEREBERAREQEREBERAREQEREBERAREQEREBERAREQEREBERAREQEREBERAREQEREBERAREQEREBERAREQEREBERAREQEREBERAREQEREBERAREQEREBERAREQEREBERAREQEREBERAREQEREBERAREQEREBERAREQEREBERAREQEREBERAREQEREBERAREQEREBERAREQEREBERAREQEREBERAREQEREBERAREQEREBERAREQEREBERAREQEREBERAREQEREBERAREQEREBERAREQEREBERAREQEREBERAREQEREBERAREQEREBERAREQEREBERAREQEREBERAREQEREBERAREQEREBERAREQEREBERAREQEREBERAREQEREBERAREQEREBERAREQEREBERAREQEREBERAREQEREBERAREQEREBERAREQEREBERAREQEREBERAREQEREBERAREQEREBERAREQEREBERAREQEREBERAREQEREBERAREQEREBERAREQEREBERAREQEREBERAREQEREBERAREQEREBERAREQEREBERAREQERE-Zk=`;

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
        'Existe visão de longo prazo (12–24 meses)?',
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

// --- CONSULTING JOURNEY TEMPLATE (12 Weeks) ---
export const CONSULTING_JOURNEY_TEMPLATE: Journey = {
    id: 'journey-consulting-template',
    name: "Inputs Essenciais da Consultoria Comercial (12 semanas)",
    color: '#6366f1', // Indigo
    progress: 0,
    objectives: [
        {
            id: 'obj-pre-proj',
            name: "OBJETIVO 0: Pré-Projeto (Diagnóstico)",
            progress: 0,
            keyResults: [
                {
                    id: 'kr-0-1',
                    name: "Semana 0 – Matriz + Primeiras Informações",
                    progress: 0,
                    initiatives: [
                        {
                            id: 'init-diag',
                            name: "Diagnóstico Inicial",
                            progress: 0,
                            actions: [
                                { id: 'act-matriz', name: "Responder a Matriz de Maturidade", isCompleted: false },
                                { id: 'act-docs', name: "Enviar documentos existentes (scripts, funil, playbook, metas)", isCompleted: false },
                                { id: 'act-crm', name: "Enviar acesso ao CRM (se existir)", isCompleted: false }
                            ]
                        },
                        {
                            id: 'init-context',
                            name: "Contexto Estratégico",
                            progress: 0,
                            actions: [
                                { id: 'act-dores', name: "Descrever principais dores comerciais", isCompleted: false },
                                { id: 'act-prods', name: "Enviar lista completa de produtos/serviços (com preços)", isCompleted: false },
                                { id: 'act-sazo', name: "Informar sazonalidades relevantes", isCompleted: false }
                            ]
                        },
                        {
                            id: 'init-interviews',
                            name: "Organização de Entrevistas",
                            progress: 0,
                            actions: [
                                { id: 'act-def-ent', name: "Definir quem deve ser entrevistado na Semana 1", isCompleted: false }
                            ]
                        }
                    ]
                }
            ]
        },
        {
            id: 'obj-fase-1',
            name: "OBJETIVO 1: Fase 1 — Estruturação (Semanas 1 a 4)",
            progress: 0,
            keyResults: [
                {
                    id: 'kr-1-1',
                    name: "Semana 1 — Alinhamento + ICP/Persona",
                    progress: 0,
                    initiatives: [
                        {
                            id: 'init-expect',
                            name: "Expectativas & Direção",
                            progress: 0,
                            actions: [
                                { id: 'act-one-thing', name: "Se a consultoria entregasse apenas UMA coisa, qual deveria ser?", isCompleted: false },
                                { id: 'act-diff', name: "O que precisa estar diferente ao final de 12 semanas?", isCompleted: false },
                                { id: 'act-prio', name: "O que é prioridade absoluta agora?", isCompleted: false },
                                { id: 'act-dont-want', name: "O que você NÃO quer mais que aconteça no comercial?", isCompleted: false },
                                { id: 'act-pain', name: "Qual é sua maior dor atual?", isCompleted: false },
                                { id: 'act-obj-90', name: "Qual seu objetivo principal para os próximos 90 dias?", isCompleted: false },
                                { id: 'act-vis-12', name: "Qual sua visão para 12 meses?", isCompleted: false }
                            ]
                        },
                        {
                            id: 'init-icp',
                            name: "ICP e Persona",
                            progress: 0,
                            actions: [
                                { id: 'act-desc-icp', name: "Descrever cliente ideal (ICP)", isCompleted: false },
                                { id: 'act-anti-icp', name: "Descrever anti-ICP", isCompleted: false },
                                { id: 'act-best-clients', name: "Listar 5 melhores clientes (+ motivo)", isCompleted: false },
                                { id: 'act-worst-clients', name: "Listar 5 piores clientes (+ motivo)", isCompleted: false },
                                { id: 'act-pain-buy', name: "Listar dores antes da compra", isCompleted: false },
                                { id: 'act-results', name: "Enviar resultados desejados pelo cliente", isCompleted: false },
                                { id: 'act-decision', name: "Descrever como cliente toma decisão", isCompleted: false },
                                { id: 'act-channels', name: "Informar canais onde ICP está", isCompleted: false }
                            ]
                        },
                        {
                            id: 'init-pv',
                            name: "Proposta de Valor e Concorrência",
                            progress: 0,
                            actions: [
                                { id: 'act-prop', name: "Enviar proposta de valor atual", isCompleted: false },
                                { id: 'act-compet', name: "Listar concorrentes diretos", isCompleted: false },
                                { id: 'act-comp-good', name: "Informar o que concorrentes fazem bem", isCompleted: false },
                                { id: 'act-comp-bad', name: "Informar onde concorrentes falham", isCompleted: false }
                            ]
                        }
                    ]
                },
                {
                    id: 'kr-1-2',
                    name: "Semana 2 — Organograma + Mapa de Funções",
                    progress: 0,
                    initiatives: [
                        {
                            id: 'init-struct',
                            name: "Estrutura de Equipe",
                            progress: 0,
                            actions: [
                                { id: 'act-roles', name: "Enviar nome, cargo e função de cada colaborador", isCompleted: false },
                                { id: 'act-report', name: "Enviar cadeia de reporte (quem responde a quem)", isCompleted: false },
                                { id: 'act-dup', name: "Identificar funções duplicadas", isCompleted: false },
                                { id: 'act-decis', name: "Informar quem toma decisões comerciais", isCompleted: false },
                                { id: 'act-auto', name: "Informar quem tem autonomia para descontos/preços", isCompleted: false }
                            ]
                        },
                        {
                            id: 'init-gaps',
                            name: "Lacunas de Equipe",
                            progress: 0,
                            actions: [
                                { id: 'act-missing', name: "Informar funções que deveriam existir, mas não existem", isCompleted: false },
                                { id: 'act-contact', name: "Informar quem fala diretamente com clientes", isCompleted: false }
                            ]
                        }
                    ]
                },
                {
                    id: 'kr-1-3',
                    name: "Semana 3 — Metas + Dados + CRM",
                    progress: 0,
                    initiatives: [
                        {
                            id: 'init-leads',
                            name: "Dados de Leads e Funil",
                            progress: 0,
                            actions: [
                                { id: 'act-vol', name: "Enviar volume de leads dos últimos 3 meses, por canal", isCompleted: false },
                                { id: 'act-invest', name: "Enviar investimento mensal em marketing", isCompleted: false },
                                { id: 'act-cpl', name: "Enviar custo por lead (se existir)", isCompleted: false },
                                { id: 'act-conv', name: "Enviar taxas de conversão por etapa", isCompleted: false },
                                { id: 'act-cycle', name: "Informar ciclo médio de vendas", isCompleted: false },
                                { id: 'act-roi', name: "Informar canal com maior ROI", isCompleted: false }
                            ]
                        },
                        {
                            id: 'init-goals',
                            name: "Metas e Capacidade",
                            progress: 0,
                            actions: [
                                { id: 'act-target', name: "Quantas vendas/mês deseja atingir nos próximos 90 dias?", isCompleted: false },
                                { id: 'act-old-goals', name: "Enviar metas antigas (se existirem)", isCompleted: false },
                                { id: 'act-sazo-2', name: "Informar sazonalidades", isCompleted: false },
                                { id: 'act-cap', name: "Informar capacidade de atendimento por vendedor", isCompleted: false }
                            ]
                        },
                        {
                            id: 'init-crm-week3',
                            name: "CRM",
                            progress: 0,
                            actions: [
                                { id: 'act-which-crm', name: "Informar qual CRM usa (se tiver)", isCompleted: false },
                                { id: 'act-fields', name: "Enviar campos obrigatórios usados hoje", isCompleted: false },
                                { id: 'act-update', name: "Informar como o CRM é atualizado hoje", isCompleted: false }
                            ]
                        }
                    ]
                },
                {
                    id: 'kr-1-4',
                    name: "Semana 4 — Playbook de Vendas",
                    progress: 0,
                    initiatives: [
                        {
                            id: 'init-cases',
                            name: "Casos Reais (Essência do Playbook)",
                            progress: 0,
                            actions: [
                                { id: 'act-convs', name: "Enviar 10 conversas reais (5 boas, 5 ruins)", isCompleted: false },
                                { id: 'act-props', name: "Enviar 3 propostas que fecharam e 3 que não fecharam", isCompleted: false }
                            ]
                        },
                        {
                            id: 'init-funnel',
                            name: "Funil e Abordagem",
                            progress: 0,
                            actions: [
                                { id: 'act-init', name: "Descrever como inicia conversas", isCompleted: false },
                                { id: 'act-qual', name: "Descrever como qualifica leads", isCompleted: false },
                                { id: 'act-pres', name: "Descrever como apresenta o produto", isCompleted: false },
                                { id: 'act-fu', name: "Explicar como faz follow-up hoje", isCompleted: false }
                            ]
                        },
                        {
                            id: 'init-obj',
                            name: "Objeções",
                            progress: 0,
                            actions: [
                                { id: 'act-common', name: "Listar objeções mais comuns", isCompleted: false },
                                { id: 'act-silent', name: "Listar objeções silenciosas (cliente some)", isCompleted: false },
                                { id: 'act-hard', name: "Quais objeções o time não sabe lidar?", isCompleted: false }
                            ]
                        },
                        {
                            id: 'init-acq',
                            name: "Canais de Aquisição",
                            progress: 0,
                            actions: [
                                { id: 'act-inbound', name: "Enviar como chegam leads inbound", isCompleted: false },
                                { id: 'act-outbound', name: "Enviar como chegam leads outbound", isCompleted: false },
                                { id: 'act-indic', name: "Enviar como chegam leads de indicação", isCompleted: false }
                            ]
                        }
                    ]
                }
            ]
        },
        {
            id: 'obj-fase-2',
            name: "OBJETIVO 2: Fase 2 — Governança (Semanas 5 a 8)",
            progress: 0,
            keyResults: [
                {
                    id: 'kr-2-1',
                    name: "Semana 5 — Playbook do Gestor Comercial",
                    progress: 0,
                    initiatives: [
                        {
                            id: 'init-routine',
                            name: "Rotina & Gestão",
                            progress: 0,
                            actions: [
                                { id: 'act-man-rout', name: "Descrever rotina completa do gestor", isCompleted: false },
                                { id: 'act-rituals', name: "Listar rituais atuais de gestão", isCompleted: false },
                                { id: 'act-charge', name: "Informar como gestor cobra metas", isCompleted: false },
                                { id: 'act-track', name: "Informar como gestor acompanha atividades", isCompleted: false },
                                { id: 'act-feed', name: "Informar como gestor dá feedback", isCompleted: false },
                                { id: 'act-diff-man', name: "Informar maiores dificuldades do gestor", isCompleted: false }
                            ]
                        },
                        {
                            id: 'init-tools',
                            name: "Ferramentas e Operações",
                            progress: 0,
                            actions: [
                                { id: 'act-man-tools', name: "Quais ferramentas o gestor usa hoje?", isCompleted: false },
                                { id: 'act-prod', name: "Existe controle de produtividade?", isCompleted: false }
                            ]
                        }
                    ]
                },
                {
                    id: 'kr-2-2',
                    name: "Semana 6 — CS + Onboarding de Funcionários",
                    progress: 0,
                    initiatives: [
                        {
                            id: 'init-cs',
                            name: "Pós-venda (CS)",
                            progress: 0,
                            actions: [
                                { id: 'act-after', name: "Explicar o que acontece após uma venda", isCompleted: false },
                                { id: 'act-onb', name: "Quem faz onboarding do cliente", isCompleted: false },
                                { id: 'act-time', name: "Quanto tempo até o primeiro resultado", isCompleted: false },
                                { id: 'act-churn', name: "Enviar principais motivos de churn", isCompleted: false },
                                { id: 'act-rework', name: "Enviar o que mais gera retrabalho no pós-venda", isCompleted: false }
                            ]
                        },
                        {
                            id: 'init-hr',
                            name: "RH (Onboarding de Funcionários)",
                            progress: 0,
                            actions: [
                                { id: 'act-hire', name: "Como contrata hoje", isCompleted: false },
                                { id: 'act-train', name: "Como treina novos vendedores", isCompleted: false },
                                { id: 'act-mistakes', name: "Piores erros de contratação até hoje", isCompleted: false }
                            ]
                        }
                    ]
                },
                {
                    id: 'kr-2-3',
                    name: "Semana 7 — Cultura de Execução",
                    progress: 0,
                    initiatives: [
                        {
                            id: 'init-agenda',
                            name: "Rotina e Agenda",
                            progress: 0,
                            actions: [
                                { id: 'act-wk-ag', name: "Descrever a agenda semanal atual", isCompleted: false },
                                { id: 'act-meet', name: "Informar reuniões que acontecem hoje", isCompleted: false },
                                { id: 'act-tasks', name: "Listar tarefas indispensáveis do time", isCompleted: false },
                                { id: 'act-waste', name: "Listar tarefas que são desperdício", isCompleted: false },
                                { id: 'act-imped', name: "O que impede execução diária hoje?", isCompleted: false }
                            ]
                        },
                        {
                            id: 'init-behav',
                            name: "Comportamento & Prioridade",
                            progress: 0,
                            actions: [
                                { id: 'act-prio-day', name: "Como o time prioriza o dia?", isCompleted: false },
                                { id: 'act-react', name: "Informar como o time reage a cobrança", isCompleted: false },
                                { id: 'act-perf-day', name: "Descrever o que seria um “dia comercial perfeito”", isCompleted: false }
                            ]
                        }
                    ]
                },
                {
                    id: 'kr-2-4',
                    name: "Semana 8 — Forecast Operacional",
                    progress: 0,
                    initiatives: [
                        {
                            id: 'init-forecast',
                            name: "Previsão e Dados",
                            progress: 0,
                            actions: [
                                { id: 'act-how-fore', name: "Vocês fazem previsão de vendas? Como?", isCompleted: false },
                                { id: 'act-close', name: "Quem fecha os números semanalmente?", isCompleted: false },
                                { id: 'act-kpi-wk', name: "Enviar indicadores acompanhados semanalmente", isCompleted: false },
                                { id: 'act-prev', name: "Quais etapas do funil são mais previsíveis?", isCompleted: false }
                            ]
                        },
                        {
                            id: 'init-vol',
                            name: "Volume e Sazonalidade",
                            progress: 0,
                            actions: [
                                { id: 'act-perc', name: "Qual percentual de oportunidades vira cliente?", isCompleted: false },
                                { id: 'act-sazo-imp', name: "Como sazonalidade impacta as vendas?", isCompleted: false }
                            ]
                        }
                    ]
                }
            ]
        },
        {
            id: 'obj-fase-3',
            name: "OBJETIVO 3: Fase 3 — Aceleração (Semanas 9 a 12)",
            progress: 0,
            keyResults: [
                {
                    id: 'kr-3-1',
                    name: "Semana 9 — Liderança (PDI + 1:1)",
                    progress: 0,
                    initiatives: [
                        {
                            id: 'init-lead-dev',
                            name: "Desenvolvimento dos Líderes",
                            progress: 0,
                            actions: [
                                { id: 'act-list-lead', name: "Listar líderes que participarão do PDI", isCompleted: false },
                                { id: 'act-strong', name: "Listar pontos fortes de cada líder", isCompleted: false },
                                { id: 'act-weak', name: "Listar pontos fracos", isCompleted: false },
                                { id: 'act-obj-lead', name: "Informar objetivos de cada líder", isCompleted: false },
                                { id: 'act-feed-lead', name: "Enviar feedback de liderados sobre os líderes", isCompleted: false }
                            ]
                        }
                    ]
                },
                {
                    id: 'kr-3-2',
                    name: "Semana 10 — Cargos, Trilhas e Remuneração V1",
                    progress: 0,
                    initiatives: [
                        {
                            id: 'init-career',
                            name: "Estrutura de Carreira",
                            progress: 0,
                            actions: [
                                { id: 'act-roles-off', name: "Listar cargos oficiais", isCompleted: false },
                                { id: 'act-levels', name: "Definir níveis (Jr, Pleno, Sênior)", isCompleted: false },
                                { id: 'act-beh-good', name: "Listar comportamentos a serem premiados", isCompleted: false },
                                { id: 'act-beh-bad', name: "Listar comportamentos que NÃO devem ser premiados", isCompleted: false }
                            ]
                        },
                        {
                            id: 'init-rem-v1',
                            name: "Primeira Versão de Remuneração",
                            progress: 0,
                            actions: [
                                { id: 'act-meta-ind', name: "Definir metas individuais por cargo", isCompleted: false }
                            ]
                        }
                    ]
                },
                {
                    id: 'kr-3-3',
                    name: "Semana 11 — Remuneração Final + Auditoria",
                    progress: 0,
                    initiatives: [
                        {
                            id: 'init-audit',
                            name: "Auditoria de Maturidade",
                            progress: 0,
                            actions: [
                                { id: 'act-imp', name: "O que melhorou desde a Semana 0?", isCompleted: false },
                                { id: 'act-not-work', name: "O que ainda não funciona?", isCompleted: false }
                            ]
                        },
                        {
                            id: 'init-rem-v2',
                            name: "Remuneração V2",
                            progress: 0,
                            actions: [
                                { id: 'act-rem-ok', name: "O que funcionou na remuneração V1?", isCompleted: false },
                                { id: 'act-rem-fail', name: "O que não funcionou?", isCompleted: false },
                                { id: 'act-rem-perf', name: "O que falta para remuneração ficar “perfeita”?", isCompleted: false }
                            ]
                        }
                    ]
                },
                {
                    id: 'kr-3-4',
                    name: "Semana 12 — Roadmap 12–24 meses",
                    progress: 0,
                    initiatives: [
                        {
                            id: 'init-plan',
                            name: "Planejamento Futuro",
                            progress: 0,
                            actions: [
                                { id: 'act-where', name: "Onde quer estar em 12 meses?", isCompleted: false },
                                { id: 'act-exp', name: "Quais produtos/serviços quer expandir?", isCompleted: false },
                                { id: 'act-size', name: "Qual deve ser o tamanho ideal do time?", isCompleted: false },
                                { id: 'act-mon-goal', name: "Qual meta mensal deseja atingir?", isCompleted: false }
                            ]
                        },
                        {
                            id: 'init-cont',
                            name: "Continuidade",
                            progress: 0,
                            actions: [
                                { id: 'act-roadmap', name: "O que não deu tempo de construir e precisa entrar no roadmap?", isCompleted: false },
                                { id: 'act-review', name: "Quais processos devem ser revisados trimestralmente?", isCompleted: false }
                            ]
                        }
                    ]
                }
            ]
        }
    ]
};

// --- ÍNTEGRO DATA (UPDATED WITH NEW JOURNEY) ---

const integroJourneys: Journey[] = [
    JSON.parse(JSON.stringify(CONSULTING_JOURNEY_TEMPLATE))
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
        clientInfo: JSON.parse(JSON.stringify(DEFAULT_CLIENT_INFO)),
        chatSessions: [],
        diagnosticSummary: '',
        journeys: [],
    }
];
