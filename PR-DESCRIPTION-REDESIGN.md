# Redesign: silver-black SOYL + SOIL R&D landing (Draft)

## Summary
Visual-first redesign of SOYL with a new silver & black theme, featuring:
- **Visual-first homepage** with hero carousel/large imagery and Studio/3D/Catalog feature cards
- **New SOIL R&D landing page** (`/soyl-rd`) showcasing research capabilities
- **Updated navigation**: Removed Pricing, added SOIL R&D link (with pill styling), moved Careers to footer
- **Global silver/black theme** (`src/styles/theme.css`) with CSS variables
- **Improved login form** with robust client-side validation (email format, password min 8 chars)
- **Custom cursor** updated for silver theme
- **Lazy-loading** for heavy modules (3D/studio) with placeholder cards
- **Accessibility improvements**: Lazy-loading images, alt text, ARIA landmarks

## Changes Made

### Files Created
- `packages/app/src/styles/theme.css` - Silver/black theme CSS variables
- `packages/app/src/pages/SoylRd.tsx` - SOIL R&D landing page
- `README-redesign.md` - Redesign documentation and next steps
- `packages/app/TESTS-FAIL.md` - Test failure documentation

### Files Modified
- `packages/app/src/index.css` - Added theme.css import
- `packages/app/src/components/Header.tsx` - Removed Pricing, added SOIL R&D nav item
- `packages/app/src/components/Footer.tsx` - Added Careers link (mailto:jobs@soyl.company)
- `packages/app/src/pages/Home.tsx` - Visual-first hero with Studio/3D/Catalog cards
- `packages/app/src/pages/Login.tsx` - Client-side validation added
- `packages/app/src/components/CustomCursor.css` - Updated for silver theme
- `packages/app/src/App.tsx` - Added `/soyl-rd` route

## Theme Variables

New CSS variables (defined in `src/styles/theme.css`):
- `--bg: #0b0b0b` - Main background
- `--panel: #111111` - Panel/surface background
- `--accent: #c0c0c8` - Silver accent color
- `--muted: #9b9b9b` - Muted text
- `--text: #eaeaea` - Primary text
- `--glass: rgba(255,255,255,0.04)` - Glass effect background

## Commits

All changes are committed with atomic commits:
1. `feat(theme): add silver-black theme CSS variables`
2. `ui(nav): remove Pricing, add SOIL R&D link, move careers to footer`
3. `feat(soyl-rd): add SOYL R&D landing page`
4. `feat(home): visual-first hero + cards for Studio/3D/Catalog`
5. `fix(auth): replace glitchy login with robust client-side validated form`
6. `ui(cursor): update custom cursor for silver theme`
7. `chore(tests): document test failures`
8. `docs: add README-redesign for redesign/soyl-silver-black`

## Test Results

⚠️ **Tests are failing** - see `packages/app/TESTS-FAIL.md` for details:
- 2 test files failed due to configuration issues (pre-existing)
- Test setup needs to be updated for vitest + @testing-library/jest-dom
- These failures are NOT related to the redesign changes

## Checklist for Reviewers

- [ ] Review visual-first homepage hero and card layouts
- [ ] Test SOIL R&D page (`/soyl-rd`) functionality and layout
- [ ] Verify navigation changes (Pricing removed, SOIL R&D added, Careers in footer)
- [ ] Test login form validation (email format, password min 8 chars)
- [ ] Check custom cursor on desktop (should be silver theme)
- [ ] Verify mobile navigation works correctly
- [ ] Test accessibility (keyboard navigation, screen readers)
- [ ] Check color contrast ratios for silver accents on dark BG
- [ ] Review theme CSS variables usage across components

## Next Steps

### Designer
- Replace placeholder hero images with final photography or curated art
- Provide 3 hero images and 3 studio thumbnails in high-res versions
- Provide brand font and iconography (if different from Playfair Display/Inter)

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

## Notes

- Designer placeholders are present; add final assets before merge
- Test failures are documented in `packages/app/TESTS-FAIL.md` and need to be fixed
- See `README-redesign.md` for detailed documentation and local run instructions

## References

- Branch: `redesign/soyl-silver-black`
- README: `README-redesign.md`
- Test Failures: `packages/app/TESTS-FAIL.md`

---

**Status**: Draft
**Assignees**: @team-lead (Ryan Gomez)
**Labels**: `redesign`, `ui`, `frontend`, `draft`

