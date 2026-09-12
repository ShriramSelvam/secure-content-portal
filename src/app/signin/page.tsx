"use client";

import { signIn } from "next-auth/react";
import { Suspense } from "react";
import { useSearchParams } from "next/navigation";

function SignInInner() {
  const params = useSearchParams();
  const error = params.get("error");

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="w-full max-w-sm text-center">
        <h1 className="text-2xl font-semibold text-ink tracking-tight mb-2">Content Portal</h1>
        <p className="text-sm text-ink/60 mb-8">
          Sign in with your organization Google account to view training and reference material.
        </p>

        {error && (
          <p className="mb-6 text-sm text-danger bg-danger/5 border border-danger/20 rounded-md px-3 py-2">
            Sign-in failed. Please try again.
          </p>
        )}

        <button
          onClick={() => signIn("google", { callbackUrl: "/dashboard" })}
          className="w-full inline-flex items-center justify-center gap-3 rounded-md border border-line bg-white px-4 py-2.5 text-sm font-medium text-ink hover:bg-paper transition-colors"
        >
          <svg width="18" height="18" viewBox="0 0 18 18" aria-hidden="true">
            <path
              fill="#4285F4"
              d="M17.64 9.2c0-.64-.06-1.25-.16-1.84H9v3.48h4.84a4.14 4.14 0 0 1-1.8 2.72v2.26h2.9c1.7-1.57 2.7-3.88 2.7-6.62z"
            />
            <path
              fill="#34A853"
              d="M9 18c2.43 0 4.47-.8 5.96-2.18l-2.9-2.26c-.8.54-1.84.86-3.06.86-2.35 0-4.34-1.59-5.05-3.72H.9v2.33A9 9 0 0 0 9 18z"
            />
            <path
              fill="#FBBC05"
              d="M3.95 10.7A5.4 5.4 0 0 1 3.67 9c0-.59.1-1.16.28-1.7V4.97H.9A9 9 0 0 0 0 9c0 1.45.35 2.83.9 4.03z"
            />
            <path
              fill="#EA4335"
              d="M9 3.58c1.32 0 2.5.45 3.44 1.35l2.58-2.58C13.46.89 11.43 0 9 0A9 9 0 0 0 .9 4.97L3.95 7.3C4.66 5.17 6.65 3.58 9 3.58z"
            />
          </svg>
          Sign in with Google
        </button>
      </div>
    </div>
  );
}

export default function SignInPage() {
  return (
    <Suspense>
      <SignInInner />
    </Suspense>
  );
}
