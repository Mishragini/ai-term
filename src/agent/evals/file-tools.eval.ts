import { evaluate } from "@lmnr-ai/lmnr";
import dataset from "./data/tool-calls.json" with {type: "json"}
import type { EvalData, EvalTarget } from "./types.js";
import { LMNR_PROJECT_API_KEY } from "../../config.js";
import { SingleTurnWithMocks } from "./executors.js";
import { toolsAvoided, toolsSelected } from "./evaluators.js";

const executor = async (data: EvalData) => {
    return await SingleTurnWithMocks(data)
}

evaluate({
    data: dataset as Array<{ data: EvalData, target: EvalTarget }>,
    executor,
    evaluators: {
        toolsSelected: (output, target) => {
            if (!target) return 1
            return toolsSelected(output, target)
        },
        toolsAvoided: (output, target) => {
            if (!target) return 1
            return toolsAvoided(output, target)
        }
    },
    config: { projectApiKey: LMNR_PROJECT_API_KEY },
    groupName: "file-tool-selection"
}) 