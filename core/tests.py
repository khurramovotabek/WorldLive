"""API tests: journeys, the travel party, chat, memories, accounts, uploads and throttling.

Run: .venv/bin/python manage.py test core
"""
import json
from unittest import mock

from django.core.cache import cache
from django.test import TestCase, override_settings

from .models import Account, ChatMessage, Journey, Memory, Stamp


class Api(TestCase):
    def setUp(self):
        cache.clear()

    def post(self, url, data=None, **kw):
        return self.client.post(url, json.dumps(data or {}), content_type="application/json", **kw)

    def journey(self, **state):
        r = self.post("/api/journey", {"a": "Otabek", "lang": "uz", "state": {"city": "tashkent", **state}})
        self.assertEqual(r.status_code, 201)
        return r.json()["code"]


class HealthAndPages(Api):
    def test_health(self):
        r = self.client.get("/healthz")
        self.assertEqual(r.status_code, 200)
        self.assertTrue(r.json()["ok"])
        self.assertEqual(r["Cache-Control"], "no-store")

    def test_index_and_invite(self):
        code = self.journey()
        self.assertEqual(self.client.get("/").status_code, 200)
        r = self.client.get(f"/j/{code.lower()}")
        self.assertEqual(r.status_code, 200)
        self.assertEqual(r.context["invite"]["code"], code)
        self.assertIsNone(self.client.get("/j/NOPE1234").context["invite"])

    def test_album(self):
        code = self.journey()
        Stamp.objects.create(journey=Journey.objects.get(code=code), city="tashkent", country="UZ")
        for lang in ("uz", "en", "ru", "xx"):
            self.assertEqual(self.client.get(f"/album/{code}?lang={lang}").status_code, 200)
        self.assertEqual(self.client.get("/album/NOPE1234").status_code, 404)


class Journeys(Api):
    def test_create_requires_name(self):
        self.assertEqual(self.post("/api/journey", {"a": "  "}).status_code, 400)

    def test_create_cleans_input(self):
        r = self.post("/api/journey", {"a": "  Aziz   Karimov ", "lang": "<x>", "state": {"party": [{"id": "evil"}], "city": "paris"}})
        d = r.json()
        self.assertEqual(d["a"], "Aziz Karimov")
        self.assertEqual(d["lang"], "uz")
        self.assertEqual(d["state"], {"city": "paris"})          # party is server-owned

    def test_patch_merges_and_bumps_version(self):
        code = self.journey()
        r = self.post(f"/api/journey/{code}", {"state": {"season": "winter"}})
        self.assertEqual(r.status_code, 200)
        self.assertEqual(r.json()["state"], {"city": "tashkent", "season": "winter"})
        self.assertEqual(r.json()["version"], 1)
        unchanged = self.client.get(f"/api/journey/{code}?v=1").json()
        self.assertTrue(unchanged["unchanged"])
        self.assertEqual(self.client.get(f"/api/journey/{code}?v=0").json()["state"]["season"], "winter")

    def test_patch_cannot_touch_party_or_start(self):
        code = self.journey()
        mid = self.post(f"/api/journey/{code}/member", {"name": "Otabek"}).json()["mid"]
        self.post(f"/api/journey/{code}", {"state": {"party": [], "started": 1}})
        st = Journey.objects.get(code=code).state
        self.assertEqual([m["id"] for m in st["party"]], [mid])
        self.assertNotIn("started", st)

    def test_patch_size_limit(self):
        code = self.journey()
        r = self.post(f"/api/journey/{code}", {"state": {"blob": "x" * 300_000}})
        self.assertEqual(r.status_code, 413)
        self.assertNotIn("blob", Journey.objects.get(code=code).state)

    def test_unknown_journey(self):
        self.assertEqual(self.client.get("/api/journey/ZZZZZZZZ").status_code, 404)


