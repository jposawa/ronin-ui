# RoninUI — Decisions Record

> Decisions belong to @jposawa. This file records what is **settled** and what is still open.
> Anything not written here is not decided.

Started 2026-09-06.

---

## Identity

| | |
|---|---|
| Package name | `@jposawa/ronin-ui` (npm forbids uppercase in package names) |
| Display name | **RoninUI** — README, Storybook title, repo |
| Concept | "Ronin" — a library with no daimyo. Serves no design system, wraps none |
| Repo | `D:/Projetos/pessoais/ronin-ui`, single package (not a monorepo) |

---

## Settled

### Distribution — npm, public

Published to npm as a public scoped package. `publishConfig.access: "public"` is required —
scoped packages default to private and `npm publish` fails asking for a paid plan.

Rejected: install from a GitHub tag. It requires either committing `dist/` to the repo or a
`prepare` script that builds during the consumer's install. Both are fragile.

Local development against a consumer uses a file link, not a publish cycle:

```bash
pnpm add "file:../ronin-ui"
```

Version stays `0.x` while the public API is unstable. On `0.x`, a breaking change bumps the
minor.

### Component naming — no prefix

Exported as `Button`, `Input`, `Modal` — not `CustomButton`, not `RnButton`. The scoped import
already qualifies the origin:

```ts
import { Button, Input, Modal } from "@jposawa/ronin-ui"
```

A consumer with a local name collision aliases at the import site:

```ts
import { Button as RoninButton } from "@jposawa/ronin-ui"
```

Rejected: a fixed prefix. It pushes noise onto every call site to solve a collision that
rarely happens.

### Button API — two orthogonal axes

```ts
type ButtonIntent = "primary" | "secondary" | "danger" | "warning" | "success" | "neutral"
type ButtonVariant = "filled" | "outline" | "text"
```

- `intent` — semantic **colour** role. Which token group the component reads.
- `variant` — visual **form**. How the box is drawn.

The two never merge. Keeping them separate is what allows `variant="text" intent="danger"`.

`variant="text"` renders the button as inline copy: no padding, `font: inherit`, sits on the
text baseline around it, `text-decoration: underline` on hover and focus. It is the "link in
the middle of a sentence" case.

Deliberately **not** included: `ghost` (a bordered-less button that still occupies a button
box). No use case justified it, and it sits close enough to `outline` and `text` to confuse.

> Migration note: `ficha-medica` and `dknav` currently ship `variant: "text"` meaning
> "no background, no border, still a button box". That is nearer to the dropped `ghost` than
> to RoninUI's `text`. Their call sites need review at migration time, not a blind rename.

Origin of this API: union of the three that already diverged across `../` — `ficha-pet`
(`variant` + `fullWidth`), `ficha-medica`/`dknav` (`intent` + `variant`), `fantraveller`
(`variant` + `role`).

### Showcase — Storybook

Storybook at the repo root, a `devDependency`. Not a workspace, not a published package.

Agents write stories but never run the Storybook server — see the agent execution limits in
`STANDARDS.md`. @jposawa runs it and judges the visual result.

### First consumer — dhsw

`../dhsw` adopts first. It is new, so migration cost is zero — it consumes from day one
instead of having existing components ripped out.

Known weakness of this choice: greenfield does not stress-test the API against existing usage.
Mitigation — the API is **designed** from the real usage already read in `ficha-pet`, `dknav`
and `fantraveller`, and only **validated** in dhsw.

### Scope of phase 1

Eight components plus the token sheet:

`Button`, `Input`, `Modal`, `Avatar`, `Badge`, `Chip`, `SectionLabel`, `Stepper`.

**Complete as of 2026-09-07**, plus `Tooltip` pulled forward from phase 2. Nine components,
each with a story, `typecheck` / `lint` / `verify:contrast` / `build` green.

Every component that carries a semantic colour reads the shared `Intent` type from
`src/types/intent.ts` rather than declaring its own union — `ButtonIntent`, `BadgeIntent` and
`ChipIntent` are aliases of it. Six unions drifting apart is how the consuming projects got
three incompatible buttons in the first place.

