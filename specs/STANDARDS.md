# Coding Standards

Adapted from the app standards shared across `../`. Divergences from those are marked
**library-specific**.

## Language

Code (identifiers, types, file names, constants, comments) → **English**.

**Library-specific:** there is no UI copy here. A component that hardcodes user-facing text in
any language is wrong — text arrives as a prop. Defaults for `aria-label` and similar are the
one exception, and they are English.

### Stories are English and domain-neutral

Story content is read by everyone evaluating the package, so it is written in **English**.

It is also **generic**: settings, teams, projects, bookings, files. Never the vocabulary of a
consuming app — no character sheets, no vaccinations, no RPG resources. A story that knows what
a domain object is contradicts the no-domain-knowledge rule in `CLAUDE.md` just as much as a
component would, and it teaches the wrong thing to whoever reads it first.

Use a translated-label story to show a copy prop being overridden — that is the one place
another language earns its keep, and it demonstrates the prop rather than the domain.

---

## Naming

Names must be intuitive and descriptive. No single-letter vars outside loop indices. No vague
names (`data`, `info`, `temp`, `handler`).

```ts
// Bad
const handleClick = (e) => { ... }
const fn = (x) => x * 2

// Good
const handleOverlayClick = (event: React.MouseEvent) => { ... }
const toDoubleScore = (score: number) => score * 2
```

Event handlers: `handle` + noun + verb → `handleModalClose`, `handleInputChange`.
Booleans: prefix `is`, `has`, `can`, `should` → `isLoading`, `hasError`, `canSubmit`.

### Booleans: `true` marks the deviation

The consistency worth having is not that every boolean behaves alike — it is that each one's
purpose is obvious at the call site. Three kinds, and the kind decides the shape.

**1. Optional flags — `true` is the departure from normal.** JSX's shorthand only sets `true`,
so the bare form should be the interesting one. Name the prop for what setting it *does*, and
let the default behaviour be its absence. HTML works this way: `disabled`, `hidden`, `readonly`,
`inert`.

```tsx
// Good — the flag marks the exception
<Tabs hideDots />
<Modal isPersistent>

// Bad — the only interesting direction costs an explicit false at every call site
<Tabs hasDots={false} />
<Modal isDismissible={false}>
```

`isDismissible` and `hasArrows` / `hasDots` were both named the other way first, and both failed
on the first call site written against them.

**2. State the consumer owns — required, never defaulted.** `isOpen`, `isActive`, `activeTabId`,
`openIds`. A default here would let a component render a state nobody chose, and quietly
disagree with the consumer's own. These carry no default at all.

**3. Computed inputs — whichever reading is clearest.** A boolean always fed an expression never
appears bare, so the shorthand argument does not apply. `Stepper`'s
`canDecrease={value > minimum}` stays positive, because nobody writes `<Stepper canDecrease />`
and `isAtMinimum` would only invert the reader's work.

### A prop that forwards a native attribute keeps the native name

`disabled`, not `isDisabled`. `type`, `className`, `style`, `aria-*` — same rule, already
followed everywhere because those arrive through the element's own prop types.

The library shipped `disabled` on `Button` and `Input` (inherited from the HTML attribute types)
and `isDisabled` on `Chip` and `Collapse` at the same time, so a consumer learned one name and
hit a type error with the other. The prefix convention above applies to library state —
`isOpen`, `isActive`, `isFullWidth` — never to an attribute being passed straight through.

### To choose a title's element, pass the element

No `as`, no `titleAs`, no `headingLevel`. Write the tag in the title and the component puts it
where it belongs.

```tsx
<SectionLabel><h2>Account</h2></SectionLabel>
<Section title={<h2>Account</h2>}>
<Collapse title={<h3>Advanced</h3>}>

<Collapse title="Advanced">   // plain text — no heading, by design
```

