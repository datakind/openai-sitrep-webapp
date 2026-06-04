# Agent Notes

This repo contains a local Next.js TypeScript app for generating a draft UNOCHA-style Situation Report from multiple uploaded documents.

Use this file as quick context when making changes as a coding agent.

## Project Overview

- Frontend: Next.js App Router page in `src/app/page.tsx`.
- API route: `src/app/api/summarize/route.ts`.
- Prompt builder: `src/lib/summaryPrompt.ts`.
- File validation: `src/lib/fileValidation.ts`.
- Global styling: `src/app/globals.css`.
- User docs: `README.md` and `HOW_TO.md`.

The app accepts supported files, validates size/type limits, sends them through a server-only OpenAI Responses API request, and renders one synthesized SitRep summary. It does not store uploads or keep history.

## Environment

Required local env file:

```bash
.env.local
```

Expected variables:

```bash
OPENAI_API_KEY=
OPENAI_MODEL=gpt-5.5
```

Keep `OPENAI_API_KEY` server-side only. Do not expose it to browser code.

## Commands

Install dependencies:

```bash
npm install
```

Run development server:

```bash
npm run dev
```

Run tests:

```bash
npm test
```

Run linting:

```bash
npm run lint
```

Build:

```bash
npm run build
```

## Implementation Guardrails

- Keep uploads temporary. Do not add upload history, persistence, or cloud storage unless explicitly requested.
- Enforce the existing upload limits: each file under 50 MB and combined upload under 50 MB.
- Keep `OPENAI_API_KEY` out of client components.
- When changing supported file types, update `src/lib/fileValidation.ts`, tests, and docs together.
- When changing report structure, update `src/lib/summaryPrompt.ts` and `src/lib/summaryPrompt.test.ts`.
- The generated report should remain one synthesized SitRep across all files, not per-file summaries.
- Facts and figures in generated output should be cited from uploaded documents.
- PDF download should continue to require human review confirmation.

## Testing Expectations

For code changes, run:

```bash
npm test
npm run lint
```

For changes that affect rendering, API routes, dependencies, or production behavior, also run:

```bash
npm run build
```

For documentation-only changes, tests are usually not necessary.

## Documentation

- `README.md` is the quick-start and overview.
- `HOW_TO.md` is the detailed usage guide.
- Keep both aligned with any behavior changes in the app.

## Git Notes

The worktree may contain user changes. Do not revert unrelated edits. Check `git status --short` before staging or committing.
