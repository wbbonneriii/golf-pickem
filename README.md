# Major Pick'em ⛳

A snake-draft pick'em app for the four men's professional golf majors — The US Masters, PGA Championship, US Open, and The Open. Run it as a static site on **GitHub Pages** and share the resulting URL with your group.

![screenshot](https://img.shields.io/badge/status-ready-brightgreen) ![stack](https://img.shields.io/badge/stack-vanilla%20HTML%20%2F%20JS-blue)

## What it does

- Pick any major × year (2024–2028) and spin up a **new game** with N users.
- **Snake draft** five picks per user across five categories:
  1. Top 10 Pick #1 (OWGR Top 10)
  2. Top 10 Pick #2 (OWGR Top 10)
  3. International (non-US, not Top 10)
  4. No Major Wins (never won a major)
  5. First Timer (first time playing this major)
- Two **alternates per user** with a one-click **Swap** control on the scoreboard.
- **Sync Scores** button pulls live leaderboard from the ESPN public API (no API key) and checks the 36-hole cut status.
- Manual **Update Scores** dialog if ESPN is unavailable or you want to override.
- **Share Link** creates a unique URL containing this game's entire state, so every group you draft with gets their own link.
- **Admin** tab to edit OWGR Top 20, historic major winners list, international-born players, and venues.

## Winning Rules (built in)

1. Picking the tournament winner automatically wins the pick'em.
2. If no one picks the winner, the user with the most players making the 36-hole cut wins.
3. If tied on cut count, lowest cumulative team score wins.

## Files to upload to GitHub

Only two files are required:

```
index.html     ← the app
README.md      ← this file
```

That's it — zero build step, no Node, no dependencies.

---

## Deploy to GitHub Pages (5 minutes)

### 1. Create a new GitHub repository

1. Sign in at [github.com](https://github.com).
2. Click **+ → New repository**.
3. Name it something like `golf-pickem` (or anything you like). Leave it **Public**.
4. Do **not** check "Initialize with README" (you already have one).
5. Click **Create repository**.

### 2. Upload the two files

The fastest way is the web UI:

1. On the new empty repo page, click **"uploading an existing file"**.
2. Drag `index.html` and `README.md` into the upload area.
3. Commit message: `Initial commit` → click **Commit changes**.

### 3. Turn on GitHub Pages

1. In your repo, click **Settings** (top nav).
2. In the left sidebar, click **Pages**.
3. Under **Source**, pick **Deploy from a branch**.
4. Branch: **main** · Folder: **/ (root)** → click **Save**.
5. Wait ~30 seconds, then refresh the Pages page.

GitHub will show a green banner with your live URL, typically:

```
https://<your-github-username>.github.io/<repo-name>/
```

**That's your app URL.** Bookmark it and share with friends.

### 4. (Optional) Make it even faster

- Drop the URL into [tinyurl.com](https://tinyurl.com) or [bitly.com](https://bitly.com) for a shorter link.
- Pin the repo to your GitHub profile so you can find it later.

---

## How to use the app

### Starting a game

1. Open the app URL — you'll see all four majors with the 2026 venues by default.
2. Use the year tabs (2024–2028) to switch years; venues update automatically.
3. Click **+ New Game** on the major you want.
4. Choose the number of users (1–10) → **Next: Enter Names**.
5. Type each player's name → **Start Draft**. The app will fetch the current ESPN field in the background.

### Drafting

- The active picker is shown at the top. They choose **any one** of the five categories and pick a player from that dropdown. Picked players disappear from every other user's dropdown.
- Pick order is standard snake (1-2-…-N-N-…-2-1-1-2-… etc.).
- Press **Reset Draft** at any time to start over.
- Use **+ Add Player** to drop a custom player into the pool if ESPN hasn't listed them (e.g., a late commit).

### Alternates

- After the main five picks are done, each user picks **two alternates** from the remaining pool. These don't count toward the team score but can be swapped in on the scoreboard.

### Scoreboard

- **+ Sync Scores**: fetches the ESPN leaderboard for this major. Updates each player's to-par score, cut mark (✓ / —), and — when the tournament is over — identifies the winner and highlights the pick'em winner with a 🏆 badge.
- **Update Scores**: manual entry dialog if ESPN data isn't available.
- **Swap**: pick a dropdown next to any primary player to swap them out for one of your alternates. The alternate's score instantly counts in your team total.
- **Share Link**: generates the shareable URL for this specific game.
- **View Draft**: prints a text summary of every team's picks.
- **Reset**: wipes only scores/cut marks, keeps the picks.

### Share links — how they work

When you click **Share Link**, the app serializes this game's state (users, picks, alternates, current field) into a compact payload and appends it to the URL as `#/g/…`. Anyone who opens that link loads **this exact game** and can press **Sync Scores** to pull the latest leaderboard.

Because every game produces a **different** link, you can run as many concurrent games (same major, different groups) as you want — each group gets their own URL.

## Admin panel

Click **⚙ Admin** from the home screen to update:

- **OWGR Top 20** (used for the Top 10 dropdowns) — paste one name per line, in ranking order.
- **Historic Major Winners** — anyone in this list is excluded from the "No Major Wins" category.
- **International-born players** — used when ESPN doesn't provide a country code.
- **Venues by year** — stored as JSON, one entry per major.

All admin changes are stored locally in your browser.

## Keeping data fresh

The app pulls live field + leaderboard data from ESPN's public golf endpoint:

```
https://site.api.espn.com/apis/site/v2/sports/golf/<league>/leaderboard
```

where `<league>` is one of `mens-masters`, `pga-championship`, `us-open`, or `the-open`. No API key is required.

For the OWGR top 10, visit [owgr.com](https://www.owgr.com/) and paste the current top 10 into **Admin → OWGR**. The app uses this list directly for the two Top 10 categories.

## Troubleshooting

- **"Live field from ESPN could not be loaded"** — ESPN doesn't always have a tournament in its feed until roughly the week of play. Use **+ Add Player** during the draft to add names manually, or try again closer to tournament week.
- **Share link URL is long** — that's by design (the whole game is encoded in the hash so the receiver needs no backend). Pipe it through tinyurl.com or bit.ly for a short link.
- **Reset Draft didn't remove an alternate pick** — reset only runs while you're on the draft screen. On the scoreboard use **Reset** to clear scores.

## License

MIT — do whatever you want.
