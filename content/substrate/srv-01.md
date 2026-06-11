---
title: Dell OptiPlex Micro Plus 7010
description: The core hardware of the project; a secondhand Dell OptiPlex running Proxmox VE.
publishedAt: '2026-06-04'
nodeId: srv-01
kind: hypervisor
layer: compute
status: online
vendor: Dell
model: OptiPlex Micro Plus 7010
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
tags: [compute, proxmox]
draft: false
---

The core hardware component of this project: a powerful, optimized, extensible Dell OptiPlex server acquired secondhand, with features like:

- New-generation Intel i5 CPU
- AV1 and HEVC hardware Quick Sync transcoding via the Intel UHD 770 iGPU
- Proxmox VE running on bare metal, with Tailscale for secure remote access
