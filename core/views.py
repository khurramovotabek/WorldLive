import json
import re
import urllib.parse
import urllib.request
from pathlib import Path

from django.conf import settings
from django.core.cache import cache
from django.db import IntegrityError, models
from django.http import HttpResponse, HttpResponseBadRequest, HttpResponseRedirect, JsonResponse
from django.shortcuts import get_object_or_404, render
from django.views.decorators.csrf import ensure_csrf_cookie
from django.views.decorators.http import require_GET, require_http_methods, require_POST

from .models import ChatMessage, Journey, Memory, Stamp, Track

AUDIO_EXT = {".mp3", ".ogg", ".oga", ".m4a", ".aac", ".wav", ".flac", ".opus", ".webm"}


@ensure_csrf_cookie
def index(request, code=None):
    # /j/<code> is the invite link a traveller sends to friends (Telegram, WhatsApp, …)
    invite = None
    if code:
        j = Journey.objects.filter(code=code.upper()).first()
        if j:
            invite = {"code": j.code, "host": j.traveler_a, "n": len(j.state.get("party") or []) or 1}
    return render(request, "index.html", {"has_3d": bool(settings.GOOGLE_MAPS_API_KEY), "invite": invite})


def _body(request):
    try:
        return json.loads(request.body or b"{}")
    except ValueError:
        return {}


def _clean_name(v):
    return " ".join(str(v or "").split())[:40]


@require_GET
def config(request):
    # Key is meant for browser use: restrict it by HTTP referrer in Google Cloud console.
    return JsonResponse({"googleKey": settings.GOOGLE_MAPS_API_KEY or None})


@require_POST
def journey_create(request):
    d = _body(request)
    a = _clean_name(d.get("a"))
    if not a:
        return HttpResponseBadRequest("name required")
    j = Journey.objects.create(traveler_a=a, traveler_b=_clean_name(d.get("b")),
                               lang=(d.get("lang") or "uz")[:2], state=d.get("state") or {})
    return JsonResponse(j.as_dict(), status=201)


@require_http_methods(["GET", "POST"])
def journey_detail(request, code):
    j = get_object_or_404(Journey, code=code.upper())
    if request.method == "GET":
        since = request.GET.get("v")
        if since is not None and since.isdigit() and int(since) >= j.version:
            return JsonResponse({"version": j.version, "unchanged": True})
        return JsonResponse(j.as_dict())
    d = _body(request)
    if "b" in d and _clean_name(d["b"]):
        j.traveler_b = _clean_name(d["b"])
    if isinstance(d.get("state"), dict):
        j.state = {**j.state, **d["state"]}
    j.version += 1
    j.save()
    return JsonResponse({"version": j.version, "state": j.state, "b": j.traveler_b})


@require_POST
def stamp_add(request, code):
    j = get_object_or_404(Journey, code=code.upper())
    d = _body(request)
    try:
        Stamp.objects.create(journey=j, city=str(d.get("city", ""))[:40],
                             country=str(d.get("country", ""))[:2],
                             flight_no=str(d.get("flight", ""))[:12])
        j.version += 1
        j.save(update_fields=["version", "updated"])
    except IntegrityError:
        pass
    return JsonResponse({"stamps": [s.as_dict() for s in j.stamps.all()]})


@require_POST
def memory_add(request, code):
    j = get_object_or_404(Journey, code=code.upper())
    d = _body(request)
    text = str(d.get("text", "")).strip()[:2000]
    if not text:
        return HttpResponseBadRequest("text required")
    m = Memory.objects.create(journey=j, kind=d.get("kind") if d.get("kind") in ("note", "photo", "postcard", "gift") else "note",
                              city=str(d.get("city", ""))[:40], place=str(d.get("place", ""))[:120],
                              author=_clean_name(d.get("author")), text=text,
                              open_on=d.get("open_on") or None)
    j.version += 1
    j.save(update_fields=["version", "updated"])
    return JsonResponse(m.as_dict(), status=201)


