# b.laben Final Menu And Admin Design

Date: 2026-07-06

## Goal

Build the final public menu by combining the strongest parts of the existing React/Tailwind versions:

- Use Version 2's visual category tile style.
- Use Version 6's product presentation style.
- Add strong Arabic search in the navigation.
- Add a guided first-use hint on the first category.
- Add a floating up arrow after scrolling.
- Split the experience into a public customer menu and a protected admin editing area.

## Current Project

The project is a Vite React app using Tailwind CSS. Menu data is currently assembled in `src/main.jsx` from:

- `public/names_and_descriptons.txt`
- images in `public/menu-assets`
- optional local custom products from browser `localStorage`

The workspace also contains Supabase preparation files:

- `supabaseClient.js`
- `schema.sql`

## Public Menu

The public customer page should be the final menu experience. It should not expose admin editing controls.

### Category Experience

The top menu experience should use large visual category tiles like Version 2.

Behavior:

- Each category tile uses the first product image from that category.
- The first category is visually focused on page load.
- The first category shows an Arabic helper hint: `اضغط هنا للانتقال إلى المنتجات`.
- Clicking any category smoothly scrolls down to that category's product section.
- The selected category receives a clear active state.

### Product Experience

Product display should use Version 6's compact/premium product style:

- Dense product list/grid below the category area.
- Product image, name, price, and state are visible.
- Product cards remain tappable and open the existing product details modal.
- Unavailable products show `غير متاح`.

### Search

The navigation bar should include:

- Search icon.
- Search input.
- Search results area.

Behavior:

- Search starts empty and does not show a product result list until the user types.
- Search matches Arabic-normalized name, category, description, and price.
- Search ignores differences such as `أ/إ/آ`, `ة/ه`, and extra spaces.
- Matching products appear as the user types.
- Clicking a search result opens the existing product details modal.
- If there is no match, show a short Arabic empty state.

### Back To Top

After the user scrolls down, a floating up arrow appears.

Behavior:

- The arrow appears only after meaningful scrolling.
- Clicking it smoothly scrolls to the top of the menu.
- It should be visually obvious but not block product content.

## Admin Experience

There should be a separate admin page for editing menu data.

### Route

Do not use an obvious route like `/menu/admin`.

Use a less obvious admin route such as:

`/staff-portal-blaben-73.html`

This route name is only obscurity. Real security must come from authentication and backend authorization.

### Login

The admin page should require login before editing is visible.

Preferred secure direction:

- Use Supabase Auth when environment variables are configured.
- If Supabase is not configured, show a clear setup message instead of pretending the admin is secure.

Security expectations:

- Do not store admin passwords in client code.
- Do not rely on a hidden URL as the main security control.
- Do not expose service role keys or private secrets.
- Use Supabase Row Level Security from `schema.sql` for write protection.

### Admin Capabilities

After login, admin can:

- Search products.
- Add products.
- Edit product name.
- Edit category.
- Edit price.
- Edit state: `available` / `unavailable`.
- Edit description.
- Edit image.
- Delete products.

If Supabase is configured, edits should go to Supabase. If it is not configured, the admin page can keep the current localStorage behavior only as a local fallback/demo and must label it clearly.

## Data Model

Product shape:

- `id`
- `category`
- `name`
- `price`
- `state` or `unavailable`
- `description`
- `image` or `image_url`
- `sort_order`

Public rendering should normalize local parsed products and Supabase products into one common shape.

## Accessibility And UX

- Arabic RTL throughout.
- All clickable cards and controls should be keyboard reachable.
- Search input has an accessible label.
- Back-to-top button has an Arabic accessible label.
- Motion should respect `prefers-reduced-motion`.
- Product text should not overflow cards on phone widths.

## Testing

Verify:

- App builds with `npm run build`.
- Public final menu loads.
- Category tile click scrolls to products.
- First category guide text appears.
- Search matches Arabic variants.
- Search result click opens product modal.
- Back-to-top appears after scrolling and returns to top.
- Admin route loads login/setup state.
- No broken images.
- No horizontal overflow on phone viewport.

## Notes

- A backup was created before this work at `E:\Projects\b.laben\backups\blaben-backup-20260706-213916.zip`.
- This folder is not currently confirmed as a git repository, so committing may not be available.
