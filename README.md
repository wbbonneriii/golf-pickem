# Major Pick'em

A simple snake-draft pick'em game for the four men's professional golf majors — The US Masters, The PGA Championship, The US Open, and The Open Championship — designed so you can run a game with friends, share a link, and sync live scores from ESPN.

**Live URL once you follow the deploy steps below:** <https://wbbonneriii.github.io/golf-pickem/>

---

## What the app does

- **Tournament picker (Home).** Choose the year (2024 – 2028) and one of the four majors. Each major card shows its venue and any in-progress / completed games you've started in this browser.
- **User setup.** Pick the number of users (2 – 12) and enter their names.
- **Snake draft.** Each user drafts 5 players, one from each of these categories, in any order, using a snake order (1-2-2-2-2-1 when there are 2 users, same idea generalised for any count):
  1. A player in the Top 10 of the Official World Golf Rankings
  2. A second player in the Top 10
  3. An international-born player **not** in the Top 10
  4. A player who has **never** won a men's professional major
  5. A player playing this major for the very first time
- **Alternates.** After the primary 5 picks are in, each user chooses 2 alternates from the remaining field. Alternates are scored live but don't count toward the team total until you *Swap* them in.
- **Scoreboard.** Cumulative team score, cut tick-marks (✓ made, — missed), alternates shown separately, per-category Swap dropdown.
- **Sync Scores.** A button on the Scoreboard hits the public ESPN golf leaderboard API (no key required) to refresh every player's score, position, and cut status.
- **Winner detection.** When a leader is detected, the app auto-marks a "🏆 Winner" badge following the rules:
  1. Whoever picked the tournament winner wins outright.
  2. Otherwise, the user with the most players through the 36-hole cut wins.
  3. If that's tied, lowest cumulative team score wins.
- **Share Link.** Generates a link that contains the entire game state (picks, names, scores, alternates) in a compressed hash. When friends open the link they land directly on *this game's* scoreboard — not the generic app. Running another game with another group produces a completely different link. The app attempts to shorten the URL via `is.gd`; if that fails (rare / offline), you still get the full link and it works identically.
- **Reset Draft.** Wipes picks and alternates so you can redo the draft.
- **Admin.** A small management screen listing every game saved in this browser, with a Delete option.

### Data sources

- **Field + world rankings + live scores:** ESPN's public golf leaderboard API — no API key required:
  `https://site.api.espn.com/apis/site/v2/sports/golf/<league>/leaderboard?season=<year>`
  where `<league>` is `mens-masters`, `pga-championship`, `us-open`, or `the-open`.
- **"Not a major winner" filter:** A built-in table of historical men's professional major winners (full names + surname match, case-insensitive). If a player's name matches, they're excluded from Category #4.
- **"First-time player at this major" filter:** Uses a curated list for past tournaments where it's knowable; for future / yet-to-be-announced fields it falls back to "no ESPN leaderboard appearance at this major in recent years".

### Where game data lives

- **Your browser.** Every game you create is saved in `localStorage`, so you can come back, resume drafting, or re-sync scores.
- **In the share URL.** When you click *Share Link* the game state is compressed and embedded in the URL hash. No server is needed. Anyone with the link sees the same picks and synced scores — they don't see games other than the one they were sent.

---

## Deploy it on GitHub Pages (free hosting)

These steps get the app running at `https://wbbonneriii.github.io/golf-pickem/`.

### Option A — GitHub website only (easiest)

1. Go to <https://github.com/new>.
2. **Repository name:** `golf-pickem`. Visibility: Public. Tick *Add a README file*. Click **Create repository**.
3. In the repo, click **Add file → Upload files**.
4. Drag `index.html` (and this `README.md`) into the upload area. Click **Commit changes**.
5. In the repo, go to **Settings → Pages**.
6. Under *Build and deployment → Source* pick **Deploy from a branch**. Set *Branch* to `main`, folder `/ (root)`, click **Save**.
7. Wait ~30-60 seconds. The page will refresh and show your URL:
   `https://wbbonneriii.github.io/golf-pickem/`
8. Open that URL — you're done. Share it with your friends.

### Option B — Command line (if you prefer `git`)

```bash
# from inside the folder containing index.html and README.md
git init
git add index.html README.md
git commit -m "Initial commit — Major Pick'em"
git branch -M main
git remote add origin https://github.com/wbbonneriii/golf-pickem.git
git push -u origin main
```

Then do steps 5–7 from Option A to enable Pages.

### Updating the app later

Edit `index.html`, commit, push. GitHub Pages redeploys automatically within ~30 seconds.

---

## Common questions

**Q: My friends opened the share link but want to run their *own* game — what happens?**
A: Their link is read-only for *your* game. When they click the **Major Pick'em** logo (which clears the URL hash), they start their own game. Their games are saved locally in their browser and produce their own share links, completely separate from yours.

**Q: The field hasn't been announced yet — the draft screen is empty.**
A: ESPN only publishes the field a few weeks before each major. Until then the draft dropdowns will be sparse. Once ESPN has the commitments list, just come back and the dropdowns will populate automatically — no app update needed. You can also always pick any major/year combination once the tournament is live.

**Q: Can I add more years beyond 2028?**
A: Yes — open `index.html`, find the `MAJORS` object near the top of the file, add the venue for the new year, and add the year to the `years` array in `ScreenHome`.

**Q: A player isn't being offered in Category #4 (No Major Wins) even though they've never won one.**
A: Their name matches a past winner's surname. Add their full name to the `HISTORIC_MAJOR_WINNERS` list in `index.html` to force-exclude them, or leave a comment on GitHub and I'll update it.

**Q: Sync Scores reports an error.**
A: ESPN sometimes blocks requests from certain regions / browser extensions. Try a different browser or disable any adblocker that blocks `site.api.espn.com`. The app continues to function for drafting without live scores.

---

## File layout

```
index.html   # the entire app, single file (React + Tailwind + LZ-String via CDN)
README.md    # this file
```

That's it — no build step, no dependencies to install, works anywhere a browser can load an HTML file.
