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

I created **Agent Workstation** as a dedicated, isolated service on [`srv-01`](/lab/substrate/srv-01) to provide an environment where I can run sandboxed agentic flows.

## What it is

A purpose-built developer sandbox with [Claude Code](https://www.anthropic.com/claude-code) / Codex / etc. capabilities, functioning as a standalone service on [`srv-01`](/lab/substrate/srv-01). Supports SSH connection via [Tailscale](https://tailscale.com/kb/) tunneling.

## Architecture

Agent Workstation runs as an unprivileged [Proxmox LXC](https://pve.proxmox.com/wiki/Linux_Container) on [`srv-01`](/lab/substrate/srv-01), isolated from the other services on Substrate. It upholds Substrate's egress-only netsec principle by limiting exposure to a [Tailscale](https://tailscale.com/kb/) tunnel, remains firewalled from other Substrate services, and scopes credentials for specific agents.

## How it works

The LXC container ships a ready dev toolchain, including [Node.js](https://nodejs.org/), [pnpm](https://pnpm.io/), and a headless browser for UI checks, providing agents with the capability to locally instrument and validate changes for repositories. Baseline snapshots provide rollback capability and disaster recovery.
