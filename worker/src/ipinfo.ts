export interface IpInfo {
  ip: string;
  city: string;
  region: string;
  country: string;
  org: string;
  asDomain: string;
}

interface IpInfoResponse {
  ip: string;
  city?: string;
  region?: string;
  country?: string;
  org?: string;
  asn?: {
    asn?: string;
    name?: string;
    domain?: string;
    route?: string;
    type?: string;
  };
}

export async function lookupIp(
  ip: string,
  token: string
): Promise<IpInfo> {
  const res = await fetch(`https://ipinfo.io/${ip}/json?token=${token}`, {
    headers: { accept: "application/json" },
  });

  if (!res.ok) {
    throw new Error(`IPinfo request failed: ${res.status}`);
  }

  const data: IpInfoResponse = await res.json();

  return {
    ip: data.ip,
    city: data.city ?? "",
    region: data.region ?? "",
    country: data.country ?? "",
    org: data.org ?? "",
    asDomain: data.asn?.domain ?? "",
  };
}

export async function enrichAnswers(
  answers: { type: number; data: string }[],
  token: string
): Promise<Record<string, IpInfo>> {
  const aRecordIps = answers
    .filter((a) => a.type === 1 || a.type === 28)
    .map((a) => a.data);

  const unique = [...new Set(aRecordIps)];

  if (unique.length === 0) {
    return {};
  }

  const entries = await Promise.all(
    unique.map((ip) =>
      lookupIp(ip, token)
        .then((info): [string, IpInfo] => [ip, info])
        .catch((): null => null)
    )
  );

  const result: Record<string, IpInfo> = {};
  for (const entry of entries) {
    if (entry) {
      result[entry[0]] = entry[1];
    }
  }
  return result;
}
