import { generateText, Output, type ModelMessage } from "ai";
import type { EvalTarget, MultiturnEvalTarget, MultiturnRes, SingleTurnRes } from "./types.js";
import { openai } from "@ai-sdk/openai";
import z from "zod";

export function toolsSelected(output: SingleTurnRes, expected: EvalTarget) {
    const expectedTools = expected.expectedTools
    if (!expectedTools?.length) return 1

    const selected = new Set(output.toolNames)

    return expectedTools.every((t) => selected.has(t)) ? 1 : 0
}

export function toolsAvoided(output: SingleTurnRes | MultiturnRes, expected: EvalTarget | MultiturnEvalTarget) {
    if (!expected.forbiddenTools?.length) return 1

    const selected = new Set("toolNames" in output ? output.toolNames : output.toolsUsed)

    return expected.forbiddenTools.some((t) => selected.has(t)) ? 0 : 1
}

export const toolCallOrder = (output: MultiturnRes, expected: MultiturnEvalTarget) => {
    const expectedOrder = expected.expectedToolOrder

    if (!expectedOrder?.length) return 1;

    const resultOrder = output.toolCallOrder

    let expectedIndex = 0
    for (const toolName of resultOrder) {
        if (toolName === expectedOrder[expectedIndex]) {
            expectedIndex++;
            if (expectedIndex === expectedOrder.length) break
        }
    }

    return expectedIndex / expectedOrder.length
}


export const llmJudge = async (output: MultiturnRes, target: MultiturnEvalTarget) => {
    const result = await generateText({
        model: openai("gpt-5-mini"),
        system: `You are an eval agent whose jon is return scores from 1-10 for the task performed by an ai agent.
            Details provided by the user includes what the task was, the tools called by the agent and the results pd the tool calls along with the final text response generated.

            Scoring criteria:
            - 10: Response fully addresses the task using tool results correctly
            - 7-9: Response is mostly correct with minor issues
            - 4-6: Response partially addresses the task
            - 1-3: Response is mostly incorrect or irrelevant
            `,
        prompt: `Task: ${target.originalTask}
            Tools Called : ${JSON.stringify(output.toolsUsed)}
            Tool Results Provided : ${JSON.stringify(target.mockToolResults)}

            AT's final response: ${output.text}
            `,
        output: Output.object({
            schema: z.object({
                score: z.number().min(1).max(10).describe("Score from 1-10 where 10 is perfect"),
                reason: z.string().describe("Brief explanation for the score"),
            }),
        }),
    })

    return result.output.score / 10
}