The mechanism is `isHeadingElement` in `src/helpers/heading.ts`: a title that is a bare
`<h1>`…`<h6>` is **hoisted** — the tag becomes the wrapper, its children become the title's
content, and its own attributes are forwarded. Anything else renders as content, unchanged.

Hoisting is what makes passing the tag work rather than merely look like it works. `Collapse`
puts its title inside a `<button>`, which accepts phrasing content only: a heading rendered
there is invalid markup *and* is flattened into the button's accessible name, so the role is
lost. `SectionLabel` defaults to a `<span>` and has the same problem. Both need the heading on
the outside, which is exactly where hoisting puts it.

Two rejected alternatives, both tried here first:

- **`headingLevel={3}`** — accurate and unguessable. No library names a prop that way, so it
  reads as magic to whoever has to remember it.
- **`as` / `titleAs`** — the familiar polymorphic idiom, but two spellings for one idea across
  three components, and still a prop to discover before the obvious thing works.

The ecosystem is no help: Radix hardcodes `h3`, Chakra hardcodes `h2`, MUI and antd render no
heading at all. Since every option is off the beaten path, the one that reads best at the call
site wins.

**Plain text means no heading, on purpose.** A collapse inside a form is not a section heading,
and the right level depends on what surrounds the component — which it cannot see. A wrong
level in the outline is worse than none.

Callback props take `on` + noun + verb → `onValueChange`, `onClose`.

---

## Functions

Default: arrow functions.

```ts
const formatLabel = (label: string): string => { ... }

const Badge = ({ label }: BadgeProps) => (
  <span>{label}</span>
)
```

Use a `function` declaration only for a clear benefit: hoisting, self-referencing recursion, or
a named stack trace that genuinely helps.

---

## Simplicity

Code reads like plain logic. No clever one-liners. No premature abstraction.

Early returns over nested conditionals. Always use `{}` blocks, even for a single-line return.

```ts
// Bad
const getLabel = (value?: string): string => {
  if (!value) return "—"
  return value
}

// Good
const getLabel = (value?: string): string => {
  if (!value) {
    return "—"
  }

  return value
}
```

`.reduce` is allowed, but the accumulator and current value are named after what they
represent — never `acc`/`x`.

If a function needs a comment to explain *what* it does (not *why*), rename or simplify it.

---

## Types

### `type` over `interface`

Always `type`. `interface` allows silent declaration merging — any file can extend it
unexpectedly. **Library-specific:** this matters more here than in an app. A consumer can
augment an exported `interface` from its own code and change the library contract without
touching the library.

```ts
// Bad
interface ButtonProps { ... }

// Good
type ButtonProps = { ... }
```

Use `interface` only when intentionally extending a third-party type that requires it.

### React hooks namespace

Always the `React.` namespace. Do not destructure-import hooks.

```ts
// Bad
import { useState } from "react"
const [isOpen, setIsOpen] = useState(false)

// Good
import React from "react"
const [isOpen, setIsOpen] = React.useState(false)
```

### Avoid `enum`

`enum` compiles to runtime code, numeric enums reverse-map, and `const enum` breaks under
`isolatedModules`. Use an `as const` object plus a derived union.

```ts
const BUTTON_VARIANT = {
  Filled: "filled",
  Outline: "outline",
  Text: "text",
} as const

type ButtonVariant = typeof BUTTON_VARIANT[keyof typeof BUTTON_VARIANT]
```

---

## Component contract

### `BaseComponent`

Every exported component accepts `className` and `style`.

```ts
// src/types/component.ts
type BaseComponent = {
  className?: string
  style?: React.CSSProperties
}

type ButtonProps = BaseComponent &
  React.ButtonHTMLAttributes<HTMLButtonElement> & {
    intent?: ButtonIntent
    variant?: ButtonVariant
  }
```

`className` is appended **last** in `clsx` so a consumer class wins the cascade.
`style` is passed straight through and is the consumer escape hatch, not the library one — the
library never writes static design values inline.

### Native props pass through

