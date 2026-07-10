"use client";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html lang="en">
      <body>
        <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "system-ui, sans-serif" }}>
          <div style={{ textAlign: "center", padding: "2rem" }}>
            <h1 style={{ fontSize: "3rem", fontWeight: 900, color: "#ef4444" }}>500</h1>
            <h2 style={{ fontSize: "1.25rem", fontWeight: 600, marginBottom: "0.5rem" }}>Something went wrong!</h2>
            <p style={{ color: "#6b7280", marginBottom: "2rem" }}>{error?.message || "An unexpected error occurred."}</p>
            <button
              onClick={reset}
              style={{ backgroundColor: "#6366f1", color: "white", padding: "0.75rem 1.5rem", borderRadius: "0.5rem", border: "none", cursor: "pointer", fontWeight: 600 }}
            >
              Try Again
            </button>
          </div>
        </div>
      </body>
    </html>
  );
}
