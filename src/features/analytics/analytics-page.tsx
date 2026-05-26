"use client";

import { motion } from "framer-motion";
import { useTranslations } from "next-intl";
import { useState, useEffect } from "react";
import {
  AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatTokens, formatCost } from "@/lib/utils";
import { TrendingUp, TrendingDown, Zap, DollarSign, BarChart3 } from "lucide-react";

const DAILY_DATA = [
  { day: "Mon", input: 28000, output: 14000, cost: 0.42 },
  { day: "Tue", input: 45000, output: 23000, cost: 0.68 },
  { day: "Wed", input: 38000, output: 17000, cost: 0.55 },
  { day: "Thu", input: 62000, output: 29000, cost: 0.91 },
  { day: "Fri", input: 55000, output: 23000, cost: 0.78 },
  { day: "Sat", input: 31000, output: 14000, cost: 0.45 },
  { day: "Sun", input: 80000, output: 40000, cost: 1.20 },
];

const PROVIDER_DATA = [
  { name: "Groq", tokens: 1_200_000, cost: 0, color: "#f55036" },
  { name: "Gemini", tokens: 900_000, cost: 0, color: "#4285f4" },
  { name: "OpenAI", tokens: 600_000, cost: 9.0, color: "#10a37f" },
  { name: "Anthropic", tokens: 300_000, cost: 4.5, color: "#d97757" },
  { name: "OpenRouter", tokens: 200_000, cost: 0, color: "#7c3aed" },
];

const MONTHLY_DATA = [
  { month: "Jan", tokens: 1_200_000 },
  { month: "Feb", tokens: 1_800_000 },
  { month: "Mar", tokens: 2_400_000 },
  { month: "Apr", tokens: 2_100_000 },
  { month: "May", tokens: 3_200_000 },
];

const fadeUp = {
  hidden: { opacity: 0, y: 16 },
  visible: (i = 0) => ({ opacity: 1, y: 0, transition: { delay: i * 0.07, duration: 0.4 } }),
};

const tooltipStyle = {
  background: "var(--card-bg)",
  border: "1px solid var(--card-border)",
  borderRadius: "8px",
  fontSize: "12px",
  color: "var(--fg)",
};