A component wrapping a native element spreads the rest of its props onto that element. A
consumer needing `aria-describedby`, `data-testid`, or `formAction` must not have to fork the
component.

### Forwarding refs

Any component rendering a focusable or measurable element forwards its ref. React 19 accepts
`ref` as a plain prop — no `forwardRef` wrapper needed.

### Controlled by default

Inputs are controlled: `value` in, `onValueChange` out. An uncontrolled mode may be added
later, deliberately, never by accident.

---

## Styling

No CSS frameworks. No inline styles (`style={{}}`) written by the library. CSS modules only,
scoped per component. Full token and unit rules in `STYLING.md`.

### The one allowed inline style: custom property passthrough

A component may write a CSS custom property into `style` when the value is genuinely per
instance and supplied by the consumer. This is not a design value — it is a variable handoff,
and it is the mechanism that lets a consumer colour one instance without a new variant.

```tsx
// Allowed — the consumer passes a token, the CSS module consumes it
<span
  className={clsx(styles.tag, className)}
  style={{ ...style, "--tag-color": color } as React.CSSProperties}
/>
```

```css
/* Tag.module.css — falls back to a token when the consumer passes nothing */
.tag {
  color: var(--tag-color, var(--color-text));
}
```

Two rules on it: the consumer `style` spreads **first** so it can override, and the CSS always
declares a fallback so the component renders correctly with the prop omitted.

Writing `style={{ padding: "8px" }}` remains forbidden. The test is whether the value could
have lived in the module — if it could, it must.

### Write nested CSS

Native nesting, not repeated class names. Everything a component's root owns nests inside it —
states, variants, descendants, media queries.

The build flattens it: there is no `&` in `dist/styles.css`, so nesting costs the consumer
nothing in browser support. It is authoring ergonomics, and it keeps a component's rules in one
readable block instead of scattered across the file.

### Variants are `data-*` attributes, not generated class names

```tsx
// Good
<button className={clsx(RONIN_SCOPE, styles.button)} data-intent={intent} data-variant={variant} />

// Bad — a lookup map per axis, and a hashed class in devtools that says nothing
const VARIANT_CLASS: Record<ButtonVariant, string> = { filled: styles.variantFilled, … }
```

Three reasons: no lookup map to keep in sync with the union type; the rules nest under one
selector; and the component's state is legible in devtools — `data-variant="outline"` rather
than `_variantOutline_1a2b3`.

They are **not prefixed**: the hashed module class already scopes them. Only `data-ronin-theme`
carries a prefix, because it sits on an element the consumer owns.

**Prefer an attribute the DOM already has.** `Chip` styles its pressed state from
`[aria-pressed='true']` and `Input` its invalid state from `[aria-invalid]`, rather than adding
a second attribute mirroring them — one source of truth, and the styling cannot drift out of
sync with what a screen reader announces.

### The scoped reset, and what is not in it

Every component root carries `RONIN_SCOPE` (`src/constants/scope.ts`). `styles/reset.css` uses
it to set `box-sizing: border-box` on library boxes, and `inherit` below them.

Scoped, not global: a bare `*` rule would change `box-sizing` across the consumer's whole page
just because they imported a button. Declaring it per class was the earlier approach and failed
the way that approach always fails — a class was added without it, and `width: 100%` plus
padding plus a border overflowed, surfacing as a horizontal scrollbar on a `Modal` far from the
`Input` that caused it.

`margin` and `padding` are zeroed too, but **on the roots only**, never on descendants. Several
roots are elements the user agent gives margins to — a heading from `SectionLabel`, a
`<dialog>` — and leaving each component to remember `margin: 0` is the same fragile bookkeeping
that let the missing `box-sizing` through.

Under `.ronin-scope *` they would strip the margins off a consumer's own paragraphs and lists
the moment those were placed inside a `Modal` or a `Section` — the library restyling content it
does not own. Descendants get `box-sizing: inherit` and nothing else.

### Do not declare what the consumer's cascade should decide

