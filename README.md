# Multi-File Executive Summary App

Upload multiple common document files, send them to OpenAI from a server-only API route, and display a draft UNOCHA-style Situation Report across the full batch.

## Setup

1. Install dependencies.
2. Copy `.env.example` to `.env.local`.
3. Set `OPENAI_API_KEY`.
4. Run the dev server.

```bash
npm install
npm run dev
```

The app defaults to `OPENAI_MODEL=gpt-5.5`. You can override it in `.env.local`.
