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

## Install globally (after publishing to npm)

Once published:

```bash
npm install -g ai-term
export OPENAI_API_KEY=your-key-here
ai-term
```

Or run without installing:

```bash
npx ai-term
```

Set `OPENAI_API_KEY` in your environment or in a `.env` file in the directory where you run the command.

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
npm publish
```

The package ships the compiled `dist/` output and exposes the `ai-term` CLI command.

## License

ISC