What comes from where:

| Source | Component | Note |
|---|---|---|
| dhsw | `Avatar` | generic; `ficha-pet` has one too |
| dhsw `Tag` | `Badge` | static label. `ficha-pet` calls the same thing `Badge` |
| dhsw `Chip` | `Chip` | interactive toggle — **not** merged with `Badge`, see below |
| dhsw | `SectionLabel` | section labelling is universal, not domain |
| dhsw | `Stepper` | numeric increment, confirmed generic |
| several | `Button`, `Input`, `Modal` | already duplicated across 9 projects |

Stays in dhsw, not generic: `Pip` (RPG resource marker), and `StepRule` — **not** a progression
rule as an earlier draft of this file guessed from the name, but a decorative section mark:
three descending bars and a hairline filling the rest of the row, `aria-hidden`. The motif is
dhsw's visual signature, so it stays there.

### `SectionLabel` — what the port got wrong

Read from dhsw's source only after it was written, which is the wrong order and produced drift:

| | dhsw | first RoninUI port | now |
|---|---|---|---|
| detail slot | `detail?: string` | `addon?: ReactNode` | `detail?: ReactNode` |
| heading | none, always a `<div>` | `headingLevel?: 2…6` | kept |
| divider line | none | **invented a `::after` rule** | removed |
| outer margin | `margin: var(--space-4) 0 var(--space-2)` | none | none |

The invented rule is the real error. dhsw draws that line with `StepRule`, a separate
component — so the port folded two deliberately separate concerns into one and baked one app's
decoration into a generic label. Removed.

`headingLevel` is kept as a deliberate addition, not drift: dhsw's `<div>` leaves every section
label out of the document outline, and an opt-in heading fixes that without forcing anything.
`detail` keeps dhsw's name to keep its migration a rename-free one, with the type widened to
`ReactNode` so a `Badge` fits where a count did.

The outer margin stays gone — it is the container's, per the layout rule in `STANDARDS.md`.

### `Section` and `SectionLabel` both stay exported

`Section` is the one most consumers want: a `<section>` with an optional title above its
content, which is the same four lines of markup otherwise written every time.

`SectionLabel` stays exported because `Section` is built from it, and the wrapper is not always
the library's to provide — a card header, a toolbar, a column heading inside a grid the
consumer already controls. Exporting the parts of a composition is what lets someone compose it
differently. dhsw also uses the label standalone today.

It is a judgement call rather than an obvious one: the cost is two entries in the public API
where one would cover the common case.

### `Badge` and `Chip` are two components, not one

Read from the dhsw source, not assumed. They differ in element, semantics, and interaction:

| | `Badge` (dhsw `Tag`) | `Chip` |
|---|---|---|
| Element | `<span>` | `<button type="button">` |
| Interaction | none, static | `onToggle`, `aria-pressed` |
| State | none | `isActive` |

Merging them would give `Badge` an optional `onToggle` that silently changes the rendered
element and the accessibility tree. Two components.

An earlier draft of this file proposed merging them. The source said otherwise.

### `Stepper` is numeric increment

`−` / value / `+`, with `canDecrease` and `canIncrease` guards. Not a wizard step indicator.
Generic, moves to the library as is.

One change on the way in: dhsw hardcodes pt-BR accessible names (`Diminuir ${label}`,
`Aumentar ${label}`). The library ships no UI copy — those become props with English defaults,
and dhsw passes its own strings.

### Consumers already share the theming contract

`dhsw/src/styles/tokens.css` independently arrived at the same shape as `ficha-pet`:
`@property` registrations before `:root`, non-theming tokens in `:root`, colours in
`.theme-dark` / `.theme-light`, and an identical `--space-1…6` scale.

So the RoninUI theming contract costs the first consumer nothing structurally. The colour
token **names** are a different story — see Open.

---

### Install is one step

```bash
pnpm add @jposawa/ronin-ui
```

```tsx
import { Button } from "@jposawa/ronin-ui"
```

