# Vexienne Website — Architecture Note

## Stack at a glance

| Layer | Decision | Monthly cost |
|---|---|---|
| Code repository | GitHub (private repo) | Free |
| Hosting | **Vercel Pro**, EU region (Stockholm `arn1` or Frankfurt `fra1`) | $20 |
| Framework | Astro v6 + Tailwind CSS v4 (already built) | — |
| Analytics | Vercel Web Analytics + Speed Insights (cookieless, no banner) | Included |
| Video hosting | **Bunny.net Stream** (EU-based, Slovenia) | $1–3 |
| Domain | `vexienne.com` (already registered by Coegin IT) | Per registrar |
| Email capture | **Phase 2 — not live at launch** | — |
| Shopify | **Phase 3 — subdomain pattern, 2–3 months out** | — |

**Launch cost: ~$21–23/month.** Full build-out (with email + Shopify): ~$40+/month.

---

## Why this stack

- **Vercel Pro** over alternatives: $20/mo for EU region deployment (Stockholm or Frankfurt), GDPR compliance via EU-US DPF certification + SCCs, SOC 2 Type 2 + ISO 27001:2022, best Astro DX, integrated analytics. Cloudflare Pages is the runner-up but splits work across more dashboards. Netlify slips behind on EU residency tier. Strict "data never leaves EU" residency requires Vercel Enterprise, but is not required for a marketing site of this scope.
- **GitHub** stays as code source-of-truth. Vercel auto-deploys on push, gives preview URLs per PR. GitHub Pages was the option we rejected — *not* GitHub itself.
- **Bunny Stream** over Vimeo: EU infrastructure (Slovenia HQ), per-GB pricing (no per-minute charges), $1/mo minimum, fully cookieless if configured right. Vimeo Starter ($12/mo) is the documented alternative if polished out-of-the-box player matters more than EU data sovereignty.
- **No database, no Supabase, no Firebase.** The site has no persistent state of its own — copy lives in source, images are static assets, future subscribers live in the mailing service.

---

## Architecture diagram

```
                                  User in browser
                                         │
                                         ▼
                          ┌──────────────────────────┐
                          │   vexienne.com (DNS)     │
                          │   apex + www → Vercel    │
                          └──────────────────────────┘
                                         │
                                         ▼
              ┌────────────────────────────────────────────────┐
              │              VERCEL PRO                         │
              │   EU region: Stockholm (arn1) / Frankfurt      │
              │                                                 │
              │   • Static Astro build (HTML/CSS/JS)           │
              │   • Edge Functions (reserved for Phase 2)      │
              │   • Web Analytics (cookieless, no banner)      │
              │   • Speed Insights (Core Web Vitals)           │
              │   • Auto HTTPS + DDoS protection               │
              │   • Preview URLs per PR                         │
              └──────┬─────────────────────────────────────────┘
                     │ deploys from
                     ▼
              ┌──────────────────────┐
              │  GitHub (private)    │
              │  Source of truth     │
              │  Push → auto-deploy  │
              └──────────────────────┘

         External services (called from the site)
         ─────────────────────────────────────────
  ┌──────────────────┐   ┌──────────────────┐   ┌──────────────────┐
  │  BUNNY STREAM    │   │  MAILING SERVICE │   │  SHOPIFY         │
  │  $1–3/mo, EU     │   │  (PHASE 2)       │   │  (PHASE 3)       │
  │  how-to videos   │   │  Brevo / Resend  │   │  shop.vexienne   │
  │  via iframe/HLS  │   │  + Edge Function │   │  .com subdomain  │
  │  LIVE at launch  │   │  ~1 month out    │   │  2–3 months out  │
  └──────────────────┘   └──────────────────┘   └──────────────────┘
```

---

## Launch checklist

### 1. Domain & DNS
- `vexienne.com` registered by Coegin IT
- **Action:** Point nameservers to Vercel (or keep at registrar and use A/CNAME records) once Vercel project is provisioned
- Auto-HTTPS handled by Vercel
- **MX records (`@vexienne.com` email)** — not configured at launch. Phase 2 decision (Google Workspace, Fastmail, etc.)

### 2. SEO essentials (spell-out)
- **`sitemap.xml`** — generated automatically via `@astrojs/sitemap` integration
- **`robots.txt`** — placed in `public/robots.txt`, allows all crawlers, references sitemap
- **Open Graph + Twitter meta tags** — `og:title`, `og:description`, `og:image`, `twitter:card` on every page; ensures shared links (LinkedIn, WhatsApp, Slack) preview cleanly
- **JSON-LD structured data** — `Organization` schema (Coegin Pharma AB) + `Product` schema (Vexienne® Hair Active X) so Google understands brand and product
- **Canonical URL tags** — `<link rel="canonical">` on every page to prevent duplicate-content issues
- **Google Search Console verification** — add TXT record to DNS, submit sitemap
- **Bing Webmaster Tools** — same process, free additional traffic source

