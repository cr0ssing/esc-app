# ESC 2026

Mobile-first Web-App für persönliche Eurovision-Wertungen mit Watchparty-Funktion.

Lizenz: [GNU Affero General Public License v3.0 or later](LICENSE). Quellcode: <https://github.com/cr0ssing/esc-app>.

## Entwicklung

```bash
pnpm install
cp .env.example .env.local
```

### Self-hosted Convex (Watchparty)

```bash
docker compose up -d convex
docker compose exec convex ./generate_admin_key.sh
```

Trage den Admin-Key in `.env.local` ein:

```bash
VITE_CONVEX_URL=http://127.0.0.1:3210
CONVEX_SELF_HOSTED_URL=http://127.0.0.1:3210
CONVEX_SELF_HOSTED_ADMIN_KEY=<admin-key>
```

Convex-Funktionen deployen und Frontend starten:

```bash
pnpm exec convex deploy
pnpm dev
```

## Checks

```bash
pnpm typecheck
pnpm lint
pnpm build
```

## Docker

```bash
docker compose up --build
```

Die App läuft auf `http://localhost:8080`, Convex auf `http://localhost:3210`. Die App-Container-URL wird zur Laufzeit über `CONVEX_URL` gesetzt (Standard in `docker-compose.yml`: `http://127.0.0.1:3210`). Lokal mit `pnpm dev` weiterhin `VITE_CONVEX_URL` in `.env.local`.

Impressum-Angaben (Name, Anschrift, E-Mail) werden nicht ins Repository eingecheckt. Im Container setzt du zur Laufzeit:

- `IMPRESS_NAME`
- `IMPRESS_ADDRESS` (mehrzeilig möglich, z. B. mit YAML `|` in Compose)
- `IMPRESS_EMAIL`

Lokal mit `pnpm dev`: `VITE_IMPRESS_NAME`, `VITE_IMPRESS_ADDRESS`, `VITE_IMPRESS_EMAIL` in `.env.local` (in `VITE_IMPRESS_ADDRESS` kann `\n` für Zeilenumbrüche stehen).

### Convex deploy (production, one-shot)

Deployt Convex-Funktionen gegen ein Self-Hosted-Backend und beendet den Container danach:

```bash
export CONVEX_URL=https://convex.example.com
export CONVEX_SELF_HOSTED_ADMIN_KEY=<admin-key>

docker compose --profile deploy run --rm convex-deploy
```

(`CONVEX_SELF_HOSTED_URL` works as an alias for `CONVEX_URL`.)

Alternativ direkt mit Docker:

```bash
docker build -f Dockerfile.convex-deploy -t esc-app-convex-deploy .
docker run --rm \
  -e CONVEX_URL=https://convex.example.com \
  -e CONVEX_SELF_HOSTED_ADMIN_KEY=<admin-key> \
  esc-app-convex-deploy
```

## Daten

Die Final-Reihenfolge stammt von der offiziellen Eurovision-Seite:
https://www.eurovision.com/stories/running-order-eurovision-2026-grand-final-vienna/

Künstlerdaten und Bilder stammen von den offiziellen Teilnehmerprofilen:
https://www.eurovision.com/eurovision-song-contest/vienna-2026/all-participants/

## Watchparty

- Tab **Watchparty**: Watchparty erstellen oder per Einladungslink beitreten
- Session-Token im Cookie `esc_session` (serverseitig validiert, kein User-ID-Spoofing)
- Live-Sync der persönlichen Wertung mit Convex
- Gesamtranking (Summe aller Punkte) und Drill-down in einzelne Wertungen per Avatar
