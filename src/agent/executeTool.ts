import { tools } from "./tools/index.js";

export async function executeTool(toolName: string, args: unknown, toolCallId: string) {
    const tool = tools[toolName as keyof typeof tools]

    if (!tool) {
        return `Unknown Tool:${toolName}`
    }

    const execute = tool.execute
    if (!execute) {
        return `Provider tool ${toolName}- executed by model provider`
    }

    const result = await execute(args as never, { toolCallId, messages: [] })
    return result
}