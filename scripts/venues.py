import urllib.request
import re
import html
from datetime import datetime, timezone

HEADERS = {
    'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36 (Kultnyt-Bot/1.0)'
}

def clean_text(text: str) -> str:
    if not text:
        return ""
    no_html = re.sub(r'<[^>]+>', ' ', text)
    return re.sub(r'\s+', ' ', no_html).strip()

def format_loppen_date(raw_date: str) -> str:
    """Formats 'SØNDAG 13. SEP 2026 - KL 19.00' into a readable string."""
    clean = clean_text(raw_date)
    return clean.replace(" - KL ", " kl. ")

def fetch_loppen_concerts(timeout: int = 10) -> list:
    concerts = []
    try:
        req = urllib.request.Request('https://loppen.dk', headers=HEADERS)
        with urllib.request.urlopen(req, timeout=timeout) as r:
            content = r.read().decode('utf-8', errors='ignore')

        matches = re.findall(
            r'<div class=[\"\']event teaser\s*([^\"\']*)[\"\']>.*?<div class=[\"\']date[\"\']>(.*?)</div>.*?href=[\"\'](https://www\.eventim-light\.com/[^\"\']+)[\"\'].*?<span class=[\"\']header-1[\"\']>(.*?)</span>',
            content, flags=re.DOTALL
        )
        for genres_raw, date_raw, ticket_url, artist_raw in matches:
            artist = clean_text(artist_raw)
            date_clean = format_loppen_date(date_raw)
            genres = [
                g.strip().lower() for g in genres_raw.split()
                if g.strip() and not g.strip().isdigit() and len(g) > 2 and g.lower() not in ['sep', 'okt', 'nov', 'dec', 'teaser', 'even', 'odd']
            ]
            if not genres:
                genres = ['alternative', 'indie']

            concerts.append({
                'id': f'cct-loppen-{abs(hash(artist + date_clean))}',
                'artist': artist,
                'venue': 'Loppen',
                'city': 'København',
                'date_str': date_clean,
                'genres': genres[:3],
                'summary_da': f'Koncert med {artist} på Loppen i Christiania.',
                'source_name': 'Loppen',
                'link': ticket_url,
                'created_at': datetime.now(timezone.utc).isoformat()
            })
    except Exception as e:
        print(f"  [!] Fejl under hentning af Loppen: {e}", flush=True)
    return concerts

def fetch_vega_concerts(timeout: int = 10) -> list:
    concerts = []
    try:
        req = urllib.request.Request('https://www.vega.dk/kalender', headers=HEADERS)
        with urllib.request.urlopen(req, timeout=timeout) as r:
            content = r.read().decode('utf-8', errors='ignore')

        cards = re.findall(r'<article[^>]*>(.*?)</article>', content, flags=re.DOTALL)
        for card in cards:
            card_clean = re.sub(r'<svg[^>]*>.*?</svg>', '', card, flags=re.DOTALL)
            card_clean = re.sub(r'<img[^>]*>', '', card_clean, flags=re.DOTALL)

            headings = re.findall(r'<h[1-6][^>]*>(.*?)</h[1-6]>', card_clean, flags=re.DOTALL)
            if not headings:
                continue
            artist = html.unescape(clean_text(headings[0]))
            if not artist or len(artist) < 2:
                continue

            venue = 'VEGA'
            if 'Store VEGA' in card_clean:
                venue = 'Store VEGA'
            elif 'Lille VEGA' in card_clean:
                venue = 'Lille VEGA'
            elif 'Ideal Bar' in card_clean:
                venue = 'Ideal Bar'

            text_only = clean_text(card_clean)
            date_match = re.search(r'(\d{1,2}\.\d{2}\.\d{4}|\d{1,2}\.\s*(?:jan|feb|mar|apr|maj|jun|jul|aug|sep|okt|nov|dec)[a-zæøå]*(?:\s*\d{4})?)', text_only, flags=re.IGNORECASE)
            date_str = date_match.group(1) if date_match else 'Se billet'

            link_match = re.search(r'href=[\"\'](https://www\.vega\.dk/event/[^\"\']+|/event/[^\"\']+)[\"\']', card_clean)
            link = link_match.group(1) if link_match else 'https://www.vega.dk/kalender'
            if link.startswith('/'):
                link = f'https://www.vega.dk{link}'

            genres = ['alternative']
            for g in ['post-punk', 'shoegaze', 'indie', 'rock', 'pop', 'electronic', 'metal', 'hip-hop', 'folk', 'r&b']:
                if g in text_only.lower():
                    genres.append(g)

            concerts.append({
                'id': f'cct-vega-{abs(hash(artist + date_str))}',
                'artist': artist,
                'venue': venue,
                'city': 'København',
                'date_str': date_str,
                'genres': list(dict.fromkeys(genres))[:3],
                'summary_da': f'Koncert med {artist} i {venue}, Vesterbro.',
                'source_name': 'VEGA',
                'link': link,
                'created_at': datetime.now(timezone.utc).isoformat()
            })
    except Exception as e:
        print(f"  [!] Fejl under hentning af VEGA: {e}", flush=True)
    return concerts

