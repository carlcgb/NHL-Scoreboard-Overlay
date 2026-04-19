# NHL playoffs scoreboard overlay

**Repository:** [github.com/carlcgb/NHL-Scoreboard-Overlay](https://github.com/carlcgb/NHL-Scoreboard-Overlay)

Next.js (App Router) browser source for **OBS**, **TikTok Live Studio**, or any Chromium browser source. Transparent background on `/overlay`.

## Commands

```bash
npm install
npm run dev
npm run build
npm start
```

Deploy to [Vercel](https://vercel.com): connect the repo and use the default Next.js settings. Optional env vars are documented in `.env.example`.

## Routes

| Path | Purpose |
|------|---------|
| `/overlay?game=GAME_ID` | Transparent scoreboard (OBS). Query: `shots=1`, `series=1`, `sponsor=0`, `theme=dark` |
| `/today` | Redirects to the only live playoff game, or lists multiple live games |
| `/admin/mock` | Mock controls for stream tests (gate with `NEXT_PUBLIC_MOCK_KEY` in production) |

## OBS browser source

- **URL:** `https://YOUR_DOMAIN/overlay?game=GAME_ID`
- **Size:** **1920×1080** (full frame) or a compact top bar such as **1600×180**
- Check **Shutdown source when not visible** (optional) and refresh browser source between games if needed
- Custom CSS (optional): `body { background: rgba(0,0,0,0) !important; }`

## Data

Live data is read from the public NHL Web API (`api-web.nhle.com`) via a same-origin Edge proxy at `/api/nhl/*` to avoid browser CORS issues.

## Project layout

```
src/
  app/
    api/nhl/[...path]/route.ts   # Edge proxy
    overlay/page.tsx
    today/page.tsx
    admin/mock/page.tsx
    page.tsx
  components/
    Scoreboard.tsx, TeamBlock.tsx, Clock.tsx, PowerPlayBanner.tsx, GoalAnimation.tsx, OverlayChrome.tsx
  hooks/useGameFeed.ts
  lib/nhl-api.ts, formatters.ts, polling.ts, team-colors.ts
```
