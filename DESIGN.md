# The Tab Progress — Design System

## Overview

The Tab Progress is built on one quiet idea: **the progress speaks, the chrome doesn't.** Every screen reads as a calm dashboard — the user's own data (a live count ring, a running timer, a 30-day trend chart, a streak) carries all the visual and chromatic energy, while everything else (nav, cards, forms, dialogs, settings) is reduced to neutral grayscale typography on `{colors.background}` and `{colors.card}`. There is no decorative gradient, no heavy shadow, no accent color used for "tone" — the system saves its single accent (`{colors.primary}`, chosen by the user) and the chart series (`{colors.chart-2}`, `{colors.chart-1}`) for the moments that actually signal: the value being tracked, the trend, the active/live state.

The result is a layout that feels honest and legible — dashboard header, path tiles, the count/timer card, the analytics chart, settings rows — stacked like a focused tool rather than animated like a marketing page. Density is moderate and never crowded, because the system relies on three relentless devices: flat `{component.card}` surfaces sitting on `{colors.background}`, a single user-selectable accent (`{colors.primary}`) reserved for the live/active surface, and an 8px-base spacing scale that keeps cards, form rows, and dialogs mathematically aligned across the dashboard, progress, and settings flows.

Across the dashboard, the progress page, the path list, and settings, the same chrome appears in identical proportions — only the data changes. That is the system's signature: maximum expression in the data, maximum mechanical restraint everywhere else. It is mobile-first: dialogs rise as keyboard-aware bottom sheets on touch, and recenter as modals on desktop, from the exact same component.

**Key Characteristics:**
- Data-first hierarchy: the count ring, timer, and `{colors.chart-2}` value series are the only things allowed to carry color weight on a screen
- Neutral chrome palette: `{colors.background}`, `{colors.foreground}`, `{colors.card}`, and `{colors.muted}` carry ~90% of the surface area in both light and dark themes
- A single user-selectable accent (`{colors.primary}`: default ink / blue / green / purple / orange) drives the primary CTA, the live indicator, and active states — never more than one solid accent block per fold
- Flat elevation: `{component.card}` uses a hairline border + faint `shadow`, never lifted drop-shadows; the only "ring" is the `pulse-ring` animation on a live count
- Consistent radius vocabulary anchored on `{rounded.lg}` (8px): buttons/inputs at `{rounded.md}`, cards at `{rounded.xl}`, bottom-sheet dialogs at `{rounded.2xl}` top corners
- 8px spacing system with `p-6` (24px) card padding and `gap-4` (16px) dialog rhythm
- Semantic color is the only place a non-neutral, non-accent hue appears in chrome: `{colors.destructive}` for delete/danger, `{colors.chart-2}` for the value being tracked
- Full dark-mode parity and a `prefers-reduced-motion` contract — every token resolves in both themes, every animation collapses to ~0ms when motion is reduced

## Colors

> **Token source:** `src/app/index.css` (CSS custom properties, HSL triplets) consumed through `tailwind.config.js`. Every color is a `hsl(var(--token))` reference, so light/dark/accent variants swap by changing the variable, not the component. Color scheme is set via `:root[data-color-scheme="…"]` and dark mode via the `.dark` class.

### Brand & Accent
- **Primary** (`{colors.primary}` — light `240 5.9% 10%` / dark `0 0% 98%`): The system's one assertive surface. It is the primary CTA fill, the selected toggle, and the strongest text weight. In light theme it is near-black ink; in dark theme it inverts to near-white. Users may override its hue via Settings → Color Scheme to **blue** (`221 83% 53%`), **green** (`142 71% 45%`), **purple** (`262 83% 58%`), or **orange** (`25 95% 53%`).
- **Primary Foreground** (`{colors.primary-foreground}` — light `0 0% 98%` / dark `240 5.9% 10%`): The inverse text/icon color that always rides on top of `{colors.primary}`.

