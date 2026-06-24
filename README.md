# Vexienne.com

Single-page responsive product website for Vexienne -- a modern hair-care brand from Coegin Pharma AB.

## Tech stack

- **Framework**: [Astro](https://astro.build/) v6 (static output, zero client JS apart from nav scroll)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/) v4 with brand palette configured as custom colours
- **Fonts**: DM Sans (headings), Familjen Grotesk (body) -- both via Google Fonts
- **Deployment**: Static HTML -- works on Vercel, Netlify, or any static host

## Setup

```bash
npm install
npm run dev       # Start dev server at http://localhost:4321
npm run build     # Production build -> ./dist/
npm run preview   # Preview the production build locally
```

Requires Node.js >= 22.12.0.

## Deploy

### Vercel

Connect the repo, set build command to `npm run build` and output directory to `dist`.

### Netlify

Same -- or drag-and-drop the `dist/` folder.

## Content changes

All copy lives directly in `src/pages/index.astro`. The file is a single Astro component with clearly commented sections:

1. **Hero** -- headline and sub-headline
2. **The Story** -- brand narrative, who it is for, Follicopeptide story
3. **The Product** -- Hair Active X description, nightly routine, approved claims
4. **How It Works** -- timeline (months 1-6+)
5. **Where to Buy** -- retailer card(s)
6. **Footer** -- legal, trademarks, RP statement

### Updating the Lyko link

Search for `Shop at Lyko` in `index.astro` and replace the `href="#"` with the actual product URL.

### Adding a retailer

Duplicate the `<a>` card inside the "Where to Buy" section. Change `sm:grid-cols-1` to `sm:grid-cols-2` (or `sm:grid-cols-3`) on the grid container and update `max-w-sm` to `max-w-2xl`.

## Brand colours (from Brand Manual v2.0)

| Token            | Hex       | CSS variable             |
|------------------|-----------|--------------------------|
| Deep green       | #04342F   | --color-deep-green       |
| Dark navy        | #17173B   | --color-dark-navy        |
| Vexienne purple  | #6153A3   | --color-vex-purple       |
| Vexienne blue    | #3F77BC   | --color-vex-blue         |
| Breathing teal   | #D7F4EE   | --color-breathing-teal   |
| Warm grey        | #C4C5BF   | --color-warm-grey        |

## Image assets

- **Logos**: `public/images/logos/` -- PNG lockups in deep-green, teal, and white variants
- **Product**: `public/images/product/` -- pack shot, lifestyle, standing (WebP, optimised)
- **Mood**: `public/images/mood/` -- hair parting, gel textures (WebP, optimised)

All source images came from the Brand Manual Sources folder and were optimised to WebP at web-appropriate dimensions.

## Compliance notes

- All product claims are verbatim from Brand Manual v2.0, section 19
- Voice follows section 16 guidelines
- Registered symbol on first/prominent use of Vexienne and Follicopeptide
- Follicopeptide attribution legend in footer
- Responsible Person statement per section 27
- No cookies, analytics, or third-party scripts
