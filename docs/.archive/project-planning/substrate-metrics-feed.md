# Substrate Live Metrics Feed; Design

> A live "this machine is alive" feed from the homelab to the public Substrate page. This document locks the plan
> (storage, schema, routes, security, build order) **before any code is written**. It is the contract the build
> follows. Real values (endpoints, IPs, tokens, secrets) live in the private Ops Runbook, never here and never in
> the repo.

---

## 1. Goal and the one hard constraint

**Goal:** surface a small, live node-health widget on `/lab/substrate` (CPU, RAM, load, uptime, VM/CT counts, a
temp, and a heartbeat), so the page reads as a living machine, not a static brochure.

**Hard constraint (non-negotiable):** the homelab is set up so **nothing is publicly reachable** (admin over a
private Tailscale mesh, no inbound ports). The feed must preserve that.

> **Principle: the lab pushes out; the public never pulls in.** Every connection originates inside the lab going
> outward. We never expose a Proxmox endpoint, a metrics port, or a Tailscale Funnel so the page can scrape the
> machine. Doing so would undo the security model.

---

## 2. Architecture

```
[ lab: isolated publisher LXC ]                         [ Vercel: Nuxt SSR ]
   reads LOCAL Proxmox API        --HTTPS POST------>    /api/substrate/ingest.post.ts
   (read-only PVEAuditor token)     (Bearer secret)        verify + validate + cap + rate-limit
        |                                                    |
   systemd timer (~60s)                                    SET substrate:metrics (Upstash, TTL)
   builds a SCRUBBED JSON blob                               |
                                          /api/substrate/metrics.get.ts  -->  Substrate page / widget
                                            read latest + compute staleness     "as of <ts>"
```

### Why this shape on Vercel (the important correction)

The site deploys on **Vercel**, where the Nuxt server runs as **serverless functions**. The function instance that
receives the lab's `POST` is usually **not** the one serving the page's `GET`, and instances are ephemeral. So:

- **In-memory and local-file storage do not work** for the latest payload (they vanish between invocations).
- The existing `server/api/metrics.get.ts` gets away with an in-process cache only because it is a _read-through_
  cache of an external API (GitHub/Strava): a cold cache just re-fetches. The ingest pattern has **no source to
  re-fetch from**, so the payload must live in a small **external store**.

**Decision: Upstash Redis** (provisioned via the Vercel Marketplace; Vercel KV is retired). A single key holds the
latest payload with a TTL, which doubles as free staleness handling. Upstash Ratelimit covers the rate-limit
requirement with the same dependency.

---

## 3. Decisions locked

| Decision            | Choice                                                                                  |
| ------------------- | --------------------------------------------------------------------------------------- |
| Transport           | Outbound HTTPS `POST` from the lab; bearer-secret auth. Public never initiates inbound. |
| Payload store       | **Upstash Redis** (Vercel Marketplace), single key + TTL                                |
| Rate limiting       | **Upstash Ratelimit** (sliding window)                                                  |
| Publish interval    | **~60s** (plenty for an "alive" widget; tune later)                                     |
| Publisher placement | Its **own lightweight LXC**, not the Proxmox host or a Docker host                      |
| Proxmox auth        | **Read-only `PVEAuditor` API token**, never root                                        |
| Proxmox read path   | Over the publisher's **LAN IP** (simplest, stays in-lab)                                |
| Storage abstraction | Build against **Nitro `useStorage()`** so dev uses memory, prod uses Upstash via config |

---

## 4. The payload contract (the public JSON)

Everything in the payload is treated as if it will be screenshotted. **Counts and percentages only; no identifiers.**

### Shape (validated with Zod on ingest)

```jsonc
{
  "v": 1, // schema version
  "ts": "2026-06-10T17:30:00Z", // publisher heartbeat (ISO 8601, UTC)
  "node": {
    "uptimeSec": 824140,
    "cpuPct": 7.4, // 0..100
    "loadAvg": [0.21, 0.18, 0.15],
    "mem": { "usedPct": 38.2, "totalGiB": 16 },
    "swap": { "usedPct": 0 }, // optional
    "tempC": 41, // optional, package temp
  },
  "guests": { "vms": 2, "cts": 5, "running": 6 }, // counts only, never names
  "storage": { "usedPct": 22.5 }, // optional, aggregate only
}
```

