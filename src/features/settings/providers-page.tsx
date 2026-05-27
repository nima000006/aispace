"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import {
  Eye, EyeOff, Check, AlertCircle, ExternalLink, Save, Trash2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useSettings } from "@/store/app-store";
import { AI_PROVIDERS } from "@/lib/ai/providers";
import { toast } from "sonner";
import type { AIProvider } from "@/types";

export function ProvidersPage() {
  const { apiKeys, setApiKey, removeApiKey } = useSettings();
  const [drafts, setDrafts] = useState<Partial<Record<AIProvider, string>>>({});
  const [shown, setShown] = useState<Partial<Record<AIProvider, boolean>>>({});

  const handleSave = (provider: AIProvider) => {
    const key = drafts[provider];
    if (!key?.trim()) return;
    setApiKey(provider, key.trim());
    setDrafts((d) => { const n = { ...d }; delete n[provider]; return n; });
    toast.success(`${provider} API key saved`);
  };

  const handleRemove = (provider: AIProvider) => {
    removeApiKey(provider);
    toast.success(`${provider} API key removed`);
  };

  const toggleShow = (provider: AIProvider) => {
    setShown((s) => ({ ...s, [provider]: !s[provider] }));
  };

  const PROVIDER_DOCS: Partial<Record<AIProvider, string>> = {
    openai: "https://platform.openai.com/api-keys",
    anthropic: "https://console.anthropic.com/settings/keys",
    gemini: "https://aistudio.google.com/app/apikey",
    groq: "https://console.groq.com/keys",
    deepseek: "https://platform.deepseek.com/api-keys",
    openrouter: "https://openrouter.ai/settings/keys",
    mistral: "https://console.mistral.ai/api-keys",
  };

  return (
    <div className="p-4 md:p-6 max-w-3xl mx-auto space-y-4 md:space-y-6">
      <div>
        <h1 className="text-xl md:text-2xl font-bold text-[var(--fg)]">AI Providers</h1>
        <p className="text-sm text-[var(--muted-fg)] mt-0.5">
          Connect your API keys to start using AI models. Keys are stored locally in your browser.
        </p>
      </div>

      <div className="rounded-xl border border-amber-200 bg-amber-50 dark:border-amber-800/50 dark:bg-amber-900/20 p-4 flex gap-3">
        <AlertCircle className="w-4 h-4 text-amber-600 dark:text-amber-400 mt-0.5 shrink-0" />
        <div>
          <p className="text-sm font-medium text-amber-800 dark:text-amber-300">API keys are client-side only</p>
          <p className="text-xs text-amber-700 dark:text-amber-400 mt-0.5">
            Keys are persisted in localStorage and sent directly to provider APIs. Never share your workspace.
          </p>
        </div>
      </div>

      <div className="space-y-4">
        {AI_PROVIDERS.map((provider, i) => {
          const hasKey = !!apiKeys[provider.id];
          const currentKey = apiKeys[provider.id] ?? "";
          const draft = drafts[provider.id] ?? "";
          const isShown = shown[provider.id] ?? false;
          const docUrl = PROVIDER_DOCS[provider.id];
          const freeModels = provider.models.filter((m) => m.isFree);

          return (
            <motion.div
              key={provider.id}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
            >
              <Card className={hasKey ? "border-emerald-200 dark:border-emerald-800/50" : ""}>
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div
                        className="w-9 h-9 rounded-xl flex items-center justify-center text-white text-xs font-bold"
                        style={{ background: provider.color }}
                      >
                        {provider.name.slice(0, 2).toUpperCase()}
                      </div>
                      <div>
                        <CardTitle className="text-sm">{provider.name}</CardTitle>
                        <CardDescription className="text-xs">
                          {provider.models.length} model{provider.models.length !== 1 ? "s" : ""}
                          {freeModels.length > 0 && (
                            <span className="ms-1.5">
                              · <span className="text-emerald-600 dark:text-emerald-400">{freeModels.length} free</span>
                            </span>
                          )}
                        </CardDescription>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {provider.id === "ollama" && (
                        <Badge variant="secondary" className="text-[10px]">Local</Badge>
                      )}
                      {hasKey ? (
                        <Badge variant="success" className="gap-1">
                          <Check className="w-3 h-3" />
                          Connected
                        </Badge>
                      ) : freeModels.length > 0 ? (
                        <Badge variant="brand">Free tier</Badge>
                      ) : (
                        <Badge variant="secondary">Not configured</Badge>
                      )}
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  {/* Models */}
                  <div className="flex flex-wrap gap-1.5">
                    {provider.models.map((m) => (
                      <Badge key={m.id} variant={m.isFree ? "success" : "secondary"} className="text-[10px]">
                        {m.name}
                      </Badge>
                    ))}
                  </div>

                  {/* API Key input */}
                  {provider.id !== "ollama" && (
                    <div className="flex gap-2">
                      <div className="relative flex-1">
                        <Input
                          type={isShown ? "text" : "password"}
                          placeholder={hasKey ? "••••••••••••••••" : "Enter API key..."}
                          value={draft}
                          onChange={(e) => setDrafts((d) => ({ ...d, [provider.id]: e.target.value }))}
                          className="pe-9 font-mono text-xs"
                        />
                        <button
                          type="button"
                          onClick={() => toggleShow(provider.id)}
                          className="absolute end-2.5 top-1/2 -translate-y-1/2 text-[var(--muted-fg)] hover:text-[var(--fg)]"
                        >
                          {isShown ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                        </button>
                      </div>
                      <Button
                        size="sm"
                        variant="gradient"
                        onClick={() => handleSave(provider.id)}
                        disabled={!draft.trim()}
                      >
                        <Save className="w-3.5 h-3.5" />
                        Save
                      </Button>
                      {hasKey && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleRemove(provider.id)}
                        >
                          <Trash2 className="w-3.5 h-3.5 text-[var(--destructive)]" />
                        </Button>
                      )}
                    </div>
                  )}

                  {/* Docs link */}
                  {docUrl && (
                    <a
                      href={docUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 text-xs text-[var(--primary)] hover:underline"
                    >
                      Get API key <ExternalLink className="w-3 h-3" />
                    </a>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
