import { generateText, stepCountIs, type ModelMessage, type ToolSet } from "ai";
import type { EvalData, MultiturnEvalData } from "./types.js";
import { SYSTEM_PROMPT } from "../system_prompt.js";
import z from "zod";
import { tool } from "ai"

import { createGoogleGenerativeAI } from "@ai-sdk/google";
import { GEMINI_API_KEY, OPENAI_API_KEY } from "../../config.js";
import { createOpenAI } from "@ai-sdk/openai";
import { buildMockedTools } from "./utils.js";

const openai = createOpenAI({ apiKey: OPENAI_API_KEY })
const google = createGoogleGenerativeAI({ apiKey: GEMINI_API_KEY })

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


export const singleTurnWithMocks = async (data: EvalData) => {
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



    const result = await generateText({
        model: google("gemini-3.5-flash"),
        // model: openai("gpt-5-mini"),
        system: SYSTEM_PROMPT,
        tools,
        messages,
        stopWhen: stepCountIs(1)
    })


    const toolCalls = (result.toolCalls ?? []).map((tc) => ({ toolName: tc.toolName, args: "input" in tc ? tc.input : {} }))

    const toolNames = toolCalls.map((tc) => tc.toolName)

    return {
        toolCalls,
        toolNames,
        selectedAny: toolCalls.length > 0
    }
}

export const multiturnWithMocks = async (data: MultiturnEvalData) => {

    const mockedTools = buildMockedTools(data.mockTools)
    const messages = data.messages ?? [
        {
            role: "user", content: data.prompt!
        }
    ]

    const result = await generateText({
        // model: google("gemini-3.5-flash"),
        model: openai("gpt-5-mini"),
        system: SYSTEM_PROMPT,
        tools: mockedTools,
        messages,
        stopWhen: stepCountIs(data.config?.maxSteps ?? 5)
    })

    const allToolCalls: string[] = []


    const steps = result.steps.map((step) => {
        const stepToolCalls = (step.toolCalls ?? []).map((tc) => {
            allToolCalls.push(tc.toolName)
            return {
                toolName: tc.toolName,
                args: "input" in tc ? tc.input : {}
            }
        })

        const stepToolResults = (step.toolResults ?? []).map((tr) => ({
            toolName: tr.toolName,
            result: "result" in tr ? tr.result : tr
        }))

        return {
            toolCalls: stepToolCalls.length > 0 ? stepToolCalls : undefined,
            toolResults: stepToolResults.length > 0 ? stepToolResults : undefined,
            text: step.text || undefined
        }
    })

    const toolsUsed = [...new Set(allToolCalls)]


    return {
        text: result.text,
        steps,
        toolsUsed,
        toolCallOrder: allToolCalls
    }
}