The server also stamps its own `receivedAt` on store (we do not fully trust the publisher's clock for staleness).

> **Temp is deferred to a later pass.** The Proxmox node-status API returns CPU / RAM / load / uptime / storage
> directly, but **not** temperature; reading host temps from the (deliberately low-privilege) publisher LXC needs
> lm-sensors exposed host-side. We ship the API-native metrics first and add temp (package source) later.

### Scrub list (allowed vs forbidden)

| Allowed (public-safe)                      | Forbidden (never in payload, never in repo)                                    |
| ------------------------------------------ | ------------------------------------------------------------------------------ |
| CPU %, RAM %, swap %, load average, uptime | Internal IPs, subnet, tailnet addresses                                        |
| VM / CT counts (numbers only)              | Hostnames (e.g. the node name)                                                 |
| One temperature, aggregate storage %       | **Exact software versions** (a precise Proxmox version is a CVE shopping list) |
| A heartbeat timestamp                      | Guest names, service names, ports                                              |
|                                            | Firewall/license details, MACs, serials, asset tags                            |

> Two additions to the original handover's list, on security grounds: **exact software versions** and the
> **hostname** are forbidden in the public payload. They belong in the private runbook only.

---

## 5. Nuxt server routes

### `server/api/substrate/ingest.post.ts` (the receiver)

1. **Auth:** require `Authorization: Bearer <SUBSTRATE_INGEST_SECRET>`; reject anything else with `401` (no detail).
2. **Size cap:** reject bodies over ~4 KB (`413`) before parsing.
3. **Rate limit:** Upstash Ratelimit, sliding window (start ~12/min); over-limit returns `429`.
4. **Validate:** parse with the Zod schema above; reject malformed (`422`). Strip unknown keys (no passthrough).
5. **Store:** `SET substrate:metrics:latest <json+receivedAt> EX 150` (TTL ~2.5x interval). Return `204`.

### `server/api/substrate/metrics.get.ts` (the reader)

- Read `substrate:metrics:latest`. Compute `ageSec` from `receivedAt` and a `state`:
  - `live` (age < ~90s), `stale` (older), `offline` (key missing/expired).
- Return `{ state, ageSec, ts, node, guests, storage }`. Never explain _why_ it might be offline.
- Cache-Control short (e.g. `s-maxage=15`) so the public read is cheap.

### Env (in `runtimeConfig`, never committed)

```ts
runtimeConfig: {
  substrateIngestSecret: process.env.SUBSTRATE_INGEST_SECRET, // bearer secret (server-only)
  // Upstash REST creds are injected by the Vercel Marketplace integration:
  // UPSTASH_REDIS_REST_URL / UPSTASH_REDIS_REST_TOKEN
}
```

> **Endpoint location.** The ingest route is part of _this same Nuxt app_, not a separate service: it lives at
> `https://<deployment>/api/substrate/ingest`. The publisher targets the **staging/preview** deployment while we
> test, and **production (`jens-johnson.com`)** once it ships. A dedicated `ingest.` subdomain is possible later
> (separate WAF/firewall rules), but it is the same app under another hostname and adds DNS + a rewrite for no
> benefit at one-publisher scale. Not now.

---

## 6. The widget (page UX)

Three surfaces, all fed by the same `metrics.get` read (decided: build all three, then trim once we can see them):

- **A slim live banner** near the top of the Substrate page: `● node live · CPU 7% · RAM 38% · up 9d · updated 12s ago`.
- **An Overview card** with the headline metrics and an expandable secondary row.
- **An overlay on the `srv-01` node** in the Topology tab (a live dot + mini CPU/RAM on the node; full detail in the inspector).

Every surface shows a **"Last updated"** / "as of" stamp prominently. Reuses the health-dot language already on the
`/lab` hub card.

| State     | Dot   | Shows                                                |
| --------- | ----- | ---------------------------------------------------- |
| `live`    | green | CPU %, RAM %, uptime, VM/CT counts, "as of just now" |
| `stale`   | amber | last metrics, dimmed, "last seen 4m ago"             |
| `offline` | muted | "offline", no metrics, **no reason given**           |

Rendered server-side on load (SSR reads the store), with optional light client polling of `metrics.get` every ~30s
for a live feel. **Staleness is a feature**: the page always renders last-known state instead of erroring.

---

## 7. The publisher (lab side, you deploy)

A small script on its **own LXC** (kept off the Proxmox host and any service host), on a **systemd timer (~60s)**:

1. Read node stats from the **local** Proxmox API using the read-only `PVEAuditor` token.
2. Map them into the **scrubbed** payload shape (counts/percentages only).
3. `curl` it outbound to the ingest URL with `Authorization: Bearer <secret>`.

I will write this script; you drop it on the LXC. Its config (Proxmox URL, token, ingest URL + secret) lives in the
LXC's env / the private runbook, never in this repo.

---

## 8. Security checklist (must all hold)

- [ ] Ingest requires a long random bearer secret; rejects everything without it.
- [ ] Payload validated (Zod), unknown keys stripped, body size-capped, rate-limited.
- [ ] Payload contains **zero** identifiers (see scrub list); discipline confirmed on the _real_ payload before go-live.
- [ ] Proxmox token is `PVEAuditor` (read-only), not root.
- [ ] Staleness renders gracefully; the page never leaks _why_ the lab is unreachable.
- [ ] No secrets in the repo; all via env / the private runbook.
- [ ] Nothing inbound to the lab is opened; the publisher only dials out.

---

## 9. Build order

| Phase | What                                                                                         | Needs homelab? |
| ----- | -------------------------------------------------------------------------------------------- | -------------- |
| **A** | Nuxt receiving end + widget, storage-agnostic (`useStorage`), against a **mock payload**     | No             |
| **B** | Provision Upstash on Vercel; set `SUBSTRATE_INGEST_SECRET` + Upstash env                     | No (you click) |
| **C** | Create `PVEAuditor` token; stand up publisher LXC; install the collect+push script + timer   | Yes (you)      |
| **D** | Wire end-to-end; confirm scrub on the real payload; verify rate-limit + size-cap + staleness | Yes            |

Phase A is fully buildable now without touching the homelab, so the receiving end is ready and tested before the
publisher exists.

---

## 10. Confirmed and remaining

**Confirmed (this review):**

- **Placement:** all three surfaces (slim banner + Overview card + `srv-01` node overlay), each with a "last updated" stamp. Trim after previewing.
- **Headline metrics:** CPU %, RAM (used / total), uptime, running guests. Secondary (expandable): load avg (1m), storage used %, swap %.
- **Interval / TTL:** 60s / 150s. **Temp:** package source, deferred (see §4).
- **Ingest endpoint:** `/api/substrate/ingest` on this app; staging/preview while testing, apex in prod (see §5).

**Remaining / nice-to-have:**

- Final trim of which surfaces survive, decided by previewing the Phase A build.
- A short rolling history in Upstash (last ~20 samples) for **sparklines** on the card (v2).
- Power draw (RAPL / UPS) tied into the "idle draw" stat (later).