class Party(Api):
    def test_join_ready_and_start(self):
        code = self.journey()
        a = self.post(f"/api/journey/{code}/member", {"name": "Otabek"}).json()
        b = self.post(f"/api/journey/{code}/member", {"name": "Malika", "g": "f"}).json()
        self.assertTrue(a["party"][0]["host"])
        self.assertFalse(b["party"][1]["host"])
        self.assertEqual(Journey.objects.get(code=code).traveler_b, "Malika")
        self.assertEqual(ChatMessage.objects.filter(kind="system").count(), 2)

        r = self.post(f"/api/journey/{code}/ready", {"mid": a["mid"]}).json()
        self.assertIsNone(r["started"])
        r = self.post(f"/api/journey/{code}/ready", {"mid": b["mid"]}).json()
        self.assertIsNotNone(r["started"])

    def test_rejoin_updates_same_member(self):
        code = self.journey()
        mid = self.post(f"/api/journey/{code}/member", {"name": "Otabek"}).json()["mid"]
        r = self.post(f"/api/journey/{code}/member", {"name": "Otabek K", "mid": mid}).json()
        self.assertEqual(len(r["party"]), 1)
        self.assertEqual(r["party"][0]["name"], "Otabek K")

    def test_party_is_capped(self):
        code = self.journey()
        for i in range(8):
            self.assertEqual(self.post(f"/api/journey/{code}/member", {"name": f"P{i}"}).status_code, 200)
        self.assertEqual(self.post(f"/api/journey/{code}/member", {"name": "late"}).status_code, 409)

    def test_foreign_photo_is_dropped(self):
        code = self.journey()
        r = self.post(f"/api/journey/{code}/member", {"name": "X", "photo": "https://evil.example/x.png"}).json()
        self.assertIsNone(r["party"][0]["photo"])

    def test_host_can_force_start(self):
        code = self.journey()
        host = self.post(f"/api/journey/{code}/member", {"name": "A"}).json()["mid"]
        guest = self.post(f"/api/journey/{code}/member", {"name": "B"}).json()["mid"]
        self.assertIsNone(self.post(f"/api/journey/{code}/ready", {"mid": guest, "ready": False, "force": True}).json()["started"])
        self.assertIsNotNone(self.post(f"/api/journey/{code}/ready", {"mid": host, "force": True}).json()["started"])

    def test_ready_unknown_member(self):
        code = self.journey()
        self.assertEqual(self.post(f"/api/journey/{code}/ready", {"mid": "nobody"}).status_code, 400)


class Chat(Api):
    def test_text_propose_agree(self):
        code = self.journey()
        self.assertEqual(self.post(f"/api/journey/{code}/chat", {"text": ""}).status_code, 400)
        t = self.post(f"/api/journey/{code}/chat", {"text": "Salom", "author": "A"})
        self.assertEqual(t.status_code, 201)
        p = self.post(f"/api/journey/{code}/chat", {"kind": "propose", "data": {"city": "paris"}}).json()
        self.assertEqual(self.post(f"/api/journey/{code}/chat", {"kind": "agree", "data": {"ref": t.json()["id"]}}).status_code, 400)
        self.assertEqual(self.post(f"/api/journey/{code}/chat", {"kind": "agree", "data": {"ref": p["id"]}}).status_code, 201)
        msgs = self.client.get(f"/api/journey/{code}/chat?after={t.json()['id']}").json()["messages"]
        self.assertEqual([m["kind"] for m in msgs], ["propose", "agree"])

    def test_text_is_truncated(self):
        code = self.journey()
        self.assertEqual(len(self.post(f"/api/journey/{code}/chat", {"text": "a" * 900}).json()["text"]), 500)


