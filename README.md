# Major Pick'em

A self-contained golf pick'em web app for the four men's professional majors —
**The Masters, The PGA Championship, The US Open,** and **The Open Championship** —
with a snake draft, live ESPN score syncing, alternates, and unique shareable
links for every game.

Everything runs in the browser. No backend, no build step, no database.
Drop the four files on GitHub Pages (or any static host) and share.

---

## Live demo

Once you deploy this repo to GitHub Pages (see [Deploying](#deploying) below),
your live URL will be:

```
https://<your-github-username>.github.io/<repo-name>/
```

(Until then, you can double-click `index.html` to run it locally from `file://`.)

---

## Features

- **Four majors** with correct venues for 2024 → 2028.
- **Year selector** across the top.
- **Multiple concurrent games** per major. Each game is independent with its
  own players, draft, scores, and share URL.
- **Snake draft** for any number of users.
- **Five categories** — each pick must satisfy exactly one:
  - Top 10 Pick #1 (Official World Golf Rankings ≤ 10)
  - Top 10 Pick #2 (Official World Golf Rankings ≤ 10)
  - International (non-US, world rank > 10)
  - No Major Wins (filtered against every historical men's major winner)
  - First Timer (making their very first appearance in this particular major)
- **Two alternates** per user, drafted snake-style after the primary round.
  Tracked on the scoreboard but not counted in the team score.
- **Swap** any drafted player with one of your alternates (e.g. if a player
  withdraws).
- **Official World Ranking** shown next to every player name in every dropdown.
  `Admin → Refresh World Rankings` pulls an updated snapshot from ESPN.
- **Live score sync** via ESPN's public JSON API — no API key required. Updates
  scores, cut status (✓ / —), and auto-detects the tournament winner when the
  event is final.
- **Manual update** modal as a fallback if you want to enter scores yourself.
- **Winner banner** on the scoreboard follows your rules in order:
  1. Picked the tournament winner outright.
  2. Most players making the 36-hole cut.
  3. Lowest cumulative score among users tied on cut count.
- **Unique share link** per game. Encodes the full roster (picks + alternates)
  into the URL hash. Anyone opening the link sees *that specific game* — not
  just the app home — and can re-sync scores on their own device.

---

## File layout

| File        | What it does                                           |
|-------------|--------------------------------------------------------|
| index.html  | Entry point – this is what GitHub Pages serves.         |
| styles.css  | All the styling (green Masters palette).                |
| app.js      | Routing, draft engine, ESPN sync, share links.          |
| data.js     | OWGR snapshot, venues, major winners, first-timer seeds.|
| DEPLOY.md   | Step-by-step GitHub Pages deployment.                   |
| README.md   | This file.                                              |

All four runtime files (`index.html`, `styles.css`, `app.js`, `data.js`) must
live in the same folder. No package install or build is needed.

---

## Deploying

Quick version (full walkthrough in [`DEPLOY.md`](./DEPLOY.md)):

1. Create a new public repo on GitHub.
2. Upload `index.html`, `styles.css`, `app.js`, `data.js`.
3. Repo → **Settings → Pages** → Source: *Deploy from a branch* → Branch: **main** / folder **/(root)** → **Save**.
4. Wait ~30 seconds. The page shows your live URL.
5. Open the URL to verify. Create a game, finish the draft, click **Share Link**,
   and send that to your friends.

---

## How to play

1. Open the app. Pick a **year** and click **+ New Game** on the major you
   want.
2. Choose how many users are playing and enter their names.
3. The snake draft begins. Each user picks a player in each of the five
   categories (in any order they like).
4. After primary picks, each user drafts two alternates.
5. On the **Scoreboard**:
   - Click **+ Sync Scores** during the tournament to pull live standings.
   - Use **Swap** next to any drafted player to promote an alternate.
   - Click **Share Link** to generate a unique URL for this game and send
     it to everyone playing.
6. When the event is final, the winner banner at the top announces the
   pick'em champion.

---

## Notes, caveats, and edge cases

- **Share links are self-contained.** Everything needed to display the game
  lives in the URL hash. They are long; the app attempts to shorten via
  TinyURL automatically when you open the share modal.
- **Score syncing is per-viewer.** Each browser pulls its own copy of the
  leaderboard from ESPN. Swaps done locally don't propagate to other viewers
  unless the host re-shares an updated link.
- **First-timer lists** are seeded per year in `data.js`. Before a tournament
  you can edit that list (or use the Admin screen in a future release).
- **Games are stored per-browser** (`localStorage`). Clearing site data will
  erase them — the share link is the durable record.

---

## License

Do whatever you want with this — it's a personal project.
