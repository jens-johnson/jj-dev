/**
 * █████████████████████████████████████████████████████████████████████████████████████████████████████████████████████
 *
 *                                ██        ██                     ▄▄
 *                                ▀▀        ▀▀                     ██
 *                              ████      ████                ▄███▄██   ▄████▄   ██▄  ▄██
 *                                ██        ██               ██▀  ▀██  ██▄▄▄▄██   ██  ██
 *                                ██        ██      █████    ██    ██  ██▀▀▀▀▀▀   ▀█▄▄█▀
 *                                ██        ██               ▀██▄▄███  ▀██▄▄▄▄█    ████
 *                                ██        ██                 ▀▀▀ ▀▀    ▀▀▀▀▀      ▀▀
 *                             ████▀     ████▀
 *
 * █████████████████████████████████████████████████████████████████████████████████████████████████████████████████████
 * ███████████████████████████████████████████████ #utils/tech-docs.ts █████████████████████████████████████████████████
 *
 * A central registry mapping the technologies, tools, and platforms referenced across the site to their official docs
 * pages, so tech/stack chips can render wiki-style links without each call site hard-coding URLs. Lookup is
 * case-insensitive and version-tolerant (e.g. "PaperMC 26.1.2" resolves the same as "Paper"). Auto-imported by Nuxt.
 *
 * ─── USAGE ───────────────────────────────────────────────────────────────────────────────────────────────────────────
 *
 * techDocHref('PaperMC 26.1.2') // → 'https://docs.papermc.io/'
 * techDocHref('Homegrown thing') // → undefined (render as plain text)
 *
 * █████████████████████████████████████████████████████████████████████████████████████████████████████████████████████
 */

/**
 * Canonical docs URL per technology, keyed by a normalised lowercase name (no version, trimmed). Several common
 * aliases map to the same destination so authored copy can use whatever name reads best in context.
 */
const TECH_DOCS: Record<string, string> = {
  /* ─── Minecraft server + plugins ─────────────────────────────────────────────────────────────────────────────── */
  paper: 'https://docs.papermc.io/',
  papermc: 'https://docs.papermc.io/',
  geyser: 'https://geysermc.org/',
  geysermc: 'https://geysermc.org/',
  floodgate: 'https://geysermc.org/wiki/floodgate/',
  bluemap: 'https://bluemap.bluecolored.de/',
  'multiverse core': 'https://modrinth.com/plugin/multiverse-core',
  'multiverse-core': 'https://modrinth.com/plugin/multiverse-core',
  multiverse: 'https://modrinth.com/plugin/multiverse-core',
  spark: 'https://spark.lucko.me/',
  chunky: 'https://modrinth.com/plugin/chunky',
  viaversion: 'https://viaversion.com/',
  luckperms: 'https://luckperms.net/',
  coreprotect: 'https://www.spigotmc.org/resources/coreprotect.8631/',
  sodium: 'https://modrinth.com/mod/sodium',
  iris: 'https://modrinth.com/mod/iris',
  'sodium + iris': 'https://modrinth.com/mod/sodium',

  /* ─── Languages + runtimes ───────────────────────────────────────────────────────────────────────────────────── */
  java: 'https://dev.java/',
  'java edition': 'https://www.minecraft.net/',
  'bedrock edition': 'https://www.minecraft.net/',
  minecraft: 'https://www.minecraft.net/',

  /* ─── Infra + platform ───────────────────────────────────────────────────────────────────────────────────────── */
  proxmox: 'https://www.proxmox.com/en/proxmox-virtual-environment/overview',
  'proxmox ve': 'https://pve.proxmox.com/pve-docs/',
  'proxmox lxc': 'https://pve.proxmox.com/wiki/Linux_Container',
  lxc: 'https://pve.proxmox.com/wiki/Linux_Container',
  tailscale: 'https://tailscale.com/kb/',
  systemd: 'https://systemd.io/',
  cron: 'https://man7.org/linux/man-pages/man5/crontab.5.html',
  redis: 'https://redis.io/docs/latest/',
  upstash: 'https://upstash.com/docs/redis/overall/getstarted',
  'upstash redis': 'https://upstash.com/docs/redis/overall/getstarted',
  vercel: 'https://vercel.com/docs',
  'vercel ingest': 'https://vercel.com/docs/functions',
  'aws lightsail': 'https://docs.aws.amazon.com/lightsail/',
  lightsail: 'https://docs.aws.amazon.com/lightsail/',
  'aws route53': 'https://docs.aws.amazon.com/route53/',
  'route 53': 'https://docs.aws.amazon.com/route53/',
  route53: 'https://docs.aws.amazon.com/route53/',
};

/** Normalise a tech name for lookup: lowercase, trimmed, and with a trailing version (e.g. "26.1.2") stripped. */
function normalizeTech(name: string): string {
  return name
    .toLowerCase()
    .trim()
    .replace(/\s+v?\d+[\d.]*$/, '') // drop a trailing version token ("paper 26.1.2" → "paper")
    .trim();
}

/** Official docs URL for a technology/tool/platform name, or `undefined` when it isn't in the registry. */
export function techDocHref(name: string | undefined | null): string | undefined {
  if (!name) return undefined;
  return TECH_DOCS[normalizeTech(name)];
}