No CSS import line, no provider, no config. The built `dist/index.js` carries
`import "./styles.css"` at the top, added at build time by `vite-plugin-lib-inject-css`.

This is needed because Vite in library mode extracts CSS to a file and does **not** put the
import into the emitted JS — which is why most libraries make consumers import the stylesheet
by hand. The plugin injects a real import of a real file: no runtime style injection, no FOUC,
SSR-safe.

`./styles.css` and `./tokens.css` remain published as explicit exports for anyone wanting
manual control.

### No provider

Rejected, twice, for two different reasons — recorded because the idea is genuinely tempting.

**"It would import the CSS for the consumer."** A CSS import is a module side effect, not a
render side effect. Any module in the package can carry it, and the entry does. Importing
`{ Button }` already brought the stylesheet in; a provider adds nothing.

**"It would hold the theme."** That is app state. Every consumer already owns it — `dhsw` in
jotai, others elsewhere. A provider would take that over, add a context spanning components
(hard rule 1), and put a versioned runtime API in the way of a `className`.

Line count is not on its side either:

```tsx
<RoninProvider theme="dark"><App /></RoninProvider>   // needs an import too
<div id="app" data-ronin-theme="dark">…</div>          // needs nothing, and the wrapper already existed
```

A `<ThemeScope theme="dark">` rendering a plain `<div data-ronin-theme="dark">` — no context, no
state — would be harmless sugar. Not in phase 1: it saves nothing over the attribute and becomes
public API to maintain forever.

### Theming — three behaviours, zero JavaScript

The selector is **`data-ronin-theme`**, set on any element the consumer already has — an app
shell, `<html>`, a single card. No wrapper is added for it.

| Consumer does | Result |
|---|---|
| nothing | RoninUI defaults, following `prefers-color-scheme` |
| `data-ronin-theme="dark"` | dark, always |
| `data-ronin-theme="auto"` | explicitly follows the OS |
| drives the attribute from its own state | works; the library never knows |

An attribute rather than `.theme-dark` classes, for three reasons: HTML enforces one value at a
time where two classes can both be present and let source order decide silently; `auto` gets a
value of its own instead of meaning "remove the class"; and `.theme-dark` is far too generic a
name for a library to reserve globally.

Defaults sit on `:where(:root)` (zero specificity) with a `prefers-color-scheme` block, so an
explicit value always wins — even applied to `<html>`. Nested themes come free from
custom-property inheritance. Mechanics in `STYLING.md`.

The **tokens stay unprefixed** on purpose. There the collision *is* the mechanism — a consumer
overrides by redefining the same name. The theme selector is a namespace the library claims;
the tokens are a namespace it deliberately shares.

Theme values set custom properties and `color-scheme` only — not `background`, not `color`.
Painting the wrapper is layout, and layout belongs to the consumer.

### Overrides go through cascade layers

Library CSS ships inside `@layer ronin.tokens` and `@layer ronin.components`. Unlayered CSS
beats any layer regardless of specificity or source order, so a consumer overrides by writing
ordinary CSS and import order stops mattering.

Without layers, the library's `[data-ronin-theme="dark"]` and the consumer's identical selector
have the same specificity and whichever loads last wins silently — a failure with no error
message.

### Colour token names — RoninUI owns the shared set

The two reference projects matched on structure and diverged on vocabulary.

| Concern | `ficha-pet` | `dhsw` |
|---|---|---|
| body copy | `--color-text` | `--color-ink`, `--color-ink-reading` |
| UI furniture | `--color-text-strong` | `--color-chrome`, `--color-chrome-strong`, `--color-chrome-dim` |
| dim text | `--color-text-muted` | `--color-text-muted`, `--color-text-dim` |
| accent | `--color-primary`, `--color-secondary` | none — domain colours instead (`--color-domain-*`) |
| hairline | `--color-border` | `--color-border`, `--color-border-subtle` |

dhsw has **no `--color-primary`**.

