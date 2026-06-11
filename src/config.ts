import { config } from "dotenv"
config()

export const GEMINI_API_KEY = process.env.GEMINI_API_KEY || ""
export const OPENAI_API_KEY = process.env.OPENAI_API_KEY || ""
export const LMNR_PROJECT_API_KEY = process.env.LMNR_PROJECT_API_KEY || ""