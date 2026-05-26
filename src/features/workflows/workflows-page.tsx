"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { useTranslations } from "next-intl";
import {
  Plus, Play, Pause, Trash2, GitBranch, Zap, BookMarked,
  ArrowRight, Settings, MoreHorizontal, Clock,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface MockWorkflow {
  id: string;
  name: string;
  description: string;
  isActive: boolean;
  nodeCount: number;
  lastRun?: string;
  runs: number;
}

const MOCK_WORKFLOWS: MockWorkflow[] = [
  {
    id: "1",
    name: "Content Summarizer",
    description: "Takes a URL or text, summarizes it with Claude, then formats it as a tweet thread.",
    isActive: true,
    nodeCount: 4,
    lastRun: "2 hours ago",
    runs: 47,
  },
  {
    id: "2",
    name: "Code Review Pipeline",
    description: "Runs code through multiple AI models, aggregates feedback, and generates a review report.",
    isActive: false,
    nodeCount: 6,
    lastRun: "1 day ago",
    runs: 12,
  },
  {
    id: "3",
    name: "Daily AI News Digest",
    description: "Scheduled workflow that fetches AI news, summarizes with Gemini, and drafts a newsletter.",
    isActive: true,
    nodeCount: 5,
    lastRun: "6 hours ago",
    runs: 94,
  },
];

const NODE_TYPES = [
  { type: "input", label: "Input", icon: ArrowRight, color: "bg-blue-500" },
  { type: "prompt", label: "Prompt", icon: BookMarked, color: "bg-purple-500" },
  { type: "ai", label: "AI Model", icon: Zap, color: "bg-amber-500" },
  { type: "condition", label: "Condition", icon: GitBranch, color: "bg-emerald-500" },
  { type: "output", label: "Output", icon: Settings, color: "bg-rose-500" },
];

export function WorkflowsPage() {
  const t = useTranslations("nav");
  const [workflows, setWorkflows] = useState(MOCK_WORKFLOWS);

  const toggleActive = (id: string) => {
    setWorkflows((w) =>
      w.map((wf) => (wf.id === id ? { ...wf, isActive: !wf.isActive } : wf))
    );
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[var(--fg)]">{t("workflows")}</h1>
          <p className="text-sm text-[var(--muted-fg)] mt-0.5">
            Build AI pipelines that chain prompts and models together.
          </p>
        </div>
        <Button variant="gradient" className="gap-1.5">
          <Plus className="w-4 h-4" />
          New Workflow
        </Button>
      </div>

      {/* Visual hint: node types */}
      <div className="rounded-xl border border-[var(--card-border)] bg-[var(--card-bg)] p-4">
        <p className="text-xs font-medium text-[var(--muted-fg)] mb-3 uppercase tracking-wide">
          Available Node Types
        </p>
        <div className="flex flex-wrap gap-2">
          {NODE_TYPES.map((node) => {
            const Icon = node.icon;
            return (
              <div
                key={node.type}
                className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-[var(--card-border)] bg-[var(--muted-bg)]"
              >
                <div className={cn("w-5 h-5 rounded-md flex items-center justify-center", node.color)}>
                  <Icon className="w-3 h-3 text-white" />
                </div>
                <span className="text-xs font-medium text-[var(--fg)]">{node.label}</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Mock workflow canvas preview */}
      <div className="rounded-2xl border border-[var(--card-border)] bg-[var(--muted-bg)] p-6 relative overflow-hidden">
        <p className="text-xs font-medium text-[var(--muted-fg)] mb-4 uppercase tracking-wide">
          Workflow Canvas Preview
        </p>
        <div className="flex items-center gap-4 overflow-x-auto pb-2">
          {NODE_TYPES.map((node, i) => {
            const Icon = node.icon;
            return (
              <div key={node.type} className="flex items-center gap-3 shrink-0">
                <motion.div
                  initial={{ scale: 0.9, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ delay: i * 0.1 }}
                  className="flex flex-col items-center gap-2"
                >
                  <div className={cn(
                    "w-14 h-14 rounded-2xl flex items-center justify-center shadow-md",
                    node.color
                  )}>
                    <Icon className="w-6 h-6 text-white" />
                  </div>
                  <span className="text-[10px] font-medium text-[var(--muted-fg)]">{node.label}</span>
                </motion.div>
                {i < NODE_TYPES.length - 1 && (
                  <div className="flex items-center gap-0.5">
                    <div className="h-px w-6 bg-[var(--card-border)]" />
                    <ArrowRight className="w-3 h-3 text-[var(--muted-fg)]" />
                    <div className="h-px w-6 bg-[var(--card-border)]" />
                  </div>
                )}
              </div>
            );
          })}
        </div>
        <div className="absolute bottom-3 end-4">
          <Badge variant="secondary" className="text-[10px]">
            Full node editor coming soon
          </Badge>
        </div>
      </div>

      {/* Workflows list */}
      <div className="space-y-3">
        <h2 className="text-sm font-semibold text-[var(--fg)]">Your Workflows</h2>
        {workflows.map((wf, i) => (
          <motion.div
            key={wf.id}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.07 }}
          >
            <Card className="card-hover">
              <CardContent className="p-5">
                <div className="flex items-center gap-4">
                  <div className={cn(
                    "w-10 h-10 rounded-xl flex items-center justify-center shrink-0",
                    wf.isActive ? "bg-emerald-100 dark:bg-emerald-900/30" : "bg-[var(--muted-bg)]"
                  )}>
                    <GitBranch className={cn(
                      "w-5 h-5",
                      wf.isActive ? "text-emerald-600 dark:text-emerald-400" : "text-[var(--muted-fg)]"
                    )} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-0.5">
                      <h3 className="text-sm font-semibold text-[var(--fg)]">{wf.name}</h3>
                      <Badge variant={wf.isActive ? "success" : "secondary"} className="text-[10px]">
                        {wf.isActive ? "Active" : "Paused"}
                      </Badge>
                    </div>
                    <p className="text-xs text-[var(--muted-fg)] line-clamp-1">{wf.description}</p>
                    <div className="flex items-center gap-3 mt-1.5 text-[10px] text-[var(--muted-fg)]">
                      <span className="flex items-center gap-1">
                        <GitBranch className="w-3 h-3" /> {wf.nodeCount} nodes
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3" /> {wf.lastRun}
                      </span>
                      <span>{wf.runs} runs</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <Button
                      variant="outline"
                      size="icon-sm"
                      onClick={() => toggleActive(wf.id)}
                    >
                      {wf.isActive
                        ? <Pause className="w-3.5 h-3.5 text-amber-500" />
                        : <Play className="w-3.5 h-3.5 text-emerald-500" />
                      }
                    </Button>
                    <Button variant="outline" size="icon-sm">
                      <Settings className="w-3.5 h-3.5 text-[var(--muted-fg)]" />
                    </Button>
                    <Button variant="ghost" size="icon-sm">
                      <Trash2 className="w-3.5 h-3.5 text-[var(--muted-fg)]" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
