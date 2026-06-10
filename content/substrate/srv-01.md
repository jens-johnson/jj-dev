---
title: Dell OptiPlex Micro Plus 7010
description: Primary homelab server; a headless Proxmox VE host for the lab's VMs and containers.
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
  - label: OS
    value: Proxmox VE
  - label: Access
    value: Headless (remote)
connections:
  - to: gw-01
    kind: network
    label: Cat 6 · 1 GbE
tags: [compute, proxmox, docker, jellyfin]
draft: false
---

The hero machine of the lab: a Dell OptiPlex Micro Plus 7010 picked up locally for $290, the standout in a field of about a dozen machines I evaluated. Newest architecture, best-in-class transcode support for a media server, and excellent performance per watt. The Intel UHD 770 iGPU handles AV1 and HEVC hardware transcoding, the best Quick Sync generation available at this price point.

## The hunt

Shopping for used mini PCs taught me a few things:

- **Generation beats the i5/i7 badge.** An 8th-gen i5 outruns a 6th-gen i7 for this workload; a no-name "i7" listing is often a trap.
- **Quick Sync is what matters for a media server.** Older iGPUs choke on modern codecs and fall back to the CPU.
- **Skip gray-market storage deals.** Stick to reputable brands and sellers; the savings aren't worth the failure risk on a drive that holds your library.
- **Match the form factor before you buy** (2.5" vs 3.5", DisplayPort vs HDMI). Small mismatches cost days.

## The setup saga

Went fully headless: enabled remote shell and remote desktop so the box could be managed from a laptop with no monitor. A couple of honest gotchas worth passing on: a Bluetooth keyboard won't work during boot or BIOS (you need a wired one for the bare-metal install), and a DisplayPort-only mini PC means a cheap adapter if all you own is HDMI. From there, flashed and installed Proxmox VE bare-metal, switched to the free update channel, updated, and rebooted.

## Where it stands

**Proxmox VE is live**, running as the hypervisor and reachable from a browser on the local network. Remote access goes through a private mesh VPN, so the admin interfaces stay off the public internet. Next up: containerized services (Jellyfin and a Minecraft server to start) and tidy storage.
