"use client";

import { AlertTriangle, RefreshCw } from "lucide-react";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="min-h-screen flex items-center justify-center px-4 bg-background">
      <div className="max-w-md w-full text-center">
        <div className="bg-card border border-border shadow-sm rounded-2xl p-8 md:p-10">
          <div className="mx-auto w-16 h-16 rounded-full bg-destructive/10 flex items-center justify-center mb-5">
            <AlertTriangle className="h-8 w-8 text-destructive" />
          </div>
          <h1 className="text-6xl font-black text-destructive mb-3">500</h1>
          <h2 className="text-xl font-bold text-foreground mb-2">Something went wrong!</h2>
          <p className="text-muted-foreground mb-8 text-sm">{error.message || "An unexpected error occurred."}</p>
          <button
            onClick={reset}
            className="inline-flex items-center gap-2 bg-primary text-primary-foreground font-semibold px-6 py-3 rounded-lg hover:opacity-90 transition shadow-sm"
          >
            <RefreshCw className="h-4 w-4" />
            Try Again
          </button>
        </div>
      </div>
    </div>
  );
}
