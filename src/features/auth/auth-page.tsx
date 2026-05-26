"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useLocale, useTranslations } from "next-intl";
import { motion } from "framer-motion";
import { signIn } from "next-auth/react";
import { toast } from "sonner";
import { Sparkles, Mail, Eye, EyeOff, Loader2, User, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface AuthPageProps {
  mode: "sign-in" | "sign-up";
}

export function AuthPage({ mode }: AuthPageProps) {
  const t = useTranslations("auth");
  const locale = useLocale();
  const router = useRouter();

  const searchParams = useSearchParams();
  const urlError = searchParams.get("error");

  const errorMessages: Record<string, string> = {
    OAuthAccountNotLinked: "This email is already linked to another sign-in method. Please use the original method you signed up with.",
    OAuthCallbackError: "Something went wrong with the OAuth sign-in. Please try again.",
    OAuthCreateAccount: "Could not create an account. Please try again.",
    EmailSignin: "Could not send the sign-in email. Please try again.",
    CredentialsSignin: "Invalid email or password.",
    SessionRequired: "Please sign in to continue.",
    Default: "An error occurred. Please try again.",
  };

  const errorMessage = urlError ? (errorMessages[urlError] ?? errorMessages.Default) : null;

  const [oauthLoading, setOauthLoading] = useState<"google" | "github" | null>(null);
  const [emailLoading, setEmailLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  // ─── OAuth ────────────────────────────────────────────────────
  const handleOAuth = async (provider: "google" | "github") => {
    setOauthLoading(provider);
    await signIn(provider, { callbackUrl: `/${locale}/dashboard` });
  };

  // ─── Email / Password ─────────────────────────────────────────
  const handleEmailSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setEmailLoading(true);

    const form = new FormData(e.currentTarget);
    const name = form.get("name") as string;
    const email = form.get("email") as string;
    const password = form.get("password") as string;

    try {
      if (mode === "sign-up") {
        const res = await fetch("/api/auth/register", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ name, email, password }),
        });
        if (!res.ok) {
          const data = await res.json();
          toast.error(data.error ?? "Registration failed");
          return;
        }
      }

      const result = await signIn("credentials", {
        email,
        password,
        redirect: false,
      });

      if (result?.error) {
        toast.error(mode === "sign-in" ? "Invalid email or password" : "Sign-in after registration failed");
      } else {
        router.push(`/${locale}/dashboard`);
        router.refresh();
      }
    } catch {
      toast.error("Something went wrong. Please try again.");
    } finally {
      setEmailLoading(false);
    }
  };

  const isLoading = !!oauthLoading || emailLoading;

  return (
    <div className="min-h-screen flex items-center justify-center bg-[var(--bg)] relative overflow-hidden">
      {/* Background blobs */}
      <div className="absolute inset-0 -z-10">
        <div className="absolute top-1/4 left-1/3 w-96 h-96 rounded-full bg-[var(--primary)] opacity-[0.05] blur-3xl" />
        <div className="absolute bottom-1/4 right-1/3 w-96 h-96 rounded-full bg-purple-500 opacity-[0.05] blur-3xl" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="w-full max-w-sm mx-auto px-6"
      >
        {/* Logo */}
        <div className="flex justify-center mb-8">
          <Link href={`/${locale}`} className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl gradient-brand flex items-center justify-center shadow-lg">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <span className="font-bold text-xl text-[var(--fg)]">AISpace</span>
          </Link>
        </div>

        <div className="rounded-2xl border border-[var(--card-border)] bg-[var(--card-bg)] p-8 shadow-xl">
          <div className="mb-6 text-center">
            <h1 className="text-2xl font-bold text-[var(--fg)] mb-1">
              {mode === "sign-in" ? t("signIn") : t("signUp")}
            </h1>
            <p className="text-sm text-[var(--muted-fg)]">
              {mode === "sign-in" ? t("noAccount") : t("hasAccount")}{" "}
              <Link
                href={`/${locale}/auth/${mode === "sign-in" ? "sign-up" : "sign-in"}`}
                className="text-[var(--primary)] hover:underline font-medium"
              >
                {mode === "sign-in" ? t("signUp") : t("signIn")}
              </Link>
            </p>
          </div>

          {/* Error banner */}
          {errorMessage && (
            <div className="flex items-start gap-2.5 rounded-xl border border-rose-200 bg-rose-50 dark:border-rose-900 dark:bg-rose-950/30 px-4 py-3 mb-5">
              <AlertCircle className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
              <p className="text-sm text-rose-600 dark:text-rose-400">{errorMessage}</p>
            </div>
          )}

          {/* OAuth */}
          <div className="space-y-2.5">
            <Button
              variant="outline"
              className="w-full gap-3 h-11"
              type="button"
              disabled={isLoading}
              onClick={() => handleOAuth("google")}
            >
              {oauthLoading === "google" ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                </svg>
              )}
              {t("continueWithGoogle")}
            </Button>
            <Button
              variant="outline"
              className="w-full gap-3 h-11"
              type="button"
              disabled={isLoading}
              onClick={() => handleOAuth("github")}
            >
              {oauthLoading === "github" ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0 0 24 12c0-6.63-5.37-12-12-12z" />
                </svg>
              )}
              {t("continueWithGitHub")}
            </Button>
          </div>

          {/* Divider */}
          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-[var(--card-border)]" />
            </div>
            <div className="relative flex justify-center text-xs">
              <span className="bg-[var(--card-bg)] px-3 text-[var(--muted-fg)]">
                {t("orContinueWith")}
              </span>
            </div>
          </div>

          {/* Email / Password form */}
          <form onSubmit={handleEmailSubmit} className="space-y-3">
            {mode === "sign-up" && (
              <div>
                <label className="block text-sm font-medium text-[var(--fg)] mb-1.5">
                  Name
                </label>
                <Input
                  name="name"
                  type="text"
                  placeholder="Your name"
                  leftIcon={<User className="w-4 h-4" />}
                  disabled={isLoading}
                />
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-[var(--fg)] mb-1.5">
                {t("email")}
              </label>
              <Input
                name="email"
                type="email"
                placeholder="you@example.com"
                leftIcon={<Mail className="w-4 h-4" />}
                required
                disabled={isLoading}
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-sm font-medium text-[var(--fg)]">
                  {t("password")}
                </label>
                {mode === "sign-in" && (
                  <Link href="#" className="text-xs text-[var(--primary)] hover:underline">
                    {t("forgotPassword")}
                  </Link>
                )}
              </div>
              <Input
                name="password"
                type={showPassword ? "text" : "password"}
                placeholder={mode === "sign-up" ? "At least 8 characters" : "••••••••"}
                minLength={mode === "sign-up" ? 8 : undefined}
                rightIcon={
                  <button
                    type="button"
                    onClick={() => setShowPassword((v) => !v)}
                    className="pointer-events-auto"
                    tabIndex={-1}
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                }
                required
                disabled={isLoading}
              />
            </div>

            <Button
              type="submit"
              variant="gradient"
              className="w-full"
              size="lg"
              disabled={isLoading}
            >
              {emailLoading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                mode === "sign-in" ? t("signIn") : t("signUp")
              )}
            </Button>
          </form>
        </div>

        <p className="text-center text-xs text-[var(--muted-fg)] mt-5 px-4">
          {t("privacyNotice")}
        </p>
      </motion.div>
    </div>
  );
}
