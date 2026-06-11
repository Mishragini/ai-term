export interface AgentCallbacks {
    onToken: (token: string) => void,
    onToolCallStart: (name: string, id: string, input: Record<string, any>) => void
    onToolCallEnd: (name: string, result: string) => void
    onComplete: (fullResponse: string) => void
}