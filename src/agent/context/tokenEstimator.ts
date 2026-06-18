import type { ModelMessage } from "ai";

export function extractMessageText(msg: ModelMessage) {
    if (typeof msg.content === "string") {
        return msg.content
    }

    if (Array.isArray(msg.content)) {
        return msg.content.map((part) => {
            if (typeof part === "string") {
                return part
            }
            //assistant/user text content
            if ("text" in part) return part.text
            //tool-call-content
            if ("value" in part && typeof part.value === "string") return part.value
            //tool-result-content
            if ("output" in part && typeof part.output === "object" && part.output) {
                const output = part.output
                if ("value" in output && typeof output.value === "string") {
                    return output.value
                }
            }

            return JSON.stringify(part)
        }).join(" ")
    }

    return JSON.stringify(msg.content)
}