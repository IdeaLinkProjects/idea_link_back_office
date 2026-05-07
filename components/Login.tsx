"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import { FetchBaseQueryError } from "@reduxjs/toolkit/query";
import { useRouter } from "next/navigation";
import { useLoginMutation } from "@/lib/services/adminApi";

type LoginErrorData = {
  message?: string;
};

export function Login() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const [login, { data, error, isError, isLoading, isSuccess }] = useLoginMutation();

  useEffect(() => {
    const hasAccessToken = document.cookie
      .split("; ")
      .some((cookie) => cookie.startsWith("accessToken="));

    if (hasAccessToken) {
      router.replace("/dashboard");
    }
  }, [router]);

  const errorMessage = useMemo(() => {
    if (!isError || !error) {
      return "";
    }

    if ("data" in error) {
      const apiError = error as FetchBaseQueryError;
      const payload = apiError.data as LoginErrorData | undefined;
      return payload?.message ?? "Login failed. Please check your credentials and try again.";
    }

    return "Network error. Please try again.";
  }, [error, isError]);

  const onSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    try {
      const result = await login({ email: email.trim(), password }).unwrap();

      document.cookie = `accessToken=${result.accessToken}; path=/; max-age=${result.expiresIn}; samesite=lax`;
      document.cookie = `refreshToken=${result.refreshToken}; path=/; max-age=${result.refreshTokenExpiresIn}; samesite=lax`;

      if (!result.requiresOtpVerification) {
        router.push("/dashboard");
      }
    } catch {
      // RTK Query handles error state used by the UI message block.
    }
  };

  return (
    <main className="flex min-h-screen items-center justify-center bg-gradient-to-br from-slate-950 via-slate-900 to-slate-800 px-4 py-10">
      <div className="w-full max-w-md rounded-2xl border border-white/10 bg-slate-900/80 p-7 shadow-2xl backdrop-blur">
        <div className="mb-6 text-center">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-emerald-300">Welcome Back</p>
          <h1 className="mt-2 text-3xl font-bold text-white">Sign in to your account</h1>
          <p className="mt-2 text-sm text-slate-300">Use your email and password to continue.</p>
        </div>

        <form className="space-y-4" onSubmit={onSubmit}>
          <div>
            <label htmlFor="email" className="mb-1 block text-sm font-medium text-slate-200">
              Email
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              className="w-full rounded-lg border border-slate-700 bg-slate-950 px-4 py-2.5 text-sm text-slate-100 outline-none transition focus:border-emerald-400 focus:ring-2 focus:ring-emerald-400/30"
              placeholder="you@example.com"
              required
            />
          </div>

          <div>
            <label htmlFor="password" className="mb-1 block text-sm font-medium text-slate-200">
              Password
            </label>
            <div className="relative">
              <input
                id="password"
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                className="w-full rounded-lg border border-slate-700 bg-slate-950 px-4 py-2.5 pr-20 text-sm text-slate-100 outline-none transition focus:border-emerald-400 focus:ring-2 focus:ring-emerald-400/30"
                placeholder="Enter your password"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword((value) => !value)}
                className="absolute inset-y-0 right-2 my-auto h-8 rounded-md px-3 text-xs font-semibold text-slate-300 transition hover:bg-slate-800 hover:text-white"
              >
                {showPassword ? "Hide" : "Show"}
              </button>
            </div>
          </div>

          {isError ? (
            <p className="rounded-lg border border-rose-500/40 bg-rose-500/10 px-3 py-2 text-sm text-rose-200">
              {errorMessage}
            </p>
          ) : null}

          {isSuccess && data ? (
            <p className="rounded-lg border border-emerald-500/40 bg-emerald-500/10 px-3 py-2 text-sm text-emerald-200">
              {data.message || `Signed in as ${data.userInfo.fullName}`}
            </p>
          ) : null}

          <button
            type="submit"
            disabled={isLoading}
            className="w-full rounded-lg bg-emerald-500 px-4 py-2.5 text-sm font-semibold text-emerald-950 transition hover:bg-emerald-400 disabled:cursor-not-allowed disabled:opacity-70"
          >
            {isLoading ? "Signing in..." : "Sign In"}
          </button>
        </form>
      </div>
    </main>
  );
}
