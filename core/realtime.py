"""Real-time layer: one WebSocket group per journey.

The server pushes every change (new chat message, a new version of the shared state, who is online)
the moment it happens; clients relay small ephemeral signals to each other (typing…, floating
reactions). HTTP polling stays as a quiet fallback, so nothing breaks if a socket drops.
"""
import time

from asgiref.sync import async_to_sync, sync_to_async
from channels.generic.websocket import AsyncJsonWebsocketConsumer
from channels.layers import get_channel_layer

from .models import Journey

RELAY = {"typing", "react", "look"}          # client → everyone else in the journey, never stored
REACTIONS = {"❤️", "😍", "✨", "😂", "👏", "🥹", "🔥", "🎉"}


def group(code):
    return "j_" + code.upper()


def notify(code, payload):
    """Push `payload` to every socket of a journey. Safe to call from sync views; never raises."""
    layer = get_channel_layer()
    if not layer:
        return
    try:
        async_to_sync(layer.group_send)(group(code), {"type": "push", "p": payload})
    except Exception:  # a push must never break the request that caused it
        pass


@sync_to_async
def _journey_exists(code):
    return Journey.objects.filter(code=code).exists()


class JourneyConsumer(AsyncJsonWebsocketConsumer):
    async def connect(self):
        self.code = self.scope["url_route"]["kwargs"]["code"].upper()
        qs = dict(p.split("=", 1) for p in self.scope.get("query_string", b"").decode().split("&") if "=" in p)
        self.mid = qs.get("mid", "")[:16]
        if not await _journey_exists(self.code):
            await self.close(code=4404)
            return
        self.last = 0.0
        await self.channel_layer.group_add(group(self.code), self.channel_name)
        await self.accept()
        await self._everyone({"t": "presence", "mid": self.mid, "on": True})

    async def disconnect(self, close_code):
        if getattr(self, "code", None):
            await self._everyone({"t": "presence", "mid": self.mid, "on": False})
            await self.channel_layer.group_discard(group(self.code), self.channel_name)

    async def receive_json(self, c, **kw):
        t = c.get("t") if isinstance(c, dict) else None
        if t == "ping":
            return await self.send_json({"t": "pong"})
        if t == "hello":          # a socket that just joined asks the others to say they're here
            return await self._everyone({"t": "presence", "mid": self.mid, "on": True, "hello": True}, skip_self=True)
        if t not in RELAY:
            return
        now = time.monotonic()
        if now - self.last < 0.25:      # flood guard
            return
        self.last = now
        out = {"t": t, "mid": self.mid, "name": str(c.get("name") or "")[:40]}
        if t == "react":
            if c.get("e") not in REACTIONS:
                return
            out["e"] = c["e"]
        if t == "look":                  # which place someone is looking at, for "Aziz is looking at …"
            out["place"] = str(c.get("place") or "")[:80]
        await self._everyone(out, skip_self=True)

    async def _everyone(self, payload, skip_self=False):
        await self.channel_layer.group_send(group(self.code), {"type": "push", "p": payload,
                                                               "skip": self.channel_name if skip_self else None})

    async def push(self, event):
        if event.get("skip") and event["skip"] == self.channel_name:
            return
        await self.send_json(event["p"])
