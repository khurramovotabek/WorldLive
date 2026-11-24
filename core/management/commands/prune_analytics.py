from datetime import timedelta

from django.conf import settings
from django.core.management.base import BaseCommand
from django.utils import timezone

from core.models import Device, Event


class Command(BaseCommand):
    help = "Delete analytics events (and idle devices) older than WORLDLIVE_ANALYTICS_DAYS."

    def handle(self, *args, **opts):
        cut = timezone.now() - timedelta(days=settings.WORLDLIVE_ANALYTICS_DAYS)
        n, _ = Event.objects.filter(created__lt=cut).delete()
        d, _ = Device.objects.filter(last_seen__lt=cut).delete()
        self.stdout.write(self.style.SUCCESS(f"pruned {n} events, {d} devices older than {cut:%Y-%m-%d}"))
