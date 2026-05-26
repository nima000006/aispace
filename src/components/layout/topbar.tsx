"use client";

import { Search, Bell, User } from "lucide-react";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { CommandPalette } from "@/components/shared/command-palette";
import { useState } from "react";

interface TopbarProps {
  title?: string;
}

export function Topbar({ title }: TopbarProps) {
  const t = useTranslations("common");
  const [commandOpen, setCommandOpen] = useState(false);

  return (
    <>
      <header className="h-14 border-b border-[var(--card-border)] bg-[var(--bg)] flex items-center gap-4 px-6 shrink-0">
        {title && (
          <h1 className="text-base font-semibold text-[var(--fg)] me-auto">{title}</h1>
        )}

        {/* Search trigger */}
        <button
          onClick={() => setCommandOpen(true)}
          className="flex-1 max-w-sm flex items-center gap-2 h-8 px-3 rounded-lg border border-[var(--card-border)] bg-[var(--muted-bg)] text-sm text-[var(--muted-fg)] hover:bg-[var(--card-border)] transition-colors cursor-text"
        >
          <Search className="w-3.5 h-3.5 shrink-0" />
          <span className="flex-1 text-start">{t("search")}</span>
          <kbd className="hidden sm:inline-flex h-5 items-center gap-0.5 rounded border border-[var(--card-border)] bg-[var(--muted-bg)] px-1.5 text-[10px] font-medium">
            ⌘K
          </kbd>
        </button>

        <div className="flex items-center gap-1">
          <Button variant="ghost" size="icon" aria-label="Notifications">
            <Bell className="w-4 h-4 text-[var(--muted-fg)]" />
          </Button>
          <Button variant="ghost" size="icon" aria-label="Profile">
            <User className="w-4 h-4 text-[var(--muted-fg)]" />
          </Button>
        </div>
      </header>

      <CommandPalette open={commandOpen} onOpenChange={setCommandOpen} />
    </>
  );
}
