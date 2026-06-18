import type { ModelMessage } from "ai";
import { extractMessageText } from "./tokenEstimator.js";


//usually use and llm to estimate token but sine i dont have money use vague ass assumption that 3.75chars = 1 token
function estimateTokens(text: string) {
    return Math.ceil(text.length / 3.75)
}

export function estimateMessagesTokens(messages: ModelMessage[]) {

    let input = 0, output = 0
    for (const msg of messages) {
        const text = extractMessageText(msg)
        const tokens = estimateTokens(text)

        if (msg.role === "assistant") {
            output += tokens
        } else {
            input += tokens
        }
    }

    return {
        input,
        output,
        total: input + output
    }

}