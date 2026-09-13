import os

OLLAMA_BASE_URL = os.getenv("OLLAMA_BASE_URL", "http://localhost:11434")
OLLAMA_MODEL = os.getenv("OLLAMA_MODEL", "llama3.2")

# Curated RSS Feeds
FEED_SOURCES = [
    {
        "id": "stereogum",
        "name": "Stereogum",
        "url": "https://www.stereogum.com",
        "feed_url": "https://www.stereogum.com/feed",
        "category": "international",
        "badge_color": "bg-indigo-900/60 text-indigo-300 border-indigo-700/50",
    },
    {
        "id": "pitchfork_best",
        "name": "Pitchfork (Best New)",
        "url": "https://pitchfork.com",
        "feed_url": "https://pitchfork.com/feed/reviews/best/albums/rss",
        "category": "international",
        "badge_color": "bg-red-900/60 text-red-300 border-red-700/50",
    },
    {
        "id": "pitchfork_news",
        "name": "Pitchfork (News)",
        "url": "https://pitchfork.com",
        "feed_url": "https://pitchfork.com/feed/feed-news/rss",
        "category": "international",
        "badge_color": "bg-red-900/60 text-red-300 border-red-700/50",
    },
    {
        "id": "quietus",
        "name": "The Quietus",
        "url": "https://thequietus.com",
        "feed_url": "https://thequietus.com/feed/",
        "category": "international",
        "badge_color": "bg-emerald-900/60 text-emerald-300 border-emerald-700/50",
    },
    {
        "id": "brooklynvegan",
        "name": "BrooklynVegan",
        "url": "https://www.brooklynvegan.com",
        "feed_url": "https://www.brooklynvegan.com/feed/",
        "category": "international",
        "badge_color": "bg-amber-900/60 text-amber-300 border-amber-700/50",
    },
    {
        "id": "bandcamp_daily",
        "name": "Bandcamp Daily",
        "url": "https://daily.bandcamp.com",
        "feed_url": "https://daily.bandcamp.com/feed",
        "category": "international",
        "badge_color": "bg-sky-900/60 text-sky-300 border-sky-700/50",
    },
    {
        "id": "gaffa",
        "name": "GAFFA",
        "url": "https://gaffa.dk",
        "feed_url": "https://gaffa.dk/rss/",
        "category": "danish",
        "badge_color": "bg-rose-900/60 text-rose-300 border-rose-700/50",
    },
    {
        "id": "soundvenue",
        "name": "Soundvenue",
        "url": "https://soundvenue.com",
        "feed_url": "https://soundvenue.com/feed",
        "category": "danish",
        "badge_color": "bg-purple-900/60 text-purple-300 border-purple-700/50",
    }
]

# Danish cities and venues for concert filtering
DK_LOCATIONS = [
    "københavn", "copenhagen", "aarhus", "århus", "odense", "aalborg",
    "vega", "store vega", "lille vega", "ideal bar",
    "pumpehuset", "loppen", "hotel cecil", "alice", "beta", "rust",
    "voxhall", "radar", "atlas", "posten", "studenterhuset",
    "roskilde festival", "syd for solen", "northside", "spot festival",
    "a colossal weekend", "o / day fest", "haven festival", "copenhell"
]

# Genre keywords for heuristic detection
GENRE_KEYWORDS = {
    "post-punk": ["post-punk", "darkwave", "coldwave", "goth", "joy division", "idles", "fontaines d.c."],
    "shoegaze": ["shoegaze", "dream pop", "dreampop", "slowdive", "my bloody valentine", "fuzz", "reverb"],
    "indie rock": ["indie rock", "indie pop", "alternative rock", "alt-rock", "guitar"],
    "electronic": ["electronic", "techno", "ambient", "idm", "synth", "modular", "club", "house", "electro"],
    "experimental": ["experimental", "avant-garde", "noise", "drone", "improvisation", "field recording"],
    "alt-folk": ["folk", "alt-country", "acoustic", "singer-songwriter", "americana"],
    "metal / heavy": ["metal", "sludge", "doom", "black metal", "hardcore", "punk"]
}
