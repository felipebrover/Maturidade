import { GoogleGenAI } from "@google/genai";
import type { Client, Assessment, Pillar, Deliverable, PillarScores } from '../types';
import { PILLARS, PILLAR_DATA } from '../constants';
import { calculatePillarScore, calculateOverallMaturity } from '../utils';

// Fix: Per Gemini API guidelines, initialize the SDK with process.env.API_KEY.
// This also resolves the TypeScript error related to 'import.meta.env'.
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const formatAssessmentData = (assessment: Assessment) => {
    let result = `Data: ${new Date(assessment.date).toLocaleDateString('pt-BR')}\n`;
    result += `Maturidade Geral: ${assessment.overallMaturity}%\n`;
    for (const pillar of PILLARS) {
        const pillarName = PILLAR_DATA[pillar].name;
        const pillarScore = calculatePillarScore(assessment.scores[pillar].responses);
        result += `- ${pillarName}: ${pillarScore}/100\n`;
    }
    return result;
};


export const generateExecutiveSummary = async (client: Client): Promise<string> => {
    // Fix: Removed check for API key, as per guidelines to assume it's always available.

    if (client.assessments.length < 1) {
        return "Não há dados de avaliação suficientes para gerar um resumo.";
    }

    const latestAssessment = client.assessments[client.assessments.length - 1];
    const previousAssessment = client.assessments.length > 1 ? client.assessments[client.assessments.length - 2] : null;

    let prompt = `Você é um consultor de negócios B2B sênior, especialista em análise de maturidade comercial.
Seu objetivo é gerar um resumo executivo para uma próxima reunião com o cliente.
O resumo deve ser escrito em Português do Brasil, em um tom profissional, direto e acionável.

**Cliente:** ${client.name}

**Dados da Avaliação Atual:**
${formatAssessmentData(latestAssessment)}
`;

    if (previousAssessment) {
        prompt += `
**Dados da Avaliação Anterior:**
${formatAssessmentData(previousAssessment)}
`;
    }

    prompt += `
**Sua Tarefa:**
Baseado nos dados fornecidos, escreva um resumo executivo conciso (máximo de 4 parágrafos) que inclua:
1.  **Status Geral:** Comece com a pontuação de maturidade geral atual e uma análise do progresso (melhorou, piorou ou estagnou) desde a avaliação anterior.
2.  **Pontos Fortes:** Identifique o pilar com a maior pontuação. Comente brevemente por que isso é positivo.
3.  **Pontos de Atenção:** Identifique o pilar com a menor pontuação. Destaque-o como a principal área de foco para melhoria.
4.  **Principais Mudanças:** Destaque a evolução mais significativa (positiva ou negativa) em um pilar específico desde a última avaliação.
5.  **Recomendação:** Conclua com uma recomendação clara e de alto nível para o próximo ciclo de trabalho.

O resultado deve ser um texto corrido, sem usar listas numeradas, e formatado como um parágrafo de e-mail ou documento.
`;

    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
        });
        return response.text;
    } catch (error) {
        console.error("Error calling Gemini API:", error);
        return "Ocorreu um erro ao gerar o resumo. Verifique o console para mais detalhes.";
    }
};

export const generateChatResponseWithContext = async (
    question: string,
    contextDocuments: Deliverable[],
    tone: string,
    size: string,
    orientation: string
): Promise<string> => {
    if (contextDocuments.length === 0) {
        return "Por favor, selecione pelo menos um documento da biblioteca para usar como fonte de conhecimento.";
    }

    let prompt = `Você é um consultor especialista e assistente de IA. Sua única fonte de conhecimento são os documentos fornecidos abaixo.
Responda à pergunta do usuário baseando-se EXCLUSIVAMENTE nas informações contidas nestes documentos.
Se a resposta não estiver nos documentos, diga 'Com base nos documentos fornecidos, não tenho informações sobre isso.'

--- INÍCIO DOS DOCUMENTOS DE CONTEXTO ---
`;

    for (const doc of contextDocuments) {
        prompt += `
Documento: ${doc.name}
Descrição: ${doc.description}
Conteúdo:
${doc.content}
--------------------------------------
`;
    }

    prompt += "--- FIM DOS DOCUMENTOS DE CONTEXTO ---\n\n";

    prompt += `**Instruções para a Resposta:**
- **Tom:** ${tone || 'Profissional e prestativo'}.
- **Tamanho da Resposta:** ${size || 'Equilibrado, nem muito curto nem muito longo'}.
- **Orientações Adicionais:** ${orientation || 'Nenhuma orientação adicional.'}
- **Formatação OBRIGATÓRIA:** Use Markdown para estruturar a resposta de forma clara e legível. Utilize títulos (#, ##), listas com marcadores (-) e texto em negrito (**) para destacar informações importantes e melhorar a diagramação.

**Pergunta do Usuário:** "${question}"
`;

    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
        });
        return response.text;
    } catch (error) {
        console.error("Error calling Gemini API for chat:", error);
        return "Ocorreu um erro ao comunicar com a IA. Verifique o console para mais detalhes.";
    }
};

export const generateGeneralAssessmentNote = async (scores: PillarScores): Promise<string> => {
    const overallMaturity = calculateOverallMaturity(scores);
    
    let scoresText = `Maturidade Geral: ${overallMaturity}%\n`;
    for (const pillar of PILLARS) {
        const pillarName = PILLAR_DATA[pillar].name;
        const score = calculatePillarScore(scores[pillar].responses);
        const notes = scores[pillar].notes;
        scoresText += `- ${pillarName}: ${score}/100 (Notas do Pilar: ${notes || 'Nenhuma nota'})\n`;
    }

    const prompt = `Você é um consultor sênior de vendas B2B.
Analise os resultados abaixo de uma avaliação de maturidade comercial completa.
Sua tarefa é escrever uma "Nota Geral Estratégica" sobre o momento atual da empresa.

Diretrizes:
- Escreva de 2 a 4 frases curtas e impactantes.
- Sintetize a situação atual baseada nos pilares com notas mais altas e mais baixas.
- Aponte a prioridade #1 para o próximo ciclo.
- Use tom profissional e direto (Português do Brasil).
- NÃO use listas, apenas texto corrido.

Dados da Avaliação:
${scoresText}
`;

    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
        });
        return response.text || "Não foi possível gerar a nota.";
    } catch (error) {
        console.error("Error calling Gemini API for notes:", error);
        return "Erro ao gerar nota com IA.";
    }
};