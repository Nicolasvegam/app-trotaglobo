# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview
Trotaglobo is Nico's public travel log (https://trotaglobo.nicovega.dev): past trips and the next planned one on an interactive world map. It is a static site; there is no login and no database.

## Technology Stack
- **Framework**: Next.js 15.2 with App Router (all pages prerendered at build time)
- **Data**: a single JSON file, `src/data/trips.json`
- **Styling**: Tailwind CSS v4
- **UI Components**: shadcn/ui-style primitives in `src/components/ui/`
- **Maps**: Google Maps API (@react-google-maps/api)
- **TypeScript**: Strict type checking enabled

## Essential Commands
```bash
npm run dev           # Starts development server with Turbopack
npm run build         # Creates production build
npm run lint          # Runs Next.js linting
```

## Data
All content lives in `src/data/trips.json`, an array of trips:

```jsonc
{
  "id": "rio-buzios-2026",          // URL slug: /trips/<id>
  "title": "Rio & Búzios 2026",
  "description": "...",
  "start_date": "2026-06-17",        // YYYY-MM-DD
  "end_date": "2026-06-25",
  "cover_image": "https://images.unsplash.com/...",
  "tags": ["Playas"],
  "cities": [
    { "name": "Búzios", "country": "Brazil", "lat": -22.7469, "lng": -41.8817, "places": ["Rua das Pedras"] }
  ]
}
```

- Trips whose `end_date` is in the future show as "Planned"; stats only count past trips.
- `country` must be an English name known to `src/utils/index.ts` (flag + continent maps); add new countries there.
- Use one spelling per city so the "unique cities" stat doesn't double count.
- The source of truth for trip history is the Obsidian note "✈️ Historial de Viajes".

`src/lib/trips.ts` loads the JSON and exposes `getTrips`, `getTrip` and date helpers (dates are parsed as local dates with `parseISO`).

## Environment Variables
```
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY
```
