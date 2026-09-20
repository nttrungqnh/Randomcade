# RandomShow

RandomShow turns simple random selections into visual experiences.

This repository currently contains **Phase 3 - Create Show Builder**. It includes the cinematic Home Experience from Phase 2 plus a five-step, local-first show setup flow for teams, dynamic group configuration, experience selection, and final review.

Builder metadata is persisted locally with Zustand. Participant photos are center-cropped to 4:5, resized, encoded as WebP, and stored as Blob data in IndexedDB with Dexie. No participant image is uploaded to a server or stored as Base64.

Group capacities are calculated deterministically in `src/utils/groupSetup.ts`; group count is constrained by the actual team count and group names expand from `A` through `Z`, `AA`, `AB`, and so on. The interactive picker on the home page and the group preview in the builder are presentation-only. The real Random Engine is intentionally reserved for a future phase.

## Tech stack

- React + TypeScript + Vite
- React Router
- Tailwind CSS
- GSAP for future cinematic animation
- PixiJS for future particles and visual effects
- Howler.js for future sound playback
- Dexie for future local image storage with IndexedDB
- Zustand for state management
- Lucide React for icons

## Run locally

```bash
npm install
npm run dev
```

## Type check

```bash
npm run typecheck
```

## Production build

```bash
npm run build
```
