import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: "AISpace — Bilingual AI Workspace",
    template: "%s | AISpace",
  },
  description:
    "Manage multiple AI providers, build prompt workflows, track usage, and supercharge your productivity.",
  keywords: ["AI", "productivity", "workspace", "prompt", "LLM", "OpenAI", "Anthropic"],
  openGraph: {
    title: "AISpace — Bilingual AI Workspace",
    description: "Your AI productivity command center.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
