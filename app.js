/* ============================================================
   Major Pick'em – Main Application
   ============================================================

   Routing model:
     "#"                      – home (tournament grid)
     "#g/<gameId>"            – view a game stored in this browser
     "#s/<lz-compressed>"     – view a game decoded from a share blob
     "#new/<majorId>/<year>"  – start a new game flow
     "#admin"                 – admin screen (ranking refresh, data)

   Persistence:
     - All games stored in localStorage under key "mp_games" (object
       keyed by game.id).
     - Year and "active major" are remembered.
     - When "Share Link" is clicked we generate a LZ-compressed blob
       containing the full game state and place it in the URL hash
       starting with "#s/".  Anyone opening that link sees the exact
       game.  If they also have localStorage, we cache it there so
       syncing scores on their device only changes their local copy.
   ============================================================ */

(function() {
  "use strict";

  const {MAJORS, VENUES, RANKINGS, FIRST_TIMERS, buildDefaultField,
         hasWonMajor, isInternational, getCountry, getRanking,
         normalizeName} = GolfData;

  const STATE_KEY   = "mp_games";
  const PREFS_KEY   = "mp_prefs";
  const RANK_KEY    = "mp_rankings_cache";
  const DEFAULT_YR  = 2026;

  // ---------------- Persistence helpers -----------------------

  function loadGames()  {
    try { return JSON.parse(localStorage.getItem(STATE_KEY)) || {}; }
    catch { return {}; }
  }
  function saveGames(g) {
    localStorage.setItem(STATE_KEY, JSON.stringify(g));
  }
  function loadPrefs() {
    try { return JSON.parse(localStorage.getItem(PREFS_KEY)) || {}; }
    catch { return {}; }
  }
  function savePrefs(p) {
    localStorage.setItem(PREFS_KEY, JSON.stringify(p));
  }

  // ---------------- Small helpers -----------------------------

  const $ = (sel, parent=document) => parent.querySelector(sel);
  const $$ = (sel, parent=document) => Array.from(parent.querySelectorAll(sel));

  function el(tag, attrs={}, ...children) {
    const e = document.createElement(tag);
    for (const k in attrs) {
      const v = attrs[k];
      if (v == null || v === false) continue;
      if (k === "class")        e.className = v;
      else if (k === "style") {
        if (typeof v === "string") e.setAttribute("style", v);
        else for (const sk in v) e.style[sk] = v[sk];
      }
      else if (k.startsWith("on")) e.addEventListener(k.slice(2).toLowerCase(), v);
      else if (k === "html")    e.innerHTML = v;
      else if (k === "disabled") { if (v) e.setAttribute("disabled", ""); }
      else if (k === "selected") { if (v) e.setAttribute("selected", ""); }
      else if (k === "checked")  { if (v) e.setAttribute("checked", ""); }
      else                      e.setAttribute(k, v);
    }
    for (const c of children.flat()) {
      if (c == null) continue;
      e.appendChild(typeof c === "string" ? document.createTextNode(c) : c);
    }
    return e;
  }

  function newGameId() {
    // short readable id (8 chars)
    const chars = "abcdefghjkmnpqrstuvwxyz23456789";
    let s = "";
    for (let i=0; i<8; i++) s += chars[Math.floor(Math.random()*chars.length)];
    return s;
  }

  // Flag emoji for country codes
  const FLAGS = {
    USA:"🇺🇸", ENG:"🏴󠁧󠁢󠁥󠁮󠁧󠁿", SCO:"🏴󠁧󠁢󠁳󠁣󠁴󠁿", NIR:"🇬🇧", IRL:"🇮🇪",
    WAL:"🏴󠁧󠁢󠁷󠁬󠁳󠁿", AUS:"🇦🇺", RSA:"🇿🇦", NOR:"🇳🇴", SWE:"🇸🇪", DEN:"🇩🇰",
    FIN:"🇫🇮", FRA:"🇫🇷", ESP:"🇪🇸", GER:"🇩🇪", JPN:"🇯🇵", KOR:"🇰🇷",
    CAN:"🇨🇦", AUT:"🇦🇹", BEL:"🇧🇪", CHI:"🇨🇱", TPE:"🇹🇼", VEN:"🇻🇪",
    MEX:"🇲🇽", ARG:"🇦🇷", FIJ:"🇫🇯", ITA:"🇮🇹", NZL:"🇳🇿", POL:"🇵🇱",
    PUR:"🇵🇷"
  };
  const flagFor = (c) => FLAGS[c?.toUpperCase?.()] || "🏳️";

  // Format score like -4, +2, E, —
  const fmtScore = (s) => {
    if (s === null || s === undefined) return "—";
    if (typeof s === "string") {
      if (s.toUpperCase() === "E") return "E";
      const n = parseFloat(s); if (isNaN(n)) return s;
      return n === 0 ? "E" : (n > 0 ? `+${n}` : `${n}`);
    }
    if (s === 0) return "E";
    return s > 0 ? `+${s}` : `${s}`;
  };
  const scoreClass = (s) => {
    if (s === "E" || s === 0) return "E";
    const n = typeof s === "number" ? s : parseFloat(s);
    if (isNaN(n)) return "";
    return n < 0 ? "neg" : "pos";
  };

  // Short URL helper using TinyURL (best effort; CORS permitted).
  async function tryShorten(url) {
    try {
      const res = await fetch("https://tinyurl.com/api-create.php?url=" + encodeURIComponent(url));
      if (!res.ok) throw new Error("shorten failed");
      const t = await res.text();
      if (t.startsWith("http")) return t.trim();
    } catch (e) { /* fall through */ }
    return null;
  }

  // ---------------- Game model ---------------------------------

  // Create a blank game structure
  function newGame(majorId, year) {
    return {
      id: newGameId(),
      majorId,
      year,
      createdAt: new Date().toISOString(),
      status: "setup",              // setup | drafting | complete | scored
      numUsers: 2,
      users: [],                    // [{ id, name, picks:{cat:{name,rank,country,score,madeCut}}, alternates:[] }]
      draftLog: [],                 // [{userIdx, category, playerName}]
      // When drafting, we compute order from numUsers
      currentPick: 0,
      scoresSyncedAt: null,
      syncStatus: null,
      leaderName: null,             // name from ESPN leader
      rulesWinnerName: null,        // user name who wins pick'em
      // Admin overrides for categories; stored as arrays of names
      firstTimerOverride: null,
      noMajorOverride: null,
      fieldOverride: null           // optional custom field
    };
  }

  const CATEGORIES = [
    { id:"top10a",  label:"Top 10 Pick #1", sub:"A player in the Top 10 of the official world golf rankings" },
    { id:"top10b",  label:"Top 10 Pick #2", sub:"A player in the Top 10 of the official world golf rankings" },
    { id:"intl",    label:"International",  sub:"An international born player not in the Top 10 of the world ranking" },
    { id:"noMajor", label:"No Major Wins",  sub:"A player that has never won a major" },
    { id:"firstTimer", label:"First Timer", sub:"A player playing this major for the very first time" }
  ];

  // Given numUsers and numPicks (5), produce snake order of user indices
  function buildSnakeOrder(numUsers, picksPerUser=5) {
    const order = [];
    let forward = true;
    for (let round=0; round<picksPerUser; round++) {
      const range = forward
        ? [...Array(numUsers).keys()]
        : [...Array(numUsers).keys()].reverse();
      for (const u of range) order.push(u);
      forward = !forward;
    }
    return order;
  }
  // Snake alternates order: 2 alternates per user, snake style
  function buildAlternateOrder(numUsers) {
    return buildSnakeOrder(numUsers, 2);
  }

  // ---------------- Category pool computation ----------------
  //
  // Given a game, produce the full list of players eligible for each
  // category, excluding anyone already picked by any user (primary OR
  // alternate).  Also filters out explicit admin overrides.
  //
  // Returns: { categoryId -> [ {name,country,rank,wonMajor,isFirstTimer}... ] }
  // -----------------------------------------------------------
  function computeCategoryPools(game) {
    const field = (game.fieldOverride && game.fieldOverride.length)
      ? game.fieldOverride
      : buildDefaultField();
    // Enrich with admin overrides for winners and first timers
    const firstTimerList = (game.firstTimerOverride
                             || (FIRST_TIMERS[game.majorId]?.[game.year] || []))
                             .map(normalizeName);
    const noMajorOverride = (game.noMajorOverride || []).map(normalizeName);

    // Collect already-picked names
    const taken = new Set();
    for (const u of game.users) {
      for (const c of Object.keys(u.picks || {})) {
        if (u.picks[c]?.name) taken.add(normalizeName(u.picks[c].name));
      }
      for (const a of u.alternates || []) {
        if (a?.name) taken.add(normalizeName(a.name));
      }
    }

    const pools = { top10a:[], top10b:[], intl:[], noMajor:[], firstTimer:[], alternates:[] };

    for (const p of field) {
      if (taken.has(normalizeName(p.name))) continue;

      const pInfo = {
        name: p.name,
        country: p.country || getCountry(p.name) || "",
        rank: p.rank || getRanking(p.name) || 999,
        wonMajor: typeof p.wonMajor === "boolean" ? p.wonMajor : hasWonMajor(p.name),
        isFirstTimer: firstTimerList.includes(normalizeName(p.name))
      };

      // Alternates = full field (no criteria other than uniqueness)
      pools.alternates.push(pInfo);

      // Top 10 – official world ranking
      if (pInfo.rank <= 10) {
        pools.top10a.push(pInfo);
        pools.top10b.push(pInfo);
      }
      // International not in top 10
      if (pInfo.rank > 10 && isInternational(pInfo.country)) {
        pools.intl.push(pInfo);
      }
      // No major wins – explicit override OR auto from winner list
      const noMajorEligible = noMajorOverride.length
        ? noMajorOverride.includes(normalizeName(p.name))
        : !pInfo.wonMajor;
      if (noMajorEligible) pools.noMajor.push(pInfo);

      // First-timer
      if (pInfo.isFirstTimer) pools.firstTimer.push(pInfo);
    }

    // Sort each pool sensibly
    const byRank = (a,b) => (a.rank||999) - (b.rank||999) || a.name.localeCompare(b.name);
    for (const k of Object.keys(pools)) pools[k].sort(byRank);
    return pools;
  }

  // ---------------- Router ------------------------------------

  let Games = loadGames();
  let Prefs = loadPrefs();
  let viewingGame = null;  // current in-memory game when on share link

  function go(path) {
    location.hash = path;
  }

  function currentRoute() {
    const hash = location.hash.replace(/^#\/?/, "");
    return hash;
  }

  window.addEventListener("hashchange", render);
  window.addEventListener("DOMContentLoaded", render);

  // ---------------- Render dispatcher -------------------------

  function render() {
    const root = $("#root");
    root.innerHTML = "";
    const route = currentRoute();

    // Show/hide the header "Back to Tournaments" link based on route
    const headerBack = $(".app-header .header-right");
    if (headerBack) headerBack.style.visibility = route ? "visible" : "hidden";

    if (!route) {
      renderHome(root);
      return;
    }

    // Share link route: "s/<blob>"
    if (route.startsWith("s/")) {
      const blob = route.slice(2);
      const game = decodeShareBlob(blob);
      if (!game) {
        root.appendChild(el("div", {class:"card"},
          el("h2", {class:"page-title"}, "Invalid share link"),
          el("p", {class:"subtle"}, "The link is malformed or too short. Ask the host to re-share."),
          el("a", {href:"#", class:"btn btn-outline mt-12"}, "← Back to Tournaments")
        ));
        return;
      }
      // Cache into local storage so subsequent syncs persist for this user
      Games[game.id] = game;
      saveGames(Games);
      viewingGame = game;
      renderScoreboard(root, game);
      return;
    }

    // Game by id: "g/<id>"
    if (route.startsWith("g/")) {
      const id = route.slice(2);
      const game = Games[id];
      if (!game) {
        root.appendChild(el("div", {class:"card"},
          el("h2", {class:"page-title"}, "Game not found"),
          el("p", {class:"subtle"}, "That game no longer exists in this browser. The host may need to share their link again."),
          el("a", {href:"#", class:"btn btn-outline mt-12"}, "← Back")
        ));
        return;
      }
      if (game.status === "setup")         renderUserCount(root, game);
      else if (game.status === "naming")   renderUserNames(root, game);
      else if (game.status === "drafting") renderDraft(root, game);
      else                                  renderScoreboard(root, game);
      return;
    }

    // New game: "new/<majorId>/<year>"
    if (route.startsWith("new/")) {
      const [, majorId, yearStr] = route.split("/");
      const year = parseInt(yearStr, 10) || DEFAULT_YR;
      if (!MAJORS[majorId]) { go(""); return; }
      const g = newGame(majorId, year);
      Games[g.id] = g;
      saveGames(Games);
      go("g/" + g.id);
      return;
    }

    if (route === "admin") {
      renderAdmin(root);
      return;
    }

    // Unknown route
    go("");
  }

  // ---------------- Home Screen -------------------------------

  function renderHome(root) {
    const activeYear = Prefs.year || DEFAULT_YR;

    const main = el("main");
    const topbar = el("div", {class:"topbar"},
      el("h2", {class:"page-title"}, `${activeYear} Men's Golf Majors`),
      el("div", {class:"row-space"},
        yearPills(activeYear, y => { Prefs.year = y; savePrefs(Prefs); render(); }),
        el("button", {
          class:"admin-btn",
          onclick: () => go("admin")
        }, "⚙ Admin")
      )
    );
    main.appendChild(topbar);

    const grid = el("div", {class:"tournament-grid"});
    for (const mid of ["masters","pga","usopen","open"]) {
      grid.appendChild(tournamentCard(mid, activeYear));
    }
    main.appendChild(grid);
    root.appendChild(main);
  }

  function yearPills(activeYear, onChange) {
    const container = el("div", {class:"year-pills"});
    const years = [2024, 2025, 2026, 2027, 2028];
    for (const y of years) {
      const b = el("button", {
        class: y === activeYear ? "active" : "",
        onclick: () => onChange(y)
      }, String(y));
      container.appendChild(b);
    }
    return container;
  }

  function tournamentCard(majorId, year) {
    const major = MAJORS[majorId];
    const venue = VENUES[majorId]?.[year] || {venue:"TBD", city:""};
    const gamesArr = Object.values(Games).filter(g => g.majorId === majorId && g.year === year);

    const card = el("div", {class:"tournament-card"});
    card.appendChild(el("div", {class:"card-head"},
      el("div", {},
        el("h3", {class:"card-title"}, major.name),
        el("div", {class:"venue"}, venue.venue + (venue.city ? " · " + venue.city : ""))
      ),
      el("button", {class:"btn btn-primary", onclick: () => go(`new/${majorId}/${year}`) },
        "+ New Game"
      )
    ));

    const list = el("div", {class:"games-list"});
    if (gamesArr.length === 0) {
      list.appendChild(el("div", {class:"empty-games"}, "No games started"));
    } else {
      for (const g of gamesArr) {
        list.appendChild(gameRow(g));
      }
    }
    card.appendChild(list);
    return card;
  }

  function gameRow(g) {
    const names = (g.users || []).map(u => u.name).filter(Boolean).join(", ") || "(no players yet)";
    let statusLabel = "Setup", statusClass = "";
    if (g.status === "drafting") { statusLabel = "Drafting"; statusClass="drafting"; }
    else if (g.status === "complete") { statusLabel = "Complete"; statusClass="complete"; }
    else if (g.status === "scored")   { statusLabel = "Complete"; statusClass="complete"; }

    const namesEl = el("div", {
      class: "names",
      style: {cursor: "pointer"},
      onclick: () => go("g/" + g.id)
    }, names);

    const statusEl = el("span", {
      class: "status-pill " + statusClass,
      style: {cursor: "pointer"},
      onclick: () => go("g/" + g.id)
    }, statusLabel);

    const removeBtn = el("button", {
      class: "remove",
      title: "Delete this game",
      onclick: (ev) => {
        ev.stopPropagation();
        if (confirm("Delete this game? This cannot be undone.")) {
          delete Games[g.id]; saveGames(Games); render();
        }
      }
    }, "✕");

    return el("div", {class:"game-row"}, namesEl, statusEl, removeBtn);
  }

  // ---------------- User Count screen -------------------------

  function renderHeader(backHref="#") {
    // Already in index.html; we only update page content.  Provide a
    // "Back to Tournaments" link in the body when needed.
    return el("div", {style:"display:flex; justify-content:flex-end; margin-bottom:14px;"},
      el("a", {href: backHref}, "← Back to Tournaments")
    );
  }

  function renderUserCount(root, game) {
    const major = MAJORS[game.majorId];
    const venue = VENUES[game.majorId]?.[game.year];
    const main = el("main");
    main.appendChild(renderHeader("#"));

    const card = el("div", {class:"card narrow"});
    card.appendChild(el("h3", {class:"card-title"}, `${major.name} ${game.year}`));
    card.appendChild(el("div", {class:"subtle mb-12"}, venue?.venue || ""));

    card.appendChild(el("div", {class:"mt-16", style:"font-weight:600;font-size:15px;"}, "How many users are playing?"));

    const counterEl = el("div", {class:"counter mt-8"},
      el("button", {onclick: () => { if (game.numUsers>1){game.numUsers--; saveGames(Games); renderUserCount(root,game);} }}, "–"),
      el("div", {class:"value"}, String(game.numUsers)),
      el("button", {onclick: () => { if (game.numUsers<10){game.numUsers++; saveGames(Games); renderUserCount(root,game);} }}, "+")
    );
    card.appendChild(counterEl);

    card.appendChild(el("button", {
      class:"btn btn-primary mt-20",
      style:"width:100%;",
      onclick: () => {
        game.status = "naming";
        game.users = Array.from({length: game.numUsers}, (_,i) => ({
          id: "u"+i, name:"", picks:{}, alternates:[]
        }));
        saveGames(Games);
        render();
      }
    }, "Next: Enter Names"));

    // Clear existing content so we don't duplicate
    root.innerHTML = "";
    main.appendChild(card);
    root.appendChild(main);
  }

  // ---------------- User Names screen -------------------------

  function renderUserNames(root, game) {
    const major = MAJORS[game.majorId];
    const venue = VENUES[game.majorId]?.[game.year];
    const main = el("main");
    main.appendChild(renderHeader("#"));

    const card = el("div", {class:"card narrow"});
    card.appendChild(el("h3", {class:"card-title"}, `${major.name} ${game.year}`));
    card.appendChild(el("div", {class:"subtle mb-12"}, venue?.venue || ""));
    card.appendChild(el("h4", {class:"mt-16", style:"margin:16px 0 12px;font-size:16px;"}, "Enter player names"));

    const inputs = [];
    for (let i=0; i<game.numUsers; i++) {
      const lbl = el("label", {}, `Player ${i+1}`);
      const inp = el("input", {
        type:"text",
        placeholder:`Player ${i+1}`,
        value: game.users[i]?.name || "",
        oninput: (ev) => { game.users[i].name = ev.target.value; updateStartBtn(); }
      });
      inputs.push(inp);
      card.appendChild(el("div", {style:"margin-bottom:12px;"}, lbl, inp));
    }

    const startBtn = el("button", {
      class:"btn btn-primary",
      style:"flex:1;",
      onclick: () => {
        for (let i=0; i<game.numUsers; i++) {
          game.users[i].name = (inputs[i].value || `Player ${i+1}`).trim();
        }
        game.status = "drafting";
        game.currentPick = 0;
        saveGames(Games);
        render();
      }
    }, "Start Draft");

    function updateStartBtn() {
      const ok = inputs.every(i => i.value.trim().length > 0);
      startBtn.disabled = !ok;
    }

    card.appendChild(el("div", {class:"row-space mt-16", style:"display:flex;gap:10px;"},
      el("button", {
        class:"btn btn-outline",
        style:"flex:1;",
        onclick: () => { game.status="setup"; saveGames(Games); render(); }
      }, "Back"),
      startBtn
    ));
    updateStartBtn();

    main.appendChild(card);
    root.appendChild(main);
  }

  // ---------------- Draft screen ------------------------------

  function renderDraft(root, game) {
    const major = MAJORS[game.majorId];
    const venue = VENUES[game.majorId]?.[game.year];
    const main = el("main");

    // Header with reset
    main.appendChild(el("div", {class:"topbar"},
      el("div", {},
        el("h2", {class:"page-title"}, `${major.name} ${game.year} — Draft`),
        el("div", {class:"subtle"}, venue?.venue || "")
      ),
      el("div", {class:"row-space"},
        el("a", {href:"#", class:"btn btn-ghost btn-small"}, "← Back to Tournaments"),
        el("button", {
          class:"btn btn-danger btn-small",
          onclick: () => {
            if (!confirm("Reset the draft? All picks and alternates will be cleared.")) return;
            for (const u of game.users) { u.picks = {}; u.alternates = []; }
            game.draftLog = [];
            game.currentPick = 0;
            game.status = "drafting";
            saveGames(Games);
            render();
          }
        }, "Reset Draft")
      )
    ));

    const totalPrimary = game.users.length * CATEGORIES.length;
    const totalAlt     = game.users.length * 2;
    const pickIdx = game.currentPick;

    // Are we in the primary draft or alternates?
    const inAlts = pickIdx >= totalPrimary;
    const overallUserOrder = inAlts
      ? buildAlternateOrder(game.users.length)
      : buildSnakeOrder(game.users.length);
    const activeIdx = inAlts
      ? overallUserOrder[pickIdx - totalPrimary]
      : overallUserOrder[pickIdx];

    if (pickIdx >= totalPrimary + totalAlt) {
      // Draft finished – advance to scoreboard
      game.status = "complete";
      saveGames(Games);
      render();
      return;
    }

    const user = game.users[activeIdx];
    const picksDone = Object.keys(user.picks).length;
    const altsDone  = (user.alternates || []).length;

    const banner = el("div", {class:"draft-banner"});
    if (!inAlts) {
      banner.appendChild(el("div", {class:"pick-label"},
        `${user.name} — Pick ${picksDone + 1} of 5`));
      banner.appendChild(el("div", {class:"pick-sub"}, "Select a category and player below"));
    } else {
      banner.appendChild(el("div", {class:"pick-label"},
        `${user.name} — Alternate ${altsDone + 1} of 2`));
      banner.appendChild(el("div", {class:"pick-sub"}, "Pick an alternate from any golfer still available"));
    }
    main.appendChild(banner);

    const pools = computeCategoryPools(game);

    if (!inAlts) {
      // Show the 5 category rows
      for (const cat of CATEGORIES) {
        const done = !!user.picks[cat.id];
        const row  = el("div", {class:"cat-row" + (done ? " done":"")});
        row.appendChild(el("div", {},
          el("div", {class:"cat-label"}, cat.label),
          el("div", {class:"cat-sub"}, cat.sub),
          done
            ? el("div", {class:"mt-8", style:"font-weight:600;color:var(--green-dark);"},
                `Picked: ${user.picks[cat.id].name}`)
            : null
        ));

        const sel = el("select", {class:"swap-select", style:"min-width:220px;padding:8px;"},
          el("option", {value:""}, done ? "—" : "Select player…")
        );
        if (!done) {
          for (const p of pools[cat.id]) {
            const opt = el("option", {value:p.name},
              `${p.rank<=150 ? "#"+p.rank+" " : ""}${p.name} ${flagFor(p.country)}`);
            sel.appendChild(opt);
          }
        } else {
          sel.disabled = true;
        }

        const pickBtn = el("button", {class:"btn btn-primary btn-small", disabled: done ? "" : null},
          "Pick");
        pickBtn.disabled = true;
        sel.addEventListener("change", () => { pickBtn.disabled = !sel.value; });
        pickBtn.addEventListener("click", () => {
          const name = sel.value;
          if (!name) return;
          const p = (pools[cat.id] || []).find(x => x.name === name);
          user.picks[cat.id] = {
            name: p.name,
            country: p.country,
            rank: p.rank,
            score: null,
            madeCut: null
          };
          game.draftLog.push({userIdx: activeIdx, category: cat.id, playerName: p.name});
          game.currentPick++;
          saveGames(Games);
          render();
        });

        row.appendChild(sel);
        row.appendChild(pickBtn);
        main.appendChild(row);
      }
    } else {
      // Alternate pick – single row with full field
      const row = el("div", {class:"cat-row"});
      row.appendChild(el("div", {},
        el("div", {class:"cat-label"}, "Alternate"),
        el("div", {class:"cat-sub"}, "Any golfer still in the pool (no criteria required)")
      ));

      const sel = el("select", {class:"swap-select", style:"min-width:260px;padding:8px;"},
        el("option", {value:""}, "Select alternate…")
      );
      for (const p of pools.alternates) {
        const opt = el("option", {value:p.name},
          `${p.rank<=150 ? "#"+p.rank+" " : ""}${p.name} ${flagFor(p.country)}`);
        sel.appendChild(opt);
      }

      const pickBtn = el("button", {class:"btn btn-primary btn-small"}, "Pick");
      pickBtn.disabled = true;
      sel.addEventListener("change", () => { pickBtn.disabled = !sel.value; });
      pickBtn.addEventListener("click", () => {
        const name = sel.value; if (!name) return;
        const p = (pools.alternates || []).find(x => x.name === name);
        user.alternates = user.alternates || [];
        user.alternates.push({
          name: p.name, country: p.country, rank: p.rank, score: null, madeCut: null
        });
        game.currentPick++;
        saveGames(Games);
        render();
      });

      row.appendChild(sel);
      row.appendChild(pickBtn);
      main.appendChild(row);
    }

    // Progress summary for all users
    const summary = el("div", {class:"card mt-20"},
      el("h4", {style:"margin:0 0 10px;font-size:15px;"}, "Draft progress"));
    for (const u of game.users) {
      const picks = Object.values(u.picks).map(p=>p.name).join(", ");
      const alts  = (u.alternates||[]).map(a=>a.name).join(", ");
      summary.appendChild(el("div", {style:"border-top:1px solid var(--border);padding:10px 0 8px;"},
        el("div", {style:"font-weight:600;"}, u.name),
        el("div", {class:"subtle"},
          `Picks (${Object.keys(u.picks).length}/5): ${picks || "—"}`),
        el("div", {class:"subtle"},
          `Alternates (${(u.alternates||[]).length}/2): ${alts || "—"}`)
      ));
    }
    main.appendChild(summary);

    root.appendChild(main);
  }

  // ---------------- Scoreboard --------------------------------

  function renderScoreboard(root, game) {
    const major = MAJORS[game.majorId];
    const venue = VENUES[game.majorId]?.[game.year];
    const main = el("main");

    // Top bar
    const hdr = el("div", {class:"scoreboard-header"});
    hdr.appendChild(el("div", {class:"left"},
      el("h2", {class:"page-title"}, `${major.name} ${game.year} — Scoreboard`),
      el("div", {class:"venue"}, venue?.venue || "")
    ));
    hdr.appendChild(el("div", {class:"actions"},
      el("button", {class:"btn btn-primary btn-small", onclick: () => syncScores(game)}, "+ Sync Scores"),
      el("button", {class:"btn btn-outline btn-small", onclick: () => manualUpdate(game)}, "Update Scores"),
      el("button", {class:"btn btn-outline btn-small", onclick: () => openShareModal(game)}, "Share Link"),
      el("button", {class:"btn btn-outline btn-small", onclick: () => openDraftSummary(game)}, "View Draft"),
      el("button", {class:"btn btn-danger btn-small", onclick: () => {
        if (!confirm("Reset this entire game back to setup? All picks will be cleared.")) return;
        game.status = "setup";
        for (const u of game.users) { u.picks = {}; u.alternates = []; }
        game.currentPick = 0;
        game.draftLog = [];
        saveGames(Games); render();
      }}, "Reset")
    ));
    main.appendChild(hdr);

    // Status / sync info
    if (game.syncStatus) {
      main.appendChild(el("div", {
        class: "sync-status" + (game.syncStatus.error ? " error" : "")
      }, game.syncStatus.message));
    }

    // Winner banner
    const rules = computeWinner(game);
    game.rulesWinnerName = rules.winnerName;
    if (rules.winnerName) {
      main.appendChild(el("div", {class:"winner-banner"},
        "🏆 ", `${rules.winnerName} wins — ${rules.reason}`
      ));
    }

    // Team cards
    const grid = el("div", {class:"scoreboard-grid"});
    for (const u of game.users) {
      grid.appendChild(renderTeamCard(game, u, rules.winnerName === u.name));
    }
    main.appendChild(grid);

    // Rules box
    main.appendChild(el("div", {class:"rules-box"},
      el("h4", {}, "Winning Rules"),
      el("ul", {},
        el("li", {}, "Picking the tournament winner automatically wins the pick'em"),
        el("li", {}, "If no one picks the winner, the user with the most players making the 36-hole cut wins"),
        el("li", {}, "If users have the same number of players making the cut, lowest cumulative team score wins")
      )
    ));

    root.appendChild(main);
  }

  function renderTeamCard(game, user, isWinner) {
    const teamScore  = cumulativeScore(user);
    const madeCut    = cutCount(user);
    const totalPicks = Object.keys(user.picks).length;

    const card = el("div", {class: "team-card" + (isWinner ? " winner":"")});
    if (isWinner) card.appendChild(el("div", {class:"winner-tag"}, "🏆 Winner"));

    card.appendChild(el("div", {class:"team-head"},
      el("div", {}, el("div", {class:"team-name"}, user.name)),
      el("div", {},
        el("div", {class:"team-score"}, fmtScore(teamScore)),
        el("div", {class:"team-meta"}, `${madeCut}/${totalPicks} made cut`)
      )
    ));

    // Player table
    const tbl = el("table", {class:"team-table"});
    tbl.appendChild(el("thead", {}, el("tr", {},
      el("th", {}, "Player"),
      el("th", {}, "Category"),
      el("th", {class:"num"}, "Score"),
      el("th", {class:"center"}, "Cut"),
      el("th", {class:"center"}, "Sub")
    )));
    const tb = el("tbody");
    for (const cat of CATEGORIES) {
      const p = user.picks[cat.id];
      if (!p) continue;
      tb.appendChild(renderPlayerRow(game, user, cat, p));
    }
    tbl.appendChild(tb);
    card.appendChild(tbl);

    // Alternates
    if ((user.alternates||[]).length) {
      card.appendChild(el("div", {class:"alternates-hdr"},
        "Alternates ", el("span", {class:"small"}, "(not counted in team score)")
      ));
      const aTbl = el("table", {class:"team-table"});
      const aBody = el("tbody");
      for (const alt of user.alternates) {
        aBody.appendChild(el("tr", {},
          el("td", {class:"name"}, alt.name),
          el("td", {class:"cat subtle"}, ""),
          el("td", {class:"num score-cell " + scoreClass(alt.score)}, fmtScore(alt.score)),
          el("td", {class:"center"}, alt.madeCut === true ? "✓" : (alt.madeCut===false?"—":"")),
          el("td", {})
        ));
      }
      aTbl.appendChild(aBody);
      card.appendChild(aTbl);
    }

    return card;
  }

  function renderPlayerRow(game, user, cat, p) {
    const tr = el("tr");
    tr.appendChild(el("td", {class:"name"}, p.name));
    tr.appendChild(el("td", {class:"cat subtle"}, cat.label));
    tr.appendChild(el("td", {class:"num score-cell " + scoreClass(p.score)}, fmtScore(p.score)));
    tr.appendChild(el("td", {class:"center"},
      p.madeCut === true ? el("span",{class:"cut-check"},"✓")
      : p.madeCut === false ? el("span",{class:"cut-miss"},"—")
      : ""
    ));

    // Swap dropdown – replace with one of alternates
    const alts = (user.alternates||[]);
    const swapSel = el("select", {class:"swap-select"},
      el("option", {value:""}, "Swap"));
    for (let i=0;i<alts.length;i++) {
      swapSel.appendChild(el("option", {value:String(i)}, `→ ${alts[i].name}`));
    }
    swapSel.addEventListener("change", () => {
      const idx = parseInt(swapSel.value, 10);
      if (isNaN(idx)) return;
      swapPlayerWithAlternate(game, user, cat, idx);
    });
    tr.appendChild(el("td", {}, swapSel));
    return tr;
  }

  function swapPlayerWithAlternate(game, user, cat, altIdx) {
    const alt = user.alternates[altIdx];
    const prev = user.picks[cat.id];
    // Swap: alternate becomes the pick; prev becomes the alternate
    user.picks[cat.id] = {
      name: alt.name, country: alt.country, rank: alt.rank,
      score: alt.score, madeCut: alt.madeCut
    };
    user.alternates[altIdx] = prev;
    saveGames(Games);
    render();
  }

  // ---------------- Scoring + Rules ---------------------------

  function cumulativeScore(user) {
    let total = 0;
    let any = false;
    for (const cat of CATEGORIES) {
      const p = user.picks[cat.id];
      if (!p || p.score == null) continue;
      const n = typeof p.score === "number" ? p.score : parseFloat(p.score);
      if (isNaN(n)) continue;
      total += n;
      any = true;
    }
    return any ? total : null;
  }

  function cutCount(user) {
    let n = 0;
    for (const cat of CATEGORIES) {
      const p = user.picks[cat.id];
      if (p && p.madeCut === true) n++;
    }
    return n;
  }

  function computeWinner(game) {
    // Rule 1: whoever picked the tournament winner
    const leader = game.leaderName ? normalizeName(game.leaderName) : null;
    if (leader) {
      for (const u of game.users) {
        for (const cat of CATEGORIES) {
          const p = u.picks[cat.id];
          if (p && normalizeName(p.name) === leader) {
            return { winnerName: u.name, reason: `Picked the tournament winner (${game.leaderName})` };
          }
        }
      }
    }

    // Rule 2: most players making cut
    const countsPerUser = game.users.map(u => ({u, cuts: cutCount(u), score: cumulativeScore(u)}));
    const maxCuts = Math.max(...countsPerUser.map(c => c.cuts));
    if (maxCuts === 0) return { winnerName: null, reason: null };
    const topCut = countsPerUser.filter(c => c.cuts === maxCuts);
    if (topCut.length === 1) {
      return { winnerName: topCut[0].u.name, reason: `Most players made the cut (${maxCuts}/5)` };
    }

    // Rule 3: tiebreak by cumulative score (lower = better), only among those with same cut count
    const withScore = topCut.filter(c => c.score != null);
    if (!withScore.length) return { winnerName: null, reason: null };
    withScore.sort((a,b) => a.score - b.score);
    const best = withScore[0];
    const tied = withScore.filter(c => c.score === best.score);
    if (tied.length === 1) {
      return { winnerName: best.u.name, reason: `Lowest cumulative score (${fmtScore(best.score)})` };
    }
    return { winnerName: null, reason: `Tie between ${tied.map(c=>c.u.name).join(" & ")}` };
  }

  // ---------------- Share link --------------------------------

  function encodeShareBlob(game) {
    // Strip down to only what's needed.  Keep picks + alternates + names.
    const minimal = {
      v:1,
      id:game.id,
      majorId:game.majorId,
      year:game.year,
      status:game.status,
      users: game.users.map(u => ({
        id:u.id, name:u.name,
        picks: Object.fromEntries(
          Object.entries(u.picks||{}).map(([k,v])=>[k,{
            name:v.name, country:v.country, rank:v.rank
          }])),
        alternates: (u.alternates||[]).map(a => ({
          name:a.name, country:a.country, rank:a.rank
        }))
      }))
    };
    return LZString.compressToEncodedURIComponent(JSON.stringify(minimal));
  }
  function decodeShareBlob(blob) {
    try {
      const json = LZString.decompressFromEncodedURIComponent(blob);
      if (!json) return null;
      const m = JSON.parse(json);
      if (!m || !m.majorId || !MAJORS[m.majorId]) return null;
      // Rehydrate to a full game object
      return {
        id: m.id || newGameId(),
        majorId: m.majorId,
        year: m.year,
        status: m.status || "complete",
        numUsers: m.users.length,
        users: m.users.map(u => ({
          id:u.id, name:u.name,
          picks: Object.fromEntries(Object.entries(u.picks||{}).map(([k,v])=>[k,{
            name:v.name, country:v.country, rank:v.rank, score:null, madeCut:null
          }])),
          alternates: (u.alternates||[]).map(a => ({
            name:a.name, country:a.country, rank:a.rank, score:null, madeCut:null
          }))
        })),
        draftLog: [],
        currentPick: m.users.length*7,
        scoresSyncedAt: null,
        syncStatus: null,
        leaderName: null,
        rulesWinnerName: null
      };
    } catch (e) {
      console.error("decodeShareBlob", e);
      return null;
    }
  }

  async function openShareModal(game) {
    const blob = encodeShareBlob(game);
    const base = location.href.split("#")[0];
    const full = `${base}#s/${blob}`;

    const modal = buildModal("Share this game", (body, close) => {
      body.appendChild(el("p", {class:"subtle"},
        "Anyone who opens this link will see this specific game, including drafted players and alternates. They can sync scores themselves from ESPN."
      ));
      body.appendChild(el("label", {}, "Full share link"));
      const urlBox = el("div", {class:"share-url"}, full);
      body.appendChild(urlBox);

      const shortBox = el("div", {class:"share-url mt-12"}, "Shortening…");
      body.appendChild(el("label", {class:"mt-12"}, "Short link"));
      body.appendChild(shortBox);

      const row = el("div", {class:"row-space mt-12"},
        el("button", {class:"btn btn-primary", onclick: async () => {
          try { await navigator.clipboard.writeText(full); ctaCopy.textContent = "Copied!"; }
          catch(e){ alert("Copy failed: " + e.message); }
        }}, "Copy full link"),
        el("button", {class:"btn btn-outline", onclick: close}, "Close")
      );
      const ctaCopy = row.firstChild;
      body.appendChild(row);

      // Attempt shorten
      tryShorten(full).then(short => {
        if (short) {
          shortBox.textContent = short;
          row.insertBefore(
            el("button", {class:"btn btn-outline", onclick: async () => {
              try { await navigator.clipboard.writeText(short); alert("Short link copied"); }
              catch(e){ alert("Copy failed: " + e.message); }
            }}, "Copy short"),
            row.children[1]
          );
        } else {
          shortBox.textContent = "(short-link service unavailable — use full link above)";
        }
      });
    });
    document.body.appendChild(modal);
  }

  function openDraftSummary(game) {
    const modal = buildModal("Draft summary", (body, close) => {
      for (const u of game.users) {
        body.appendChild(el("h4", {style:"font-family:Playfair Display,Georgia,serif;margin:12px 0 4px;"}, u.name));
        const ul = el("ul", {style:"margin:0 0 6px 18px;padding:0;"});
        for (const cat of CATEGORIES) {
          const p = u.picks[cat.id];
          if (p) ul.appendChild(el("li", {}, `${cat.label}: ${p.name}`));
        }
        body.appendChild(ul);
        if ((u.alternates||[]).length) {
          body.appendChild(el("div", {class:"subtle"},
            "Alternates: " + u.alternates.map(a=>a.name).join(", ")));
        }
      }
      body.appendChild(el("div", {class:"row-space mt-16"},
        el("button", {class:"btn btn-outline", onclick: close}, "Close")));
    });
    document.body.appendChild(modal);
  }

  function buildModal(title, builder) {
    const back = el("div", {class:"modal-backdrop"});
    const m = el("div", {class:"modal"});
    m.appendChild(el("h3", {}, title));
    const body = el("div");
    m.appendChild(body);
    back.appendChild(m);
    back.addEventListener("click", (ev) => { if (ev.target === back) back.remove(); });
    builder(body, () => back.remove());
    return back;
  }

  // ---------------- ESPN sync ---------------------------------

  async function syncScores(game) {
    game.syncStatus = { message:"Syncing scores from ESPN…", error:false };
    render();

    try {
      const event = await fetchEspnEvent(game);
      if (!event) throw new Error("Could not find event on ESPN scoreboard for this major/year.");

      const leaderboard = await fetchEspnLeaderboard(event.id);
      const competitors = extractCompetitors(leaderboard);

      // Build lookup by normalized name
      const byName = new Map();
      for (const c of competitors) byName.set(normalizeName(c.name), c);

      let matched = 0, total = 0;
      for (const u of game.users) {
        for (const cat of CATEGORIES) {
          const p = u.picks[cat.id];
          if (!p) continue;
          total++;
          const c = byName.get(normalizeName(p.name));
          if (c) {
            matched++;
            p.score   = c.score;
            p.madeCut = c.madeCut;
          }
        }
        for (const alt of (u.alternates||[])) {
          const c = byName.get(normalizeName(alt.name));
          if (c) {
            alt.score   = c.score;
            alt.madeCut = c.madeCut;
          }
        }
      }

      // Determine leader (first in leaderboard by position==1 or lowest score)
      const leader = leaderboard?.events?.[0]?.competitions?.[0]?.status?.type?.completed
        ? findEventWinner(leaderboard)
        : null;
      game.leaderName = leader;

      game.scoresSyncedAt = new Date().toISOString();
      game.syncStatus = {
        message: `${MAJORS[game.majorId].shortName} scores synced. ${matched}/${total} players matched. Cut status updated.` +
                 (leader ? ` Tournament winner: ${leader}.` : ""),
        error:false
      };
    } catch (err) {
      console.error(err);
      game.syncStatus = {
        message: "Sync failed: " + err.message + " — try 'Update Scores' to enter manually.",
        error: true
      };
    }
    saveGames(Games);
    render();
  }

  // Look up the ESPN event for our major/year.
  async function fetchEspnEvent(game) {
    const major = MAJORS[game.majorId];

    // 1. Prefer cached event id in data.js
    if (major.espnEventIds?.[game.year]) {
      return { id: major.espnEventIds[game.year] };
    }

    // 2. Search scoreboard by date range around the scheduled start
    const venue = VENUES[game.majorId][game.year];
    const start = venue?.startDate
      ? venue.startDate.replace(/-/g,"")
      : `${game.year}0101`;
    const url = `https://site.api.espn.com/apis/site/v2/sports/golf/pga/scoreboard?dates=${start}`;
    const res = await fetch(url);
    if (!res.ok) throw new Error(`ESPN scoreboard HTTP ${res.status}`);
    const data = await res.json();
    const events = data.events || [];
    const target = major.name.toLowerCase();
    const hit = events.find(e =>
      (e.name || "").toLowerCase().includes(major.shortName.toLowerCase())
      || (e.shortName || "").toLowerCase().includes(major.shortName.toLowerCase())
      || (e.name || "").toLowerCase().includes(target.replace(/^the /,""))
    );
    if (hit) return { id: hit.id };
    return null;
  }

  async function fetchEspnLeaderboard(eventId) {
    const url = `https://site.api.espn.com/apis/site/v2/sports/golf/pga/leaderboard?event=${eventId}`;
    const res = await fetch(url);
    if (!res.ok) throw new Error(`ESPN leaderboard HTTP ${res.status}`);
    return res.json();
  }

  // Pull a flat list of {name, score, madeCut, position} from ESPN JSON
  function extractCompetitors(json) {
    const out = [];
    const events = json?.events || [];
    for (const ev of events) {
      for (const comp of (ev.competitions || [])) {
        for (const ath of (comp.competitors || [])) {
          const name = ath.athlete?.displayName || ath.athlete?.name || ath.displayName || "";
          if (!name) continue;
          // ESPN expresses score as string like "-7", "+2", "E"
          let score = null;
          if (typeof ath.score === "number")       score = ath.score;
          else if (typeof ath.score === "string")  score = parseScoreString(ath.score);
          // status.type.description may include "CUT" / "WD" / "DQ"
          const desc = (ath.status?.displayValue || ath.status?.type?.description || "").toUpperCase();
          let madeCut = null;
          if (desc.includes("CUT") || desc === "MC") madeCut = false;
          else if (desc.includes("WD") || desc.includes("DQ")) madeCut = false;
          else {
            // If round >= 3 and player still active => made cut
            const period = ath.status?.period || comp.status?.period || 0;
            if (period >= 3) madeCut = true;
            else madeCut = null;
          }
          out.push({ name, score, madeCut, position: ath.status?.position?.id || null });
        }
      }
    }
    return out;
  }
  function parseScoreString(s) {
    if (!s) return null;
    const str = String(s).trim().toUpperCase();
    if (str === "E") return 0;
    const n = parseFloat(str);
    return isNaN(n) ? null : n;
  }

  function findEventWinner(json) {
    // Look for the athlete with position 1 in a completed event
    const events = json?.events || [];
    for (const ev of events) {
      for (const comp of (ev.competitions || [])) {
        if (!comp.status?.type?.completed) continue;
        const sorted = (comp.competitors || []).slice().sort((a,b) => {
          const pa = parseInt(a.status?.position?.id || "999", 10);
          const pb = parseInt(b.status?.position?.id || "999", 10);
          return pa - pb;
        });
        const top = sorted[0];
        if (top) {
          return top.athlete?.displayName || top.athlete?.name || null;
        }
      }
    }
    return null;
  }

  // ---------------- Manual update (fallback) ------------------

  function manualUpdate(game) {
    const modal = buildModal("Manual score update", (body, close) => {
      body.appendChild(el("p", {class:"subtle"},
        "Enter each player's tournament score (e.g. -4, +2, E). Check the box if they made the cut."));

      const form = el("div");
      const inputs = [];
      for (const u of game.users) {
        form.appendChild(el("h4", {style:"margin:12px 0 6px;font-family:Playfair Display,Georgia,serif;"}, u.name));
        for (const cat of CATEGORIES) {
          const p = u.picks[cat.id];
          if (!p) continue;
          const sInp = el("input", {type:"text", style:"width:80px;", value: p.score==null?"":String(p.score)});
          const cut  = el("input", {type:"checkbox"});
          if (p.madeCut === true) cut.checked = true;
          inputs.push({target:p, sInp, cut});
          form.appendChild(el("div", {style:"display:grid;grid-template-columns:180px 180px 80px 40px;gap:8px;align-items:center;margin-bottom:4px;"},
            el("div", {}, p.name),
            el("div", {class:"subtle"}, cat.label),
            sInp, cut
          ));
        }
        for (const alt of (u.alternates||[])) {
          const sInp = el("input", {type:"text", style:"width:80px;", value: alt.score==null?"":String(alt.score)});
          const cut  = el("input", {type:"checkbox"});
          if (alt.madeCut === true) cut.checked = true;
          inputs.push({target:alt, sInp, cut});
          form.appendChild(el("div", {style:"display:grid;grid-template-columns:180px 180px 80px 40px;gap:8px;align-items:center;margin-bottom:4px;"},
            el("div", {}, alt.name + " (alt)"),
            el("div", {class:"subtle"}, "Alternate"),
            sInp, cut
          ));
        }
      }
      body.appendChild(form);

      body.appendChild(el("div", {class:"mt-12"},
        el("label", {}, "Tournament winner (optional)"),
        (() => {
          const sel = el("select", {}, el("option",{value:""},"—"));
          for (const u of game.users) {
            for (const cat of CATEGORIES) {
              const p = u.picks[cat.id];
              if (p) sel.appendChild(el("option", {value:p.name, selected: game.leaderName===p.name ? "" : null}, p.name));
            }
          }
          sel.value = game.leaderName || "";
          sel.addEventListener("change", () => { game.leaderName = sel.value || null; });
          return sel;
        })()
      ));

      body.appendChild(el("div", {class:"row-space mt-16"},
        el("button", {class:"btn btn-primary", onclick: () => {
          for (const {target, sInp, cut} of inputs) {
            const v = sInp.value.trim();
            target.score = v === "" ? null : parseScoreString(v);
            target.madeCut = cut.checked ? true : (v ? false : null);
          }
          game.syncStatus = {message:"Scores updated manually.", error:false};
          saveGames(Games); close(); render();
        }}, "Save"),
        el("button", {class:"btn btn-outline", onclick: close}, "Cancel")
      ));
    });
    document.body.appendChild(modal);
  }

  // ---------------- Admin screen ------------------------------

  function renderAdmin(root) {
    const main = el("main");
    main.appendChild(renderHeader("#"));
    const card = el("div", {class:"card"});
    card.appendChild(el("h2", {class:"page-title"}, "Admin"));
    card.appendChild(el("p", {class:"subtle"}, "Maintenance actions for this browser."));

    card.appendChild(el("div", {class:"mt-16"},
      el("button", {class:"btn btn-primary", onclick: async () => {
        card.appendChild(el("div", {class:"sync-status mt-12"}, "Refreshing rankings from ESPN…"));
        const ok = await tryRefreshRankings();
        alert(ok ? "Rankings refreshed — ranks are now cached in your browser." :
                   "Could not refresh rankings – the built-in snapshot is still in use.");
        render();
      }}, "Refresh World Rankings from ESPN"),
      " ",
      el("button", {class:"btn btn-outline", onclick: () => {
        if (!confirm("Delete all games from this browser?")) return;
        Games = {}; saveGames(Games); alert("All games cleared."); render();
      }}, "Clear all games")
    ));

    // List games
    card.appendChild(el("h3", {class:"mt-20", style:"margin-top:22px;"}, "All games in this browser"));
    const tbl = el("table", {class:"team-table"});
    tbl.appendChild(el("thead", {}, el("tr", {},
      el("th", {}, "Major"), el("th", {}, "Year"), el("th", {}, "Players"),
      el("th", {}, "Status"), el("th", {}, "")
    )));
    const gb = el("tbody");
    for (const g of Object.values(Games)) {
      gb.appendChild(el("tr", {},
        el("td", {}, MAJORS[g.majorId]?.shortName || g.majorId),
        el("td", {}, String(g.year)),
        el("td", {}, g.users.map(u=>u.name).join(", ") || "—"),
        el("td", {}, g.status),
        el("td", {},
          el("a", {href: "#g/"+g.id, class:"btn btn-outline btn-small"}, "Open"), " ",
          el("button", {class:"btn btn-danger btn-small", onclick: () => {
            delete Games[g.id]; saveGames(Games); render();
          }}, "Delete")
        )
      ));
    }
    tbl.appendChild(gb);
    card.appendChild(tbl);

    main.appendChild(card);
    root.appendChild(main);
  }

  async function tryRefreshRankings() {
    // Best-effort: ESPN provides a rankings endpoint at times.  If this
    // fails, the hardcoded RANKINGS table is used.
    try {
      const url = "https://site.api.espn.com/apis/site/v2/sports/golf/pga/rankings";
      const res = await fetch(url);
      if (!res.ok) return false;
      const data = await res.json();
      const list = data?.rankings?.[0]?.ranks || data?.ranks || [];
      if (!list.length) return false;
      const snapshot = list.map(r => ({
        rank: r.current || r.rank,
        name: r.athlete?.displayName || r.competitor?.displayName || r.name,
        country: r.athlete?.flag?.abbreviation || r.competitor?.flag?.abbreviation || "USA"
      })).filter(r => r.name && r.rank);
      if (!snapshot.length) return false;
      localStorage.setItem(RANK_KEY, JSON.stringify(snapshot));
      // Merge into RANKINGS for the current session
      for (const s of snapshot) {
        const idx = GolfData.RANKINGS.findIndex(p => normalizeName(p.name) === normalizeName(s.name));
        if (idx >= 0) GolfData.RANKINGS[idx].rank = s.rank;
        else GolfData.RANKINGS.push(s);
      }
      return true;
    } catch (e) {
      console.error("rankings refresh", e);
      return false;
    }
  }

  // On startup: merge cached rankings if present
  (function mergeCachedRankings() {
    try {
      const cached = JSON.parse(localStorage.getItem(RANK_KEY));
      if (!cached || !cached.length) return;
      for (const s of cached) {
        const idx = GolfData.RANKINGS.findIndex(p => normalizeName(p.name) === normalizeName(s.name));
        if (idx >= 0) GolfData.RANKINGS[idx].rank = s.rank;
        else GolfData.RANKINGS.push(s);
      }
    } catch {}
  })();

})();
