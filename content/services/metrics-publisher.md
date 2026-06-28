---
title: Metrics Publisher
description: The metrics agent that streams live telemetry from the Optiplex (srv-01) to this dashboard.
publishedAt: '2026-06-22'
serviceId: metrics-publisher
kind: monitoring
status: online
summary: A telemetry capturing service for the homelab, emitting metrics like host CPU, RAM, load, uptime, and more for this Substrate dashboard.
host: srv-01
stack:
  - systemd
  - Upstash Redis
  - Vercel ingest
order: 20
tags: [monitoring, telemetry, push]
metrics: []
---

**Metrics publisher** is a small, standalone service provisioned as a [Proxmox LXC](https://pve.proxmox.com/wiki/Linux_Container) on [`srv-01`](/lab/substrate/srv-01) which publishes health telemetry to this dashboard on a 1-minute interval.

## What it reports

- **CPU / RAM / load** — live host utilisation
- **Uptime** — since the last host boot
- **Guests** — VM + container counts (and how many are running)
- **Storage** — pool usage
- **Internet** — edge reachability + round-trip latency

## How it works

Metrics publisher runs a [`cron`](https://man7.org/linux/man-pages/man5/crontab.5.html) job, capturing local health telemetry from [`srv-01`](/lab/substrate/srv-01) on an interval timer and posting it to an ingestion endpoint on this site. This service is security-forward, only exposing outbound traffic and masking sensitive data (i.e. IP addresses, host names, etc.). Telemetry is upserted using [Upstash Redis](https://upstash.com/docs/redis/overall/getstarted).

> Operational detail (the unit, the payload contract) lives in the private Substrate ops space — never in this repo.
