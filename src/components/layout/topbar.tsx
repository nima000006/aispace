"use client";

import { Search, Bell, LogOut, User } from "lucide-react";
import { useTranslations, useLocale } from "next-intl";
import { useSession, signOut } from "next-auth/react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { CommandPalette } from "@/components/shared/command-palette";
import { useState } from "react";
import { cn } from "@/lib/utils";

export function Topbar() {
  const t = useTranslations("common");
  const locale = useLocale();
  const { data: session } = useSession();
  const [commandOpen, setCommandOpen] = useState(false);
  const [avatarMenuOpen, setAvatarMenuOpen] = useState(false);

  const user = session?.user;
  const initials = user?.name
    ? user.name.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase()
    : "?";

  return (
    <>
      <header className="h-14 border-b border-[var(--card-border)] bg-[var(--bg)] flex items-center gap-4 px-6 shrink-0">
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

          {/* User avatar menu */}
          <div className="relative">
            <button
              onClick={() => setAvatarMenuOpen((v) => !v)}
              className="w-8 h-8 rounded-full overflow-hidden border-2 border-[var(--card-border)] hover:border-[var(--primary)] transition-colors focus:outline-none"
              aria-label="User menu"
            >
              {user?.image ? (
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
            </button>

            {avatarMenuOpen && (
              <>
                {/* Backdrop */}
                <div
                  className="fixed inset-0 z-40"
                  onClick={() => setAvatarMenuOpen(false)}
                />
                {/* Dropdown */}
                <div className="absolute end-0 top-10 z-50 w-56 rounded-xl border border-[var(--card-border)] bg-[var(--card-bg)] shadow-xl p-1.5">
                  {user && (
                    <div className="px-3 py-2.5 border-b border-[var(--card-border)] mb-1">
                      <p className="text-sm font-semibold text-[var(--fg)] truncate">{user.name}</p>
                      <p className="text-xs text-[var(--muted-fg)] truncate">{user.email}</p>
                    </div>
                  )}
                  <button
                    onClick={() => {
                      setAvatarMenuOpen(false);
                      signOut({ callbackUrl: `/${locale}/auth/sign-in` });
                    }}
                    className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-colors"
                  >
                    <LogOut className="w-4 h-4" />
                    Sign out
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </header>

      <CommandPalette open={commandOpen} onOpenChange={setCommandOpen} />
    </>
  );
}
