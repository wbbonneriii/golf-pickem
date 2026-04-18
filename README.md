# ⛳ Major Pick'em — Golf Major Championship Draft

A pick'em game for men's professional golf majors. Draft golfers with friends using a snake draft, track scores, and determine a winner.

## Features

- **4 Men's Majors**: The Masters, PGA Championship, US Open, and The Open Championship (2024–2028)
- **Snake Draft System**: Fair pick order that alternates direction each round
- **5 Draft Categories per User**:
  - Top 10 OWGR Pick #1
  - Top 10 OWGR Pick #2
  - International Player (non-USA, outside Top 10)
  - Never Won a Major
  - First Timer at this Major
- **2 Alternate Picks** per user for player withdrawals
- **Live Scoreboard** with editable scores, cut tracking, and swap functionality
- **Winner Detection**: Auto-determines winner based on tournament winner pick → most cuts → lowest score tiebreaker
- **Shareable Game Links**: Each game gets a unique ID that can be shared via URL
- **OWGR Rankings**: Current Official World Golf Rankings shown next to every player (Week 15, April 12, 2026)
- **Persistent Storage**: Game data saved in localStorage — survives page refreshes

## How to Deploy to GitHub Pages

### Step 1: Create a GitHub Repository

1. Go to [github.com/new](https://github.com/new)
2. Name it something like `golf-pickem`
3. Set it to **Public**
4. Click **Create repository**

### Step 2: Upload the Files

Upload these files to the root of your repository:

```
golf-pickem/
├── index.html      ← The complete app (single file)
└── README.md       ← This file
```

You can upload via the GitHub web interface:
1. Click **"uploading an existing file"** on the repo page
2. Drag and drop `index.html` and `README.md`
3. Click **Commit changes**

Or via git command line:
```bash
git clone https://github.com/YOUR_USERNAME/golf-pickem.git
cd golf-pickem
# Copy index.html and README.md into this folder
git add .
git commit -m "Initial commit - Golf Pick'em app"
git push origin main
```

### Step 3: Enable GitHub Pages

1. Go to your repository on GitHub
2. Click **Settings** (gear icon)
3. Scroll down to **Pages** in the left sidebar
4. Under **Source**, select **Deploy from a branch**
5. Select **main** branch and **/ (root)** folder
6. Click **Save**

### Step 4: Access Your App

After a minute or two, your app will be live at:

```
https://YOUR_USERNAME.github.io/golf-pickem/
```

## How to Play

1. **Select a Year** using the year buttons at the top
2. **Pick a Major** and click **+ New Game**
3. **Enter the number of players** and their names
4. **Snake Draft**: Each player takes turns selecting golfers from the 5 categories
5. **Pick 2 Alternates** per player after the main draft
6. **Complete the Draft** to see the Scoreboard
7. **Track Scores**: Click any score to edit, toggle cut status with ✓/—
8. **Swap Players**: Use the Swap dropdown to sub in an alternate
9. **Share the Link**: Click "Share Link" to copy the game URL for your group

## Winning Rules

1. **Tournament Winner Pick**: If any user drafted the actual tournament winner, they win automatically
2. **Most Cuts**: If no one picked the winner, the user with the most golfers making the 36-hole cut wins
3. **Tiebreaker**: If tied on cuts, the lowest cumulative score among users with equal cuts wins

## Updating Rankings

The OWGR rankings are hardcoded from the official rankings at [owgr.com](https://www.owgr.com). To update them for a new week:

1. Visit [owgr.com/current-world-ranking](https://www.owgr.com/current-world-ranking)
2. Edit the `getFullField()` function in `index.html`
3. Update the `owgr` number for each player
4. Add/remove players as needed
5. Commit and push — GitHub Pages will update automatically

## Tech Stack

- **React 18** (via CDN)
- **Babel Standalone** (JSX compilation in-browser)
- **localStorage** for game persistence
- **Zero dependencies** — single HTML file, no build step required

## License

MIT — use it however you like.