def fetch_radar_concerts(timeout: int = 10) -> list:
    concerts = []
    try:
        req = urllib.request.Request('https://radarlive.dk', headers=HEADERS)
        with urllib.request.urlopen(req, timeout=timeout) as r:
            content = r.read().decode('utf-8', errors='ignore')

        matches = re.findall(
            r'<a[^>]+href=[\"\'](/kalender/\d{4}/[^/]+/([^/]+)/\?ytroute=[^\"\']+)[\"\'][^>]*>(.*?)</a>',
            content, flags=re.DOTALL
        )
        seen_links = set()
        for full_url, slug, text in matches:
            if full_url in seen_links:
                continue
            seen_links.add(full_url)

            text_clean = clean_text(text)
            date_match = re.search(r'(\d{1,2}\s+(?:jan|feb|mar|apr|maj|jun|jul|aug|sep|okt|nov|dec)[a-zæøå]*)', text_clean, flags=re.IGNORECASE)
            date_str = date_match.group(1) if date_match else 'Kommende'

            # Clean artist from slug
            clean_slug = slug.replace('-plus-', ' + ').replace('-support-', ' (support: ').replace('-', ' ').title()
            if '(support:' in clean_slug:
                clean_slug += ')'
            artist = clean_slug

            genres = ['alternative']
            for g in ['jazz', 'avantgarde', 'indie', 'pop', 'elektronisk', 'rock', 'post-punk', 'folk', 'ambient']:
                if g in text_clean.lower():
                    genres.append(g)

            link = f"https://radarlive.dk{full_url}"

            concerts.append({
                'id': f'cct-radar-{abs(hash(artist + date_str))}',
                'artist': artist,
                'venue': 'Radar',
                'city': 'Aarhus',
                'date_str': date_str,
                'genres': list(dict.fromkeys(genres))[:3],
                'summary_da': f'Koncert på Radar i Aarhus: {text_clean[:140]}...',
                'source_name': 'Radar Aarhus',
                'link': link,
                'created_at': datetime.now(timezone.utc).isoformat()
            })
    except Exception as e:
        print(f"  [!] Fejl under hentning af Radar Aarhus: {e}", flush=True)
    return concerts

def fetch_all_danish_venues() -> list:
    print("🎪 Henter direkte koncertkalendere fra danske spillesteder...", flush=True)
    all_concerts = []
    
    loppen = fetch_loppen_concerts()
    print(f"   ✓ Loppen (Christiania): {len(loppen)} koncerter", flush=True)
    all_concerts.extend(loppen)

    vega = fetch_vega_concerts()
    print(f"   ✓ VEGA (København): {len(vega)} koncerter", flush=True)
    all_concerts.extend(vega)

    radar = fetch_radar_concerts()
    print(f"   ✓ Radar (Aarhus): {len(radar)} koncerter", flush=True)
    all_concerts.extend(radar)

    return all_concerts
