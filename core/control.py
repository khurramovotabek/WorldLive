"""WorldLive Control — staff-only dashboard: couples, routes, devices, IPs and every step."""
from collections import Counter
from datetime import timedelta

from django.contrib.admin.views.decorators import staff_member_required
from django.core.paginator import Paginator
from django.db.models import Count, Max, Q
from django.db.models.functions import TruncDate
from django.http import JsonResponse
from django.shortcuts import get_object_or_404, render
from django.utils import timezone

from .catalog import CITIES
from .models import Device, Event, Journey, Memory, Stamp

CITY = {c["key"]: c for c in CITIES}


def _places():
    import json
    from django.conf import settings
    try:
        w = json.loads((settings.BASE_DIR / "static" / "data" / "world.json").read_text())
        return {a["id"]: a["names"].get("uz") or a["names"].get("en") for c in w["cities"] for a in c["attractions"]}
    except (OSError, ValueError, KeyError):
        return {}


PLACE = _places()
FLAG = lambda cc: "".join(chr(0x1F1E6 + ord(ch) - 65) for ch in (cc or "")[:2].upper()) if cc else ""

KIND = {
    "visit": ("👁", "Saytga kirdi"), "enter": ("✨", "Sayohatni boshladi"), "join": ("🤝", "Kod bilan qo‘shildi"),
    "lang": ("🌐", "Tilni o‘zgartirdi"), "preview": ("🔎", "Shaharni ko‘rdi"), "book": ("🎫", "Chipta oldi"),
    "fly": ("✈️", "Uchdi"), "land": ("🛬", "Qo‘ndi"), "city": ("🏙", "Shaharga kirdi"), "place": ("📍", "Joyni ko‘rdi"),
    "tab": ("🗂", "Bo‘lim"), "season": ("🍂", "Faslni tanladi"), "tod": ("🌗", "Vaqtni tanladi"),
    "music": ("🎵", "Qo‘shiq qo‘ydi"), "song_add": ("➕", "Spotify qo‘shiq qo‘shdi"), "upload": ("⬆️", "Musiqa yukladi"),
    "memory": ("✍️", "Xotira yozdi"), "postcard": ("💌", "Kelajakka otkritka"), "photo": ("📸", "Otkritka yaratdi"),
    "passport": ("🛂", "Pasportni ochdi"), "globe": ("🌍", "Globusga qaytdi"), "share": ("🔗", "Kodni ulashdi"),
    "3d": ("🧭", "3D shahar"), "leave": ("🚪", "Chiqdi"),
    "adhan": ("🕌", "Azonni tingladi"), "song_stamp": ("💿", "Qo‘shiq muhri bosdi"),
    "status_copy": ("💬", "Statusni nusxaladi"), "film": ("🎬", "“Bizning film”ni yaratdi"), "gift": ("🎁", "Sovg‘ani ochdi"), "gift_send": ("💝", "Sovg‘a yubordi"),
}


def city_name(key):
    c = CITY.get(key)
    return f'{FLAG(c["country"])} {c["name"]["uz"]}' if c else (key or "")


def describe(e):
    icon, label = KIND.get(e.kind, ("•", e.kind))
    d = e.data or {}
    bits = []
    if e.kind in ("fly", "book"):
        bits.append(f'{city_name(d.get("from"))} → {city_name(d.get("to"))}')
        if d.get("km"):
            bits.append(f'{int(d["km"]):,} km'.replace(",", " "))
    elif e.city:
        bits.append(city_name(e.city))
    if e.place:
        bits.append(PLACE.get(e.place, e.place))
    if e.kind in ("music", "song_stamp") and d.get("title"):
        bits.append(f'♪ {d.get("artist", "")} — {d["title"]}'.strip(" —"))
    for k in ("season", "tod", "lang", "tab"):
        if d.get(k):
            bits.append(str(d[k]))
    return {"icon": icon, "label": label, "detail": " · ".join(b for b in bits if b)}


