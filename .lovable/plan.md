

## Plan: Add "Install App" Section to Landing Page

### What
Add a new section on the landing page with step-by-step instructions for installing ATLAAS GO on iPhone and Android home screens, plus a native install button for supported browsers.

### New Component: `InstallAppSection.tsx`

A visually appealing section placed between Testimonials and Partner CTA with:

1. **Headline**: "Get ATLAAS GO on Your Phone"
2. **Two cards side by side** (stacked on mobile):
   - **iPhone card**: Apple icon + 3 steps: Open in Safari → Tap Share button → Tap "Add to Home Screen"
   - **Android card**: Android icon + 3 steps: Open in Chrome → Tap Menu (⋮) → Tap "Install App" or "Add to Home Screen"
3. **Install button**: Uses the `beforeinstallprompt` event to show a native install button when available (Android Chrome)
4. **Visual styling**: Matches existing landing page design with cards, icons, and the brand color palette

### Changes

| File | Change |
|------|--------|
| `src/components/InstallAppSection.tsx` | New component with iPhone/Android instructions + install prompt button |
| `src/pages/Index.tsx` | Import and add `<InstallAppSection />` between Testimonials and Social Proof sections |

### Technical Details
- Reuses the `beforeinstallprompt` logic from the existing `Install.tsx` page
- Uses `Smartphone` and `Download` icons from lucide-react
- Responsive: 2-column grid on desktop, stacked on mobile
- Wrapped in `ScrollReveal` for consistent entrance animation

