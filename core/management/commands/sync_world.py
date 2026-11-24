"""Pull verified coordinates, multilingual extracts and Commons photos from
Wikipedia for every catalog entry and write static/data/world.json.

Usage:  python manage.py sync_world
Runs once (or when the catalog changes); the site itself never calls
Wikipedia at request time, so pages stay fast.
"""
import json
import re
import time
import urllib.parse
import urllib.request
from html import unescape
from pathlib import Path

from django.conf import settings
from django.core.management.base import BaseCommand

from core.catalog import CITIES, COUNTRIES, HERO_ROUTE

UA = "WorldLive/0.1 (educational virtual travel prototype)"
LANGS = ("uz", "ru")


CACHE = Path(__file__).resolve().parents[3] / ".wikicache"


def get(url, params):
    """GET with on-disk cache + polite back-off (Wikimedia rate limits)."""
    import hashlib
    import urllib.error
    full = url + "?" + urllib.parse.urlencode(params)
    CACHE.mkdir(exist_ok=True)
    cf = CACHE / (hashlib.sha1(full.encode()).hexdigest() + ".json")
    if cf.exists():
        return json.loads(cf.read_text())
    for attempt in range(6):
        try:
            req = urllib.request.Request(full, headers={"User-Agent": UA, "Accept-Encoding": "identity"})
            with urllib.request.urlopen(req, timeout=30) as r:
                data = json.load(r)
            cf.write_text(json.dumps(data))
            time.sleep(1.2)
            return data
        except urllib.error.HTTPError as e:
            wait = int(e.headers.get("Retry-After") or 0) or 10 * (attempt + 1)
            print(f"  HTTP {e.code}, waiting {wait}s")
            time.sleep(min(wait, 90))
        except Exception as e:
            print(f"  {e}, retrying")
            time.sleep(5 * (attempt + 1))
    raise RuntimeError(f"failed: {full[:120]}")


def query_all(url, params):
    """Follow MediaWiki `continue` and merge page props (lists are extended)."""
    params = dict(params)
    merged, meta = {}, {"normalized": [], "redirects": []}
    while True:
        data = get(url, params)
        q = data.get("query", {})
        for k in meta:
            for item in q.get(k, []):
                if item not in meta[k]:
                    meta[k].append(item)
        for p in q.get("pages", []):
            cur = merged.setdefault(p.get("title"), {})
            for k, v in p.items():
                if isinstance(v, list):
                    cur.setdefault(k, [])
                    cur[k] += [x for x in v if x not in cur[k]]
                elif k not in cur or cur[k] in (None, ""):
                    cur[k] = v
        if "continue" not in data:
            break
        params.update(data["continue"])
    return {"query": {**meta, "pages": list(merged.values())}}


def chunks(seq, n):
    for i in range(0, len(seq), n):
        yield seq[i:i + n]


def strip_html(s):
    return unescape(re.sub(r"<[^>]+>", "", s or "")).strip()


def short(text, limit=520):
    text = (text or "").strip()
    if len(text) <= limit:
        return text
    cut = text[:limit]
    dot = max(cut.rfind(". "), cut.rfind("。"))
    return cut[: dot + 1] if dot > 200 else cut.rsplit(" ", 1)[0] + "…"


