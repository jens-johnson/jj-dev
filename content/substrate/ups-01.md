---
title: APC Back-UPS 600VA
description: Battery backup; protects the server, modem, and firewall from power loss and surges.
publishedAt: '2026-06-04'
nodeId: ups-01
kind: ups
layer: power
status: planned
vendor: APC
model: BE600M1
power: 0
specs:
  - label: Capacity
    value: 600VA / 330W
  - label: Outlets
    value: 7 (4 battery + surge, 3 surge only)
  - label: USB
    value: Yes (graceful shutdown via apcupsd)
  - label: Runtime (est.)
    value: ~20 min at 35W server load
connections:
  - to: srv-01
    kind: power
    label: Battery
  - to: bgw320
    kind: power
    label: Battery
  - to: fw-01
    kind: power
    label: Battery
tags: [power, ups]
draft: false
---

Ordered, awaiting delivery. USB port enables graceful auto-shutdown of srv-01 via `apcupsd` on power loss. Recommended to configure the shutdown threshold at ~50% battery remaining.
