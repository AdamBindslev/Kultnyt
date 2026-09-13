import os
import sys
import json
import time
import re
import argparse
import subprocess
from datetime import datetime, timezone
import urllib.request
import xml.etree.ElementTree as ET

# Ensure scripts dir is in path
sys.path.append(os.path.dirname(__file__))
from config import FEED_SOURCES
from ai_tagger import analyze_article_with_ollama, fallback_extract

DATA_DIR = os.path.join(os.path.dirname(os.path.dirname(__file__)), "data")
NEWS_FILE = os.path.join(DATA_DIR, "news.json")
RELEASES_FILE = os.path.join(DATA_DIR, "releases.json")
CONCERTS_FILE = os.path.join(DATA_DIR, "concerts.json")
META_FILE = os.path.join(DATA_DIR, "meta.json")

NON_MUSIC_PATTERNS = ["/film/", "/film-", "venedig film", "cannes", "oscar", "biograf", "filmanmeldelse"]

def is_music_relevant(title: str, link: str, snippet: str) -> bool:
    combined = f"{title} {link} {snippet}".lower()
    for bad in NON_MUSIC_PATTERNS:
        if bad in combined:
            return False
    return True

def strip_html(text: str) -> str:
    if not text:
        return ""
    text = re.sub(r"<style[^>]*>[\s\S]*?</style>", "", text, flags=re.IGNORECASE)
    text = re.sub(r"<script[^>]*>[\s\S]*?</script>", "", text, flags=re.IGNORECASE)
    text = re.sub(r"<[^>]+>", " ", text)
    text = text.replace("&nbsp;", " ").replace("&amp;", "&").replace("&lt;", "<").replace("&gt;", ">").replace("&quot;", "\"").replace("&#39;", "'")
    return re.sub(r"\s+", " ", text).strip()

def clean_url(url: str) -> str:
    """Strips tracking query parameters from URL."""
    try:
        from urllib.parse import urlparse, parse_qs, urlencode, urlunparse
        parsed = urlparse(url)
        tracking_params = {'utm_source', 'utm_medium', 'utm_campaign', 'utm_term', 'utm_content', 'ref', 'fbclid'}
        qs = parse_qs(parsed.query)
        clean_qs = {k: v for k, v in qs.items() if k.lower() not in tracking_params and not k.lower().startswith('utm_')}
        new_query = urlencode(clean_qs, doseq=True)
        return urlunparse((parsed.scheme, parsed.netloc, parsed.path, parsed.params, new_query, ''))
    except Exception:
        return url.split("?")[0]

def parse_feed_xml(xml_content: str, source: dict):
    items = []
    try:
        root = ET.fromstring(xml_content)
    except Exception:
        try:
            sanitized = re.sub(r'&(?!(?:amp|lt|gt|quot|apos|#\d+|#x[0-9a-fA-F]+);)', '&amp;', xml_content)
            root = ET.fromstring(sanitized)
        except Exception as e:
            print(f"  [!] XML parse error for {source['name']}: {e}", flush=True)
            return items

    channel = root.find("channel")
    if channel is not None:
        for item_elem in channel.findall("item"):
            title_elem = item_elem.find("title")
            link_elem = item_elem.find("link")
            desc_elem = item_elem.find("description")
            pub_date_elem = item_elem.find("pubDate")
            guid_elem = item_elem.find("guid")

            title = title_elem.text.strip() if title_elem is not None and title_elem.text else "Uden titel"
            link = link_elem.text.strip() if link_elem is not None and link_elem.text else source["url"]
            link = clean_url(link)
            guid = guid_elem.text.strip() if guid_elem is not None and guid_elem.text else link
            pub_date = pub_date_elem.text.strip() if pub_date_elem is not None and pub_date_elem.text else ""
            
            raw_desc = desc_elem.text if desc_elem is not None and desc_elem.text else ""
            clean_snippet = strip_html(raw_desc)
            if len(clean_snippet) > 300:
                clean_snippet = clean_snippet[:297] + "..."

            if not is_music_relevant(title, link, clean_snippet):
                continue

            items.append({
                "id": f"{source['id']}-{abs(hash(guid))}",
                "guid": guid,
                "title": title,
                "link": link,
                "source_id": source["id"],
                "source_name": source["name"],
                "badge_color": source.get("badge_color", "bg-zinc-800 text-zinc-300"),
                "category": source.get("category", "international"),
                "pub_date": pub_date,
                "snippet": clean_snippet
            })
        return items

    ns = {"atom": "http://www.w3.org/2005/Atom"}
    entries = root.findall("atom:entry", ns) or root.findall("entry")
    for entry in entries:
        title_elem = entry.find("atom:title", ns) or entry.find("title")
        link_elem = entry.find("atom:link", ns) or entry.find("link")
        summary_elem = entry.find("atom:summary", ns) or entry.find("summary") or entry.find("atom:content", ns) or entry.find("content")
        pub_elem = entry.find("atom:published", ns) or entry.find("published") or entry.find("atom:updated", ns) or entry.find("updated")
        id_elem = entry.find("atom:id", ns) or entry.find("id")

        title = title_elem.text.strip() if title_elem is not None and title_elem.text else "Uden titel"
        link = ""
        if link_elem is not None:
            link = link_elem.attrib.get("href", "") or (link_elem.text or "").strip()
        if not link:
            link = source["url"]
        link = clean_url(link)

        guid = id_elem.text.strip() if id_elem is not None and id_elem.text else link
        pub_date = pub_elem.text.strip() if pub_elem is not None and pub_elem.text else ""

        raw_desc = summary_elem.text if summary_elem is not None and summary_elem.text else ""
        clean_snippet = strip_html(raw_desc)
        if len(clean_snippet) > 300:
            clean_snippet = clean_snippet[:297] + "..."

        if not is_music_relevant(title, link, clean_snippet):
            continue

        items.append({
            "id": f"{source['id']}-{abs(hash(guid))}",
            "guid": guid,
            "title": title,
            "link": link,
            "source_id": source["id"],
            "source_name": source["name"],
            "badge_color": source.get("badge_color", "bg-zinc-800 text-zinc-300"),
            "category": source.get("category", "international"),
            "pub_date": pub_date,
            "snippet": clean_snippet
        })

    return items

