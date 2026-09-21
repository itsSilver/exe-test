# Edison Cloud — Test 1

Mobile-first web application that replicates part of Edison PLUS: user login, and consultation
and management of customer activities/tickets. Single Nuxt application — Vue 3 front-end and
Nitro server routes as the Node back-end — reading and writing the supplied Firebird 2.5
database.

---

- [Stack](#stack)
- [Requirements](#requirements)
- [Setup](#setup)
- [Development](#development)
- [Progressive web app](#progressive-web-app)
- [Testing](#testing)
- [Database](#database)
- [Project Structure](#project-structure)
- [Scripts](#scripts)
- [Notes on the legacy schema](#notes-on-the-legacy-schema)

## Stack

- [Nuxt 4](https://nuxt.com/) (Vue 3.5) with [Nitro](https://nitro.build/) server routes
- [Nuxt UI 4](https://ui.nuxt.com/) on Tailwind CSS 4 for all components and theming
- [Pinia](https://pinia.vuejs.org/) for the authenticated session
- [Zod](https://zod.dev/) schemas in `shared/`, imported by both the Nitro routes and the forms
- [@nuxtjs/i18n](https://i18n.nuxtjs.org/) with Italian and English, applied to API responses too
- [GSAP](https://gsap.com/) for view transitions
- [node-firebird](https://github.com/hgourvest/node-firebird) — pure JavaScript Firebird
  driver, no native `fbclient` required
- [ESLint](https://eslint.org/) via [@nuxt/eslint](https://eslint.nuxt.com/) for linting and formatting
- [Cloudflare Turnstile](https://developers.cloudflare.com/turnstile/) for the login challenge
- [@vite-pwa/nuxt](https://vite-pwa-org.netlify.app/frameworks/nuxt) for installability and
  offline reads
- Firebird 2.5 in Docker for local development

## Requirements

- Node.js 22+
- pnpm 10+
- Docker (for the local Firebird 2.5 instance)
- A Cloudflare Turnstile site key and secret key (free; the Cloudflare test keys
  `1x00000000000000000000AA` / `1x0000000000000000000000000000000AA` work for local development)

The Firebird database file is not committed. Copy the supplied `EDISONFDB_DATI.FDB` into
`docker/firebird/data/` before starting the container:

```bash
mkdir -p docker/firebird/data
cp /path/to/EDISONFDB_DATI.FDB docker/firebird/data/
```

## Setup

```bash
pnpm install
cp .env.example .env
docker compose up -d
pnpm dev
```

Fill in `NUXT_PUBLIC_TURNSTILE_SITE_KEY` and `NUXT_TURNSTILE_SECRET_KEY` in `.env` before
logging in.

The application is served on http://localhost:3000; if that port is already taken Nuxt falls
back to the next free one and prints the address on startup.

On Apple Silicon the Firebird image runs under emulation; the `platform: linux/amd64` key in
`docker-compose.yml` handles this and no extra configuration is needed.

## Development

Test users live in `TBUTEN`. Any of the following work, all with password `123`:

| Codice | Descrizione |
| ------ | ----------- |
| `01`   | UTENTE 01   |
| `02`   | UTENTE 02   |
| `W1`   | WEB DEMO 1  |

## Progressive web app

The application installs to the home screen and keeps working without a connection, within the
limits of the data source:

- **Installable** — web manifest, maskable icons, standalone display, portrait orientation.
- **Instant loads** — the app shell is precached, so a repeat visit renders before the network
  answers.
- **Offline reads** — the ticket list is served `NetworkFirst` with a three second timeout and
  falls back to the copy in the `edison-activities` cache, so the last list stays readable with
  no connection. A banner says so.
- **Automatic updates** — a new service worker takes over on the next visit.

Firebird is a server database reached over TCP, so there is no offline mode to inherit from it:
everything offline here comes from what the browser has already cached. Writing offline is
deliberately not supported — `TBATCL.IDREC` is assigned by a trigger on insert, so a queued
change could not know its own identity, and Edison PLUS users are editing the same rows in the
meantime. Insert, edit and delete therefore require a connection.

## Testing

[Vitest](https://vitest.dev/) covers the pure parts of the server: locale resolution and
translation, the response envelopes, the mapping out of the legacy columns, and the login
schema. Tests sit next to the code they cover as `*.test.ts`.

```bash
pnpm test         # single run
pnpm test:watch   # watch mode
```

They need neither the database nor a running server, so the suite finishes in well under a
second.

GitHub Actions runs the same checks on every push and pull request to `main`, in order:
linting, type checking, tests, then a production build.

## Database

The container exposes Firebird 2.5 on port 3050 and mounts `docker/firebird/data` as the
database directory, so the `.FDB` file is used in place rather than copied into a volume.

| Setting  | Value                              |
| -------- | ---------------------------------- |
| Host     | `localhost:3050`                   |
| Database | `/firebird/data/EDISONFDB_DATI.FDB` |
| User     | `SYSDBA`                           |
| Password | `masterkey`                        |
| Charset  | `ISO8859_1`                        |

To open a SQL prompt against the running container:

```bash
docker exec -it edison-cloud-firebird \
	/usr/local/firebird/bin/isql -u SYSDBA -p masterkey /firebird/data/EDISONFDB_DATI.FDB
```

Tables used by this project:

| Table    | Purpose                                                             |
| -------- | ------------------------------------------------------------------- |
| `TBUTEN` | Application users (login)                                            |
| `TBATCL` | Customer activities/tickets                                          |
| `TBCLIE` | Customers                                                            |
| `TBPERS` | People assigned to an activity                                       |
| `TBGENE` | Generic lookup table; work types are the rows with `CTPGENE = '03'`   |

## Project Structure

```text
shared/
  schemas/              # Zod contracts used by the API and the forms
  types/                # ApiResponse / ApiPaginatedResponse envelopes
i18n/
  locales/              # it.json and en.json, read by the app and the server
app/
  components/           # Nuxt UI based components
    Attivita/           # Ticket list, detail form, pickers
  composables/
    useLocaleSwitcher.ts  # Language selection, persisted in a cookie
    useNotify.ts          # Success and error toasts for API calls
    useZodValidator.ts    # Translates schema messages for UForm
  layouts/
  middleware/
    auth.global.ts      # Redirects to /login when there is no session
  plugins/
    locale.ts           # Restores the saved language on startup
  pages/
    login.vue
    attivita/           # List, insert, edit, view
  stores/
    auth.ts             # Pinia session store
server/
  api/                  # Route handlers: read input, call a service, return an envelope
  services/             # Business rules; the only thing handlers talk to
  db/
    client.ts           # node-firebird connection pool
    repositories/       # SQL and row mapping; legacy columns stop here
  lib/
    dates.ts            # Local-time formatting for DDATATTI
    errors.ts           # ApiError and its factories
    handler.ts          # defineApiHandler and schema-validated input
    hours.ts            # Minutes to decimal hours
    i18n.ts             # Locale resolution and translation for API responses
    response.ts         # toJson / toJsonPaginated / toErrorJson
    rtf.ts              # MMEMO encode/decode
    session.ts          # Sealed cookie session helpers
  plugins/
    firebird.ts         # Closes the connection pool on shutdown
docker/
  firebird/data/        # The .FDB file (git-ignored)
```

Three layers, each with one job. **Repositories** hold the SQL and turn rows into domain
objects; legacy column names (`CCODCLIE`, `DDATATTI`, `MMEMO`, ...) never leave them.
**Services** hold the rules and throw `ApiError` when something is wrong. **Handlers** only read
the input, call a service and return an envelope — no SQL, no try/catch:

```ts
export default defineApiHandler(async (event) => {
	await requireUser(event);

	const { groups } = await listRecent();

	return toJson(event, groups);
});
```

## Authentication

`POST /api/auth/login` checks the code and password against `TBUTEN`, verifies the Turnstile
token server-side, and opens a sealed `edison_session` cookie (httpOnly, sameSite lax, signed
with `SESSION_SECRET`). `GET /api/auth/me` restores the session on a page refresh and
`POST /api/auth/logout` clears it. A global route middleware sends anonymous visitors to
`/login` and keeps logged-in users away from it.

Passwords in `TBUTEN` are stored in clear text and compared as such, as the specification
requires. An unknown user code and a wrong password return the same message, so the form
cannot be used to enumerate valid codes. Every successful login stamps `TBUTEN.DDATACC`, the
same column Edison PLUS updates.

## API conventions

Every endpoint returns the same envelope, built by `toJson` or `toJsonPaginated`:

```json
{
	"success": true,
	"message": "Database connesso",
	"data": { "tickets": 146 }
}
```

List endpoints add a `meta` block with `page`, `limit`, `total`, `totalPages`, `hasPreviousPage`
and `hasNextPage`.

Failures answer in the same shape, so a client never has to branch on the response:

```json
{
	"success": false,
	"message": "Attività non trovata",
	"code": "NOT_FOUND"
}
```

`defineApiHandler` catches whatever a service throws: an `ApiError` keeps its status and code,
and anything unexpected becomes a 500 `INTERNAL_ERROR` with a generic message, so an internal
failure never reaches the client as text.

`message`, and the `statusMessage` of any error, are translated per request. The interface
starts in Italian and stays there until the user picks another language from the switcher; the
choice is kept in the `edison_locale` cookie, which the API reads as well so the two never
disagree. Clients calling the API directly can send an `X-Locale` header instead:

```bash
curl -H "X-Locale: en" http://localhost:3000/api/health
```

The browser's `Accept-Language` is deliberately ignored, otherwise an English browser would get
an Italian screen with English messages on it.

Server and client read the same files in `i18n/locales`, so a message only ever exists once.
The Zod schemas in `shared/` store translation keys rather than sentences: the API resolves
them with `t()`, and the forms resolve them through `useZodValidator`.

## Scripts

| Script                    | Description                          |
| ------------------------- | ------------------------------------ |
| `pnpm dev`                | Start the development server         |
| `pnpm build`              | Production build                     |
| `pnpm preview`            | Preview the production build         |
| `pnpm typecheck`          | Type-check the project               |
| `pnpm test`               | Run the test suite                   |
| `pnpm test:watch`         | Run the test suite in watch mode     |
| `pnpm lint`               | Run ESLint                           |
| `pnpm lint:fix`           | Run ESLint with `--fix`              |
| `pnpm db:up`              | Start the Firebird container         |
| `pnpm db:down`            | Stop the Firebird container          |
| `pnpm db:sql`             | Open an isql prompt on the database  |

## Notes on the legacy schema

A few things in the supplied database differ from the specification document and are worth
recording, since they change how the data has to be read and written:

- **`MMEMO` holds RTF, not plain text.** Each memo is mirrored by a `MMEMOPLAIN` column
  containing the same text in plain form. Reads use `MMEMOPLAIN`; writes update both, so that
  records created here stay readable from Edison PLUS.
- **Work types come from `TBGENE` filtered on `CTPGENE = '03'`**, not from `TBCAUS`. The codes
  actually present in `TBATCL.CCODCAUS` (`MA`, `TK`, `IM`, `ZB`) all resolve against `TBGENE`;
  `TBCAUS` is a warehouse movement table with unrelated three-letter codes.
- **People come from `TBPERS`.** `TBCLIE` has no `CDESPERS`/`CCODPERS` columns.
- **`TBATCL.IDREC` is assigned by the `TBATCL_BI` trigger** from the `TBATCL_INC` generator, so
  inserts leave it unset.
- **`NORE` is `NUMERIC(18,5)`**, not a float. Minutes are converted to decimal hours before
  storage (15 minutes becomes `0.25`).
- **`DDATATTI` is a `TIMESTAMP`** whose time component is always midnight, and is treated as a
  date throughout.
- `DDATOPER`, `CORAOPER`, `CCODUTEN` and `CCODOPER` are the audit columns used by Edison PLUS.
  Inserts and updates populate them with the current date, time, logged-in user and operation
  type, matching the existing rows.
- The database character set is `ISO8859_1`. The connection sets it explicitly, otherwise
  accented characters in customer names and addresses come back corrupted.
- Dates arrive from the driver as local-time `Date` objects, so they are formatted with
  local-time getters. Going through UTC shifts every date back by one day.
