import { tool } from "ai";
import z from "zod";

export const shellCommand = tool({
    description: "Run the shell commands that are not supported by the existing tools",
    inputSchema: z.object({
        command: z.string().describe("The command to run")
    }),
    execute: async () => {

    }
})