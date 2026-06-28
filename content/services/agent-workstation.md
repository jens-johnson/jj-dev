---
title: Agent Workstation
description: An isolated, self-hosted environment where AI coding agents work on my projects, provisioned on Substrate.
publishedAt: '2026-06-27'
serviceId: agent-workstation
kind: automation
status: online
icon: lucide:bot
summary: A sandboxed remote workspace for AI coding agents — an isolated, egress-only Proxmox LXC running Claude Code.
host: srv-01
stack:
  - Proxmox LXC
  - Tailscale
  - Claude Code
  - Node.js
  - pnpm
order: 30
tags: [ai, agents, automation, dev]
metrics: []
---

**Agent Workstation** is a dedicated, isolated environment whose whole purpose is to give AI coding agents a safe place to work on my projects — kept well away from my laptop and the rest of the homelab.

## What it is

A purpose-built developer sandbox running [Claude Code](https://www.anthropic.com/claude-code) as a standalone service on [`srv-01`](/lab/substrate/srv-01). I connect to it privately, hand an agent a repository, and it clones, edits, builds, and opens pull requests — all on hardware I own.

## Architecture

Agent Workstation runs as an unprivileged [Proxmox LXC](https://pve.proxmox.com/wiki/Linux_Container) on [`srv-01`](/lab/substrate/srv-01), isolated from the other services on Substrate. It upholds the same egress-only security principle as the rest of the fleet:

- Reached privately over a [Tailscale](https://tailscale.com/kb/) tunnel — never exposed to the public internet, with key-only access.
- A host firewall keeps the box from reaching the rest of the home network, leaving only outbound access to the internet and the source forges it needs.
- Credentials live only on the box and are scoped to the work an agent is trusted to do.

## How it works

The container ships a ready dev toolchain — [Node.js](https://nodejs.org/), [pnpm](https://pnpm.io/), and a headless browser for UI checks — so an agent can run a full lint → typecheck → build → pull-request loop unattended. A clean baseline snapshot turns any messy session into a one-command rollback.