> An earlier draft of this file claimed a RoninUI `Button` would therefore render colourless.
> Wrong: the library ships defaults for every token it reads, and the entry pulls them in. It
> renders in RoninUI blue until dhsw overrides it — cosmetic, not broken.

**Decision: RoninUI owns the shared names. Consumers keep their own vocabulary on top.**

dhsw defines `--color-primary`, `--color-text` and the rest of the shared set pointing at its
own hexes, and keeps `--color-ink*`, `--color-chrome*`, `--color-domain-*`,
`--color-border-subtle`, `--color-text-dim` for its own components.

The `chrome` / `ink` split is genuinely good — it separates interface furniture from reading
copy, which a text-heavy compendium needs. It is also dhsw's vocabulary, not a general one, so
it stays in dhsw.

Rejected: RoninUI adopting `ink` / `chrome` (re-titles every token in a project already
shipped). Rejected on sight: an alias layer in the library — two names for one value is how a
token system rots.

### Duplicate `@property` registrations

`dhsw/src/styles/tokens.css` registers five names RoninUI also registers: `--color-bg`,
`--color-bg-elevated`, `--color-surface`, `--color-border`, `--color-text-muted`.

A duplicate registration is not an error — the last valid one in document order wins — and it
is unverified whether `@layer` changes that precedence. The question is made irrelevant rather
than answered: **dhsw drops those five registrations** and keeps only its own. Nothing
overlaps, nothing needs verifying, and it is the end state of the decision above anyway.

---

### Interaction states — the library styles hover, focus and disabled. Not active.

The line, settled 2026-09-06:

| State | Owner | Why |
|---|---|---|
| `:focus-visible` | library | Accessibility. `STANDARDS.md` makes it mandatory |
| `:disabled` | library | Semantics — the attribute already says it |
| `:hover` | library | Without it `outline` and `text` read as inert on desktop, and the underline on hover *is* what marks `variant="text"` as clickable |
| `:active` | **consumer** | Press effects are opinion, and opinion the consumer has to *undo* rather than opt into |

That asymmetry is the test, and it generalises: when a default would have to be removed rather
than added, it does not belong in the library.

A press effect was written and then removed. The comment explaining why sits in
`Button.module.css` so it does not creep back in.

### Default palette — Celestial Night

Chosen from five candidates on one criterion: **does the accent hue have usable luminance range
on both a light and a dark ground?** Measured, not judged:

| Candidate | Accent | on white | on its own dark ground |
|---|---|---|---|
| LUNA | none — a neutral ramp | — | — |
| Noguchi | `#896f3d` | 4.77 AA | 3.42 UI only |
| **Celestial Night** | `#D4B06A` | 2.06 ✗ | 9.16 AA |
| Green Gray | `#27e9b5` | 1.57 ✗ | 11.53 AA |
| Light Blue | `#00c6e6` | 2.05 ✗ | 8.10 AA |

No candidate passes both as authored — which is expected, and is exactly why the library already
ships different hexes per theme. The real question is whether the *hue* survives the trip. Gold
does: `#8A6D2F` reaches 4.87:1 on paper and `#D4B06A` reaches 9.16:1 on night sky. Mint and cyan
do not — lightening them enough for a light ground turns them into a different colour, so those
two are dark-only.

Celestial won on four counts: it is the only candidate with a full ramp (four navies map straight
onto `bg` / `bg-elevated` / `surface` / `border`, ivory onto `text-strong`); its accent has range
in both themes; navy works as dark ground *and* as light-theme secondary (`#142B52` is 14:1 on
white); and navy-and-gold is the vocabulary of Japanese lacquer with *maki-e*, which for a
library called Ronin is coherence rather than decoration.

**Navy is `primary`, gold is `secondary`** — swapped 2026-09-07 on @jposawa's call. It is also
the better assignment on the numbers: navy holds 8.98:1 on paper against gold's 4.87:1, so the
most-used accent is the one with the wider margin.

Two things every palette needed and none of the five supplied:

- **Semantic colours.** Not one candidate carries a red, an amber or a green. `danger`,
  `warning`, `success` and `info` were chosen to harmonise and then verified.
