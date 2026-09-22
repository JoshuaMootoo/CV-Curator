# CV Builder: Project Spec

## How to use this spec (instructions for Claude Code)

- Read this whole file before writing any code.
- Build **one phase at a time**, in the order listed under "Build phases". Stop at the end of each phase, summarise what was built, and wait for review before starting the next phase.
- At the end of every phase: run the type checker, linter and tests, fix any failures, then make a git commit with a clear message (e.g. `Phase 2: node library and category forms`).
- Do not add dependencies beyond those listed in "Tech stack" without asking first.
- If something in this spec is ambiguous or seems wrong, ask rather than guess.
- Do not build anything listed under "Out of scope for v1".

---

## Overview

A local web app for building tailored CVs. The user creates reusable **nodes** (pieces of CV content such as a job, a qualification or a skill), stores them in a **library**, then builds a CV by dragging nodes onto a page, arranging them, and exporting a properly formatted **Word document (.docx)**.

It is a single-user tool that runs on the user's own machine. There are no accounts and no hosting.

### Core workflow

1. User creates a node.
2. User selects the node's category (Experience, Education, Skill, etc.).
3. User fills in the fields for that category.
4. User saves the node to the library.
5. When building a CV, the user drags nodes from the library onto the page, where they snap into the section for their category.
6. User reorders nodes within sections, reorders the sections themselves, and toggles individual bullet points on or off.
7. A live preview shows the actual Word document as it will be exported.
8. User clicks Export and downloads a finished, fully editable .docx.

### Goals

- Write CV content once, reuse it across many tailored CVs.
- Fine-grained selection: individual bullet points can be included or excluded per CV.
- The exported .docx is a properly built Word document (real styles, real bullet lists, tab-aligned dates), not plain text.
- The preview is exactly what gets exported.

---

## Out of scope for v1

- User accounts, authentication, hosting or multi-user support
- Google Docs or Google Drive integration of any kind (the user will upload the .docx to Drive manually)
- MCP servers or any AI features
- A free-form canvas (nodes snap into sections; they are not positioned freely)
- PDF export

---

## Tech stack

| Concern | Choice |
|---|---|
| Framework | Next.js (App Router) with TypeScript, strict mode |
| Styling / UI | Tailwind CSS and shadcn/ui |
| Database | SQLite via `better-sqlite3` |
| ORM | Drizzle ORM with drizzle-kit migrations |
| Validation | Zod (one schema per node category) |
| Forms | react-hook-form with the Zod resolver |
| Drag and drop | dnd-kit (`@dnd-kit/core`, `@dnd-kit/sortable`) |
| Word generation | `docx` |
| Preview rendering | `docx-preview` |
| IDs | `crypto.randomUUID()` |
| Testing | Vitest, plus JSZip for inspecting generated .docx files in tests |

Database file lives at `./data/cv.db` and is gitignored.

---

## Data model

### `nodes`

| Column | Type | Notes |
|---|---|---|
| id | text (uuid) | primary key |
| category | text | one of the category keys below |
| title | text | display label in the library, derived from the data (e.g. "Barista, Starbucks") but editable |
| data | text (JSON) | category-specific fields, validated by that category's Zod schema |
| tags | text (JSON array of strings) | optional, used for filtering (tag UI arrives in a later phase, but store the field from the start) |
| createdAt | integer (timestamp) | |
| updatedAt | integer (timestamp) | |

Sub-items (bullet points, highlights) are stored inside `data` as arrays of `{ id: string, text: string }` so each one has a stable ID for per-CV toggling and overrides.

### `cvs`

| Column | Type | Notes |
|---|---|---|
| id | text (uuid) | primary key |
| name | text | e.g. "Junior Developer, Acme Ltd" |
| targetRole | text | optional |
| company | text | optional |
| jobDescription | text | optional, pasted text for reference |
| templateId | text | key of a template config |
| margins | text (JSON) nullable | `{ top, bottom, left, right }` in centimetres; null means use template default |
| sectionOrder | text (JSON array) | ordered list of section keys present on this CV |
| createdAt | integer | |
| updatedAt | integer | |

### `cv_items`

| Column | Type | Notes |
|---|---|---|
| id | text (uuid) | primary key |
| cvId | text | foreign key to `cvs`, cascade delete |
| nodeId | text | foreign key to `nodes`, cascade delete |
| section | text | section key (matches node category) |
| position | integer | order within the section |
| hiddenSubItemIds | text (JSON array) | IDs of bullets/highlights switched off for this CV |
| overrides | text (JSON) | per-CV edits, shape `{ fields: { [fieldName]: value }, subItems: { [subItemId]: text } }` |

Rules:
- A node can appear at most once per CV.
- Editing a master node updates every CV that uses it, except where that CV has an override for the edited field or sub-item.
- Deleting a node that is used in CVs shows a confirmation listing which CVs use it, then removes it from them.

---

## Node categories

Each category has a Zod schema in `src/lib/categories/`. The schema drives both the form and validation. A central registry maps category key to schema, display name, form field config, default section heading, and a function that derives the node title from its data.

