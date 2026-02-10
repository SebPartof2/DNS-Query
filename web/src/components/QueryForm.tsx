import { useState } from "react";
import { RECORD_TYPES, type RecordType } from "../types";

interface QueryFormProps {
  onSubmit: (domain: string, recordType: RecordType) => void;
  isLoading: boolean;
}

export function QueryForm({ onSubmit, isLoading }: QueryFormProps) {
  const [domain, setDomain] = useState("");
  const [recordType, setRecordType] = useState<RecordType>("A");

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const trimmed = domain.trim();
    if (trimmed) {
      onSubmit(trimmed, recordType);
    }
  }

  return (
    <form className="query-form" onSubmit={handleSubmit}>
      <div className="form-row">
        <input
          type="text"
          className="domain-input"
          placeholder="Enter domain (e.g. google.com)"
          value={domain}
          onChange={(e) => setDomain(e.target.value)}
          disabled={isLoading}
        />
        <select
          className="type-select"
          value={recordType}
          onChange={(e) => setRecordType(e.target.value as RecordType)}
          disabled={isLoading}
        >
          {RECORD_TYPES.map((type) => (
            <option key={type} value={type}>
              {type}
            </option>
          ))}
        </select>
        <button className="query-btn" type="submit" disabled={isLoading || !domain.trim()}>
          {isLoading ? "Querying..." : "Query"}
        </button>
      </div>
    </form>
  );
}
