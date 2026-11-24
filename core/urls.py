from django.urls import path

from . import analytics, control, views

urlpatterns = [
    path("", views.index, name="index"),
    path("j/<str:code>", views.index, name="invite"),
    path("album/<str:code>", views.album, name="album"),
    path("api/config", views.config),
    path("api/journey", views.journey_create),
    path("api/journey/<str:code>", views.journey_detail),
    path("api/journey/<str:code>/stamp", views.stamp_add),
    path("api/journey/<str:code>/memory", views.memory_add),
    path("api/journey/<str:code>/tracks", views.tracks),
    path("api/journey/<str:code>/tracks/<int:tid>/delete", views.track_delete),
    path("api/journey/<str:code>/avatar", views.avatar),
    path("api/journey/<str:code>/member", views.member),
    path("api/journey/<str:code>/ready", views.member_ready),
    path("api/journey/<str:code>/chat", views.chat),
    path("api/journey/<str:code>/avatar/delete", views.avatar_delete),
    path("api/preview/<int:track_id>", views.preview, name="preview"),
    path("api/track", analytics.track),
    path("control/", control.overview, name="control"),
    path("control/couples", control.couples, name="control-couples"),
    path("control/couple/<str:code>", control.journey, name="control-journey"),
    path("control/devices", control.devices, name="control-devices"),
    path("control/events", control.events, name="control-events"),
    path("control/live", control.live),
    path("control/memories", control.memories, name="control-memories"),
    path("control/analytics", control.analytics, name="control-analytics"),
    path("control/server", control.server, name="control-server"),
]
