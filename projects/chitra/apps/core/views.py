import os
import re

from django.conf import settings
from django.http import HttpResponse
from django.shortcuts import render


def _natural_key(name):
    return [int(part) if part.isdigit() else part.lower()
            for part in re.split(r'(\d+)', name)]


def hjemme(request):
    return render(request, 'core/index.html')


def om_oss(request):
    return render(request, 'core/om-oss.html')


def booking(request):
    return render(request, 'core/booking.html')


def bryllup(request):
    return render(request, 'core/bryllup.html')


def afternoon_tea(request):
    return render(request, 'core/afternoon-tea.html')


def moter_og_konferanser(request):
    return render(request, 'core/moter-og-konferanser.html')


def privat_arrangement(request):
    return render(request, 'core/privat-arrangement.html')


def kolleksjoner(request):
    return render(request, 'core/kolleksjoner.html')


def galleri(request):
    gallery_dir = os.path.join(settings.BASE_DIR, 'static', 'images', 'Galleri')
    try:
        names = [f for f in os.listdir(gallery_dir) if f.lower().endswith('.webp')]
    except FileNotFoundError:
        names = []
    images = []
    for n in sorted(names, key=_natural_key):
        stem = os.path.splitext(n)[0]
        # some files were converted as "name.jpg.webp" — drop the stray extension
        stem = re.sub(r'\.(jpe?g|png)$', '', stem, flags=re.IGNORECASE)
        images.append({
            'src': 'images/Galleri/' + n,
            'alt': stem.replace('_', ' ').strip() + ' på Chitra house',
        })
    return render(request, 'core/galleri.html', {'gallery_images': images})


def robots_txt(request):
    lines = [
        "User-agent: *",
        "Allow: /",
        "",
        "Sitemap: https://www.chitra.no/sitemap.xml",
    ]
    return HttpResponse("\n".join(lines), content_type="text/plain")


def llms_txt(request):
    """
    A plain-text/markdown summary of the site for AI assistants and
    answer engines (the emerging llms.txt convention, see llmstxt.org).
    """
    lines = [
        "# Chitra",
        "",
        "> Nettsiden er under bygging.",
        "",
        "## Sider",
        "- [Forside](https://www.chitra.no/)",
        "",
        "## Maskinlesbare kilder",
        "- Sitemap: https://www.chitra.no/sitemap.xml",
    ]
    return HttpResponse("\n".join(lines), content_type="text/plain; charset=utf-8")
