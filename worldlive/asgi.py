"""ASGI entry point: Django for HTTP, Channels for the journey WebSockets (/ws/j/<code>)."""
import os

from django.core.asgi import get_asgi_application

os.environ.setdefault("DJANGO_SETTINGS_MODULE", "worldlive.settings")
django_app = get_asgi_application()

from django.conf import settings  # noqa: E402

if settings.DEBUG:   # local development: serve /static/ like runserver does (nginx does it in production)
    from django.contrib.staticfiles.handlers import ASGIStaticFilesHandler
    django_app = ASGIStaticFilesHandler(django_app)

from channels.routing import ProtocolTypeRouter, URLRouter  # noqa: E402
from channels.security.websocket import AllowedHostsOriginValidator  # noqa: E402
from django.urls import path  # noqa: E402

from core.realtime import JourneyConsumer  # noqa: E402

application = ProtocolTypeRouter({
    "http": django_app,
    "websocket": AllowedHostsOriginValidator(URLRouter([path("ws/j/<str:code>", JourneyConsumer.as_asgi())])),
})
