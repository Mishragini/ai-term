export interface AgentCallbacks {
    onToken: (token: string) => void,
    onToolCallStart: (name: string, id: string, input: Record<string, any>) => void
    onToolCallEnd: (name: string, result: string) => void
    onComplete: (fullResponse: string) => void
    onTokenUsage: ({ inputTokens, outputTokens, totalTokens, contextWindow, threshold, percentage }:
        TokenUsageInfo) => void,
    onToolApproval: (toolName: string, args: {}) => Promise<boolean>
}

export interface ModelLimits {
    inputLimit: number,
    outputLimit: number,
    contextWindow: number
}

export interface TokenUsageInfo {
    inputTokens: number,
    outputTokens: number,
    totalTokens: number,
    contextWindow: number,
    threshold: number,
    percentage: number
}

export interface toolApprovalRequest {
    toolName: string,
    args: {},
    resolve: (value: boolean | PromiseLike<boolean>) => void
}