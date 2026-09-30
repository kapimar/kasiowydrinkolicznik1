# Kasiula w Grecji

A single-page app for tracking drinks during the Greece trip. Add a photo of each drink, tag it with a pictogram (wine, cocktail, beer, other), and watch the running total and per-category breakdown update live.

## Features

- Big "Kasiula w Grecji" header with a live total drink counter
- Category breakdown (Wino / Drink / Piwo / Inne) shown as small stat pills
- Upload a photo for each drink and assign it a category via a pictogram picker
- Photo gallery with a category badge on every photo, and a way to remove an entry
- Photos are stored in Netlify Blobs; drink records (category + photo reference) are stored in Netlify Database (Postgres via Drizzle ORM)

## Tech stack

| Layer | Technology |
|-------|------------|
| Framework | TanStack Start |
| Frontend | React 19, TanStack Router v1, Tailwind CSS 4 |
| Icons | lucide-react |
| Database | Netlify Database (Postgres) via Drizzle ORM |
| File storage | Netlify Blobs |
| Image delivery | Netlify Image CDN |
| Deployment | Netlify |

## Running locally

```bash
npm install
netlify dev
```

`netlify dev` provides local emulation for Netlify Database and Netlify Blobs, which the app needs for storing drink records and photos.

## Project structure

- `src/routes/index.tsx` — the main (and only) page: header, counter, breakdown, upload form, gallery
- `src/routes/api/photos/$key.ts` — serves an uploaded photo by its Blobs key
- `src/server/drinks.server.ts` — database and blob storage logic
- `src/server/drinks.functions.ts` — server functions exposed to the frontend (list / add / remove a drink)
- `db/schema.ts` — the `drinks` table definition
- `netlify/database/migrations/` — generated SQL migrations, applied automatically on deploy
