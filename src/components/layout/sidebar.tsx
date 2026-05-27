"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useTranslations, useLocale } from "next-intl";
import { AnimatePresence, motion } from "framer-motion";
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
  LogOut,
  X,
} from "lucide-react";
import Image from "next/image";
import { useEffect } from "react";
import { useSession, signOut } from "next-auth/react";
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
  const { sidebarCollapsed, toggleSidebar, mobileSidebarOpen, setMobileSidebarOpen } = useSettings();
  const { data: session } = useSession();
  const user = session?.user;
  const initials = user?.name
    ? user.name.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase()
    : "?";

  // Close mobile sidebar on route change
  useEffect(() => {
    setMobileSidebarOpen(false);
  }, [pathname]);

  const isActive = (href: string) => {
    const localePath = `/${locale}${href}`;
    if (href === "/dashboard") return pathname === localePath;
    return pathname.startsWith(localePath);
  };

  const closeMobile = () => setMobileSidebarOpen(false);

  return (
    <>
      {/* Mobile backdrop */}
      <AnimatePresence>
        {mobileSidebarOpen && (
          <motion.div
            key="backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm md:hidden"
            onClick={closeMobile}
          />
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <aside
        className={cn(
          // Layout
          "flex flex-col h-full bg-[var(--sidebar-bg)] border-e border-[var(--sidebar-border)] shrink-0 overflow-hidden z-50",
          // Mobile: fixed overlay, slide in/out
          "fixed inset-y-0 start-0",
          "transition-transform duration-[250ms] ease-[cubic-bezier(0.4,0,0.2,1)]",
          mobileSidebarOpen ? "translate-x-0" : "-translate-x-full rtl:translate-x-full",
          // Desktop: relative in flex flow, no translate
          "md:relative md:inset-auto md:translate-x-0 md:transition-[width] md:duration-[250ms]",
          // Width
          "w-[260px]",
          sidebarCollapsed ? "md:w-[72px]" : "md:w-[260px]",
        )}
      >
        {/* Logo */}
        <div className="flex items-center h-14 px-4 border-b border-[var(--sidebar-border)] shrink-0">
          <Link
            href={`/${locale}/dashboard`}
            className="flex items-center gap-2.5 min-w-0 flex-1"
            onClick={closeMobile}
          >
            <div className="w-7 h-7 rounded-lg gradient-brand flex items-center justify-center shrink-0">
              <Sparkles className="w-4 h-4 text-white" />
            </div>
            <AnimatePresence>
              {(!sidebarCollapsed) && (
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
          {/* Mobile close button */}
          <button
            onClick={closeMobile}
            className="md:hidden p-1.5 rounded-lg text-[var(--muted-fg)] hover:bg-[var(--muted-bg)] transition-colors"
            aria-label="Close sidebar"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* New Chat CTA */}
        <div className="px-3 py-3 border-b border-[var(--sidebar-border)]">
          <Link href={`/${locale}/playground`} onClick={closeMobile}>
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
                onClick={closeMobile}
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

        {/* User Section */}
        {user && (
          <div className={cn(
            "border-t border-[var(--sidebar-border)] p-3",
            sidebarCollapsed ? "flex flex-col items-center gap-2" : "flex items-center gap-2.5"
          )}>
            <div className="w-8 h-8 rounded-full overflow-hidden shrink-0 border border-[var(--card-border)]">
              {user.image ? (
                <Image
                  src={user.image}
                  alt={user.name ?? "avatar"}
                  width={32}
                  height={32}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full gradient-brand flex items-center justify-center text-white text-xs font-bold">
                  {initials}
                </div>
              )}
            </div>

            <AnimatePresence>
              {!sidebarCollapsed && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.15 }}
                  className="flex-1 min-w-0"
                >
                  <p className="text-xs font-semibold text-[var(--fg)] truncate">{user.name}</p>
                  <p className="text-[10px] text-[var(--muted-fg)] truncate">{user.email}</p>
                </motion.div>
              )}
            </AnimatePresence>

            <button
              onClick={() => signOut({ callbackUrl: `/${locale}/auth/sign-in` })}
              className="shrink-0 p-1.5 rounded-lg text-[var(--muted-fg)] hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-colors"
              title="Sign out"
            >
              <LogOut className="w-3.5 h-3.5" />
            </button>
          </div>
        )}

        {/* Bottom Controls */}
        <div className={cn(
          "border-t border-[var(--sidebar-border)] p-3",
          sidebarCollapsed ? "flex flex-col items-center gap-2" : "flex items-center justify-between"
        )}>
          <ThemeToggle collapsed={sidebarCollapsed} />
          {!sidebarCollapsed && <LocaleSwitcher />}
        </div>

        {/* Collapse Toggle — desktop only */}
        <button
          onClick={toggleSidebar}
          className="hidden md:flex absolute top-1/2 -end-3 z-20 h-6 w-6 -translate-y-1/2 items-center justify-center rounded-full border border-[var(--card-border)] bg-[var(--card-bg)] shadow-sm hover:bg-[var(--muted-bg)] transition-colors"
          aria-label="Toggle sidebar"
        >
          {sidebarCollapsed ? (
            <ChevronRight className="w-3 h-3 text-[var(--muted-fg)]" />
          ) : (
            <ChevronLeft className="w-3 h-3 text-[var(--muted-fg)]" />
          )}
        </button>
      </aside>
    </>
  );
}