The habit to resist is reaching for `line-height`, `letter-spacing` or a spacing tweak to fix
something they are not actually causing. Two questions, in order:

1. **Is the property the mechanism the consumer is meant to control?** `line-height` exists to
   inherit — a badge in running copy should follow the rhythm of that copy, and a consumer who
   set the leading meant to set it. Neither `Badge` nor `Chip` declares one.
2. **Is the component wrong without it?** Only then declare it, and write down why.

Both were learned the hard way here. `line-height: 1` went onto `Chip` to fix a centring
problem it never caused — flex was already centring the label — and then onto `Badge` to keep
the pill a fixed height, which meant fighting the consumer's typography to solve a problem
nobody had reported.

### Stories carry no inline styles

Stories are the most-read code in a component library, and inline styling in them teaches
inline styling. Layout helpers live in `.storybook/stories.css` as plain classes — which is
also roughly what a consumer's own app CSS looks like, so the examples read like real usage.

The one exception is the same one the components get: passing a **CSS variable** through
`style`, for a genuinely per-instance value.

```tsx
// Good — a variable the stylesheet consumes
<div className="storyWidth" style={{ '--story-width': width } as React.CSSProperties} />

// Bad — a finished declaration
<div style={{ width, display: 'flex', gap: '1rem' }} />
```

### Semantics are part of the component, not decoration

Checked when a component is written, not after:

- **An accessible name on the root, not on a hidden child.** `Avatar` carries `role="img"` and
  `aria-label`. An earlier version put the name in a `title` on the initials — which were
  `aria-hidden`, so no assistive technology ever saw it and the avatar had no name at all.
- **The element has to mean what it is.** `Input` announces its error in a `<span>`, not a
  `<small>`: `<small>` means fine print, which a validation failure is not. It carries
  `role="alert"` only while invalid, so a message that appears after the field was left is
  announced instead of waiting for focus to come back.
- **Prefer the semantic element even when it renders the same.** `Section` is always
  `<section>`, titled or not. Unnamed it maps to `role="generic"` — identical to a `<div>` for
  a screen reader, so nothing is over-claimed — and named it becomes a `region` landmark.
  The gain is in the inspector: a page of `<section>` boundaries is readable, a page of `<div>`
  is not.
- **Style from the attribute that already carries the state.** `[aria-pressed='true']` on
  `Chip`, `[aria-invalid]` on `Input` — never a second attribute mirroring them.
- **No `<header>` or `<footer>` inside a component.** They map to the `banner` and
  `contentinfo` landmarks. The rule that scopes them away inside sectioning content is not
  applied consistently — the accessibility check computed `banner` for a `<header>` inside a
  `<section>`, which is the markup that rule is supposed to cover. A page of cards each
  announcing a page banner is a real defect, and a `<div>` costs nothing. `Modal` and `Card`
  both use divs for their bands.

## Tests

Vitest with Testing Library and jsdom. `pnpm test`.

**Test the contract, not the rendering.** No snapshots — they fail on every intentional change
and pass through every accessibility regression. Assert what a consumer or a screen reader
would observe:

- the accessible name, role and state (`getByRole('button', { name, pressed })`)
- the wiring a consumer cannot see: label association, `aria-describedby`, `aria-invalid`
- that callbacks fire, from pointer **and** from keyboard
- that props pass through to the native element
- that landmarks are not added by accident

**Do not test appearance.** jsdom computes no layout, so a style assertion there is theatre.
`css` is off in `vitest.config.ts` for that reason. Appearance is Storybook's job, and
@jposawa's.

The tests that earn their place are the ones covering what fails *silently*. All three
accessibility bugs found in review — an `Avatar` with no accessible name, an error message that
was never announced, a landmark added by a `<header>` — passed lint, types and build.

**Query in the same order a user would find it:** role, then label, then text. Reaching for
`querySelector` or a test id means the thing is probably not reachable by anyone else either.

