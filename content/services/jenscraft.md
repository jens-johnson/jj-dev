---
title: Jenscraft
description: A cross-platform (Java + Bedrock) Minecraft server, self-hosted on Substrate.
publishedAt: '2026-06-16'
serviceId: jenscraft
kind: game-server
status: online
summary: My personal Minecraft server, built with Paper and Java and enhanced via plugins and utilities like Geyser, BlueMap, and Multiverse Core.
host: srv-01
address: jenscraft.world
stack:
  - PaperMC
  - GeyserMC
  - Floodgate
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
  - name: Multiverse-Core
    side: server
    category: quality-of-life
    purpose: Runs multiple worlds (survival + creative) side by side on one server.
    url: https://modrinth.com/plugin/multiverse-core
  - name: Multiverse-Inventories
    side: server
    category: quality-of-life
    purpose: Keeps a separate inventory per world so survival and creative stay isolated.
    url: https://modrinth.com/plugin/multiverse-inventories
  - name: Spark
    side: server
    category: performance
    purpose: Profiler + health monitor; used to feed telemetry to this dashboard.
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
  - name: ViaBackwards
    side: server
    category: quality-of-life
    purpose: Extends ViaVersion so older clients can connect too.
    url: https://github.com/ViaVersion/ViaBackwards
  - name: EssentialsX
    side: server
    category: quality-of-life
    purpose: Core everyday commands; homes, warps, kits, and server utilities.
    url: https://essentialsx.net/
  - name: WorldEdit
    side: server
    category: other
    purpose: In-game world editing for large-scale builds and terrain fixes.
    url: https://enginehub.org/worldedit
  - name: LuckPerms
    side: server
    category: moderation
    purpose: Permissions + group management for ops, trusted players, and guests.
    url: https://luckperms.net/
  - name: GriefPrevention
    side: server
    category: moderation
    purpose: Land claims that protect player builds from grief.
    url: https://www.spigotmc.org/resources/griefprevention.1884/
  - name: Prism
    side: server
    category: moderation
    purpose: Block-level audit log with grief rollback.
    url: https://prism.addons.network/
  - name: AxGraves
    side: server
    category: quality-of-life
    purpose: Drops a recoverable gravestone on death instead of scattering items.
    url: https://www.spigotmc.org/resources/axgraves.119689/
  - name: OnePlayerSleep
    side: server
    category: quality-of-life
    purpose: One player sleeping skips the night for everyone.
  - name: QuickWaystones
    side: server
    category: quality-of-life
    purpose: Player-placed waystones for quick fast-travel around the world.
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

Welcome to **Jenscraft**, my personal Minecraft server, and the first interactive service provisioned on [Substrate](/lab/substrate).

## Background

I created Jenscraft initially at the beginning of 2026, as a personal Minecraft server that I hosted on [AWS Lightsail](https://docs.aws.amazon.com/lightsail/). When I started getting into home labbing and created Substrate, I figured this was the perfect project to stand up as its first standalone service, save some money on AWS bills, and minimize latency for local play at home.

## What it is

A private vanilla [Java](https://dev.java/) Minecraft server running on [PaperMC](https://docs.papermc.io/), hoisted for crossplay compatibility with [Geyser](https://geysermc.org/) and [Floodgate](https://geysermc.org/wiki/floodgate/). [Multiverse Core](https://modrinth.com/plugin/multiverse-core) is enabled to support multiple worlds (i.e. survival and creative).

## Architecture

Jenscraft runs as a dedicated [Proxmox LXC](https://pve.proxmox.com/wiki/Linux_Container) on [`srv-01`](/lab/substrate/srv-01), isolated from other services. One of my security principles for Substrate is egress-only when it comes to networking. Jenscraft upholds this by:

- Using a public VPS as a small relay for traffic.
- The VPS holds the public Jenscraft IP and `jenscraft.world` DNS (both registered via [AWS Route 53](https://docs.aws.amazon.com/route53/)).
- The VPS forwards Java (TCP) and Bedrock (UDP) traffic over a [Tailscale](https://tailscale.com/kb/) tunnel back to the LXC, without exposing inbound ports on Substrate's network.

[`map.jenscraft.world`](https://map.jenscraft.world), a live map of the world enabled with [BlueMap](https://bluemap.bluecolored.de/), is reverse-proxied through the same relay to the BlueMap web server. Access is kept invite-only via a whitelist plus Floodgate account linking.

## Live metrics

The metrics dashboard on this page uses a similar Substrate telemetry pattern to the [Metrics Publisher](/lab/substrate/services/metrics-publisher) service: a small publisher inside the Jenscraft LXC reads server health (player count + TPS / tick-time from [Spark](https://spark.lucko.me/), world-render coverage from BlueMap, and lifetime stats from the world save) and **pushes** a public-safe snapshot out to this site. Until that publisher reports in, the tiles read as _awaiting feed_.
