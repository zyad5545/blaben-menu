# b.laben Online Menu Design

Date: 2026-06-30

## Goal

Build three Arabic RTL responsive website versions for the b.laben online menu. Each version should use the existing b.laben logo, product photos, category artwork, and `names_and_descriptons.txt` menu data. The designs must feel more attractive than a normal menu while staying simple for customers on phones, tablets, and laptops.

## Audience

Customers browsing the menu quickly from a phone, tablet, or laptop. The experience should prioritize clear category selection, product discovery, price visibility, and easy scanning. It is not an ordering or payment system.

## Language And Direction

The site is Arabic only and uses RTL layout throughout:

- `lang="ar"`
- `dir="rtl"`
- Arabic product names, descriptions, prices, and availability labels.

## Brand And Visual Style

The palette should be based on the logo: blue and white as the dominant colors, with subtle neutral text colors and restrained accent colors only where needed for status labels or emphasis.

The design should avoid a generic restaurant menu look. It should use:

- A 2-3 second animated logo intro on first page load.
- Smooth transitions between intro and menu content.
- Animated category navigation.
- Product cards with strong imagery, clear prices, and simple unavailable states.
- Responsive layouts that feel intentionally designed at phone, tablet, and laptop widths.

## Shared Content Model

The implementation will derive menu content from the existing local assets:

- Logo: `b.laben logo.jfif`
- Menu text: `names_and_descriptons.txt`
- Category-style artwork in `New folder`
- Individual product images in the project root

Products should include:

- Name
- Price or price range
- Description when available
- Availability, including `غير متاح`
- Category
- Matching image when a local file can be matched by name

Categories visible in the source include rice pudding, qashtoota, bambouza, koshary, Om Ali, Dubai items, pearls, cake products, and other specialty products.

## Version 1: Premium Scroll Menu

This version is the recommended default because it is the fastest and clearest for real customers.

Structure:

- Animated logo intro.
- Compact sticky header after the intro.
- Horizontally scrollable category tabs.
- Optional featured row for visually strong or popular items.
- Category sections stacked vertically.
- Product cards in a responsive grid.

Behavior:

- Tapping a category tab scrolls smoothly to that section.
- Active category updates while scrolling.
- Product cards animate softly as they enter the viewport.
- On phones, cards are one column or compact two-column where image/text still fit.
- On tablets/laptops, cards become wider grids with stronger imagery.

## Version 2: Visual Category World

This version makes category browsing feel more visual and unique.

Structure:

- Animated logo intro.
- Main category gallery using the category artwork from `New folder`.
- Each category appears as a large visual tile.
- Selecting a category opens or scrolls to its product collection.
- Products are shown in clean cards beneath the selected category.

Behavior:

- Category tiles use hover/tap motion and image depth.
- The selected category gets a clear active state.
- Customers can return to category browsing quickly.
- The page should avoid hiding important menu data behind complex gestures.

## Version 3: Product Spotlight Menu

This version is the most promotional and visually dynamic.

Structure:

- Animated logo intro.
- A spotlight area for selected high-impact products.
- Category filter controls below the spotlight.
- Mixed layout with larger featured cards and compact regular product cards.

Behavior:

- Spotlight products use larger images and stronger transitions.
- Category filters keep browsing simple.
- Regular cards remain scannable with price and availability always visible.
- The page should feel energetic without making basic menu browsing harder.

## Shared Interaction Rules

All versions should include:

- Logo intro lasting approximately 2-3 seconds.
- Skip-friendly behavior: content appears automatically after the intro without user action.
- Smooth but restrained animations.
- Hover effects for pointer devices.
- Tap-friendly controls for phones.
- Clear unavailable badge for `غير متاح`.
- No order/cart/payment flow.
- No complex onboarding, forms, or account flow.

## Responsive Requirements

Phone:

- Mobile-first layout.
- Thumb-friendly category controls.
- Product name, price, and image visible without dense clutter.
- Text must not overflow buttons/cards.

Tablet:

- Wider category and product grids.
- Keep sticky navigation readable.

Laptop/Desktop:

- More spacious product grids.
- Hover transitions enabled.
- Avoid overly wide text lines.

## Accessibility

- Respect `prefers-reduced-motion` by shortening or disabling decorative motion.
- Use semantic landmarks where practical.
- Ensure interactive controls are keyboard reachable.
- Maintain readable contrast between blue/white elements and text.
- Keep Arabic text readable and avoid font sizes that are too small on phones.

## Security And Privacy

This is a static menu site with no user authentication, no payments, and no form submission. Security considerations:

- Avoid inline user-generated HTML.
- Treat parsed text content as text, not HTML.
- Use local assets only unless a deliberate external dependency is added.
- No secrets or API keys are needed.

## Files To Create

Expected implementation files:

- `index.html`: comparison/chooser page for all three versions.
- `version-1.html`: Premium Scroll Menu.
- `version-2.html`: Visual Category World.
- `version-3.html`: Product Spotlight Menu.
- `assets` or equivalent local structure if organizing copied/generated assets becomes useful.
- Shared CSS and JavaScript files if the implementation is easier to maintain that way.

## Testing

Manual verification should cover:

- Intro animation appears and then reveals the menu.
- Each version loads without broken images for key assets.
- Arabic RTL layout is correct.
- Category navigation works.
- Product cards show names, prices, descriptions when present, and unavailable badges.
- Layout works at phone, tablet, and laptop viewport widths.
- Reduced-motion mode does not depend on the intro animation to access the menu.

## Open Implementation Notes

- Because the current folder is not a git repository, the design document cannot be committed unless git is initialized.
- Product parsing should be pragmatic: preserve the Arabic text and clean obvious duplicated source phrases such as repeated restaurant labels where possible.
- The final implementation should prioritize visible polish and responsive behavior over adding unnecessary app complexity.
