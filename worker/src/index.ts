import { queryDns, queryAll, isValidRecordType } from "./dns-resolver";
import { enrichAnswers } from "./ipinfo";
import { enrichNsAnswers } from "./ns-providers";

interface Env {
  IPINFO_TOKEN: string;
}

const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
};

function jsonResponse(data: unknown, status = 200): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      "Content-Type": "application/json",
      ...CORS_HEADERS,
    },
  });
}

function errorResponse(message: string, status = 400): Response {
  return jsonResponse({ error: message }, status);
}

const DOMAIN_REGEX = /^([a-zA-Z0-9]([a-zA-Z0-9-]*[a-zA-Z0-9])?\.)+[a-zA-Z]{2,}$/;

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    if (request.method === "OPTIONS") {
      return new Response(null, { status: 204, headers: CORS_HEADERS });
    }

    const url = new URL(request.url);

    if ((url.pathname === "/query" || url.pathname === "/api/query") && request.method === "POST") {
      return handleQuery(request, env);
    }

    return errorResponse("Not found", 404);
  },
};

async function handleQuery(request: Request, env: Env): Promise<Response> {
  let body: { domain?: string; recordType?: string };

  try {
    body = await request.json();
  } catch {
    return errorResponse("Invalid JSON body");
  }

  const { domain, recordType } = body;

  if (!domain || typeof domain !== "string") {
    return errorResponse("Missing or invalid 'domain' field");
  }

  const cleanDomain = domain.trim().toLowerCase();

  if (!DOMAIN_REGEX.test(cleanDomain)) {
    return errorResponse("Invalid domain format");
  }

  if (!recordType || typeof recordType !== "string") {
    return errorResponse("Missing or invalid 'recordType' field");
  }

  const upperType = recordType.toUpperCase();

  try {
    if (upperType === "ALL") {
      const results = await queryAll(cleanDomain);
      if (env.IPINFO_TOKEN) {
        await enrichResults(results, env.IPINFO_TOKEN);
      }
      return jsonResponse({ domain: cleanDomain, results });
    }

    if (!isValidRecordType(upperType)) {
      return errorResponse(
        `Unsupported record type: ${upperType}. Supported: A, AAAA, CNAME, MX, NS, TXT, SOA, PTR, SRV, ALL`
      );
    }

    const result = await queryDns(cleanDomain, upperType);
    if (env.IPINFO_TOKEN && (upperType === "A" || upperType === "AAAA")) {
      result.ipInfo = await enrichAnswers(result.answers, env.IPINFO_TOKEN);
    }
    if (upperType === "NS") {
      result.nsInfo = enrichNsAnswers(result.answers);
    }
    return jsonResponse({ domain: cleanDomain, results: [result] });
  } catch (err) {
    const message =
      err instanceof Error ? err.message : "Unknown error occurred";
    return errorResponse(`DNS query failed: ${message}`, 502);
  }
}

async function enrichResults(
  results: Awaited<ReturnType<typeof queryAll>>,
  token: string
): Promise<void> {
  for (const result of results) {
    if ((result.recordType === "A" || result.recordType === "AAAA") && result.answers.length > 0) {
      result.ipInfo = await enrichAnswers(result.answers, token);
    }
    if (result.recordType === "NS" && result.answers.length > 0) {
      result.nsInfo = enrichNsAnswers(result.answers);
    }
  }
}