def _row(e):
    return {"id": e.id, "t": timezone.localtime(e.created).strftime("%d.%m %H:%M:%S"), "kind": e.kind,
            "who": (e.device.name or "—"), "code": e.journey.code if e.journey else "", "ip": e.ip or "",
            "dev": f"{e.device.kind} · {e.device.os} · {e.device.browser}", **describe(e)}


def _active_since():
    return timezone.now() - timedelta(minutes=2)


def _journey_rows(qs):
    rows = []
    for j in qs:
        st = list(j.stamps.all())
        rows.append({"j": j, "km": int((j.state or {}).get("km") or 0), "stamps": st,
                     "route": [city_name(s.city) for s in st], "devices": j.dev_n, "events": j.ev_n,
                     "last": j.last or j.updated, "live": bool(j.last and j.last > _active_since())})
    return rows


@staff_member_required
def overview(request):
    now = timezone.now()
    today = timezone.localtime(now).replace(hour=0, minute=0, second=0, microsecond=0)
    ev = Event.objects.all()
    days = 14
    start = today - timedelta(days=days - 1)
    per_day = {r["d"]: r for r in ev.filter(created__gte=start).annotate(d=TruncDate("created"))
               .values("d").annotate(n=Count("id"), devs=Count("device", distinct=True)).order_by()}
    series = []
    for i in range(days):
        d = (start + timedelta(days=i)).date()
        r = per_day.get(d, {})
        series.append({"d": d.strftime("%d.%m"), "devs": r.get("devs", 0), "n": r.get("n", 0)})
    peak = max([s["devs"] for s in series] + [1])
    for s in series:
        s["h"] = round(s["devs"] / peak * 100, 1)

    top_cities = [{"name": city_name(r["city"]), "n": r["n"]}
                  for r in ev.filter(kind="city").values("city").annotate(n=Count("id")).order_by("-n")[:8]]
    cmax = max([c["n"] for c in top_cities] + [1])
    for c in top_cities:
        c["w"] = round(c["n"] / cmax * 100, 1)

    songs = Counter()
    for d in ev.filter(kind="music").values_list("data", flat=True)[:5000]:
        if d and d.get("title") and d.get("src") != "gen":
            songs[(d.get("artist", ""), d["title"])] += 1

    dev = Device.objects.all()
    journeys = (Journey.objects.annotate(dev_n=Count("devices", distinct=True), ev_n=Count("log", distinct=True), last=Max("devices__last_seen"))
                .prefetch_related("stamps").order_by("-updated")[:25])
    kms = [int((s or {}).get("km") or 0) for s in Journey.objects.values_list("state", flat=True)]
    ctx = {
        "kpi": {
            "live": dev.filter(last_seen__gte=_active_since()).count(),
            "devices": dev.count(),
            "today": dev.filter(last_seen__gte=today).count(),
            "couples": Journey.objects.exclude(traveler_b="").count(),
            "journeys": Journey.objects.count(),
            "flights": ev.filter(kind="land").count(),
            "km": f"{sum(kms):,}".replace(",", " "),
            "steps_today": ev.filter(created__gte=today).count(),
        },
        "series": series, "peak": peak, "top_cities": top_cities,
        "top_songs": [{"artist": a, "title": t, "n": n} for (a, t), n in songs.most_common(8)],
        "kinds": dev.values("kind").annotate(n=Count("id")).order_by("-n"),  # explicit order_by clears Meta ordering
        "browsers": dev.values("browser").annotate(n=Count("id")).order_by("-n")[:6],
        "couples": _journey_rows(journeys),
        "feed": [_row(e) for e in ev.select_related("device", "journey")[:40]],
        "nav": "overview",
    }
    return render(request, "control/overview.html", ctx)


