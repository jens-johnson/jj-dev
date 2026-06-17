---
title: Jenscraft
description: A cross-platform (Java + Bedrock) Minecraft server, self-hosted on the Substrate homelab.
publishedAt: '2026-06-16'
serviceId: jenscraft
kind: game-server
status: planned
summary: Cross-platform Minecraft, self-hosted on the homelab with a live BlueMap world view.
host: srv-01
address: jenscraft.world
stack:
  - PaperMC 1.21
  - GeyserMC
  - Floodgate
  - BlueMap
  - Proxmox LXC
  - Tailscale
order: 10
tags: [minecraft, game-server, crossplay, bluemap]
links:
  map: https://map.jenscraft.world
plugins:
  - name: GeyserMC
    side: server
    category: crossplay
    purpose: Lets Bedrock (Xbox / mobile / console) clients connect to the Java server.
    url: https://geysermc.org/
  - name: Floodgate
    side: server
    category: crossplay
    purpose: Authenticates Bedrock players without requiring a paid Java account.
    url: https://geysermc.org/wiki/floodgate/
  - name: BlueMap
    side: server
    category: map
    purpose: Renders the live 3D web map served at map.jenscraft.world.
    url: https://bluemap.bluecolored.de/
  - name: spark
    side: server
    category: performance
    purpose: Profiler + health monitor; source for the live TPS / tick-time metrics.
    url: https://spark.lucko.me/
  - name: Chunky
    side: server
    category: performance
    purpose: Pre-generates chunks so exploration doesn't spike tick time at runtime.
    url: https://modrinth.com/plugin/chunky
  - name: ViaVersion
    side: server
    category: quality-of-life
    purpose: Lets clients on newer Minecraft versions connect without a server upgrade.
    url: https://viaversion.com/
  - name: LuckPerms
    side: server
    category: moderation
    purpose: Permissions + group management for ops, trusted players, and guests.
    url: https://luckperms.net/
  - name: CoreProtect
    side: server
    category: moderation
    purpose: Block-level audit log with one-command grief rollback.
    url: https://www.spigotmc.org/resources/coreprotect.8631/
  - name: 'Sodium + Iris'
    side: client
    category: performance
    purpose: 'Java client: big FPS gains plus shader support (Bedrock clients need nothing).'
    url: https://modrinth.com/mod/sodium
metrics:
  - key: players
    label: Players Online
    icon: lucide:users
    hint: Live player count across Java + Bedrock.
  - key: tps
    label: Server TPS
    icon: lucide:gauge
    unit: TPS
    hint: Ticks per second; 20 is a perfectly healthy server.
  - key: mspt
    label: Tick Time
    icon: lucide:timer
    unit: ms
    hint: Milliseconds per tick from spark; lower is smoother.
  - key: uptime
    label: Uptime
    icon: lucide:clock
    hint: Time since the last server restart.
  - key: explored
    label: World Explored
    icon: lucide:map
    unit: '%'
    hint: Share of the generated world rendered into BlueMap.
  - key: mobs
    label: Mobs Defeated
    icon: lucide:swords
    hint: Lifetime hostile mobs slain, summed from world stats.
---

Jenscraft is my personal Minecraft server — the first **service** to land on Substrate. Version 1 ran on an AWS Lightsail VPS; this is the rebuild as a first-class homelab citizen, running on `srv-01` and documented end-to-end.

## What it is

A vanilla-plus survival world that's playable from **both** editions of the game at the same address:

- **Java Edition** for desktop play.
- **Bedrock Edition** for Xbox, mobile, and console — bridged in with GeyserMC + Floodgate, so console players join without needing a paid Java account.

The world is also browsable as a live 3D map at `map.jenscraft.world` via the BlueMap plugin.

## Architecture

The server runs as a dedicated **Proxmox LXC** on `srv-01`, isolated from the rest of the lab, on PaperMC (a performance-tuned Spigot fork) with Java 21.

The interesting part is exposure. Substrate's hard rule is that **nothing in the lab is publicly reachable** — the lab only ever connects _outward_. A public game server seems to break that, so Jenscraft keeps the rule by fronting the world with a small public relay:

- A cheap public VPS holds the public IP and `jenscraft.world` DNS.
- The relay forwards Java (TCP) and Bedrock (UDP) traffic over a **Tailscale** tunnel back to the LXC.
- The lab dials _out_ to the tunnel; no inbound ports are opened on the home network.

`map.jenscraft.world` is reverse-proxied through the same relay to the BlueMap web server. Access is kept invite-only via a whitelist plus Floodgate account linking.

## Live metrics

The dashboard below mirrors the Substrate telemetry pattern: a small publisher inside the LXC reads server health (player count + TPS/tick-time from spark, world-render coverage from BlueMap, and lifetime stats from the world save) and **pushes** a public-safe snapshot out to this site. Until that publisher reports in, the tiles read as _awaiting feed_.

> Operational detail (provisioning runbook, the relay setup, the metrics contract, and plugin tuning) lives in the private Substrate ops space in Notion — never in this repo.
