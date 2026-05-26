"use client";

import { useLocale } from "next-intl";
import { useRouter, usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";

export function LocaleSwitcher() {
  const locale = useLocale();
  const router = useRouter();
  const pathname = usePathname();

  const switchLocale = () => {
    const next = locale === "en" ? "fa" : "en";
    const newPath = pathname.replace(`/${locale}`, `/${next}`);
    router.push(newPath);
  };

  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={switchLocale}
      className="text-[var(--muted-fg)] hover:text-[var(--fg)] text-xs font-medium px-2"
      aria-label="Switch language"
    >
      {locale === "en" ? "فا" : "EN"}
    </Button>
  );
}
