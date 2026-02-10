/**
 * Maps nameserver domain suffixes to their provider/owner.
 * Matched longest-suffix-first against NS record data.
 */
const NS_PROVIDERS: [suffix: string, provider: string][] = [
  // Major DNS providers
  ["cloudflare.com", "Cloudflare"],
  ["awsdns-hostmaster.amazon.com", "AWS Route 53"],
  ["awsdns", "AWS Route 53"],
  ["azure-dns.com", "Microsoft Azure"],
  ["azure-dns.net", "Microsoft Azure"],
  ["azure-dns.org", "Microsoft Azure"],
  ["azure-dns.info", "Microsoft Azure"],
  ["googledomains.com", "Google Cloud DNS"],
  ["google.com", "Google"],
  ["nsone.net", "NS1 (IBM)"],
  ["dynect.net", "Dyn (Oracle)"],
  ["ultradns.com", "UltraDNS (Vercara)"],
  ["ultradns.net", "UltraDNS (Vercara)"],
  ["ultradns.org", "UltraDNS (Vercara)"],
  ["akamai.com", "Akamai"],
  ["akam.net", "Akamai"],

  // Registrars & hosting
  ["domaincontrol.com", "GoDaddy"],
  ["registrar-servers.com", "Namecheap"],
  ["digitalocean.com", "DigitalOcean"],
  ["linode.com", "Linode (Akamai)"],
  ["hetzner.com", "Hetzner"],
  ["ovh.net", "OVH"],
  ["gandi.net", "Gandi"],
  ["name-services.com", "Enom"],
  ["worldnic.com", "Network Solutions"],
  ["hostinger.com", "Hostinger"],
  ["bluehost.com", "Bluehost"],
  ["dreamhost.com", "DreamHost"],
  ["hover.com", "Hover"],
  ["inmotionhosting.com", "InMotion Hosting"],
  ["siteground.net", "SiteGround"],

  // Website builders & platforms
  ["vercel-dns.com", "Vercel"],
  ["wixdns.net", "Wix"],
  ["squarespace.com", "Squarespace"],
  ["wordpress.com", "WordPress.com"],

  // Specialized DNS
  ["dnsimple.com", "DNSimple"],
  ["dnsmadeeasy.com", "DNS Made Easy"],
  ["he.net", "Hurricane Electric"],
  ["bunny.net", "Bunny.net"],
  ["constellix.com", "Constellix"],
  ["easydns.com", "easyDNS"],
  ["zoneedit.com", "ZoneEdit"],
  ["dnspark.com", "DNSPark"],

  // CDN / Security
  ["incapdns.net", "Imperva (Incapsula)"],
  ["fastly.net", "Fastly"],
  ["stackpathdns.com", "StackPath"],
  ["sucuri.net", "Sucuri"],
];

export interface NsProviderInfo {
  provider: string;
}

export function lookupNsProvider(nameserver: string): NsProviderInfo | null {
  const ns = nameserver.toLowerCase().replace(/\.$/, "");

  for (const [suffix, provider] of NS_PROVIDERS) {
    if (ns.endsWith(suffix)) {
      return { provider };
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
