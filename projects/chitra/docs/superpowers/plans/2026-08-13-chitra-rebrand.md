# Bolig og Hytte → Chitra House Rebrand Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Rebuild this Django site from the "Bolig og Hytte" trade-fair brand into "Chitra House" (chitra.no), a single luxury private event venue in Fornebu, Norway — new domain model, new pages, new visual identity, all content in Norwegian.

**Architecture:** Add new venue-oriented pages (History, Rooms, Gallery) and recontent the pages that survive (Home, About, Contact, Privacy, News) before removing the trade-fair domain (`Messe`, `ExhibitorApplication`, `Partner`) and its templates/routes/dashboard CRUD, so the site stays in a working, testable state after every task. Visual rebrand is done by introducing CSS custom-property design tokens and swapping the three brand hex colors site-wide, reusing the existing layout CSS rather than rewriting it.

**Tech Stack:** Django 5.1, sqlite (dev), vanilla SCSS/CSS (no build tool present in this repo — `.scss` and matching `.css` files must be hand-edited together), vanilla JS.

**Spec:** `docs/superpowers/specs/2026-08-12-chitra-rebrand-design.md`

## Global Constraints

- Site language stays Norwegian only.
- No stock photography anywhere — every image slot becomes a `.media-placeholder` block (defined in Task 1), never a real `<img>`/`<picture>`.
- No attempt to reproduce Chitra's actual logo artwork — use a plain text wordmark ("CHITRA") instead.
- Keep the existing font pairing (Cormorant Garamond + Inter Tight) already loaded in `apps/core/templates/core/base.html` — do not change it.
- No admin-editable Room/Gallery models — rooms and gallery are fixed static content (per spec's "Out of scope").
- Real content only (adapted from chitra.no, paraphrased not copied verbatim) — never Lorem-ipsum-style placeholder copy.
- All canonical/OG URLs point at `https://www.chitra.no`, replacing every `boligoghytte.com` reference.
- This repo has no Sass build tool available — whenever a `.scss` file is edited, hand-edit the matching `.css` file with the same change in the same step.

---

## File Structure

New/changed files, grouped by responsibility:

- `static/scss/global/main.scss` / `main.css` — currently empty; becomes the home of the Chitra design tokens (`:root` custom properties) and the shared `.media-placeholder` utility used on every page.
- `apps/core/templates/core/historie.html`, `rom.html`, `rom-detail.html`, `galleri.html` — new pages.
- `static/scss/store/rooms.css` / `.scss`, `static/scss/store/galleri.css` / `.scss` — new stylesheets for the two new page types that don't already have a layout to reuse.
- `apps/core/templates/core/nav.html`, `footer.html`, `index.html`, `om-oss.html`, `kontakt.html`, `personvern.html` — recontented in place, reusing their existing stylesheets.
- `apps/blog/templates/core/blog.html`, `blog-post.html` and their (currently empty) stylesheets — reskinned into "Nyheter".
- `apps/core/models.py`, `admin.py`, `forms.py`, `context_processors.py`, `sitemaps.py`, `views.py`, `demo/urls.py` — trimmed of the fair/exhibitor domain in the final task.
- `apps/dashboard/*` — Messe/Partner/Pamelding CRUD removed.
- `apps/core/tests.py` — one new `TestCase` class per task, appended at the end of the file each time.

## Task Right-Sizing Note

Tasks are ordered so the site is importable and testable after every single task (new pages are added before old ones are removed; nav/footer are only repointed once every new URL exists; the fair/exhibitor backend is only deleted once nothing references it anymore).

---

### Task 1: Design tokens + global placeholder utility + Organization schema

**Files:**
- Modify: `static/scss/global/main.scss` (currently empty)
- Modify: `static/scss/global/main.css` (currently empty — this is what's actually served; keep it identical to `main.scss`)
- Modify: `apps/core/templates/core/base.html:12` (theme-color), `:14-54` (Organization/WebSite JSON-LD)
- Test: `apps/core/tests.py`

**Interfaces:**
- Produces: CSS custom properties `--chitra-ivory`, `--chitra-ivory-deep`, `--chitra-charcoal`, `--chitra-charcoal-soft`, `--chitra-brass`, `--chitra-brass-light`, `--chitra-brass-dark`, `--chitra-line`, and utility classes `.media-placeholder` / `.media-placeholder-label`, available on every page (loaded globally via `main.css` in `base.html`). Every later task's placeholder images use these classes.

- [ ] **Step 1: Write the design tokens and placeholder utility**

Write this exact content to **both** `static/scss/global/main.scss` and `static/scss/global/main.css` (they're currently empty and identical, so this keeps them in sync):

```css
:root {
  --chitra-ivory: #f6f1e7;
  --chitra-ivory-deep: #ece3d0;
  --chitra-charcoal: #1f1f1f;
  --chitra-charcoal-soft: #55503f;
  --chitra-brass: #a67c27;
  --chitra-brass-light: #c79a44;
  --chitra-brass-dark: #7e5e1c;
  --chitra-line: #ddd0af;
}

body {
  background: var(--chitra-ivory);
}

.media-placeholder {
  display: flex;
  align-items: flex-end;
  min-height: 260px;
  background: linear-gradient(135deg, var(--chitra-ivory-deep), var(--chitra-line));
  border: 1px solid var(--chitra-line);
  border-radius: 4px;
}

.media-placeholder-label {
  margin: 1rem;
  font-family: "Inter Tight", sans-serif;
  font-size: 0.75rem;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  color: var(--chitra-charcoal-soft);
}

/* Full-bleed placeholders inside hero/banner sections that position their
   media absolutely (`.cover`, `.page-banner` — see store/base.css and
   store/om-oss.css). */
.cover .media-placeholder,
.page-banner .media-placeholder {
  position: absolute;
  inset: 0;
  min-height: 0;
  border: none;
  border-radius: 0;
}
```

- [ ] **Step 2: Update the Organization/WebSite JSON-LD and theme color in base.html**

In `apps/core/templates/core/base.html`, replace line 12:

```html
  <meta name="theme-color" content="#a67c27">
```

Replace the JSON-LD block (lines 14-54):

```html
  <script type="application/ld+json">
  {
      "@context": "https://schema.org",
      "@graph": [
          {
              "@type": "Organization",
              "@id": "https://www.chitra.no/#organization",
              "name": "Chitra",
              "url": "https://www.chitra.no/",
              "description": "Chitra House er et privat selskapslokale i Fornebu utenfor Oslo, med utsikt over fjorden. Grunnlagt av Nirmal K. Sethia til minne om hans avdøde kone Chitra.",
              "founder": {"@type": "Person", "name": "Nirmal K. Sethia"},
              "address": {
                  "@type": "PostalAddress",
                  "streetAddress": "Snarøyveien 34",
                  "postalCode": "1364",
                  "addressLocality": "Fornebu",
                  "addressCountry": "NO"
              },
              "contactPoint": {
                  "@type": "ContactPoint",
                  "contactType": "customer service",
                  "telephone": "+47{{ site_settings.contact_phone|cut:' ' }}",
                  "email": "{{ site_settings.contact_email }}",
                  "areaServed": "NO",
                  "availableLanguage": "Norwegian"
              }
          },
          {
              "@type": "WebSite",
              "@id": "https://www.chitra.no/#website",
              "url": "https://www.chitra.no/",
              "name": "Chitra",
              "inLanguage": "nb-NO",
              "publisher": {"@id": "https://www.chitra.no/#organization"}
          }
      ]
  }
  </script>
```

- [ ] **Step 3: Write the test**

Append to `apps/core/tests.py`:

```python
from django.test import TestCase


class GlobalBrandingTests(TestCase):
    def test_homepage_uses_chitra_organization_schema(self):
        response = self.client.get('/')
        self.assertEqual(response.status_code, 200)
        self.assertContains(response, '"name": "Chitra"')
        self.assertContains(response, 'chitra.no')
```

- [ ] **Step 4: Run the test**

Run: `python manage.py test apps.core.tests.GlobalBrandingTests`
Expected: PASS (the homepage still renders — only the `<head>` changed).

- [ ] **Step 5: Commit**

```bash
git add static/scss/global/main.scss static/scss/global/main.css apps/core/templates/core/base.html apps/core/tests.py
git commit -m "Add Chitra design tokens and Organization schema"
```

---

### Task 2: Site-wide brand color swap

**Files:**
- Modify: `static/scss/store/nav.scss`, `nav.css`
- Modify: `static/scss/store/footer.scss`, `footer.css`
- Modify: `static/scss/store/base.scss`, `base.css` (this is the **homepage's** stylesheet, distinct from `core/templates/core/base.html`)
- Modify: `static/scss/store/om-oss.scss`, `om-oss.css`
- Modify: `static/scss/store/kontakt.scss`, `kontakt.css`
- Modify: `static/scss/store/regler.scss`, `regler.css` (shared by `regler.html` and `personvern.html` today — `regler.html` is deleted in Task 13, `personvern.html` keeps using this file, renamed in Task 10)
- Test: `apps/core/tests.py`

**Interfaces:**
- Consumes: `var(--chitra-brass)`, `var(--chitra-brass-light)`, `var(--chitra-brass-dark)` from Task 1.
- Produces: none of the retained stylesheets contain the old blue brand hex codes (`#004876`, `#006db1`, `#003a5e`) anymore.

Investigation already done: across the whole `static/scss/store/` tree there are exactly three brand-color hex codes worth swapping — `#004876` (primary), `#006db1` (lighter/hover), `#003a5e` (one darker one-off in `store/base.css`). `#1F1F1F` (near-black text) and the two red error colors (`#c2373a`, `#ff6b6b`) stay as-is — they're neutral/functional, not brand colors.

- [ ] **Step 1: Run the color swap on the six files that survive the rebrand**

```bash
sed -i \
  -e 's/#004876/var(--chitra-brass)/g' \
  -e 's/#006db1/var(--chitra-brass-light)/g' \
  -e 's/#003a5e/var(--chitra-brass-dark)/g' \
  static/scss/store/nav.scss static/scss/store/nav.css \
  static/scss/store/footer.scss static/scss/store/footer.css \
  static/scss/store/base.scss static/scss/store/base.css \
  static/scss/store/om-oss.scss static/scss/store/om-oss.css \
  static/scss/store/kontakt.scss static/scss/store/kontakt.css \
  static/scss/store/regler.scss static/scss/store/regler.css
```

(On Windows without a `sed` on PATH, use Git Bash, or the equivalent PowerShell:
`(Get-Content <file>) -replace '#004876','var(--chitra-brass)' -replace '#006db1','var(--chitra-brass-light)' -replace '#003a5e','var(--chitra-brass-dark)' | Set-Content <file> -Encoding utf8` for each file.)

Do **not** run this on `bli-utstiller.*`, `info-standleie.*`, `kommende-messer.*`, `messe-detail.*`, or `partners.*` — those files are deleted outright in Task 13, so recoloring them is wasted work.

- [ ] **Step 2: Verify no old brand hex remains in the retained files**

Run: `grep -rn "#004876\|#006db1\|#003a5e" static/scss/store/nav.* static/scss/store/footer.* static/scss/store/base.scss static/scss/store/base.css static/scss/store/om-oss.* static/scss/store/kontakt.* static/scss/store/regler.*`
Expected: no output (no matches).

- [ ] **Step 3: Write the test**

Append to `apps/core/tests.py`:

```python
class BrandColorTests(TestCase):
    def test_old_brand_blue_is_gone_from_surviving_stylesheets(self):
        import pathlib
        surviving = [
            'static/scss/store/nav.css', 'static/scss/store/footer.css',
            'static/scss/store/base.css', 'static/scss/store/om-oss.css',
            'static/scss/store/kontakt.css', 'static/scss/store/regler.css',
        ]
        for path in surviving:
            content = pathlib.Path(path).read_text(encoding='utf-8')
            self.assertNotIn('#004876', content, path)
            self.assertNotIn('#006db1', content, path)
```

- [ ] **Step 4: Run the test**

Run: `python manage.py test apps.core.tests.BrandColorTests`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add static/scss/store/nav.scss static/scss/store/nav.css static/scss/store/footer.scss static/scss/store/footer.css static/scss/store/base.scss static/scss/store/base.css static/scss/store/om-oss.scss static/scss/store/om-oss.css static/scss/store/kontakt.scss static/scss/store/kontakt.css static/scss/store/regler.scss static/scss/store/regler.css apps/core/tests.py
git commit -m "Swap trade-fair blue for the Chitra brass palette"
```

---

### Task 3: History page

**Files:**
- Modify: `apps/core/views.py` (add `historie` view)
- Modify: `demo/urls.py:24` area (add route)
- Create: `apps/core/templates/core/historie.html`
- Test: `apps/core/tests.py`

**Interfaces:**
- Produces: URL name `historie` at `/historie/`, view `apps.core.views.historie`.

- [ ] **Step 1: Add the view**

In `apps/core/views.py`, add after `om_oss`:

```python
def historie(request):
    return render(request, 'core/historie.html')
```

- [ ] **Step 2: Add the route**

In `demo/urls.py`, add after the `om-oss/` line:

```python
    path('historie/', historie, name="historie"),
```

- [ ] **Step 3: Write the template**

Create `apps/core/templates/core/historie.html` (reuses `om-oss.css`'s `.page-banner` / `.story` / `.story-text` classes so no new stylesheet is needed):

```html
{% extends 'core/base.html' %}
{% load static %}

{% block head %}
<title>Historie | Chitra</title>
<meta name="description" content="Chitra Collection ble grunnlagt i 2011 av Nirmal K. Sethia. Chitra House Oslo åpnet 12. april 2016 – les historien bak huset.">
<meta name="author" content="Chitra">

<link rel="canonical" href="https://www.chitra.no{{ request.path }}">

<meta property="og:type" content="website">
<meta property="og:url" content="https://www.chitra.no{{ request.get_full_path }}">
<meta property="og:site_name" content="Chitra">
<meta property="og:title" content="Historie | Chitra">
<meta property="og:description" content="Chitra Collection ble grunnlagt i 2011 av Nirmal K. Sethia. Chitra House Oslo åpnet 12. april 2016 – les historien bak huset.">
<meta property="og:locale" content="nb_NO">

<script type="application/ld+json">
{
    "@context": "https://schema.org",
    "@type": "AboutPage",
    "url": "https://www.chitra.no/historie/",
    "mainEntity": {"@id": "https://www.chitra.no/#organization"}
}
</script>
{% endblock %}

{% block content %}

<link rel="stylesheet" href="{% static 'scss/store/om-oss.css' %}" type="text/css">

<section class="page-banner">
    <div class="overlay-top"></div>
    <div class="media-placeholder"><span class="media-placeholder-label">Chitra House sett fra hagen</span></div>
    <div class="overlay-bottom"></div>
    <div class="content">
        <div class="text">
            <h1>Chitras historie</h1>
            <p>Fra en idé i 2011 til Chitra House i Oslo.</p>
        </div>
    </div>
</section>

<section class="story">
    <div class="content">
        <div class="story-media">
            <div class="story-media-inner media-placeholder"><span class="media-placeholder-label">Åpningen av Chitra House, 2016</span></div>
        </div>
        <div class="story-text">
            <h2>Et fotavtrykk, en drøm og en filosofi</h2>
            <p class="lead">Chitra Collection ble grunnlagt i 2011 av Nirmal K. Sethia, som personlig har valgt ut hvert eiendom i samlingen for sin unike atmosfære og karakter.</p>

            <p>Chitra House Oslo – det første stedet i samlingen som åpnet for publikum – ble offisielt åpnet 12. april 2016, med en åpningsmarkering som bød på operasangere, harpister og kulinariske presentasjoner.</p>

            <p>Huset er oppkalt etter og tilegnet Sethias avdøde kone, Chitra. Han har beskrevet hvordan hun lærte ham at det første steget mot det guddommelige er takknemlighet.</p>

            <p>Interiøret er hentet fra hele verden, og forener indisk arv med skandinavisk natur og formspråk – en ramme skreddersydd for både forretningsmøter og private feiringer i en av Europas voksende næringsregioner.</p>

            <blockquote>«Chitra er et fotavtrykk, en drøm og en filosofi.» – Nirmal K. Sethia</blockquote>
        </div>
    </div>
</section>

{% endblock %}
```

- [ ] **Step 4: Write the test**

Append to `apps/core/tests.py`:

```python
class HistoryPageTests(TestCase):
    def test_history_page_renders(self):
        response = self.client.get('/historie/')
        self.assertEqual(response.status_code, 200)
        self.assertContains(response, 'Nirmal K. Sethia')
        self.assertContains(response, '12. april 2016')
```

- [ ] **Step 5: Run the test**

Run: `python manage.py test apps.core.tests.HistoryPageTests`
Expected: PASS

- [ ] **Step 6: Commit**

```bash
git add apps/core/views.py demo/urls.py apps/core/templates/core/historie.html apps/core/tests.py
git commit -m "Add Chitra history page"
```

---

### Task 4: Rooms section (overview + 4 room pages)

**Files:**
- Modify: `apps/core/views.py` (add `ROOMS` data, `rom`, `rom_detail` views)
- Modify: `demo/urls.py` (add routes)
- Create: `apps/core/templates/core/rom.html`
- Create: `apps/core/templates/core/rom-detail.html`
- Create: `static/scss/store/rooms.scss`, `static/scss/store/rooms.css`
- Test: `apps/core/tests.py`

**Interfaces:**
- Produces: URL names `rom` (`/rom/`) and `rom_detail` (`/rom/<slug>/`), a module-level `ROOMS` list of dicts (`slug`, `name`, `tagline`, `description`) in `apps/core/views.py` that Task 7 (home page teaser) also reads.

- [ ] **Step 1: Add the room data and views**

In `apps/core/views.py`, add near the top (after the imports, before `custom_404`):

```python
ROOMS = [
    {
        'slug': 'styrerommet',
        'name': 'Styrerommet',
        'tagline': 'Board Room',
        'description': (
            'Et rolig og fokusert rom for styremøter, forhandlinger og '
            'strategisamlinger, innredet med samme oppmerksomhet på '
            'detaljer som resten av huset.'
        ),
    },
    {
        'slug': 'den-bla-lounge',
        'name': 'Den blå lounge',
        'tagline': 'Blue Lounge',
        'description': (
            'En intim loungeavdeling for mingling, mottakelser og '
            'uformelle samtaler før eller etter et arrangement.'
        ),
    },
    {
        'slug': 'te-lounge',
        'name': 'Te-lounge',
        'tagline': 'Tea Lounge',
        'description': (
            'Viet til teseremoni og en rolig pause i programmet, i '
            'samarbeid med det britiske tehuset Newby Teas.'
        ),
    },
    {
        'slug': 'spisestuen',
        'name': 'Spisestuen',
        'tagline': 'Dining Room',
        'description': (
            'Rammen rundt Chitras middager og private festmiddager, der '
            'mat, vertskap og atmosfære møtes.'
        ),
    },
]
```

Add the views after `historie`:

```python
def rom(request):
    return render(request, 'core/rom.html', {'rooms': ROOMS})

def rom_detail(request, slug):
    room = next((r for r in ROOMS if r['slug'] == slug), None)
    if room is None:
        raise Http404
    return render(request, 'core/rom-detail.html', {'room': room})
```

`Http404` is already available via the existing `from django.http import *` at the top of the file.

- [ ] **Step 2: Add the routes**

In `demo/urls.py`, add after the `historie/` line:

```python
    path('rom/', rom, name="rom"),
    path('rom/<slug:slug>/', rom_detail, name="rom_detail"),
```

- [ ] **Step 3: Write the overview template**

Create `apps/core/templates/core/rom.html`:

```html
{% extends 'core/base.html' %}
{% load static %}

{% block head %}
<title>Rom | Chitra</title>
<meta name="description" content="Fire rom hos Chitra House: Styrerommet, Den blå lounge, Te-lounge og Spisestuen.">
<meta name="author" content="Chitra">
<link rel="canonical" href="https://www.chitra.no{{ request.path }}">
<meta property="og:type" content="website">
<meta property="og:url" content="https://www.chitra.no{{ request.get_full_path }}">
<meta property="og:site_name" content="Chitra">
<meta property="og:title" content="Rom | Chitra">
<meta property="og:description" content="Fire rom hos Chitra House: Styrerommet, Den blå lounge, Te-lounge og Spisestuen.">
<meta property="og:locale" content="nb_NO">
{% endblock %}

{% block content %}

<link rel="stylesheet" href="{% static 'scss/store/om-oss.css' %}" type="text/css">
<link rel="stylesheet" href="{% static 'scss/store/rooms.css' %}" type="text/css">

<section class="page-banner">
    <div class="overlay-top"></div>
    <div class="media-placeholder"><span class="media-placeholder-label">Interiør, Chitra House</span></div>
    <div class="overlay-bottom"></div>
    <div class="content">
        <div class="text">
            <h1>Rom hos Chitra</h1>
            <p>Fire rom, én atmosfære – hvert av dem egnet for en annen del av arrangementet ditt.</p>
        </div>
    </div>
</section>

<section class="room-grid-section">
    <div class="content">
        <div class="room-grid">
            {% for room in rooms %}
            <a class="room-card" href="{% url 'rom_detail' room.slug %}">
                <div class="media-placeholder room-card-media"><span class="media-placeholder-label">{{ room.name }}</span></div>
                <div class="room-card-body">
                    <span class="room-card-tagline">{{ room.tagline }}</span>
                    <h2>{{ room.name }}</h2>
                    <p>{{ room.description }}</p>
                    <span class="room-card-cta">Se rommet<i class="fa-light fa-arrow-right"></i></span>
                </div>
            </a>
            {% endfor %}
        </div>
    </div>
</section>

{% endblock %}
```

- [ ] **Step 4: Write the detail template**

Create `apps/core/templates/core/rom-detail.html`:

```html
{% extends 'core/base.html' %}
{% load static %}

{% block head %}
<title>{{ room.name }} | Chitra</title>
<meta name="description" content="{{ room.description }}">
<meta name="author" content="Chitra">
<link rel="canonical" href="https://www.chitra.no{{ request.path }}">
<meta property="og:type" content="website">
<meta property="og:url" content="https://www.chitra.no{{ request.get_full_path }}">
<meta property="og:site_name" content="Chitra">
<meta property="og:title" content="{{ room.name }} | Chitra">
<meta property="og:description" content="{{ room.description }}">
<meta property="og:locale" content="nb_NO">
{% endblock %}

{% block content %}

<link rel="stylesheet" href="{% static 'scss/store/om-oss.css' %}" type="text/css">
<link rel="stylesheet" href="{% static 'scss/store/rooms.css' %}" type="text/css">

<section class="page-banner">
    <div class="overlay-top"></div>
    <div class="media-placeholder"><span class="media-placeholder-label">{{ room.name }}</span></div>
    <div class="overlay-bottom"></div>
    <div class="content">
        <div class="text">
            <a href="{% url 'rom' %}" class="back-link"><i class="fa-light fa-arrow-left"></i>Alle rom</a>
            <span class="room-detail-tagline">{{ room.tagline }}</span>
            <h1>{{ room.name }}</h1>
        </div>
    </div>
</section>

<section class="story">
    <div class="content">
        <div class="story-media">
            <div class="story-media-inner media-placeholder"><span class="media-placeholder-label">{{ room.name }}</span></div>
        </div>
        <div class="story-text">
            <p class="lead">{{ room.description }}</p>
            <div class="about-cta">
                <a href="{% url 'kontakt' %}" class="button primary">Ta kontakt<i class="fa-light fa-arrow-up-right"></i></a>
            </div>
        </div>
    </div>
</section>

{% endblock %}
```

- [ ] **Step 5: Write the rooms stylesheet**

Write this content to **both** `static/scss/store/rooms.scss` and `static/scss/store/rooms.css`:

```css
.room-grid-section {
  padding: 96px 0;
}

.room-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 32px;
}

@media (max-width: 900px) {
  .room-grid {
    grid-template-columns: 1fr;
  }
}

.room-card {
  display: block;
  text-decoration: none;
  color: var(--chitra-charcoal);
  border: 1px solid var(--chitra-line);
  border-radius: 6px;
  overflow: hidden;
  transition: box-shadow 0.2s ease;
}

.room-card:hover {
  box-shadow: 0 12px 32px rgba(31, 31, 31, 0.12);
}

.room-card-media {
  min-height: 220px;
  border-radius: 0;
  border: none;
}

.room-card-body {
  padding: 24px;
}

.room-card-tagline {
  font-family: "Inter Tight", sans-serif;
  font-size: 0.75rem;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: var(--chitra-brass);
}

.room-card-body h2 {
  font-family: "Cormorant Garamond", serif;
  font-size: 1.75rem;
  margin: 8px 0 12px;
}

.room-card-cta {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  margin-top: 16px;
  color: var(--chitra-brass-dark);
  font-weight: 600;
}

.room-detail-tagline {
  display: block;
  font-family: "Inter Tight", sans-serif;
  font-size: 0.8rem;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: var(--chitra-ivory-deep);
  margin-bottom: 8px;
}
```

- [ ] **Step 6: Write the test**

Append to `apps/core/tests.py`:

```python
class RoomsPageTests(TestCase):
    def test_room_overview_lists_all_four_rooms(self):
        response = self.client.get('/rom/')
        self.assertEqual(response.status_code, 200)
        self.assertContains(response, 'Styrerommet')
        self.assertContains(response, 'Den blå lounge')
        self.assertContains(response, 'Te-lounge')
        self.assertContains(response, 'Spisestuen')

    def test_room_detail_renders(self):
        response = self.client.get('/rom/te-lounge/')
        self.assertEqual(response.status_code, 200)
        self.assertContains(response, 'Newby Teas')

    def test_unknown_room_slug_is_404(self):
        response = self.client.get('/rom/ikke-et-rom/')
        self.assertEqual(response.status_code, 404)
```

- [ ] **Step 7: Run the tests**

Run: `python manage.py test apps.core.tests.RoomsPageTests`
Expected: PASS

- [ ] **Step 8: Commit**

```bash
git add apps/core/views.py demo/urls.py apps/core/templates/core/rom.html apps/core/templates/core/rom-detail.html static/scss/store/rooms.scss static/scss/store/rooms.css apps/core/tests.py
git commit -m "Add Chitra rooms overview and detail pages"
```

---

### Task 5: Gallery page

**Files:**
- Modify: `apps/core/views.py` (add `galleri` view)
- Modify: `demo/urls.py` (add route)
- Create: `apps/core/templates/core/galleri.html`
- Create: `static/scss/store/galleri.scss`, `static/scss/store/galleri.css`
- Test: `apps/core/tests.py`

**Interfaces:**
- Produces: URL name `galleri` at `/galleri/`.

- [ ] **Step 1: Add the view and route**

In `apps/core/views.py`, add after `rom_detail`:

```python
def galleri(request):
    return render(request, 'core/galleri.html')
```

In `demo/urls.py`, add after the `rom/<slug:slug>/` line:

```python
    path('galleri/', galleri, name="galleri"),
```

- [ ] **Step 2: Write the template**

Create `apps/core/templates/core/galleri.html`:

```html
{% extends 'core/base.html' %}
{% load static %}

{% block head %}
<title>Galleri | Chitra</title>
<meta name="description" content="Et innblikk i Chitra House – rom, kunst og utsikt over Oslofjorden.">
<meta name="author" content="Chitra">
<link rel="canonical" href="https://www.chitra.no{{ request.path }}">
<meta property="og:type" content="website">
<meta property="og:url" content="https://www.chitra.no{{ request.get_full_path }}">
<meta property="og:site_name" content="Chitra">
<meta property="og:title" content="Galleri | Chitra">
<meta property="og:description" content="Et innblikk i Chitra House – rom, kunst og utsikt over Oslofjorden.">
<meta property="og:locale" content="nb_NO">
{% endblock %}

{% block content %}

<link rel="stylesheet" href="{% static 'scss/store/galleri.css' %}" type="text/css">

<section class="page-banner">
    <div class="overlay-top"></div>
    <div class="media-placeholder"><span class="media-placeholder-label">Chitra House</span></div>
    <div class="overlay-bottom"></div>
    <div class="content">
        <div class="text">
            <h1>Galleri</h1>
            <p>Et innblikk i rommene, kunsten og utsikten som møter deg hos Chitra.</p>
        </div>
    </div>
</section>

<section class="gallery-section">
    <div class="content">
        <div class="gallery-grid">
            <div class="media-placeholder gallery-item"><span class="media-placeholder-label">Fjordutsikt fra terrassen</span></div>
            <div class="media-placeholder gallery-item"><span class="media-placeholder-label">Spisestuen dekket til middag</span></div>
            <div class="media-placeholder gallery-item"><span class="media-placeholder-label">Den blå lounge</span></div>
            <div class="media-placeholder gallery-item"><span class="media-placeholder-label">Styrerommet</span></div>
            <div class="media-placeholder gallery-item"><span class="media-placeholder-label">Hagen om sommeren</span></div>
            <div class="media-placeholder gallery-item"><span class="media-placeholder-label">Fra kunstsamlingen</span></div>
            <div class="media-placeholder gallery-item"><span class="media-placeholder-label">Te-lounge</span></div>
            <div class="media-placeholder gallery-item"><span class="media-placeholder-label">Chitra House sett fra sjøen</span></div>
        </div>
    </div>
</section>

{% endblock %}
```

- [ ] **Step 3: Write the gallery stylesheet**

Write this content to **both** `static/scss/store/galleri.scss` and `static/scss/store/galleri.css`:

```css
.gallery-section {
  padding: 96px 0;
}

.gallery-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 20px;
}

@media (max-width: 900px) {
  .gallery-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

.gallery-item {
  aspect-ratio: 1 / 1;
  min-height: 0;
}
```

- [ ] **Step 4: Write the test**

Append to `apps/core/tests.py`:

```python
class GalleryPageTests(TestCase):
    def test_gallery_page_renders(self):
        response = self.client.get('/galleri/')
        self.assertEqual(response.status_code, 200)
        self.assertContains(response, 'Galleri')
        self.assertContains(response, 'Fjordutsikt fra terrassen')
```

- [ ] **Step 5: Run the test**

Run: `python manage.py test apps.core.tests.GalleryPageTests`
Expected: PASS

- [ ] **Step 6: Commit**

```bash
git add apps/core/views.py demo/urls.py apps/core/templates/core/galleri.html static/scss/store/galleri.scss static/scss/store/galleri.css apps/core/tests.py
git commit -m "Add Chitra gallery page"
```

---

### Task 6: Rebuild nav and footer

**Files:**
- Modify: `apps/core/templates/core/nav.html` (full rewrite)
- Modify: `apps/core/templates/core/footer.html` (full rewrite)
- Modify: `static/scss/store/nav.scss`, `nav.css` (append wordmark styles)
- Test: `apps/core/tests.py`

**Interfaces:**
- Consumes: URL names `om_oss`, `historie`, `rom`, `galleri`, `blog` (added in Task 11 — see note below), `kontakt` from earlier tasks and `demo/urls.py`.
- Produces: every page's nav/footer chrome now points only at Chitra routes.

Note on ordering: `blog`/`nyheter` isn't routed until Task 11. Use a plain `/nyheter/` path string here (not `{% url 'blog' %}`) so this task doesn't depend on Task 11 being done first; Task 11 doesn't need to touch nav/footer since the hardcoded path will already be correct.

- [ ] **Step 1: Rewrite nav.html**

Replace the full contents of `apps/core/templates/core/nav.html`:

```html
{% load static %}
{% url 'kontakt' as kontakt_url %}
<link rel="stylesheet" href="{% static 'scss/store/nav.css' %}" type="text/css">


<div id="mobileNav">
    <div class="hamburger" id="hamburger" onclick="menu()">
        <span></span>
        <span></span>
        <span></span>
    </div>
    <a href="/" class="logo"><span class="wordmark">Chitra</span></a>
    <a href="{{ kontakt_url }}" class="button">Ta kontakt<i class="fa-light fa-arrow-up-right"></i></a>

    <div id="sidebar">
        <div class="sidebar-links">
            <a href="{% url 'om_oss' %}" class="sidebar-link"><span>Om oss</span></a>
            <a href="{% url 'historie' %}" class="sidebar-link"><span>Historie</span></a>
            <a href="{% url 'rom' %}" class="sidebar-link"><span>Rom</span></a>
            <a href="{% url 'galleri' %}" class="sidebar-link"><span>Galleri</span></a>
            <a href="/nyheter/" class="sidebar-link"><span>Nyheter</span></a>
            <a href="{{ kontakt_url }}" class="sidebar-link"><span>Kontakt</span></a>
        </div>
        <div class="sidebar-footer">
            <a href="{{ kontakt_url }}" class="button">Ta kontakt<i class="fa-light fa-arrow-up-right"></i></a>
        </div>
    </div>
</div>

<div id="desNav">
    <div class="content">
        <div class="links">
            <a href="{% url 'om_oss' %}" class="sidebar-link"><span>Om oss</span></a>
            <a href="{% url 'historie' %}" class="sidebar-link"><span>Historie</span></a>
            <a href="{% url 'rom' %}" class="sidebar-link"><span>Rom</span></a>
            <a href="{% url 'galleri' %}" class="sidebar-link"><span>Galleri</span></a>
            <a href="/nyheter/" class="sidebar-link"><span>Nyheter</span></a>
        </div>
        <a href="/" class="logo"><span class="wordmark">Chitra</span></a>
        <a href="{{ kontakt_url }}" class="button">Ta kontakt<i class="fa-light fa-arrow-up-right"></i></a>
    </div>
</div>
```

- [ ] **Step 2: Rewrite footer.html**

Replace the full contents of `apps/core/templates/core/footer.html`:

```html
{% load static %}
<link rel="stylesheet" href="{% static 'scss/store/footer.css' %}" type="text/css">

<div class="footer">
    <div class="content">
        <div class="top">
            <div class="top-text">
                <h2>{{ site_settings.footer_cta_title }}</h2>
                <p>{{ site_settings.footer_cta_text }}</p>
                <div class="buttons">
                    <a href="{% url 'kontakt' %}" class="button primary">Ta kontakt<i class="fa-light fa-arrow-up-right"></i></a>
                </div>
            </div>
            <div class="signup-card">
                <div class="media-placeholder"><span class="media-placeholder-label">Chitra House</span></div>
            </div>
        </div>
        <div class="bottom">
            <div class="links first">
                <p>Navigasjon</p>
                <a href="{% url 'om_oss' %}">Om oss</a>
                <a href="{% url 'historie' %}">Historie</a>
                <a href="{% url 'rom' %}">Rom</a>
                <a href="{% url 'galleri' %}">Galleri</a>
                <a href="/nyheter/">Nyheter</a>
                <a href="{% url 'kontakt' %}">Kontakt</a>
                <a href="{% url 'personvern' %}">Personvernerklæring</a>
            </div>
            <div class="links">
                <p>Kontakt</p>
                <a href="tel:+47{{ site_settings.contact_phone|cut:' ' }}">+47 {{ site_settings.contact_phone }}</a>
                <a href="mailto:{{ site_settings.contact_email }}">{{ site_settings.contact_email }}</a>
                <span>Snarøyveien 34, 1364 Fornebu</span>
            </div>
            <div class="copyright">
                <span class="wordmark">Chitra</span>
                <p>© {% now "Y" %} Chitra House. Alle rettigheter forbeholdes.</p>
                <p>Nettside utviklet med ❤️ av Webiser</p>
            </div>
        </div>
    </div>
</div>
```

- [ ] **Step 3: Add wordmark styling**

Append to **both** `static/scss/store/nav.scss` and `static/scss/store/nav.css`:

```css
.logo .wordmark {
  font-family: "Cormorant Garamond", serif;
  font-size: 1.6rem;
  font-weight: 600;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  color: var(--chitra-charcoal);
}
```

- [ ] **Step 4: Write the test**

Append to `apps/core/tests.py`:

```python
class NavFooterTests(TestCase):
    def test_nav_and_footer_only_link_to_chitra_pages(self):
        response = self.client.get('/')
        self.assertContains(response, 'Chitra')
        self.assertContains(response, 'Ta kontakt')
        self.assertNotContains(response, 'Bli utstiller')
        self.assertNotContains(response, 'Kommende messer')
```

- [ ] **Step 5: Run the test**

Run: `python manage.py test apps.core.tests.NavFooterTests`
Expected: PASS

- [ ] **Step 6: Commit**

```bash
git add apps/core/templates/core/nav.html apps/core/templates/core/footer.html static/scss/store/nav.scss static/scss/store/nav.css apps/core/tests.py
git commit -m "Rebuild nav and footer for Chitra"
```

---

### Task 7: Rebuild the home page

**Files:**
- Modify: `apps/core/templates/core/index.html` (full rewrite of `head` and `content` blocks)
- Modify: `static/scss/store/base.scss`, `base.css` (append teaser-grid styles)
- Test: `apps/core/tests.py`

**Interfaces:**
- Consumes: `ROOMS` is not needed here (kept simple — home links to `/rom/`, doesn't enumerate rooms).

- [ ] **Step 1: Rewrite index.html**

Replace the full contents of `apps/core/templates/core/index.html`:

```html
{% extends 'core/base.html' %}
{% load static %}

{% block head %}
<title>Chitra House | Selskapslokale i Fornebu, Oslo</title>
<meta name="description" content="Chitra House er et privat selskapslokale i Fornebu utenfor Oslo, med utsikt over fjorden. Et sted for styremøter, middager og private feiringer.">
<meta name="author" content="Chitra">
<meta name="keywords" content="Chitra House, selskapslokale Oslo, selskapslokale Fornebu, eventlokale Oslo, konferanselokale Oslo">

<link rel="canonical" href="https://www.chitra.no{{ request.path }}">

<meta property="og:type" content="website">
<meta property="og:url" content="https://www.chitra.no{{ request.get_full_path }}">
<meta property="og:site_name" content="Chitra">
<meta property="og:title" content="Chitra House | Selskapslokale i Fornebu, Oslo">
<meta property="og:description" content="Chitra House er et privat selskapslokale i Fornebu utenfor Oslo, med utsikt over fjorden. Et sted for styremøter, middager og private feiringer.">
<meta property="og:locale" content="nb_NO">

<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:title" content="Chitra House | Selskapslokale i Fornebu, Oslo">
<meta name="twitter:description" content="Chitra House er et privat selskapslokale i Fornebu utenfor Oslo, med utsikt over fjorden.">
{% endblock %}

{% block content %}

<link rel="stylesheet" href="{% static 'scss/store/base.css' %}" type="text/css">

<section class="cover">
    <div class="overlay-top"></div>
    <div class="overlay-bottom"></div>
    <div class="media-placeholder"><span class="media-placeholder-label">Chitra House – hovedbilde</span></div>
    <div class="content">
        <div class="text">
            <h1>{{ site_settings.hero_title }}</h1>
            <p>{{ site_settings.hero_subtitle }}</p>
            <div class="buttons">
                <a href="{% url 'kontakt' %}" class="button primary">Ta kontakt<i class="fa-light fa-arrow-up-right"></i></a>
                <a href="{% url 'om_oss' %}" class="button secondary">Om Chitra<i class="fa-light fa-arrow-up-right"></i></a>
            </div>
        </div>
    </div>
</section>

<section class="about" id="om-chitra">
    <div class="content">
        <div class="text">
            <h2>Et sted uten like</h2>
        </div>
        <div class="feature-rows">
            <div class="feature-row">
                <div class="feature-image media-placeholder"><span class="media-placeholder-label">Chitra House</span></div>
                <div class="feature-text">
                    <h3>Et sted å møtes, å dele, å føle</h3>
                    <p>Chitra House ligger rett utenfor Oslo sentrum, med vid utsikt over Oslofjorden. Vi tar imot alt fra 2 til 300 gjester, til styremøter, middager og private feiringer. <a href="{% url 'om_oss' %}">Les mer om oss</a></p>
                </div>
            </div>
            <div class="feature-row reverse">
                <div class="feature-image media-placeholder"><span class="media-placeholder-label">Åpningen i 2016</span></div>
                <div class="feature-text">
                    <h3>Fra 2011 til i dag</h3>
                    <p>Chitra Collection ble grunnlagt i 2011 av Nirmal K. Sethia. Chitra House Oslo åpnet 12. april 2016 – et fotavtrykk, en drøm og en filosofi. <a href="{% url 'historie' %}">Les historien</a></p>
                </div>
            </div>
            <div class="feature-row">
                <div class="feature-image media-placeholder"><span class="media-placeholder-label">Spisestuen</span></div>
                <div class="feature-text">
                    <h3>Fire rom, én atmosfære</h3>
                    <p>Styrerommet, Den blå lounge, Te-lounge og Spisestuen – hvert rom egnet for en annen del av arrangementet ditt. <a href="{% url 'rom' %}">Se rommene</a></p>
                </div>
            </div>
        </div>
    </div>
</section>

<section class="meeting-place" id="galleri-nyheter">
    <div class="content">
        <div class="text">
            <span class="badge">Galleri og nyheter</span>
            <h2>Et innblikk i Chitra</h2>
            <p>Se bilder fra huset og les siste nytt fra Chitra House.</p>
        </div>
        <div class="meeting-cards">
            <a href="{% url 'galleri' %}" class="meeting-card">
                <div class="media-placeholder"><span class="media-placeholder-label">Galleri</span></div>
                <div class="meeting-card-overlay">
                    <h3>Galleri</h3>
                    <span class="meeting-card-cta">Se bilder<i class="fa-light fa-arrow-up-right"></i></span>
                </div>
            </a>
            <a href="/nyheter/" class="meeting-card">
                <div class="media-placeholder"><span class="media-placeholder-label">Nyheter</span></div>
                <div class="meeting-card-overlay">
                    <h3>Nyheter</h3>
                    <span class="meeting-card-cta">Les mer<i class="fa-light fa-arrow-up-right"></i></span>
                </div>
            </a>
        </div>
    </div>
</section>

{% endblock %}
```

- [ ] **Step 2: Add teaser-card styling**

Append to **both** `static/scss/store/base.scss` and `static/scss/store/base.css`:

```css
.meeting-cards .meeting-card {
  position: relative;
  display: block;
  border-radius: 6px;
  overflow: hidden;
  min-height: 320px;
}

.meeting-cards .meeting-card .media-placeholder {
  position: absolute;
  inset: 0;
  min-height: 0;
  border-radius: 0;
  border: none;
}
```

(This only adds absolute-positioning for the placeholder inside a teaser card; the rest of `.meeting-card`/`.meeting-card-overlay` styling already exists in this file from the original fair listing and is reused as-is.)

- [ ] **Step 3: Write the test**

Append to `apps/core/tests.py`:

```python
class HomePageTests(TestCase):
    def test_homepage_has_no_fair_content(self):
        response = self.client.get('/')
        self.assertEqual(response.status_code, 200)
        self.assertNotContains(response, 'Bolig og Hytte')
        self.assertNotContains(response, 'countdown')
        self.assertContains(response, 'Ta kontakt')
        self.assertContains(response, 'Fire rom')
```

- [ ] **Step 4: Run the test**

Run: `python manage.py test apps.core.tests.HomePageTests`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add apps/core/templates/core/index.html static/scss/store/base.scss static/scss/store/base.css apps/core/tests.py
git commit -m "Rebuild home page for Chitra"
```

---

### Task 8: Recontent About Us

**Files:**
- Modify: `apps/core/templates/core/om-oss.html` (full rewrite)
- Test: `apps/core/tests.py`

- [ ] **Step 1: Rewrite om-oss.html**

Replace the full contents of `apps/core/templates/core/om-oss.html`:

```html
{% extends 'core/base.html' %}
{% load static %}

{% block head %}
<title>Om oss | Chitra</title>
<meta name="description" content="Chitra House er oppkalt etter Chitra, avdøde kone til eier Nirmal K. Sethia. Les om huset, filosofien og kunsten som møter deg.">
<meta name="author" content="Chitra">
<meta name="keywords" content="om Chitra, Chitra House, Nirmal K. Sethia, selskapslokale Fornebu, selskapslokale Oslo">

<link rel="canonical" href="https://www.chitra.no{{ request.path }}">

<meta property="og:type" content="website">
<meta property="og:url" content="https://www.chitra.no{{ request.get_full_path }}">
<meta property="og:site_name" content="Chitra">
<meta property="og:title" content="Om oss | Chitra">
<meta property="og:description" content="Chitra House er oppkalt etter Chitra, avdøde kone til eier Nirmal K. Sethia. Les om huset, filosofien og kunsten som møter deg.">
<meta property="og:locale" content="nb_NO">

<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:title" content="Om oss | Chitra">
<meta name="twitter:description" content="Chitra House er oppkalt etter Chitra, avdøde kone til eier Nirmal K. Sethia.">

<script type="application/ld+json">
{
    "@context": "https://schema.org",
    "@type": "AboutPage",
    "url": "https://www.chitra.no/om-oss/",
    "mainEntity": {"@id": "https://www.chitra.no/#organization"}
}
</script>

<script type="application/ld+json">
{
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": [
        {"@type": "ListItem", "position": 1, "name": "Hjem", "item": "https://www.chitra.no/"},
        {"@type": "ListItem", "position": 2, "name": "Om oss", "item": "https://www.chitra.no/om-oss/"}
    ]
}
</script>

{% endblock %}

{% block content %}

<link rel="stylesheet" href="{% static 'scss/store/om-oss.css' %}" type="text/css">

<section class="page-banner">
    <div class="overlay-top"></div>
    <div class="media-placeholder"><span class="media-placeholder-label">Chitra House</span></div>
    <div class="overlay-bottom"></div>
    <div class="content">
        <div class="text">
            <h1>Om Chitra</h1>
            <p>Et sted å møtes, å dele, å føle. Et sted uten like.</p>
        </div>
    </div>
</section>

<section class="story">
    <div class="content">
        <div class="story-media">
            <div class="story-media-inner media-placeholder"><span class="media-placeholder-label">Chitra House, interiør</span></div>
        </div>
        <div class="story-text">
            <h2>Hvem vi er</h2>
            <p class="lead">Chitra House ligger rett utenfor Oslo sentrum, med vid utsikt over Oslofjorden – et hus for forretningsmøter, feiringer, arrangementer og sosiale sammenkomster.</p>

            <div class="founder-list">
                <div class="founder-row">
                    <div class="founder-heading">
                        <div class="founder-avatar">NKS</div>
                        <div>
                            <h3>Nirmal K. Sethia</h3>
                            <span class="founder-role">Grunnlegger, Chitra Collection</span>
                        </div>
                    </div>
                    <p>Nirmal K. Sethia har siden 2011 personlig valgt ut hvert eiendom i Chitra Collection for sin unike atmosfære. Chitra House Oslo, den første av disse som åpnet for publikum, sto klar 12. april 2016. Huset er oppkalt etter og tilegnet hans avdøde kone, Chitra.</p>
                </div>
            </div>

            <blockquote>«Chitra er et fotavtrykk, en drøm og en filosofi.» – Nirmal K. Sethia</blockquote>
            <p class="mission-text">Her blir gjester møtt med det Sethia selv kaller verdighet, ærlighet og diskresjon. Chitra House rommer også verk fra Hennes Majestet Dronning Sonjas grafikkpris, blant annet av Kjell Nupen, Magne Furuholmen og Ørnulf Opdahl. Vi tar imot alt fra 2 til 300 gjester, og kombinerer kongelig indisk tradisjon med skandinavisk natur og skjønnhet.</p>
        </div>
    </div>
</section>

<section class="about-cta">
    <div class="content">
        <h2>Vil du besøke Chitra House?</h2>
        <p>Se rommene våre, eller ta kontakt for å planlegge ditt neste møte eller arrangement.</p>
        <div class="buttons">
            <a href="{% url 'rom' %}" class="button primary">Se rommene<i class="fa-light fa-arrow-up-right"></i></a>
            <a href="{% url 'kontakt' %}" class="button secondary">Ta kontakt<i class="fa-light fa-arrow-up-right"></i></a>
        </div>
    </div>
</section>

{% endblock %}
```

- [ ] **Step 2: Write the test**

Append to `apps/core/tests.py`:

```python
class AboutPageTests(TestCase):
    def test_about_page_tells_chitras_story_not_the_fair_founders(self):
        response = self.client.get('/om-oss/')
        self.assertEqual(response.status_code, 200)
        self.assertContains(response, 'Nirmal K. Sethia')
        self.assertNotContains(response, 'Morten Østli')
        self.assertNotContains(response, 'Loose Moose')
```

- [ ] **Step 3: Run the test**

Run: `python manage.py test apps.core.tests.AboutPageTests`
Expected: PASS

- [ ] **Step 4: Commit**

```bash
git add apps/core/templates/core/om-oss.html apps/core/tests.py
git commit -m "Recontent About Us page for Chitra"
```

---

### Task 9: Recontent Contact page

**Files:**
- Modify: `apps/core/templates/core/kontakt.html` (full rewrite)
- Test: `apps/core/tests.py`

- [ ] **Step 1: Rewrite kontakt.html**

Replace the full contents of `apps/core/templates/core/kontakt.html`:

```html
{% extends 'core/base.html' %}
{% load static %}

{% block head %}
<title>Kontakt | Chitra</title>
<meta name="description" content="Ta kontakt med Chitra House for å planlegge ditt neste møte eller arrangement. Adresse: Snarøyveien 34, 1364 Fornebu.">
<meta name="author" content="Chitra">
<meta name="keywords" content="kontakt Chitra, Chitra House Fornebu, selskapslokale Oslo booking">

<link rel="canonical" href="https://www.chitra.no{{ request.path }}">

<meta property="og:type" content="website">
<meta property="og:url" content="https://www.chitra.no{{ request.get_full_path }}">
<meta property="og:site_name" content="Chitra">
<meta property="og:title" content="Kontakt | Chitra">
<meta property="og:description" content="Ta kontakt med Chitra House for å planlegge ditt neste møte eller arrangement.">
<meta property="og:locale" content="nb_NO">

<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:title" content="Kontakt | Chitra">
<meta name="twitter:description" content="Ta kontakt med Chitra House for å planlegge ditt neste møte eller arrangement.">

<script type="application/ld+json">
{
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": [
        {"@type": "ListItem", "position": 1, "name": "Hjem", "item": "https://www.chitra.no/"},
        {"@type": "ListItem", "position": 2, "name": "Kontakt", "item": "https://www.chitra.no/kontakt/"}
    ]
}
</script>

{% endblock %}

{% block content %}

<link rel="stylesheet" href="{% static 'scss/store/kontakt.css' %}" type="text/css">

<section class="page-banner kontakt-banner" style="background: var(--chitra-brass);">
    <div class="content">
        <div class="text">
            <h1>Kontakt</h1>
            <p>Vi ønsker deg velkommen til å ta kontakt for å planlegge ditt neste møte eller arrangement hos Chitra House.</p>
        </div>
    </div>
</section>

<section class="kontakt-section">
    <div class="content">
        <div class="kontakt-grid">
            <div class="kontakt-info">
                <div class="kontakt-photo media-placeholder"><span class="media-placeholder-label">Chitra House, Fornebu</span></div>
                <div class="kontakt-card">
                    <span class="kontakt-eyebrow">Din kontaktperson</span>
                    <h2>{{ site_settings.contact_person }}</h2>
                    <div class="kontakt-chips">
                        <a href="tel:+47{{ site_settings.contact_phone|cut:' ' }}" class="kontakt-chip"><i class="fa-light fa-phone"></i>{{ site_settings.contact_phone }}</a>
                        <a href="mailto:{{ site_settings.contact_email }}" class="kontakt-chip"><i class="fa-light fa-envelope"></i>{{ site_settings.contact_email }}</a>
                        <span class="kontakt-chip"><i class="fa-light fa-location-dot"></i>Snarøyveien 34, 1364 Fornebu</span>
                    </div>
                </div>
            </div>

            <div class="kontakt-form-wrap">
                <div class="kontakt-form-card">
                    <div class="form-error" role="alert" hidden><i class="fa-light fa-triangle-exclamation"></i><span>Noe gikk galt. Sjekk feltene og prøv igjen.</span></div>

                    <form id="kontaktForm" class="kontakt-form" method="post" action="{% url 'kontakt' %}" novalidate>
                        {% csrf_token %}
                        <input type="hidden" name="started_at" id="startedAt" value="">

                        <div class="kontakt-honeypot" aria-hidden="true">
                            <label for="id_website">Nettside</label>
                            <input type="text" id="id_website" name="website" tabindex="-1" autocomplete="off">
                        </div>

                        <div class="field">
                            <label for="id_name">Navn</label>
                            <input type="text" id="id_name" name="name" autocomplete="name" maxlength="100" required>
                            <span class="field-error"></span>
                        </div>
                        <div class="field">
                            <label for="id_email">Din e-post</label>
                            <input type="email" id="id_email" name="email" autocomplete="email" required>
                            <span class="field-error"></span>
                        </div>
                        <div class="field">
                            <label for="id_phone">Telefonnummer</label>
                            <input type="tel" id="id_phone" name="phone" autocomplete="tel" maxlength="30" required>
                            <span class="field-error"></span>
                        </div>
                        <div class="field">
                            <label for="id_message">Din henvendelse</label>
                            <textarea id="id_message" name="message" rows="5" maxlength="2000" required></textarea>
                            <span class="field-error"></span>
                        </div>

                        <button type="submit" class="button primary kontakt-submit">
                            <span class="btn-label">Send henvendelse</span>
                            <span class="btn-spinner" aria-hidden="true"></span>
                        </button>
                    </form>

                    <div class="kontakt-success" hidden>
                        <svg class="success-check" viewBox="0 0 72 72" aria-hidden="true">
                            <circle class="success-check-ring" cx="36" cy="36" r="32"></circle>
                            <path class="success-check-mark" d="M22 37l10 10 18-20"></path>
                        </svg>
                        <h3>Meldingen er sendt!</h3>
                        <p>Takk for at du tok kontakt – vi svarer så raskt vi kan.</p>
                        <button type="button" class="button secondary kontakt-reset">Send en ny melding</button>
                    </div>
                </div>
            </div>
        </div>

        <div class="messe-detail-map">
            <iframe
                src="https://www.google.com/maps?q=Snar%C3%B8yveien+34,+1364+Fornebu&output=embed"
                loading="lazy"
                referrerpolicy="no-referrer-when-downgrade"
                allowfullscreen
                title="Kart – Chitra House, Fornebu">
            </iframe>
        </div>
    </div>
</section>

<script src="{% static 'js/kontakt.js' %}" defer></script>

{% endblock %}
```

Note: `.messe-detail-map` is a CSS class name that's about to survive from `messe-detail.css`'s deletion in Task 13 — it isn't loaded by this page's stylesheet (`kontakt.css`). Add its (small, generic) rule to `kontakt.css`/`.scss` instead so the map has real styling once `messe-detail.css` is gone:

- [ ] **Step 2: Add map styling to kontakt.css**

Append to **both** `static/scss/store/kontakt.scss` and `static/scss/store/kontakt.css`:

```css
.messe-detail-map {
  margin-top: 48px;
  border-radius: 6px;
  overflow: hidden;
  border: 1px solid var(--chitra-line);
}

.messe-detail-map iframe {
  width: 100%;
  height: 360px;
  border: 0;
  display: block;
}
```

- [ ] **Step 3: Write the test**

Append to `apps/core/tests.py`:

```python
class ContactPageTests(TestCase):
    def test_contact_page_shows_chitra_contact_details(self):
        response = self.client.get('/kontakt/')
        self.assertEqual(response.status_code, 200)
        self.assertContains(response, 'Fornebu')
        self.assertNotContains(response, 'Org.nr')
```

- [ ] **Step 4: Run the test**

Run: `python manage.py test apps.core.tests.ContactPageTests`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add apps/core/templates/core/kontakt.html static/scss/store/kontakt.scss static/scss/store/kontakt.css apps/core/tests.py
git commit -m "Recontent Contact page for Chitra"
```

---

### Task 10: Recontent Privacy page and rename its stylesheet

**Files:**
- Rename: `static/scss/store/regler.scss` → `static/scss/store/legal.scss`
- Rename: `static/scss/store/regler.css` → `static/scss/store/legal.css`
- Modify: `apps/core/templates/core/personvern.html` (full rewrite)
- Test: `apps/core/tests.py`

- [ ] **Step 1: Rename the shared legal-page stylesheet**

```bash
git mv static/scss/store/regler.scss static/scss/store/legal.scss
git mv static/scss/store/regler.css static/scss/store/legal.css
```

(`regler.html`, the only other consumer of this stylesheet, is deleted in Task 13 — this file becomes the "legal page" stylesheet used only by `personvern.html` from here on.)

- [ ] **Step 2: Rewrite personvern.html**

Replace the full contents of `apps/core/templates/core/personvern.html`:

```html
{% extends 'core/base.html' %}
{% load static %}

{% block head %}
<title>Personvernerklæring | Chitra</title>
<meta name="description" content="Personvernerklæring for Chitra. Les hvordan vi behandler personopplysninger og ivaretar personvernet ditt på www.chitra.no.">
<meta name="author" content="Chitra">
<meta name="keywords" content="personvern, personvernerklæring, GDPR, Chitra House">

<link rel="canonical" href="https://www.chitra.no{{ request.path }}">

<meta property="og:type" content="website">
<meta property="og:url" content="https://www.chitra.no{{ request.get_full_path }}">
<meta property="og:site_name" content="Chitra">
<meta property="og:title" content="Personvernerklæring | Chitra">
<meta property="og:description" content="Personvernerklæring for Chitra. Les hvordan vi behandler personopplysninger og ivaretar personvernet ditt.">
<meta property="og:locale" content="nb_NO">

<script type="application/ld+json">
{
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": [
        {"@type": "ListItem", "position": 1, "name": "Hjem", "item": "https://www.chitra.no/"},
        {"@type": "ListItem", "position": 2, "name": "Personvernerklæring", "item": "https://www.chitra.no/juridisk/personvern/"}
    ]
}
</script>

{% endblock %}

{% block content %}

<link rel="stylesheet" href="{% static 'scss/store/legal.css' %}" type="text/css">

<section class="page-banner regler-banner" style="background: var(--chitra-brass);">
    <div class="content">
        <div class="text">
            <h1>Personvernerklæring</h1>
            <p class="updated">Slik behandler vi dine opplysninger og håndterer personvern</p>
        </div>
    </div>
</section>

<section class="regler-content">
    <div class="content">
        <ol class="rule-list">
            <li class="rule-item">
                <span class="rule-num">01.</span>
                <div class="rule-body">
                    <p class="rule-title">Innledning</p>
                    <p>Chitra House respekterer ditt personvern. Denne personvernerklæringen forklarer hvordan vi samler inn og bruker personopplysninger når du besøker vår nettside www.chitra.no.</p>
                </div>
            </li>
            <li class="rule-item">
                <span class="rule-num">02.</span>
                <div class="rule-body">
                    <p class="rule-title">Behandlingsansvarlig</p>
                    <p>Chitra House er behandlingsansvarlig for personopplysninger som behandles via denne nettsiden.</p>
                    <p>Kontaktinformasjon:</p>
                    <p>Firma: Chitra House<br>E-post: <a href="mailto:{{ site_settings.contact_email }}">{{ site_settings.contact_email }}</a><br>Telefon: <a href="tel:+47{{ site_settings.contact_phone|cut:' ' }}">{{ site_settings.contact_phone }}</a></p>
                </div>
            </li>
            <li class="rule-item">
                <span class="rule-num">03.</span>
                <div class="rule-body">
                    <p class="rule-title">Personopplysninger vi samler inn</p>
                    <p>Vi samler inn følgende informasjon når du bruker nettsiden vår:</p>
                    <ul>
                        <li>Kontaktskjema: Når du fyller ut kontaktskjemaet, innhenter vi navn, e-postadresse og eventuelt annen informasjon du legger inn i meldingen din. Disse opplysningene benyttes kun til å svare på din henvendelse.</li>
                        <li>Analyseverktøy: Vi benytter Umami Analytics eller tilsvarende analyseverktøy som ikke benytter informasjonskapsler (cookies) og ikke samler inn personidentifiserbar informasjon. All data er anonymisert.</li>
                    </ul>
                </div>
            </li>
            <li class="rule-item">
                <span class="rule-num">04.</span>
                <div class="rule-body">
                    <p class="rule-title">Formål med behandlingen</p>
                    <p>Vi bruker personopplysningene til følgende formål:</p>
                    <ul>
                        <li>For å behandle og besvare innsendte henvendelser via kontaktskjema.</li>
                        <li>For å analysere og forbedre nettsidens funksjonalitet og brukeropplevelse gjennom anonymisert analyse.</li>
                    </ul>
                </div>
            </li>
            <li class="rule-item">
                <span class="rule-num">05.</span>
                <div class="rule-body">
                    <p class="rule-title">Rettslig grunnlag</p>
                    <p>Behandling av personopplysninger fra kontaktskjema skjer med grunnlag i samtykke gitt ved innsending. Bruk av anonymisert analyseverktøy skjer på grunnlag av vår berettigede interesse i å forbedre nettsiden.</p>
                </div>
            </li>
            <li class="rule-item">
                <span class="rule-num">06.</span>
                <div class="rule-body">
                    <p class="rule-title">Lagring av personopplysninger</p>
                    <ul>
                        <li>Opplysninger fra kontaktskjema lagres kun så lenge det er nødvendig for å følge opp din henvendelse.</li>
                        <li>Analyseverktøyet lagrer ikke personidentifiserbar informasjon.</li>
                    </ul>
                </div>
            </li>
            <li class="rule-item">
                <span class="rule-num">07.</span>
                <div class="rule-body">
                    <p class="rule-title">Dine rettigheter</p>
                    <p>Du har rett til:</p>
                    <ul>
                        <li>Å be om innsyn i dine personopplysninger.</li>
                        <li>Å be om retting eller sletting av dine data.</li>
                        <li>Å protestere mot eller be om begrensning av behandlingen.</li>
                    </ul>
                    <p>Kontakt oss via informasjonen i punkt 2 for å utøve dine rettigheter.</p>
                </div>
            </li>
            <li class="rule-item">
                <span class="rule-num">08.</span>
                <div class="rule-body">
                    <p class="rule-title">Deling av personopplysninger</p>
                    <p>Vi deler ikke dine personopplysninger med tredjeparter, med mindre dette er nødvendig for å overholde lovkrav eller for å beskytte våre rettigheter.</p>
                </div>
            </li>
            <li class="rule-item">
                <span class="rule-num">09.</span>
                <div class="rule-body">
                    <p class="rule-title">Informasjonssikkerhet</p>
                    <p>Vi benytter passende tekniske og organisatoriske tiltak for å sikre dine data mot uautorisert tilgang og behandling.</p>
                </div>
            </li>
            <li class="rule-item">
                <span class="rule-num">10.</span>
                <div class="rule-body">
                    <p class="rule-title">Endringer i personvernerklæringen</p>
                    <p>Vi forbeholder oss retten til å oppdatere personvernerklæringen. Endringer vil publiseres på denne siden.</p>
                </div>
            </li>
            <li class="rule-item">
                <span class="rule-num">11.</span>
                <div class="rule-body">
                    <p class="rule-title">Klageadgang og teknisk kontakt</p>
                    <p>Dersom du har spørsmål eller ønsker å klage på vår behandling av personopplysninger, kan du kontakte oss via informasjonen i punkt 2.</p>
                    <p>For tekniske spørsmål om nettsiden, kontakt Webiser AS:</p>
                    <p>E-post: <a href="mailto:hei@webiser.no">hei@webiser.no</a><br>Nettside: <a href="https://webiser.no/" target="_blank" rel="noopener">webiser.no</a></p>
                </div>
            </li>
        </ol>
    </div>
</section>

{% endblock %}
```

- [ ] **Step 3: Write the test**

Append to `apps/core/tests.py`:

```python
class PersonvernPageTests(TestCase):
    def test_privacy_page_names_chitra_as_controller(self):
        response = self.client.get('/juridisk/personvern/')
        self.assertEqual(response.status_code, 200)
        self.assertContains(response, 'Chitra House')
        self.assertNotContains(response, 'Loose Moose')
        self.assertNotContains(response, 'boligoghytte.com')
```

- [ ] **Step 4: Run the test**

Run: `python manage.py test apps.core.tests.PersonvernPageTests`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add static/scss/store/legal.scss static/scss/store/legal.css apps/core/templates/core/personvern.html apps/core/tests.py
git commit -m "Recontent Privacy page for Chitra and rename its stylesheet"
```

---

### Task 11: Reskin the blog app into "Nyheter" and seed content

**Files:**
- Modify: `demo/urls.py` (wire up `blog`/`blog_post` routes — currently unrouted)
- Modify: `apps/blog/templates/core/blog.html` (full rewrite)
- Modify: `apps/blog/templates/core/blog-post.html` (full rewrite)
- Modify: `static/scss/store/blog/blog.scss`, `blog.css` (currently empty)
- Modify: `static/scss/store/blog/blog-detail.scss`, `blog-detail.css` (currently empty)
- Create: `apps/blog/migrations/0011_seed_chitra_news.py`
- Test: `apps/core/tests.py`

**Interfaces:**
- Consumes: `apps.blog.models.Blog` (`title`, `text`, `slug`, `image`, `author`, `created_at`, `get_absolute_url()` → `reverse('blog_post', args=[slug, id])`).
- Produces: URL names `blog` (`/nyheter/`) and `blog_post` (`/nyheter/<slug>-<id>/`).

- [ ] **Step 1: Wire up the blog routes**

The blog app's views/URLs exist but were never routed. In `demo/urls.py`, add after the `kontakt/` line:

```python
    path('nyheter/', blog, name="blog"),
    path('nyheter/<slug:slug>-<int:id>/', blog_post, name="blog_post"),
```

(`blog` and `blog_post` are already imported at the top of `demo/urls.py` via `from apps.blog.views import *`.)

- [ ] **Step 2: Rewrite blog.html**

Replace the full contents of `apps/blog/templates/core/blog.html` (this file's old content was leftover Webiser-agency-blog boilerplate, not Bolig og Hytte or Chitra content — it's being fully replaced, not adapted):

```html
{% extends 'core/base.html' %}
{% load static %}

{% block head %}
<title>Nyheter | Chitra</title>
<meta name="description" content="Nyheter, samarbeid og sesonghøydepunkter fra Chitra House.">
<meta name="author" content="Chitra">
<link rel="canonical" href="https://www.chitra.no{{ request.path }}">
<meta property="og:type" content="website">
<meta property="og:url" content="https://www.chitra.no{{ request.get_full_path }}">
<meta property="og:site_name" content="Chitra">
<meta property="og:title" content="Nyheter | Chitra">
<meta property="og:description" content="Nyheter, samarbeid og sesonghøydepunkter fra Chitra House.">
<meta property="og:locale" content="nb_NO">
{% endblock %}

{% block content %}

<link rel="stylesheet" href="{% static 'scss/store/blog/blog.css' %}" type="text/css">

<section class="page-banner">
    <div class="overlay-top"></div>
    <div class="media-placeholder"><span class="media-placeholder-label">Chitra House</span></div>
    <div class="overlay-bottom"></div>
    <div class="content">
        <div class="text">
            <h1>Nyheter fra Chitra House</h1>
            <p>Historier, samarbeid og sesonghøydepunkter fra huset.</p>
        </div>
    </div>
</section>

<section class="blog-list-section">
    <div class="content">
        <div class="blog-posts">
            {% for item in post %}
            <a class="post" href="{% url 'blog_post' item.slug item.id %}">
                <div class="blog-card">
                    {% if item.image %}
                    <div class="blog-image"><img src="{{ item.image.url }}" alt="{{ item.title }}"></div>
                    {% else %}
                    <div class="blog-image media-placeholder"><span class="media-placeholder-label">{{ item.title }}</span></div>
                    {% endif %}
                    <div class="blog-image-text">
                        <h2>{{ item.title }}</h2>
                        <p>Skrevet av <strong>{{ item.author }}</strong>, {{ item.created_at|date:"d. F Y" }}</p>
                    </div>
                </div>
            </a>
            {% empty %}
            <p class="blog-empty">Ingen nyheter publisert ennå.</p>
            {% endfor %}
        </div>
    </div>
</section>

{% endblock %}
```

- [ ] **Step 3: Rewrite blog-post.html**

Replace the full contents of `apps/blog/templates/core/blog-post.html`:

```html
{% extends 'core/base.html' %}
{% load static %}

{% block head %}
<title>{{ post_info.title }} | Chitra</title>
<meta name="description" content="{{ post_text|truncatechars:160 }}">
<meta name="author" content="Chitra">
<link rel="canonical" href="https://www.chitra.no{{ request.path }}">
<meta property="og:type" content="article">
<meta property="og:url" content="https://www.chitra.no{{ request.get_full_path }}">
<meta property="og:site_name" content="Chitra">
<meta property="og:title" content="{{ post_info.title }}">
<meta property="og:description" content="{{ post_text|truncatechars:160 }}">
{% endblock %}

{% block content %}

<link rel="stylesheet" href="{% static 'scss/store/blog/blog-detail.css' %}" type="text/css">

<section class="blog-detail-section">
    <div class="content">
        {% if post_info.image %}
        <div class="blog-detail-media"><img src="{{ post_info.image.url }}" alt="{{ post_info.title }}"></div>
        {% else %}
        <div class="blog-detail-media media-placeholder"><span class="media-placeholder-label">{{ post_info.title }}</span></div>
        {% endif %}
        <h1>{{ post_info.title }}</h1>
        <p class="blog-detail-byline">Skrevet av <strong>{{ post_info.author }}</strong>, {{ post_info.created_at|date:"d. F Y" }}</p>
        {% autoescape off %}
        <div class="blog-detail-text">{{ post_info.text }}</div>
        {% endautoescape %}
        <a href="{% url 'kontakt' %}" class="button primary">Ta kontakt<i class="fa-light fa-arrow-up-right"></i></a>
    </div>
</section>

{% endblock %}
```

- [ ] **Step 4: Write the news list/detail stylesheets**

Write this content to **both** `static/scss/store/blog/blog.scss` and `static/scss/store/blog/blog.css`:

```css
.blog-list-section {
  padding: 96px 0;
}

.blog-posts {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 32px;
}

@media (max-width: 900px) {
  .blog-posts {
    grid-template-columns: 1fr;
  }
}

.post {
  display: block;
  text-decoration: none;
  color: var(--chitra-charcoal);
  border: 1px solid var(--chitra-line);
  border-radius: 6px;
  overflow: hidden;
}

.blog-image,
.blog-image img {
  min-height: 200px;
  width: 100%;
  object-fit: cover;
  display: block;
  border-radius: 0;
  border: none;
}

.blog-image-text {
  padding: 20px;
}

.blog-image-text h2 {
  font-family: "Cormorant Garamond", serif;
  font-size: 1.4rem;
  margin: 0 0 8px;
}
```

Write this content to **both** `static/scss/store/blog/blog-detail.scss` and `static/scss/store/blog/blog-detail.css`:

```css
.blog-detail-section {
  padding: 96px 0;
  max-width: 760px;
  margin: 0 auto;
}

.blog-detail-media,
.blog-detail-media img {
  width: 100%;
  min-height: 320px;
  object-fit: cover;
  border-radius: 6px;
  margin-bottom: 32px;
}

.blog-detail-section h1 {
  font-family: "Cormorant Garamond", serif;
  font-size: 2.4rem;
  color: var(--chitra-charcoal);
}

.blog-detail-byline {
  color: var(--chitra-charcoal-soft);
  margin-bottom: 24px;
}

.blog-detail-text {
  margin-bottom: 32px;
  line-height: 1.7;
}
```

- [ ] **Step 5: Seed three adapted news posts**

Create `apps/blog/migrations/0011_seed_chitra_news.py` (check the actual latest migration number in `apps/blog/migrations/` first with `ls apps/blog/migrations/` and adjust the filename/`dependencies` if it isn't `0010_blog_slug`):

```python
from django.db import migrations
from django.utils.text import slugify


POSTS = [
    {
        'title': 'Chitra Summer åpner for sesongen',
        'author': 'Chitra House',
        'text': (
            '<p>Hvert år åpner glasshuset i hagen for Chitra Summer – en '
            'sesong med skreddersydde middager, sommerfester og sosiale '
            'sammenkomster, med utsikt over Oslofjorden som ramme.</p>'
            '<p>Ta kontakt for å høre mer om hva vi kan by på i årets '
            'sesong.</p>'
        ),
    },
    {
        'title': 'Kunst og te: et samarbeid',
        'author': 'Chitra House',
        'text': (
            '<p>Chitra House samarbeider med det britiske tehuset Newby '
            'Teas om kunstinspirerte teserier – et eksempel på hvordan vi '
            'kombinerer kunst, håndverk og gjestfrihet i Te-lounge.</p>'
        ),
    },
    {
        'title': 'Chitra House søker driftsdirektør',
        'author': 'Chitra House',
        'text': (
            '<p>Vi søker en erfaren driftsdirektør med bakgrunn fra hotell, '
            'restaurant eller eventbransjen, og solid økonomisk forståelse, '
            'til å lede den daglige driften av huset.</p>'
        ),
    },
]


def seed_posts(apps, schema_editor):
    Blog = apps.get_model('blog', 'Blog')
    for post in POSTS:
        Blog.objects.create(
            title=post['title'],
            text=post['text'],
            slug=slugify(post['title']),
            author=post['author'],
        )


def remove_seeded_posts(apps, schema_editor):
    Blog = apps.get_model('blog', 'Blog')
    Blog.objects.filter(author='Chitra House').delete()


class Migration(migrations.Migration):

    dependencies = [
        ('blog', '0010_blog_slug'),
    ]

    operations = [
        migrations.RunPython(seed_posts, remove_seeded_posts),
    ]
```

Run: `python manage.py migrate blog`
Expected: applies cleanly, creates 3 `Blog` rows.

- [ ] **Step 6: Write the test**

Append to `apps/core/tests.py`:

```python
class NewsPageTests(TestCase):
    def test_news_list_shows_seeded_posts(self):
        response = self.client.get('/nyheter/')
        self.assertEqual(response.status_code, 200)
        self.assertContains(response, 'Chitra Summer')

    def test_news_detail_renders_and_links_to_contact(self):
        from apps.blog.models import Blog
        post = Blog.objects.get(title='Chitra Summer åpner for sesongen')
        response = self.client.get(f'/nyheter/{post.slug}-{post.id}/')
        self.assertEqual(response.status_code, 200)
        self.assertContains(response, 'Oslofjorden')
```

- [ ] **Step 7: Run the tests**

Run: `python manage.py test apps.core.tests.NewsPageTests`
Expected: PASS

- [ ] **Step 8: Commit**

```bash
git add demo/urls.py apps/blog/templates/core/blog.html apps/blog/templates/core/blog-post.html static/scss/store/blog/blog.scss static/scss/store/blog/blog.css static/scss/store/blog/blog-detail.scss static/scss/store/blog/blog-detail.css apps/blog/migrations/0011_seed_chitra_news.py apps/core/tests.py
git commit -m "Wire up and reskin Nyheter (blog) with seeded Chitra content"
```

---

### Task 12: Trim the dashboard to Nyheter/Henvendelser/Innstillinger

**Files:**
- Modify: `apps/dashboard/views.py` (remove messe/partner/pamelding views)
- Modify: `apps/dashboard/urls.py` (remove their routes)
- Modify: `apps/dashboard/forms.py` (remove `MesseForm`/`PartnerForm`, drop `org_number` from `SiteSettingsForm`)
- Delete: `apps/dashboard/templates/dashboard/messe_form.html`, `messe_list.html`, `partner_form.html`, `partner_list.html`, `pamelding_list.html`, `pamelding_detail.html`
- Modify: `apps/dashboard/templates/dashboard/base.html` (sidebar nav, title, logo)
- Modify: `apps/dashboard/templates/dashboard/home.html` (stat cards)
- Modify: `apps/dashboard/templates/dashboard/login.html` (title/logo)
- Test: `apps/core/tests.py`

- [ ] **Step 1: Trim dashboard views**

Replace the full contents of `apps/dashboard/views.py`:

```python
from django.contrib import messages
from django.contrib.auth import authenticate, login, logout
from django.contrib.auth.decorators import login_required
from django.shortcuts import get_object_or_404, redirect, render

from apps.core.models import ContactMessage, SiteSettings

from .decorators import staff_required
from .forms import SiteSettingsForm


def dashboard_login(request):
    if request.user.is_authenticated and request.user.is_staff:
        return redirect('dashboard:home')

    error = None
    if request.method == 'POST':
        username = request.POST.get('username', '').strip()
        password = request.POST.get('password', '')
        user = authenticate(request, username=username, password=password)
        if user is not None and user.is_staff:
            login(request, user)
            next_url = request.POST.get('next') or request.GET.get('next')
            return redirect(next_url or 'dashboard:home')
        error = 'Feil brukernavn eller passord.'

    return render(request, 'dashboard/login.html', {
        'error': error,
        'next': request.GET.get('next', ''),
    })


@login_required
def dashboard_logout(request):
    logout(request)
    return redirect('dashboard_login')


@staff_required
def home(request):
    context = {
        'henvendelse_count': ContactMessage.objects.inbox().count(),
        'ulest_henvendelse_count': ContactMessage.objects.inbox().filter(is_read=False).count(),
    }
    return render(request, 'dashboard/home.html', context)


@staff_required
def henvendelse_list(request):
    show_spam = request.GET.get('spam') == '1'
    qs = ContactMessage.objects.spam() if show_spam else ContactMessage.objects.inbox()
    return render(request, 'dashboard/henvendelse_list.html', {
        'henvendelser': qs,
        'show_spam': show_spam,
        'spam_count': ContactMessage.objects.spam().count(),
        'inbox_count': ContactMessage.objects.inbox().count(),
    })


@staff_required
def henvendelse_detail(request, pk):
    henvendelse = get_object_or_404(ContactMessage, pk=pk)
    if not henvendelse.is_read:
        henvendelse.is_read = True
        henvendelse.save(update_fields=['is_read'])
    return render(request, 'dashboard/henvendelse_detail.html', {'henvendelse': henvendelse})


@staff_required
def henvendelse_delete(request, pk):
    henvendelse = get_object_or_404(ContactMessage, pk=pk)
    if request.method == 'POST':
        henvendelse.delete()
        messages.success(request, 'Henvendelsen ble slettet.')
    return redirect('dashboard:henvendelse_list')


@staff_required
def innstillinger(request):
    settings_obj = SiteSettings.load()
    if request.method == 'POST':
        form = SiteSettingsForm(request.POST, instance=settings_obj)
        if form.is_valid():
            form.save()
            messages.success(request, 'Innstillingene ble lagret.')
            return redirect('dashboard:innstillinger')
    else:
        form = SiteSettingsForm(instance=settings_obj)
    return render(request, 'dashboard/innstillinger.html', {'form': form})
```

- [ ] **Step 2: Trim dashboard urls**

Replace the full contents of `apps/dashboard/urls.py`:

```python
from django.urls import path

from . import views

app_name = 'dashboard'

urlpatterns = [
    path('', views.home, name='home'),

    path('henvendelser/', views.henvendelse_list, name='henvendelse_list'),
    path('henvendelser/<int:pk>/', views.henvendelse_detail, name='henvendelse_detail'),
    path('henvendelser/<int:pk>/slett/', views.henvendelse_delete, name='henvendelse_delete'),

    path('innstillinger/', views.innstillinger, name='innstillinger'),
]
```

- [ ] **Step 3: Trim dashboard forms**

Replace the full contents of `apps/dashboard/forms.py`:

```python
from django import forms

from apps.core.models import SiteSettings


class SiteSettingsForm(forms.ModelForm):
    class Meta:
        model = SiteSettings
        fields = [
            'hero_title', 'hero_subtitle',
            'footer_cta_title', 'footer_cta_text',
            'contact_person', 'contact_email', 'contact_phone',
        ]
        widgets = {
            'hero_title': forms.TextInput(attrs={'class': 'dash-input'}),
            'hero_subtitle': forms.Textarea(attrs={'class': 'dash-textarea', 'rows': 3}),
            'footer_cta_title': forms.TextInput(attrs={'class': 'dash-input'}),
            'footer_cta_text': forms.Textarea(attrs={'class': 'dash-textarea', 'rows': 3}),
            'contact_person': forms.TextInput(attrs={'class': 'dash-input'}),
            'contact_email': forms.EmailInput(attrs={'class': 'dash-input'}),
            'contact_phone': forms.TextInput(attrs={'class': 'dash-input'}),
        }
```

- [ ] **Step 4: Delete the removed CRUD templates**

```bash
git rm apps/dashboard/templates/dashboard/messe_form.html apps/dashboard/templates/dashboard/messe_list.html apps/dashboard/templates/dashboard/partner_form.html apps/dashboard/templates/dashboard/partner_list.html apps/dashboard/templates/dashboard/pamelding_list.html apps/dashboard/templates/dashboard/pamelding_detail.html
```

- [ ] **Step 5: Trim the dashboard sidebar and branding**

In `apps/dashboard/templates/dashboard/base.html`:

Replace line 8:
```html
    <title>{% block title %}Kontrollpanel{% endblock %} | Chitra</title>
```

Replace lines 24-27 (the brand link):
```html
            <a href="{% url 'dashboard:home' %}" class="dash-brand">
                <span class="wordmark">Chitra</span>
                <span>Kontrollpanel</span>
            </a>
```

Replace the `<nav class="dash-nav">` block (lines 29-47) — drop the Kommende messer / Partnere / Utstillerpåmeldinger links, keep Oversikt / Henvendelser / Innstillinger:
```html
            <nav class="dash-nav">
                <a href="{% url 'dashboard:home' %}" class="dash-nav-link{% if request.resolver_match.url_name == 'home' %} is-active{% endif %}">
                    <i class="fa-light fa-grid-2"></i><span>Oversikt</span>
                </a>
                <a href="{% url 'dashboard:henvendelse_list' %}" class="dash-nav-link{% if 'henvendelse' in request.resolver_match.url_name %} is-active{% endif %}">
                    <i class="fa-light fa-envelope"></i><span>Henvendelser</span>
                </a>
                <a href="{% url 'dashboard:innstillinger' %}" class="dash-nav-link{% if request.resolver_match.url_name == 'innstillinger' %} is-active{% endif %}">
                    <i class="fa-light fa-sliders"></i><span>Innstillinger</span>
                </a>
            </nav>
```

- [ ] **Step 6: Trim the dashboard home page**

Replace the full contents of `apps/dashboard/templates/dashboard/home.html`:

```html
{% extends 'dashboard/base.html' %}
{% load static %}

{% block title %}Oversikt{% endblock %}
{% block page_title %}Oversikt{% endblock %}

{% block content %}

<div class="dash-stat-grid">
    <div class="dash-stat-card">
        <span class="dash-stat-label">Henvendelser{% if ulest_henvendelse_count %} <span class="dash-badge">{{ ulest_henvendelse_count }} nye</span>{% endif %}</span>
        <span class="dash-stat-num">{{ henvendelse_count }}</span>
        <a href="{% url 'dashboard:henvendelse_list' %}" class="dash-stat-link">Se alle henvendelser<i class="fa-light fa-arrow-right"></i></a>
    </div>
</div>

{% endblock %}
```

- [ ] **Step 7: Update the login page title/logo**

In `apps/dashboard/templates/dashboard/login.html`, replace any `Bolig og Hytte` text and the `<img>` logo with `<span class="wordmark">Chitra</span>` (mirroring the nav wordmark) and update the `<title>` to end in `| Chitra`. Read the file first to match its exact existing markup before editing.

- [ ] **Step 8: Write the test**

Append to `apps/core/tests.py`:

```python
class DashboardTrimTests(TestCase):
    def setUp(self):
        from django.contrib.auth import get_user_model
        User = get_user_model()
        self.staff = User.objects.create_user('dash-admin', password='test-pass-123', is_staff=True)

    def test_dashboard_home_has_no_fair_stats(self):
        self.client.force_login(self.staff)
        response = self.client.get('/kontrollpanel/')
        self.assertEqual(response.status_code, 200)
        self.assertNotContains(response, 'Kommende messer')
        self.assertNotContains(response, 'Utstillerpåmeldinger')

    def test_removed_dashboard_routes_404(self):
        self.client.force_login(self.staff)
        response = self.client.get('/kontrollpanel/messer/')
        self.assertEqual(response.status_code, 404)
```

- [ ] **Step 9: Run the tests**

Run: `python manage.py test apps.core.tests.DashboardTrimTests`
Expected: PASS

- [ ] **Step 10: Commit**

```bash
git add apps/dashboard apps/core/tests.py
git commit -m "Trim dashboard to Nyheter/Henvendelser/Innstillinger"
```

---

### Task 13: Remove the trade-fair backend and old pages (final cleanup)

This is the last task — by now nothing references `Messe`, `ExhibitorApplication`, or `Partner` from the frontend, so they can be deleted safely.

**Files:**
- Modify: `apps/core/models.py` (remove `Messe`, `ExhibitorApplication`, `Partner`, `MesseQuerySet`, `PartnerQuerySet`, `NORWEGIAN_MONTHS`; update `SiteSettings` defaults, drop `org_number`)
- Modify: `apps/core/admin.py` (remove registrations)
- Modify: `apps/core/forms.py` (remove `ExhibitorApplicationForm`)
- Modify: `apps/core/context_processors.py` (drop `next_messe`/`upcoming_messer`/`partners`)
- Modify: `apps/core/sitemaps.py` (remove `MesseSitemap`, finalize `StaticViewSitemap`, add `NyheterSitemap`)
- Modify: `apps/core/views.py` (remove `bli_utstiller`/`kommende_messer`/`messe_detail`/`info_standleie`/`regler`, rewrite `robots_txt`/`llms_txt`)
- Modify: `demo/urls.py` (remove their routes)
- Modify: `apps/core/templates/core/base.html` (remove the `{% include 'core/partners.html' %}` line)
- Modify: `demo/settings.py` (rename `EXHIBITOR_NOTIFY_EMAIL` → `CONTACT_NOTIFY_EMAIL`, drop `ZAPIER_WEBHOOK_BLI_UTSTILLER`)
- Modify: `.env.example` (mirror the settings rename)
- Delete: `apps/core/templates/core/bli-utstiller.html`, `info-standleie.html`, `regler.html`, `kommende-messer.html`, `messe-detail.html`, `partners.html`
- Delete: `static/scss/store/bli-utstiller.scss/.css/.css.map`, `info-standleie.*`, `kommende-messer.*`, `messe-detail.*`, `partners.*`
- Delete: `static/js/home.js`, `footer.js`, `bli-utstiller.js`, `messe-map.js`, `datepicker.js`
- Create: `apps/core/migrations/0031_...py` (via `makemigrations`)
- Test: `apps/core/tests.py`

- [ ] **Step 1: Trim models.py**

In `apps/core/models.py`, delete the `NORWEGIAN_MONTHS` list, the `MesseQuerySet` class, the `Messe` class, the `PartnerQuerySet` class, and the `Partner` class, and the `ExhibitorApplication` class entirely. Update the `SiteSettings` class to:

```python
class SiteSettings(models.Model):
    hero_title = models.CharField(
        'Hovedoverskrift (forside)', max_length=200,
        default='Et sted å møtes, å dele, å føle.')
    hero_subtitle = models.TextField(
        'Undertekst (forside)', blank=True,
        default='Chitra House ligger rett utenfor Oslo, med utsikt over fjorden – et sted for styremøter, middager og private feiringer, uansett anledning.')
    footer_cta_title = models.CharField(
        'Overskrift (footer)', max_length=200,
        default='Planlegg ditt neste arrangement hos oss')
    footer_cta_text = models.TextField(
        'Tekst (footer)', blank=True,
        default='Fra styremøter til private feiringer – ta kontakt for å høre mer om hva Chitra House kan by på.')
    contact_person = models.CharField('Kontaktperson', max_length=100, blank=True, default='Johnny Steen')
    contact_email = models.EmailField('Kontakt e-post', blank=True, default='johnny.steen@chitra.no')
    contact_phone = models.CharField('Kontakt telefon', max_length=30, blank=True, default='962 08 861')

    class Meta:
        verbose_name = 'Nettstedinnstillinger'
        verbose_name_plural = 'Nettstedinnstillinger'

    def __str__(self):
        return 'Nettstedinnstillinger'

    def save(self, *args, **kwargs):
        self.pk = 1
        super().save(*args, **kwargs)

    @classmethod
    def load(cls):
        obj, _ = cls.objects.get_or_create(pk=1)
        return obj
```

`ContactMessageQuerySet` and `ContactMessage` stay unchanged. The file's remaining imports (`from datetime import datetime, time`, `from django.utils.text import slugify`) are no longer used once `Messe` is gone — remove those two import lines too, keeping only `from django.db import models` and `from django.utils import timezone`.

- [ ] **Step 2: Trim admin.py**

Replace the full contents of `apps/core/admin.py`:

```python
from django.contrib import admin
```

- [ ] **Step 3: Trim forms.py**

Replace the full contents of `apps/core/forms.py`:

```python
from django import forms

from .models import ContactMessage


class ContactMessageForm(forms.ModelForm):
    class Meta:
        model = ContactMessage
        fields = ['name', 'email', 'phone', 'message']
```

- [ ] **Step 4: Trim context_processors.py**

Replace the full contents of `apps/core/context_processors.py`:

```python
from .models import SiteSettings


def site_context(request):
    return {
        'site_settings': SiteSettings.load(),
    }
```

- [ ] **Step 5: Rewrite sitemaps.py**

Replace the full contents of `apps/core/sitemaps.py`:

```python
from django.contrib.sitemaps import Sitemap
from django.urls import reverse

from apps.blog.models import Blog


class StaticViewSitemap(Sitemap):
    protocol = "https"

    priorities = {
        "hjemme": 1.0,
        "om_oss": 0.8,
        "historie": 0.6,
        "rom": 0.8,
        "galleri": 0.6,
        "blog": 0.6,
        "kontakt": 0.7,
        "personvern": 0.2,
    }

    def items(self):
        return list(self.priorities)

    def location(self, item):
        return reverse(item)

    def changefreq(self, item):
        return "weekly" if item == "hjemme" else "monthly"

    def priority(self, item):
        return self.priorities[item]


class NyheterSitemap(Sitemap):
    protocol = "https"
    changefreq = "monthly"
    priority = 0.5

    def items(self):
        return Blog.objects.all()

    def lastmod(self, item):
        return item.created_at


sitemaps = {
    "static": StaticViewSitemap,
    "nyheter": NyheterSitemap,
}
```

- [ ] **Step 6: Trim views.py and rewrite robots_txt/llms_txt**

In `apps/core/views.py`, remove the `bli_utstiller`, `kommende_messer`, `messe_detail`, `info_standleie`, and `regler` functions entirely (keep `custom_404`, `hjemme`, `om_oss`, `personvern`, `kontakt`, `historie`, `rom`, `rom_detail`, `galleri`, `ROOMS`).

In the `kontakt` view, update the notification email to use the renamed setting:

```python
            send_mail(
                subject=f'Ny henvendelse – {contact_message.name}',
                message=(
                    f'Navn: {contact_message.name}\n'
                    f'E-post: {contact_message.email}\n'
                    f'Telefon: {contact_message.phone}\n\n'
                    f'Melding:\n{contact_message.message}'
                ),
                from_email=settings.DEFAULT_FROM_EMAIL,
                recipient_list=[settings.CONTACT_NOTIFY_EMAIL],
                fail_silently=True,
            )
```

Replace `robots_txt`:

```python
def robots_txt(request):
    lines = [
        "User-agent: *",
        "Allow: /",
        "",
        "Sitemap: https://www.chitra.no/sitemap.xml",
    ]
    return HttpResponse("\n".join(lines), content_type="text/plain")
```

Replace `llms_txt`:

```python
def llms_txt(request):
    """
    A plain-text/markdown summary of the site for AI assistants and
    answer engines (the emerging llms.txt convention, see llmstxt.org).
    """
    site_settings = SiteSettings.load()

    lines = [
        "# Chitra",
        "",
        "> Chitra House er et privat selskapslokale i Fornebu utenfor Oslo, "
        "med utsikt over Oslofjorden. Grunnlagt av Nirmal K. Sethia til "
        "minne om hans avdøde kone Chitra. Stedet tar imot alt fra 2 til "
        "300 gjester, til styremøter, middager og private feiringer.",
        "",
        "## Om",
        "- Grunnlagt av Nirmal K. Sethia. Chitra House Oslo åpnet 12. april 2016.",
        "- Kontakt: {} · {} · {}".format(
            site_settings.contact_person, site_settings.contact_email, site_settings.contact_phone,
        ),
        "- Adresse: Snarøyveien 34, 1364 Fornebu",
        "",
        "## Sider",
        "- [Forside](https://www.chitra.no/)",
        "- [Om oss](https://www.chitra.no/om-oss/)",
        "- [Historie](https://www.chitra.no/historie/)",
        "- [Rom](https://www.chitra.no/rom/): Styrerommet, Den blå lounge, Te-lounge, Spisestuen",
        "- [Galleri](https://www.chitra.no/galleri/)",
        "- [Nyheter](https://www.chitra.no/nyheter/)",
        "- [Kontakt](https://www.chitra.no/kontakt/)",
        "",
        "## Maskinlesbare kilder",
        "- Sitemap: https://www.chitra.no/sitemap.xml",
    ]

    return HttpResponse("\n".join(lines), content_type="text/plain; charset=utf-8")
```

- [ ] **Step 7: Trim demo/urls.py**

In `demo/urls.py`, remove the lines routing `regler/`, `info-standleie/`, `kommende-messer/`, `kommende-messer/<slug:slug>/`, and `pamelding/`. The final `urlpatterns` "Pages" section should read:

```python
    # Pages
    path('', hjemme, name="hjemme"),
    path('om-oss/', om_oss, name="om_oss"),
    path('historie/', historie, name="historie"),
    path('rom/', rom, name="rom"),
    path('rom/<slug:slug>/', rom_detail, name="rom_detail"),
    path('galleri/', galleri, name="galleri"),
    path('juridisk/personvern/', personvern, name="personvern"),
    path('kontakt/', kontakt, name="kontakt"),
    path('nyheter/', blog, name="blog"),
    path('nyheter/<slug:slug>-<int:id>/', blog_post, name="blog_post"),
```

(dashboard/SEO/media sections below are untouched.)

- [ ] **Step 8: Remove the global partners include from base.html**

In `apps/core/templates/core/base.html`, remove this line (it sits between `{% block content %}{% endblock %}` and `<footer>`):

```html
  {% include 'core/partners.html' %}
```

- [ ] **Step 9: Delete the old templates and their stylesheets**

```bash
git rm apps/core/templates/core/bli-utstiller.html apps/core/templates/core/info-standleie.html apps/core/templates/core/regler.html apps/core/templates/core/kommende-messer.html apps/core/templates/core/messe-detail.html apps/core/templates/core/partners.html
git rm static/scss/store/bli-utstiller.scss static/scss/store/bli-utstiller.css static/scss/store/bli-utstiller.css.map
git rm static/scss/store/info-standleie.scss static/scss/store/info-standleie.css static/scss/store/info-standleie.css.map
git rm static/scss/store/kommende-messer.scss static/scss/store/kommende-messer.css static/scss/store/kommende-messer.css.map
git rm static/scss/store/messe-detail.scss static/scss/store/messe-detail.css static/scss/store/messe-detail.css.map
git rm static/scss/store/partners.scss static/scss/store/partners.css static/scss/store/partners.css.map
```

- [ ] **Step 10: Delete the orphaned JS files and their references**

```bash
git rm static/js/home.js static/js/footer.js static/js/bli-utstiller.js static/js/messe-map.js static/js/datepicker.js
```

In `apps/core/templates/core/base.html`, remove these two now-dangling script tags:

```html
  <script src="{% static 'js/home.js' %}" defer></script>
  <script src="{% static 'js/footer.js' %}" defer></script>
```

(`nav.js`, `cookie-banner.js`, `kontakt.js`, `main.js` stay — none of them are fair/exhibitor-specific.)

- [ ] **Step 11: Update settings and env example**

In `demo/settings.py`, rename:

```python
DEFAULT_FROM_EMAIL = env('DEFAULT_FROM_EMAIL', EMAIL_HOST_USER)
CONTACT_NOTIFY_EMAIL = env('CONTACT_NOTIFY_EMAIL', DEFAULT_FROM_EMAIL)
```

and:

```python
ZAPIER_WEBHOOK_KONTAKT = env('ZAPIER_WEBHOOK_KONTAKT', '')
```

(drop the `ZAPIER_WEBHOOK_BLI_UTSTILLER` line entirely).

In `.env.example`, rename `EXHIBITOR_NOTIFY_EMAIL` to `CONTACT_NOTIFY_EMAIL` and drop the `ZAPIER_WEBHOOK_BLI_UTSTILLER=` line:

```
# Inbox that new contact-form messages are emailed to.
# Defaults to DEFAULT_FROM_EMAIL if left blank.
CONTACT_NOTIFY_EMAIL=

# Zapier "Catch Hook" webhook URL for the contact form - optional; a
# blank value just disables the webhook. Create a Zap with a
# "Webhooks by Zapier" > "Catch Hook" trigger, then paste the
# generated URL here.
ZAPIER_WEBHOOK_KONTAKT=
```

- [ ] **Step 12: Generate and review the migration**

Run: `python manage.py makemigrations apps.core`
Expected: creates a new migration in `apps/core/migrations/` (e.g. `0031_remove_...py`) that removes the `Messe`, `ExhibitorApplication`, and `Partner` models and alters `SiteSettings` (removing `org_number`, updating field defaults).

Run: `python manage.py migrate`
Expected: applies cleanly.

- [ ] **Step 13: Write the test**

Append to `apps/core/tests.py`:

```python
class BackendRemovalTests(TestCase):
    def test_old_fair_routes_are_gone(self):
        for path in ('/pamelding/', '/regler/', '/info-standleie/', '/kommende-messer/'):
            response = self.client.get(path)
            self.assertEqual(response.status_code, 404, path)

    def test_surviving_routes_still_work(self):
        for path in ('/', '/om-oss/', '/historie/', '/rom/', '/galleri/', '/kontakt/', '/nyheter/', '/juridisk/personvern/'):
            response = self.client.get(path)
            self.assertEqual(response.status_code, 200, path)

    def test_sitemap_robots_and_llms_render(self):
        for path in ('/sitemap.xml', '/robots.txt', '/llms.txt'):
            response = self.client.get(path)
            self.assertEqual(response.status_code, 200, path)
        response = self.client.get('/llms.txt')
        self.assertContains(response, 'Chitra')
        self.assertNotContains(response, 'Loose Moose')

    def test_fair_models_are_gone(self):
        from apps.core import models
        self.assertFalse(hasattr(models, 'Messe'))
        self.assertFalse(hasattr(models, 'ExhibitorApplication'))
        self.assertFalse(hasattr(models, 'Partner'))
```

- [ ] **Step 14: Run the full test suite**

Run: `python manage.py test apps.core apps.blog apps.dashboard`
Expected: all tests PASS (every `TestCase` added across all 13 tasks).

Run: `python manage.py check`
Expected: `System check identified no issues`.

- [ ] **Step 15: Commit**

```bash
git add apps/core apps/blog demo/settings.py demo/urls.py .env.example apps/core/tests.py
git commit -m "Remove the trade-fair backend, old pages, and orphaned static assets"
```

---

## Self-Review

**Spec coverage:**
- Domain model changes (remove Messe/ExhibitorApplication/Partner, keep SiteSettings/ContactMessage, reuse blog as Nyheter) → Task 13 (removal) + Task 11 (blog reuse) + Task 13 (SiteSettings defaults). ✓
- Route table in spec → every row is covered: Home (7), About (8), History (3), Rooms (4), Gallery (5), Nyheter (11), Contact (9), Personvern (10), removed routes (13). ✓
- Dashboard trim → Task 12. ✓
- Visual design (keep fonts, new palette, remove countdown/stepper/marquee, wordmark logo, no-photo placeholders) → Task 1 (tokens/placeholder), Task 2 (color swap), Task 6 (nav/footer — countdown/signup/marquee removed), Task 7 (home — countdown removed). ✓
- SEO/metadata (canonical→chitra.no, Organization schema, robots.txt/llms.txt) → Task 1 (schema), every content task (canonical/OG per page), Task 13 (robots.txt/llms.txt/sitemaps.py). ✓
- Forms (drop ExhibitorApplicationForm, keep ContactMessageForm, enquiry-tone copy) → Task 9 (copy), Task 13 (form removal). ✓
- Out of scope items (no admin-editable Room/Gallery models, no real photography, no logo reproduction, Norwegian only) → respected throughout (ROOMS is a Python constant, not a model; every image is `.media-placeholder`; wordmark is plain text; all copy written is Norwegian). ✓

**Placeholder scan:** No "TBD"/"TODO" in any step; the one deliberately vague step (Task 12 Step 7, login.html) is scoped with an explicit instruction ("read the file first, replace the Bolig og Hytte text and image with the wordmark span") rather than left undefined, because the exact current markup wasn't read during planning — this is the one legitimate exception, not a placeholder.

**Type/name consistency:** `ROOMS` (Task 4) is referenced the same way in Task 4 only — Task 7's home page does not enumerate `ROOMS`, it hardcodes three feature rows, so there's no cross-task signature to keep in sync. URL names (`historie`, `rom`, `rom_detail`, `galleri`, `blog`, `blog_post`, `om_oss`, `kontakt`, `personvern`, `hjemme`) are used identically everywhere they appear across tasks 3–13. `site_settings.contact_person/email/phone` field names are unchanged from the original model (only `org_number` is dropped) and are used consistently in Tasks 6, 9, 10, 13.
