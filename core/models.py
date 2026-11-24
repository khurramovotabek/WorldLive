import secrets

from django.db import models


CODE_ALPHABET = "ABCDEFGHJKMNPQRSTUVWXYZ23456789"   # no 0/O/1/I/L — easy to read aloud


def new_code():
    # unique journey id / invite code, e.g. 'K7MQ2XRA' (31^8 ≈ 8.5·10^11 combinations)
    return "".join(secrets.choice(CODE_ALPHABET) for _ in range(8))


class Journey(models.Model):
    """A shared journey of two travellers. Both devices sync through `state`."""
    code = models.CharField(max_length=8, unique=True, default=new_code)
    traveler_a = models.CharField(max_length=40)
    traveler_b = models.CharField(max_length=40, blank=True)
    lang = models.CharField(max_length=2, default="uz")
    state = models.JSONField(default=dict, blank=True)   # city, season, time, weather...
    version = models.PositiveIntegerField(default=0)
    created = models.DateTimeField(auto_now_add=True)
    updated = models.DateTimeField(auto_now=True)

    def as_dict(self):
        return {"code": self.code, "a": self.traveler_a, "b": self.traveler_b,
                "lang": self.lang, "state": self.state, "version": self.version,
                "stamps": [s.as_dict() for s in self.stamps.all()],
                "memories": [m.as_dict() for m in self.memories.all()[:100]],
                "chat_last": (self.chat.order_by("-id").values_list("id", flat=True).first() or 0)}

    def __str__(self):
        return f"{self.code}: {self.traveler_a} & {self.traveler_b}"


class Stamp(models.Model):
    """Digital passport stamp – one per city visited."""
    journey = models.ForeignKey(Journey, related_name="stamps", on_delete=models.CASCADE)
    city = models.CharField(max_length=40)
    country = models.CharField(max_length=2)
    flight_no = models.CharField(max_length=12, blank=True)
    created = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ("journey", "city")
        ordering = ["created"]

    def as_dict(self):
        return {"city": self.city, "country": self.country, "flight": self.flight_no,
                "date": self.created.date().isoformat()}


class Memory(models.Model):
    """A journal entry or postcard written at a place."""
    KIND = [("note", "note"), ("photo", "photo"), ("postcard", "postcard"), ("gift", "gift")]
    journey = models.ForeignKey(Journey, related_name="memories", on_delete=models.CASCADE)
    kind = models.CharField(max_length=10, choices=KIND, default="note")
    city = models.CharField(max_length=40)
    place = models.CharField(max_length=120, blank=True)
    author = models.CharField(max_length=40, blank=True)
    text = models.TextField(max_length=2000, blank=True)
    open_on = models.DateField(null=True, blank=True)   # postcard to the future
    created = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["-created"]

    def as_dict(self):
        return {"id": self.id, "kind": self.kind, "city": self.city, "place": self.place,
                "author": self.author, "text": self.text,
                "open_on": self.open_on.isoformat() if self.open_on else None,
                "date": self.created.isoformat()}


class Track(models.Model):
    """User-uploaded music for the playlist, tagged by city / season / time."""
    SEASONS = [("any", "any"), ("spring", "spring"), ("summer", "summer"),
               ("autumn", "autumn"), ("winter", "winter")]
    journey = models.ForeignKey(Journey, related_name="tracks", null=True, blank=True,
                                on_delete=models.CASCADE)
    title = models.CharField(max_length=120)
    artist = models.CharField(max_length=120, blank=True)
    file = models.FileField(upload_to="tracks/", blank=True)
    sp_id = models.CharField(max_length=22, blank=True)      # Spotify track (embed only, no file stored)
    city = models.CharField(max_length=40, default="any")
    season = models.CharField(max_length=10, choices=SEASONS, default="any")
    created = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["created"]

    def as_dict(self):
        d = {"id": f"u{self.id}", "title": self.title, "artist": self.artist,
             "city": self.city, "season": self.season}
        if self.sp_id:
            return {**d, "kind": "sp", "sp": self.sp_id, "own": True}
        return {**d, "kind": "file", "src": self.file.url}


