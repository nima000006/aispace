"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useTranslations } from "next-intl";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { oneDark } from "react-syntax-highlighter/dist/esm/styles/prism";
import {
  Send, StopCircle, Plus, Trash2, Copy, RotateCcw,
  ChevronDown, Settings2, Sparkles, Bot, User, PanelLeft,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Card } from "@/components/ui/card";
import { usePlayground, useSettings } from "@/store/app-store";
import { AI_PROVIDERS } from "@/lib/ai/providers";
import { streamAIResponse } from "@/lib/ai/client";
import { generateId, cn } from "@/lib/utils";
import type { Message } from "@/types";
import { toast } from "sonner";

export function PlaygroundPage() {
  const t = useTranslations("playground");
  const [input, setInput] = useState("");
  const [showSettings, setShowSettings] = useState(false);
  const [showSessions, setShowSessions] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const abortRef = useRef<(() => void) | null>(null);

  const {
    sessions, activeSessionId, activeSession,
    selectedModel, selectedProvider,
    temperature, maxTokens, systemPrompt,
    isStreaming,
    createSession, deleteSession, setActiveSession,
    addMessage, updateLastMessage, setStreaming,
    setModel, setTemperature, setMaxTokens, setSystemPrompt,
    clearSession,
  } = usePlayground();

  const { apiKeys } = useSettings();

  // Auto-create session on mount
  useEffect(() => {
    if (sessions.length === 0) createSession();
  }, []);

  // Scroll to bottom on new messages
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [activeSession?.messages]);

  const handleSend = useCallback(async () => {
    if (!input.trim() || isStreaming || !activeSessionId) return;

    const userMsg: Message = {
      id: generateId(),
      role: "user",
      content: input.trim(),
      createdAt: new Date(),
    };
    addMessage(activeSessionId, userMsg);
    setInput("");

    const assistantMsg: Message = {
      id: generateId(),
      role: "assistant",
      content: "",
      model: selectedModel,
      provider: selectedProvider,
      createdAt: new Date(),
    };
    addMessage(activeSessionId, assistantMsg);
    setStreaming(true);

    let cancelled = false;
    abortRef.current = () => { cancelled = true; };

    const allMessages = [
      ...(systemPrompt ? [{ id: "sys", role: "system" as const, content: systemPrompt, createdAt: new Date() }] : []),
      ...(activeSession?.messages ?? []),
      userMsg,
    ];

    let accumulated = "";

    await streamAIResponse({
      provider: selectedProvider,
      model: selectedModel,
      messages: allMessages,
      temperature,
      maxTokens,
      apiKey: apiKeys[selectedProvider],
      onChunk: (chunk) => {
        if (cancelled) return;
        accumulated += chunk;
        updateLastMessage(activeSessionId, accumulated);
      },
      onDone: () => {
        if (!cancelled) setStreaming(false);
      },
      onError: (err) => {
        toast.error(err.message);
        updateLastMessage(activeSessionId, `Error: ${err.message}`);
        setStreaming(false);
      },
    });
  }, [input, isStreaming, activeSessionId, activeSession, selectedModel, selectedProvider, systemPrompt, temperature, maxTokens, apiKeys]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if ((e.ctrlKey || e.metaKey) && e.key === "Enter") {
      e.preventDefault();
      handleSend();
    }
  };

  const handleStop = () => {
    abortRef.current?.();
    setStreaming(false);
  };

  const allModels = AI_PROVIDERS.flatMap((p) =>
    p.models.map((m) => ({ ...m, providerName: p.name }))
  );

  return (
    <div className="flex h-full relative">
      {/* Mobile session backdrop */}
      {showSessions && (
        <div
          className="fixed inset-0 z-40 bg-black/40 md:hidden"
          onClick={() => setShowSessions(false)}
        />
      )}

      {/* Session list */}
      <div className={cn(
        // Desktop: always visible, in flex flow
        "hidden md:flex md:w-56 border-e border-[var(--card-border)] bg-[var(--card-bg)] flex-col shrink-0",
        // Mobile: fixed overlay, toggle via showSessions
        showSessions && "!fixed inset-y-0 start-0 z-50 !flex w-64 shadow-xl"
      )}>
        <div className="p-3 border-b border-[var(--card-border)] flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            className="flex-1 gap-1.5"
            onClick={createSession}
          >
            <Plus className="w-3.5 h-3.5" />
            {t("newChat")}
          </Button>
          {/* Mobile close */}
          <Button
            variant="ghost"
            size="icon-sm"
            className="md:hidden"
            onClick={() => setShowSessions(false)}
          >
            <Trash2 className="w-3.5 h-3.5 text-[var(--muted-fg)]" />
          </Button>
        </div>
        <div className="flex-1 overflow-y-auto p-2 space-y-0.5">
          {sessions.map((sess) => (
            <div
              key={sess.id}
              className={cn(
                "group flex items-center gap-2 rounded-lg px-2.5 py-2 cursor-pointer text-sm transition-colors",
                sess.id === activeSessionId
                  ? "bg-[var(--accent-bg)] text-[var(--accent-fg)]"
                  : "text-[var(--muted-fg)] hover:bg-[var(--muted-bg)] hover:text-[var(--fg)]"
              )}
              onClick={() => { setActiveSession(sess.id); setShowSessions(false); }}
            >
              <Sparkles className="w-3.5 h-3.5 shrink-0" />
              <span className="flex-1 truncate text-xs">{sess.title || t("newChat")}</span>
              <button
                onClick={(e) => { e.stopPropagation(); deleteSession(sess.id); }}
                className="opacity-0 group-hover:opacity-100 p-0.5 hover:text-[var(--destructive)] transition-opacity"
              >
                <Trash2 className="w-3 h-3" />
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Main chat */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Toolbar */}
        <div className="h-12 border-b border-[var(--card-border)] flex items-center gap-2 md:gap-3 px-3 md:px-4 bg-[var(--bg)] shrink-0">
          {/* Mobile: sessions toggle */}
          <Button
            variant="ghost"
            size="icon-sm"
            className="md:hidden"
            onClick={() => setShowSessions((v) => !v)}
            aria-label="Sessions"
          >
            <PanelLeft className="w-4 h-4 text-[var(--muted-fg)]" />
          </Button>

          {/* Model selector */}
          <div className="relative">
            <select
              value={`${selectedProvider}::${selectedModel}`}
              onChange={(e) => {
                const [prov, ...rest] = e.target.value.split("::");
                setModel(rest.join("::"), prov as any);
              }}
              className="appearance-none h-8 rounded-lg border border-[var(--card-border)] bg-[var(--card-bg)] px-3 pe-7 text-xs text-[var(--fg)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)] cursor-pointer max-w-[160px] sm:max-w-none"
            >
              {AI_PROVIDERS.map((p) =>
                p.models.map((m) => (
                  <option key={`${p.id}::${m.id}`} value={`${p.id}::${m.id}`}>
                    {p.name} — {m.name}
                    {m.isFree ? " (Free)" : ""}
                  </option>
                ))
              )}
            </select>
            <ChevronDown className="absolute end-2 top-1/2 -translate-y-1/2 w-3 h-3 text-[var(--muted-fg)] pointer-events-none" />
          </div>

          <Button
            variant="ghost"
            size="icon-sm"
            onClick={() => setShowSettings(!showSettings)}
            className={cn(showSettings && "bg-[var(--muted-bg)]")}
          >
            <Settings2 className="w-4 h-4 text-[var(--muted-fg)]" />
          </Button>

          <div className="flex-1" />

          {activeSessionId && (
            <Button
              variant="ghost"
              size="icon-sm"
              onClick={() => clearSession(activeSessionId)}
            >
              <Trash2 className="w-4 h-4 text-[var(--muted-fg)]" />
            </Button>
          )}
        </div>

        {/* Settings panel */}
        <AnimatePresence>
          {showSettings && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="overflow-hidden border-b border-[var(--card-border)] bg-[var(--muted-bg)]"
            >
              <div className="p-4 grid grid-cols-2 md:grid-cols-4 gap-4">
                <div>
                  <label className="block text-xs font-medium text-[var(--muted-fg)] mb-1.5">
                    {t("temperature")}: {temperature}
                  </label>
                  <input
                    type="range" min="0" max="2" step="0.1"
                    value={temperature}
                    onChange={(e) => setTemperature(parseFloat(e.target.value))}
                    className="w-full accent-[var(--primary)]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-[var(--muted-fg)] mb-1.5">
                    {t("maxTokens")}: {maxTokens}
                  </label>
                  <input
                    type="range" min="256" max="8192" step="256"
                    value={maxTokens}
                    onChange={(e) => setMaxTokens(parseInt(e.target.value))}
                    className="w-full accent-[var(--primary)]"
                  />
                </div>
                <div className="col-span-2">
                  <label className="block text-xs font-medium text-[var(--muted-fg)] mb-1.5">
                    {t("systemPrompt")}
                  </label>
                  <textarea
                    value={systemPrompt}
                    onChange={(e) => setSystemPrompt(e.target.value)}
                    placeholder={t("systemPromptPlaceholder")}
                    rows={2}
                    className="w-full rounded-lg border border-[var(--card-border)] bg-[var(--card-bg)] px-3 py-1.5 text-xs text-[var(--fg)] resize-none focus:outline-none focus:ring-2 focus:ring-[var(--primary)]"
                  />
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {!activeSession || activeSession.messages.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center space-y-4">
              <div className="w-16 h-16 rounded-2xl gradient-brand flex items-center justify-center">
                <Sparkles className="w-8 h-8 text-white" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-[var(--fg)] mb-1">
                  Start a conversation
                </h3>
                <p className="text-sm text-[var(--muted-fg)] max-w-xs">
                  Ask anything. Use free models like Gemini Flash or Groq Llama 3.
                </p>
              </div>
            </div>
          ) : (
            activeSession.messages.map((msg, i) => (
              <ChatMessage key={msg.id} message={msg} isLast={i === activeSession.messages.length - 1} isStreaming={isStreaming && i === activeSession.messages.length - 1} />
            ))
          )}
          <div ref={bottomRef} />
        </div>

        {/* Input */}
        <div className="border-t border-[var(--card-border)] p-4 bg-[var(--bg)]">
          <div className="relative max-w-4xl mx-auto">
            <Textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={t("messagePlaceholder")}
              rows={3}
              className="pe-16 resize-none text-sm"
              disabled={isStreaming}
            />
            <div className="absolute bottom-2.5 end-2.5">
              {isStreaming ? (
                <Button
                  size="icon"
                  variant="destructive"
                  onClick={handleStop}
                  className="h-8 w-8"
                >
                  <StopCircle className="w-4 h-4" />
                </Button>
              ) : (
                <Button
                  size="icon"
                  onClick={handleSend}
                  disabled={!input.trim()}
                  className="h-8 w-8"
                  variant="gradient"
                >
                  <Send className="w-4 h-4" />
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function ChatMessage({
  message,
  isLast,
  isStreaming,
}: {
  message: Message;
  isLast: boolean;
  isStreaming: boolean;
}) {
  const isUser = message.role === "user";

  const copyContent = () => {
    navigator.clipboard.writeText(message.content);
    toast.success("Copied to clipboard");
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className={cn("flex gap-3", isUser ? "flex-row-reverse" : "flex-row")}
    >
      <div className={cn(
        "w-8 h-8 rounded-full flex items-center justify-center shrink-0",
        isUser ? "gradient-brand" : "bg-[var(--muted-bg)] border border-[var(--card-border)]"
      )}>
        {isUser
          ? <User className="w-4 h-4 text-white" />
          : <Bot className="w-4 h-4 text-[var(--muted-fg)]" />
        }
      </div>

      <div className={cn("max-w-[75%] space-y-1", isUser && "items-end flex flex-col")}>
        {message.model && (
          <p className="text-[10px] text-[var(--muted-fg)] px-1">{message.model}</p>
        )}
        <div className={cn(
          "rounded-2xl px-4 py-3 text-sm leading-relaxed",
          isUser
            ? "bg-[var(--primary)] text-white rounded-tr-sm"
            : "bg-[var(--card-bg)] border border-[var(--card-border)] rounded-tl-sm text-[var(--fg)]"
        )}>
          {isLast && isStreaming && !message.content ? (
            <div className="flex gap-1 py-1">
              {[0, 1, 2].map((i) => (
                <motion.span
                  key={i}
                  className="w-1.5 h-1.5 rounded-full bg-current opacity-60"
                  animate={{ opacity: [0.3, 1, 0.3] }}
                  transition={{ duration: 1.2, repeat: Infinity, delay: i * 0.2 }}
                />
              ))}
            </div>
          ) : isUser ? (
            <p className="whitespace-pre-wrap">{message.content}</p>
          ) : (
            <ReactMarkdown
              remarkPlugins={[remarkGfm]}
              components={{
                code({ node, className, children, ...props }) {
                  const match = /language-(\w+)/.exec(className || "");
                  const isBlock = match != null;
                  return isBlock ? (
                    <SyntaxHighlighter
                      style={oneDark}
                      language={match[1]}
                      PreTag="div"
                      className="rounded-lg text-xs my-2"
                    >
                      {String(children).replace(/\n$/, "")}
                    </SyntaxHighlighter>
                  ) : (
                    <code className={className} {...props}>
                      {children}
                    </code>
                  );
                },
              }}
            >
              {message.content}
            </ReactMarkdown>
          )}
        </div>

        {!isUser && message.content && (
          <button
            onClick={copyContent}
            className="flex items-center gap-1 text-[10px] text-[var(--muted-fg)] hover:text-[var(--fg)] transition-colors px-1"
          >
            <Copy className="w-3 h-3" />
            Copy
          </button>
        )}
      </div>
    </motion.div>
  );
}
