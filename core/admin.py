from django.contrib import admin

from .models import Account, ChatMessage, Device, DeviceIP, Event, Journey, Memory, Stamp, Track

@admin.register(Journey)
class JourneyAdmin(admin.ModelAdmin):
    list_display = ("code", "traveler_a", "traveler_b", "party_n", "started", "created", "updated")
    search_fields = ("code", "traveler_a", "traveler_b")
    date_hierarchy = "created"

    @admin.display(description="Guruh")
    def party_n(self, j):
        return len(j.state.get("party") or [])

    @admin.display(description="Boshlangan", boolean=True)
    def started(self, j):
        return bool(j.state.get("started"))


@admin.register(Memory)
class MemoryAdmin(admin.ModelAdmin):
    list_display = ("created", "kind", "author", "city", "place", "journey")
    list_filter = ("kind",)
    search_fields = ("text", "author", "city", "journey__code")


@admin.register(Stamp)
class StampAdmin(admin.ModelAdmin):
    list_display = ("created", "city", "country", "flight_no", "journey")
    search_fields = ("city", "journey__code")


@admin.register(Track)
class TrackAdmin(admin.ModelAdmin):
    list_display = ("title", "artist", "city", "season", "journey")
    search_fields = ("title", "artist", "city")


@admin.register(ChatMessage)
class ChatAdmin(admin.ModelAdmin):
    list_display = ("created", "kind", "author", "text", "journey")
    list_filter = ("kind",)
    search_fields = ("text", "author", "journey__code")


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


@admin.register(Account)
class AccountAdmin(admin.ModelAdmin):
    list_display = ("username", "name", "g", "last_code", "created", "seen")
    search_fields = ("username", "name", "last_code")
    exclude = ("pin",)
