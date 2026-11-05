from django.urls import path, include
from apps.core.views import *
from apps.dashboard.views import dashboard_login, dashboard_logout
from django.contrib.sitemaps.views import sitemap
from apps.core.sitemaps import sitemaps

urlpatterns = [

    # Pages
    path('', hjemme, name="hjemme"),
    path('om-oss/', om_oss, name="om_oss"),
    path('bryllup/', bryllup, name="bryllup"),
    path('afternoon-tea/', afternoon_tea, name="afternoon_tea"),
    path('moter-og-konferanser/', moter_og_konferanser, name="moter_og_konferanser"),
    path('privat-arrangement/', privat_arrangement, name="privat_arrangement"),
    path('kolleksjoner/', kolleksjoner, name="kolleksjoner"),
    path('galleri/', galleri, name="galleri"),
    path('booking/', booking, name="booking"),

    # Dashboard (custom admin)
    path('logg-inn/', dashboard_login, name="dashboard_login"),
    path('logg-ut/', dashboard_logout, name="dashboard_logout"),
    path('kontrollpanel/', include('apps.dashboard.urls')),

    # SEO
    path('robots.txt', robots_txt, name="robots_txt"),
    path('llms.txt', llms_txt, name="llms_txt"),
    path('sitemap.xml', sitemap, {'sitemaps': sitemaps}, name='django.contrib.sitemaps.views.sitemap'),

    # All images are committed under static/ and served via {% static %} — there
    # are no user-uploaded media files, so no MEDIA_URL route is wired up.

]
