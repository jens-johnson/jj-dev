# Jenscraft Service; Design

> Jenscraft is the first **service** to land on Substrate: a cross-platform Minecraft server, self-hosted on the
> homelab. This document captures the public-facing build (the `services` content model + UI on `/lab/substrate`)
> and the contract its live-metrics feed will follow. Operational detail; real endpoints, IPs, tokens, the
> provisioning runbook; lives in the private Substrate ops space in Notion, never here and never in the repo.

---

## 1. Goal

Surface Jenscraft as a first-class entry under the Substrate **Services** tab: a card in the grid plus a detail
page describing the architecture, the BlueMap link, the active plugins, and a metrics dashboard; so the homelab
page reads as a living system, not a static brochure.

The server itself (Proxmox LXC, PaperMC, Geyser/Floodgate, BlueMap, the public relay) is provisioned by hand from
the Notion runbook; this repo only renders the documentation + telemetry.

---

## 2. Content model

A new `services` collection (`content.config.ts` → `servicesSchema`), sibling to `substrate`:

- Where `substrate` documents the **hardware**, `services` documents **what runs on it**.
- Frontmatter drives the card, the detail header, the links, the plugin list, and the declared metric tiles.
- `host` ties a service back to its substrate device (`srv-01`); `status: planned` covers a documented-but-not-yet
  -running service (Jenscraft today).

Routes:

```
/lab/substrate?view=services            → Services grid (WidgetsLabServicesOverview)
/lab/substrate/services/<serviceId>     → detail page
/lab/substrate/services                 → redirect to the grid (avoids the device [slug] route)
```

---

## 3. Live metrics; the contract (Phase 2)

Mirrors the Substrate metrics feed exactly: **the lab pushes out; the public never pulls in.** A small publisher
inside the Jenscraft LXC reads server health locally and POSTs a public-safe snapshot out to this site. No Minecraft
port, RCON port, or BlueMap admin endpoint is ever exposed for the page to scrape.

Sources the publisher can read locally:

| Tile       | Source                  | Notes                                       |
| ---------- | ----------------------- | ------------------------------------------- |
| `players`  | spark / query protocol  | live count across Java + Bedrock            |
| `tps`      | spark                   | ticks per second (20 = healthy)             |
| `mspt`     | spark                   | mean ms per tick                            |
| `uptime`   | systemd / process start | seconds since last restart                  |
| `explored` | BlueMap render coverage | approx % of generated world rendered        |
| `mobs`     | `world/stats/*.json`    | summed lifetime `minecraft:killed` hostiles |

Payload is **counts and percentages only; never player names, IPs, or coordinates** (same privacy rule as the
substrate feed). Proposed route shape, to be built when the publisher exists:

```
POST /api/services/jenscraft/ingest   (Bearer secret, validate + cap + rate-limit)
GET  /api/services/jenscraft/metrics  (public read: { state: live|stale|offline, ... })
```

Until that lands, `WidgetsLabServiceMetrics` renders the declared tiles in an **awaiting-feed** state; no fake
numbers. Wiring the feed is a follow-up ticket, gated on the server actually being provisioned.

---

## 4. Build order

1. **Phase 1 (this change):** `services` collection + types + visuals, the Jenscraft content doc, the Services grid,
   the detail page, and the metrics dashboard scaffold. Status `planned`.
2. **Phase 2 (follow-up):** stand up the server from the Notion runbook, build the ingest/read routes + publisher,
   flip Jenscraft to `online`, and the dashboard goes live with zero UI changes.
