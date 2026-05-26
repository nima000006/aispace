"use client";

import { useTranslations } from "next-intl";
import { useTheme } from "next-themes";
import { motion } from "framer-motion";
import { Sun, Moon, Monitor, Globe, User, Bell, CreditCard } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useSettings } from "@/store/app-store";
import { cn } from "@/lib/utils";

const fadeUp = {
  hidden: { opacity: 0, y: 12 },
  visible: (i = 0) => ({ opacity: 1, y: 0, transition: { delay: i * 0.06, duration: 0.35 } }),
};

export function SettingsPage() {
  const t = useTranslations("settings");
  const { theme: storedTheme, locale, setLocale } = useSettings();
  const { theme, setTheme } = useTheme();

  const themes = [
    { value: "light", label: t("theme.light"), icon: Sun },
    { value: "dark", label: t("theme.dark"), icon: Moon },
    { value: "system", label: t("theme.system"), icon: Monitor },
  ];

  return (
    <div className="p-6 max-w-2xl mx-auto space-y-6">
      <motion.div initial="hidden" animate="visible" variants={fadeUp}>
        <h1 className="text-2xl font-bold text-[var(--fg)]">{t("title")}</h1>
        <p className="text-sm text-[var(--muted-fg)] mt-0.5">
          Manage your account preferences and workspace settings.
        </p>
      </motion.div>

      {/* Profile */}
      <motion.div initial="hidden" animate="visible" variants={fadeUp} custom={1}>
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <User className="w-4 h-4 text-[var(--muted-fg)]" />
              <CardTitle className="text-sm">{t("profile")}</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-2xl gradient-brand flex items-center justify-center text-white text-xl font-bold">
                N
              </div>
              <div className="flex-1 space-y-3">
                <div>
                  <label className="block text-xs font-medium text-[var(--muted-fg)] mb-1.5">
                    Display Name
                  </label>
                  <Input defaultValue="Nima" className="max-w-xs" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-[var(--muted-fg)] mb-1.5">
                    Email
                  </label>
                  <Input defaultValue="nima@example.com" type="email" className="max-w-xs" />
                </div>
              </div>
            </div>
            <div className="flex justify-end">
              <Button variant="gradient" size="sm">Save Profile</Button>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Appearance */}
      <motion.div initial="hidden" animate="visible" variants={fadeUp} custom={2}>
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Sun className="w-4 h-4 text-[var(--muted-fg)]" />
              <CardTitle className="text-sm">{t("appearance")}</CardTitle>
            </div>
            <CardDescription className="text-xs">Choose your preferred color scheme.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-3 gap-3">
              {themes.map(({ value, label, icon: Icon }) => (
                <button
                  key={value}
                  onClick={() => setTheme(value)}
                  className={cn(
                    "flex flex-col items-center gap-2.5 rounded-xl border p-4 transition-all",
                    theme === value
                      ? "border-[var(--primary)] bg-[var(--accent-bg)]"
                      : "border-[var(--card-border)] hover:border-[var(--primary)]/40"
                  )}
                >
                  <div className={cn(
                    "w-10 h-10 rounded-xl flex items-center justify-center",
                    theme === value ? "bg-[var(--primary)] text-white" : "bg-[var(--muted-bg)] text-[var(--muted-fg)]"
                  )}>
                    <Icon className="w-5 h-5" />
                  </div>
                  <span className={cn(
                    "text-xs font-medium",
                    theme === value ? "text-[var(--accent-fg)]" : "text-[var(--muted-fg)]"
                  )}>
                    {label}
                  </span>
                </button>
              ))}
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Language */}
      <motion.div initial="hidden" animate="visible" variants={fadeUp} custom={3}>
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Globe className="w-4 h-4 text-[var(--muted-fg)]" />
              <CardTitle className="text-sm">{t("language")}</CardTitle>
            </div>
            <CardDescription className="text-xs">
              Switch between English and Persian (RTL support included).
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-3 max-w-xs">
              {[
                { value: "en" as const, label: "English", sub: "LTR" },
                { value: "fa" as const, label: "فارسی", sub: "RTL" },
              ].map(({ value, label, sub }) => (
                <button
                  key={value}
                  onClick={() => setLocale(value)}
                  className={cn(
                    "flex flex-col items-center gap-1.5 rounded-xl border p-3.5 transition-all",
                    locale === value
                      ? "border-[var(--primary)] bg-[var(--accent-bg)]"
                      : "border-[var(--card-border)] hover:border-[var(--primary)]/40"
                  )}
                >
                  <span className={cn("text-base font-semibold",
                    locale === value ? "text-[var(--accent-fg)]" : "text-[var(--fg)]"
                  )}>
                    {label}
                  </span>
                  <span className="text-[10px] text-[var(--muted-fg)]">{sub}</span>
                </button>
              ))}
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Notifications */}
      <motion.div initial="hidden" animate="visible" variants={fadeUp} custom={4}>
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Bell className="w-4 h-4 text-[var(--muted-fg)]" />
              <CardTitle className="text-sm">{t("notifications")}</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            {[
              { label: "Usage alerts", description: "Get notified when nearing token limits" },
              { label: "Workflow completions", description: "Alerts when automated workflows finish" },
              { label: "New AI model releases", description: "Updates about new supported models" },
            ].map((item, i) => (
              <div key={i} className="flex items-center justify-between py-1">
                <div>
                  <p className="text-sm font-medium text-[var(--fg)]">{item.label}</p>
                  <p className="text-xs text-[var(--muted-fg)]">{item.description}</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input type="checkbox" defaultChecked={i === 0} className="sr-only peer" />
                  <div className="w-9 h-5 bg-[var(--card-border)] peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-[var(--primary)]" />
                </label>
              </div>
            ))}
          </CardContent>
        </Card>
      </motion.div>

      {/* Billing */}
      <motion.div initial="hidden" animate="visible" variants={fadeUp} custom={5}>
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <CreditCard className="w-4 h-4 text-[var(--muted-fg)]" />
              <CardTitle className="text-sm">{t("billing")}</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between rounded-xl border border-[var(--card-border)] bg-[var(--muted-bg)] p-4">
              <div>
                <p className="text-sm font-semibold text-[var(--fg)]">Free Plan</p>
                <p className="text-xs text-[var(--muted-fg)]">100 messages/month · 3 providers</p>
              </div>
              <Button variant="gradient" size="sm">Upgrade to Pro</Button>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
