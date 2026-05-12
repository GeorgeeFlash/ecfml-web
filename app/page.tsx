import { redirect } from "next/navigation";
import { auth } from "@clerk/nextjs/server";
import Link from "next/link";

export default async function Home() {
  const { userId } = await auth();

  if (userId) {
    redirect("/dashboard");
  }

  // Unauthenticated users see a minimal landing page
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-linear-to-br from-background via-background to-primary/5 px-6">
      <div className="text-center space-y-6 max-w-2xl">
        <div className="flex justify-center">
          <div className="flex size-16 items-center justify-center rounded-2xl bg-primary/10 text-primary">
            <svg
              width="32"
              height="32"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" />
            </svg>
          </div>
        </div>
        <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">ECFML</h1>
        <p className="text-lg text-muted-foreground leading-relaxed">
          Electricity Consumption Forecasting using Machine Learning — comparing
          Random Forest, SVR, and LLM-Agent forecasting for the North West
          Region of Cameroon.
        </p>
        <div className="flex gap-3 justify-center">
          <Link
            href="/sign-in"
            className="inline-flex h-11 items-center justify-center rounded-lg bg-primary px-6 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            Sign In
          </Link>
          <Link
            href="/sign-up"
            className="inline-flex h-11 items-center justify-center rounded-lg border bg-background px-6 text-sm font-medium transition-colors hover:bg-accent"
          >
            Create Account
          </Link>
        </div>
        <p className="text-xs text-muted-foreground pt-4">
          University of Bamenda — Faculty of Science — 2025/2026
        </p>
      </div>
    </div>
  );
}
