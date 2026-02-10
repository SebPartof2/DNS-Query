import { Fragment } from "react";
import type { QueryResult, IpInfo } from "../types";

function countryFlag(code: string): string {
  if (code.length !== 2) return "";
  const offset = 0x1f1e6;
  const a = code.toUpperCase().charCodeAt(0) - 65 + offset;
  const b = code.toUpperCase().charCodeAt(1) - 65 + offset;
  return String.fromCodePoint(a) + String.fromCodePoint(b);
}

function IpDetailRow({ info }: { info: IpInfo }) {
  const parts = [
    info.country && `${countryFlag(info.country)} ${info.country}`,
    info.city,
    info.region,
    info.org,
  ].filter(Boolean);

  return (
    <tr className="ip-detail-row">
      <td colSpan={4}>{parts.join(" \u00B7 ")}</td>
    </tr>
  );
}

const TYPE_NAMES: Record<number, string> = {
  1: "A",
  2: "NS",
  5: "CNAME",
  6: "SOA",
  12: "PTR",
  15: "MX",
  16: "TXT",
  28: "AAAA",
  33: "SRV",
};

interface ResultsTableProps {
  results: QueryResult[];
  domain: string;
  elapsed: number;
}

export function ResultsTable({ results, domain, elapsed }: ResultsTableProps) {
  const hasAnswers = results.some((r) => r.answers.length > 0);

  return (
    <div className="results">
      <div className="results-header">
        <span className="results-domain">{domain}</span>
        <span className="results-time">{elapsed}ms</span>
      </div>

      {results.map((result) => (
        <div key={result.recordType} className="result-group">
          <div className="result-type-header">
            <span className="result-type-badge">{result.recordType}</span>
            <span
              className={`result-status ${result.status === 0 ? "status-ok" : "status-err"}`}
            >
              {result.statusMessage}
            </span>
          </div>

          {result.answers.length > 0 ? (
            <table className="records-table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Type</th>
                  <th>TTL</th>
                  <th>Data</th>
                </tr>
              </thead>
              <tbody>
                {result.answers.map((answer, i) => {
                  const info = result.ipInfo?.[answer.data];
                  return (
                    <Fragment key={i}>
                      <tr>
                        <td>{answer.name}</td>
                        <td>{TYPE_NAMES[answer.type] ?? answer.type}</td>
                        <td>{answer.TTL}s</td>
                        <td className="data-cell">{answer.data}</td>
                      </tr>
                      {info && <IpDetailRow info={info} />}
                    </Fragment>
                  );
                })}
              </tbody>
            </table>
          ) : (
            result.status === 0 && (
              <p className="no-records">No records found</p>
            )
          )}
        </div>
      ))}

      {!hasAnswers && (
        <p className="no-records">No DNS records found for this domain.</p>
      )}
    </div>
  );
}
