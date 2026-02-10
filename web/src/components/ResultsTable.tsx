import { Fragment } from "react";
import type { QueryResult, IpInfo } from "../types";

const LOGOKIT_TOKEN = "pk_fr4c5e5fc1caaa89b3cef3";

function logoUrl(domain: string): string {
  return `https://img.logokit.com/${domain}?token=${LOGOKIT_TOKEN}`;
}

/** Extract a base domain from a hostname (e.g. "server-1.prod.google.com" → "google.com") */
function extractBaseDomain(hostname: string): string {
  const clean = hostname.replace(/\.$/, "").toLowerCase();
  const parts = clean.split(".");
  if (parts.length >= 2) {
    return parts.slice(-2).join(".");
  }
  return clean;
}

function countryFlag(code: string): string {
  if (code.length !== 2) return "";
  const offset = 0x1f1e6;
  const a = code.toUpperCase().charCodeAt(0) - 65 + offset;
  const b = code.toUpperCase().charCodeAt(1) - 65 + offset;
  return String.fromCodePoint(a) + String.fromCodePoint(b);
}

function ProviderLogo({ domain }: { domain: string }) {
  return (
    <img
      className="provider-logo"
      src={logoUrl(domain)}
      alt=""
      width={16}
      height={16}
    />
  );
}

function IpDetailRow({ info }: { info: IpInfo }) {
  const parts = [
    info.country && `${countryFlag(info.country)} ${info.country}`,
    info.city,
    info.region,
    info.org,
  ].filter(Boolean);

  const logoDomain = info.hostname ? extractBaseDomain(info.hostname) : "";

  return (
    <tr className="ip-detail-row">
      <td colSpan={4}>
        {logoDomain && <ProviderLogo domain={logoDomain} />}
        {parts.join(" \u00B7 ")}
      </td>
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
                  const ipDetail = result.ipInfo?.[answer.data];
                  const nsDetail = result.nsInfo?.[answer.data];
                  return (
                    <Fragment key={i}>
                      <tr>
                        <td>{answer.name}</td>
                        <td>{TYPE_NAMES[answer.type] ?? answer.type}</td>
                        <td>{answer.TTL}s</td>
                        <td className="data-cell">{answer.data}</td>
                      </tr>
                      {ipDetail && <IpDetailRow info={ipDetail} />}
                      {nsDetail && (
                        <tr className="ip-detail-row">
                          <td colSpan={4}>
                            <ProviderLogo domain={nsDetail.logoDomain} />
                            {nsDetail.provider}
                          </td>
                        </tr>
                      )}
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
