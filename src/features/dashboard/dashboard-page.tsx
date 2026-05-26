"use client";

import { motion } from "framer-motion";
import { useTranslations } from "next-intl";
import {
  Zap, BookMarked, DollarSign, Activity,
  TrendingUp, ArrowUpRight, Plus, CheckCircle2,
  Circle, Layers, Sparkles,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { useAppStore, usePrompts, useTasks } from "@/store/app-store";
import { AI_PROVIDERS } from "@/lib/ai/providers";
import { formatTokens, formatCost, cn } from "@/lib/utils";
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from "recharts";
import Link from "next/link";
import { useLocale } from "next-intl";

const CHART_DATA = [
  { day: "Mon", tokens: 42000 },
  { day: "Tue", tokens: 68000 },
  { day: "Wed", tokens: 55000 },
  { day: "Thu", tokens: 91000 },
  { day: "Fri", tokens: 78000 },
  { day: "Sat", tokens: 45000 },
  { day: "Sun", tokens: 120000 },
];

const fadeUp = {
  hidden: { opacity: 0, y: 16 },
  visible: (i = 0) => ({
    opacity: 1, y: 0,
    transition: { delay: i * 0.06, duration: 0.4, ease: "easeOut" as const },
  }),
};

export function DashboardPage() {
  const t = useTranslations("dashboard");
  const tc = useTranslations("common");
  const locale = useLocale();
  const { prompts } = usePrompts();
  const { tasks } = useTasks();
  const apiKeys = useAppStore((s) => s.apiKeys);

  const stats = [
    {
      label: t("totalTokens"),
      value: formatTokens(3_200_000),
      change: "+12%",
      icon: Zap,
      color: "text-blue-500",
      bg: "bg-blue-50 dark:bg-blue-950/30",
    },
    {
      label: t("totalCost"),
      value: "$12.40",
      change: "+8%",
      icon: DollarSign,
      color: "text-emerald-500",
      bg: "bg-emerald-50 dark:bg-emerald-950/30",
    },
    {
      label: t("savedPrompts"),
      value: prompts.length.toString(),
      change: `${prompts.length} saved`,
      icon: BookMarked,
      color: "text-purple-500",
      bg: "bg-purple-50 dark:bg-purple-950/30",
    },
    {
      label: "Active Tasks",
      value: tasks.filter((t) => t.status === "in_progress").length.toString(),
      change: `${tasks.length} total`,
      icon: Activity,
      color: "text-orange-500",
      bg: "bg-orange-50 dark:bg-orange-950/30",
    },
  ];

  const enabledProviders = AI_PROVIDERS.filter((p) => !!apiKeys[p.id]);
  const recentTasks = tasks.slice(0, 5);

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <motion.div
        initial="hidden" animate="visible" variants={fadeUp}
        className="flex items-center justify-between"
      >
        <div>
          <h1 className="text-2xl font-bold text-[var(--fg)]">
            {t("welcome")}, Nima 👋
          </h1>
          <p className="text-sm text-[var(--muted-fg)] mt-0.5">
            Here's what's happening with your AI workspace today.
          </p>
        </div>
        <div className="flex gap-2">
          <Link href={`/${locale}/playground`}>
            <Button variant="gradient" size="sm" className="gap-1.5">
              <Plus className="w-3.5 h-3.5" />
              {t("newChat")}
            </Button>
          </Link>
        </div>
      </motion.div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, i) => {
          const Icon = stat.icon;
          return (
            <motion.div key={stat.label} initial="hidden" animate="visible" variants={fadeUp} custom={i}>
              <Card className="card-hover">
                <CardContent className="p-5">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="text-xs font-medium text-[var(--muted-fg)] mb-1">{stat.label}</p>
                      <p className="text-2xl font-bold text-[var(--fg)]">{stat.value}</p>
                      <p className="text-xs text-[var(--muted-fg)] mt-1 flex items-center gap-1">
                        <TrendingUp className="w-3 h-3 text-emerald-500" />
                        {stat.change}
                      </p>
                    </div>
                    <div className={cn("w-9 h-9 rounded-xl flex items-center justify-center", stat.bg)}>
                      <Icon className={cn("w-4 h-4", stat.color)} />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          );
        })}
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Token Usage Chart */}
        <motion.div
          initial="hidden" animate="visible" variants={fadeUp} custom={4}
          className="lg:col-span-2"
        >
          <Card>
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-sm font-semibold">Token Usage</CardTitle>
                  <CardDescription>Last 7 days</CardDescription>
                </div>
                <Badge variant="success">
                  <ArrowUpRight className="w-3 h-3" />
                  +12% vs last week
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="h-48">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={CHART_DATA} margin={{ top: 4, right: 4, bottom: 0, left: -20 }}>
                    <defs>
                      <linearGradient id="tokenGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.25} />
                        <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="var(--card-border)" />
                    <XAxis
                      dataKey="day"
                      tick={{ fontSize: 11, fill: "var(--muted-fg)" }}
                      axisLine={false}
                      tickLine={false}
                    />
                    <YAxis
                      tick={{ fontSize: 11, fill: "var(--muted-fg)" }}
                      axisLine={false}
                      tickLine={false}
                      tickFormatter={(v) => formatTokens(v)}
                    />
                    <Tooltip
                      contentStyle={{
                        background: "var(--card-bg)",
                        border: "1px solid var(--card-border)",
                        borderRadius: "8px",
                        fontSize: "12px",
                        color: "var(--fg)",
                      }}
                      formatter={(v) => [formatTokens(Number(v)), "Tokens"]}
                    />
                    <Area
                      type="monotone"
                      dataKey="tokens"
                      stroke="#3b82f6"
                      strokeWidth={2}
                      fill="url(#tokenGradient)"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Provider Status */}
        <motion.div initial="hidden" animate="visible" variants={fadeUp} custom={5}>
          <Card className="h-full">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-semibold">{t("providerStatus")}</CardTitle>
              <CardDescription>
                {enabledProviders.length} of {AI_PROVIDERS.length} configured
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-2.5">
              {AI_PROVIDERS.slice(0, 6).map((provider) => {
                const hasKey = !!apiKeys[provider.id];
                return (
                  <div key={provider.id} className="flex items-center gap-2.5">
                    <div
                      className="w-2 h-2 rounded-full shrink-0"
                      style={{
                        backgroundColor: hasKey ? "#22c55e" : "var(--card-border)",
                        boxShadow: hasKey ? `0 0 6px #22c55e` : "none",
                      }}
                    />
                    <span className="text-sm text-[var(--fg)] flex-1">{provider.name}</span>
                    <Badge variant={hasKey ? "success" : "secondary"} className="text-[10px]">
                      {hasKey ? "Active" : "Inactive"}
                    </Badge>
                  </div>
                );
              })}
              <Link href={`/${locale}/settings/providers`}>
                <Button variant="ghost" size="sm" className="w-full mt-1 text-xs">
                  Manage providers <ArrowUpRight className="w-3 h-3 ms-1" />
                </Button>
              </Link>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Quick Actions */}
        <motion.div initial="hidden" animate="visible" variants={fadeUp} custom={6}>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-semibold">{t("quickActions")}</CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-3 gap-3">
              {[
                { label: t("newChat"), href: "/playground", icon: Zap, color: "text-blue-500", bg: "bg-blue-50 dark:bg-blue-950/30" },
                { label: t("newPrompt"), href: "/prompts", icon: BookMarked, color: "text-purple-500", bg: "bg-purple-50 dark:bg-purple-950/30" },
                { label: t("newTask"), href: "/tasks", icon: CheckCircle2, color: "text-emerald-500", bg: "bg-emerald-50 dark:bg-emerald-950/30" },
              ].map((action) => {
                const Icon = action.icon;
                return (
                  <Link key={action.label} href={`/${locale}${action.href}`}>
                    <div className="card-hover rounded-xl border border-[var(--card-border)] p-4 text-center cursor-pointer">
                      <div className={cn("w-9 h-9 rounded-xl flex items-center justify-center mx-auto mb-2", action.bg)}>
                        <Icon className={cn("w-4 h-4", action.color)} />
                      </div>
                      <p className="text-xs font-medium text-[var(--fg)]">{action.label}</p>
                    </div>
                  </Link>
                );
              })}
            </CardContent>
          </Card>
        </motion.div>

        {/* Recent Tasks */}
        <motion.div initial="hidden" animate="visible" variants={fadeUp} custom={7}>
          <Card>
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-semibold">Recent Tasks</CardTitle>
                <Link href={`/${locale}/tasks`}>
                  <Button variant="ghost" size="sm" className="text-xs h-7">
                    {tc("viewAll")}
                  </Button>
                </Link>
              </div>
            </CardHeader>
            <CardContent>
              {recentTasks.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-8 text-center">
                  <Layers className="w-8 h-8 text-[var(--card-border)] mb-2" />
                  <p className="text-sm text-[var(--muted-fg)]">No tasks yet</p>
                  <Link href={`/${locale}/tasks`}>
                    <Button variant="ghost" size="sm" className="mt-2 text-xs">
                      Create your first task
                    </Button>
                  </Link>
                </div>
              ) : (
                <ul className="space-y-2">
                  {recentTasks.map((task) => (
                    <li key={task.id} className="flex items-center gap-2.5 py-1">
                      {task.status === "done" ? (
                        <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                      ) : (
                        <Circle className="w-4 h-4 text-[var(--card-border)] shrink-0" />
                      )}
                      <span className={cn(
                        "text-sm flex-1 truncate",
                        task.status === "done" ? "line-through text-[var(--muted-fg)]" : "text-[var(--fg)]"
                      )}>
                        {task.title}
                      </span>
                      <Badge
                        variant={
                          task.priority === "urgent" ? "destructive"
                          : task.priority === "high" ? "warning"
                          : "secondary"
                        }
                        className="text-[10px] shrink-0"
                      >
                        {task.priority}
                      </Badge>
                    </li>
                  ))}
                </ul>
              )}
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}