# =====================================================================================
#  Analytics — what the control dashboard reads. Disclosed to visitors on the intro screen;
#  pruned after WORLDLIVE_ANALYTICS_DAYS by `manage.py prune_analytics`.
# =====================================================================================
class Device(models.Model):
    """One browser / phone, identified by a random id kept in its localStorage."""
    did = models.CharField(max_length=36, unique=True)
    journey = models.ForeignKey(Journey, related_name="devices", null=True, blank=True, on_delete=models.SET_NULL)
    role = models.CharField(max_length=1, blank=True)          # 'a' / 'b'
    name = models.CharField(max_length=40, blank=True)         # traveller name typed on this device
    kind = models.CharField(max_length=10, blank=True)         # mobile / tablet / desktop
    os = models.CharField(max_length=40, blank=True)
    browser = models.CharField(max_length=40, blank=True)
    user_agent = models.CharField(max_length=400, blank=True)
    screen = models.CharField(max_length=20, blank=True)
    lang = models.CharField(max_length=12, blank=True)
    tz = models.CharField(max_length=60, blank=True)
    last_ip = models.GenericIPAddressField(null=True, blank=True)
    events = models.PositiveIntegerField(default=0)
    first_seen = models.DateTimeField(auto_now_add=True)
    last_seen = models.DateTimeField(auto_now=True, db_index=True)

    class Meta:
        ordering = ["-last_seen"]

    def __str__(self):
        return f"{self.name or '—'} · {self.kind} {self.os} {self.browser}"


class DeviceIP(models.Model):
    device = models.ForeignKey(Device, related_name="ips", on_delete=models.CASCADE)
    ip = models.GenericIPAddressField()
    hits = models.PositiveIntegerField(default=1)
    first_seen = models.DateTimeField(auto_now_add=True)
    last_seen = models.DateTimeField(auto_now=True)

    class Meta:
        unique_together = ("device", "ip")
        ordering = ["-last_seen"]


class Event(models.Model):
    """One user step: entered, flew, opened a city, viewed a place, played a song…"""
    device = models.ForeignKey(Device, related_name="log", on_delete=models.CASCADE)
    journey = models.ForeignKey(Journey, related_name="log", null=True, blank=True, on_delete=models.SET_NULL)
    kind = models.CharField(max_length=24, db_index=True)
    city = models.CharField(max_length=40, blank=True)
    place = models.CharField(max_length=80, blank=True)
    data = models.JSONField(default=dict, blank=True)
    ip = models.GenericIPAddressField(null=True, blank=True)
    created = models.DateTimeField(auto_now_add=True, db_index=True)

    class Meta:
        ordering = ["-created"]


class ChatMessage(models.Model):  # kinds: text · propose (a destination) · agree (a vote for it) · system
    """Travellers talk while they travel: plain notes and destination proposals."""
    KIND = [("text", "text"), ("propose", "propose"), ("agree", "agree"), ("system", "system")]
    journey = models.ForeignKey(Journey, related_name="chat", on_delete=models.CASCADE)
    author = models.CharField(max_length=40, blank=True)
    mid = models.CharField(max_length=16, blank=True)          # member id of the sender
    kind = models.CharField(max_length=8, choices=KIND, default="text")
    text = models.CharField(max_length=500, blank=True)
    data = models.JSONField(default=dict, blank=True)          # e.g. {"city": "paris"}
    created = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["id"]

    def as_dict(self):
        return {"id": self.id, "author": self.author, "mid": self.mid, "kind": self.kind, "text": self.text,
                "data": self.data, "at": self.created.isoformat()}


class Account(models.Model):
    """A traveller: the unique @username is the login, a hashed 4-digit PIN protects it."""
    username = models.CharField(max_length=20, unique=True)
    pin = models.CharField(max_length=128)
    name = models.CharField(max_length=40)
    g = models.CharField(max_length=1, default="m")
    photo = models.CharField(max_length=300, blank=True)
    trips = models.JSONField(default=dict, blank=True)      # {journey code: member id}
    last_code = models.CharField(max_length=8, blank=True)
    created = models.DateTimeField(auto_now_add=True)
    seen = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["-seen"]

    def __str__(self):
        return f"@{self.username} ({self.name})"
