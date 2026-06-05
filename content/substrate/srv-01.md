---
title: Dell OptiPlex Micro Plus 7010
description: Primary homelab server running Jellyfin media, Minecraft, and Docker services.
publishedAt: '2026-06-04'
nodeId: srv-01
kind: hypervisor
layer: compute
status: online
vendor: Dell
model: OptiPlex Micro Plus 7010
power: 35
specs:
  - label: CPU
    value: Intel Core i5-13500T (13th Gen, 14c/20t)
  - label: Memory
    value: 16 GB DDR5
  - label: Storage (OS)
    value: 256 GB NVMe SSD
  - label: iGPU
    value: Intel UHD Graphics 770 (AV1 + HEVC HW transcode)
  - label: Network
    value: 1 GbE + Wi-Fi
connections:
  - to: bgw320
    kind: network
    label: Cat 6 · 1 GbE
tags: [compute, docker, jellyfin, minecraft]
draft: false
---

Primary server acquired locally in San Diego for $290. Runs Proxmox or Ubuntu Server with Docker. Intel UHD 770 iGPU provides AV1 and HEVC hardware transcoding for Jellyfin; the best Quick Sync generation available at this price point. Will host: Jellyfin, Minecraft server, Portainer, and additional Docker services over time.

Currently cabled straight into the AT&T gateway over a Cat 6 patch run while the new switch and firewall are set up.
