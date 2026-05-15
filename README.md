# ESC 2026

Mobile-first Web-App für persönliche Eurovision-Wertungen.

## Entwicklung

```bash
pnpm install
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

Die App läuft dann auf `http://localhost:8080`.

## Daten

Die Final-Reihenfolge stammt von der offiziellen Eurovision-Seite:
https://www.eurovision.com/stories/running-order-eurovision-2026-grand-final-vienna/

Künstlerdaten und Bilder stammen von den offiziellen Teilnehmerprofilen:
https://www.eurovision.com/eurovision-song-contest/vienna-2026/all-participants/

## Später

`spotifyUrl` ist im Song-Typ vorbereitet. `docker-compose.yml` enthält ein profil-gesteuertes Convex-Backend als Platzhalter für Watchparty-Funktionen.
