# WorldLive — *One World. Travel it together.*

A premium liquid-glass virtual journey for two or more people: a real-sun 3D Earth, cinematic flights
with 3D boarding at the airport, 227 real places in 43 cities (verified coordinates, uz/en/ru texts,
credited Wikimedia Commons photos), seasons, a living day/night cycle, night city lights, music,
gifts & secret surprises, a shared chat, a digital passport, “Our film” and a printable memory album.

## Highlights
- **Travel together, for real** — every journey has a unique 8-letter ID and an invite link `/j/<ID>`
  (share on Telegram / WhatsApp). Each traveller enters their own name, gender and optional photo
  (with consent); everyone taps *I’m ready* and the trip starts on all devices at once. Up to 8 people;
  any number of devices can follow the same journey.
- **Live chat** with one-tap destination proposals (“Shall we go to Paris? ✈ Let’s fly”).
- **3D boarding & arrival** — airliner with a painted livery, airport, automatic door; the party walks
  in pairs hand in hand and in single file on the stairs (distance-based queue, no overlaps).
- **Surprise Engine** — gifts (flowers, books, MacBook, car keys, perfume, ring, city souvenirs) with
  messages, an unwrapping ceremony and reactions; one secret gift hidden in every city.
- **A day in the city** — real-life itineraries (Paris: coffee in Montmartre → flowers by the Seine →
  the Eiffel Tower sparkling at night; Tashkent: Chorsu → Hazrati Imam → TV tower lights …).
- **Living day** — 1 minute = 1 hour, the night passes in ~10 s; synced across devices.
- **Guided tour** — each place 15/30/45/60 s with progress ring, arrows, swipe and keyboard.
- **Music** without duplicates (Spotify id / normalised artist + title), real prayer times and adhan
  in Makkah & Madinah.

## Run
```bash
python3 -m venv .venv && .venv/bin/pip install "django>=5.1,<6" pillow
.venv/bin/python manage.py migrate
.venv/bin/python manage.py runserver        # http://127.0.0.1:8000
```
`static/data/world.json` is already synced. To refresh/extend it after editing `core/catalog.py`:
`.venv/bin/python manage.py sync_world` (cached in `.wikicache/`, polite to Wikimedia rate limits).

Optional — photorealistic 3D cities (Level 1, Google Map Tiles API, **billed**):
`GOOGLE_MAPS_API_KEY=... .venv/bin/python manage.py runserver` → "3D shahar" tab (CesiumJS, lazy-loaded).
Restrict the key by HTTP referrer in Google Cloud.

## Architecture
| Layer | Files | Notes |
|---|---|---|
| Catalog (source of truth) | `core/catalog.py` | Country → City → Attraction; Wikipedia titles, food, culture, original quotes (3 langs), climate, music mood |
| Data sync | `core/management/commands/sync_world.py` | Coordinates, extracts uz/en/ru, Commons photo + author + licence → `static/data/world.json` |
| API | `core/views.py`, `core/models.py` | Journey (shared state + invite code), Stamp, Memory/postcards, Track uploads |
| Globe | `static/js/globe.js` | globe.gl + custom shader: real subsolar point, city lights, ocean specular, clouds; merged border lines (1 draw call); procedural 3D aircraft + great-circle flight |
| Atmosphere | `static/js/atmosphere.js` | season × time × climate × city → grading, particles (snow, rain, sakura, momiji, ginkgo, sand, fireflies, bokeh, aurora), ambience mix |
| Music module | `static/js/music.js` | generative score per city mood (scales/timbres), uploads (drag&drop, progress, city/season tags), queue, library, crossfade, shuffle/repeat, smart mode, nature mixer, visualiser, MediaSession; silent spiritual mode |
| City scene | `static/js/scene.js` | Cinematic scene, places rail, taste, journal + postcards to the future, Memory Studio PNG, optional 3D Tiles |
| App | `static/js/main.js`, `templates/index.html`, `static/css/app.css` | Intro with names, dock, preview, boarding pass, HUD, passport, 2-device sync, liquid-glass UI, mobile layout |

Vendor bundle `static/vendor/wl-vendor.js` = three@0.187 + globe.gl@2.46.2 (esbuild, served locally — no CDN on the critical path).