### 3. Video hosting (Bunny Stream)
- Sign up at bunny.net
- Upload how-to-use video(s)
- Embed via Astro page (e.g. `src/pages/x.astro` for Hair Active X)
- QR-code subpage URL must be **stable and on own domain** (e.g. `vexienne.com/x`) — never encode a third-party shortlink, since printed packaging is permanent
- Append `?src=qr` query parameter so Vercel Analytics can distinguish scans from organic visits

### 4. Analytics & privacy at launch
- Enable Vercel Web Analytics (cookieless, daily-reset hash)
- Enable Speed Insights (real-user Core Web Vitals)
- **No cookie banner required at launch** — all components in use are cookieless

### 5. Email addresses (at launch state)
- `marketing@coeginpharma.com` — referenced in footer for general contact (kept active)
- `consent@coeginpharma.com` — **deactivated at launch**, reactivates when email capture goes live (Phase 2)
- These are Coegin Pharma domain addresses — **not** `@vexienne.com`

---

## Phase 2 — Email capture (added ~1 month after launch)

**Isolated module. Architecture supports it; no work needed at launch.** When activated:

- **Mailing service:** Decision parked — Brevo (French, double-opt-in built-in, generous free tier, EU-resident) or Resend (developer-friendly, EU region available). Likely **Brevo** for a GDPR-friendly subscriber list with built-in opt-in management
- **Backend:** Small Vercel Edge Function receives the form post, validates, forwards to mailing service. Keeps the data path under your control (no direct third-party form posts from the browser)
- **Spam protection:** Hidden honeypot field in the Astro form (3 lines), plus mailing service's built-in rate limiting
- **Toggle:** `EMAIL_ENABLED` env var on Vercel — flip to `false` to hide the form, `true` to show it
- **Legal pages (REQUIRED before activation):**
  - `/privacy` — Privacy Policy page, names Coegin Pharma AB as data controller
  - `/cookies` — Cookie Policy page (even if minimal — only the analytics hash applies)
  - Both linked from the footer
- **Reactivate** `consent@coeginpharma.com` mailbox
- **Existing form-side compliance is already in place** in the codebase: consent checkbox (unchecked by default), data controller language, withdrawal rights, no third-party sharing statement

**Without these legal pages, do not turn `EMAIL_ENABLED` on.** GDPR enforcement under Art. 13 requires the privacy information to be accessible at point of data collection.

---

## Phase 3 — Shopify (added 2–3 months out)

- **Default approach:** Subdomain. `shop.vexienne.com` resolves to Shopify-hosted store via DNS CNAME
- **No changes** to the marketing site architecture — the marketing site stays at the apex (`vexienne.com`), the shop runs on Shopify's infrastructure
- **Alternative (headless):** Shopify Storefront API rendered into Astro pages. More work, more polish; can be evaluated when Shopify timing approaches

---

## Excluded options (and why, briefly)

- **GitHub Pages** — too limiting; no edge functions, no analytics integration, no preview deploys
- **Netlify** — solid product but EU data residency requires Enterprise; loses to Vercel on cost-effectiveness for an EU brand
- **Cloudflare Pages** — strong technically, but splits work across Pages + Workers + Analytics + R2 dashboards; Vercel is meaningfully simpler at this scale
- **Supabase / Firebase / any database backend** — the site has no app data of its own; mailing service stores subscribers; Shopify stores commerce data
- **YouTube embeds** for video — would set Google cookies, force a cookie banner, defeat the cookieless posture
- **Vimeo** — $12/mo Starter (the cheapest brand-usable tier) and strict EU data residency requires Enterprise (~$6,000/yr); Bunny is both cheaper and stronger on EU sovereignty

---

## Future considerations (not blockers)

- **Localization** — Astro has built-in i18n. If Swedish or Nordic-language versions are added later, the architecture supports it without re-work
- **Content editing for non-developers** — currently copy lives in source code; a headless CMS (Sanity, Contentful) slots in cleanly when needed
- **Email at `@vexienne.com`** — Phase 2 decision; would require MX records on Vercel-managed DNS pointing to Google Workspace, Fastmail, or similar
- **Form spam protection** — honeypot field + mailing service rate limiting at launch; can layer hCaptcha or Cloudflare Turnstile if abuse becomes a problem (likely never on a brand site)
- **Performance** — at the current asset weight, expect <500ms TTFB in EU. No CDN or caching changes anticipated

---

## Cost summary

| Phase | Cost/month |
|---|---|
| Launch (Vercel + Bunny + GitHub) | **~$21–23** |
| + Email capture (Phase 2) | ~$25–38 |
| + Shopify (Phase 3) | + Shopify plan |

---

*Stack chosen for: EU/Swedish data posture, GDPR compliance, professional-tier performance and uptime, Shopify-readiness without committing now, low operational overhead, room to add modules (email, video, store) without re-architecture.*
