# Implementation Plan — Kisan Netra UI Refresh & Feature Upgrades

This plan details the full implementation of the Kisan Netra visual identity refresh (earthy agritech design system, custom leaf-pin logo, Space Grotesk/Inter typography, terracotta CTAs, no text gradients, no pastel icon chips), Dark Mode system, hero & showcase image integration (`kisan-netra-hompage-photo.png` and `kisan-netra-photo-1.jpg`), Daily Store Open/Close feature (backend schema, compute-on-read helper, API endpoints, dealer dashboard & search integration), and Product Catalog Deletion feature (admin-only API with integrity checks and admin panel management).

---

## User Review Required

> [!IMPORTANT]
> - **Design System Palette**: Implementing the exact earthy palette from `UI_AND_FEATURES_SPEC.md` (`primary` deep forest green `#2F5B24`, `accent` terracotta `#A34F1F`, `neutral` warm stone `#FAF8F5`) and eliminating all generic AI SaaS gradient headings & pastel chips.
> - **Dark Mode**: Adding a dark mode toggle to the Navbar with persistent theme selection, utilizing an earthy dark theme palette (`#121611` dark surface, `#1a2318` cards, `#2a3826` borders).
> - **Store Open/Close**: Stores will default to closed each day unless explicitly marked open by the dealer. Compute-on-read pattern avoids background cron jobs while strictly filtering closed stores from nearby discovery.
> - **Product Catalog Deletion**: Gated to Admin only; deletion is safely blocked with a descriptive error if the product is actively referenced in any `DealerStock` or `FarmerInventory`.

---

## Proposed Changes

### 1. Server-Side Backend Changes

#### [NEW] [storeStatus.js](file:///d:/program/kisan-netra/server/src/utils/storeStatus.js)
- Provide `getTodayDateString()` (returns `'YYYY-MM-DD'`) and `isStoreOpenNow(dealer)`.

#### [MODIFY] [Dealer.js](file:///d:/program/kisan-netra/server/src/models/Dealer.js)
- Add `isOpenToday: { type: Boolean, default: false }` and `lastOpenedDate: { type: String, default: null }` fields.

#### [MODIFY] [dealer-controller.js](file:///d:/program/kisan-netra/server/src/controllers/dealer-controller.js)
- Add `openStoreToday` (dealer only, checks ownership, sets `isOpenToday: true` & `lastOpenedDate: todayDateString`).
- Add `closeStoreToday` (dealer only, checks ownership, sets `isOpenToday: false`).
- Update `getNearbyDealers` aggregation `$geoNear.query` to require `isVerified: true`, `isOpenToday: true`, and `lastOpenedDate: getTodayDateString()`.

#### [MODIFY] [dealer-routes.js](file:///d:/program/kisan-netra/server/src/routes/dealer-routes.js)
- Mount `PATCH /:id/open-today` and `PATCH /:id/close-today` (protected, dealer authorized).

#### [MODIFY] [product-controller.js](file:///d:/program/kisan-netra/server/src/controllers/product-controller.js)
- Add `deleteProduct`: check if product exists in `DealerStock` or `FarmerInventory`; return 400 with specific explanation if in use, otherwise delete product from database.

#### [MODIFY] [product-routes.js](file:///d:/program/kisan-netra/server/src/routes/product-routes.js)
- Mount `DELETE /:id` (protected, admin authorized).

#### [MODIFY] [geo.test.js](file:///d:/program/kisan-netra/server/tests/geo.test.js)
- Ensure tests that create verified test dealers also mark them as opened today so geo-search tests pass accurately.

---

### 2. Client-Side Design System & Branding

#### [MODIFY] [package.json](file:///d:/program/kisan-netra/client/package.json)
- Rename `"name": "kisan-netra-client"`.

#### [MODIFY] [index.html](file:///d:/program/kisan-netra/client/index.html)
- Load Google Fonts: `Space Grotesk` (weights 400, 500, 600, 700) and `Inter` (weights 300, 400, 500, 600, 700).
- Set title: `<title>Kisan Netra — Agricultural Input Management & Verification</title>`.
- Embed custom SVG favicon with the Leaf + Map Pin icon.

#### [MODIFY] [public/favicon.svg](file:///d:/program/kisan-netra/client/public/favicon.svg)
- Update SVG favicon to match the new leaf + pin logo concept in `#2F5B24` (primary-600) and `#A34F1F` (accent-600).

#### [MODIFY] [tailwind.config.js](file:///d:/program/kisan-netra/client/tailwind.config.js)
- Enable `darkMode: 'class'`.
- Define custom color system (`agri-primary`, `agri-accent`, `agri-neutral`, `agri-status`) and font families (`font-display: ['Space Grotesk']`, `font-sans: ['Inter']`).

#### [MODIFY] [index.css](file:///d:/program/kisan-netra/client/src/index.css)
- Configure root variables, default background (`#FAF8F5` in light mode, `#121611` in dark mode), text color tokens, smooth dark mode transitions, and custom scrollbar styling.

#### [NEW] [ThemeContext.jsx](file:///d:/program/kisan-netra/client/src/context/ThemeContext.jsx)
- Provide theme toggle (light/dark mode) with `localStorage` persistence and automatic `dark` class toggling on `document.documentElement`.

#### [NEW] [Logo.jsx](file:///d:/program/kisan-netra/client/src/components/Logo.jsx)
- Render custom 2-tone leaf + pin vector logo mark with Space Grotesk "Kisan Netra" wordmark.

