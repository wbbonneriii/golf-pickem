/*
 * Major Pick'em – Static Data
 *
 * This file contains:
 *   1. Tournament venues by year.
 *   2. A baseline Official World Golf Ranking (OWGR) snapshot – these
 *      numbers are used until the app successfully refreshes rankings
 *      from ESPN's rankings endpoint.
 *   3. A list of every man who has ever won a professional major
 *      championship (Masters, US Open, Open Championship, PGA).
 *   4. Per-major "first-timer" seed lists that can be edited in Admin.
 *
 * Everything is exported on the global `GolfData` object.
 */

const GolfData = (() => {

  // ------------------------------------------------------------------
  // Majors metadata – keyed by internal id
  // ------------------------------------------------------------------
  const MAJORS = {
    masters: {
      id: "masters",
      name: "The US Masters",
      shortName: "Masters",
      espnEventIds: {
        2024: "401580343",
        2025: "401703504",
        2026: null,
        2027: null,
        2028: null
      }
    },
    pga: {
      id: "pga",
      name: "The PGA Championship",
      shortName: "PGA",
      espnEventIds: {
        2024: "401580345",
        2025: "401703506",
        2026: null,
        2027: null,
        2028: null
      }
    },
    usopen: {
      id: "usopen",
      name: "The US Open",
      shortName: "US Open",
      espnEventIds: {
        2024: "401580348",
        2025: "401703509",
        2026: null,
        2027: null,
        2028: null
      }
    },
    open: {
      id: "open",
      name: "The Open Championship",
      shortName: "The Open",
      espnEventIds: {
        2024: "401580351",
        2025: "401703512",
        2026: null,
        2027: null,
        2028: null
      }
    }
  };

  // ------------------------------------------------------------------
  // Venues by year – covers 2024-2028 for all four majors
  // ------------------------------------------------------------------
  const VENUES = {
    masters: {
      2024: { venue: "Augusta National Golf Club", city: "Augusta, GA", startDate: "2024-04-11" },
      2025: { venue: "Augusta National Golf Club", city: "Augusta, GA", startDate: "2025-04-10" },
      2026: { venue: "Augusta National Golf Club", city: "Augusta, GA", startDate: "2026-04-09" },
      2027: { venue: "Augusta National Golf Club", city: "Augusta, GA", startDate: "2027-04-08" },
      2028: { venue: "Augusta National Golf Club", city: "Augusta, GA", startDate: "2028-04-06" }
    },
    pga: {
      2024: { venue: "Valhalla Golf Club", city: "Louisville, KY", startDate: "2024-05-16" },
      2025: { venue: "Quail Hollow Club", city: "Charlotte, NC", startDate: "2025-05-15" },
      2026: { venue: "Aronimink Golf Club", city: "Newtown Square, PA", startDate: "2026-05-14" },
      2027: { venue: "PGA Frisco (Fields Ranch East)", city: "Frisco, TX", startDate: "2027-05-20" },
      2028: { venue: "The Olympic Club", city: "San Francisco, CA", startDate: "2028-05-18" }
    },
    usopen: {
      2024: { venue: "Pinehurst No. 2", city: "Pinehurst, NC", startDate: "2024-06-13" },
      2025: { venue: "Oakmont Country Club", city: "Oakmont, PA", startDate: "2025-06-12" },
      2026: { venue: "Shinnecock Hills Golf Club", city: "Southampton, NY", startDate: "2026-06-18" },
      2027: { venue: "Pebble Beach Golf Links", city: "Pebble Beach, CA", startDate: "2027-06-17" },
      2028: { venue: "Winged Foot Golf Club", city: "Mamaroneck, NY", startDate: "2028-06-15" }
    },
    open: {
      2024: { venue: "Royal Troon Golf Club", city: "Troon, Scotland", startDate: "2024-07-18" },
      2025: { venue: "Royal Portrush Golf Club", city: "Portrush, Northern Ireland", startDate: "2025-07-17" },
      2026: { venue: "Royal Birkdale Golf Club", city: "Southport, England", startDate: "2026-07-16" },
      2027: { venue: "St Andrews (Old Course)", city: "St Andrews, Scotland", startDate: "2027-07-15" },
      2028: { venue: "Muirfield", city: "Gullane, Scotland", startDate: "2028-07-20" }
    }
  };

  // ------------------------------------------------------------------
  // Baseline OWGR top-100 snapshot (approximate early 2026)
  //   rank   – OWGR position
  //   name   – canonical display name
  //   country- ISO-ish; "USA" = American born, anything else = international
  // The app tries to refresh rankings from ESPN at runtime; this is the
  // fallback used when the fetch is unavailable (for example offline
  // or in the weeks leading up to a tournament).
  // ------------------------------------------------------------------
  const RANKINGS = [
    { rank:  1, name: "Scottie Scheffler",   country: "USA" },
    { rank:  2, name: "Rory McIlroy",        country: "NIR" },
    { rank:  3, name: "Xander Schauffele",   country: "USA" },
    { rank:  4, name: "Collin Morikawa",     country: "USA" },
    { rank:  5, name: "Ludvig Aberg",        country: "SWE" },
    { rank:  6, name: "Justin Thomas",       country: "USA" },
    { rank:  7, name: "Hideki Matsuyama",    country: "JPN" },
    { rank:  8, name: "Russell Henley",      country: "USA" },
    { rank:  9, name: "Viktor Hovland",      country: "NOR" },
    { rank: 10, name: "Tommy Fleetwood",     country: "ENG" },
    { rank: 11, name: "Patrick Cantlay",     country: "USA" },
    { rank: 12, name: "Sepp Straka",         country: "AUT" },
    { rank: 13, name: "Shane Lowry",         country: "IRL" },
    { rank: 14, name: "Wyndham Clark",       country: "USA" },
    { rank: 15, name: "Sam Burns",           country: "USA" },
    { rank: 16, name: "Robert MacIntyre",    country: "SCO" },
    { rank: 17, name: "Keegan Bradley",      country: "USA" },
    { rank: 18, name: "Corey Conners",       country: "CAN" },
    { rank: 19, name: "Akshay Bhatia",       country: "USA" },
    { rank: 20, name: "Harris English",      country: "USA" },
    { rank: 21, name: "Maverick McNealy",    country: "USA" },
    { rank: 22, name: "Byeong Hun An",       country: "KOR" },
    { rank: 23, name: "J.J. Spaun",          country: "USA" },
    { rank: 24, name: "Sungjae Im",          country: "KOR" },
    { rank: 25, name: "Aaron Rai",           country: "ENG" },
    { rank: 26, name: "Ben Griffin",         country: "USA" },
    { rank: 27, name: "Tony Finau",          country: "USA" },
    { rank: 28, name: "Tom Kim",             country: "KOR" },
    { rank: 29, name: "Matt Fitzpatrick",    country: "ENG" },
    { rank: 30, name: "Jordan Spieth",       country: "USA" },
    { rank: 31, name: "Cameron Young",       country: "USA" },
    { rank: 32, name: "Min Woo Lee",         country: "AUS" },
    { rank: 33, name: "Brian Harman",        country: "USA" },
    { rank: 34, name: "Denny McCarthy",      country: "USA" },
    { rank: 35, name: "Si Woo Kim",          country: "KOR" },
    { rank: 36, name: "Thomas Detry",        country: "BEL" },
    { rank: 37, name: "Taylor Pendrith",     country: "CAN" },
    { rank: 38, name: "Rickie Fowler",       country: "USA" },
    { rank: 39, name: "Adam Scott",          country: "AUS" },
    { rank: 40, name: "Tom Hoge",            country: "USA" },
    { rank: 41, name: "Max Homa",            country: "USA" },
    { rank: 42, name: "Nick Taylor",         country: "CAN" },
    { rank: 43, name: "Mackenzie Hughes",    country: "CAN" },
    { rank: 44, name: "Matthieu Pavon",      country: "FRA" },
    { rank: 45, name: "J.T. Poston",         country: "USA" },
    { rank: 46, name: "Davis Thompson",      country: "USA" },
    { rank: 47, name: "Chris Kirk",          country: "USA" },
    { rank: 48, name: "Sahith Theegala",     country: "USA" },
    { rank: 49, name: "Sami Valimaki",       country: "FIN" },
    { rank: 50, name: "Rasmus Hojgaard",     country: "DEN" },
    { rank: 51, name: "Nicolai Hojgaard",    country: "DEN" },
    { rank: 52, name: "Patrick Rodgers",     country: "USA" },
    { rank: 53, name: "Christiaan Bezuidenhout", country: "RSA" },
    { rank: 54, name: "Justin Rose",         country: "ENG" },
    { rank: 55, name: "Billy Horschel",      country: "USA" },
    { rank: 56, name: "Stephan Jaeger",      country: "GER" },
    { rank: 57, name: "Nick Dunlap",         country: "USA" },
    { rank: 58, name: "Eric Cole",           country: "USA" },
    { rank: 59, name: "Matt Wallace",        country: "ENG" },
    { rank: 60, name: "Kurt Kitayama",       country: "USA" },
    { rank: 61, name: "Brendon Todd",        country: "USA" },
    { rank: 62, name: "Adam Hadwin",         country: "CAN" },
    { rank: 63, name: "Chris Gotterup",      country: "USA" },
    { rank: 64, name: "Andrew Novak",        country: "USA" },
    { rank: 65, name: "Austin Eckroat",      country: "USA" },
    { rank: 66, name: "Erik van Rooyen",     country: "RSA" },
    { rank: 67, name: "Max Greyserman",      country: "USA" },
    { rank: 68, name: "Alex Noren",          country: "SWE" },
    { rank: 69, name: "Joe Highsmith",       country: "USA" },
    { rank: 70, name: "Davis Riley",         country: "USA" },
    { rank: 71, name: "Henrik Norlander",    country: "SWE" },
    { rank: 72, name: "Ryo Hisatsune",       country: "JPN" },
    { rank: 73, name: "Lucas Glover",        country: "USA" },
    { rank: 74, name: "Michael Kim",         country: "USA" },
    { rank: 75, name: "Niklas Norgaard",     country: "DEN" },
    { rank: 76, name: "Kevin Yu",            country: "TPE" },
    { rank: 77, name: "Jhonattan Vegas",     country: "VEN" },
    { rank: 78, name: "Laurie Canter",       country: "ENG" },
    { rank: 79, name: "Tom McKibbin",        country: "NIR" },
    { rank: 80, name: "Thriston Lawrence",   country: "RSA" },
    { rank: 81, name: "Max Homa",            country: "USA" },
    { rank: 82, name: "Beau Hossler",        country: "USA" },
    { rank: 83, name: "Ryan Fox",            country: "NZL" },
    { rank: 84, name: "Joel Dahmen",         country: "USA" },
    { rank: 85, name: "Jesper Svensson",     country: "SWE" },
    { rank: 86, name: "Jake Knapp",          country: "USA" },
    { rank: 87, name: "Ryan Gerard",         country: "USA" },
    { rank: 88, name: "Ludvig Aberg",        country: "SWE" },
    { rank: 89, name: "Aldrich Potgieter",   country: "RSA" },
    { rank: 90, name: "Matteo Manassero",    country: "ITA" },
    { rank: 91, name: "Rafael Campos",       country: "PUR" },
    { rank: 92, name: "Karl Vilips",         country: "AUS" },
    { rank: 93, name: "Takumi Kanaya",       country: "JPN" },
    { rank: 94, name: "Patton Kizzire",      country: "USA" },
    { rank: 95, name: "Sam Stevens",         country: "USA" },
    { rank: 96, name: "Antoine Rozner",      country: "FRA" },
    { rank: 97, name: "Kris Ventura",        country: "NOR" },
    { rank: 98, name: "Pablo Larrazabal",    country: "ESP" },
    { rank: 99, name: "Victor Perez",        country: "FRA" },
    { rank:100, name: "Adrian Meronk",       country: "POL" },

    // LIV / additional notable players – tracked but unranked for OWGR
    // purposes (OWGR = 999 so they never satisfy the "Top 10" filter).
    { rank:999, name: "Jon Rahm",            country: "ESP" },
    { rank:999, name: "Bryson DeChambeau",   country: "USA" },
    { rank:999, name: "Brooks Koepka",       country: "USA" },
    { rank:999, name: "Cameron Smith",       country: "AUS" },
    { rank:999, name: "Joaquin Niemann",     country: "CHI" },
    { rank:999, name: "Tyrrell Hatton",      country: "ENG" },
    { rank:999, name: "Dustin Johnson",      country: "USA" },
    { rank:999, name: "Sergio Garcia",       country: "ESP" },
    { rank:999, name: "Phil Mickelson",      country: "USA" },
    { rank:999, name: "Patrick Reed",        country: "USA" },
    { rank:999, name: "Louis Oosthuizen",    country: "RSA" },
    { rank:999, name: "Dean Burmester",      country: "RSA" },
    { rank:999, name: "David Puig",          country: "ESP" },
    { rank:999, name: "Talor Gooch",         country: "USA" },
    { rank:999, name: "Abraham Ancer",       country: "MEX" },
    { rank:999, name: "Carlos Ortiz",        country: "MEX" },

    // Players who commonly get special invites / qualify
    { rank:999, name: "Tiger Woods",         country: "USA" },
    { rank:999, name: "Zach Johnson",        country: "USA" },
    { rank:999, name: "Fred Couples",        country: "USA" },
    { rank:999, name: "Bernhard Langer",     country: "GER" },
    { rank:999, name: "Vijay Singh",         country: "FIJ" },
    { rank:999, name: "Angel Cabrera",       country: "ARG" },
    { rank:999, name: "Mike Weir",           country: "CAN" }
  ];

  // ------------------------------------------------------------------
  // Every known men's major champion (Masters, US Open, Open, PGA).
  // Used to decide whether a player is "No Major Wins" eligible.
  //
  // NOTE: We store canonical last+first name.  Matching is done with
  // normalizeName() below which strips punctuation/accents/whitespace
  // so small spelling differences still match.
  // ------------------------------------------------------------------
  const MAJOR_WINNERS = [
    // Modern era active players
    "Scottie Scheffler","Rory McIlroy","Xander Schauffele","Collin Morikawa",
    "Jon Rahm","Hideki Matsuyama","Bryson DeChambeau","Wyndham Clark",
    "Justin Thomas","Cameron Smith","Adam Scott","Jordan Spieth","Shane Lowry",
    "Matt Fitzpatrick","Keegan Bradley","Brian Harman","Sergio Garcia",
    "Dustin Johnson","Brooks Koepka","Phil Mickelson","Tiger Woods",
    "Zach Johnson","Jimmy Walker","Gary Woodland","Martin Kaymer","Stewart Cink",
    "Graeme McDowell","Webb Simpson","Francesco Molinari","Jason Day","Justin Rose",
    "Padraig Harrington","Danny Willett","Henrik Stenson","Louis Oosthuizen",
    "Charl Schwartzel","Jason Dufner","Angel Cabrera","Lucas Glover",
    "Trevor Immelman","Bubba Watson","Geoff Ogilvy","Y.E. Yang","Rich Beem",
    "Davis Love III","Mike Weir","Ben Curtis","Todd Hamilton","Paul Lawrie",
    "David Duval","David Toms","Shaun Micheel","Vijay Singh","Jim Furyk",
    "Ernie Els","John Daly","Mark O'Meara","Tom Lehman","Steve Elkington",
    "Corey Pavin","Nick Price","Paul Azinger","Wayne Grady","Mark Calcavecchia",
    "Nick Faldo","Ian Woosnam","Sandy Lyle","Curtis Strange","Larry Mize",
    "Fuzzy Zoeller","Ben Crenshaw","Fred Couples","Ian Baker-Finch","John Mahaffey",
    "Raymond Floyd","Lanny Wadkins","Andy North","Lee Trevino","Tom Watson",
    "Hale Irwin","Scott Simpson","Payne Stewart","David Graham",
    "Jerry Pate","Hubert Green","Orville Moody","Gene Littler","Billy Casper",
    "Ken Venturi","Tony Jacklin","Al Geiberger","Dave Stockton","Bob Tway",
    "Hal Sutton","Tom Kite","Larry Nelson","Cary Middlecoff","Julius Boros",
    "Tommy Bolt","Doug Sanders","Dick Mayer","Ed Furgol","Lionel Hebert",
    "Jack Burke Jr","Doug Ford","Jay Hebert","Bob Rosburg","Jerry Barber",
    "Chandler Harper","Henry Picard","Vic Ghezzi","Byron Nelson","Ben Hogan",
    "Sam Snead","Jack Nicklaus","Arnold Palmer","Gary Player","Seve Ballesteros",
    "Greg Norman","Bernhard Langer","Johnny Miller","Tom Weiskopf","Billy Casper",
    "Gene Sarazen","Walter Hagen","Bobby Jones","Craig Wood","Jimmy Demaret",
    "Horton Smith","Ralph Guldahl","Byron Nelson","Henry Picard","Herman Keiser",
    "Claude Harmon","Sam Parks Jr","Tony Manero","Olin Dutra","Billy Burke",
    "Tommy Armour","Gene Sarazen","Walter Hagen","Jim Barnes","Jock Hutchison",
    "Willie Park Jr","Harry Vardon","J.H. Taylor","James Braid","Willie Anderson",
    "Denny Shute","Tony Finau" // Tony Finau never won a major; keep out – removing below
  ].filter(n => n !== "Tony Finau"); // safeguard

  // ------------------------------------------------------------------
  // Seed first-timer lists per major per year.
  //
  // "First timer" = making their very first appearance at THIS specific
  // major.  Each year these need updating once the field is known.  The
  // Admin screen lets Bryant override this list per game.
  //
  // The app also falls back to computing first-timer status at runtime
  // by comparing the ESPN field with historical participation once we
  // have the data – but having a seed list means the dropdown is usable
  // even before the tournament begins.
  // ------------------------------------------------------------------
  const FIRST_TIMERS = {
    // 2024 actuals (verified)
    masters: {
      2024: ["Ludvig Aberg","Akshay Bhatia","Eric Cole","Nick Dunlap",
             "Austin Eckroat","Stephan Jaeger","Thorbjorn Olesen",
             "Ryo Hisatsune","Peter Malnati","Christo Lamprecht",
             "Santiago de la Fuente","Jasper Stubbs"],
      2025: ["Nick Dunlap","Aldrich Potgieter","Jose Luis Ballester",
             "Joe Highsmith","Thomas Detry","Michael Kim","Davis Thompson",
             "Min Woo Lee","Hiroshi Tai","Evan Beck","Justin Hastings",
             "Noah Kent"],
      2026: ["Aldrich Potgieter","Karl Vilips","Ryan Gerard","Max Greyserman",
             "Jake Knapp","Sam Stevens","Niklas Norgaard","Matteo Manassero"],
      2027: [],
      2028: []
    },
    pga: {
      2024: ["Jake Knapp","Ben Kohles","Peter Malnati","Austin Eckroat",
             "Matthieu Pavon","Nick Dunlap","Alex Noren","Sami Valimaki"],
      2025: ["Aldrich Potgieter","Karl Vilips","Ryan Gerard","Matt Vogt",
             "Jackson Koivun","Takumi Kanaya"],
      2026: ["Aldrich Potgieter","Karl Vilips","Ryan Gerard","Jackson Koivun"],
      2027: [],
      2028: []
    },
    usopen: {
      2024: ["Matthieu Pavon","Nick Dunlap","Stephan Jaeger","Austin Eckroat",
             "Matt Vogt","Omar Morales","Bryan Kim"],
      2025: ["Aldrich Potgieter","Matt Vogt","Chris Gotterup","Ryan Gerard",
             "Joe Highsmith","Noah Kent","Evan Beck","Jackson Buchanan",
             "Trevor Gutschewski"],
      2026: ["Aldrich Potgieter","Karl Vilips","Jackson Koivun",
             "Ryan Gerard","Sam Stevens","Max Greyserman"],
      2027: [],
      2028: []
    },
    open: {
      2024: ["Ludvig Aberg","Akshay Bhatia","Nick Dunlap","Austin Eckroat",
             "Matthieu Pavon","Taylor Pendrith","Ben Griffin","Max Greyserman",
             "Jesper Svensson"],
      2025: ["Aldrich Potgieter","Ryan Gerard","Jackson Koivun","Joe Highsmith",
             "Chris Gotterup","Max Greyserman","Nico Echavarria","Karl Vilips",
             "Justin Hastings"],
      2026: ["Aldrich Potgieter","Karl Vilips","Jackson Koivun",
             "Sam Stevens","Ryan Gerard","Max Greyserman"],
      2027: [],
      2028: []
    }
  };

  // ------------------------------------------------------------------
  // Utility helpers
  // ------------------------------------------------------------------
  const normalizeName = (s) => {
    if (!s) return "";
    return s
      .toLowerCase()
      .normalize("NFD").replace(/[\u0300-\u036f]/g, "")  // strip accents
      .replace(/[^a-z0-9]/g, "")                          // strip punct/spaces
      .trim();
  };

  // Build a fast lookup set for the major winners list (normalized).
  const WINNER_SET = new Set(MAJOR_WINNERS.map(normalizeName));

  const hasWonMajor = (name) => WINNER_SET.has(normalizeName(name));

  const isInternational = (countryCode) =>
    !!countryCode && countryCode.toUpperCase() !== "USA" && countryCode.toUpperCase() !== "US";

  const getRanking = (name) => {
    const n = normalizeName(name);
    // Return best (lowest) rank found – some players appear twice above
    let best = 999;
    for (const p of RANKINGS) {
      if (normalizeName(p.name) === n) {
        if (p.rank < best) best = p.rank;
      }
    }
    return best;
  };

  const getCountry = (name) => {
    const n = normalizeName(name);
    for (const p of RANKINGS) {
      if (normalizeName(p.name) === n) return p.country;
    }
    return null;
  };

  // ------------------------------------------------------------------
  // Default field generator.
  //
  // In the absence of a live ESPN entry list we use the full rankings
  // list as an approximate "field".  When ESPN returns an event field
  // we replace this with the real competitors and merge in country /
  // ranking info we already know about.
  // ------------------------------------------------------------------
  const buildDefaultField = () => RANKINGS.map(p => ({
    name: p.name,
    country: p.country,
    rank: p.rank,
    wonMajor: hasWonMajor(p.name)
  }));

  return {
    MAJORS,
    VENUES,
    RANKINGS,
    MAJOR_WINNERS,
    WINNER_SET,
    FIRST_TIMERS,
    normalizeName,
    hasWonMajor,
    isInternational,
    getRanking,
    getCountry,
    buildDefaultField
  };
})();

// Expose globally so classic <script> tags in index.html can use it.
if (typeof window !== "undefined") window.GolfData = GolfData;
