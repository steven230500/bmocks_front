# bmocks

REST mock explorer — navigate to any route and it calls your API automatically.

`yourdomain.com/shifts` → calls `bmocks.com/shifts`

## Concept

Every URL path maps to the same path on your configured base URL. Useful for browsing, testing, and managing mock data without touching code.

## API operations

| Method | Path | Description |
|--------|------|-------------|
| GET | `/{resource}` | List all records |
| GET | `/{resource}/:id` | Get single record |
| POST | `/{resource}` | Create record |
| PUT | `/{resource}/:id` | Update record |
| DELETE | `/{resource}/:id` | Delete record |

## Built-in mock server

Routes under `/api/mocks/` provide an in-memory REST API. Use it as your base URL during development:

```
Base URL: http://localhost:3000/api/mocks
```

Data lives in memory — resets on server restart.

### Bulk import

```bash
POST /api/mocks/shifts
Content-Type: application/json

[
  { "id": 1, "name": "Morning", "start": "08:00" },
  { "id": 2, "name": "Evening", "start": "16:00" }
]
```

## Architecture

```
app/
  page.tsx                    # Home — config + navigation
  [resource]/page.tsx         # Resource view (lean orchestration only)
  api/mocks/
    [resource]/route.ts       # GET list, POST, DELETE all
    [resource]/[id]/route.ts  # GET one, PUT, PATCH, DELETE

components/
  resource/
    resource-table.tsx        # Data table
    record-modal.tsx          # Create / Edit / View modal
    delete-confirm.tsx        # Delete confirmation dialog
  ui/                         # shadcn/ui components

hooks/
  use-resource.ts             # SWR-based CRUD hook

lib/
  api-client.ts               # Fetch wrapper (buildUrl, apiFetch)
  config-store.ts             # Zustand persisted config (baseUrl, auth, idField)
  mock-store.ts               # In-memory mock data store (singleton)
  utils.ts                    # Tailwind cn helper

types/
  index.ts                    # Shared types (ResourceRecord, ModalMode, ApiConfig)
```

### Key decisions

**`useResource` hook** — all CRUD logic lives here. Pages only call `create`, `update`, `remove`. SWR handles caching and revalidation automatically.

**`api-client.ts`** — single place to change fetch behavior (headers, base URL normalization). Nothing else touches `fetch` directly.

**`mock-store.ts` singleton** — survives Next.js hot-reload in dev via `globalThis`. Resets on cold start.

**`types/index.ts`** — `ResourceRecord = Record<string, unknown>` is intentionally loose since mock data has no fixed schema.

## Config

Set once from the home page, persisted in `localStorage` via Zustand.

| Field | Default | Description |
|-------|---------|-------------|
| Base URL | `https://bmocks.com` | Target API |
| Authorization | — | `Authorization` header value |
| ID Field | `id` | Field used to identify records |

## Stack

- Next.js 16 (App Router)
- TypeScript
- Tailwind CSS v4
- shadcn/ui
- Zustand (config persistence)
- SWR (data fetching)
- Vercel Analytics

## Running locally

```bash
pnpm install
pnpm dev
```

Open `http://localhost:3000`, set base URL to `http://localhost:3000/api/mocks`, navigate to any resource.
