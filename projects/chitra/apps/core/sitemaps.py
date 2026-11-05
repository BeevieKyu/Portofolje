from django.contrib.sitemaps import Sitemap
from django.urls import reverse


class StaticViewSitemap(Sitemap):
    """
    Sitemap entries for the site's static, named routes.
    """
    protocol = "https"

    priorities = {
        "hjemme": 1.0,
    }

    def items(self):
        return list(self.priorities)

    def location(self, item):
        return reverse(item)

    def changefreq(self, item):
        return "weekly"

    def priority(self, item):
        return self.priorities[item]


sitemaps = {
    "static": StaticViewSitemap,
}
