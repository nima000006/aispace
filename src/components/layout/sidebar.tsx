"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useTranslations, useLocale } from "next-intl";
import { motion, AnimatePresence } from "framer-motion";
import {
  LayoutDashboard,
  Zap,
  BookMarked,
  CheckSquare,
  GitBranch,
  BarChart3,
  Settings,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  Plus,
  Plug,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useSettings } from "@/store/app-store";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/shared/theme-toggle";
import { LocaleSwitcher } from "@/components/shared/locale-switcher";

interface NavItem {
  key: string;
  href: string;
  icon: React.ElementType;
}

const NAV_ITEMS: NavItem[] = [
  { key: "dashboard", href: "/dashboard", icon: LayoutDashboard },
  { key: "playground", href: "/playground", icon: Zap },
  { key: "prompts", href: "/prompts", icon: BookMarked },
  { key: "tasks", href: "/tasks", icon: CheckSquare },
  { key: "workflows", href: "/workflows", icon: GitBranch },
  { key: "analytics", href: "/analytics", icon: BarChart3 },
  { key: "providers", href: "/settings/providers", icon: Plug },
  { key: "settings", href: "/settings", icon: Settings },
];

export function Sidebar() {
  const t = useTranslations("nav");
  const locale = useLocale();
  const pathname = usePathname();
  const { sidebarCollapsed, toggleSidebar } = useSettings();

  const isActive = (href: string) => {
    const localePath = `/${locale}${href}`;
    if (href === "/dashboard") return pathname === localePath;
    return pathname.startsWith(localePath);
  };

  return (
    <motion.aside
      animate={{ width: sidebarCollapsed ? 72 : 260 }}
      transition={{ duration: 0.25, ease: [0.4, 0, 0.2, 1] }}
      className="relative flex flex-col h-full bg-[var(--sidebar-bg)] border-e border-[var(--sidebar-border)] shrink-0 overflow-hidden z-10"
    >
      {/* Logo */}
      <div className="flex items-center h-14 px-4 border-b border-[var(--sidebar-border)] shrink-0">
        <Link
          href={`/${locale}/dashboard`}
          className="flex items-center gap-2.5 min-w-0"
        >
          <div className="w-7 h-7 rounded-lg gradient-brand flex items-center justify-center shrink-0">
            <Sparkles className="w-4 h-4 text-white" />
          </div>
          <AnimatePresence>
            {!sidebarCollapsed && (
              <motion.span
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -8 }}
                transition={{ duration: 0.15 }}
                className="font-bold text-base text-[var(--fg)] whitespace-nowrap"
              >
                AISpace
              </motion.span>
            )}
          </AnimatePresence>
        </Link>
      </div>

      {/* New Chat CTA */}
      <div className="px-3 py-3 border-b border-[var(--sidebar-border)]">
        <Link href={`/${locale}/playground`}>
          <Button
            variant="gradient"
            size={sidebarCollapsed ? "icon" : "default"}
            className="w-full"
          >
            <Plus className="w-4 h-4 shrink-0" />
            <AnimatePresence>
              {!sidebarCollapsed && (
                <motion.span
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="whitespace-nowrap"
                >
                  New Chat
                </motion.span>
              )}
            </AnimatePresence>
          </Button>
        </Link>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto py-3 px-2 space-y-0.5">
        {NAV_ITEMS.map((item) => {
          const Icon = item.icon;
          const active = isActive(item.href);

          return (
            <Link
              key={item.key}
              href={`/${locale}${item.href}`}
              className={cn(
                "sidebar-item flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium",
                "hover:bg-[var(--muted-bg)]",
                active
                  ? "bg-[var(--accent-bg)] text-[var(--accent-fg)]"
                  : "text-[var(--muted-fg)] hover:text-[var(--fg)]"
              )}
            >
              <Icon className={cn("w-4 h-4 shrink-0", active && "text-[var(--accent-fg)]")} />
              <AnimatePresence>
                {!sidebarCollapsed && (
                  <motion.span
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.15 }}
                    className="whitespace-nowrap"
                  >
                    {t(item.key as Parameters<typeof t>[0])}
                  </motion.span>
                )}
              </AnimatePresence>
            </Link>
          );
        })}
      </nav>

      {/* Bottom Controls */}
      <div className={cn(
        "border-t border-[var(--sidebar-border)] p-3",
        sidebarCollapsed ? "flex flex-col items-center gap-2" : "flex items-center justify-between"
      )}>
        <ThemeToggle collapsed={sidebarCollapsed} />
        {!sidebarCollapsed && <LocaleSwitcher />}
      </div>

      {/* Collapse Toggle */}
      <button
        onClick={toggleSidebar}
        className="absolute top-1/2 -end-3 z-20 flex h-6 w-6 -translate-y-1/2 items-center justify-center rounded-full border border-[var(--card-border)] bg-[var(--card-bg)] shadow-sm hover:bg-[var(--muted-bg)] transition-colors"
        aria-label="Toggle sidebar"
      >
        {sidebarCollapsed ? (
          <ChevronRight className="w-3 h-3 text-[var(--muted-fg)]" />
        ) : (
          <ChevronLeft className="w-3 h-3 text-[var(--muted-fg)]" />
        )}
      </button>
    </motion.aside>
  );
}