@require_http_methods(["GET", "POST"])
def tracks(request, code):
    j = get_object_or_404(Journey, code=code.upper())
    if request.method == "GET":
        return JsonResponse({"tracks": [t.as_dict() for t in j.tracks.all()]})
    if (request.content_type or "").startswith("application/json"):
        return _add_spotify(j, _body(request))
    f = request.FILES.get("file")
    if not f:
        return HttpResponseBadRequest("file required")
    ext = Path(f.name).suffix.lower()
    if ext not in AUDIO_EXT or not (f.content_type or "").startswith(("audio/", "video/webm", "application/octet-stream")):
        return HttpResponseBadRequest("audio files only")
    if f.size > settings.WORLDLIVE_MAX_TRACK_MB * 1024 * 1024:
        return HttpResponseBadRequest("file too large")
    season = request.POST.get("season", "any")
    t = Track.objects.create(
        journey=j, file=f,
        title=(request.POST.get("title") or Path(f.name).stem)[:120],
        artist=request.POST.get("artist", "")[:120],
        city=request.POST.get("city", "any")[:40] or "any",
        season=season if season in dict(Track.SEASONS) else "any")
    return JsonResponse(t.as_dict(), status=201)


@require_POST
def track_delete(request, code, tid):
    t = get_object_or_404(Track, id=tid, journey__code=code.upper())
    if t.file:
        t.file.delete(save=False)
    t.delete()
    return JsonResponse({"ok": True})


SP_ID = re.compile(r"^[A-Za-z0-9]{22}$")
SP_URL = re.compile(r"^https://open\.spotify\.com/(?:intl-[a-z-]+/)?track/([A-Za-z0-9]{22})(?:[/?#].*)?$")


def _sp_id(raw):
    s = str(raw or "").strip()
    if SP_ID.match(s):
        return s
    m = SP_URL.match(s) or re.match(r"^spotify:track:([A-Za-z0-9]{22})$", s)
    return m.group(1) if m else None


def sp_oembed(tid):
    """Ask Spotify itself whether the track exists; returns its title or None."""
    url = "https://open.spotify.com/oembed?url=" + urllib.parse.quote(f"https://open.spotify.com/track/{tid}")
    try:
        with urllib.request.urlopen(urllib.request.Request(url, headers={"User-Agent": "WorldLive/1.0"}), timeout=6) as r:
            return (json.load(r).get("title") or "")[:120]
    except Exception:
        return None


_PREVIEW_CC = re.compile(r"^[A-Z]{2}$")


def preview(request, track_id):
    """Redirect to the current Apple Music 30-second preview for a catalogue track.

    Preview URLs on Apple's CDN can rotate, so we resolve them through the public iTunes lookup
    API and cache the answer. The browser then streams the audio straight from Apple (CORS-enabled),
    which lets WorldLive control volume, crossfades and the visualiser itself."""
    cc = (request.GET.get("c") or "US").upper()
    if not _PREVIEW_CC.match(cc):
        cc = "US"
    key = f"pv:{track_id}:{cc}"
    url = cache.get(key)
    if url is None:
        try:
            q = urllib.parse.urlencode({"id": track_id, "country": cc, "entity": "song"})
            with urllib.request.urlopen(urllib.request.Request("https://itunes.apple.com/lookup?" + q, headers={"User-Agent": "WorldLive/1.0"}), timeout=6) as r:
                res = json.load(r).get("results") or []
            url = next((x.get("previewUrl") for x in res if x.get("previewUrl")), "")
        except Exception:
            return HttpResponse(status=502)
        cache.set(key, url, 6 * 3600 if url else 600)
    if not url or not url.startswith("https://audio-ssl.itunes.apple.com/"):
        return HttpResponse(status=404)
    resp = HttpResponseRedirect(url)
    resp["Cache-Control"] = "public, max-age=3600"
    return resp


def _add_spotify(j, d):
    tid = _sp_id(d.get("spotify"))
    if not tid:
        return HttpResponseBadRequest("not a Spotify track link")
    # the same Spotify track twice in one journey → return the one already there (no duplicates)
    existing = j.tracks.filter(sp_id=tid).first()
    if existing:
        return JsonResponse({**existing.as_dict(), "dup": True}, status=200)
    title = sp_oembed(tid)
    if title is None:
        return HttpResponseBadRequest("track not found")
    season = d.get("season", "any")
    t = Track.objects.create(journey=j, sp_id=tid, title=title or tid, artist=str(d.get("artist") or "Spotify")[:120],
                             city=str(d.get("city") or "any")[:40],
                             season=season if season in dict(Track.SEASONS) else "any")
    return JsonResponse(t.as_dict(), status=201)


