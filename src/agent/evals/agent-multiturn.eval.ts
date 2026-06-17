import { evaluate } from "@lmnr-ai/lmnr";
import dataset from "./data/agent-multiturn.json"  with {type: "json"}
import { LMNR_PROJECT_API_KEY } from "../../config.js";
import type { MultiturnEvalData, MultiturnEvalTarget } from "./types.js";
import { multiturnWithMocks } from "./executors.js";
import { llmJudge, toolCallOrder, toolsAvoided } from "./evaluators.js";

const executor = (data: MultiturnEvalData) => {
    return multiturnWithMocks(data)
}
evaluate({
    data: dataset as Array<{ data: MultiturnEvalData, target: MultiturnEvalTarget }>,
    executor,
    evaluators: {
        toolsAvoided: (output, target) => {
            if (!target?.forbiddenTools?.length) return 1
            return toolsAvoided(output, target)
        },
        toolOrder: (output, target) => {
            if (!target?.expectedToolOrder?.length) return 1
            return toolCallOrder(output, target)
        },
        outputQuality: (output, target) => {
            if (!target) return 1
            return llmJudge(output, target)
        }
    },
    config: { projectApiKey: LMNR_PROJECT_API_KEY },
    groupName: "multiturn-eval"
})