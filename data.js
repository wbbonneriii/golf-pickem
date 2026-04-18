/**
 * Major Pick'em — Seed Data
 *
 * Tournaments, venues, and player metadata.
 * The app will also attempt to sync live from ESPN's public golf API
 * (site.api.espn.com/apis/site/v2/sports/golf/...) when running in a browser.
 *
 * You can edit/extend this file to add future years or correct info.
 */

window.MAJOR_PICKEM_DATA = (function () {
  // ---------------------------------------------------------------------------
  // VENUES — men's majors by year
  // ---------------------------------------------------------------------------
  const VENUES = {
    masters: {
      2024: { venue: "Augusta National Golf Club", location: "Augusta, GA", dates: "April 11–14, 2024" },
      2025: { venue: "Augusta National Golf Club", location: "Augusta, GA", dates: "April 10–13, 2025" },
      2026: { venue: "Augusta National Golf Club", location: "Augusta, GA", dates: "April 9–12, 2026" },
      2027: { venue: "Augusta National Golf Club", location: "Augusta, GA", dates: "April 8–11, 2027" },
      2028: { venue: "Augusta National Golf Club", location: "Augusta, GA", dates: "April 6–9, 2028" },
    },
    pga: {
      2024: { venue: "Valhalla Golf Club",      location: "Louisville, KY" },
      2025: { venue: "Quail Hollow Club",        location: "Charlotte, NC" },
      2026: { venue: "Aronimink Golf Club",      location: "Newtown Square, PA" },
      2027: { venue: "PGA Frisco (Fields Ranch East)", location: "Frisco, TX" },
      2028: { venue: "Olympia Fields Country Club",    location: "Olympia Fields, IL" },
    },
    usopen: {
      2024: { venue: "Pinehurst No. 2",            location: "Pinehurst, NC" },
      2025: { venue: "Oakmont Country Club",       location: "Oakmont, PA" },
      2026: { venue: "Shinnecock Hills Golf Club", location: "Southampton, NY" },
      2027: { venue: "Pebble Beach Golf Links",    location: "Pebble Beach, CA" },
      2028: { venue: "Winged Foot Golf Club",      location: "Mamaroneck, NY" },
    },
    open: {
      2024: { venue: "Royal Troon Golf Club",    location: "Troon, Scotland" },
      2025: { venue: "Royal Portrush Golf Club", location: "Portrush, Northern Ireland" },
      2026: { venue: "Royal Birkdale Golf Club", location: "Southport, England" },
      2027: { venue: "St Andrews (Old Course)",  location: "St Andrews, Scotland" },
      2028: { venue: "Royal St George's Golf Club", location: "Sandwich, England" },
    },
  };

  const MAJOR_LABEL = {
    masters: "The US Masters",
    pga:     "The PGA Championship",
    usopen:  "The US Open",
    open:    "The Open Championship",
  };

  // ---------------------------------------------------------------------------
  // 2026 MASTERS FIELD
  //
  //   Field assembled from the 2026 Masters Tournament entry list
  //   (Wikipedia, en.wikipedia.org/wiki/2026_Masters_Tournament), which
  //   enumerates qualification categories and debutants.
  //
  //   For each player:
  //     name, country (ISO-3),
  //     owgr   = Official World Golf Ranking approx at tournament start
  //              (null = outside top 200 / LIV-unranked)
  //     hasMajor = true if they've ever won a men's professional major
  //     mastersFirst = true if 2026 is their first Masters appearance
  //
  //   22 DEBUTANTS (2026): Michael Brennan, Jacob Bridgeman, Ethan Fang (a),
  //   Ryan Gerard, Chris Gotterup, Ben Griffin, Harry Hall, Jackson Herrington (a),
  //   Brandon Holtz (a), Mason Howell (a), Casey Jarvis, Naoyuki Kataoka,
  //   John Keefer, Fifa Laopakdee (a), Tom McKibbin, Rasmus Neergaard-Petersen,
  //   Andrew Novak, Marco Penge, Mateo Pulcini (a), Kristoffer Reitan,
  //   Samuel Stevens, Sami Välimäki.
  // ---------------------------------------------------------------------------

  // "USA" born players treated as domestic; everyone else is international.
  // International born = NOT born in the USA.
  const MASTERS_2026_FIELD = [
    // ---------- Past Masters Champions (lifetime exemption) ----------
    { name: "Scottie Scheffler", country: "USA", owgr: 1,    hasMajor: true,  mastersFirst: false },
    { name: "Rory McIlroy",      country: "NIR", owgr: 2,    hasMajor: true,  mastersFirst: false },
    { name: "Jon Rahm",          country: "ESP", owgr: 45,   hasMajor: true,  mastersFirst: false },
    { name: "Hideki Matsuyama",  country: "JPN", owgr: 8,    hasMajor: true,  mastersFirst: false },
    { name: "Jordan Spieth",     country: "USA", owgr: 32,   hasMajor: true,  mastersFirst: false },
    { name: "Dustin Johnson",    country: "USA", owgr: 85,   hasMajor: true,  mastersFirst: false },
    { name: "Adam Scott",        country: "AUS", owgr: 36,   hasMajor: true,  mastersFirst: false },
    { name: "Patrick Reed",      country: "USA", owgr: 70,   hasMajor: true,  mastersFirst: false },
    { name: "Sergio Garcia",     country: "ESP", owgr: 65,   hasMajor: true,  mastersFirst: false },
    { name: "Danny Willett",     country: "ENG", owgr: null, hasMajor: true,  mastersFirst: false },
    { name: "Charl Schwartzel",  country: "RSA", owgr: null, hasMajor: true,  mastersFirst: false },
    { name: "Zach Johnson",      country: "USA", owgr: null, hasMajor: true,  mastersFirst: false },
    { name: "Bubba Watson",      country: "USA", owgr: null, hasMajor: true,  mastersFirst: false },
    { name: "Mike Weir",         country: "CAN", owgr: null, hasMajor: true,  mastersFirst: false },
    { name: "Angel Cabrera",     country: "ARG", owgr: null, hasMajor: true,  mastersFirst: false },
    { name: "Phil Mickelson",    country: "USA", owgr: null, hasMajor: true,  mastersFirst: false },
    { name: "Vijay Singh",       country: "FIJ", owgr: null, hasMajor: true,  mastersFirst: false },
    { name: "Trevor Immelman",   country: "RSA", owgr: null, hasMajor: true,  mastersFirst: false },
    { name: "Fred Couples",      country: "USA", owgr: null, hasMajor: true,  mastersFirst: false },
    { name: "Bernhard Langer",   country: "GER", owgr: null, hasMajor: true,  mastersFirst: false },
    { name: "José María Olazábal", country: "ESP", owgr: null, hasMajor: true, mastersFirst: false },

    // ---------- Other recent major winners (5-yr exemption) ----------
    { name: "Xander Schauffele", country: "USA", owgr: 3,    hasMajor: true,  mastersFirst: false },
    { name: "Collin Morikawa",   country: "USA", owgr: 5,    hasMajor: true,  mastersFirst: false },
    { name: "Justin Thomas",     country: "USA", owgr: 9,    hasMajor: true,  mastersFirst: false },
    { name: "Bryson DeChambeau", country: "USA", owgr: 18,   hasMajor: true,  mastersFirst: false },
    { name: "Wyndham Clark",     country: "USA", owgr: 30,   hasMajor: true,  mastersFirst: false },
    { name: "Brian Harman",      country: "USA", owgr: 26,   hasMajor: true,  mastersFirst: false },
    { name: "Brooks Koepka",     country: "USA", owgr: 80,   hasMajor: true,  mastersFirst: false },
    { name: "Matt Fitzpatrick",  country: "ENG", owgr: 28,   hasMajor: true,  mastersFirst: false },
    { name: "Cameron Smith",     country: "AUS", owgr: 60,   hasMajor: true,  mastersFirst: false },
    { name: "Jason Day",         country: "AUS", owgr: 22,   hasMajor: true,  mastersFirst: false },
    { name: "Shane Lowry",       country: "IRL", owgr: 15,   hasMajor: true,  mastersFirst: false },
    { name: "Keegan Bradley",    country: "USA", owgr: 12,   hasMajor: true,  mastersFirst: false },
    { name: "Justin Rose",       country: "ENG", owgr: 66,   hasMajor: true,  mastersFirst: false },
    { name: "Gary Woodland",     country: "USA", owgr: 120,  hasMajor: true,  mastersFirst: false },
    { name: "Francesco Molinari", country: "ITA", owgr: null, hasMajor: true, mastersFirst: false },
    { name: "J.J. Spaun",        country: "USA", owgr: 34,   hasMajor: true,  mastersFirst: false },

    // ---------- Top-50 OWGR / PGA Tour winners (no major, not debuting) ----------
    { name: "Ludvig Åberg",       country: "SWE", owgr: 4,   hasMajor: false, mastersFirst: false },
    { name: "Tommy Fleetwood",    country: "ENG", owgr: 6,   hasMajor: false, mastersFirst: false },
    { name: "Russell Henley",     country: "USA", owgr: 7,   hasMajor: false, mastersFirst: false },
    { name: "Sepp Straka",        country: "AUT", owgr: 10,  hasMajor: false, mastersFirst: false },
    { name: "Patrick Cantlay",    country: "USA", owgr: 11,  hasMajor: false, mastersFirst: false },
    { name: "Viktor Hovland",     country: "NOR", owgr: 13,  hasMajor: false, mastersFirst: false },
    { name: "Sungjae Im",         country: "KOR", owgr: 14,  hasMajor: false, mastersFirst: false },
    { name: "Robert MacIntyre",   country: "SCO", owgr: 16,  hasMajor: false, mastersFirst: false },
    { name: "Maverick McNealy",   country: "USA", owgr: 17,  hasMajor: false, mastersFirst: false },
    { name: "Corey Conners",      country: "CAN", owgr: 19,  hasMajor: false, mastersFirst: false },
    { name: "Tony Finau",         country: "USA", owgr: 20,  hasMajor: false, mastersFirst: false },
    { name: "Sahith Theegala",    country: "USA", owgr: 21,  hasMajor: false, mastersFirst: false },
    { name: "Akshay Bhatia",      country: "USA", owgr: 23,  hasMajor: false, mastersFirst: false },
    { name: "Sam Burns",          country: "USA", owgr: 24,  hasMajor: false, mastersFirst: false },
    { name: "Min Woo Lee",        country: "AUS", owgr: 25,  hasMajor: false, mastersFirst: false },
    { name: "Tom Kim",            country: "KOR", owgr: 27,  hasMajor: false, mastersFirst: false },
    { name: "Cameron Young",      country: "USA", owgr: 29,  hasMajor: false, mastersFirst: false },
    { name: "Tyrrell Hatton",     country: "ENG", owgr: 31,  hasMajor: false, mastersFirst: false },
    { name: "Byeong Hun An",      country: "KOR", owgr: 33,  hasMajor: false, mastersFirst: false },
    { name: "Aaron Rai",          country: "ENG", owgr: 35,  hasMajor: false, mastersFirst: false },
    { name: "Si Woo Kim",         country: "KOR", owgr: 37,  hasMajor: false, mastersFirst: false },
    { name: "Harris English",     country: "USA", owgr: 38,  hasMajor: false, mastersFirst: false },
    { name: "Denny McCarthy",     country: "USA", owgr: 39,  hasMajor: false, mastersFirst: false },
    { name: "Taylor Pendrith",    country: "CAN", owgr: 40,  hasMajor: false, mastersFirst: false },
    { name: "Tom Hoge",           country: "USA", owgr: 41,  hasMajor: false, mastersFirst: false },
    { name: "Thomas Detry",       country: "BEL", owgr: 42,  hasMajor: false, mastersFirst: false },
    { name: "Billy Horschel",     country: "USA", owgr: 43,  hasMajor: false, mastersFirst: false },
    { name: "Stephan Jaeger",     country: "GER", owgr: 44,  hasMajor: false, mastersFirst: false },
    { name: "Nick Taylor",        country: "CAN", owgr: 46,  hasMajor: false, mastersFirst: false },
    { name: "Nicolai Højgaard",   country: "DEN", owgr: 48,  hasMajor: false, mastersFirst: false },
    { name: "Rasmus Højgaard",    country: "DEN", owgr: 49,  hasMajor: false, mastersFirst: false },
    { name: "Joaquin Niemann",    country: "CHI", owgr: 55,  hasMajor: false, mastersFirst: false },
    { name: "Jhonattan Vegas",    country: "VEN", owgr: 53,  hasMajor: false, mastersFirst: false },
    { name: "Nick Dunlap",        country: "USA", owgr: 54,  hasMajor: false, mastersFirst: false },
    { name: "Davis Thompson",     country: "USA", owgr: 56,  hasMajor: false, mastersFirst: false },
    { name: "Patrick Rodgers",    country: "USA", owgr: 57,  hasMajor: false, mastersFirst: false },
    { name: "Matthieu Pavon",     country: "FRA", owgr: 58,  hasMajor: false, mastersFirst: false },
    { name: "Thriston Lawrence",  country: "RSA", owgr: 50,  hasMajor: false, mastersFirst: false },
    { name: "Matt McCarty",       country: "USA", owgr: 68,  hasMajor: false, mastersFirst: false },
    { name: "Michael Kim",        country: "USA", owgr: 88,  hasMajor: false, mastersFirst: false },
    { name: "Niklas Nørgaard",    country: "DEN", owgr: 78,  hasMajor: false, mastersFirst: false },
    { name: "Max Homa",           country: "USA", owgr: 95,  hasMajor: false, mastersFirst: false },
    { name: "Adam Hadwin",        country: "CAN", owgr: 110, hasMajor: false, mastersFirst: false },
    { name: "Erik van Rooyen",    country: "RSA", owgr: 98,  hasMajor: false, mastersFirst: false },
    { name: "Chris Kirk",         country: "USA", owgr: 115, hasMajor: false, mastersFirst: false },
    { name: "Kurt Kitayama",      country: "USA", owgr: 64,  hasMajor: false, mastersFirst: false },

    // ---------- 2026 MASTERS DEBUTANTS (first-timers)
    //  Verified from Wikipedia: 22 players making their first Masters start in 2026.
    //  (a) = amateur.
    // -------------------------------------------------------------------
    { name: "Michael Brennan",         country: "USA", owgr: 180, hasMajor: false, mastersFirst: true },
    { name: "Jacob Bridgeman",         country: "USA", owgr: 105, hasMajor: false, mastersFirst: true },
    { name: "Ethan Fang",              country: "USA", owgr: null, hasMajor: false, mastersFirst: true }, // (a) US Amateur champion
    { name: "Ryan Gerard",             country: "USA", owgr: 82,  hasMajor: false, mastersFirst: true },
    { name: "Chris Gotterup",          country: "USA", owgr: 51,  hasMajor: false, mastersFirst: true },
    { name: "Ben Griffin",             country: "USA", owgr: 47,  hasMajor: false, mastersFirst: true },
    { name: "Harry Hall",              country: "ENG", owgr: 63,  hasMajor: false, mastersFirst: true },
    { name: "Jackson Herrington",      country: "USA", owgr: null, hasMajor: false, mastersFirst: true }, // (a)
    { name: "Brandon Holtz",           country: "USA", owgr: null, hasMajor: false, mastersFirst: true }, // (a) US Mid-Amateur champion
    { name: "Mason Howell",            country: "USA", owgr: null, hasMajor: false, mastersFirst: true }, // (a)
    { name: "Casey Jarvis",            country: "RSA", owgr: 150, hasMajor: false, mastersFirst: true },
    { name: "Naoyuki Kataoka",         country: "JPN", owgr: 140, hasMajor: false, mastersFirst: true }, // Japan Golf Tour leader
    { name: "John Keefer",             country: "USA", owgr: 160, hasMajor: false, mastersFirst: true },
    { name: "Fifa Laopakdee",          country: "THA", owgr: null, hasMajor: false, mastersFirst: true }, // (a) Asia-Pacific Amateur champion
    { name: "Tom McKibbin",            country: "NIR", owgr: 72,  hasMajor: false, mastersFirst: true },
    { name: "Rasmus Neergaard-Petersen", country: "DEN", owgr: 73, hasMajor: false, mastersFirst: true },
    { name: "Andrew Novak",            country: "USA", owgr: 59,  hasMajor: false, mastersFirst: true },
    { name: "Marco Penge",             country: "ENG", owgr: 61,  hasMajor: false, mastersFirst: true },
    { name: "Mateo Pulcini",           country: "ARG", owgr: null, hasMajor: false, mastersFirst: true }, // (a) Latin America Amateur champion
    { name: "Kristoffer Reitan",       country: "NOR", owgr: 135, hasMajor: false, mastersFirst: true },
    { name: "Samuel Stevens",          country: "USA", owgr: 52,  hasMajor: false, mastersFirst: true },
    { name: "Sami Välimäki",           country: "FIN", owgr: 77,  hasMajor: false, mastersFirst: true },
  ];

  // ---------------------------------------------------------------------------
  // Tournament registry — lets you add new tournaments (years / majors)
  // ---------------------------------------------------------------------------
  const TOURNAMENTS = {
    "masters-2026": {
      key: "masters-2026",
      major: "masters",
      year: 2026,
      label: "The US Masters 2026",
      ...VENUES.masters[2026],
      // ESPN search: the app will call /sports/golf/pga/scoreboard?dates=20260409-20260412
      // and pick the event whose name contains "Masters". No manual event id required.
      field: MASTERS_2026_FIELD,
    },
  };

  // Empty shells for the other 2026 majors (field populated at draft time from ESPN).
  ["pga","usopen","open"].forEach((m) => {
    for (let yr = 2024; yr <= 2028; yr++) {
      const key = `${m}-${yr}`;
      const v = VENUES[m][yr];
      if (v) TOURNAMENTS[key] = { key, major: m, year: yr, label: `${MAJOR_LABEL[m]} ${yr}`, ...v, field: [] };
    }
  });
  for (const yr of [2024, 2025, 2027, 2028]) {
    const key = `masters-${yr}`;
    const v = VENUES.masters[yr];
    if (v) TOURNAMENTS[key] = { key, major: "masters", year: yr, label: `The US Masters ${yr}`, ...v, field: [] };
  }

  return {
    VENUES,
    MAJOR_LABEL,
    TOURNAMENTS,
    MASTERS_2026_FIELD,
  };
})();