class Command(BaseCommand):
    help = "Sync WorldLive catalog with Wikipedia / Wikimedia Commons"

    def handle(self, *args, **kw):
        titles = []
        for c in CITIES:
            titles.append(c["wiki"])
            titles += [a[0] for a in c["attractions"]]
        titles = list(dict.fromkeys(titles))
        self.stdout.write(f"{len(titles)} articles")

        pages = {}
        for group in chunks(titles, 20):
            data = query_all("https://en.wikipedia.org/w/api.php", {
                "action": "query", "format": "json", "formatversion": 2,
                "redirects": 1, "titles": "|".join(group),
                "prop": "coordinates|pageimages|extracts|info",
                "inprop": "url", "exintro": 1, "explaintext": 1, "exlimit": "max",
                "piprop": "name|thumbnail", "pithumbsize": 1600, "pilimit": "max",
                "colimit": "max", "coprimary": "all",
            })
            for lang in LANGS:  # one langlink query per language keeps responses small
                ld = query_all("https://en.wikipedia.org/w/api.php", {
                    "action": "query", "format": "json", "formatversion": 2,
                    "redirects": 1, "titles": "|".join(group),
                    "prop": "langlinks", "lllang": lang, "lllimit": "max"})
                byt = {p["title"]: p.get("langlinks", []) for p in ld["query"]["pages"]}
                for p in data["query"]["pages"]:
                    p.setdefault("langlinks", []).extend(byt.get(p["title"], []))
            q = data["query"]
            alias = {}
            for n in q.get("normalized", []) + q.get("redirects", []):
                alias[n["to"]] = alias.get(n["from"], n["from"])
            for p in q["pages"]:
                if p.get("missing"):
                    self.stderr.write(f"  MISSING {p['title']}")
                    continue
                src = p["title"]
                while src in alias:
                    src = alias[src]
                ll = {l["lang"]: l["title"] for l in p.get("langlinks", [])}
                co = (p.get("coordinates") or [{}])[0]
                pages[src] = {
                    "title": p["title"], "url": p.get("fullurl"),
                    "lat": co.get("lat"), "lng": co.get("lon"),
                    "extract": {"en": short(p.get("extract"))},
                    "names": {"en": p["title"], **{k: ll[k] for k in LANGS if k in ll}},
                    "image": p.get("pageimage"),
                    "thumb": (p.get("thumbnail") or {}).get("source"),
                }
            time.sleep(0.3)

        # extracts in Uzbek and Russian from their own wikis
        for lang in LANGS:
            want = {v["names"][lang]: k for k, v in pages.items() if lang in v["names"]}
            for group in chunks(list(want), 20):
                data = query_all(f"https://{lang}.wikipedia.org/w/api.php", {
                    "action": "query", "format": "json", "formatversion": 2,
                    "redirects": 1, "titles": "|".join(group), "prop": "extracts",
                    "exintro": 1, "explaintext": 1, "exlimit": "max",
                })
                q = data["query"]
                alias = {n["to"]: n["from"] for n in q.get("normalized", []) + q.get("redirects", [])}
                for p in q["pages"]:
                    t = alias.get(p["title"], p["title"])
                    if t in want and p.get("extract"):
                        pages[want[t]]["extract"][lang] = short(p["extract"])
                time.sleep(0.3)

        # photo authorship + licence from Commons
        files = {v["image"]: k for k, v in pages.items() if v.get("image")}
        for group in chunks(list(files), 15):
            data = get("https://commons.wikimedia.org/w/api.php", {
                "action": "query", "format": "json", "formatversion": 2,
                "titles": "|".join("File:" + f for f in group),
                "prop": "imageinfo", "iiprop": "extmetadata|url", "iiurlwidth": 1280,
            })
            for p in data["query"]["pages"]:
                fname = p["title"].split(":", 1)[1]
                key = files.get(fname) or files.get(fname.replace(" ", "_"))
                if not key or not p.get("imageinfo"):
                    continue
                ii = p["imageinfo"][0]
                md = ii.get("extmetadata", {})
                pages[key]["photo"] = {
                    "src": (ii.get("thumburl") or pages[key]["thumb"] or "").split("?")[0],
                    "page": ii.get("descriptionurl"),
                    "artist": strip_html(md.get("Artist", {}).get("value"))[:80],
                    "license": md.get("LicenseShortName", {}).get("value", ""),
                }
            time.sleep(0.3)

        out_cities = []
        for c in CITIES:
            w = pages.get(c["wiki"], {})
            attractions = []
            for title, cat in c["attractions"]:
                a = pages.get(title)
                if not a or a.get("lat") is None:
                    self.stderr.write(f"  skip (no coords) {title}")
                    continue
                attractions.append({
                    "id": re.sub(r"[^a-z0-9]+", "-", title.lower()).strip("-"),
                    "category": cat, "lat": a["lat"], "lng": a["lng"],
                    "names": a["names"], "extract": a["extract"],
                    "photo": a.get("photo"), "wiki": a["url"],
                })
            lat, lng = w.get("lat"), w.get("lng")
            photo = w.get("photo") or next((a["photo"] for a in attractions if a.get("photo")), None)
            if lat is None and attractions:
                lat, lng = attractions[0]["lat"], attractions[0]["lng"]
            out_cities.append({
                **{k: v for k, v in c.items() if k not in ("attractions", "wiki")},
                "lat": lat, "lng": lng, "extract": w.get("extract", {}),
                "photo": photo, "wiki": w.get("url"),
                "attractions": attractions,
            })

        out = {"countries": COUNTRIES, "cities": out_cities, "hero": HERO_ROUTE,
               "source": "Wikipedia & Wikimedia Commons (CC BY-SA / per-file licence)",
               "synced": time.strftime("%Y-%m-%d")}
        from core import place_text
        # hand-picked Commons photos for places whose article image is missing or duplicated
        ov = json.loads((Path(__file__).resolve().parents[2] / "photo_overrides.json").read_text())
        for c in out["cities"]:
            for a in c["attractions"]:
                if a["id"] in ov:
                    a["photo"] = ov[a["id"]]
        self.stdout.write(f"texts filled from core/place_text.py: {place_text.apply(out)}")
        gaps = place_text.missing(out)
        if gaps:
            self.stdout.write(self.style.WARNING(f"places still missing a language (add them to core/place_text.py): {gaps}"))
        path = Path(settings.BASE_DIR) / "static" / "data" / "world.json"
        path.write_text(json.dumps(out, ensure_ascii=False, separators=(",", ":")))
        n = sum(len(c["attractions"]) for c in out_cities)
        self.stdout.write(self.style.SUCCESS(f"wrote {path} — {len(out_cities)} cities, {n} attractions"))
