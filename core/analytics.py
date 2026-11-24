"""Step tracking: devices, IP addresses and every meaningful action of each traveller."""
import ipaddress
import json
import re
import uuid

from django.conf import settings
from django.db.models import F
from django.http import HttpResponseBadRequest, JsonResponse
from django.views.decorators.csrf import csrf_exempt
from django.views.decorators.http import require_POST

from .models import Device, DeviceIP, Event, Journey

KINDS = {
    "visit", "enter", "join", "lang", "preview", "book", "fly", "land", "city", "place", "tab",
    "season", "tod", "music", "song_add", "upload", "memory", "postcard", "photo", "passport",
    "globe", "share", "3d", "leave", "adhan", "song_stamp", "status_copy", "film", "gift", "gift_send",
    "create", "plan", "chat", "propose", "ready", "invite", "album", "tour", "zen", "cycle",
}
MAX_EVENTS = 40


def client_ip(request):
    ip = request.META.get("REMOTE_ADDR", "")
    if settings.WORLDLIVE_TRUST_PROXY:
        fwd = request.META.get("HTTP_X_FORWARDED_FOR", "").split(",")[0].strip()
        ip = fwd or ip
    try:
        return str(ipaddress.ip_address(ip))
    except ValueError:
        return None


def parse_ua(ua):
    """Tiny dependency-free UA parser — good enough for a dashboard."""
    u = ua or ""
    kind = "tablet" if re.search(r"iPad|Tablet|(Android(?!.*Mobile))", u) else "mobile" if re.search(r"Mobi|iPhone|Android", u) else "desktop"
    os_ = ("iOS " + re.search(r"OS (\d+)", u).group(1) if re.search(r"iPhone|iPad", u) and re.search(r"OS (\d+)", u)
           else "Android " + m.group(1) if (m := re.search(r"Android (\d+)", u))
           else "Windows" if "Windows" in u else "macOS" if "Mac OS X" in u else "ChromeOS" if "CrOS" in u
           else "Linux" if "Linux" in u else "—")
    for name, rx in (("Edge", r"Edg/(\d+)"), ("Opera", r"OPR/(\d+)"), ("Yandex", r"YaBrowser/(\d+)"),
                     ("Samsung", r"SamsungBrowser/(\d+)"), ("Chrome", r"(?:Chrome|CriOS)/(\d+)"),
                     ("Firefox", r"(?:Firefox|FxiOS)/(\d+)"), ("Safari", r"Version/(\d+).*Safari")):
        if m := re.search(rx, u):
            return kind, os_, f"{name} {m.group(1)}"
    return kind, os_, "—"


def _clean_data(d):
    if not isinstance(d, dict):
        return {}
    return {str(k)[:24]: (v[:200] if isinstance(v, str) else v) for k, v in list(d.items())[:12]
            if isinstance(v, (str, int, float, bool))}


def _s(v, n):
    return str(v or "")[:n]


@csrf_exempt  # sendBeacon cannot carry the CSRF header; this endpoint only appends analytics rows
@require_POST
def track(request):
    try:
        d = json.loads(request.body or b"{}")
    except ValueError:
        return HttpResponseBadRequest("json")
    try:
        did = str(uuid.UUID(str(d.get("did"))))
    except ValueError:
        return HttpResponseBadRequest("did")
    ip = client_ip(request)
    ua = request.META.get("HTTP_USER_AGENT", "")[:400]
    kind, os_, browser = parse_ua(ua)
    journey = Journey.objects.filter(code=_s(d.get("journey"), 8).upper()).first() if d.get("journey") else None

    dev, _ = Device.objects.get_or_create(did=did)
    dev.user_agent, dev.kind, dev.os, dev.browser = ua, kind, os_, browser
    dev.screen, dev.lang, dev.tz = _s(d.get("screen"), 20), _s(d.get("lang"), 12), _s(d.get("tz"), 60)
    if journey:
        dev.journey = journey
    if d.get("role") in ("a", "b"):
        dev.role = d["role"]
    if d.get("name"):
        dev.name = " ".join(str(d["name"]).split())[:40]
    dev.last_ip = ip
    events = [e for e in (d.get("events") or [])[:MAX_EVENTS] if isinstance(e, dict) and e.get("k") in KINDS]
    dev.events = F("events") + len(events)
    dev.save()
    if ip:
        n = DeviceIP.objects.filter(device=dev, ip=ip).update(hits=F("hits") + 1)
        if not n:
            DeviceIP.objects.create(device=dev, ip=ip)
    Event.objects.bulk_create([
        Event(device=dev, journey=journey, kind=e["k"], city=_s(e.get("city"), 40), place=_s(e.get("place"), 80),
              data=_clean_data(e.get("d")),
              ip=ip)
        for e in events])
    return JsonResponse({"ok": True, "n": len(events)})
