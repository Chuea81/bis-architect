# BiS Architect

A Best-in-Slot gear planner for WoW Classic and Turtle WoW. Build, compare, and optimize your character's equipment with EP-weighted scoring, full talent trees, buff/debuff tracking, and automated Oracle gear selection.

## Features

- **Gear Database** — Browse and equip items from Firestore, filtered by slot, source, and phase
- **EP Scoring** — Equivalence Point weights per spec, with customizable stat priorities
- **Talent Trees** — Full Classic talent calculator with stat contribution tracking
- **Buff Manager** — World buffs, consumables, and raid buff presets
- **Oracle Auto-Equip** — Automated BiS generation across selected content phases and sources
- **Professions Planner** — Plan consumable quantities and generate a reagent shopping list
- **Combat Simulator** — Basic DPS/TPS estimation from your current loadout
- **Build Manager** — Save and load named gear sets
- **Archmage Chat** — AI-powered gear advisor via Gemini

## Tech Stack

React 18 · TypeScript · Vite · Tailwind CSS · Zustand · Firebase Firestore · Firebase Auth · Google Gemini

## Getting Started

```bash
npm install
npm run dev
```

## Environment Variables

Copy `.env.example` to `.env` and fill in:

| Variable | Purpose |
|----------|---------|
| `VITE_FIREBASE_*` | Firebase project config |
| `VITE_ADMIN_EMAIL` | Google account email for admin access |
| `VITE_GEMINI_API_KEY` | Gemini API key for Archmage Chat |

## Build

```bash
npm run build     # Output in dist/
```

## Deploy

```bash
firebase deploy   # Deploys to Firebase Hosting
```
