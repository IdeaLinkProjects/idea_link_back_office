"use client";

import { FormEvent, useMemo, useState } from "react";
import { FetchBaseQueryError } from "@reduxjs/toolkit/query";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { AppLogo } from "@/components/AppLogo";
import { useAcceptAdminInvitationMutation } from "@/lib/services/adminApi";

type ApiErrorData = {
  message?: string;
};

export function AcceptAdminInvite() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token") ?? "";

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [validationError, setValidationError] = useState<string | null>(null);

  const [acceptInvitation, { data, error, isError, isLoading, isSuccess }] =
    useAcceptAdminInvitationMutation();

  const errorMessage = useMemo(() => {
    if (validationError) {
      return validationError;
    }

    if (!isError || !error) {
      return "";
    }

    if ("data" in error) {
      const apiError = error as FetchBaseQueryError;
      const payload = apiError.data as ApiErrorData | undefined;
      return payload?.message ?? "Failed to accept invitation. Please try again.";
    }

    return "Network error. Please try again.";
  }, [error, isError, validationError]);

  const onSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setValidationError(null);

    if (!token) {
      setValidationError("Invalid invitation link. The token is missing.");
      return;
    }

    if (password !== confirmPassword) {
      setValidationError("Passwords do not match.");
      return;
    }

    try {
      await acceptInvitation({
        token,
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        password,
        confirmPassword,
      }).unwrap();
    } catch {
      // RTK Query handles error state used by the UI message block.
    }
  };

  if (!token) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-gradient-to-br from-slate-950 via-slate-900 to-slate-800 px-4 py-10">
        <div className="w-full max-w-md rounded-2xl border border-white/10 bg-slate-900/80 p-7 shadow-2xl backdrop-blur">
          <div className="mb-6 flex flex-col items-center text-center">
            <AppLogo className="mx-auto mb-5 w-48 sm:w-56" priority />
            <h1 className="text-2xl font-bold text-white">Invalid invitation link</h1>
            <p className="mt-2 text-sm text-slate-300">
              This link is missing a token. Please use the link from your invitation email.
            </p>
          </div>
          <Link
            href="/"
            className="block w-full rounded-lg bg-emerald-500 px-4 py-2.5 text-center text-sm font-semibold text-emerald-950 transition hover:bg-emerald-400"
          >
            Go to sign in
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-gradient-to-br from-slate-950 via-slate-900 to-slate-800 px-4 py-10">
      <div className="w-full max-w-md rounded-2xl border border-white/10 bg-slate-900/80 p-7 shadow-2xl backdrop-blur">
        <div className="mb-6 flex flex-col items-center text-center">
          <AppLogo className="mx-auto mb-5 w-48 sm:w-56" priority />
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-emerald-300">Admin invitation</p>
          <h1 className="mt-2 text-3xl font-bold text-white">Create your account</h1>
          <p className="mt-2 text-sm text-slate-300">
            Complete your profile to accept the admin invitation.
          </p>
        </div>

        {isSuccess ? (
          <div className="space-y-4">
            <p className="rounded-lg border border-emerald-500/40 bg-emerald-500/10 px-3 py-2 text-sm text-emerald-200">
              {data?.message ?? "Your admin account has been created. You can now sign in."}
            </p>
            <button
              type="button"
              onClick={() => router.push("/")}
              className="w-full rounded-lg bg-emerald-500 px-4 py-2.5 text-sm font-semibold text-emerald-950 transition hover:bg-emerald-400"
            >
              Go to sign in
            </button>
          </div>
        ) : (
          <form className="space-y-4" onSubmit={onSubmit}>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label htmlFor="firstName" className="mb-1 block text-sm font-medium text-slate-200">
                  First name
                </label>
                <input
                  id="firstName"
                  type="text"
                  value={firstName}
                  onChange={(event) => setFirstName(event.target.value)}
                  className="w-full rounded-lg border border-slate-700 bg-slate-950 px-4 py-2.5 text-sm text-slate-100 outline-none transition focus:border-emerald-400 focus:ring-2 focus:ring-emerald-400/30"
                  placeholder="Jane"
                  required
                />
              </div>
              <div>
                <label htmlFor="lastName" className="mb-1 block text-sm font-medium text-slate-200">
                  Last name
                </label>
                <input
                  id="lastName"
                  type="text"
                  value={lastName}
                  onChange={(event) => setLastName(event.target.value)}
                  className="w-full rounded-lg border border-slate-700 bg-slate-950 px-4 py-2.5 text-sm text-slate-100 outline-none transition focus:border-emerald-400 focus:ring-2 focus:ring-emerald-400/30"
                  placeholder="Doe"
                  required
                />
              </div>
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
                  placeholder="Create a password"
                  required
                  minLength={8}
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

            <div>
              <label htmlFor="confirmPassword" className="mb-1 block text-sm font-medium text-slate-200">
                Confirm password
              </label>
              <input
                id="confirmPassword"
                type={showPassword ? "text" : "password"}
                value={confirmPassword}
                onChange={(event) => setConfirmPassword(event.target.value)}
                className="w-full rounded-lg border border-slate-700 bg-slate-950 px-4 py-2.5 text-sm text-slate-100 outline-none transition focus:border-emerald-400 focus:ring-2 focus:ring-emerald-400/30"
                placeholder="Confirm your password"
                required
                minLength={8}
              />
            </div>

            {isError || validationError ? (
              <p className="rounded-lg border border-rose-500/40 bg-rose-500/10 px-3 py-2 text-sm text-rose-200">
                {errorMessage}
              </p>
            ) : null}

            <button
              type="submit"
              disabled={isLoading}
              className="w-full rounded-lg bg-emerald-500 px-4 py-2.5 text-sm font-semibold text-emerald-950 transition hover:bg-emerald-400 disabled:cursor-not-allowed disabled:opacity-70"
            >
              {isLoading ? "Creating account..." : "Accept invitation"}
            </button>
          </form>
        )}
      </div>
    </main>
  );
}