### Surface
- **Background** (`{colors.background}` — light `0 0% 100%` / dark `240 10% 3.9%`): The page canvas. Carries every screen background and the `html`/`body` fill.
- **Card** (`{colors.card}` — light `240 4% 98%` / dark `240 8% 7%`): The most-used non-background surface — every `{component.card}`, the progress/timer surface, the settings rows. A barely-there step up from `{colors.background}`, the way a product is staged on a neutral table.
- **Popover** (`{colors.popover}` — light `0 0% 100%` / dark `240 10% 3.9%`): Dropdown, select, and menu surface.
- **Secondary / Muted / Accent surface** (`{colors.secondary}`, `{colors.muted}`, `{colors.accent}` — light `240 4.8% 95.9%` / dark `240 3.7% 15.9%`): The soft gray fills for secondary buttons, hover states, skeletons, and inactive chips.
- **Border** (`{colors.border}` — light `240 5.9% 90%` / dark `240 3.7% 15.9%`): 1px hairline on cards, inputs, dividers, and dialog edges — the system's primary separation device.
- **Input** (`{colors.input}`): Field border, same value as `{colors.border}`.

### Text
- **Foreground** (`{colors.foreground}` — light `240 10% 3.9%` / dark `0 0% 98%`): Primary text — headings, counts, path names, body.
- **Card Foreground** (`{colors.card-foreground}`): Primary text when sitting on `{colors.card}`; matches `{colors.foreground}`.
- **Muted Foreground** (`{colors.muted-foreground}` — light `240 3.8% 46.1%` / dark `240 5% 64.9%`): Subtitles, metadata, timestamps, placeholder text, settings descriptions, the lowest-emphasis utility text.

### Semantic & Data
- **Destructive** (`{colors.destructive}` — light `0 84.2% 60.2%` / dark `0 62.8% 30.6%`): Delete-path, danger confirmations, validation errors. The only red in the chrome; never used decoratively.
- **Ring** (`{colors.ring}` — light `240 10% 3.9%` / dark `240 4.9% 83.9%`): Focus-visible outline on every interactive control.
- **Value** (`{colors.color-value}` = `{colors.chart-2}` — light `173 58% 39%` / dark `160 60% 45%`): The series color for the metric being tracked in analytics, and the hue of the `pulse-ring` live indicator. This is the system's "the data is alive" color.
- **Trend Value** (`{colors.color-trendValue}` = `{colors.chart-1}` — light `12 76% 61%` / dark `220 70% 50%`): The secondary/trend series in analytics charts.
- **Chart palette** (`{colors.chart-1}` … `{colors.chart-5}`): The five-stop categorical scale for multi-series analytics; reserved exclusively for data viz, never for chrome.

## Typography

### Font Family
The system uses the **native system font stack** (Tailwind `font-sans`: `-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, …`). No proprietary or web font is loaded — this keeps first paint instant, avoids layout shift from font swapping, and lets each platform render its most legible UI face. There is intentionally no display/headline font; the system creates hierarchy through **weight and size**, not typeface.

### Hierarchy

| Token | Tailwind | Size / Weight | Use |
|---|---|---|---|
| `{typography.display-count}` | `text-5xl font-bold tabular-nums` | 48px / 700 | The live count and timer readout — the single largest element on any screen |
| `{typography.heading-page}` | `text-2xl font-semibold tracking-tight` | 24px / 600 | Page/section title — Dashboard, Settings, a path name header |
| `{typography.heading-card}` | `text-lg font-semibold tracking-tight` | 18px / 600 | `CardTitle` — path tile, analytics card, dialog title |
| `{typography.body-strong}` | `text-base font-medium` | 16px / 500 | Form labels, primary nav links, settings row labels |
| `{typography.body-md}` | `text-base font-normal` | 16px / 400 | Body copy, input text (mobile uses 16px to defeat iOS zoom) |
| `{typography.button-md}` | `text-sm font-medium` | 14px / 500 | Standard button label |
| `{typography.caption-md}` | `text-sm text-muted-foreground` | 14px / 400 | `CardDescription`, subtitles, timestamps |
| `{typography.caption-sm}` | `text-xs` | 12px / 400–500 | Badge text, chart axis labels, color/count metadata |

