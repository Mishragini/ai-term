export interface EvalData {
    prompt: string,
    tools: string[]
}

export interface EvalTarget {
    forbiddenTools?: string[]
    expectedTools?: string[],
    category: "golden" | "secondary" | "negative"
}

export interface SingleTurnRes {
    toolCalls: { toolName: string, args: unknown }[],
    toolNames: string[],
    selectedAny: boolean
}