"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ThemeProvider } from "next-themes";
import { SessionProvider } from "next-auth/react";
import { Toaster } from "sonner";
import { useState, useEffect } from "react";
import { useAppStore } from "@/store/app-store";

export function Providers({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    useAppStore.persist.rehydrate();
  }, []);

  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: { staleTime: 60 * 1000, retry: 1 },
        },
      })
  );

  return (
    <SessionProvider>
      <QueryClientProvider client={queryClient}>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange={false}
        >
          {children}
          <Toaster
            position="bottom-right"
            expand={false}
            richColors
            closeButton
            toastOptions={{
              style: {
                background: "var(--card-bg)",
                color: "var(--fg)",
                border: "1px solid var(--card-border)",
              },
            }}
          />
        </ThemeProvider>
      </QueryClientProvider>
    </SessionProvider>
  );
}