@staff_member_required
def journey(request, code):
    j = get_object_or_404(Journey, code=code.upper())
    devices = j.devices.prefetch_related("ips").all()
    events = j.log.select_related("device", "journey")
    kind = request.GET.get("kind")
    if kind:
        events = events.filter(kind=kind)
    page = Paginator(events, 200).get_page(request.GET.get("page"))
    stamps = list(j.stamps.all())
    visited = Counter(j.log.filter(kind="place").values_list("city", "place"))
    ctx = {"j": j, "km": int((j.state or {}).get("km") or 0), "devices": devices, "stamps": stamps,
           "route": [{"name": city_name(s.city), "date": s.created, "flight": s.flight_no} for s in stamps],
           "places": [{"city": city_name(c), "place": PLACE.get(p, p), "n": n} for (c, p), n in visited.most_common(30)],
           "memories": j.memories.all()[:50], "tracks": j.tracks.all(),
           "page": page, "rows": [_row(e) for e in page], "kind": kind or "", "kinds": KIND,
           "live": devices.filter(last_seen__gte=_active_since()).exists(), "nav": "couples"}
    return render(request, "control/journey.html", ctx)


@staff_member_required
def couples(request):
    q = request.GET.get("q", "").strip()
    qs = Journey.objects.annotate(dev_n=Count("devices", distinct=True), ev_n=Count("log", distinct=True), last=Max("devices__last_seen")).prefetch_related("stamps")
    if q:
        qs = qs.filter(Q(traveler_a__icontains=q) | Q(traveler_b__icontains=q) | Q(code__iexact=q) | Q(devices__ips__ip__startswith=q)).distinct()
    page = Paginator(qs.order_by("-updated"), 50).get_page(request.GET.get("page"))
    return render(request, "control/couples.html", {"rows": _journey_rows(page), "page": page, "q": q, "nav": "couples"})


@staff_member_required
def devices(request):
    q = request.GET.get("q", "").strip()
    qs = Device.objects.select_related("journey").prefetch_related("ips")
    if q:
        qs = qs.filter(Q(name__icontains=q) | Q(ips__ip__startswith=q) | Q(browser__icontains=q) | Q(os__icontains=q)
                       | Q(journey__code__iexact=q) | Q(kind=q)).distinct()
    page = Paginator(qs, 60).get_page(request.GET.get("page"))
    return render(request, "control/devices.html", {"page": page, "q": q, "live_since": _active_since(), "nav": "devices"})


@staff_member_required
def events(request):
    qs = Event.objects.select_related("device", "journey")
    kind, q = request.GET.get("kind", ""), request.GET.get("q", "").strip()
    if kind:
        qs = qs.filter(kind=kind)
    if q:
        qs = qs.filter(Q(device__name__icontains=q) | Q(ip__startswith=q) | Q(journey__code__iexact=q) | Q(city__icontains=q) | Q(place__icontains=q))
    page = Paginator(qs, 100).get_page(request.GET.get("page"))
    return render(request, "control/events.html", {"page": page, "rows": [_row(e) for e in page], "kind": kind, "q": q, "kinds": KIND, "nav": "events"})


@staff_member_required
def live(request):
    since = int(request.GET.get("since") or 0)
    rows = [_row(e) for e in Event.objects.select_related("device", "journey").filter(id__gt=since)[:40]]
    return JsonResponse({"rows": rows, "live": Device.objects.filter(last_seen__gte=_active_since()).count()})


# ----------------------------------------------------------------------------- memories
@staff_member_required
def memories(request):
    qs = Memory.objects.select_related("journey")
    kind, q = request.GET.get("kind", ""), request.GET.get("q", "").strip()
    if kind:
        qs = qs.filter(kind=kind)
    if q:
        qs = qs.filter(Q(text__icontains=q) | Q(author__icontains=q) | Q(city__icontains=q) | Q(place__icontains=q) | Q(journey__code__iexact=q)
                       | Q(journey__traveler_a__icontains=q) | Q(journey__traveler_b__icontains=q))
    page = Paginator(qs, 48).get_page(request.GET.get("page"))
    rows = [{"m": m, "city": city_name(m.city), "place": PLACE.get(m.place, m.place)} for m in page]
    stats = {"all": Memory.objects.count(), "kinds": dict(Memory.objects.values_list("kind").annotate(n=Count("id")).order_by()),
             "couples": Memory.objects.values("journey").distinct().count()}
    return render(request, "control/memories.html", {"page": page, "rows": rows, "kind": kind, "q": q, "stats": stats, "nav": "memories"})


