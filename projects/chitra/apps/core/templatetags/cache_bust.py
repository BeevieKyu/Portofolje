import os

from django import template
from django.contrib.staticfiles import finders
from django.templatetags.static import static

register = template.Library()


@register.simple_tag
def static_versioned(path):
    """Like {% static %}, but appends the file's mtime so browsers refetch
    it whenever it changes on disk, instead of serving a stale cached copy."""
    url = static(path)
    file_path = finders.find(path)
    if not file_path:
        return url
    try:
        version = int(os.path.getmtime(file_path))
    except OSError:
        return url
    return f'{url}?v={version}'
