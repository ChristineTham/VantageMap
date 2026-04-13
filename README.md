# VantageMap

VantageMap is a high-level strategic modeling platform designed to bridge the gap between business vision and operational execution. It provides leaders with a unified, visual "source of truth" to navigate organizational complexity and drive informed decision-making.

---

## 💡 Naming Philosophy
The name VantageMap reflects our commitment to clarity, perspective, and direction:

* Vantage: Represents a "vantage point"—a position that affords a clear and commanding view of a situation. In a business context, this means moving beyond siloed data to see the entire organizational landscape from a strategic height.
* Map: A deliberate departure from technical jargon. A "Map" is a universal tool for navigation. It doesn’t just catalog assets; it shows where the organization stands today and defines the precise routes available to reach future goals.

VantageMap is built on the belief that strategy is only as good as your ability to see it.

---

## 🎯 Project Vision
VantageMap is designed for Chief Strategy Officers (CSOs), Business Architects, and Product Leaders who need to translate abstract goals into concrete roadmaps.
While traditional tools focus on technical inventory, VantageMap focuses on Business Capabilities, Value Streams, and Strategic Outcomes.
## Key Focus Areas:

* Strategic Alignment: Ensuring every project and resource is directly mapped to a corporate objective.
* Capability Modeling: Visualizing what the business does (rather than just what it owns) to identify gaps and redundancies.
* Agile Pivoting: Providing the data needed to shift directions quickly when market conditions change.

------------------------------

## 🚀 Key Features

* Dynamic Capability Heatmaps: Instantly visualize business performance and investment levels across different organizational functions.
* Scenario Sandbox: Model "What-If" shifts in strategy to see the downstream impact on resources and goals before committing.
* The "North Star" Dashboard: A high-level executive view that translates operational data into strategic risk and opportunity.
* Open Integration Layer: A robust API designed to pull data from across the enterprise, turning fragmented metadata into a cohesive strategic narrative.

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

------------------------------

## 🤝 Contributing
We are building a community of contributors who believe that Business Architecture is the missing link in the modern enterprise. Whether you are a developer, a designer, or a strategist, we welcome your input in making organizations more legible and agile.

------------------------------

## 📄 License

VantageMap is released under the Apache 2.0 License.