Dates are stored as `YYYY-MM` strings. An `isCurrent` boolean replaces the end date where relevant.

| Category key | Section heading | Fields |
|---|---|---|
| `header` | (none, renders at top) | fullName (required), headline (optional, e.g. "Software Developer") |
| `contact` | (renders in header) | type (email, phone, location, linkedin, github, website, other), value (required), label (optional display text) |
| `statement` | Personal Statement | title (for library only), text (required, multiline) |
| `experience` | Experience | role, organisation, location, startDate, endDate, isCurrent, bullets[] |
| `education` | Education | institution, qualification, grade, location, startDate, endDate, isCurrent, highlights[] |
| `skill` | Skills | name, group (e.g. "Languages", "Tools", "Soft skills") |
| `project` | Projects | name, subtitle (e.g. tech used), link, startDate (optional), endDate (optional), bullets[] |
| `certification` | Certifications | name, issuer, date, link (optional) |
| `award` | Awards | name, issuer, date, description (optional) |
| `interest` | Interests | text |
| `reference` | References | text (e.g. "Available on request") or name, relationship, contact details |
| `custom` | user-defined | sectionTitle, heading, subheading, date, bullets[] |

Rendering notes:
- Only one `header` node per CV; it is always first and cannot be moved below other sections.
- `contact` nodes render in the header, joined on one line with a separator (e.g. ` | `), in the order they were placed.
- `skill` nodes render grouped by `group`, one line per group, e.g. **Languages:** C#, TypeScript, SQL.
- `interest` nodes render as a single comma-separated line.
- `custom` nodes with the same `sectionTitle` share a section.

---

## Screens

### 1. Library (`/library`)

- Grid or list of all nodes, filterable by category (and by tag once tags are built).
- Search by text.
- "New node" button opens a flow: choose category, then fill in that category's form.
- Each node card shows category, title and a short summary, with Edit, Duplicate and Delete actions.
- Forms support adding, removing and reordering bullets/highlights.

### 2. CV list (`/cvs`)

- List of saved CVs with name, target role, company and last updated date.
- Actions: Open, Duplicate, Rename, Delete.
- "New CV" creates an empty CV and opens the builder.

### 3. CV builder (`/cvs/[id]`)

Three-column layout on desktop:

- **Left: node library panel.** Filterable by category, with search. Nodes already on this CV are marked as used and cannot be dropped again.
- **Centre: page structure.** The CV's sections in order, each containing its placed nodes as cards.
  - Dropping a node onto the page places it in the section matching its category. If that section does not exist yet, it is created and appended to the end of `sectionOrder`.
  - Nodes can be reordered within their section by dragging.
  - Sections can be reordered by dragging their headings (header section stays fixed at the top).
  - Each placed node has a remove button, and an expand toggle showing its bullets/highlights with a checkbox each to include or exclude them for this CV.
  - Each placed node has an "Edit for this CV" action to create overrides. Overridden content shows a small badge, with a "Reset to original" action.
  - Removing the last node from a section removes the section.
- **Right: live preview.** The real .docx rendered with `docx-preview` (see "Preview").

Top bar of the builder:
- CV name (editable inline), template selector, margins control, page count indicator, Export button.

### Margins control

- Presets: **Normal** (2.54 cm all sides), **Moderate** (2.54 cm top/bottom, 1.91 cm left/right), **Narrow** (1.27 cm all sides), **Template default**, and **Custom**.
- Custom shows four numeric inputs (top, bottom, left, right) in centimetres, min 0.5, max 5, step 0.1.
- Changing margins updates the preview immediately.

---

## Templates

A template is a config object in `src/lib/templates/`, not separate code. The docx builder reads it. Adding a template means adding a config file and registering it.

Template config includes:
- id, display name
- default margins (cm)
- body font family and size (pt)
- name font size, headline font size
- section heading style: size, bold, uppercase, colour, bottom border on or off, spacing before and after
- entry heading style (job title / qualification line)
- colours (text, accent)
- paragraph and bullet spacing
- bullet indent
- date format and separator (default: `MMM YYYY`, e.g. "Sep 2021", with " - " between start and end, and "Present" for current)
- contact line separator

v1 ships **one template**: a clean UK-style CV ("Classic") with Calibri 11pt body, A4, 2 cm margins, uppercase section headings with a thin bottom border, and no photo.

---

## Word export

Built in `src/lib/docx/buildCv.ts` as a pure function:

```ts
buildCvDocument(cv, resolvedItems, template): Document
```

where `resolvedItems` is the CV's items with node data, overrides applied and hidden sub-items removed. Resolution logic lives in its own function (`resolveCvItems`) so it can be unit tested separately.

The same function is used for both preview and export, so they cannot drift apart. It must work in the browser (use `Packer.toBlob`).

