# VantageMap

> Business and Strategy Modelling tool — a clone of [SAP LeanIX](https://www.leanix.net/), focusing on modelling and mapping business strategy.

## Overview

VantageMap is an open-source enterprise architecture and business strategy platform built with **Next.js 16**, **TypeScript**, and **Tailwind CSS**. It provides six integrated views:

| View | Description |
|------|-------------|
| **Dashboard** | At-a-glance summary of capabilities, applications, KPIs, and initiatives |
| **Business Capability Map** | Hierarchical capability map colour-coded by health status |
| **Application Portfolio** | Inventory of IT applications linked to business capabilities |
| **Strategy Map** | Balanced Scorecard with objectives, KPIs, and linked initiatives |
| **Technology Radar** | ThoughtWorks-style radar across Adopt / Trial / Assess / Hold rings |
| **Strategic Roadmap** | Gantt-style timeline of all strategic initiatives |

## Getting Started

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Tech Stack

- **Next.js 16** (App Router)
- **TypeScript**
- **Tailwind CSS v4**
- **Lucide React** icons
- **Recharts** (for future chart extensions)

## Project Structure

```
src/
  app/
    page.tsx              # Dashboard
    capabilities/page.tsx # Business Capability Map
    applications/page.tsx # Application Portfolio
    strategy/page.tsx     # Strategy Map (Balanced Scorecard)
    radar/page.tsx        # Technology Radar
    roadmap/page.tsx      # Strategic Roadmap (Gantt)
  components/
    Sidebar.tsx           # Navigation sidebar
  lib/
    data.ts               # Data models + sample data
```

## Licence

MIT
