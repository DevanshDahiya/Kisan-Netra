# Kisan Netra — UI Refresh & Feature Specification

This document is the implementation brief for two things: a visual identity refresh (so the app stops reading as an AI-generated template), and two new features (daily store open/close, product catalog deletion). Follow it as a spec, not a suggestion — every color, endpoint, and schema change below is intentional and should be implemented as written.

---

## Part 1: Why the current UI reads as "AI-generated"

Three specific tells, all present in the current landing page:

1. **Purple-to-blue gradient headline text** ("Verified Dealer Discovery" in the screenshot) — this exact gradient-on-heading pattern is the single most overused AI-SaaS-template signature right now. It reads as generic regardless of how clean the rest of the page is.
2. **Pastel rounded-square icon chips** (the light green/lavender/amber squares above each feature card) — another default pattern seen on nearly every AI-generated landing page.
3. **Generic sprout emoji-style logo mark** — doesn't tie to what the product actually does (inventory + geolocation).

The fix isn't "make it prettier" — it's **make it look like it belongs to an agritech product specifically**, not a generic SaaS template that happens to say "farm" in the copy.

---

## Part 2: Design System

### Color Palette — earthy/agricultural, not generic SaaS

Reject the default blue/purple tech palette entirely. Use an earthy, high-contrast palette that feels like soil, crop, and harvest — distinct from every "AI startup" gradient site.

```
Primary (deep forest green — trust, growth):
  50:  #F0F5EE
  100: #D7E5D0
  400: #4C7A3D
  600: #2F5B24
  800: #1D3B16
  900: #12240D

Accent (terracotta/clay — warmth, harvest, CTAs):
  50:  #FBF0EA
  100: #F2D3C0
  400: #C9682F
  600: #A34F1F
  800: #6E3414

Neutral (warm stone, NOT pure gray):
  50:  #FAF8F5
  100: #EFEAE2
  400: #948B7D
  600: #5C5548
  900: #2B271F

Status:
  Success: #2F5B24 (reuse primary-600)
  Warning: #B8862B (muted gold, not bright yellow)
  Danger:  #A3341F (muted brick red, not pure red)
```

**Rules:**
- **No gradients on text, ever.** Headlines are solid `primary-900` or `neutral-900`.
- Background is warm off-white (`neutral-50`), never pure white or pure gray — this alone makes it feel designed rather than templated.
- CTAs use terracotta (`accent-600`), not green — this creates visual hierarchy (green = brand/trust, terracotta = action), and avoids the "everything is one color" flatness.
- Feature icons: line icons only (no filled pastel chips), rendered in a single ink color (`neutral-900` or `primary-600`), never inside a colored rounded square.

### Typography

- **Headings**: `Space Grotesk` (distinctive, geometric, not the default Inter-everywhere look) — weight 600 for H1/H2, 500 for H3.
- **Body**: `Inter` — keeps body text readable and neutral while headings carry the personality.
- **Never** use more than these two typefaces anywhere in the app.

### Logo Concept

A custom mark, not a generic sprout: **a leaf shape that resolves into a map pin at its base** — this directly represents the app's two core pillars (crop inventory + dealer geolocation) rather than being decorative. Rendered as a simple two-tone SVG: leaf in `primary-600`, pin outline in `accent-600`. Wordmark: "Kisan" in `neutral-900`, "Netra" in `primary-600`, set in Space Grotesk 600.

### Component Rules (give these directly to Antigravity)

