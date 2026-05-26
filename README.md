# AISpace — Bilingual AI Workspace

A modern, bilingual (English + Persian/RTL) AI productivity platform built with Next.js 16, TypeScript, and Tailwind CSS v4.

## Features

- **Multi-Provider AI** — OpenAI, Anthropic, Gemini, Groq (free), OpenRouter (free), DeepSeek, Mistral, Ollama (local)
- **AI Playground** — Streaming chat with markdown rendering and code highlighting
- **Prompt Library** — Save, tag, version, and reuse prompts
- **Task Manager** — Drag-and-drop Kanban with AI-assisted task generation
- **Workflow Builder** — Visual pipeline builder for chaining AI models
- **Usage Analytics** — Token tracking, cost estimation, provider breakdown
- **Full Bilingual** — English + Persian with proper RTL layout (Vazirmatn font)
- **Dark/Light Mode** — Smooth theme switching with next-themes

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | Next.js 16.2 (App Router, Turbopack) |
| Language | TypeScript 5 |
| Styling | Tailwind CSS v4 |
| State | Zustand (persisted) |
| Data fetching | TanStack Query v5 |
| Animations | Framer Motion |
| i18n | next-intl (en + fa) |
| Charts | Recharts |
| Markdown | react-markdown + remark-gfm |
| Syntax | react-syntax-highlighter |
| Toasts | Sonner |

## Getting Started

```bash
npm install
cp .env.example .env.local
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) — redirects to `/en` automatically.  
Persian/RTL: [http://localhost:3000/fa](http://localhost:3000/fa)

## Free AI Providers (no cost)

- **Groq** — Llama 3.3 70B, Mixtral 8x7B (free API tier)
- **Google Gemini** — Gemini 2.0 Flash, 1.5 Flash (free API tier)
- **OpenRouter** — Llama 3.1 8B, Mistral 7B (free tier)
- **Ollama** — Any local model (no API key)

## Project Structure

```
src/
├── app/[locale]/
│   ├── (app)/        # Dashboard shell (sidebar + topbar)
│   └── auth/         # Auth pages
├── components/       # UI + layout components
├── features/         # Page-level feature modules
├── lib/ai/           # AI provider configs + streaming client
├── store/            # Zustand global state
├── messages/         # i18n: en.json + fa.json
└── i18n/             # next-intl routing config
```

## Deployment (Vercel)

```bash
npm i -g vercel && vercel
```

Set your API keys as environment variables in the Vercel dashboard.