class Memories(Api):
    def test_memory_and_future_postcard(self):
        code = self.journey()
        self.assertEqual(self.post(f"/api/journey/{code}/memory", {"text": " "}).status_code, 400)
        r = self.post(f"/api/journey/{code}/memory", {"text": "Hi", "kind": "postcard", "city": "paris", "open_on": "2030-01-01"})
        self.assertEqual(r.status_code, 201)
        self.assertEqual(r.json()["open_on"], "2030-01-01")
        self.assertEqual(self.post(f"/api/journey/{code}/memory", {"text": "x", "kind": "hack"}).json()["kind"], "note")

    def test_bad_date_is_400_not_500(self):
        code = self.journey()
        self.assertEqual(self.post(f"/api/journey/{code}/memory", {"text": "x", "open_on": "tomorrow"}).status_code, 400)
        self.assertFalse(Memory.objects.exists())

    def test_stamp_once_per_city(self):
        code = self.journey()
        for _ in range(2):
            r = self.post(f"/api/journey/{code}/stamp", {"city": "paris", "country": "FR", "flight": "WL101"})
        self.assertEqual(len(r.json()["stamps"]), 1)


class Uploads(Api):
    def test_avatar_needs_consent_and_real_image(self):
        from django.core.files.uploadedfile import SimpleUploadedFile
        code = self.journey()
        png = b"\x89PNG\r\n\x1a\n" + b"0" * 64
        f = lambda body: SimpleUploadedFile("a.png", body, content_type="image/png")  # noqa: E731
        self.assertEqual(self.client.post(f"/api/journey/{code}/avatar", {"file": f(png)}).status_code, 400)
        self.assertEqual(self.client.post(f"/api/journey/{code}/avatar", {"file": f(b"<svg/>" * 4), "consent": "1"}).status_code, 400)
        with self.settings(MEDIA_ROOT=self._tmp()):
            r = self.client.post(f"/api/journey/{code}/avatar", {"file": f(png), "consent": "1"})
            self.assertEqual(r.status_code, 201)
            url = r.json()["url"]
            self.assertIn(f"/avatars/{code}/", url)
            self.assertEqual(self.post(f"/api/journey/{code}/avatar/delete", {"url": url}).status_code, 200)
            self.assertEqual(self.post(f"/api/journey/{code}/avatar/delete", {"url": url.replace(code, "../x")}).status_code, 400)

    def test_track_rejects_non_audio(self):
        from django.core.files.uploadedfile import SimpleUploadedFile
        code = self.journey()
        f = SimpleUploadedFile("x.exe", b"MZ", content_type="application/octet-stream")
        self.assertEqual(self.client.post(f"/api/journey/{code}/tracks", {"file": f}).status_code, 400)

    def test_spotify_link_validation_and_dedup(self):
        code = self.journey()
        url = "https://open.spotify.com/track/4uLU6hMCjMI75M1A2tKUQC?si=x"
        self.assertEqual(self.post(f"/api/journey/{code}/tracks", {"spotify": "https://evil.example/track/1"}).status_code, 400)
        with mock.patch("core.views.sp_oembed", return_value="Never Gonna Give You Up") as oe:
            self.assertEqual(self.post(f"/api/journey/{code}/tracks", {"spotify": url}).status_code, 201)
            again = self.post(f"/api/journey/{code}/tracks", {"spotify": "spotify:track:4uLU6hMCjMI75M1A2tKUQC"})
        self.assertTrue(again.json()["dup"])
        self.assertEqual(oe.call_count, 1)

    def _tmp(self):
        import shutil
        import tempfile
        d = tempfile.mkdtemp()
        self.addCleanup(shutil.rmtree, d, True)
        return d


class Preview(Api):
    def _itunes(self, url):
        resp = mock.MagicMock()
        resp.__enter__.return_value = resp
        resp.read.return_value = json.dumps({"results": [{"previewUrl": url}]}).encode()
        return mock.patch("core.views.urllib.request.urlopen", return_value=resp)

    def test_redirects_only_to_apple(self):
        with self._itunes("https://audio-ssl.itunes.apple.com/a.m4a"):
            r = self.client.get("/api/preview/123?c=uz")
        self.assertEqual(r.status_code, 302)
        self.assertEqual(r["Location"], "https://audio-ssl.itunes.apple.com/a.m4a")
        cache.clear()
        with self._itunes("https://evil.example/a.m4a"):
            self.assertEqual(self.client.get("/api/preview/124").status_code, 404)


