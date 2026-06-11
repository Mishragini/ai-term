import { tool } from "ai";
import z from "zod";
import fs from "fs/promises"
import path from "path"

export const readFile = tool({
    description: `Read the contents of the file with the path.`,
    inputSchema: z.object({
        path: z.string().describe("Path of the file you need to read.")
    }),
    execute: async ({ path: filePath }) => {
        try {
            const contents = await fs.readFile(filePath, "utf-8")
            return contents
        } catch (error) {
            const err = error as NodeJS.ErrnoException
            if (err.code === "ENOENT") {
                return `Error: File not found : ${filePath}`
            }
            return `Error occured while reading the file : ${err.message}`
        }
    }
})

export const writeFile = tool({
    description: `Write contents to a file at a specified path. Creates the file if it doesn't exist, overwrites if it does`,
    inputSchema: z.object({
        path: z.string().describe("Path of the file you need to write to."),
        content: z.string().describe("The content you want to write")
    }),
    execute: async ({ path: filePath, content }) => {
        try {
            const dir = path.dirname(filePath)
            await fs.mkdir(dir, { recursive: true })
            await fs.writeFile(filePath, content, "utf-8")
            return `Successfully wrote ${content.length} characters to ${filePath}`
        } catch (error) {
            const err = error as NodeJS.ErrnoException;
            return `Error writing file: ${err.message}`;
        }
    }
})

export const listFiles = tool({
    description: `List all the files and directories in the specified directory path.`,
    inputSchema: z.object({
        directory: z.string().describe("The directory to list the contents of")
            .default(".")
    }),
    execute: async ({ directory }) => {
        try {
            const entries = await fs.readdir(directory, { withFileTypes: true })
            const items = entries.map((entry) => {
                const type = entry.isDirectory() ? "[dir]" : "[file]"
                return `${type} ${entry.name}`
            })

            return items.length > 0 ? items.join("\n") : `Directory ${directory} is empty.`
        } catch (error) {
            const err = error as NodeJS.ErrnoException;
            if (err.code === "ENOENT") {
                return `Error: Directory not found: ${directory}`;
            }
            return `Error listing directory: ${err.message}`;
        }
    }
})

export const fileTools = {
    readFile,
    writeFile,
    listFiles
}