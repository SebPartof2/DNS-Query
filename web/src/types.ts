export interface DnsAnswer {
  name: string;
  type: number;
  TTL: number;
  data: string;
}

export interface IpInfo {
  ip: string;
  city: string;
  region: string;
  country: string;
  org: string;
}

export interface NsProviderInfo {
  provider: string;
}

export interface QueryResult {
  recordType: string;
  status: number;
  statusMessage: string;
  answers: DnsAnswer[];
  ipInfo?: Record<string, IpInfo>;
  nsInfo?: Record<string, NsProviderInfo>;
}

export interface QueryResponse {
  domain: string;
  results: QueryResult[];
}

export const RECORD_TYPES = [
  "A",
  "AAAA",
  "CNAME",
  "MX",
  "NS",
  "TXT",
  "SOA",
  "PTR",
  "SRV",
  "ALL",
] as const;

export type RecordType = (typeof RECORD_TYPES)[number];
