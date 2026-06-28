# ai-term

A terminal AI agent with tool use — read/write files, run shell commands, execute code, and search the web. Built with [Ink](https://github.com/vadimdemedes/ink) and the [Vercel AI SDK](https://sdk.vercel.ai/).

## Requirements

- Node.js 20+
- An [OpenAI API key](https://platform.openai.com/api-keys)

## Quick start (from source)

```bash
git clone https://github.com/Mishragini/ai-term.git
cd ai-term
npm install
cp .env.example .env
# Add your OPENAI_API_KEY to .env
npm start
```

Type your prompt at the `>` prompt. Type `exit` or `quit` to leave.

## Install from npm
 Each user sets their own keys locally.

### Option 1 — export in your shell

```bash
export OPENAI_API_KEY=your-key-here
npx @mishri/ai-term
```

### Option 2 — `.env` file in the folder where you run the command

Create a `.env` file in your current directory (e.g. `~/Desktop/.env`):

```bash
OPENAI_API_KEY=your-key-here
# optional:
# LMNR_PROJECT_API_KEY=your-laminar-key
```

Then run:

```bash
npx @mishri/ai-term
```

The app loads `.env` from the directory you run it in, not from inside the npm package.

### Option 3 — install globally

```bash
npm install -g @mishri/ai-term
export OPENAI_API_KEY=your-key-here
ai-term
```

## Environment variables

| Variable | Required | Description |
|----------|----------|-------------|
| `OPENAI_API_KEY` | Yes | OpenAI API key for the agent |
| `LMNR_PROJECT_API_KEY` | No | [Laminar](https://lmnr.ai/) project key for tracing |

## Tools

The agent can use these tools (shell and code execution require your approval before running):

- **readFile / writeFile / listFiles / deleteFile** — file operations in the working directory
- **shellCommand** — run shell commands (approval required)
- **execCode** — execute JavaScript/TypeScript snippets (approval required)
- **webSearch** — search the web via OpenAI

## Development

```bash
npm run build    # compile TypeScript to dist/
npm start        # build and run
npm run eval-file       # run file-tool evals
npm run eval-multiturn  # run multi-turn agent evals
```

## Publishing to npm

```bash
npm login
npm publish --access public
```

The package ships the compiled `dist/` output and exposes the `ai-term` CLI command.

## License

ISC
