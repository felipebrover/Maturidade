
import { Pillar, type Assessment, type PillarScores } from './types';
import { PILLARS, PILLAR_WEIGHTS } from './constants';

export const calculatePillarScore = (responses: number[]): number => {
    if (!responses || responses.length === 0) return 0;
    const totalScore = responses.reduce((acc, response) => acc + response, 0);
    // The score for a pillar is the average of its 10 responses
    return Math.round(totalScore / 10);
};

export const calculateOverallMaturity = (scores: PillarScores): number => {
    if (!scores) return 0;
    
    // Premium Elite Weighted Calculation
    let weightedSum = 0;
    let totalWeight = 0;

    for (const pillar of PILLARS) {
        const pillarScore = calculatePillarScore(scores[pillar].responses);
        const weight = PILLAR_WEIGHTS[pillar] || 0; // Fallback to 0 if weight not found
        
        weightedSum += pillarScore * weight;
        totalWeight += weight;
    }

    // Ensure we divide by total weight (should be close to 1, but good for safety)
    if (totalWeight === 0) return 0;
    
    return Math.round(weightedSum / totalWeight);
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
