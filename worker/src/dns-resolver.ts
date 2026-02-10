const DOH_ENDPOINT = "https://cloudflare-dns.com/dns-query";

const SUPPORTED_TYPES = [
  "A",
  "AAAA",
  "CNAME",
  "MX",
  "NS",
  "TXT",
  "SOA",
  "PTR",
  "SRV",
] as const;

export type RecordType = (typeof SUPPORTED_TYPES)[number];

export function isValidRecordType(type: string): type is RecordType {
  return SUPPORTED_TYPES.includes(type as RecordType);
}

export interface DnsAnswer {
  name: string;
  type: number;
  TTL: number;
  data: string;
}

interface DoHResponse {
  Status: number;
  TC: boolean;
  RD: boolean;
  RA: boolean;
  AD: boolean;
  CD: boolean;
  Question: { name: string; type: number }[];
  Answer?: DnsAnswer[];
  Authority?: DnsAnswer[];
}

const STATUS_MESSAGES: Record<number, string> = {
  0: "Success",
  1: "Format Error",
  2: "Server Failure",
  3: "Non-Existent Domain (NXDOMAIN)",
  4: "Not Implemented",
  5: "Query Refused",
};

export type { IpInfo } from "./ipinfo";
export type { NsProviderInfo } from "./ns-providers";

export interface QueryResult {
  recordType: string;
  status: number;
  statusMessage: string;
  answers: DnsAnswer[];
  ipInfo?: Record<string, import("./ipinfo").IpInfo>;
  nsInfo?: Record<string, import("./ns-providers").NsProviderInfo>;
}

export async function queryDns(
  domain: string,
  recordType: RecordType
): Promise<QueryResult> {
  const url = `${DOH_ENDPOINT}?name=${encodeURIComponent(domain)}&type=${recordType}`;

  const response = await fetch(url, {
    headers: { accept: "application/dns-json" },
  });

  if (!response.ok) {
    throw new Error(`DoH request failed with status ${response.status}`);
  }

  const data: DoHResponse = await response.json();

  return {
    recordType,
    status: data.Status,
    statusMessage: STATUS_MESSAGES[data.Status] ?? `Unknown (${data.Status})`,
    answers: data.Answer ?? [],
  };
}

export async function queryAll(domain: string): Promise<QueryResult[]> {
  const results = await Promise.all(
    SUPPORTED_TYPES.map((type) =>
      queryDns(domain, type).catch(
        (err): QueryResult => ({
          recordType: type,
          status: -1,
          statusMessage: `Error: ${err instanceof Error ? err.message : "Unknown error"}`,
          answers: [],
        })
      )
    )
  );

  return results;
}
