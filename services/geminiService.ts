import { GoogleGenAI } from "@google/genai";
import type { Client, Assessment, Pillar } from '../types';
import { PILLARS, PILLAR_DATA } from '../constants';
import { calculatePillarScore } from '../utils';

const API_KEY = process.env.API_KEY;

if (!API_KEY) {
  // This is a fallback for development. In a real environment, the key should be set.
  console.warn("API_KEY environment variable not set. Gemini API calls will fail.");
}

const ai = new GoogleGenAI({ apiKey: API_KEY });

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
    if (!API_KEY) {
        return "Erro: A chave da API do Gemini não foi configurada. Por favor, configure a variável de ambiente API_KEY.";
    }

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