Requirements for the output:
- **Page:** A4 (11906 x 16838 twips). Margins from the CV override, else the template default. Convert centimetres to twips (1 cm = 567 twips, rounded).
- **Styles:** define named paragraph styles in the document (Name, Headline, Section Heading, Entry Heading, Entry Subheading, Body) so the user can restyle the document in Word afterwards by editing a style.
- **Bullets:** use real Word numbering/bullet definitions, not typed characters.
- **Dates:** entry heading lines put the title on the left and dates right-aligned using a right tab stop positioned at the content width (page width minus left and right margins, in twips). Recalculate this when margins change.
- **Page breaks:** set `keepNext` on section headings and entry headings, and `keepLines` on entry paragraphs, so a heading is never stranded at the bottom of a page away from its content.
- **Links:** LinkedIn, GitHub, website and project links render as real hyperlinks.
- **Filename:** the CV name, sanitised for the filesystem, with `.docx` (e.g. `Junior Developer, Acme Ltd.docx`).

---

## Preview

- On any change to the CV (items, order, toggles, overrides, template, margins), regenerate the document with `buildCvDocument`, debounced by about 300 ms.
- Render the resulting blob with `docx-preview`'s `renderAsync`, with page breaks enabled so pages display separately.
- **Page count:** count the rendered page elements. Show it in the top bar as e.g. "2 pages". Show a warning style when over 2 pages. Include a small note that Word may paginate slightly differently.

---

## Backup and restore

- Settings page (`/settings`) with **Export library** (downloads a JSON file with all nodes, CVs and CV items plus a schema version number) and **Import library**.
- Import validates the file with Zod and, after a confirmation dialog, **replaces** all existing data.

---

## Project structure

```
src/
  app/
    library/
    cvs/
      [id]/
    settings/
  components/
    library/
    builder/
    preview/
    ui/            (shadcn components)
  lib/
    db/            (drizzle schema, client, queries)
    categories/    (zod schemas, registry, form configs)
    templates/     (template configs, registry)
    docx/          (buildCv, resolveCvItems, helpers)
    backup/
  tests/
data/              (cv.db, gitignored)
```

Data access uses server actions or route handlers; the database is only touched on the server. The docx builder runs on the client for the preview and export.

---

## Testing

Use Vitest. Required coverage:
- Every category schema: valid and invalid examples.
- `resolveCvItems`: overrides applied, hidden sub-items removed, master edits propagate where not overridden.
- `buildCvDocument`: generate a document, unzip it with JSZip, and assert on `word/document.xml`, including that text from each placed node appears in order, hidden bullets are absent, margins are written in the correct twips, and the right tab stop position matches the content width.
- Database queries for nodes, CVs and CV items (use a temporary database per test run).
- Backup export then import round-trips to identical data.

---

## Seed data

Provide a seed script (`npm run seed`) that inserts a fictional person with at least one node of every category, including an Experience node with four bullets and an Education node with highlights, plus one example CV that uses most of them. Do not use real personal data.

---

## Build phases

### Phase 1: Foundation
- Scaffold Next.js with TypeScript, Tailwind, shadcn/ui, Vitest, ESLint.
- Drizzle schema for `nodes`, `cvs`, `cv_items`; migrations; database client.
- Category Zod schemas and registry for all categories.
- Seed script.
- **Done when:** migrations run, seed script populates the database, schema tests pass.

### Phase 2: Node library
- Library screen with filtering by category and search.
- Create flow (choose category, then form), edit, duplicate, delete (with the used-in-CVs warning).
- Bullet/highlight add, remove and reorder in forms.
- **Done when:** every category can be created, edited and deleted through the UI.

### Phase 3: Word export proof
- `resolveCvItems` and `buildCvDocument` with the Classic template.
- A temporary dev page that exports the seeded example CV to .docx.
- **Done when:** the downloaded file opens cleanly in Word with correct styles, real bullets, right-aligned dates and no stranded headings, and docx tests pass. Stop here for the user to check the output in Word before continuing.

### Phase 4: CV builder
- CV list screen (create, open, duplicate, rename, delete).
- Builder with library panel and page structure: drag onto page, snap to sections, reorder within sections, reorder sections, remove, bullet toggles.
- Export button wired up.
- **Done when:** a CV can be built entirely through dragging and exported.

### Phase 5: Live preview
- `docx-preview` panel, debounced regeneration, page count with over-two-pages warning.
- Remove the temporary dev export page from Phase 3.
- **Done when:** every builder change is reflected in the preview.

### Phase 6: Per-CV settings
- Margins control with presets and custom values.
- Per-CV overrides with badges and reset.
- Template selector (with only Classic available, but wired for more).
- **Done when:** margins and overrides show in the preview and the export, and override tests pass.

### Phase 7: Backup and restore
- Settings page with JSON export and import.
- **Done when:** round-trip test passes and import replaces data after confirmation.

### Phase 8: Extras (each one is a separate, reviewable step)
1. Tags: tag editing on nodes, tag filter in the library and builder panel, and "add all nodes with this tag" in the builder.
2. A second template (e.g. "Modern" with an accent colour and different heading style).
3. Job description panel in the builder that highlights which of the user's skills and tags appear in the pasted job description.

---

## Future ideas (not to be built unless asked)

- Upload the exported .docx to Google Drive with conversion to Google Docs
- AI suggestions for which nodes to include or how to reword bullets
- Cover letter builder using the same library
- Application tracker linking each CV to where it was sent
- Import content from an existing CV file
