import type { ModelMessage } from "ai"

export interface EvalData {
    prompt: string,
    tools: string[]
}

export interface MockTool {
    description: string,
    parameters: Record<string, any>,
    mockReturn?: string
}

export interface MultiturnEvalData {
    prompt?: string,
    messages?: ModelMessage[]
    mockTools: Record<string, MockTool>,
    config?: {
        maxSteps: number
    }
}

export interface EvalTarget {
    forbiddenTools?: string[]
    expectedTools?: string[],
    category: "golden" | "secondary" | "negative"
}
export interface MultiturnEvalTarget {
    originalTask: string,
    expectedToolOrder?: string[],
    forbiddenTools?: string[],
    mockToolResults: Record<string, string>,
    category: "task-completion" | "conversation-continuation" | "negative"
}



export interface SingleTurnRes {
    toolCalls: { toolName: string, args: unknown }[],
    toolNames: string[],
    selectedAny: boolean
}

export interface MultiturnRes {
    text: string,
    steps: {
        toolCalls: {
            toolName: string;
            args: unknown;
        }[] | undefined;
        toolResults: {
            toolName: string;
            result: unknown;
        }[] | undefined;
        text: string | undefined;
    }[],
    toolCallOrder: string[],
    toolsUsed: string[]
}