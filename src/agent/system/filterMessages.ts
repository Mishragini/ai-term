import type { ModelMessage } from "ai";

export function filterMessages(messages: ModelMessage[]) {

    return messages.filter((msg) => {

        if (msg.role === "user" || msg.role === "system" || msg.role === "tool") return true


        else if (msg.role === "assistant") {
            const content = msg.content

            if (typeof content === "string" && content.trim()) {
                return true
            }

            if (Array.isArray(content)) {
                const hasTextContent = content.some((part: unknown) => {
                    if (typeof part === "string" && part.trim()) return true
                    if (typeof part === "object" && part !== null && "text" in part && typeof part.text === "string" && part.text.trim()) {
                        return true
                    }
                    return false
                })
                return hasTextContent
            }
        }

        return false

    })
}