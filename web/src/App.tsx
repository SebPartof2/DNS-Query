import { useState } from "react";
import { QueryForm } from "./components/QueryForm";
import { ResultsTable } from "./components/ResultsTable";
import type { QueryResponse, RecordType } from "./types";
import "./App.css";

const API_URL = import.meta.env.VITE_API_URL ?? "";

export function App() {
  const [response, setResponse] = useState<QueryResponse | null>(null);
  const [elapsed, setElapsed] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  async function handleQuery(domain: string, recordType: RecordType) {
    setIsLoading(true);
    setError(null);
    setResponse(null);

    const start = performance.now();

    try {
      const res = await fetch(`${API_URL}/api/query`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ domain, recordType }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error ?? `Request failed (${res.status})`);
        return;
      }

      setResponse(data);
      setElapsed(Math.round(performance.now() - start));
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to reach API"
      );
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="app">
      <header className="app-header">
        <h1>DNS Query</h1>
        <p className="subtitle">Look up DNS records for any domain</p>
      </header>

      <main>
        <QueryForm onSubmit={handleQuery} isLoading={isLoading} />

        {error && <div className="error-banner">{error}</div>}

        {response && (
          <ResultsTable
            results={response.results}
            domain={response.domain}
            elapsed={elapsed}
          />
        )}
      </main>
    </div>
  );
}