# ----------------------------------------------------------------------------- traveller portraits
# Optional, consented portraits for the travel party. Stored under an unguessable name, used only
# inside this journey (name tags, postcards, film) and deletable at any time.
AVATAR_TYPES = {"image/jpeg": ".jpg", "image/png": ".png", "image/webp": ".webp"}


@require_POST
def avatar(request, code):
    import uuid

    from django.core.files.storage import default_storage
    j = get_object_or_404(Journey, code=code.upper())
    f = request.FILES.get("file")
    if not f or request.POST.get("consent") != "1":
        return HttpResponseBadRequest("file and consent required")
    ext = AVATAR_TYPES.get((f.content_type or "").lower())
    if not ext or f.size > 3 * 1024 * 1024:
        return HttpResponseBadRequest("jpeg/png/webp up to 3 MB")
    head = f.read(12); f.seek(0)
    if not (head.startswith(b"\xff\xd8") or head.startswith(b"\x89PNG") or head[8:12] == b"WEBP"):
        return HttpResponseBadRequest("not an image")
    name = default_storage.save(f"avatars/{j.code}/{uuid.uuid4().hex}{ext}", f)
    return JsonResponse({"url": default_storage.url(name)}, status=201)


@require_POST
def avatar_delete(request, code):
    from django.core.files.storage import default_storage
    j = get_object_or_404(Journey, code=code.upper())
    url = str(_body(request).get("url") or "")
    prefix = default_storage.url(f"avatars/{j.code}/")
    if not url.startswith(prefix) or "/" in url[len(prefix):] or ".." in url:
        return HttpResponseBadRequest("bad url")
    default_storage.delete(f"avatars/{j.code}/{url[len(prefix):]}")
    return JsonResponse({"ok": True})



# ----------------------------------------------------------------------------- travelling together
# Members are kept server-side in state["party"] (merged here, never overwritten by a client) so that
# two people joining at the same moment can't erase each other. Each device keeps its member id (mid).
MAX_PARTY = 8


def _member_out(j):
    return {"party": j.state.get("party", []), "started": j.state.get("started"), "version": j.version}


@require_POST
def member(request, code):
    import secrets as _s

    from django.db import transaction
    d = _body(request)
    name = _clean_name(d.get("name"))
    if not name:
        return HttpResponseBadRequest("name required")
    g = "f" if d.get("g") == "f" else "m"
    photo = str(d.get("photo") or "")[:300]
    if photo and not photo.startswith(settings.MEDIA_URL + "avatars/"):
        photo = ""
    with transaction.atomic():
        j = get_object_or_404(Journey.objects.select_for_update(), code=code.upper())
        party = list(j.state.get("party") or [])
        mid = str(d.get("mid") or "")[:16]
        me = next((m for m in party if mid and m.get("id") == mid), None)
        if me:
            me.update({"name": name, "g": g, **({"photo": photo} if photo else {})})
        else:
            if len(party) >= MAX_PARTY:
                return JsonResponse({"error": "full"}, status=409)
            mid = _s.token_urlsafe(9)[:12]
            party.append({"id": mid, "name": name, "g": g, "photo": photo or None, "ready": bool(d.get("ready")), "host": not party})
            if len(party) == 2 and not j.traveler_b:
                j.traveler_b = name
            ChatMessage.objects.create(journey=j, kind="system", text="join", data={"name": name})
        j.state = {**j.state, "party": party}
        j.version += 1
        j.save(update_fields=["state", "version", "traveler_b", "updated"])
    return JsonResponse({"mid": mid, **_member_out(j)})


@require_POST
def member_ready(request, code):
    from django.db import transaction
    d = _body(request)
    with transaction.atomic():
        j = get_object_or_404(Journey.objects.select_for_update(), code=code.upper())
        party = list(j.state.get("party") or [])
        me = next((m for m in party if m.get("id") == d.get("mid")), None)
        if not me:
            return HttpResponseBadRequest("unknown member")
        me["ready"] = bool(d.get("ready", True))
        state = {**j.state, "party": party}
        # the journey starts once everyone in the party is ready (the host may also start alone)
        if all(m.get("ready") for m in party) or (d.get("force") and me.get("host")):
            state["started"] = state.get("started") or int(__import__("time").time() * 1000)
        j.state = state
        j.version += 1
        j.save(update_fields=["state", "version", "updated"])
    return JsonResponse(_member_out(j))


