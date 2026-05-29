"use client";

import { useState } from "react";
import Link from "next/link";
import { Mail } from "lucide-react";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const res = await fetch("/api/auth/request-password-reset", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, redirectTo: "/reset-password" }),
      });
      if (!res.ok) throw new Error("Request failed");

      setSubmitted(true);
    } catch {
      setError("An unexpected error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  if (submitted) {
    return (
      <div className="rounded-xl border border-rosely-blush bg-white p-8 shadow-sm">
        <div className="flex flex-col items-center text-center">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-rosely-teal/20">
            <Mail className="h-6 w-6 text-rosely-teal" />
          </div>
          <h2 className="mt-4 text-xl font-bold text-rosely-night">Check Your Email</h2>
          <p className="mt-2 text-sm text-rosely-mist">
            If an account exists with <strong className="text-rosely-night">{email}</strong>,
            you&apos;ll receive a password reset link shortly.
          </p>
          <Link
            href="/login"
            className="mt-6 text-sm font-medium text-rosely-plum hover:text-rosely-mauve"
          >
            Back to Sign In
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-rosely-blush bg-white p-8 shadow-sm">
      <h2 className="text-xl font-bold text-rosely-night">Reset Password</h2>
      <p className="mt-1 text-sm text-rosely-mist">
        Enter your email and we&apos;ll send you a reset link
      </p>

      {error && (
        <div className="mt-4 rounded-lg border border-rosely-rose/30 bg-rosely-rose/10 px-4 py-3 text-sm text-rosely-rose">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="mt-6 space-y-4">
        <div>
          <label htmlFor="email" className="block text-sm font-medium text-rosely-night">
            Email
          </label>
          <input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            autoComplete="email"
            className="mt-1 w-full rounded-lg border border-rosely-blush px-3 py-2 text-sm text-rosely-night placeholder:text-rosely-mist focus:border-rosely-lilac focus:outline-none focus:ring-1 focus:ring-rosely-lilac"
            placeholder="you@company.com"
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="flex w-full items-center justify-center gap-2 rounded-lg bg-rosely-plum px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-rosely-mauve disabled:opacity-50"
        >
          {loading ? (
            <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
          ) : (
            <Mail className="h-4 w-4" />
          )}
          Send Reset Link
        </button>
      </form>

      <p className="mt-6 text-center text-sm text-rosely-mist">
        Remember your password?{" "}
        <Link href="/login" className="font-medium text-rosely-plum hover:text-rosely-mauve">
          Sign In
        </Link>
      </p>
    </div>
  );
}
