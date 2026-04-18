# Major Pick'em – Deploy to GitHub Pages

These are step-by-step instructions for hosting this app on GitHub so you can share it with your friends.

## Files in this folder
- `index.html` – main page (the "index file")
- `styles.css` – styling
- `app.js` – application logic
- `data.js` – player database, venues, rankings
- `DEPLOY.md` – this file (not required to host; safe to delete)

Keep all four `.html/.css/.js` files together. `index.html` must stay named exactly that.

---

## Option A – GitHub Pages on a brand-new repo (recommended)

1. **Create a new repository** at https://github.com/new
   - Repository name: e.g. `golf-pickem`
   - Visibility: Public (required for free Pages)
   - Leave everything else empty and click **Create repository**.

2. **Upload the files.** On the new empty repo page click **"uploading an existing file"**, then drag in:
   - `index.html`
   - `styles.css`
   - `app.js`
   - `data.js`
   Scroll down and click **Commit changes**.

3. **Turn on GitHub Pages.**
   - Repo → **Settings** → **Pages** (left sidebar).
   - Under *Build and deployment* set:
     - Source: **Deploy from a branch**
     - Branch: **main** / folder: **/(root)**
   - Click **Save**.

4. Wait ~30 seconds, refresh the Pages panel. It will show:
   `Your site is live at https://<your-username>.github.io/golf-pickem/`

5. Open that URL in your browser – you now have the app hosted.

6. Share the URL with friends when you create a game and click **Share Link**.

---

## Option B – Keep using an existing repo

If you already have a repo set to publish with Pages, drop the four files in the repo root (or in a subfolder and make sure Pages is pointed at it) and push/commit. The same URL pattern applies.

---

## Updating the app later
When you want to change anything (new year, new first-timer list, edits):
1. Open the file you want to change on GitHub (pencil icon = edit).
2. Commit changes.
3. Pages rebuilds in ~30 seconds.

No other hosting, build step, or package install is needed – everything runs in the browser.

---

## Notes
- **Share links** encode the entire game (drafted players + alternates) into the URL. They are long by design; the app attempts to shorten via TinyURL automatically when you click **Share Link**.
- **Score sync** fetches directly from ESPN's public JSON API (no key required). If ESPN ever blocks CORS, use the **Update Scores** button to enter numbers by hand.
- **Rankings** – the app ships with a World Ranking snapshot. Click **Admin → Refresh World Rankings** any time to pull the latest from ESPN and cache it locally.
- Each browser keeps its own copy of games in `localStorage`. If you clear site data, games vanish unless you have their share link.