@require_http_methods(["GET", "POST"])
def chat(request, code):
    j = get_object_or_404(Journey, code=code.upper())
    if request.method == "GET":
        after = request.GET.get("after", "0")
        qs = j.chat.filter(id__gt=int(after) if after.isdigit() else 0)
        return JsonResponse({"messages": [m.as_dict() for m in qs.order_by("-id")[:80]][::-1]})
    d = _body(request)
    text = str(d.get("text") or "").strip()[:500]
    kind = d.get("kind") if d.get("kind") in ("text", "propose") else "text"
    data = {}
    if kind == "propose":
        data = {"city": str((d.get("data") or {}).get("city") or "")[:40]}
        if not data["city"]:
            return HttpResponseBadRequest("city required")
    elif not text:
        return HttpResponseBadRequest("text required")
    m = ChatMessage.objects.create(journey=j, author=_clean_name(d.get("author")), mid=str(d.get("mid") or "")[:16],
                                   kind=kind, text=text, data=data)
    Journey.objects.filter(pk=j.pk).update(version=models.F("version") + 1)
    return JsonResponse(m.as_dict(), status=201)


# ----------------------------------------------------------------------------- memory album
def _world():
    from functools import lru_cache  # noqa: F401  (kept simple: the file is small and read rarely)
    p = settings.BASE_DIR / "static" / "data" / "world.json"
    return json.loads(p.read_text())


def album(request, code):
    """A printable keepsake of the whole journey: one chapter per city, with notes, gifts and postcards."""
    j = get_object_or_404(Journey, code=code.upper())
    lang = request.GET.get("lang") or j.lang or "uz"
    w = _world()
    cities = {c["key"]: c for c in w["cities"]}
    pick = lambda d: (d or {}).get(lang) or (d or {}).get("en") or ""  # noqa: E731
    mems = list(j.memories.all().order_by("created"))
    chapters = []
    order = [s.city for s in j.stamps.all()] or ([j.state.get("city")] if j.state.get("city") else [])
    for key in order:
        c = cities.get(key)
        if not c:
            continue
        photos = [a["photo"]["src"].replace("/1280px-", "/960px-") for a in c["attractions"] if a.get("photo")][:3]
        stamp = next((s for s in j.stamps.all() if s.city == key), None)
        chapters.append({
            "name": pick(c["name"]), "country": pick(w.get("countries", {}).get(c["country"])), "cc": c["country"],
            "date": stamp.created if stamp else None, "flight": stamp.flight_no if stamp else "",
            "hero": (c.get("photo") or {}).get("src") or (photos[0] if photos else ""), "photos": photos[1:3],
            "places": [pick(a["names"]) for a in c["attractions"][:5]],
            "mems": [m for m in mems if m.city == key and not (m.open_on and m.open_on > __import__("datetime").date.today())],
        })
    party = j.state.get("party") or [{"name": j.traveler_a}] + ([{"name": j.traveler_b}] if j.traveler_b else [])
    T = {
        "uz": {"t": "Bizning sayohatimiz", "cities": "shahar", "countries": "davlat", "km": "km", "mems": "xotira", "end": "Davomi bor…", "print": "PDF sifatida saqlash / chop etish", "empty": "Hali shahar yo‘q — birinchi parvozdan keyin albom to‘ladi."},
        "en": {"t": "Our journey", "cities": "cities", "countries": "countries", "km": "km", "mems": "memories", "end": "To be continued…", "print": "Save as PDF / print", "empty": "No cities yet — the album fills up after your first flight."},
        "ru": {"t": "Наше путешествие", "cities": "городов", "countries": "стран", "km": "км", "mems": "воспоминаний", "end": "Продолжение следует…", "print": "Сохранить в PDF / печать", "empty": "Пока нет городов — альбом наполнится после первого перелёта."},
    }.get(lang, {})
    return render(request, "album.html", {
        "j": j, "party": party, "chapters": chapters, "T": T, "lang": lang,
        "stats": {"cities": len(chapters), "countries": len({c["cc"] for c in chapters}), "km": j.state.get("km", 0), "mems": len(mems)},
    })