# ----------------------------------------------------------------------------- analytics
FUNNEL = [("visit", "Saytga kirdi"), ("enter", "Sayohatni boshladi"), ("join", "Juftlik qo‘shildi"), ("book", "Chipta oldi"),
          ("land", "Shaharga qo‘ndi"), ("place", "Joylarni ko‘rdi"), ("memory", "Xotira yozdi"), ("film", "Film yaratdi")]


def _pct(a, b):
    return round(a / b * 100, 1) if b else 0.0


@staff_member_required
def analytics(request):
    days = max(1, min(90, int(request.GET.get("days") or 30)))
    since = timezone.now() - timedelta(days=days)
    ev = Event.objects.filter(created__gte=since)
    # funnel — unique devices that reached each step
    reached = dict(ev.values_list("kind").annotate(n=Count("device", distinct=True)).order_by())
    top = max([reached.get("visit", 0), reached.get("enter", 0), 1])
    funnel, prev = [], None
    for k, label in FUNNEL:
        n = reached.get(k, 0)
        funnel.append({"k": k, "label": label, "n": n, "w": _pct(n, top), "conv": _pct(n, prev) if prev else 100.0})
        prev = n or prev
    # activity by local hour (0–23) and by weekday
    hours, wdays = [0] * 24, [0] * 7
    sessions = {}
    for dev_id, created in ev.values_list("device_id", "created").order_by("device_id", "created").iterator():
        lt = timezone.localtime(created)
        hours[lt.hour] += 1; wdays[lt.weekday()] += 1
        # a session = steps of one device with no gap longer than 30 minutes
        s = sessions.setdefault(dev_id, [])
        if s and (created - s[-1][1]).total_seconds() <= 1800:
            s[-1][1] = created; s[-1][2] += 1
        else:
            s.append([created, created, 1])
    hmax, wmax = max(hours + [1]), max(wdays + [1])
    durs = sorted((b - a).total_seconds() for ss in sessions.values() for a, b, _ in ss)
    steps = [n for ss in sessions.values() for *_, n in ss]
    med = durs[len(durs) // 2] if durs else 0
    buckets = [("< 1 daq", 0, 60), ("1–5 daq", 60, 300), ("5–15 daq", 300, 900), ("15–30 daq", 900, 1800), ("30+ daq", 1800, 10 ** 9)]
    bdist = [{"label": l, "n": sum(1 for d in durs if lo <= d < hi)} for l, lo, hi in buckets]
    bmax = max([b["n"] for b in bdist] + [1])
    for b in bdist:
        b["w"] = _pct(b["n"], bmax)
    # retention: devices seen on 2+ different days
    days_per_dev = Counter()
    for dev_id, d in ev.annotate(d=TruncDate("created")).values_list("device_id", "d").distinct():
        days_per_dev[dev_id] += 1
    devs = len(days_per_dev)
    places = Counter(ev.filter(kind="place").values_list("place", flat=True))
    pmax = max(list(places.values()) + [1])
    langs = dict(ev.filter(kind="lang").values_list("data__to").annotate(n=Count("id")).order_by()) if False else {}
    ctx = {
        "days": days, "funnel": funnel,
        "hours": [{"h": f"{i:02d}", "n": n, "p": _pct(n, hmax)} for i, n in enumerate(hours)],
        "wdays": [{"d": d, "n": n, "p": _pct(n, wmax)} for d, n in zip(["Du", "Se", "Ch", "Pa", "Ju", "Sh", "Ya"], wdays)],
        "sess": {"n": len(durs), "median": f"{int(med // 60)} daq {int(med % 60)} s", "avg_steps": round(sum(steps) / len(steps), 1) if steps else 0,
                 "per_dev": round(len(durs) / devs, 2) if devs else 0},
        "bdist": bdist,
        "ret": {"devs": devs, "back": sum(1 for v in days_per_dev.values() if v >= 2), "pct": _pct(sum(1 for v in days_per_dev.values() if v >= 2), devs)},
        "places": [{"name": PLACE.get(p, p), "n": n, "w": _pct(n, pmax)} for p, n in places.most_common(12) if p],
        "kinds": [{"k": k, "icon": KIND.get(k, ("•", k))[0], "label": KIND.get(k, ("", k))[1], "n": n}
                  for k, n in sorted(ev.values_list("kind").annotate(n=Count("id")).order_by(), key=lambda x: -x[1])],
        "nav": "analytics",
    }
    return render(request, "control/analytics.html", ctx)


# ----------------------------------------------------------------------------- server
def _meminfo():
    out = {}
    try:
        for line in open("/proc/meminfo"):
            k, v = line.split(":", 1)
            out[k] = int(v.split()[0]) * 1024
    except OSError:
        pass
    return out


def _fmt_bytes(n):
    for u in ("B", "KB", "MB", "GB", "TB"):
        if n < 1024:
            return f"{n:.1f} {u}" if u != "B" else f"{n} B"
        n /= 1024
    return f"{n:.1f} PB"


@staff_member_required
def server(request):
    import os
    import platform
    import shutil
    import sys

    import django
    from django.conf import settings
    from django.db import connection

    mem = _meminfo()
    total, avail = mem.get("MemTotal", 0), mem.get("MemAvailable", 0)
    du = shutil.disk_usage(settings.BASE_DIR)
    try:
        up = float(open("/proc/uptime").read().split()[0])
    except OSError:
        up = 0
    try:
        load = os.getloadavg()
    except OSError:
        load = (0, 0, 0)
    cpus = os.cpu_count() or 1
    try:
        rss = int(open("/proc/self/status").read().split("VmRSS:")[1].split()[0]) * 1024
    except (OSError, IndexError, ValueError):
        rss = 0
    db = connection.settings_dict
    db_size = 0
    if db["ENGINE"].endswith("sqlite3"):
        try:
            db_size = os.path.getsize(db["NAME"])
        except OSError:
            pass
    elif "postgresql" in db["ENGINE"]:
        with connection.cursor() as c:
            c.execute("SELECT pg_database_size(current_database())")
            db_size = c.fetchone()[0]
    media = 0
    for root, _, files in os.walk(settings.MEDIA_ROOT) if getattr(settings, "MEDIA_ROOT", "") else []:
        media += sum(os.path.getsize(os.path.join(root, f)) for f in files if os.path.exists(os.path.join(root, f)))
    now = timezone.now()
    rate = [{"h": timezone.localtime(now - timedelta(hours=23 - i)).strftime("%H"), "n": 0} for i in range(24)]
    for created in Event.objects.filter(created__gte=now - timedelta(hours=24)).values_list("created", flat=True):
        idx = 23 - int((now - created).total_seconds() // 3600)
        if 0 <= idx < 24:
            rate[idx]["n"] += 1
    rmax = max([r["n"] for r in rate] + [1])
    for r in rate:
        r["p"] = _pct(r["n"], rmax)
    ctx = {
        "sys": {"host": platform.node(), "os": f"{platform.system()} {platform.release()}", "py": sys.version.split()[0], "django": django.get_version(),
                "uptime": f"{int(up // 86400)} kun {int(up % 86400 // 3600)} soat", "cpus": cpus, "debug": settings.DEBUG,
                "db": db["ENGINE"].rsplit(".", 1)[-1], "tz": settings.TIME_ZONE},
        "load": [{"l": l, "v": round(v, 2), "p": min(100, _pct(v, cpus))} for l, v in zip(["1 daq", "5 daq", "15 daq"], load)],
        "mem": {"used": _fmt_bytes(total - avail), "total": _fmt_bytes(total), "p": _pct(total - avail, total)},
        "disk": {"used": _fmt_bytes(du.used), "total": _fmt_bytes(du.total), "free": _fmt_bytes(du.free), "p": _pct(du.used, du.total)},
        "proc": _fmt_bytes(rss), "db_size": _fmt_bytes(db_size), "media": _fmt_bytes(media),
        "counts": [("Sayohatlar", Journey.objects.count()), ("Qurilmalar", Device.objects.count()), ("Qadamlar", Event.objects.count()),
                   ("Xotiralar", Memory.objects.count()), ("Muhrlar", Stamp.objects.count())],
        "rate": rate, "rmax": rmax, "nav": "server",
    }
    return render(request, "control/server.html", ctx)
