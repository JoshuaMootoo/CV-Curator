# CV Curator

A local web app for building tailored CVs. Create reusable content **nodes**
(a job, a qualification, a skill), store them in a library, then build a CV
by dragging nodes onto a page and exporting a properly formatted Word
document (`.docx`). See [`SPEC.md`](./SPEC.md) for the full project spec
and build phases.

Single-user, runs on your own machine — no accounts, no hosting.

## Getting started

```bash
npm install
npm run db:migrate   # create ./data/cv.db and apply migrations
npm run seed         # populate it with example data
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Scripts

| Command | What it does |
|---|---|
| `npm run dev` | Start the dev server |
| `npm run build` | Production build |
| `npm run lint` | ESLint |
| `npm test` | Run the Vitest suite |
| `npm run db:generate` | Generate a new Drizzle migration from schema changes |
| `npm run db:migrate` | Apply pending migrations to `./data/cv.db` |
| `npm run seed` | Reset and reseed the database with example data |

## Tech stack

Next.js (App Router, TypeScript, strict mode), Tailwind CSS + shadcn/ui,
SQLite via `better-sqlite3`, Drizzle ORM, Zod, react-hook-form, dnd-kit,
`docx` + `docx-preview`, Vitest.

## Project structure

```
src/
  app/            routes
  components/     UI components
  lib/
    db/           drizzle schema, client, queries, migrations, seed
    categories/   zod schemas + registry for each node category
    templates/    CV template configs (Phase 3+)
    docx/         .docx builder (Phase 3+)
    backup/       import/export (Phase 7)
tests/            vitest tests
data/             cv.db (gitignored)
```

## Status

**Phase 1: Foundation** — complete. Drizzle schema and migrations for
`nodes`, `cvs`, `cv_items`; a Zod schema and registry entry for every node
category; a seed script; and passing schema/query tests.

Later phases (library UI, docx export, drag-and-drop builder, live preview,
per-CV settings, backup/restore) are built incrementally per the spec.