- **`warning` had to move out of amber**, and **`info` out of blue.** Each would otherwise be a
  sibling of an accent: amber of the gold, blue of the navy. Warning sits in red-orange
  (`#A65A1E` / `#E8934A`), info in teal (`#0F6E80` / `#45C3DE`).

#### The two tight pairs, stated plainly

Hue separation across the accents, measured:

| Pair | Separation | Note |
|---|---|---|
| `secondary` ↔ `warning` | 12–15° | tightest in the palette |
| `primary` ↔ `info` | 21–24° | |
| `info` ↔ `success` | 42–43° | fine |
| `primary` ↔ `secondary` | 172–173° | near-complementary, as intended |

Neither tight pair is fixable by moving hue alone. Warning is boxed in between the gold and
`danger` red — pushing it away from gold collapses it onto danger. What separates both pairs is
**chroma and lightness**, not hue: the gold is desaturated and dark where warning is a saturated
orange; the navy primary is muted where info is a vivid teal.

This is a real constraint of a gold-accented palette, not a solved problem. If a component ever
puts `secondary` and `warning` side by side as peers, that pairing needs a second look.

#### The contrast check, and the hole that was in it

Every pair is verified by `pnpm verify:contrast` (`scripts/verify-contrast.mjs`): 39 pairs per
theme — every text token on every surface, **every accent on every surface**, and
`--color-on-accent` on every accent fill.

The first version of that check tested accents only against `bg` and `bg-elevated`, never against
`surface`. Four values were passing review while failing in the browser: `danger` (4.43:1),
`secondary` (4.05:1), `success` (4.18:1) and `warning` (4.26:1), all on `--color-surface`. They
were caught only when the check was widened, and all four were darkened until they passed.

The script now **parses `tokens.css`** instead of keeping its own copy of the hexes. The earlier
copy is what allowed the drift in the first place.

**Changing any hex in `tokens.css` means re-running it.** It is in the allowed-commands list in
`STANDARDS.md` for that reason.

#### `danger` — redder, on request

`#C13B33` read as a dark orange rather than a red: hue 3° but only 58% saturation. Replaced with
`#C1181E` light / `#FF5F63` dark — hue 358–359°, saturation 78% and 100%. Separation from
`warning` improves from 23–24° to 28–29° as a side effect.

### Palette presets — two attributes, not one compound value

Proposed as `data-ronin-theme="celestial"` / `"celestial-dark"`. Rejected as an encoding, adopted
as an idea.

Rejected because it collapses two independent axes into one value — the same mistake as folding
`intent` into `variant`, which this file already rejected once. It also destroys `auto`: there is
nowhere for "this preset, following the OS" to live.

Adopted, because the inheritance instinct behind it is right. Dark should override only the
deltas, not restate the palette. That works with two attributes and a compound selector:

```css
[data-ronin-palette='luna'] { /* the full set, light */ }
[data-ronin-palette='luna'][data-ronin-theme='dark'] { /* only what changes */ }
```

Specificity rises from `0,1,0` to `0,2,0` on its own, so the cascade does the inheriting with no
extra machinery.

One documented constraint: both attributes must sit on the **same element**. A nested theme
carries both.

Presets ship as opt-in files (`@jposawa/ronin-ui/palettes/luna.css`), never in the default
bundle — five presets times two themes is weight almost nobody uses. Green Gray and Light Blue
are documented dark-only. Phase 3.

### Tooltip — built on floating-ui, externalised

Requested 2026-09-06, settled 2026-09-07. Two constraints shaped it:

- **It cannot be hover-only.** `STANDARDS.md` forbids that, and touch has no hover. It opens on
  hover *and* on focus, and needs a tap path on touch. That means self-contained state — allowed
  for a component, unlike state that reaches outward.
- **Positioning is the real decision.** A CSS-only tooltip (absolute, relative to a wrapper) has
  no dependency and no bundle cost, but it is clipped by any `overflow: hidden` ancestor and
  cannot flip when it would leave the viewport. `@floating-ui/dom` solves both and costs a
  runtime dependency, which `STANDARDS.md` requires a written reason for.

