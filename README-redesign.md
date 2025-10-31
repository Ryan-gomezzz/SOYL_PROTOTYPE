# SOYL / SOIL Redesign — silver/black prototype

Branch: `redesign/soyl-silver-black`

## Purpose
- Visual-first redesign inspired by premium fashion sites (Zara/Gucci) with a silver & black palette.
- Introduces a dedicated SOYL R&D landing page and moves irrelevant nav items (Pricing → removed, Careers → footer).
- Replace glitchy login with a robust client-side validated form.
- Adds custom cursor, lazy-loaded 3D Studio placeholders, and improved homepage hero.

## How to run
- Install: `npm install` or `yarn` (from repo root) or `pnpm install`
- Run dev: `cd packages/app && npm run dev` or `pnpm run dev`
- Build: `cd packages/app && npm run build`

## What changed (high level)
- **Header/nav**: Removed Pricing, added SOIL R&D link (with pill styling), moved Careers to footer
- **Homepage**: Visual-first hero with large image grid placeholder + feature cards for Studio/3D/Catalog
- **/soyl-rd**: New R&D landing page with research areas, capabilities, and contact CTA
- **Theme**: Created `packages/app/src/styles/theme.css` with silver & black CSS variables
- **CustomCursor**: Updated to use silver accent color (`--accent: #c0c0c8`)
- **Login**: New validated form with client-side validation (email format, password min 8 chars)
- **Studio & 3D components**: Presented as large image cards on homepage with lazy-loading placeholders
- **Footer**: Added Careers link (mailto:jobs@soyl.company)

## Theme Variables

The new theme uses these CSS variables (defined in `src/styles/theme.css`):
- `--bg: #0b0b0b` - Main background
- `--panel: #111111` - Panel/surface background
- `--accent: #c0c0c8` - Silver accent color
- `--muted: #9b9b9b` - Muted text
- `--text: #eaeaea` - Primary text
- `--glass: rgba(255,255,255,0.04)` - Glass effect background

## Next steps (designer + engineering)

### Designer
- Replace placeholder hero images with final photography or curated art
- Provide 3 hero images and 3 studio thumbnails in high-res versions
- Provide brand font and iconography (if different from current Playfair Display/Inter)

### Frontend
- Connect SOYL R&D page to R&D whitepaper & contact form handler
- Implement final hero carousel transitions (currently static grid)
- Optimize images and ensure all lazy imports are correct
- Audit mobile nav, cursor fallbacks, and contrast ratios

### Backend
- Audit authentication endpoints; fix failing tests (see `packages/app/TESTS-FAIL.md`)
- Ensure authentication tokens set correctly

### QA
- Test mobile nav, cursor fallbacks, and contrast ratios
- Cross-browser testing
- Accessibility audit (ARIA landmarks, color contrast, keyboard navigation)

## Contacts
- COO: Ryan Gomez
- CTO: Om Patil

## Files Created/Modified

### Created
- `packages/app/src/styles/theme.css` - Silver/black theme variables
- `packages/app/src/pages/SoylRd.tsx` - SOIL R&D landing page
- `README-redesign.md` - This file
- `packages/app/TESTS-FAIL.md` - Test failure documentation

### Modified
- `packages/app/src/index.css` - Added theme.css import
- `packages/app/src/components/Header.tsx` - Removed Pricing, added SOIL R&D nav item
- `packages/app/src/components/Footer.tsx` - Added Careers link
- `packages/app/src/pages/Home.tsx` - Visual-first hero with Studio/3D/Catalog cards
- `packages/app/src/pages/Login.tsx` - Client-side validation added
- `packages/app/src/components/CustomCursor.css` - Updated for silver theme
- `packages/app/src/App.tsx` - Added /soyl-rd route