### Principles
The system runs on **size-and-weight contrast, not typeface contrast.** A single oversized `tabular-nums` count tier (so digits don't jitter as the number ticks) anchors the data, and a quiet 12–16px medium/regular tier carries everything else. The jump from `{typography.display-count}` (48px) down to `{typography.body-strong}` (16px) is intentional — it creates a "the number, then the controls" reading order on the progress screen. Headings use `tracking-tight`; body and captions stay at the default tracking the system font is optically tuned for.

## Layout

### Spacing System
- **Base unit:** 8px (Tailwind 4-unit scale; each step = 4px).
- **Tokens:** `{spacing.xs}` (4px / `gap-1`) · `{spacing.sm}` (8px / `gap-2`) · `{spacing.md}` (12px / `gap-3`) · `{spacing.base}` (16px / `gap-4`) · `{spacing.lg}` (24px / `p-6`) · `{spacing.xl}` (32px) · `{spacing.section}` (48px+).
- **Card padding:** `{component.card}` uses `p-6` (24px) on header and content; content drops top padding to `pt-0` so the title and body share one rhythm.
- **Dialog rhythm:** `{component.dialog}` content uses `gap-4` (16px) between stacked rows; the mobile sheet adds `pb-[max(2.5rem, env(safe-area-inset-bottom)+1rem)]` so the last control clears the home indicator and keyboard.
- **Form rows:** stacked at 8–16px with `Label` directly above its field.

### Grid & Container
- **App shell:** single centered content column constrained to a comfortable reading/tool width, with edge gutters that hold on large viewports rather than stretching the column. On mobile (`< sm`) the gutter is dropped: header and page blocks run edge-to-edge, stacked 8px apart (`space-y-2`, `gap-2`); from `sm:` the column regains `px-2` and 16px gaps. Non-card sections (photos rail, settings) carry their own mobile inset so text never touches the screen edge.
- **Dashboard:** path tiles flow in a responsive grid — multi-up on desktop, collapsing toward a single column on mobile, with the primary progress card given prominence.
- **Settings:** a single stacked column of full-width rows (`label` + control), each separated by a `{colors.border}` hairline.
- **Carousel rails** (`ScrollCarousel`, `PhotosCarousel`): horizontal scroll with peek-next affordance on narrow screens.

### Whitespace Philosophy
Whitespace separates; it does not decorate. Cards butt against the page rhythm with consistent `gap-4`/`p-6` spacing, and the data inside a card (count, chart) gets the breathing room — the chrome around it stays tight. Headings sit immediately above their content with no decorative gap.

## Elevation & Depth

| Level | Treatment | Use |
|---|---|---|
| 0 — Flat | No shadow, no border | Plain layout containers, page sections |
| 1 — Hairline | 1px solid `{colors.border}` | Card edges, input borders, settings-row dividers, dialog borders |
| 2 — Faint raise | `shadow` / `shadow-sm` (Tailwind) | `{component.card}` and `{component.button}` — a barely-perceptible lift, not a floating panel |
| 3 — Sheet/modal | `shadow-lg` + overlay `bg-black/80` | `{component.dialog}` only — the one surface allowed to float above the app |
| Live — Pulse | `pulse-ring` keyframe in `{colors.chart-2}` at 35%→0% alpha | The active count/timer card while a session is running — the system's only "alive" motion |

The system has no decorative drop-shadow elevation. Cards rest on the page with a hairline and a faint `shadow`. The only attention-grabbing depth cue is the `pulse-ring` on a live count, and it is reserved for exactly that state. All motion respects `prefers-reduced-motion: reduce`, which collapses every animation/transition to ~0.01ms.

## Shapes

### Border Radius Scale

> Anchored on `--radius: 0.5rem` (8px). Tailwind derives `lg` = `var(--radius)`, `md` = `calc(--radius - 2px)`, `sm` = `calc(--radius - 4px)`.

| Token | Value | Use |
|---|---|---|
| `{rounded.sm}` | 4px | Dialog close-button hit area, small inner chips |
| `{rounded.md}` | 6px | `{component.button}`, `{component.input}`, select, dropdown items — the default control radius |
| `{rounded.lg}` | 8px | Desktop dialog (`sm:rounded-lg`), the base radius token |
| `{rounded.xl}` | 12px | `{component.card}` — every card container |
| `{rounded.2xl}` | 16px | Mobile bottom-sheet dialog **top corners only** (`rounded-t-2xl`, flat bottom against the screen edge) |
| `{rounded.full}` | 9999px | Avatars, the `pulse-ring` live indicator, circular icon buttons, swatch/color-scheme dots |

### Geometry Notes
- **Cards** are softly rounded (`{rounded.xl}`) rectangles — the warmest shape in the system, because they hold the user's data.
- **Controls** (buttons, inputs) sit one notch tighter at `{rounded.md}` so they read as crisp and tappable, not pill-soft.
- **The mobile dialog** is a true bottom sheet: rounded only on the top edge, anchored to `bottom: var(--keyboard-inset, 0px)` so it rides above the on-screen keyboard.

## Components

> Variants follow shadcn/ui conventions via `class-variance-authority`. Each spec covers Default plus the states the component actually ships.

### Buttons (`{component.button}`)

Base: `inline-flex items-center justify-center gap-2 rounded-md text-sm font-medium`, focus ring `{colors.ring}`, disabled → `opacity-50 pointer-events-none`, icon children locked to 16px.

- **`button-default`** — primary CTA. `bg-primary text-primary-foreground shadow`, hover `bg-primary/90`. The single accent action per fold (Save, Add, Start).
- **`button-destructive`** — `bg-destructive text-destructive-foreground`, hover `/90`. Delete path, irreversible confirms.
- **`button-outline`** — `border border-input bg-background`, hover `bg-accent`. The low-emphasis alternate beside a primary CTA (Cancel).
- **`button-secondary`** — `bg-secondary text-secondary-foreground`, hover `/80`. Soft fill for tertiary actions.
- **`button-ghost`** — transparent, hover `bg-accent`. Icon-and-text controls inside cards (edit, the count stepper).
- **`button-link`** — `text-primary underline-offset-4 hover:underline`. Inline text actions only.

Sizes: `default` (h-11 mobile → h-9 desktop) · `sm` (h-10 mobile → h-8 desktop, text-xs) · `lg` (h-10, px-8) · `icon` (44×44px — meets the WCAG touch target; the header back button and dialog close were deliberately raised to 44px).

### Inputs & Forms (`{component.input}`)

- **`input`** — `h-11 sm:h-9 rounded-md border border-input bg-transparent px-3 text-base md:text-sm`, focus `ring-1 ring-ring`. Renders at **16px on mobile** (`text-base`) to prevent iOS auto-zoom, dropping to 14px (`md:text-sm`) on desktop.
- Form fields auto-select on focus and carry the right `inputMode`/`autocomplete`/`enterKeyHint` attributes (e.g. numeric keypad for count/time entry, `new-password` vs `current-password` on auth). Forms guard against double-submit by disabling the primary button while the async action is in flight.
- `Textarea`, `Select`, `Checkbox`, `Toggle`, and `Label` follow the same border/radius/focus contract.

### Cards & Containers (`{component.card}`)

- **`card`** — `rounded-xl border bg-card text-card-foreground shadow`. Flat, hairline-bordered, faintly raised. `variant="section"` marks a page block: on mobile it goes edge-to-edge (`max-sm:rounded-none max-sm:border-x-0`); nested cards (photo thumbnails, auth, onboarding) keep the default.
- **`card-header`** — `flex flex-col space-y-1.5 p-6`, holding `CardTitle` (`{typography.heading-card}`, `tracking-tight`) and `CardDescription` (`{typography.caption-md}`, `{colors.muted-foreground}`). Row headers (title + action) use `flex-row items-center justify-between space-y-0` so the action is vertically centred on the title block. The progress card header (`ProgressHeader`) wraps: the range control sits inline before `+` from `md:`, and drops to a full-width second row on mobile.
- **`card-content`** — `p-6 pt-0`. **`card-footer`** — `flex items-center p-6 pt-0`.
- Specializations: the **count/timer surface** (large `tabular-nums` readout + start/stop + live `pulse-ring`), the **analytics card** (`{component.chart}` with `{colors.chart-2}`/`{colors.chart-1}` series), the **path tile** (name + recent-progress glance), and the **photo carousel card**.

### Dialog / Bottom Sheet (`{component.dialog}`)

The system's signature responsive component — one component, two presentations:
- **Mobile (default):** anchored to the bottom — `inset-x-0 bottom-[var(--keyboard-inset,0px)] rounded-t-2xl border-b-0`, slides up from 100%, padded `pb-[max(2.5rem, env(safe-area-inset-bottom)+1rem)]`. A `useKeyboardInset` hook listens to `visualViewport` resize/scroll and writes `--keyboard-inset` so the sheet floats exactly above the keyboard instead of being hidden behind it.
- **Desktop (`sm:`):** recenters as a classic modal — `sm:left-1/2 sm:top-1/2 sm:-translate-*/2 sm:max-w-lg sm:rounded-lg`, slides in 8px from the bottom.
- **Overlay:** `bg-black/80` with fade in/out. **Close:** 44×44 hit target, top-right, `aria-label="Close"`, with `focus-visible` ring and `stopPropagation` so it never bubbles into the trigger.
- **Content rhythm:** `grid gap-4 p-6`; `DialogHeader`/`DialogTitle`/`DialogDescription`/`DialogFooter` give every dialog the same vertical cadence. `DialogFooter` stacks buttons on mobile (`flex-col-reverse gap-2`) and rows them right-aligned on `sm:`, always 8px apart.

### Charts (`{component.chart}`)

- Recharts wrapped in a themed container. Series colors are bound to CSS variables: the tracked metric uses `{colors.color-value}` (= `{colors.chart-2}`), the trend uses `{colors.color-trendValue}` (= `{colors.chart-1}`); additional series draw from `{colors.chart-3..5}`.
- Axes/labels use `{typography.caption-sm}` in `{colors.muted-foreground}`. The chart is the one place categorical color is allowed to bloom — it is, after all, the hero.
- **Range → visual:** `7D`/`30D`/`90D` render daily bars (empty days = 0); `180D`/`1Y` render a GitHub-style **heatmap** (`ProgressHeatmap`: week columns × weekday rows, month labels, `Less … More` legend) under the range total; `All` shows the total only. Heatmap intensity is 5 steps of `{colors.chart-2}` opacity (`bg-muted`, `/25`, `/50`, `/75`, full) relative to the busiest day — brighter on dark, deeper on light. A tooltip (day + time) follows hover, tap and arrow-key focus; on narrow screens the grid scrolls horizontally and opens at the latest week.

### Territory map (`{component.map}`)

The Map tab of the progress history card (`Days | Map` tabs live in the card header; the `TabsList` keeps `min-h-11` touch targets on mobile, `sm:min-h-8` on desktop, like the chart range control).

- **Unspent credits are announced twice:** the `Map` trigger carries a `bg-chart-2` count pill (`h-5 min-w-5`, `text-[11px]`, hidden at zero and before the first load, accessible name `Map, 2 cells available`), and earning a cell while the Days tab is open raises one toast — `+1 cell available` with an `Open map` action. The map state is therefore owned by the card, not the tab.

- **Grid:** a 40×40 SVG of `<rect>` cells laid out on a 21px pitch (20px cell + 1px gutter) inside the `viewBox`; the SVG itself is `w-full aspect-square` inside a `max-w-[70vh] mx-auto` frame, so the **whole map is always visible and never scrolls** — the cell is fluid, ~8px at 390px and ~13px in an 800px-tall desktop window. The `70vh` cap is what keeps the square inside the viewport on wide screens. Cell radius `3px` — one notch below `{rounded.md}`, because the cell is a tile, not a control.
- **Cell states:** free land `fill-muted` · water `fill-muted/40` (never claimable) · hard cell = land plus a centred 6px `fill-muted-foreground/60` marker (costs 3) · owned `fill-chart-2` — the tracked-value hue, so territory reads as data, not chrome · lost `fill-chart-2/20` with a dashed `stroke-chart-2` outline · claimable (adjacent to territory, affordable) `fill-chart-2/30` · selected cell gets a 2px `stroke-foreground` ring.
- **Selection, not tapping:** cells are far below the 44px target, so a tap only *selects* (Fitts); the commit happens in an inline bar under the grid (`min-h-14`, hairline border) that reads `Claim for 1 cell` / `Restore for 3 cells` or the disabled reason, with a full-size `{component.button}` confirm. Touch picks the cell whose centre is **nearest** the contact point rather than the rect under the fingertip; the tap never scrolls or claims. Arrow keys move the selection, Enter claims, Escape or a tap outside clears it.
- **Around the grid:** a credits line (`3 cells available · next in 37m`, `tabular-nums`) and a territory line (`12 cells · 2 lost`) above; a legend row (Yours / Lost / Hard / Water) below. Tooltips follow hover, tap and keyboard exactly like `ProgressHeatmap`. Loading is a `{component.skeleton}` stack, failure an inline message with a `button-outline` retry, and the empty map states the earning rule plus the time to the next cell.

### Navigation & Layout

- **Header/Layout** — app title + back/contextual control on the left; controls sit at `{rounded.md}`, the back button at the full 44px touch target. No persistent heavy top bar — the dashboard is the home. The sticky header uses the same solid `bg-card` as the cards below it (no translucent/blur tint); edge-to-edge with a bottom hairline on mobile, `sm:rounded-b-xl sm:border-x` from `sm:`.
- **Settings rows** — full-width `label` + control, separated by `{colors.border}` hairlines; groups include Theme toggle, Color Scheme picker (the accent swatch dots), Date/Time format, Default view, Account, Change password.
- **Color-scheme swatches** — circular `{rounded.full}` dots (`color-preview-default/blue/green/purple/orange`) showing each accent before it is applied globally via `data-color-scheme`.

## Do's and Don'ts

### Do
- Let the **data be the loudest thing on screen** — the count, timer, and chart series carry the color; keep the surrounding chrome neutral.
- Use exactly **one `{component.button}` `default` (accent) per fold**; pair it at most with a `button-outline` or `button-secondary` for the alternate (e.g. Cancel beside Save).
- Drive every color through its **token** (`hsl(var(--…))`) so light/dark/accent-scheme all resolve automatically. Never hard-code a hex in a component.
- Keep controls at `{rounded.md}` and cards at `{rounded.xl}` — the established two-step radius rhythm.
- Reserve `{colors.destructive}` for genuinely destructive/error states and `{colors.chart-2}` for the tracked value and the live `pulse-ring` — nowhere else.
- Render inputs at **16px on mobile** to defeat iOS zoom, and give every dialog/touch control a **≥44px** hit target.
- Make every dialog a **keyboard-aware bottom sheet on mobile** and a centered modal on desktop, from the single `{component.dialog}`.
- Respect `prefers-reduced-motion` — the `pulse-ring` and slide animations must collapse to ~0ms when the user asks for less motion.

### Don't
- Don't add decorative drop shadows or floating panels. Cards stay flat (hairline + faint `shadow`); only the dialog floats.
- Don't introduce a new accent hue in a component — the accent is the user's choice via Color Scheme, applied through `{colors.primary}` globally.
- Don't put two solid `{colors.primary}` blocks in the same fold; neutralize one to `button-outline`/`button-secondary`.
- Don't use chart colors (`{colors.chart-1..5}`) anywhere outside data visualization.
- Don't load a custom display font or hard-code font sizes that break the size/weight hierarchy — create emphasis with weight, not a new typeface.
- Don't let a dialog ignore the keyboard inset, render below 16px on mobile inputs, or ship a touch target under 44px.
- Don't introduce a third radius family — `{rounded.md}` (controls) and `{rounded.xl}` (cards), with `{rounded.2xl}` reserved for the sheet top edge, is the whole vocabulary.

## Responsive Behavior

### Breakpoints
Tailwind defaults: `sm` 640px · `md` 768px · `lg` 1024px · `xl` 1280px. The system is **mobile-first** — base styles target the phone, and `sm:`/`md:` progressively enhance for larger screens (the dialog's `sm:` modal re-anchoring is the clearest example).

### Key Adaptations
- **Dialogs:** bottom sheet (base) → centered modal (`sm:`), keyboard-aware on touch via `--keyboard-inset`.
- **Inputs:** 16px (`text-base`, base) → 14px (`md:text-sm`).
- **Button sizes:** `default` `h-11` → `h-9`, `sm` `h-10` → `h-8` on `sm:`; inputs and select triggers `h-11` → `h-9`; menu/select items `py-2.5` → `py-1.5`.
- **Grids:** dashboard/path tiles multi-up on desktop → single column on mobile; carousels switch to peek-next horizontal scroll.
- **Safe areas:** the app honors `viewport-fit=cover` plus `env(safe-area-inset-*)`; `min-height: 100dvh` keeps the canvas full-height with mobile browser chrome.

### Touch Targets
Interactive controls meet WCAG (44×44px): the `icon` button size is 44px, the dialog close and header back button were explicitly raised to 44px, `default` buttons, inputs, select triggers, and settings nav rows are 44px tall on mobile (desktop keeps its compact sizes), menu/select items and recent-note chips are ~40px on mobile; adjacent targets keep ≥8px gaps (carousel navigation sits 16px from its Add action); and touch-only affordances (e.g. the previously hover-only edit pencil) are made always-visible on touch via the `touch-visible` utility (`opacity 0.7` on touch, `0.3 → 1 on hover` for pointer devices).

## Theming

- **Dark mode** (`darkMode: 'class'`): every token has a `.dark` value in `src/app/index.css`; `<meta name="theme-color">` switches the browser chrome to `#ffffff` (light) / `#0a0a0b` (dark) to match.
- **Color scheme** (`:root[data-color-scheme="blue|green|purple|orange"]`): overrides `{colors.primary}` and `{colors.accent}` only — the rest of the neutral system is untouched, so the accent re-skins the whole app without touching component code.
- **Reduced motion**: a global `@media (prefers-reduced-motion: reduce)` block neutralizes animations, transitions, and smooth scroll.

## Known Gaps

- **Empty / error / loading states** beyond `Skeleton`, `Loader`, and `ErrorBoundary` are not yet fully specified per screen — define skeletons and retry affordances as new screens are added.
- **Print / export styling** for analytics is not documented.
- **High-contrast / forced-colors mode** is not yet explicitly tuned.
- **Icon inventory** (lucide-react) is used ad hoc; a documented icon-usage map per action would tighten consistency.

## Iteration Guide

1. Work on ONE component at a time and verify every property resolves to a real token in `src/app/index.css` / `tailwind.config.js`.
2. Reference tokens and component names directly (`{colors.primary}`, `{rounded.xl}`, `{component.dialog}`) — never paraphrase a hue or radius in prose.
3. Default body to `{typography.body-md}`; reach for `{typography.body-strong}` on labels and nav; reserve `{typography.display-count}` strictly for the live count/timer.
4. Keep `{colors.primary}` scarce — if more than one solid accent block lands in a fold, neutralize one.
5. Before adding a token, ask whether the existing card + control + chart + token vocabulary already expresses it. The system's strength is that it rarely needs a new one.
6. Verify any change in **both** themes and **all** color schemes, and confirm `prefers-reduced-motion` and the ≥44px touch-target contract still hold.