**Measured cost of `@floating-ui/dom`** (v1.8.0, minified browser builds, gzipped):

| Package | gzip |
|---|---|
| `@floating-ui/dom` | 4.0 kB |
| `@floating-ui/core` | 4.7 kB |
| **total** | **~9 kB** |

For scale, the whole library is currently 2.3 kB gzip of JS. But the cost is **opt-in per
consumer**: `sideEffects` lists only CSS, so an app that never imports `Tooltip` never pulls
floating-ui into its bundle.

**Taken.** floating-ui is a runtime dependency, and it is **not bundled** — `vite.config.ts`
externalises `@floating-ui/*` alongside react. The built entry keeps a bare
`import { … } from '@floating-ui/dom'`, so an app that never imports `Tooltip` drops the import
along with the dead code instead of relying on tree-shaking to pick it out of an inlined copy.
Bundling it first cost 10.25 kB gzip of `index.js`; externalising brought that back to 3.34 kB.

Two implementation notes worth keeping:

- The trigger wrapper is **not** `display: contents`, tempting as that is for staying out of the
  layout. An element with no box has an empty `getBoundingClientRect()`, so floating-ui would
  measure against nothing. It is `inline-flex`, which hugs the trigger — with the documented
  consequence that wrapping a direct child of a flex or grid container moves the layout one
  level down.
- The tooltip renders in a portal with `strategy: 'fixed'`. Either alone is not enough: the
  portal escapes `overflow: hidden` ancestors, the fixed strategy keeps it aligned while an
  ancestor scrolls.

### Modal — built on the native `<dialog>`

Focus trapping, Escape, returning focus to the trigger, marking the rest of the page inert, and
rendering above every stacking context all come from the browser. There is no z-index in
`Modal.module.css` because `showModal()` puts the element in the top layer, where nothing
competes with it.

The `cancel` event (Escape) is prevented and turned into an `onClose` call, so open state stays
owned by the consumer. Without that the dialog would close itself while the prop still said it
was open, and the two would disagree until the next toggle.

---

## Open — needs @jposawa

- **npm scope `@jposawa`** — requires the npm user or org to exist. If the scope is
  unavailable, fall back to an unscoped name and check its availability before the first
  publish.
- Which components make phase 2, and whether `ficha-pet` migrates before or after `dhsw`
  proves the API.

---

## Rejected, with reasons

| Idea | Why not |
|---|---|
| Monorepo (`packages/ui` + `apps/*`) | Dropped once BFF was off the table. Storybook needs no workspace, and a single package makes publishing trivial |
| A shared BFF package | Backends diverge — `ficha-pet` is heading to Supabase, `dhsw` and `fantraveller` are on Firebase. A generic BFF is either empty or a leaky abstraction |
| Wrapping antd / mantine | Would make RoninUI a skin over two design systems with conflicting release cycles. Contradicts the whole concept |
| Fixed component prefix (`Rn*`, `Custom*`) | Noise at every call site; the scoped import already disambiguates |
| `text` as a `ButtonIntent` value | Collides with `variant: "text"`, and would make an inline **coloured** button impossible since `intent` holds one value |
| `<RoninProvider>` | Delivers nothing a package import does not — CSS import is a module side effect. Holding theme state would break hard rule 1 |
| Consumer-side `import "@jposawa/ronin-ui/styles.css"` as the required step | `vite-plugin-lib-inject-css` removes it. The export stays for anyone who wants manual control |
| Relying on import order for overrides | Identical specificity, last one silently wins. Cascade layers instead |
| Theme values setting `background` / `color` | Painting a container is layout, and layout belongs to the consumer |
| `.theme-light` / `.theme-dark` classes as the theme selector | Too generic for a library to reserve; two can be active at once; `auto` would have to mean "remove the class" |
| Prefixed tokens (`--ronin-color-primary`) | The collision is the override mechanism. Prefixing would force every consumer to map token by token |
