import { execCode } from "./execCode.js";
import { deleteFile, listFiles, readFile, writeFile } from "./file.js";
import { shellCommand } from "./shell.js";
import { webSearch } from "./websearch.js";

export const tools = {
    readFile,
    writeFile,
    listFiles,
    deleteFile,
    webSearch,
    execCode,
    shellCommand
}