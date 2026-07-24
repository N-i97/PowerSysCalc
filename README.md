# PowerSys Calc

> Engineering-grade electrical & power system calculation platform.

Production-grade web application for electrical design engineers and power system professionals. All calculations run entirely in the browser — inputs never leave the device.

## Stack

- **Vite** + **React 18** + **TypeScript** — fast HMR, small bundle, strong typing
- **React Router v6** — SEO-friendly URLs
- **Tailwind CSS** — utility-first, custom engineering design system
- **Custom calculation engine** — modular, type-safe, standards-aligned
- **PWA-ready** — manifest, offline-friendly architecture

No external state management or UI libraries — every component is purpose-built for the platform.

## Quick start

```bash
npm install
npm run dev        # http://localhost:5173
npm run build      # production bundle in /dist
npm run typecheck  # TypeScript validation
```

## Architecture

```
src/
├── engine/                  # Pure calculation logic (no React)
│   ├── calculator.ts        # CalculatorDefinition abstraction
│   ├── units.ts             # Unit conversion framework
│   ├── validation.ts        # Field validation
│   ├── cableData.ts         # Standard sizes, derating factors
│   ├── constants.ts         # Engineering constants
│   └── math.ts              # Pure-math helpers
├── calculators/             # One file per calculator
│   ├── power/               # singlePhase, threePhase, powerFactor, ...
│   ├── cable/               # voltageDrop, sizing, derating, shortCircuit
│   ├── transformer/         # sizing, current, efficiency
│   ├── motor/               # FLC, starting, VFD, breaker
│   ├── protection/          # breaker, fuse
│   ├── grounding/           # conductor, resistance
│   ├── renewable/           # inverter, battery, string
│   ├── threePhase/          # deltaWye, balancedLoad
│   └── conversion/          # hpKw, awgMm2
├── components/
│   ├── ui/                  # Button, Card, Input, ResultCard, Formula, ...
│   ├── calculator/          # CalculatorLayout (page template)
│   ├── schematic/           # SVG single-line diagrams
│   ├── home/                # Hero, category grid, quick access
│   └── layout/              # Navbar, Sidebar, Footer, Layout
├── pages/                   # Route components
├── data/registry.ts         # Single import surface for all calculators
├── hooks/                   # useCalculator, useRecent, useSEO
└── main.tsx, App.tsx        # Entry + router
```

## Calculator abstraction

Every calculator in the app is a single `CalculatorDefinition` object:

```ts
export const calc: CalculatorDefinition = {
  slug: 'three-phase-power',
  title: 'Three-Phase Power Calculator',
  category: 'three-phase',
  fields: [...],
  compute: (input) => ({ rows, raw, status, picks, summary }),
  formulas: [...],
  steps: [...],
  notes: [...],
  recommendations: [...],
  faq: [...],
  related: [...],
  seo: { title, description, keywords },
};
```

The `CalculatorLayout` component renders any definition — no per-page boilerplate.

## Standards

| Standard  | Use                                                       |
|-----------|-----------------------------------------------------------|
| IEC 60364-5-52 | Cable ampacity & derating                            |
| IEC 60076-1/7  | Power transformer ratings & loading                 |
| IEC 60034      | Rotating machines                                   |
| IEC 60947-4-1  | Motor starters / Type 2 coordination                |
| IEEE C57.12    | Distribution transformers                            |
| IEEE 1459      | Power definitions                                   |
| IEEE 80        | Substation grounding                                |
| NEC NFPA 70    | Branch circuits, OCPD, motor FLC (430.250)         |
| NEMA MG-1      | Motor performance / LR codes                        |

## Engineering design

Blueprint-inspired dark theme (`#0a1628` ink / `#ff6b1a` accent) with hairline grid lines, mono numerics, and industrial typography (Space Grotesk + Inter + JetBrains Mono). Mobile-first responsive down to 360px.

## Roadmap

- AI engineering assistant (plain-language queries)
- Single-line diagram export (SVG/DWG)
- Load flow & IEC 60909 short-circuit
- PDF export & saved projects
- Team collaboration
- Native mobile apps (PWA → iOS / Android)

## Disclaimer

PowerSys Calc is an engineering aid. Final design decisions must be made by a licensed professional engineer who has reviewed the inputs and applicable local codes.
