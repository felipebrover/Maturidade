import { Pillar, type Assessment, type PillarScores } from './types';
import { PILLARS } from './constants';

export const calculatePillarScore = (responses: number[]): number => {
    if (!responses || responses.length === 0) return 0;
    const totalScore = responses.reduce((acc, response) => acc + response, 0);
    // The score for a pillar is the average of its 10 responses
    return Math.round(totalScore / 10);
};

export const calculateOverallMaturity = (scores: PillarScores): number => {
    if (!scores) return 0;
    const totalPillarScores = PILLARS.reduce((acc, pillar) => {
        const pillarScore = calculatePillarScore(scores[pillar].responses);
        return acc + pillarScore;
    }, 0);
    // Overall maturity is the average of the 7 pillar scores
    return Math.round(totalPillarScores / PILLARS.length);
};

export const formatDate = (isoString: string): string => {
    return new Date(isoString).toLocaleDateString('pt-BR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
    });
};

// Helper function to convert file to base64
export const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => {
            const result = reader.result as string;
            // remove "data:mime/type;base64," prefix
            resolve(result.split(',')[1]);
        };
        reader.onerror = (error) => reject(error);
    });
};

// Helper function to convert file to a full Data URL
export const fileToDataUrl = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = (error) => reject(error);
    });
};