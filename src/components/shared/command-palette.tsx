"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useLocale, useTranslations } from "next-intl";
import {
  Command,
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from "cmdk";
import * as VisuallyHidden from "@radix-ui/react-visually-hidden";
import * as DialogPrimitive from "@radix-ui/react-dialog";
import {
  LayoutDashboard,
  Zap,
  BookMarked,
  CheckSquare,
  GitBranch,
  BarChart3,
  Settings,
  Plug,
} from "lucide-react";

interface CommandPaletteProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function CommandPalette({ open, onOpenChange }: CommandPaletteProps) {
  const router = useRouter();
  const locale = useLocale();
  const t = useTranslations("nav");

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if ((e.key === "k" && (e.metaKey || e.ctrlKey)) || e.key === "/") {
        e.preventDefault();
        onOpenChange(!open);
      }
    };
    document.addEventListener("keydown", down);
    return () => document.removeEventListener("keydown", down);
  }, [open, onOpenChange]);

  const navigate = (href: string) => {
    router.push(`/${locale}${href}`);
    onOpenChange(false);
  };

  const pages = [
    { label: t("dashboard"), href: "/dashboard", icon: LayoutDashboard },
    { label: t("playground"), href: "/playground", icon: Zap },
    { label: t("prompts"), href: "/prompts", icon: BookMarked },
    { label: t("tasks"), href: "/tasks", icon: CheckSquare },
    { label: t("workflows"), href: "/workflows", icon: GitBranch },
    { label: t("analytics"), href: "/analytics", icon: BarChart3 },
    { label: t("providers"), href: "/settings/providers", icon: Plug },
    { label: t("settings"), href: "/settings", icon: Settings },
  ];

  return (
    <CommandDialog open={open} onOpenChange={onOpenChange}>
      <VisuallyHidden.Root>
        <DialogPrimitive.Title>Command Palette</DialogPrimitive.Title>
      </VisuallyHidden.Root>
      <div
        className="fixed inset-0 z-50 flex items-start justify-center pt-[15vh]"
        onClick={() => onOpenChange(false)}
      >
        <div
          className="w-full max-w-xl rounded-2xl border border-[var(--card-border)] bg-[var(--card-bg)] shadow-2xl overflow-hidden"
          onClick={(e) => e.stopPropagation()}
        >
          <Command className="[&_[cmdk-group-heading]]:px-2 [&_[cmdk-group-heading]]:font-medium [&_[cmdk-group-heading]]:text-[var(--muted-fg)] [&_[cmdk-group]:not([hidden])_~[cmdk-group]]:pt-0 [&_[cmdk-input-wrapper]_svg]:h-4 [&_[cmdk-input-wrapper]_svg]:w-4 [&_[cmdk-input]]:h-12 [&_[cmdk-item]]:px-2 [&_[cmdk-item]]:py-2">
            <div className="flex items-center border-b border-[var(--card-border)] px-3">
              <svg
                className="me-2 h-4 w-4 shrink-0 text-[var(--muted-fg)]"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <circle cx="11" cy="11" r="8" strokeWidth="2" />
                <path d="m21 21-4.35-4.35" strokeWidth="2" strokeLinecap="round" />
              </svg>
              <input
                placeholder="Search pages, commands..."
                className="flex h-12 w-full rounded-md bg-transparent py-3 text-sm text-[var(--fg)] outline-none placeholder:text-[var(--muted-fg)] disabled:cursor-not-allowed disabled:opacity-50"
              />
            </div>

            <div className="max-h-80 overflow-y-auto p-2">
              <div className="pb-1">
                <p className="px-2 py-1.5 text-xs font-medium text-[var(--muted-fg)] uppercase tracking-wide">
                  Pages
                </p>
                {pages.map((page) => {
                  const Icon = page.icon;
                  return (
                    <button
                      key={page.href}
                      onClick={() => navigate(page.href)}
                      className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm text-[var(--fg)] hover:bg-[var(--muted-bg)] transition-colors"
                    >
                      <Icon className="h-4 w-4 text-[var(--muted-fg)]" />
                      {page.label}
                    </button>
                  );
                })}
              </div>
            </div>
          </Command>
        </div>
      </div>
    </CommandDialog>
  );
}