class Accounts(Api):
    def test_signup_login_lockout(self):
        self.assertEqual(self.post("/api/account/login", {"username": "ab", "pin": "1234"}).status_code, 400)
        self.assertEqual(self.post("/api/account/login", {"username": "admin", "pin": "1234", "name": "X"}).status_code, 400)
        r = self.post("/api/account/login", {"username": "@Otabek", "pin": "1234", "name": "Otabek"})
        self.assertEqual(r.status_code, 201)
        self.assertNotEqual(Account.objects.get().pin, "1234")                   # hashed
        self.assertEqual(self.client.get("/api/account").json()["account"]["username"], "otabek")
        self.post("/api/account/logout")
        self.assertIsNone(self.client.get("/api/account").json()["account"])
        for _ in range(5):
            self.assertEqual(self.post("/api/account/login", {"username": "otabek", "pin": "0000"}).status_code, 403)
        self.assertEqual(self.post("/api/account/login", {"username": "otabek", "pin": "1234"}).status_code, 429)

    def test_account_remembers_trips(self):
        self.post("/api/account/login", {"username": "malika", "pin": "4321", "name": "Malika"})
        code = self.journey()
        mid = self.post(f"/api/journey/{code}/member", {"name": "Malika", "self": True}).json()["mid"]
        trips = self.client.get("/api/account").json()["account"]["trips"]
        self.assertEqual(trips[0]["code"], code)
        self.assertEqual(trips[0]["mid"], mid)
        # rejoining from another device with the account returns the same member
        again = self.post(f"/api/journey/{code}/member", {"name": "Malika", "self": True}).json()
        self.assertEqual(again["mid"], mid)
        self.assertEqual(len(again["party"]), 1)


class Analytics(Api):
    def test_track_events(self):
        did = "0b0e1a7e-1111-4222-8333-444455556666"
        r = self.post("/api/track", {"did": did, "events": [{"k": "fly", "city": "paris"}, {"k": "nope"}]},
                      HTTP_USER_AGENT="Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) Version/17.0 Mobile Safari/604.1")
        self.assertEqual(r.json()["n"], 1)
        self.assertEqual(self.post("/api/track", {"did": "x"}).status_code, 400)

    def test_control_requires_staff(self):
        r = self.client.get("/control/")
        self.assertIn(r.status_code, (302, 403))


class Throttling(Api):
    def test_chat_is_throttled_per_ip(self):
        code = self.journey()
        codes = [self.post(f"/api/journey/{code}/chat", {"text": "hi"}).status_code for _ in range(45)]
        self.assertEqual(codes.count(201), 40)
        self.assertEqual(codes[-1], 429)

    @override_settings(WORLDLIVE_RATELIMIT=False)
    def test_can_be_disabled(self):
        code = self.journey()
        codes = {self.post(f"/api/journey/{code}/chat", {"text": "hi"}).status_code for _ in range(45)}
        self.assertEqual(codes, {201})

    @override_settings(WORLDLIVE_TRUST_PROXY=True)
    def test_forged_forwarded_for_does_not_escape_the_limit(self):
        code = self.journey()
        codes = [self.post(f"/api/journey/{code}/chat", {"text": "hi"}, HTTP_X_FORWARDED_FOR=f"10.0.0.{i}, 203.0.113.7").status_code
                 for i in range(45)]
        self.assertEqual(codes.count(429), 5)

    def test_get_polling_is_not_throttled(self):
        code = self.journey()
        codes = {self.client.get(f"/api/journey/{code}").status_code for _ in range(300)}
        self.assertEqual(codes, {200})