---

### 3. Client-Side Page Redesigns & Feature Integration

#### [MODIFY] [Navbar.jsx](file:///d:/program/kisan-netra/client/src/components/Navbar.jsx)
- Use custom `Logo` component.
- Add Dark Mode toggle icon button (Sun / Moon).
- Style navigation items, role badges, and action buttons using earthy palette tokens and dark mode support.

#### [MODIFY] [Home.jsx](file:///d:/program/kisan-netra/client/src/pages/Home.jsx)
- Redesign Hero section: solid headings in Space Grotesk 600 (no gradient text), terracotta CTA button (`accent-600`), and earthy badge.
- Prominently feature the user-provided images:
  - Hero preview showcasing `kisan-netra-hompage-photo.png` in an elegant frame.
  - Authentic agritech story & verification showcase highlighting `kisan-netra-photo-1.jpg`.
- Replace pastel icon chips in feature cards with crisp single-color line icons.
- Add dark mode styling across all cards and sections.

#### [MODIFY] [DealerDashboard.jsx](file:///d:/program/kisan-netra/client/src/pages/DealerDashboard.jsx)
- **Top Section**: Daily Store Open/Close status card:
  - If open today: green badge "Open today" + "Close early" button.
  - If closed / not opened today: terracotta badge "Closed — not opened today" + prominent "Open my store today" CTA button.
  - Dynamic API integration with `PATCH /api/dealers/:id/open-today` and `PATCH /api/dealers/:id/close-today`.
- Modernized store profile form, Leaflet map picker, and dark mode support.

#### [MODIFY] [SearchDealers.jsx](file:///d:/program/kisan-netra/client/src/pages/SearchDealers.jsx)
- Restyled search filters, distance badges, and results cards with earthy palette tokens.
- Updated empty state note: *"No open dealers found nearby right now."*
- Dark mode compatibility for containers and cards.

#### [MODIFY] [AdminPanel.jsx](file:///d:/program/kisan-netra/client/src/pages/AdminPanel.jsx)
- Restyled Pending and Verified dealer lists.
- **New Section**: "Product Catalog Management" table/grid listing all catalog products with an admin **Delete** button per product.
- Calls `DELETE /api/products/:id` with inline display of the 400 "in use by dealers or farmers" error if applicable.

#### [MODIFY] [FarmerDashboard.jsx](file:///d:/program/kisan-netra/client/src/pages/FarmerDashboard.jsx)
- Earthy cards, clean metrics, usage logs, stock progress bars, and full dark mode support.

#### [MODIFY] [ProductCatalog.jsx](file:///d:/program/kisan-netra/client/src/pages/ProductCatalog.jsx)
- Filter bar, search, category chips, banned badges, and cards styled with earthy palette tokens and dark mode support.

#### [MODIFY] [StockManager.jsx](file:///d:/program/kisan-netra/client/src/components/StockManager.jsx)
- Restyled inventory stock list, inline quantity edit, add product modal, dark mode support.

#### [MODIFY] [Login.jsx](file:///d:/program/kisan-netra/client/src/pages/Login.jsx) & [Register.jsx](file:///d:/program/kisan-netra/client/src/pages/Register.jsx) & [ForgotPassword.jsx](file:///d:/program/kisan-netra/client/src/pages/ForgotPassword.jsx)
- Restyled authentication cards, terracotta CTA buttons, custom Leaf-Pin mark, dark mode support.

#### [MODIFY] [App.jsx](file:///d:/program/kisan-netra/client/src/App.jsx)
- Wrap in `ThemeProvider`, update main background & footer to earthy neutral tokens and dark mode styling.

---

## Verification Plan

### Automated Tests
- Run existing backend test suite via Jest / Supertest:
  ```powershell
  cd server ; npm test
  ```
- Verify API response codes for:
  - Daily open/close endpoints (`200 OK`)
  - Admin delete product endpoint (`200 OK` when unused, `400 Bad Request` when in use)
  - Geo-search filtering for `isOpenToday`

### Manual & Visual Verification
1. **Visual System & Aesthetics**:
   - Check landing page: No text gradients, solid Space Grotesk headings, terracotta CTAs, line icons without pastel square backgrounds, warm stone `#FAF8F5` background.
   - Verify images `kisan-netra-hompage-photo.png` and `kisan-netra-photo-1.jpg` render cleanly in the Hero and feature showcase.
   - Test Dark Mode toggle in navbar: verifies dark palette switches smoothly, all text is legible, cards contrast cleanly, borders are subtle, and preference persists on page refresh.
2. **Daily Store Open / Close**:
   - Log in as Dealer -> Check top status card on Dealer Dashboard -> Click "Open my store today" -> Verify badge updates to "Open today" -> Click "Close early" -> Verify badge updates to "Closed".
   - Search for dealers as Farmer -> Verify only stores open today are returned in results.
3. **Product Catalog Deletion**:
   - Log in as Admin -> Navigate to `/admin` -> Inspect "Product Catalog" table -> Try deleting an unused product (should succeed) -> Try deleting a product currently in a dealer's stock or farmer's inventory (should show inline error *"This product is currently in use by dealers or farmers and cannot be deleted."*).
4. **End-to-End Navigation**:
   - Verify all existing workflows (auth, login, register, farmer inventory, stock manager, search) continue to function without any broken features.
