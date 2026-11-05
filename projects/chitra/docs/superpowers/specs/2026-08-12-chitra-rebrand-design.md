# Chitra rebrand — design spec

## Context

This repo is a Django site currently built and branded for **Bolig og Hytte**, a
recurring housing/cabin trade fair in Elverum, Norway (multi-exhibitor booths,
fair dates, sponsor logos). The goal is to rebuild it to represent
**Chitra House** (chitra.no), a single luxury private event venue on Snarøyveien,
Fornebu, just outside Oslo, owned by Nirmal K Sethia — a completely different
business shape. This is a full content, domain-model, and visual rebuild, not a
reskin: the "recurring multi-exhibitor trade fair" concept doesn't map onto "one
venue available for private hire."

Reference content pulled from chitra.no (About/History/Rooms/News/Contact) is
summarized below and is the basis for the new copy. Site language stays
Norwegian only. No stock photography — image slots become styled placeholder
blocks the client can swap for real photography later. No attempt is made to
recreate Chitra's actual logo artwork; a text wordmark placeholder is used
instead.

### Reference facts (from chitra.no)

- **Tagline**: "A place to meet, to share, to feel. A place like no other."
- **Owner**: Nirmal K Sethia. Venue named after his late wife, Chitra.
- **Values**: guests treated with "dignity, honesty and discretion."
- **Capacity**: 2–300 people.
- **Art**: works from HM Queen Sonja's Print Award (Kjell Nupen, Magne
  Furuholmen, Ørnulf Opdahl).
- **History**: Chitra Collection initiative started 2011, properties chosen
  personally by Sethia. Chitra House Oslo opened 12 April 2016 with opera
  singers, harpists, culinary presentations. Described as "a footprint, a
  dream and a philosophy." Sethia: "the first step to divinity is gratitude."
- **Design**: blends Indian heritage with Nordic/Scandinavian aesthetics.
- **Rooms**: Board Room (meetings), Blue Lounge, Tea Lounge, Dining Room —
  minimal public descriptive text beyond names/use, so room-page copy is
  written to be consistent with these facts without inventing false specifics
  (capacity, exact furnishings).
- **Location**: Snarøyveien 34, 1364 Fornebu. ~10 min from Oslo, Oslo fjord
  views, 1.9 acres, 1000m² house. Reachable by boat, helicopter, public
  transport, or car; free on-site parking.
- **Contact**: Johnny Steen, Director of Operations. +47 96 20 88 61,
  johnny.steen@chitra.no.
- **News history** (used as basis for seeded News posts): Chitra Summer
  season launches, an art/tea collaboration, an operations-director hiring
  post. Adapted/paraphrased into Norwegian, not copied verbatim.

## Domain model changes

Remove entirely (models + migrations + all references):

- `Messe` (fair events, countdown, upcoming-fair listing)
- `ExhibitorApplication` (booth sign-up, stand sizes/pricing)
- `Partner` (sponsor-logo marquee)

Keep:

- `SiteSettings` — reused, default field values repurposed for Chitra (hero
  copy, contact person/email/phone, address). `org_number` field dropped
  (Chitra doesn't publish one) or left blank/unused.
- `ContactMessage` (+ its spam/rate-limit protection) — unchanged, becomes the
  one general enquiry form on `/kontakt/`.
- `apps/blog` — unchanged model/admin/views, reused as "Nyheter" (News).
  Seed 3–4 posts adapted from the news history above via a data migration or
  fixture.

Every reference to the removed models must be cleaned out of: `admin.py`,
`forms.py` (`ExhibitorApplicationForm` removed), `views.py`, `urls.py`,
`context_processors.py` (`next_messe`/`upcoming_messer`/`partners` context
removed), `sitemaps.py`, `apps/dashboard` (urls/views/forms/templates for
messer, partnere, pameldinger removed), and `llms.txt`/`robots.txt` generation
in `views.py`.

## Routes

| Route | Change |
|---|---|
| `/` | Rebuilt: hero, About/History/Rooms/Gallery/News teasers, contact CTA |
| `/om-oss/` | Recontented: philosophy, values, capacity, art collection |
| `/historie/` | **New**: Chitra Collection history, Sethia's story |
| `/rom/` | **New**: room overview grid |
| `/rom/styrerommet/` | **New**: Board Room |
| `/rom/den-bla-lounge/` | **New**: Blue Lounge |
| `/rom/te-lounge/` | **New**: Tea Lounge |
| `/rom/spisestuen/` | **New**: Dining Room |
| `/galleri/` | **New**: placeholder image grid |
| `/nyheter/`, `/nyheter/<slug>/` | Blog app reused, reskinned, recontented |
| `/kontakt/` | Recontented: Fornebu address + embedded map, Johnny Steen, same form |
| `/juridisk/personvern/` | Recontented for Chitra (data controller, contact) |
| `/pamelding/` | **Removed** |
| `/info-standleie/` | **Removed** |
| `/regler/` | **Removed** |
| `/kommende-messer/`, `/kommende-messer/<slug>/` | **Removed** |

Dashboard (`/kontrollpanel/`) currently has no section for the blog app (it's
Django-admin-only today) — that doesn't change. Dashboard keeps only:
Henvendelser (contact inbox) and Innstillinger (site settings). Messer,
Partnere, and Pameldinger sections are removed entirely (urls, views, forms,
templates).

## Visual design

- **Typography**: keep the existing Cormorant Garamond (serif, display) +
  Inter Tight (sans, body) pairing already loaded in `base.html` — it already
  reads as elegant/luxury, no change needed.
- **Palette**: replace the current trade-fair blue (`#004876`) and CTA orange
  with a warm ivory/cream base, deep charcoal text, and a single refined
  brass/gold accent — evoking "Indian heritage meets Scandinavian design."
- **Removed UI**: countdown timer, multi-step exhibitor stepper form,
  booth-size choice cards, partner-logo marquee section/component.
- **Logo**: bitmap logo files replaced with a simple serif text wordmark
  ("CHITRA"), clearly a placeholder for the client's real logo asset.
- **Imagery**: no stock photography. Hero/room/gallery image slots become
  styled placeholder blocks (muted gradient/tone panels, no photographic
  content), ready to swap for real photography.

## SEO / metadata

- All canonical URLs, `og:url`, sitemap references switch from
  `boligoghytte.com` to `chitra.no`.
- Organization JSON-LD in `base.html` updated: name "Chitra", founder Nirmal K
  Sethia, address Snarøyveien 34, Fornebu, contact Johnny Steen.
- Per-page titles/descriptions/keywords rewritten for the new content.
- `robots.txt` sitemap URL updated; `llms.txt` rewritten to describe Chitra
  (removes fair/exhibitor sections, adds venue/rooms/history/news).

## Forms

- `ExhibitorApplicationForm` removed along with `ExhibitorApplication`.
- `ContactMessageForm` unchanged (name, email, phone, message) — serves as
  the general enquiry form; copy around it updated to an "we invite you to
  reach out" tone rather than "apply for a booth."

## Out of scope

- No admin-editable Room/Gallery models — the four rooms and gallery are
  fixed content, built as static templates. This can be revisited later if
  the client needs to edit them without a developer.
- No real photography, no attempt to reproduce Chitra's actual logo artwork.
- No English-language version (Norwegian only, per decision).
