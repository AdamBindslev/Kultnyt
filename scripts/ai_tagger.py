import json
import re
import urllib.request
import urllib.error
import sys
import os

# Allow importing config from same directory
sys.path.append(os.path.dirname(__file__))
from config import OLLAMA_BASE_URL, OLLAMA_MODEL, DK_LOCATIONS, GENRE_KEYWORDS

def fallback_extract(title: str, snippet: str) -> dict:
    """Fallback rule-based extraction when Ollama is offline or fails."""
    combined = f"{title} {snippet}".lower()
    
    # Extract matching genres
    detected_genres = []
    for genre, kws in GENRE_KEYWORDS.items():
        if any(kw in combined for kw in kws):
            detected_genres.append(genre)
    if not detected_genres:
        detected_genres = ["alternative"]

    # Check for release indicators
    release_type = "none"
    release_title = None
    if any(w in combined for w in ["album", "debut lp", "new lp", "announces lp"]):
        release_type = "album"
    elif any(w in combined for w in ["ep", "debut ep", "new ep"]):
        release_type = "ep"
    elif any(w in combined for w in ["share new song", "new single", "shares video for", "drops track"]):
        release_type = "single"

    # Check for Danish concert mentions
    is_tour = any(w in combined for w in ["tour", "turné", "live", "koncert", "festival", "dates", "announces tour"])
    dk_concert = None
    for loc in DK_LOCATIONS:
        if loc in combined:
            venue = loc.title()
            city = "København" if loc in ["vega", "store vega", "lille vega", "pumpehuset", "loppen", "hotel cecil", "alice"] else "Aarhus" if loc in ["voxhall", "radar", "atlas"] else "Danmark"
            dk_concert = {
                "venue": venue,
                "city": city,
                "date_str": "Se kilde for datoer"
            }
            break

    # Clean Danish summary placeholder from snippet
    clean_summary = snippet if snippet else title
    if len(clean_summary) > 220:
        clean_summary = clean_summary[:217] + "..."

    return {
        "summary_da": clean_summary,
        "artist": None,
        "release_title": release_title,
        "release_type": release_type,
        "genres": detected_genres[:3],
        "is_tour": is_tour,
        "denmark_concert": dk_concert
    }

def analyze_article_with_ollama(title: str, snippet: str, source_name: str, timeout: int = 20) -> dict:
    """
    Sends article to local Ollama model to generate a concise Danish summary
    and structured metadata (artist, release, tour dates in DK, genre tags).
    """
    prompt = f"""Du er en passioneret musikanmelder og kulturjournalist for websitet Kultnyt.
Analysér denne nyhed fra {source_name} om alternativ musik:

Titel: {title}
Uddrag: {snippet}

Instruktioner:
1. Skriv "summary_da": 2-3 skarpe, fængende sætninger på dansk, der opsummerer udgivelsen, nyheden eller turnéen, og beskriver musikkens stil og lyd (f.eks. støjende, melankolsk, energisk).
2. "artist": Navn på hovedkunstneren/bandet (eller null hvis branche/oversigt).
3. "release_title": Titel på album/EP/single, hvis nyheden omhandler en udgivelse (eller null).
4. "release_type": Vælg mellem "album", "ep", "single", "reissue" eller "none".
5. "genres": Array med 1-3 relevante alternative subgenrer (f.eks. "post-punk", "shoegaze", "indie rock", "electronic", "ambient", "experimental", "art-pop", "metal", "krautrock").
6. "is_tour": true hvis det omhandler turné, koncerter eller festivaloptræden, ellers false.
7. "denmark_concert": Hvis Danmark, København, Aarhus eller danske spillesteder (VEGA, Pumpehuset, Loppen, Roskilde Festival osv.) nævnes, angiv et objekt med:
   {{"venue": "Spillestedets navn", "city": "København eller Aarhus osv.", "date_str": "Dato eller periode"}}
   Hvis ingen koncerter i Danmark nævnes, sæt feltet til null.

Svar UDELUKKENDE med et gyldigt JSON-objekt i følgende format:
{{
  "summary_da": "Kort dansk resumé her...",
  "artist": "Kunstnernavn",
  "release_title": "Titel",
  "release_type": "album",
  "genres": ["post-punk", "shoegaze"],
  "is_tour": false,
  "denmark_concert": null
}}
"""

    payload = {
        "model": OLLAMA_MODEL,
        "prompt": prompt,
        "format": "json",
        "stream": False,
        "options": {
            "temperature": 0.3,
            "num_predict": 300
        }
    }

    try:
        url = f"{OLLAMA_BASE_URL}/api/generate"
        req_data = json.dumps(payload).encode("utf-8")
        req = urllib.request.Request(
            url,
            data=req_data,
            headers={"Content-Type": "application/json"}
        )
        with urllib.request.urlopen(req, timeout=timeout) as resp:
            if resp.status == 200:
                body = resp.read().decode("utf-8")
                result = json.loads(body)
                raw_response = result.get("response", "")
                data = json.loads(raw_response)
                
                # Ensure required fields exist
                if "summary_da" not in data or not data["summary_da"]:
                    data["summary_da"] = snippet[:220] if snippet else title
                if "genres" not in data or not isinstance(data["genres"], list) or len(data["genres"]) == 0:
                    data["genres"] = ["alternative"]
                return data
    except Exception as err:
        pass

    return fallback_extract(title, snippet)

if __name__ == "__main__":
    # Quick test
    sample_title = "Fontaines D.C. share new single 'Starburster' and announce European tour including Copenhagen"
    sample_snippet = "Irish post-punk titans Fontaines D.C. have returned with an explosive new single and announced tour dates at Store VEGA in Copenhagen this November."
    print("Testing analyze_article_with_ollama...")
    res = analyze_article_with_ollama(sample_title, sample_snippet, "Stereogum")
    print("Result:")
    print(json.dumps(res, indent=2, ensure_ascii=False))
