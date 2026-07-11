"use client";

import { useEffect, useState } from "react";

type CheckResult = {
  status: string;
  message?: string;
  latency?: string;
  count?: number;
};

type StatusData = {
  status: string;
  checks: Record<string, CheckResult | string | Record<string, string>>;
};

export default function StatusPage() {
  const [data, setData] = useState<StatusData | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  const fetchStatus = () => {
    setLoading(true);
    setError("");
    fetch("/api/status")
      .then((r) => r.json())
      .then((d) => {
        setData(d);
        setLoading(false);
      })
      .catch((e) => {
        setError(e.message);
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchStatus();
  }, []);

  return (
    <div style={{ maxWidth: 800, margin: "40px auto", padding: "0 20px", fontFamily: "system-ui, sans-serif" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 8 }}>
        <h1 style={{ margin: 0, fontSize: 24, fontWeight: 700 }}>System Status</h1>
        <span
          style={{
            display: "inline-block",
            width: 12,
            height: 12,
            borderRadius: "50%",
            background: data?.status === "healthy" ? "#22c55e" : data?.status === "degraded" ? "#eab308" : "#ef4444",
          }}
        />
      </div>
      <p style={{ color: "#6b7280", margin: "0 0 24px 0", fontSize: 14 }}>
        {data?.status === "healthy" ? "All systems operational" : data?.status === "degraded" ? "Some systems have issues" : "Unable to check status"}
      </p>

      {error && (
        <div style={{ padding: 16, background: "#fef2f2", color: "#dc2626", borderRadius: 8, marginBottom: 24, fontSize: 14 }}>
          Error: {error}
        </div>
      )}

      {loading && !data && (
        <div style={{ textAlign: "center", padding: 40, color: "#6b7280" }}>Checking system status...</div>
      )}

      {data && (
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {Object.entries(data.checks).map(([key, value]) => {
            if (key === "env") {
              const env = value as Record<string, string>;
              return (
                <div key={key} style={{ background: "#f9fafb", border: "1px solid #e5e7eb", borderRadius: 8, padding: 16 }}>
                  <div style={{ fontWeight: 600, fontSize: 14, marginBottom: 8, textTransform: "capitalize", color: "#374151" }}>{key}</div>
                  <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                    {Object.entries(env).map(([k, v]) => (
                      <div key={k} style={{ display: "flex", justifyContent: "space-between", fontSize: 13, padding: "2px 0" }}>
                        <span style={{ color: "#6b7280", fontFamily: "monospace" }}>{k}</span>
                        <span style={{ color: v.startsWith("✓") ? "#16a34a" : "#dc2626", fontWeight: 500 }}>{v}</span>
                      </div>
                    ))}
                  </div>
                </div>
              );
            }

            if (typeof value === "string") {
              return (
                <div key={key} style={{ background: "#f9fafb", border: "1px solid #e5e7eb", borderRadius: 8, padding: 16 }}>
                  <div style={{ fontWeight: 600, fontSize: 14, marginBottom: 4, textTransform: "capitalize", color: "#374151" }}>{key}</div>
                  <div style={{ fontSize: 13, color: "#6b7280", fontFamily: "monospace" }}>{value}</div>
                </div>
              );
            }

            const check = value as CheckResult;
            const isOk = check.status === "ok";
            return (
              <div key={key} style={{ background: "#f9fafb", border: "1px solid #e5e7eb", borderRadius: 8, padding: 16 }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 4 }}>
                  <div style={{ fontWeight: 600, fontSize: 14, textTransform: "capitalize", color: "#374151" }}>{key}</div>
                  <span
                    style={{
                      fontSize: 12,
                      fontWeight: 600,
                      padding: "2px 8px",
                      borderRadius: 999,
                      background: isOk ? "#dcfce7" : "#fef2f2",
                      color: isOk ? "#16a34a" : "#dc2626",
                    }}
                  >
                    {isOk ? "OK" : "ERROR"}
                  </span>
                </div>
                {check.latency && <div style={{ fontSize: 13, color: "#6b7280" }}>Latency: {check.latency}</div>}
                {check.count !== undefined && <div style={{ fontSize: 13, color: "#6b7280" }}>Count: {check.count}</div>}
                {check.message && <div style={{ fontSize: 13, color: "#dc2626", marginTop: 4, fontFamily: "monospace" }}>{check.message}</div>}
              </div>
            );
          })}
        </div>
      )}

      <div style={{ textAlign: "center", marginTop: 24 }}>
        <button
          onClick={fetchStatus}
          disabled={loading}
          style={{
            padding: "8px 20px",
            background: "#6366f1",
            color: "white",
            border: "none",
            borderRadius: 6,
            fontWeight: 600,
            fontSize: 14,
            cursor: "pointer",
            opacity: loading ? 0.6 : 1,
          }}
        >
          {loading ? "Refreshing..." : "Refresh"}
        </button>
      </div>
    </div>
  );
}