## Honesty rules built in
* Every place has verified coordinates and a credited, licensed photo; scenes are labelled *Cinematic scene · real photo* unless real Google 3D Tiles are loaded.
* Boarding passes say *Virtual ticket · not a real booking*.
* Makkah/Madinah: music stops automatically, respectful notice, no romantic UI; only tracks the users upload for that city may play (e.g. a licensed recitation).
* Quotes are original WorldLive texts, never attributed to real people.
* Only upload music you own or are licensed to use.

## Phase 2 notes (agreed with ChatGPT)
* Avatars: Blender → **VRM 1.0**, loaded with `@pixiv/three-vrm`; blendshapes for expressions, eye motion, lip-sync.
* Mixamo clips (idle, walk, sit, wave) need **bone retargeting** to the VRM humanoid rig; clean in Blender, crossfade with `AnimationMixer`.
* Foot IK + a character controller; sync only compact state (position, heading, clip) over the shared journey channel.

## Roadmap (next)
Phase 2 rigged 3D couple avatars (VRM + Mixamo) · Phase 3 airport interior & cabin view · WebSocket sync (Django Channels) · licensed Adhan/recitation library · more cities via `catalog.py` + `sync_world` · AI mood art from `docs/image-prompts.md`.

## Songs, volume & the call to prayer

`static/js/songs.js` — curated popular songs per city/category (uz · tr · ru · it · fr · ar · asia · gr ·
global · chill). Two official sources, audio only:

* **Default — Apple Music previews (30 s).** 46 of 49 songs carry a verified iTunes track id. `GET
  /api/preview/<id>?c=CC` resolves the current preview URL (cached 6 h) and redirects to Apple's
  CORS-enabled CDN, so audio runs through our Web Audio graph: autoplay after the first tap, real
  master/music/nature volume (perceptual curve, smooth ramps), DJ-style overlap between songs and a
  live visualiser. Keys: `+`/`−` volume, `M` mute, `Space` play/pause; mouse wheel on the speaker icon.
* **"Full songs (Spotify)"** toggle — Spotify embed; full tracks for logged-in Spotify users. Songs
  without a preview always use it. Spotify's embed has no volume API.

Smart mode plays local-language songs first (Italian in Rome, "Ulug‘imsan Vatanim" in Samarkand…).
**Makkah & Madinah:** music stops and the adhan plays on arrival ("Beautiful adhan", Wikimedia
Commons, CC0, streamed from upload.wikimedia.org) with a soft courtyard reverb; can be replayed or
turned off in the music panel.

**Song stamps:** the first song heard ≥15 s in a city (or the one you pin with "Make it this city's
song") is stored in `journey.state.songs`. The passport turns them into the couple's playlist.
**Musical postcard:** Memory Studio prints the place's aphorism and the song playing at that moment.

## Place aphorisms

`static/js/aphorisms.js` — one original line per attraction (uz/en/ru) plus season × time-of-day
mood lines; shown in the scene with the song that is playing. Sacred places get reverent lines only.

## Control dashboard — `/control/`

Staff-only (Django admin login). Shows live online count, couples & their routes, km, every step
(visit, fly, land, city, place, tab, season, music…), devices (type, OS, browser, screen, timezone)
and all IP addresses per device, top cities and top songs, with a live feed.

```bash
.venv/bin/python manage.py createsuperuser      # your own staff account
.venv/bin/python manage.py prune_analytics      # delete events older than WORLDLIVE_ANALYTICS_DAYS (180)
```

* Tracking endpoint: `POST /api/track` (batched, `sendBeacon` on exit). Visitors see a privacy note
  on the intro screen. Set `WORLDLIVE_TRUST_PROXY=1` only behind your own reverse proxy so the real
  client IP is read from `X-Forwarded-For`.
* A local test staff account for development is in `.dev-admin` (git-ignored) — don't use it in production.


## Production
`deploy/` holds the systemd unit (gunicorn on 127.0.0.1:8020), the nginx site and an env example.
Settings read `DJANGO_SECRET_KEY`, `DJANGO_ALLOWED_HOSTS`, `DJANGO_CSRF_ORIGINS` from the environment;
`DEBUG` is off whenever a secret key is provided. The licensed character models (`static/models/*.glb`)
are not stored in git — copy them to the server separately (see `static/models/CREDITS.txt`).
