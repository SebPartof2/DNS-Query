/**
 * Maps nameserver domain suffixes to their provider/owner.
 * Matched longest-suffix-first against NS record data.
 * [suffix, provider name, logo domain for Logokit]
 */
const NS_PROVIDERS: [suffix: string, provider: string, logoDomain: string][] = [
  // Major DNS providers
  ["cloudflare.com", "Cloudflare", "cloudflare.com"],
  ["awsdns-hostmaster.amazon.com", "AWS Route 53", "aws.amazon.com"],
  ["awsdns", "AWS Route 53", "aws.amazon.com"],
  ["azure-dns.com", "Microsoft Azure", "azure.microsoft.com"],
  ["azure-dns.net", "Microsoft Azure", "azure.microsoft.com"],
  ["azure-dns.org", "Microsoft Azure", "azure.microsoft.com"],
  ["azure-dns.info", "Microsoft Azure", "azure.microsoft.com"],
  ["googledomains.com", "Google Cloud DNS", "cloud.google.com"],
  ["google.com", "Google", "google.com"],
  ["nsone.net", "NS1 (IBM)", "nsone.net"],
  ["dynect.net", "Dyn (Oracle)", "oracle.com"],
  ["ultradns.com", "UltraDNS (Vercara)", "vercara.com"],
  ["ultradns.net", "UltraDNS (Vercara)", "vercara.com"],
  ["ultradns.org", "UltraDNS (Vercara)", "vercara.com"],
  ["akamai.com", "Akamai", "akamai.com"],
  ["akam.net", "Akamai", "akamai.com"],

  // Registrars & hosting
  ["domaincontrol.com", "GoDaddy", "godaddy.com"],
  ["registrar-servers.com", "Namecheap", "namecheap.com"],
  ["digitalocean.com", "DigitalOcean", "digitalocean.com"],
  ["linode.com", "Linode (Akamai)", "linode.com"],
  ["hetzner.com", "Hetzner", "hetzner.com"],
  ["ovh.net", "OVH", "ovh.com"],
  ["gandi.net", "Gandi", "gandi.net"],
  ["name-services.com", "Enom", "enom.com"],
  ["worldnic.com", "Network Solutions", "networksolutions.com"],
  ["hostinger.com", "Hostinger", "hostinger.com"],
  ["bluehost.com", "Bluehost", "bluehost.com"],
  ["dreamhost.com", "DreamHost", "dreamhost.com"],
  ["hover.com", "Hover", "hover.com"],
  ["inmotionhosting.com", "InMotion Hosting", "inmotionhosting.com"],
  ["siteground.net", "SiteGround", "siteground.com"],

  // Website builders & platforms
  ["vercel-dns.com", "Vercel", "vercel.com"],
  ["wixdns.net", "Wix", "wix.com"],
  ["squarespace.com", "Squarespace", "squarespace.com"],
  ["wordpress.com", "WordPress.com", "wordpress.com"],

  // Specialized DNS
  ["dnsimple.com", "DNSimple", "dnsimple.com"],
  ["dnsmadeeasy.com", "DNS Made Easy", "dnsmadeeasy.com"],
  ["he.net", "Hurricane Electric", "he.net"],
  ["bunny.net", "Bunny.net", "bunny.net"],
  ["constellix.com", "Constellix", "constellix.com"],
  ["easydns.com", "easyDNS", "easydns.com"],
  ["zoneedit.com", "ZoneEdit", "zoneedit.com"],
  ["dnspark.com", "DNSPark", "dnspark.com"],

  // CDN / Security
  ["incapdns.net", "Imperva (Incapsula)", "imperva.com"],
  ["fastly.net", "Fastly", "fastly.com"],
  ["stackpathdns.com", "StackPath", "stackpath.com"],
  ["sucuri.net", "Sucuri", "sucuri.net"],
];

export interface NsProviderInfo {
  provider: string;
  logoDomain: string;
}

export function lookupNsProvider(nameserver: string): NsProviderInfo | null {
  const ns = nameserver.toLowerCase().replace(/\.$/, "");

  for (const [suffix, provider, logoDomain] of NS_PROVIDERS) {
    if (ns.endsWith(suffix)) {
      return { provider, logoDomain };
    }
  }

  return null;
}

export function enrichNsAnswers(
  answers: { type: number; data: string }[]
): Record<string, NsProviderInfo> {
  const result: Record<string, NsProviderInfo> = {};

  for (const answer of answers) {
    if (answer.type === 2) {
      const info = lookupNsProvider(answer.data);
      if (info) {
        result[answer.data] = info;
      }
    }
  }

  return result;
}
