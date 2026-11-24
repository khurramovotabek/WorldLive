"""Traveller accounts: a unique @username is the login, a 4-digit PIN keeps it yours.

The first time a username is used, a default account is created with the traveller's name, gender
and (optional) photo. From then on, signing in with the same username on any device brings back
the same profile and the journeys it belongs to. The session cookie keeps the device signed in.
"""
import re

from django.contrib.auth.hashers import check_password, make_password
from django.core.cache import cache
from django.http import JsonResponse
from django.views.decorators.http import require_GET, require_POST

from .models import Account, Journey

USERNAME = re.compile(r"^[a-z0-9_.]{3,20}$")
PIN = re.compile(r"^\d{4}$")
RESERVED = {"admin", "control", "worldlive", "welicodev", "support", "root", "system", "api", "null"}
MAX_FAILS = 5          # wrong PINs per username …
LOCK_S = 10 * 60       # … locks it for 10 minutes


def norm(u):
    return str(u or "").strip().lstrip("@").lower()


def current(request):
    aid = request.session.get("acct")
    return Account.objects.filter(pk=aid).first() if aid else None


def _out(a):
    trips = []
    for code, mid in list((a.trips or {}).items())[-12:][::-1]:
        j = Journey.objects.filter(code=code).first()
        if j:
            party = j.state.get("party") or []
            trips.append({"code": code, "mid": mid, "started": bool(j.state.get("started")),
                          "with": [m.get("name") for m in party if m.get("id") != mid][:7],
                          "stamps": j.stamps.count(), "updated": j.updated.isoformat()})
    return {"username": a.username, "name": a.name, "g": a.g, "photo": a.photo or None, "last": a.last_code or None, "trips": trips}


@require_GET
def me(request):
    a = current(request)
    return JsonResponse({"account": _out(a) if a else None})


@require_POST
def check(request):
    from .views import _body
    u = norm(_body(request).get("username"))
    if not USERNAME.match(u):
        return JsonResponse({"ok": False, "why": "format"})
    a = Account.objects.filter(username=u).first()
    if a:
        return JsonResponse({"ok": True, "exists": True, "name": a.name})
    return JsonResponse({"ok": u not in RESERVED, "exists": False, **({"why": "reserved"} if u in RESERVED else {})})


@require_POST
def login(request):
    """Sign in, or create the default account the first time a free username is used."""
    from .views import _body, _clean_name
    d = _body(request)
    u, pin = norm(d.get("username")), str(d.get("pin") or "")
    if not USERNAME.match(u):
        return JsonResponse({"error": "format"}, status=400)
    if not PIN.match(pin):
        return JsonResponse({"error": "pin"}, status=400)
    key = "acct-fail:" + u
    if (cache.get(key) or 0) >= MAX_FAILS:
        return JsonResponse({"error": "locked"}, status=429)
    a = Account.objects.filter(username=u).first()
    if a:
        if not check_password(pin, a.pin):
            cache.set(key, (cache.get(key) or 0) + 1, LOCK_S)
            return JsonResponse({"error": "wrong"}, status=403)
        cache.delete(key)
        created = False
    else:
        if u in RESERVED:
            return JsonResponse({"error": "reserved"}, status=400)
        name = _clean_name(d.get("name"))
        if not name:
            return JsonResponse({"error": "name"}, status=400)
        a = Account.objects.create(username=u, pin=make_password(pin), name=name, g="f" if d.get("g") == "f" else "m")
        created = True
    request.session.cycle_key()
    request.session["acct"] = a.pk
    return JsonResponse({"account": _out(a), "created": created}, status=201 if created else 200)


@require_POST
def update(request):
    """Name / gender / photo edits from the intro card; also called when a member joins a journey."""
    from django.conf import settings

    from .views import _body, _clean_name
    a = current(request)
    if not a:
        return JsonResponse({"error": "auth"}, status=401)
    d = _body(request)
    if _clean_name(d.get("name")):
        a.name = _clean_name(d.get("name"))
    if d.get("g") in ("m", "f"):
        a.g = d["g"]
    photo = str(d.get("photo") or "")
    if photo.startswith(settings.MEDIA_URL + "avatars/"):
        a.photo = photo[:300]
    elif d.get("photo") is False:
        a.photo = ""
    a.save()
    return JsonResponse({"account": _out(a)})


@require_POST
def logout(request):
    request.session.pop("acct", None)
    return JsonResponse({"ok": True})


def link(request, code, mid):
    """Remember that the signed-in account is member `mid` of journey `code`."""
    a = current(request)
    if not a or not mid:
        return None
    trips = dict(a.trips or {})
    trips.pop(code, None)
    trips[code] = mid                      # most recent last
    a.trips, a.last_code = trips, code
    a.save(update_fields=["trips", "last_code", "seen"])
    return a