- Cards: `neutral-50` background is wrong for cards sitting on a `neutral-50` page — cards should be pure white with a 1px `neutral-100` border, no shadow unless hovered.
- Buttons: solid fill only, no gradients, `rx: 8px` (not fully rounded/pill unless it's a badge).
- Badges/pills (like "Verified", "Next-Gen..."): `accent-50` background with `accent-800` text, or `primary-50`/`primary-800` — never the pastel-on-white chip look with a colored icon square next to it.

---

## Part 3: Feature — Daily Store Open/Close

### Concept

A dealer's store defaults to **closed** every day. The owner must actively mark it "open" each day for it to appear in farmer search results. If they forget, the store simply doesn't show up — no penalty, no notification, just excluded from discovery. This mirrors real-world "is this shop actually open today" uncertainty and adds a genuinely differentiating feature beyond typical CRUD.

### Why compute-on-read instead of a midnight cron reset

Consistent with the existing pattern in this app (alerts are computed on-request, not via a background job — see `getAlerts`), the daily reset should **not** require a scheduled job. Instead: store the **date** the store was last opened, and compare it to today's date at query time. If the stored date isn't today, treat the store as closed — regardless of what the boolean says. This avoids needing infrastructure (cron/queue) for something that can be computed cheaply on every read.

### Schema change — `Dealer` model

```js
isOpenToday: {
  type: Boolean,
  default: false,
},
lastOpenedDate: {
  type: String, // stored as 'YYYY-MM-DD', compared against today's date string
  default: null,
},
```

### API endpoints

```
PATCH /api/dealers/:id/open-today   — dealer only, sets isOpenToday=true, lastOpenedDate=today
PATCH /api/dealers/:id/close-today  — dealer only, sets isOpenToday=false (manual early close, optional)
```

Both require ownership check (same pattern as `updateDealer` — compare `dealer.user` to `req.user._id`).

### The "is actually open" check — a helper, used everywhere store-open-status matters

```js
// server/src/utils/storeStatus.js
const getTodayDateString = () => new Date().toISOString().slice(0, 10); // 'YYYY-MM-DD'

const isStoreOpenNow = (dealer) => {
  return dealer.isOpenToday && dealer.lastOpenedDate === getTodayDateString();
};

module.exports = { getTodayDateString, isStoreOpenNow };
```

### Update to `getNearbyDealers` — exclude closed stores

Add to the `$geoNear` query filter, alongside the existing `isVerified: true`:

```js
query: {
  isVerified: true,
  isOpenToday: true,
  lastOpenedDate: getTodayDateString(),
  ...(dealerIdFilter ? { _id: { $in: dealerIdFilter } } : {}),
}
```

This is a direct database-level filter — a store that hasn't opened today never even reaches the results, rather than being filtered out client-side.

### Frontend changes

**`DealerDashboard.jsx`** — add a status card at the top:
- If open today: green badge "Open today" + a "Close early" button
- If not open today: amber/terracotta badge "Closed — not opened today" + a prominent "Open my store today" button
- This should be the first thing a dealer sees on their dashboard, above the store-edit form

**`SearchDealers.jsx`** — no changes needed on the frontend itself; the backend already excludes closed stores from `/api/dealers/nearby`. Optionally add a note in the empty-results message: "No open dealers found nearby right now."

---

## Part 4: Feature — Delete Product from Catalog

### The integrity problem to solve first

A product can be referenced by many `DealerStock` entries and many `FarmerInventory` entries. Deleting it outright would leave orphaned references pointing to a document that no longer exists. **Block deletion if the product is currently in use anywhere**, rather than silently cascading deletes across unrelated dealers' and farmers' data.

### Who can delete

**Admin only** — even though dealers can create products directly (per the existing design), deletion is higher-risk (affects everyone using that catalog entry), so it stays admin-gated, same reasoning as why verification is admin-only.

### API endpoint

```
DELETE /api/products/:id — admin only
```

```js
const deleteProduct = async (req, res, next) => {
  try {
    const inUseByDealers = await DealerStock.exists({ product: req.params.id });
    const inUseByFarmers = await FarmerInventory.exists({ product: req.params.id });

    if (inUseByDealers || inUseByFarmers) {
      return res.status(400).json({
        message: 'This product is currently in use by dealers or farmers and cannot be deleted.',
      });
    }

    const product = await Product.findByIdAndDelete(req.params.id);
    if (!product) {
      return res.status(404).json({ message: 'Product not found.' });
    }

    res.status(200).json({ message: 'Product deleted.' });
  } catch (err) {
    next(err);
  }
};
```

Route (admin-only, alongside existing product routes):
```js
router.delete('/:id', protect, authorize('admin'), deleteProduct);
```

### Frontend — Admin Panel addition

The admin panel currently only lists pending/verified dealers. Add a new section: **"Product Catalog"** — a simple list of all products with a **Delete** button per row. On click, call the delete endpoint; if it returns the 400 "in use" error, show that message inline rather than a generic failure — the specific reason matters here.

---

## Part 5: Branding Checklist (rename "client" → Kisan Netra)

- `client/index.html` — `<title>Kisan Netra</title>`, update favicon to the new leaf+pin mark
- `client/package.json` — `"name": "kisan-netra-client"` (currently likely still the Vite default)
- Navbar — already shows "Kisan Netra" per the screenshot; keep the wordmark styling consistent with Part 2's typography rules
- Any remaining references to generic placeholder names in comments, README, or meta tags should be swept for consistency

---

## Part 6: Consolidated Prompt for Antigravity

Paste this directly into Antigravity as the instruction:

> Redesign the Kisan Netra frontend using this exact palette: primary forest green (#2F5B24 primary action/brand, #1D3B16 dark text), accent terracotta (#A34F1F for CTAs and highlights, never green for buttons), warm neutral background (#FAF8F5, not white or gray). Remove all gradient text — headings are solid color. Remove pastel icon-chip backgrounds — icons are single-color line icons with no colored container. Headings use Space Grotesk 600, body text uses Inter. Replace the current sprout logo with a custom mark combining a leaf shape resolving into a map pin, in primary green with a terracotta pin outline. Cards are white with a 1px light border, no shadow unless hovered, 8px corner radius on buttons. Apply this system consistently across every page — landing, login, register, dealer dashboard, farmer dashboard, search, admin panel — not just the landing page.

---

## Implementation Order

1. Design system (colors, typography, logo) — affects every page, do first
2. Store open/close feature (schema + API + dealer dashboard + search filter)
3. Product deletion feature (API + admin panel)
4. Final branding sweep (titles, favicon, package.json)
