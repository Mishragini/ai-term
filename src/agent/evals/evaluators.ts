import type { EvalTarget, SingleTurnRes } from "./types.js";

export function toolsSelected(output: SingleTurnRes, expected: EvalTarget) {
    const expectedTools = expected.expectedTools
    if (!expectedTools?.length) return 1

    const selected = new Set(output.toolNames)

    return expectedTools.every((t) => selected.has(t)) ? 1 : 0
}

export function toolsAvoided(output: SingleTurnRes, expected: EvalTarget) {
    if (!expected.forbiddenTools?.length) return 1

    const selected = new Set(output.toolNames)

    return expected.forbiddenTools.some((t) => selected.has(t)) ? 0 : 1
}
