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
  composables/          # useApi and friends
  layouts/
  middleware/
    auth.ts             # Redirects to /login when there is no session
  pages/
    login.vue
    attivita/           # List, insert, edit, view
  stores/
    auth.ts             # Pinia session store
server/
  api/                  # Nitro route handlers
  db/
    client.ts           # node-firebird connection pool
    repositories/       # One module per table; legacy columns stop here
  lib/
    i18n.ts             # Locale resolution and translation for API responses
    response.ts         # toJson / toJsonPaginated envelope helpers
    rtf.ts              # MMEMO encode/decode
  plugins/
    firebird.ts         # Closes the connection pool on shutdown
docker/
  firebird/data/        # The .FDB file (git-ignored)
```

Legacy column names (`CCODCLIE`, `DDATATTI`, `MMEMO`, ...) never leave `server/db/repositories`.
Every module above that layer works with plain, typed objects, which keeps the Firebird schema
out of the application and the UI.

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

`message`, and the `statusMessage` of any error, are translated per request. The locale comes
from the `edison_locale` cookie when the language switcher has set one, otherwise from the
`Accept-Language` header, otherwise Italian:

```bash
curl -H "Accept-Language: en" http://localhost:3000/api/health
```

Server and client read the same files in `i18n/locales`, so a message only ever exists once.

## Scripts

| Script                    | Description                          |
| ------------------------- | ------------------------------------ |
| `pnpm dev`                | Start the development server         |
| `pnpm build`              | Production build                     |
| `pnpm preview`            | Preview the production build         |
| `pnpm typecheck`          | Type-check the project               |
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
