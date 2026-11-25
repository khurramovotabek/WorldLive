"""Tiny cache-backed rate limiter for the public API.

WorldLive has no logins in front of most endpoints (the journey code is the key), so every write
endpoint is throttled per client IP. A fixed window per (bucket, ip) in the default cache is enough
for one ASGI process; swap the cache for Redis if the app is ever scaled out.
"""
import time
from functools import wraps

from django.conf import settings
from django.core.cache import cache
from django.http import JsonResponse


def hit(bucket, ident, limit, per):
    """Count one hit; True while the caller is still within `limit` hits per `per` seconds."""
    if not getattr(settings, "WORLDLIVE_RATELIMIT", True):
        return True
    window = int(time.time() // per)
    key = f"rl:{bucket}:{ident}:{window}"
    if cache.add(key, 1, per + 1):
        return True
    try:
        n = cache.incr(key)
    except ValueError:          # expired between add() and incr()
        cache.add(key, 1, per + 1)
        return True
    return n <= limit


def ratelimit(bucket, limit, per=60, methods=("POST",)):
    """Decorator: reply 429 once an IP exceeds `limit` requests per `per` seconds on `methods`."""
    def deco(view):
        @wraps(view)
        def wrapper(request, *a, **kw):
            from .analytics import client_ip   # lazy: analytics itself is throttled
            if request.method in methods and not hit(bucket, client_ip(request) or "?", limit, per):
                r = JsonResponse({"error": "slow down"}, status=429)
                r["Retry-After"] = str(per)
                return r
            return view(request, *a, **kw)
        return wrapper
    return deco
