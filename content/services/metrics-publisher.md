---
title: Metrics Publisher
description: The push-based telemetry agent that streams live Proxmox host health from srv-01 to the Substrate dashboard.
publishedAt: '2026-06-22'
serviceId: metrics-publisher
kind: monitoring
status: online
summary: Keeps the Substrate dashboard live — host CPU, RAM, load, uptime, and reachability, pushed out on a short interval.
host: srv-01
stack:
  - systemd
  - Upstash Redis
  - Vercel ingest
order: 20
tags: [monitoring, telemetry, push]
metrics: []
---

The Metrics Publisher is the small agent behind the **Healthy · N nodes reporting** bar at the top of this page. It runs on `srv-01`, reads the Proxmox host's health locally on a short interval, and **pushes** a public-safe snapshot out to the jj-dev ingest endpoint.

## What it reports

- **CPU / RAM / load** — live host utilisation
- **Uptime** — since the last host boot
- **Guests** — VM + container counts (and how many are running)
- **Storage** — pool usage
- **Internet** — edge reachability + round-trip latency

## How it works

Same rule as everything on Substrate: **the lab only ever dials out.** The publisher opens an outbound HTTPS connection to the ingest route with a bearer token and POSTs counts and percentages only — never hostnames, IPs, or anything identifying. No inbound port is ever opened on the home network. The site reads the latest snapshot publicly and renders it as `live`, `stale`, or `offline`.

> Operational detail (the unit, the payload contract) lives in the private Substrate ops space — never in this repo.