export function AnalyticsPage() {
  const t = useTranslations("analytics");
  const [mounted, setMounted] = useState(false);
  useEffect(() => { setMounted(true); }, []);

  const totalTokens = DAILY_DATA.reduce((s, d) => s + d.input + d.output, 0);
  const totalCost = DAILY_DATA.reduce((s, d) => s + d.cost, 0);

  const stats = [
    {
      label: "Total Tokens (Week)",
      value: formatTokens(totalTokens),
      trend: "+12%",
      up: true,
      icon: Zap,
      color: "text-blue-500",
      bg: "bg-blue-50 dark:bg-blue-950/30",
    },
    {
      label: "Total Cost (Week)",
      value: `$${totalCost.toFixed(2)}`,
      trend: "+8%",
      up: true,
      icon: DollarSign,
      color: "text-emerald-500",
      bg: "bg-emerald-50 dark:bg-emerald-950/30",
    },
    {
      label: "Avg Cost / 1K Tokens",
      value: `$${((totalCost / totalTokens) * 1000).toFixed(4)}`,
      trend: "-5%",
      up: false,
      icon: BarChart3,
      color: "text-purple-500",
      bg: "bg-purple-50 dark:bg-purple-950/30",
    },
    {
      label: "Free Tokens Used",
      value: formatTokens(2_100_000),
      trend: "65%",
      up: true,
      icon: TrendingUp,
      color: "text-orange-500",
      bg: "bg-orange-50 dark:bg-orange-950/30",
    },
  ];

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <motion.div initial="hidden" animate="visible" variants={fadeUp}>
        <h1 className="text-2xl font-bold text-[var(--fg)]">{t("title")}</h1>
        <p className="text-sm text-[var(--muted-fg)] mt-0.5">
          Last 7 days · Updated just now
        </p>
      </motion.div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((s, i) => {
          const Icon = s.icon;
          return (
            <motion.div key={s.label} initial="hidden" animate="visible" variants={fadeUp} custom={i}>
              <Card className="card-hover">
                <CardContent className="p-5">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="text-xs text-[var(--muted-fg)] mb-1">{s.label}</p>
                      <p className="text-2xl font-bold text-[var(--fg)]">{s.value}</p>
                      <p className={`text-xs mt-1 flex items-center gap-0.5 ${s.up ? "text-emerald-500" : "text-rose-500"}`}>
                        {s.up ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                        {s.trend} vs last week
                      </p>
                    </div>
                    <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${s.bg}`}>
                      <Icon className={`w-4 h-4 ${s.color}`} />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          );
        })}
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Daily Token Usage */}
        <motion.div
          initial="hidden" animate="visible" variants={fadeUp} custom={4}
          className="lg:col-span-2"
        >
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-semibold">Daily Token Usage</CardTitle>
              <CardDescription>Input vs Output tokens this week</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-56">
                {mounted ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={DAILY_DATA} margin={{ top: 4, right: 4, bottom: 0, left: -20 }}>
                      <defs>
                        <linearGradient id="inputGrad" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                          <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                        </linearGradient>
                        <linearGradient id="outputGrad" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.3} />
                          <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="var(--card-border)" />
                      <XAxis dataKey="day" tick={{ fontSize: 11, fill: "var(--muted-fg)" }} axisLine={false} tickLine={false} />
                      <YAxis tick={{ fontSize: 11, fill: "var(--muted-fg)" }} axisLine={false} tickLine={false} tickFormatter={formatTokens} />
                      <Tooltip contentStyle={tooltipStyle} formatter={(v, name) => [formatTokens(Number(v)), name]} />
                      <Legend wrapperStyle={{ fontSize: "11px" }} />
                      <Area type="monotone" dataKey="input" name="Input" stroke="#3b82f6" strokeWidth={2} fill="url(#inputGrad)" />
                      <Area type="monotone" dataKey="output" name="Output" stroke="#8b5cf6" strokeWidth={2} fill="url(#outputGrad)" />
                    </AreaChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="animate-shimmer h-full rounded-lg" />
                )}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Provider Breakdown Pie */}
        <motion.div initial="hidden" animate="visible" variants={fadeUp} custom={5}>
          <Card className="h-full">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-semibold">By Provider</CardTitle>
              <CardDescription>Token distribution</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-40">
                {mounted ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={PROVIDER_DATA}
                        cx="50%"
                        cy="50%"
                        innerRadius={40}
                        outerRadius={64}
                        paddingAngle={3}
                        dataKey="tokens"
                      >
                        {PROVIDER_DATA.map((entry, i) => (
                          <Cell key={i} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip
                        contentStyle={tooltipStyle}
                        formatter={(v) => [formatTokens(Number(v)), "Tokens"]}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="animate-shimmer h-full rounded-lg" />
                )}
              </div>
              <div className="space-y-1.5 mt-2">
                {PROVIDER_DATA.map((p) => (
                  <div key={p.name} className="flex items-center gap-2 text-xs">
                    <div className="w-2.5 h-2.5 rounded-full shrink-0" style={{ background: p.color }} />
                    <span className="flex-1 text-[var(--fg)]">{p.name}</span>
                    <span className="text-[var(--muted-fg)]">{formatTokens(p.tokens)}</span>
                    {p.cost === 0 && (
                      <Badge variant="success" className="text-[9px] px-1.5">Free</Badge>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Monthly Bar Chart */}
      <motion.div initial="hidden" animate="visible" variants={fadeUp} custom={6}>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-semibold">Monthly Token Trend</CardTitle>
            <CardDescription>Growing usage over time</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-48">
              {mounted ? (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={MONTHLY_DATA} margin={{ top: 4, right: 4, bottom: 0, left: -20 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="var(--card-border)" />
                    <XAxis dataKey="month" tick={{ fontSize: 11, fill: "var(--muted-fg)" }} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fontSize: 11, fill: "var(--muted-fg)" }} axisLine={false} tickLine={false} tickFormatter={formatTokens} />
                    <Tooltip contentStyle={tooltipStyle} formatter={(v) => [formatTokens(Number(v)), "Tokens"]} />
                    <Bar dataKey="tokens" fill="#3b82f6" radius={[6, 6, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="animate-shimmer h-full rounded-lg" />
              )}
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
