import {  openai } from "@ai-sdk/openai";
import {  LMNR_PROJECT_API_KEY} from "../config.js";
import { getTracer, Laminar } from "@lmnr-ai/lmnr";
import { streamText, type ModelMessage } from "ai";
import type { AgentCallbacks } from "./type.js";
import { SYSTEM_PROMPT } from "./system/system_prompt.js";
import { tools } from "./tools/index.js";
import { executeTool } from "./executeTool.js";
import { filterMessages } from "./system/filterMessages.js";
import { estimateMessagesTokens } from "./context/index.js";
import { calculateUsagePercentage, DEFAULT_THRESHOLD, getModelLimits, isOverThreshold } from "./context/modelLimits.js";
import { compactConversation } from "./context/compaction.js";

Laminar.initialize({ projectApiKey: LMNR_PROJECT_API_KEY })

const MODEL_NAME = "gpt-5-mini"

export async function runAgent(userMessage: string, conversationHistory: ModelMessage[], callbacks: AgentCallbacks) {
    const limits = getModelLimits(MODEL_NAME)
    let workingHistory = filterMessages(conversationHistory)
    const tokens = estimateMessagesTokens([
        { role: "system", content: SYSTEM_PROMPT },
        ...workingHistory,
        { role: "user", content: userMessage }
    ])

    let messages: ModelMessage[] = []
    if (isOverThreshold(tokens.total, limits.contextWindow)) {
        workingHistory = await compactConversation(workingHistory)
    }
    messages = [
        ...workingHistory,
        { role: "user", content: userMessage }
    ]

    let fullResponse = ""

    const reportTokenUsage = () => {
        const { input, output, total } = estimateMessagesTokens(messages)
        callbacks.onTokenUsage(
            {
                inputTokens: input,
                outputTokens: output,
                totalTokens: total,
                contextWindow: limits.contextWindow,
                threshold: DEFAULT_THRESHOLD,
                percentage: calculateUsagePercentage(total, limits.contextWindow)
            }
        )
    }

    reportTokenUsage()

    while (true) {
        const result = streamText({
            //model: google("gemini-2.5-flash"),
            model: openai(MODEL_NAME),
            system: SYSTEM_PROMPT,
            tools,
            messages,
            experimental_telemetry: {
                isEnabled: true,
                tracer: getTracer()
            }
        })

        // need this to call execute the toolCalls 
        const toolCalls = []
        // to store the text of loop of stream 
        let currentText = ""
        let streamError: Error | null = null

        try {
            for await (const chunk of result.fullStream) {

                if (chunk.type === "text-delta") {
                    currentText += chunk.text
                    callbacks.onToken(chunk.text)
                }

                if (chunk.type === "tool-call") {
                    const input = chunk?.input ?? {}
                    toolCalls.push({
                        toolCallId: chunk.toolCallId,
                        toolName: chunk.toolName,
                        input
                    })
                    callbacks.onToolCallStart(chunk.toolName, chunk.toolCallId, input)
                }
            }


        } catch (error) {
            streamError = error as Error
            // no text + real unknown error -> throw error
            if (!currentText && !streamError.message.includes("No output generated")) {
                throw streamError
            }
        }

        fullResponse += currentText

        //no text + "No output generated" -> let the user know
        if (streamError && !currentText) {
            fullResponse = "I apologize, but I wasn't able to generate a response. Could you please try rephrasing your message?";
            callbacks.onToken(fullResponse);
            break;
        }


        const responseMessages = await result.response
        messages.push(...responseMessages.messages)

        const finishReason = await result.finishReason
        if (finishReason !== "tool-calls" || toolCalls.length === 0) {
            reportTokenUsage()
            break;
        }


        //tool-call execution after the fullStream loop
        //Expected sequence of messages array : user -> assistant -> tool 
        for (const tc of toolCalls) {
            const result = await executeTool(tc.toolName, tc.input, tc.toolCallId) as string
            callbacks.onToolCallEnd(tc.toolName, result)
            messages.push(
                {
                    role: "tool", content: [
                        {
                            type: "tool-result",
                            toolCallId: tc.toolCallId,
                            toolName: tc.toolName,
                            output: { type: "text", value: result }
                        }
                    ]
                }
            )
            reportTokenUsage()
        }
    }

    callbacks.onComplete(fullResponse)
    return messages
}