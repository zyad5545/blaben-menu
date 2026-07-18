# b.laben Menu Performance and Mobile UX Design

## Scope

Improve the public menu's category discoverability and product details behavior without adding dependencies or changing the data layer.

## Design

- Render the horizontal category rail immediately above the product panel on all viewport sizes.
- Show a centered, contained overlay inside that rail with three sequential left-facing chevrons and the Arabic label `اسحب لليسار`.
- Animate only `transform` and `opacity`; dismiss on pointer interaction or horizontal scroll and remember dismissal for the current page session.
- Keep the product modal centered. Constrain it with dynamic viewport units, keep the image compact on phones, and make only the details column scrollable with contained overscroll.

## Performance and accessibility

- Use native horizontal scrolling and passive listeners.
- Keep lazy image loading and existing safe image URL validation.
- Preserve keyboard activation, dialog semantics, backdrop closing, and body scroll locking.
- Respect `prefers-reduced-motion` through the existing global media rule.

## Verification

Run the production build and review the diff for scope. Manually verify long descriptions, multiple price variants, narrow viewports, desktop viewports, horizontal category interaction, and modal closing.

