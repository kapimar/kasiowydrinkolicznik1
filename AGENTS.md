# AGENTS.md

Overview of this project for AI agents working on the codebase.

## What this is

"Kasiula w Grecji" — a single-page drink tracker. Users upload a photo of each drink they've had, tag it with a category pictogram (wine, cocktail, beer, other), and see a running total plus a per-category breakdown.

## Tech stack

| Layer | Technology |
|-------|------------|
| Framework | TanStack Start |
| Frontend | React 19, TanStack Router v1 |
| Build | Vite 7 |
| Styling | Tailwind CSS 4 |
| Icons | lucide-react |
| Database | Netlify Database (Postgres) via Drizzle ORM |
| File storage | Netlify Blobs |
| Image delivery | Netlify Image CDN |
| Deployment | Netlify |

## Directory structure

```
├── db
│   ├── schema.ts               # Drizzle schema: the `drinks` table (id, category, photo_key, created_at)
│   └── index.ts                # Drizzle client (Netlify Database adapter)
├── drizzle.config.ts           # Drizzle Kit config; migrations output to netlify/database/migrations
├── netlify/database/migrations # Generated SQL migrations, applied automatically on deploy
├── src
│   ├── components
│   │   └── CategoryIcon.tsx    # Category -> icon/color/label lookup (CATEGORY_META) and <CategoryIcon>
│   ├── server
│   │   ├── drinks.server.ts    # DB + Blobs logic: listDrinks, createDrink, deleteDrink, getPhoto
│   │   └── drinks.functions.ts # createServerFn wrappers exposed to the frontend
│   ├── routes
│   │   ├── __root.tsx          # Root layout: HTML shell, page metadata
│   │   ├── index.tsx           # The entire app UI: header, counter, breakdown, upload form, gallery
│   │   └── api
│   │       └── photos
│   │           └── $key.ts     # Server route: streams a photo back from Netlify Blobs by key
│   ├── router.tsx
│   └── styles.css
└── netlify.toml
```

## Key concepts

### Data model

One table, `drinks` (`db/schema.ts`): `id`, `category` (`wine` | `cocktail` | `beer` | `other`), `photo_key` (the key of the photo in the `drink-photos` Blobs store), `created_at`.

### Photo storage

Uploaded photos are never written to disk or committed to the repo. They go straight to the `drink-photos` Netlify Blobs store, keyed by a random UUID + extension. `src/routes/api/photos/$key.ts` streams a photo back by key, and the frontend requests thumbnails through Netlify Image CDN, e.g. `/.netlify/images?url=/api/photos/<key>&w=400&h=400&fit=cover&fm=webp`.

### Server functions vs. server route

- `src/server/drinks.functions.ts` — RPC-style server functions (`getDrinks`, `addDrink`, `removeDrink`) called directly from `index.tsx`. `addDrink` accepts a `FormData` with a `photo` file and a `category` string.
- `src/routes/api/photos/$key.ts` — a plain HTTP server route, because it needs to return raw image bytes with a `Content-Type` header, which isn't a server-function use case.

## Conventions

- Categories are defined once in `src/server/drinks.server.ts` (`CATEGORIES`, `Category`) and mirrored for display in `src/components/CategoryIcon.tsx` (`CATEGORY_META`). Add a category in both places if one is ever needed.
- UI copy is in Polish, matching the app's audience.
- Schema changes always need a matching migration: update `db/schema.ts`, then run `npx drizzle-kit generate --name <description>`. Never hand-edit files under `netlify/database/migrations/`.

## Development

```bash
npm install
netlify dev
```

`netlify dev` is required (rather than `vite dev` alone) because it emulates Netlify Database and Netlify Blobs locally.
