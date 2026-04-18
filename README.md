# ⛳ Major Pick'em

A zero-backend web app for running a snake-draft pick'em among friends across the four men's professional golf majors: **The US Masters**, **The PGA Championship**, **The US Open**, and **The Open Championship**.

It's a single `index.html` plus a small `data.js` seed file. Drop it on GitHub Pages and share the URL. Every game has its own self-contained shareable link that encodes the full draft state — no database, no server.

## Features

- Pick any major for any year from **2024 – 2028** (venues pre-populated)
- **Snake draft** for 2 – 10 users
- Five category picks per user:
  - Top 10 Pick #1 (OWGR top 10)
  - Top 10 Pick #2 (OWGR top 10)
  - **International** — non-US-born player outside the OWGR top 10
  - **No Major Wins** — has never won a men's major
  - **First Timer** — playing that major for the very first time
- Categories can be filled **in any order**
- A picked player is removed from every category so no duplicates
- **Two alternates per user**, picked in the same snake order
- **Swap** drop-down on each drafted player to substitute in an alternate
- **Sync Scores** pulls the live leaderboard from ESPN's public API (no key)
- **⟳ Sync OWGR** pulls the live Official World Golf Ranking and overlays it on the field, so the Top-10 category always reflects the current OWGR top 10. Auto-refreshes daily; manual button on the home screen. Cached per-browser in localStorage, so share links remain portable.
- **Cut status** is fetched from ESPN and also manually toggle-able
- Live **winner banner** using the stated rules:
  1. Whoever picks the tournament winner wins
  2. Otherwise, the user with most players making the 36-hole cut wins
  3. Otherwise, lowest cumulative team score wins
- **Share Link** copies a URL that encodes the entire game state — anyone who opens it sees the same draft and live scores
- All games persist locally per-browser so you can resume later

## Files

| File | Purpose |
| --- | --- |
| `index.html` | The single-page app (React + Tailwind via CDN, JSX compiled in-browser by Babel). |
| `data.js`    | Editable seed data — tournaments, venues, and the 2026 Masters field with OWGR / major-history / first-timer flags. |
| `README.md`  | This file. |

## Running it locally

No build step required. Any static server works:

```bash
cd "Golf Pick'em Application"
python3 -m http.server 8080
# open http://localhost:8080
```

Or just double-click `index.html` (most browsers load it directly from disk; the ESPN sync may be blocked by `file://` CORS — use a local server if you need to sync scores).

## Hosting on GitHub Pages

1. Create a new public repository on GitHub, e.g. `golf-pickem`.
2. Commit both `index.html` and `data.js` to the repo root:
   ```bash
   git init
   git add index.html data.js README.md
   git commit -m "Initial Major Pick'em"
   git branch -M main
   git remote add origin https://github.com/<your-user>/golf-pickem.git
   git push -u origin main
   ```
3. In the repo on GitHub go to **Settings → Pages** and set
   - **Source**: *Deploy from a branch*
   - **Branch**: `main`, folder `/ (root)`
4. Wait ~30 seconds and your app is live at:

   **`https://<your-user>.github.io/golf-pickem/`**

Bookmark that URL — every game you start generates its own shareable link that starts with the same URL plus a `#g=…` fragment.

## Share links

When a draft is complete, the Scoreboard screen shows a **Share Link**. The link looks like:

```
https://<your-user>.github.io/golf-pickem/#g=N4IglgJiBcIIYCMD…
```

The full game state (users, picks, alternates, scores) is encoded into the URL fragment, so whoever opens it lands on that specific game's live scoreboard — not just the app's home screen.

Because the fragment contains the whole game, the URL is a bit long. If you want a *short* URL to send in a text message, paste the long one into any URL shortener (bit.ly, tinyurl, etc.). Each time scores sync, share the updated link.

## Keeping the app fresh

`data.js` is plain, commented JavaScript. Open it in any editor to:

- **Correct OWGR rankings** — edit the `owgr` value next to any player
- **Add or remove a player** from the 2026 Masters field
- **Flag a major winner / first-timer** — toggle `hasMajor` or `mastersFirst`
- **Add future years** — append to the `VENUES` object, or add a full field under `TOURNAMENTS`

For the **PGA**, **US Open**, and **Open** fields we've left empty shells for 2024-2028. Use the same structure as the Masters field when you fill them in.

## ESPN sync — how it works

The app calls
```
https://site.api.espn.com/apis/site/v2/sports/golf/pga/scoreboard?dates=YYYYMMDD-YYYYMMDD
```
over a date window that brackets the selected major, finds the matching event by name, and reads per-player scores, cut status, and overall winner from the event's competition object. No API key required.

If ESPN is unreachable (sandboxed browser, etc.) you can still edit scores and cut status by clicking the score field or the cut check directly on the scoreboard.

## Notes on the 2026 Masters seed

Because this repo ships pre-tournament, `data.js` uses the best publicly-known lists for:

- The OWGR top 10 heading into Masters week
- Past Masters champions (lifetime exemption)
- Major winners of the last 5 years
- Amateur champions and first-time qualifiers

As soon as you click **Sync Scores** after the tournament has begun, all numeric scores come straight from ESPN — the seed is only used for categorisation, not for scoring.

---

_Built with React 18, Tailwind CSS, and ESPN's public golf API._
