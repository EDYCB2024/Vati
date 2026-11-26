# Design System Document: The Ethereal Concierge

## 1. Overview & Creative North Star
**Creative North Star: "The Ethereal Concierge"**
This design system rejects the "industrial" look of traditional support portals—cluttered grids and rigid borders—in favor of an atmosphere that feels effortless, premium, and human-centric. The objective is to transform a stressful support interaction into a curated experience.

By leveraging **intentional asymmetry**, **glassmorphism**, and **tonal depth**, we move beyond the "template" look. We prioritize breathing room (whitespace) as a luxury asset. Every element should feel as though it is floating in a structured, light-filled space, using depth to guide the user's eye rather than loud visual cues.

---

## 2. Colors & Surface Logic

The palette is anchored in **Deep Indigo (`primary`)** for authority and **Electric Blue (`secondary`)** for action, set against a vast, airy landscape of cool grays and whites.

### The "No-Line" Rule
**Explicit Instruction:** Designers are prohibited from using 1px solid borders for sectioning or containment. Traditional lines create visual noise. Instead:
*   **Containment via Tonal Shifts:** Define sections by transitioning from `surface` (#f7f9fb) to `surface_container_low` (#f2f4f6).
*   **The "Glass & Gradient" Rule:** Use `surface_container_lowest` (#ffffff) with a 70% opacity and a `24px` backdrop-blur to create floating glass panes. 
*   **Signature Textures:** For high-impact CTAs, use a linear gradient: `primary` (#3a388b) to `primary_container` (#5250a4) at a 135-degree angle. This adds "soul" and dimension.

### Surface Hierarchy & Nesting
Treat the UI as a physical stack of semi-transparent layers.
1.  **Level 0 (Base):** `surface` (#f7f9fb) – The canvas.
2.  **Level 1 (Sub-section):** `surface_container_low` (#f2f4f6) – For secondary content areas.
3.  **Level 2 (Active Cards):** `surface_container_lowest` (#ffffff) – For the primary "floating" interaction cards.

---

## 3. Typography: Editorial Authority

We use a dual-type system to balance tech-forward precision with modern warmth.

*   **Display & Headlines (Plus Jakarta Sans):** These are the "Editorial" voice. Use `display-lg` for welcome headers and `headline-md` for section titles. Keep letter-spacing slightly tight (-0.02em) to maintain a sophisticated, bespoke look.
*   **Body & Labels (Inter):** The "Functional" voice. Highly legible even at small scales. Use `body-md` for ticket descriptions and `label-sm` for metadata.
*   **Hierarchy Tip:** Never rely on color alone for hierarchy. Use the scale jump between `headline-sm` (1.5rem) and `body-sm` (0.75rem) to create a dramatic, high-end contrast.

---

## 4. Elevation & Depth

### The Layering Principle
Depth is achieved through **Tonal Layering**. To "lift" a component, move it one step up the surface-container tier. A card using `surface_container_lowest` placed on a `surface_container_high` background creates a natural visual lift without a single line of CSS border.

### Ambient Shadows
When a "floating" effect is required (e.g., a high-priority support chat bubble):
*   **Blur:** 40px – 60px.
*   **Opacity:** 4% – 8%.
*   **Color:** Use a tinted shadow (`#3a388b` at 5% opacity) instead of pure gray. This mimics natural light reflecting off the brand’s primary color.

### The "Ghost Border" Fallback
If contrast ratios require a boundary for accessibility, use a **Ghost Border**: `outline_variant` (#c5c5d4) at 15% opacity. It should be felt, not seen.

---

## 5. Components

### Floating Cards & Lists
*   **The Rule:** Forbid divider lines. 
*   **Execution:** Separate list items using 12px of vertical whitespace (`DEFAULT` rounding) and a subtle hover state shift to `surface_container_highest`.
*   **Rounding:** All cards must use `xl` (1.5rem / 24px) corner radius to reinforce the "soft" sophisticated aesthetic.

### Buttons
*   **Primary:** Gradient fill (`primary` to `primary_container`), `full` (pill) rounding, white text. No shadow on rest; soft indigo shadow on hover.
*   **Secondary:** `surface_container_highest` background with `secondary` (Electric Blue) text.
*   **Tertiary:** Ghost style; text-only (`primary`) with a background appearing only on hover at 8% opacity.

### Input Fields
*   **Aesthetic:** `surface_container_lowest` fill. No border.
*   **Interaction:** On focus, the field should grow a 2px "Ghost Border" of `secondary` and a soft ambient glow.
*   **Rounding:** `lg` (1rem) for a modern, approachable feel.

### Specialized Support Components
*   **Status Glass-Pill:** For "Ticket Open" or "Resolved" statuses. Use high-chroma background tints (e.g., `tertiary_fixed`) with 40% opacity and `backdrop-blur`.
*   **Priority Pulse:** A soft, animating gradient ring around high-priority customer avatars to signal urgency without using "alarmist" red.

---

## 6. Do’s and Don’ts

### Do:
*   **Use Asymmetry:** Place high-level stats (e.g., "3 Active Tickets") in an offset, floating glass card rather than a centered grid.
*   **Embrace Whitespace:** If a layout feels "empty," add more padding instead of more content. Whitespace is a feature, not a bug.
*   **Layer with Intent:** Ensure that "higher" layers are always lighter in color than the layers beneath them to mimic natural top-down lighting.

### Don’t:
*   **Don't use 1px borders:** This is the quickest way to make this high-end system look like a generic bootstrap site.
*   **Don't use pure black:** Use `on_surface` (#191c1e) for text. Pure black is too harsh for this "Ethereal" aesthetic.
*   **Don't crowd the corners:** Ensure all content inside an `xl` rounded card has at least 32px of internal padding so text doesn't get "clipped" visually by the deep curve.