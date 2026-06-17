import { createOpenAI } from "@ai-sdk/openai";
import { GEMINI_API_KEY, LMNR_PROJECT_API_KEY, OPENAI_API_KEY } from "../config.js";
import { createGoogleGenerativeAI } from "@ai-sdk/google";
import { getTracer, Laminar } from "@lmnr-ai/lmnr";
import { streamText, type ModelMessage } from "ai";
import type { AgentCallbacks } from "./type.js";
import { SYSTEM_PROMPT } from "./system_prompt.js";
import { tools } from "./tools/index.js";
import { executeTool } from "./executeTool.js";

Laminar.initialize({ projectApiKey: LMNR_PROJECT_API_KEY })

export async function runAgent(userMessage: string, conversationHistory: ModelMessage[], callbacks: AgentCallbacks) {
    const openai = createOpenAI({ apiKey: OPENAI_API_KEY })
    const google = createGoogleGenerativeAI({ apiKey: GEMINI_API_KEY })

    const messages: ModelMessage[] = [
        ...conversationHistory,
        { role: "user", content: userMessage }
    ]

    let fullResponse = ""

    while (true) {
        const result = streamText({
            //model: google("gemini-2.5-flash"),
            model: openai("gpt-5-mini"),
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
        }
    }

    callbacks.onComplete(fullResponse)
    return messages
}