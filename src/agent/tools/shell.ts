import { tool } from "ai";
import z from "zod";
import shell from "shelljs"

export const shellCommand = tool({
    description: "Run the shell commands that are not supported by the existing tools",
    inputSchema: z.object({
        command: z.string().describe("The command to run")
    }),
    execute: async ({ command }) => {
        try {
            const result = shell.exec(command, { silent: true })

            let output = ""
            if (result.stdout) {
                output += result.stdout
            }
            if (result.stderr) {
                output += result.stderr
            }

            if (result.code !== 0) {
                return `Command failed (exit code ${result.code}:\n${output})`
            }

            return output || "Command completed successfully(no output)"
        } catch (error) {
            const err = error as Error;
            return `Error executing shell command: ${err.message}`
        }
    }
})