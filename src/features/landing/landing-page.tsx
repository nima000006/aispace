"use client";

import { useTranslations, useLocale } from "next-intl";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  Sparkles, Zap, BookMarked, BarChart3, CheckSquare, GitBranch,
  Layers, ArrowRight, Check, ChevronDown, Star, Globe2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ThemeToggle } from "@/components/shared/theme-toggle";
import { LocaleSwitcher } from "@/components/shared/locale-switcher";
import { useState } from "react";
import { cn } from "@/lib/utils";

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  visible: (i = 0) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.08, duration: 0.5, ease: "easeOut" as const },
  }),
};

const FEATURE_ICONS = [Layers, Zap, BookMarked, BarChart3, CheckSquare, GitBranch];
const FEATURE_COLORS = [
  "text-blue-500", "text-purple-500", "text-emerald-500",
  "text-orange-500", "text-rose-500", "text-cyan-500",
];

export function LandingPage() {
  const t = useTranslations("landing");
  const tc = useTranslations("common");
  const ta = useTranslations("auth");
  const locale = useLocale();
  const isRTL = locale === "fa";
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  const featureKeys = [
    "multiProvider", "playground", "prompts",
    "analytics", "tasks", "workflows",
  ] as const;

  const pricingKeys = ["free", "pro", "enterprise"] as const;

  return (
    <div className="min-h-screen bg-[var(--bg)]">
      {/* ── Navbar ──────────────────────────────────────────── */}
      <header className="fixed top-0 inset-x-0 z-50 h-16 border-b border-[var(--card-border)] glass">
        <div className="max-w-7xl mx-auto h-full px-6 flex items-center justify-between">
          <Link href={`/${locale}`} className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl gradient-brand flex items-center justify-center">
              <Sparkles className="w-4 h-4 text-white" />
            </div>
            <span className="font-bold text-lg text-[var(--fg)]">AISpace</span>
          </Link>

          <nav className="hidden md:flex items-center gap-6">
            {["Features", "Pricing", "FAQ"].map((item) => (
              <a
                key={item}
                href={`#${item.toLowerCase()}`}
                className="text-sm text-[var(--muted-fg)] hover:text-[var(--fg)] transition-colors"
              >
                {item}
              </a>
            ))}
          </nav>

          <div className="flex items-center gap-3">
            <ThemeToggle />
            <LocaleSwitcher />
            <Link href={`/${locale}/auth/sign-in`}>
              <Button variant="ghost" size="sm">
                {ta("signIn")}
              </Button>
            </Link>
            <Link href={`/${locale}/auth/sign-up`}>
              <Button size="sm" variant="gradient">
                {t("hero.cta")}
              </Button>
            </Link>
          </div>
        </div>
      </header>

      {/* ── Hero ────────────────────────────────────────────── */}
      <section className="relative pt-32 pb-20 overflow-hidden">
        {/* Background mesh */}
        <div className="absolute inset-0 -z-10 overflow-hidden">
          <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[800px] h-[800px] rounded-full bg-[var(--primary)] opacity-[0.04] blur-3xl" />
          <div className="absolute top-1/3 left-1/4 w-[400px] h-[400px] rounded-full bg-purple-500 opacity-[0.04] blur-3xl" />
          <div className="absolute top-1/3 right-1/4 w-[400px] h-[400px] rounded-full bg-cyan-500 opacity-[0.04] blur-3xl" />
        </div>

        <div className="max-w-5xl mx-auto px-6 text-center">
          <motion.div
            initial="hidden"
            animate="visible"
            variants={fadeUp}
            custom={0}
          >
            <Badge variant="brand" className="mb-6 px-4 py-1.5 text-xs font-semibold tracking-wide uppercase">
              <Sparkles className="w-3 h-3" />
              {t("hero.badge")}
            </Badge>
          </motion.div>

          <motion.h1
            initial="hidden"
            animate="visible"
            variants={fadeUp}
            custom={1}
            className="text-5xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight leading-[1.05] mb-6"
          >
            <span className="text-[var(--fg)]">{t("hero.title")} </span>
            <span className="gradient-text">{t("hero.titleHighlight")}</span>
          </motion.h1>

          <motion.p
            initial="hidden"
            animate="visible"
            variants={fadeUp}
            custom={2}
            className="text-lg sm:text-xl text-[var(--muted-fg)] max-w-2xl mx-auto mb-10 leading-relaxed"
          >
            {t("hero.subtitle")}
          </motion.p>

          <motion.div
            initial="hidden"
            animate="visible"
            variants={fadeUp}
            custom={3}
            className="flex flex-col sm:flex-row items-center justify-center gap-3"
          >
            <Link href={`/${locale}/auth/sign-up`}>
              <Button size="xl" variant="gradient" className="gap-2">
                <Sparkles className="w-4 h-4" />
                {t("hero.cta")}
                <ArrowRight className="w-4 h-4" />
              </Button>
            </Link>
            <Link href={`/${locale}/playground`}>
              <Button size="xl" variant="outline">
                {t("hero.ctaSecondary")}
              </Button>
            </Link>
          </motion.div>

          {/* Hero visual */}
          <motion.div
            initial={{ opacity: 0, y: 48, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ delay: 0.4, duration: 0.7, ease: "easeOut" }}
            className="mt-16 relative mx-auto max-w-4xl"
          >
            <div className="rounded-2xl border border-[var(--card-border)] bg-[var(--card-bg)] shadow-2xl overflow-hidden">
              {/* Mock browser chrome */}
              <div className="flex items-center gap-2 px-4 py-3 border-b border-[var(--card-border)] bg-[var(--muted-bg)]">
                <div className="flex gap-1.5">
                  <div className="w-3 h-3 rounded-full bg-red-400" />
                  <div className="w-3 h-3 rounded-full bg-yellow-400" />
                  <div className="w-3 h-3 rounded-full bg-green-400" />
                </div>
                <div className="flex-1 h-6 rounded-md bg-[var(--card-border)] mx-4" />
              </div>
              {/* Mock dashboard */}
              <div className="flex h-64 bg-[var(--bg)]">
                {/* Sidebar mock */}
                <div className="w-48 border-e border-[var(--card-border)] bg-[var(--card-bg)] p-3 space-y-1">
                  {[LayoutDashboardMock, ZapMock, BookMark, CheckSq, ChartBar].map((_, i) => (
                    <div key={i} className={cn(
                      "h-7 rounded-lg flex items-center gap-2 px-2",
                      i === 0 ? "bg-[var(--accent-bg)]" : ""
                    )}>
                      <div className={cn("w-3 h-3 rounded-sm", i === 0 ? "bg-[var(--accent-fg)]" : "bg-[var(--card-border)]")} />
                      <div className={cn("h-2 rounded flex-1", i === 0 ? "bg-[var(--accent-fg)] opacity-40" : "bg-[var(--card-border)]")} />
                    </div>
                  ))}
                </div>
                {/* Main mock */}
                <div className="flex-1 p-4 space-y-3">
                  <div className="grid grid-cols-3 gap-2">
                    {[["3.2M", "Tokens"], ["$12.40", "Cost"], ["47", "Prompts"]].map(([v, l]) => (
                      <div key={l} className="rounded-lg border border-[var(--card-border)] bg-[var(--card-bg)] p-3">
                        <div className="text-lg font-bold text-[var(--fg)]">{v}</div>
                        <div className="text-xs text-[var(--muted-fg)]">{l}</div>
                      </div>
                    ))}
                  </div>
                  <div className="rounded-lg border border-[var(--card-border)] bg-[var(--card-bg)] p-3 flex-1">
                    <div className="h-2 w-1/3 rounded bg-[var(--muted-bg)] mb-3" />
                    <div className="flex items-end gap-1 h-20">
                      {[40, 65, 50, 80, 70, 90, 75, 85, 60, 95, 70, 88].map((h, i) => (
                        <div
                          key={i}
                          className="flex-1 rounded-sm gradient-brand opacity-70"
                          style={{ height: `${h}%` }}
                        />
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ── Features ────────────────────────────────────────── */}
      <section id="features" className="py-24 bg-[var(--muted-bg)]">
        <div className="max-w-6xl mx-auto px-6">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeUp}
            className="text-center mb-16"
          >
            <h2 className="text-3xl sm:text-4xl font-bold text-[var(--fg)] mb-4">
              {t("features.title")}
            </h2>
            <p className="text-[var(--muted-fg)] text-lg max-w-xl mx-auto">
              {t("features.subtitle")}
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {featureKeys.map((key, i) => {
              const Icon = FEATURE_ICONS[i];
              return (
                <motion.div
                  key={key}
                  initial="hidden"
                  whileInView="visible"
                  viewport={{ once: true }}
                  variants={fadeUp}
                  custom={i}
                  className="card-hover rounded-xl border border-[var(--card-border)] bg-[var(--card-bg)] p-6"
                >
                  <div className={cn(
                    "w-10 h-10 rounded-xl flex items-center justify-center mb-4",
                    "bg-[var(--muted-bg)]"
                  )}>
                    <Icon className={cn("w-5 h-5", FEATURE_COLORS[i])} />
                  </div>
                  <h3 className="font-semibold text-[var(--fg)] mb-2">
                    {t(`features.${key}.title`)}
                  </h3>
                  <p className="text-sm text-[var(--muted-fg)] leading-relaxed">
                    {t(`features.${key}.description`)}
                  </p>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── Pricing ─────────────────────────────────────────── */}
      <section id="pricing" className="py-24">
        <div className="max-w-5xl mx-auto px-6">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeUp}
            className="text-center mb-16"
          >
            <h2 className="text-3xl sm:text-4xl font-bold text-[var(--fg)] mb-4">
              {t("pricing.title")}
            </h2>
            <p className="text-[var(--muted-fg)] text-lg">{t("pricing.subtitle")}</p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-6">
            {pricingKeys.map((plan, i) => (
              <motion.div
                key={plan}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                variants={fadeUp}
                custom={i}
                className={cn(
                  "rounded-2xl border p-7 relative",
                  plan === "pro"
                    ? "border-[var(--primary)] bg-[var(--card-bg)] shadow-xl shadow-[var(--primary)]/10 scale-105"
                    : "border-[var(--card-border)] bg-[var(--card-bg)]"
                )}
              >
                {plan === "pro" && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                    <Badge variant="default" className="px-3 py-1 text-xs font-bold">
                      Most Popular
                    </Badge>
                  </div>
                )}
                <div className="mb-6">
                  <p className="text-sm font-semibold text-[var(--muted-fg)] uppercase tracking-wide mb-1">
                    {t(`pricing.${plan}.name`)}
                  </p>
                  <p className="text-4xl font-extrabold text-[var(--fg)]">
                    {t(`pricing.${plan}.price`)}
                    {plan !== "enterprise" && (
                      <span className="text-base font-normal text-[var(--muted-fg)]">/mo</span>
                    )}
                  </p>
                  <p className="text-sm text-[var(--muted-fg)] mt-2">
                    {t(`pricing.${plan}.description`)}
                  </p>
                </div>
                <ul className="space-y-3 mb-8">
                  {(t.raw(`pricing.${plan}.features`) as string[]).map((f: string) => (
                    <li key={f} className="flex items-start gap-2 text-sm text-[var(--fg)]">
                      <Check className="w-4 h-4 text-emerald-500 mt-0.5 shrink-0" />
                      {f}
                    </li>
                  ))}
                </ul>
                <Link href={`/${locale}/auth/sign-up`}>
                  <Button
                    variant={plan === "pro" ? "gradient" : "outline"}
                    className="w-full"
                  >
                    {plan === "enterprise" ? "Contact Sales" : "Get Started"}
                  </Button>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FAQ ─────────────────────────────────────────────── */}
      <section id="faq" className="py-24 bg-[var(--muted-bg)]">
        <div className="max-w-2xl mx-auto px-6">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeUp}
            className="text-center mb-12"
          >
            <h2 className="text-3xl sm:text-4xl font-bold text-[var(--fg)]">
              {t("faq.title")}
            </h2>
          </motion.div>

          <div className="space-y-3">
            {[1, 2, 3, 4].map((n) => (
              <motion.div
                key={n}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                variants={fadeUp}
                custom={n}
                className="rounded-xl border border-[var(--card-border)] bg-[var(--card-bg)] overflow-hidden"
              >
                <button
                  className="w-full flex items-center justify-between px-5 py-4 text-start"
                  onClick={() => setOpenFaq(openFaq === n ? null : n)}
                >
                  <span className="font-medium text-[var(--fg)] text-sm">
                    {t(`faq.q${n}` as `faq.q${1 | 2 | 3 | 4}`)}
                  </span>
                  <ChevronDown
                    className={cn(
                      "w-4 h-4 text-[var(--muted-fg)] transition-transform duration-200 shrink-0",
                      openFaq === n && "rotate-180"
                    )}
                  />
                </button>
                {openFaq === n && (
                  <div className="px-5 pb-4 text-sm text-[var(--muted-fg)] leading-relaxed border-t border-[var(--card-border)] pt-3">
                    {t(`faq.a${n}` as `faq.a${1 | 2 | 3 | 4}`)}
                  </div>
                )}
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ─────────────────────────────────────────────── */}
      <section className="py-24">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeUp}
            className="rounded-3xl gradient-brand p-1"
          >
            <div className="rounded-[20px] bg-[var(--bg)] px-10 py-16">
              <Badge variant="brand" className="mb-4">
                <Globe2 className="w-3 h-3" />
                Bilingual — English & Persian
              </Badge>
              <h2 className="text-3xl sm:text-4xl font-extrabold text-[var(--fg)] mb-4">
                Start building smarter <span className="gradient-text">today</span>
              </h2>
              <p className="text-[var(--muted-fg)] mb-8 max-w-lg mx-auto">
                Join thousands of developers and teams using AISpace to supercharge their AI workflow.
              </p>
              <Link href={`/${locale}/auth/sign-up`}>
                <Button size="xl" variant="gradient">
                  <Sparkles className="w-4 h-4" />
                  {t("hero.cta")}
                  <ArrowRight className="w-4 h-4" />
                </Button>
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ── Footer ──────────────────────────────────────────── */}
      <footer className="border-t border-[var(--card-border)] py-10">
        <div className="max-w-7xl mx-auto px-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-lg gradient-brand flex items-center justify-center">
              <Sparkles className="w-3.5 h-3.5 text-white" />
            </div>
            <span className="font-bold text-sm text-[var(--fg)]">AISpace</span>
          </div>
          <p className="text-xs text-[var(--muted-fg)]">
            © 2026 AISpace. Built with Next.js, Tailwind CSS & ❤️
          </p>
        </div>
      </footer>
    </div>
  );
}

// Mock icons for the hero dashboard preview (just colored divs)
function LayoutDashboardMock() { return null; }
function ZapMock() { return null; }
function BookMark() { return null; }
function CheckSq() { return null; }
function ChartBar() { return null; }