### jsdom does not implement `<dialog>`

`showModal()` and `close()` are stubbed in `vitest.setup.ts` to flip the `open` attribute and
fire `close`. Focus trapping, the top layer and the backdrop are the browser's, are **not**
simulated, and must not be claimed by a test.

### Container-driven layout

**Library-specific and stricter than in an app:** a library component does **not** position
itself. No `margin`, no `align-self`, no `position: absolute` relative to something it does not
own, no width it was not told to have. The consumer container decides where the component sits
and how much room it gets. The component styles only its own visuals — colours, radius,
typography, internal padding.

A component that sets its own outer margin is unusable in half the layouts it lands in.

```css
/* Bad — the component pushes its neighbours */
.badge { margin-right: var(--space-2); }

/* Good — the consumer container owns the rhythm */
/* consumer: .list { display: flex; gap: var(--space-2); } */
```

Prefer `flex` over `grid`. Use `grid` only where two-dimensional control is genuinely needed.

### CSS shorthands

Write layout properties explicitly. The `flex` shorthand is forbidden — it silently sets three
properties.

```css
/* Bad */
.item { flex: 1; }

/* Good */
.item { flex-grow: 1; }
```

`flex-grow` and `flex-shrink` are avoided unless strictly necessary; document the reason when
it is not obvious.

Allowed shorthands: `background`, `border`.

### Responsive & mobile-first

Mobile is the base. Desktop is the enhancement. One breakpoint:

```
base                        → mobile  (< 900px)
@media (min-width: 900px)   → desktop (≥ 900px)
```

- No fixed `px` widths on containers.
- Touch targets: minimum `44px` height, `44px × 44px` for icon-only controls.
- No hover-only interaction — tap must reach everything.
- Body and input font size never below `16px`; smaller triggers iOS auto-zoom.

### Focus & accessibility

Every interactive element has a visible `:focus-visible` style. Never remove an outline
without replacing it.

```css
.button:focus-visible {
  outline: 2px solid var(--color-primary);
  outline-offset: 2px;
}
```

**Library-specific:** accessibility is not the consumer problem to retrofit. A component that
ships without a focus style, an accessible name, or keyboard operation is not done. `Modal`
specifically owns focus trapping, `Escape` to close, and restoring focus to the trigger on
close.

### Transitions

Specific properties only. Never `transition: all`.

Micro interactions 150–200ms · panels and drawers 250–300ms.

Respect `prefers-reduced-motion` — **library-specific**, since the consumer cannot patch it in
from outside:

```css
@media (prefers-reduced-motion: reduce) {
  .modal { transition: none; }
}
```

---

## Dependencies

Adding a runtime dependency is a decision with a cost for every consumer. `clsx` is in.
Anything else needs a reason written into `RONINUI.md` first.

`react` and `react-dom` are `peerDependencies` at `>=18` and also `devDependencies` for local
builds and Storybook. Never plain `dependencies`.

---

## Agent execution limits

Agents run **verification** commands only. Nothing else.

Allowed:

- Tests (`vitest`, or equivalent)
- Lint (`eslint`, or equivalent)
- Type check (`tsc`)
- Build (`vite build`, or equivalent)
- Contrast check (`pnpm verify:contrast`) — **mandatory after touching any hex in
  `tokens.css`.** It parses the stylesheet and checks every accent against every surface plus
  every `on-accent` fill. Eyeballing a colour change is not verification

Not allowed:

- Dev server, `vite preview`, **and Storybook** — Storybook is a long-lived dev server and
  belongs to @jposawa to run
- Scratch pages or harnesses created just to look at the UI
- Anything that starts a long-lived process or opens the app
- `npm publish` — publishing is irreversible for a given version number, so it is the call of
  @jposawa

Agents deliver the change, its story, and the verification output. @jposawa previews and
judges the visual result.

Git write operations (`commit`, `push`, `merge`, `rebase`, branch creation) are off-limits
unless asked directly.
