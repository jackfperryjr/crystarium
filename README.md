# Crystarium

> Your second brain, rendered as a living graph. Every article, thread, and idea — connected by meaning, not by memory.

Part of the **Magiloom** second-brain ecosystem alongside [Aetherneedle](https://github.com/jackfperryjr/aetherneedle) and [Magicite](https://github.com/jackfperryjr/magicite).

<p align="center">
  <img src="https://github.com/jackfperryjr/crystarium/actions/workflows/deploy-crystarium.yml/badge.svg" alt="Build Status" height="20">
  <img src="https://img.shields.io/badge/Next.js-000000?style=flat-square&logo=nextdotjs&logoColor=white" />
  <img src="https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=flat-square&logo=tailwind-css&logoColor=white" />
  <img src="https://img.shields.io/badge/Supabase-3FC085?style=flat-square&logo=supabase&logoColor=white" alt="Supabase">
</p>

---

## What it does

Crystarium is the visual interface where your accumulated knowledge takes shape. Every clip saved through Aetherneedle and processed by Magicite appears here as a node. Crystarium then draws **aether-lines** — edges between nodes derived from semantic similarity rather than manual tagging.

The result is a knowledge graph that surfaces connections you didn't know existed.

- **Force graph** — interactive 2D/3D visualization powered by `react-force-graph`
- **Semantic edges** — relationships computed via pgvector cosine similarity, not manual links
- **Full-text search** — find any clip across your entire vault instantly
- **Private by default** — every node is scoped to your account; nothing is public

---

## Stack

| Layer | Technology |
|---|---|
| Framework | Next.js |
| Graph | react-force-graph |
| Database | Supabase (Postgres + pgvector) |
| Auth | Supabase — Google OAuth |
| Styling | Tailwind CSS |

---

## Data model

Each node in the graph maps to a `clip` — a URL, a title, a Claude-generated summary, extracted entities, and a `vector(1024)` embedding. Edges are derived at query time using the `match_clips` Postgres function, which returns neighbors by cosine similarity above a configurable threshold.
