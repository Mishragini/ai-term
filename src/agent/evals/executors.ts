import { generateText, stepCountIs, type ModelMessage, type ToolSet } from "ai";
import type { EvalData } from "./types.js";
import { SYSTEM_PROMPT } from "../system_prompt.js";
import z from "zod";
import { tool } from "ai"

import { createGoogleGenerativeAI } from "@ai-sdk/google";
import { GEMINI_API_KEY, OPENAI_API_KEY } from "../../config.js";
import { createOpenAI } from "@ai-sdk/openai";

export const TOOL_DEFINITIONS: Record<string, { description: string, inputSchema: z.ZodObject<z.ZodRawShape> }> =
{
    readFile: {
        description: "Read the contents of a file.",
        inputSchema: z.object({
            path: z.string().describe("The path of the file to be read.")
        })
    },
    writeFile: {
        description: "Write content to a file.",
        inputSchema: z.object({
            path: z.string().describe("The path of the file to write to."),
            content: z.string().describe("Content to write")
        })
    },
    listFiles: {
        description: "List all the files and directories in a directory",
        inputSchema: z.object({
            directory: z.string().describe("Directory for which listing has to be done")
        })
    },
    deleteFile: {
        description: "Remove a file",
        inputSchema: z.object({
            path: z.string().describe("Path of the filt to delete")
        })
    }
}


export const SingleTurnWithMocks = async (data: EvalData) => {
    const messages: ModelMessage[] = [{
        role: "user", content: data.prompt
    }]

    const tools: ToolSet = {}
    for (const toolName of data.tools) {
        const def = TOOL_DEFINITIONS[toolName]
        if (def) {
            tools[toolName] = tool({ description: def.description, inputSchema: def.inputSchema })
        }
    }

    const openai = createOpenAI({ apiKey: OPENAI_API_KEY })
    const google = createGoogleGenerativeAI({ apiKey: GEMINI_API_KEY })

    const result = await generateText({
        model: google("gemini-3.5-flash"),
        // model: openai("gpt-5-mini"),
        system: SYSTEM_PROMPT,
        tools,
        messages,
        stopWhen: stepCountIs(1)
    })

    console.log("toolcalls..", result.toolCalls)

    const toolCalls = (result.toolCalls ?? []).map((tc) => ({ toolName: tc.toolName, args: "args" in tc ? tc.args : {} }))

    const toolNames = toolCalls.map((tc) => tc.toolName)

    return {
        toolCalls,
        toolNames,
        selectedAny: toolCalls.length > 0
    }
}