def fetch_feed(source: dict, timeout: int = 10):
    headers = {
        "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36 (Kultnyt-Bot/1.0)",
        "Accept": "application/rss+xml, application/atom+xml, application/xml, text/xml;q=0.9, */*;q=0.8"
    }
    try:
        req = urllib.request.Request(source["feed_url"], headers=headers)
        with urllib.request.urlopen(req, timeout=timeout) as response:
            if response.status == 200:
                raw_data = response.read().decode("utf-8", errors="replace")
                return parse_feed_xml(raw_data, source)
    except Exception as e:
        print(f"  [-] Kunne ikke hente {source['name']}: {e}", flush=True)
    return []

def load_json(filepath: str, default=None):
    if os.path.exists(filepath):
        try:
            with open(filepath, "r", encoding="utf-8") as f:
                return json.load(f)
        except Exception:
            pass
    return default if default is not None else []

def save_json(filepath: str, data):
    os.makedirs(os.path.dirname(filepath), exist_ok=True)
    temp_file = f"{filepath}.tmp"
    with open(temp_file, "w", encoding="utf-8") as f:
        json.dump(data, f, ensure_ascii=False, indent=2)
    os.replace(temp_file, filepath)

def run_harvest(limit_per_feed: int = 5, skip_ai: bool = False, git_push: bool = False):
    print("=" * 60, flush=True)
    print(f"🎵 KULTNYT HARVESTER – Starter kl. {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}", flush=True)
    print("=" * 60, flush=True)

    existing_news = load_json(NEWS_FILE, [])
    existing_releases = load_json(RELEASES_FILE, [])
    existing_concerts = load_json(CONCERTS_FILE, [])

    existing_links = {item.get("link") for item in existing_news if item.get("link")}
    existing_titles = {item.get("title", "").lower() for item in existing_news if item.get("title")}

    fetched_items = []
    for source in FEED_SOURCES:
        print(f"📡 Henter feed fra: {source['name']}...", flush=True)
        items = fetch_feed(source)
        if items:
            print(f"   ✓ Modtog {len(items)} artikler", flush=True)
            fetched_items.extend(items[:limit_per_feed])
        else:
            print(f"   ✗ Ingen artikler modtaget", flush=True)

    print(f"\n🔍 Behandler {len(fetched_items)} kandidat-artikler...", flush=True)

    new_articles_count = 0
    updated_news_list = list(existing_news)

    for item in fetched_items:
        link = item["link"]
        title_lower = item["title"].lower()

        if link in existing_links or title_lower in existing_titles:
            continue

        if skip_ai:
            ai_data = fallback_extract(item["title"], item["snippet"])
        else:
            print(f"   🧠 Analyserer med Ollama: {item['title'][:55]}...", flush=True)
            ai_data = analyze_article_with_ollama(item["title"], item["snippet"], item["source_name"])

        item["summary_da"] = ai_data.get("summary_da", item["snippet"])
        item["artist"] = ai_data.get("artist")
        item["release_title"] = ai_data.get("release_title")
        item["release_type"] = ai_data.get("release_type", "none")
        item["genres"] = [g for g in ai_data.get("genres", ["alternative"]) if g and g.lower() != "none"]
        item["is_tour"] = ai_data.get("is_tour", False)
        item["denmark_concert"] = ai_data.get("denmark_concert")
        item["created_at"] = datetime.now(timezone.utc).isoformat()

        updated_news_list.insert(0, item)
        existing_links.add(link)
        existing_titles.add(title_lower)
        new_articles_count += 1

        # Check if item qualifies for Release Radar
        is_valid_release = (
            item["release_type"] in ["album", "ep", "single", "reissue"]
            and item.get("release_title")
            and item.get("release_title").lower() not in ["none", "null", ""]
        )
        if is_valid_release:
            rel_exists = any(r.get("source_url") == link for r in existing_releases)
            if not rel_exists:
                artist_name = item.get("artist")
                if not artist_name or artist_name.lower() in ["none", "null", ""]:
                    artist_name = item["title"].split(" - ")[0] if " - " in item["title"] else item["source_name"]

                existing_releases.insert(0, {
                    "id": f"rel-{item['id']}",
                    "artist": artist_name,
                    "title": item["release_title"],
                    "type": item["release_type"],
                    "genres": item["genres"],
                    "summary_da": item["summary_da"],
                    "source_name": item["source_name"],
                    "source_url": item["link"],
                    "badge_color": item["badge_color"],
                    "date": datetime.now(timezone.utc).strftime("%d. %b %Y"),
                    "created_at": item["created_at"]
                })

        # Check if item qualifies for DK Concert Radar
        if item.get("denmark_concert"):
            dk_info = item["denmark_concert"]
            concert_exists = any(c.get("link") == link for c in existing_concerts)
            if not concert_exists:
                artist_name = item.get("artist") or item["title"]
                existing_concerts.insert(0, {
                    "id": f"cct-{item['id']}",
                    "artist": artist_name,
                    "venue": dk_info.get("venue", "Spillested i DK"),
                    "city": dk_info.get("city", "København"),
                    "date_str": dk_info.get("date_str", "Annonceret"),
                    "summary_da": item["summary_da"],
                    "genres": item["genres"],
                    "source_name": item["source_name"],
                    "link": item["link"],
                    "created_at": item["created_at"]
                })

    # Clean and cap
    updated_news_list = updated_news_list[:150]
    existing_releases = [r for r in existing_releases if r.get("title") and r.get("title").lower() not in ["none", "null"]][:60]
    existing_concerts = existing_concerts[:50]

    save_json(NEWS_FILE, updated_news_list)
    save_json(RELEASES_FILE, existing_releases)
    save_json(CONCERTS_FILE, existing_concerts)

    meta = {
        "last_harvest": datetime.now(timezone.utc).isoformat(),
        "total_news": len(updated_news_list),
        "total_releases": len(existing_releases),
        "total_concerts": len(existing_concerts),
        "new_added": new_articles_count
    }
    save_json(META_FILE, meta)

    print("\n" + "=" * 60, flush=True)
    print(f"✨ HØST FULDFØRT!", flush=True)
    print(f"   • Nye artikler tilføjet: {new_articles_count}", flush=True)
    print(f"   • Total nyheder i arkiv: {len(updated_news_list)}", flush=True)
    print(f"   • Total udgivelser på radaren: {len(existing_releases)}", flush=True)
    print(f"   • Total DK koncerter: {len(existing_concerts)}", flush=True)
    print("=" * 60, flush=True)

    # Optional Git auto-commit and push
    if git_push:
        print("\n🚀 Git push aktiveret – committer nye data...", flush=True)
        try:
            repo_dir = os.path.dirname(os.path.dirname(__file__))
            subprocess.run(["git", "add", "data/"], cwd=repo_dir, check=True)
            commit_msg = f"Auto-harvest: {new_articles_count} nye opdateringer ({datetime.now().strftime('%Y-%m-%d %H:%M')})"
            subprocess.run(["git", "commit", "-m", commit_msg], cwd=repo_dir, check=False)
            subprocess.run(["git", "push"], cwd=repo_dir, check=True)
            print("✓ Ændringer pushet til GitHub! Vercel redeployer automatisk.", flush=True)
        except Exception as err:
            print(f"[!] Git push advarsel: {err}", flush=True)

if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Kultnyt Feed Harvester")
    parser.add_argument("--limit", type=int, default=4, help="Max artikler pr. feed (default: 4)")
    parser.add_argument("--skip-ai", action="store_true", help="Spring Ollama over og brug hurtig regel-ekstraktion")
    parser.add_argument("--git-push", action="store_true", help="Commit og push data/ til git efter kørsel")
    args = parser.parse_args()

    run_harvest(limit_per_feed=args.limit, skip_ai=args.skip_ai, git_push=args.git_push)
