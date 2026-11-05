import re
import time

from django.utils import timezone
from datetime import timedelta

from .models import ContactMessage

LINK_RE = re.compile(r'https?://|www\.', re.IGNORECASE)
MIN_SUBMIT_SECONDS = 3
RATE_LIMIT_COUNT = 5
RATE_LIMIT_WINDOW = timedelta(hours=1)


def client_ip(request):
    forwarded = request.META.get('HTTP_X_FORWARDED_FOR')
    if forwarded:
        return forwarded.split(',')[0].strip()
    return request.META.get('REMOTE_ADDR')


def is_rate_limited(ip_address):
    if not ip_address:
        return False
    since = timezone.now() - RATE_LIMIT_WINDOW
    return ContactMessage.objects.filter(ip_address=ip_address, created_at__gte=since).count() >= RATE_LIMIT_COUNT


def evaluate_spam(message_text, started_at_raw):
    """Returns (is_spam, reason). Never raises — bad/missing timing data is treated as suspicious, not fatal."""
    try:
        elapsed = time.time() - (int(started_at_raw) / 1000)
    except (TypeError, ValueError):
        elapsed = None

    if elapsed is not None and elapsed < MIN_SUBMIT_SECONDS:
        return True, 'for rask innsending'

    if LINK_RE.search(message_text or ''):
        return True, 'lenke i meldingen'

    return False, ''
