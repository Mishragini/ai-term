import { tool, type ToolSet } from "ai";
import type { MockTool } from "./types.js";
import z from "zod";

export function buildMockedTools(mockTools: Record<string, MockTool>) {

    const tools: ToolSet = {}

    for (const [key, value] of Object.entries(mockTools)) {
        const paramSchema: Record<string, z.ZodString> = {}
        for (const [paramName, _] of Object.entries(value.parameters)) {
            paramSchema[paramName] = z.string()
        }
        tools[key] = tool({
            description: value.description,
            inputSchema: z.object(paramSchema),
            execute: async () => {
                return value.mockReturn
            }
        })
    }
    return tools
}