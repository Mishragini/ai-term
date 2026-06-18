import type { ModelLimits } from "../type.js"

export const DEFAULT_THRESHOLD = 0.8

export const MODEL_LIMITS: Record<string, ModelLimits> = {
    "gpt-5": {
        inputLimit: 272000,
        outputLimit: 128000,
        contextWindow: 400000
    },

    "gpt-5-mini": {
        inputLimit: 272000,
        outputLimit: 128000,
        contextWindow: 400000,
    },
}

const DEFAULT_LIMITS: ModelLimits = {
    inputLimit: 128000,
    outputLimit: 16000,
    contextWindow: 128000,
};


export function getModelLimits(model: string) {
    if (MODEL_LIMITS[model]) {
        return MODEL_LIMITS[model]
    }

    return DEFAULT_LIMITS

}

export function isOverThreshold(
    totalTokens: number,
    contextWindow: number,
    threshold: number = DEFAULT_THRESHOLD
) {
    return totalTokens > contextWindow * threshold
}


export function calculateUsagePercentage(
    totalTokens: number,
    contextWindow: number
) {
    return (totalTokens / contextWindow) * 100
}