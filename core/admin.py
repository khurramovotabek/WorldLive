from django.contrib import admin

from .models import Device, DeviceIP, Event, Journey, Memory, Stamp, Track

for m in (Journey, Memory, Stamp, Track):
    admin.site.register(m)


class IPInline(admin.TabularInline):
    model = DeviceIP
    extra = 0
    readonly_fields = ("ip", "hits", "first_seen", "last_seen")


@admin.register(Device)
class DeviceAdmin(admin.ModelAdmin):
    list_display = ("name", "journey", "kind", "os", "browser", "last_ip", "events", "last_seen")
    search_fields = ("name", "did", "last_ip", "journey__code")
    list_filter = ("kind", "os")
    inlines = [IPInline]


@admin.register(Event)
class EventAdmin(admin.ModelAdmin):
    list_display = ("created", "kind", "device", "journey", "city", "place", "ip")
    list_filter = ("kind",)
    search_fields = ("device__name", "journey__code", "city", "place", "ip")


admin.site.site_header = "WorldLive admin"
