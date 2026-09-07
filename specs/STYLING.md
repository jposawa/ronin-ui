# Styling

## The contract

RoninUI ships **token names and default values**. The consuming app owns the final values.

That split is the whole point. `dhsw` (dark fantasy RPG) and `ficha-pet` (pet health) must be
able to use the same `Button` and not look like the same product.

```
library  →  defines --color-primary, --space-4, --border-radius-md …  + a usable default
consumer →  redefines any of them, and every component follows
```

A component **never** hardcodes a design value. If a value is not behind a token, the consumer
cannot theme it, and the consumer forks the component instead. Every hardcoded hex in a
`.module.css` is a future fork.

### How a consumer wires it up

There is nothing to wire. The built entry imports its own stylesheet, so pulling any export
brings the CSS with it:

```tsx
import { Button } from "@jposawa/ronin-ui"   // tokens and component CSS arrive with it

<Button intent="primary">Rolar dados</Button>
```

To override, redefine tokens in ordinary CSS — no layer, no `!important`, no import ordering:

```css
/* consumer: src/styles/tokens.css */
[data-ronin-theme="dark"] {
  --color-primary: #b8863f;
  --color-bg: #12100c;
}
```

`./styles.css` and `./tokens.css` stay published as explicit exports for a consumer who wants
the tokens without the components, or wants to control where the CSS lands.

### Cascade layers

Everything the library ships is wrapped in a cascade layer:

```css
@layer ronin.tokens { … }       /* tokens.css */
@layer ronin.components { … }   /* component modules */
```

**Unlayered CSS beats any layer**, regardless of specificity or source order. That is the whole
reason for the layers: a consumer overrides by writing normal CSS, and import order stops
mattering. Without them, `[data-ronin-theme="dark"]` in the library and the same selector in the
consumer have identical specificity and whichever loads last silently wins.

Layers also cover the component CSS, so a consumer adjusting `.button` through `className`
wins by default instead of fighting the library's specificity.

Never author a library **style rule** outside a layer.

`@property` registrations are the one exception, and they sit at the top of `tokens.css`
outside the layer on purpose: registration is global and does not cascade, so a layer would buy
nothing there and only obscure that fact.

---

## Theming

The theme selector is `data-ronin-theme`, on any element the consumer already has. It needs no
wrapper of its own — an existing app shell, or `<html>`, works.

```html
<div id="app" data-ronin-theme="dark">
```

```ts
appShellRef.current.dataset.roninTheme = "sepia"
```

Three behaviours, no JavaScript required, no provider.

| Consumer does | Result |
|---|---|
| nothing | RoninUI defaults, following the OS via `prefers-color-scheme` |
| `data-ronin-theme="dark"` | dark, always |
| `data-ronin-theme="auto"` | explicitly follows the OS |
| drives the attribute from its own state | works; the library never knows |

```css
@layer ronin.tokens {
  /* default, and the explicit "auto" value */
  :where(:root),
  [data-ronin-theme="auto"] {
    color-scheme: light;
    --color-primary: #0070E0;
  }

  @media (prefers-color-scheme: dark) {
    :where(:root),
    [data-ronin-theme="auto"] {
      color-scheme: dark;
      --color-primary: #4DA3F5;
    }
  }

  [data-ronin-theme="light"] { color-scheme: light; --color-primary: #0070E0; }
  [data-ronin-theme="dark"]  { color-scheme: dark;  --color-primary: #4DA3F5; }
}
```

Two mechanics make this work:

- **`:where(:root)` has zero specificity**, so an explicit theme value wins even when the
  consumer puts the attribute on `<html>` itself.
- **Custom properties inherit from the nearest ancestor that defines them**, not from the most
  specific selector. A `data-ronin-theme="light"` card inside a dark page therefore just works —
  nested themes need no extra API.

Non-theming tokens (spacing, fonts, radius, z-index) live in `:root` and never change per
theme.

### Why an attribute and not `.theme-dark`

Three reasons, in order of weight:

1. **One value at a time, enforced by HTML.** Two theme classes can be present at once; the
   outcome is then decided by source order, silently. An attribute cannot hold two values.
2. **`auto` has somewhere to live.** A consumer with a three-state toggle (light / dark /
   system) sets `auto`. With classes, "system" means *removing* the class — a different
   operation from the other two, which every consumer has to special-case.
3. **It claims no class names.** `.theme-dark` is far too generic for a library to reserve
   globally; `data-ronin-theme` collides with nothing.

Specificity is identical to a class (`0,1,0`), so nothing about the override scheme changes.

### The tokens stay unprefixed, deliberately

The same reasoning does **not** extend to `--color-primary`. There, the collision *is* the
mechanism — a consumer overrides by redefining the very same name. Prefixing
(`--ronin-color-primary`) would force every consumer to map token by token and would undo the
decision that RoninUI owns the shared names.

The distinction: **the theme selector is a namespace the library claims; the tokens are a
namespace it deliberately shares.**

### What the theme values do and do not set

They set custom properties and `color-scheme`. Nothing else.

`color-scheme` stays because it is the only way to make native widgets — scrollbars, `<select>`,
date pickers, form control chrome — follow the theme.

They deliberately do **not** set `background` or `color`. Painting a container is layout, and
layout belongs to the consumer:

```css
/* consumer */
.appShell {
  background: var(--color-bg);
  color: var(--color-text);
}
```

> Migration note: `ficha-pet` and `dhsw` currently use `.theme-light` / `.theme-dark` classes
> that also set `background` and `color`. Adopting RoninUI swaps the class for the attribute and
> moves those two lines to the app shell rule.

### The library owns no theme state

It does not read an atom, does not touch `localStorage`, does not render a toggle, does not
export a provider. It reads CSS variables and nothing else — which is why it works under jotai,
under recoil, under both at once, or under neither.

Rejected: a `<RoninProvider>`. It cannot deliver anything a plain package import does not
already deliver — a CSS import is a module side effect, not a render side effect — and it costs
a permanent runtime API plus a context that spans components. See `RONINUI.md`.

### Why colours differ between themes

Primary and secondary use **different hex values** per theme. Not an inconsistency, a contrast
requirement. `#0070E0` on white passes WCAG AA (~4.8:1). The same blue on `#16171d` drops to
~3.0:1 and fails. The lighter `#4DA3F5` restores legibility. Same brand, different luminance
per background.

A consumer overriding a colour must override it in **both** theme blocks, or the dark theme
silently keeps the RoninUI default.

---

## Token naming

Pattern: `--category-variant[-state]`. Never name by intent (`--button-color`) — name by token
type. Components map tokens to intent locally.

| Token | Meaning |
|---|---|
| `--color-bg` | page background |
| `--color-bg-elevated` | lifted surface (cards, modals) |
| `--color-surface` | subtle fill (code blocks, chips) |
| `--color-text` | body copy |
| `--color-text-strong` | headings, emphasis |
| `--color-text-muted` | secondary text, placeholders |
| `--color-text-disabled` | disabled state |
| `--color-border` | dividers, input borders |
| `--color-primary` | base primary |
| `--color-primary-bg` | tinted primary background |
| `--color-primary-border` | primary border tint |
| `--color-secondary` | base secondary |
| `--color-success` / `-warning` / `-danger` / `-info` | semantic status, each with `-bg` and `-border` |
| `--color-neutral` | the `neutral` button intent |
| `--color-on-accent` | text or icon on a solid accent fill |
| `--color-overlay` | modal scrim |
| `--color-shimmer` | skeleton highlight peak |
| `--shadow-sm` / `-md` / `-lg` | elevation |
| `--space-1` … `--space-8` | spacing scale |
| `--border-radius-sm` / `-md` / `-lg` | radius scale |
| `--border-width` | hairline width |
| `--text-xs` … `--text-3xl` | typography scale |
| `--z-modal`, `--z-toast` | stacking order |

Every `ButtonIntent` value has a matching `--color-<intent>` family. Adding an intent without
adding its tokens leaves a component reading an undefined variable, which renders as nothing
and fails silently.

---

## `@property` registrations

Registered **before** `:root` in `tokens.css`. Without registration, browsers treat custom
properties as opaque strings and cannot interpolate them — theme-switch transitions do nothing.

```css
@property --color-primary {
  syntax: '<color>';
  inherits: true;
  initial-value: #0070E0;
}
```

| Field | Purpose |
|---|---|
| `syntax` | type — `<color>`, `<length>`, `<number>`, `<percentage>`, `<angle>`, `*` |
| `inherits` | always `true` for theme tokens |
| `initial-value` | required unless syntax is `*`. Must be the light-theme value |

Register: every `--color-*`. Registration is what makes a consumer theme toggle animate.

Do not register: font family strings, `--space-*`, z-index integers — no interpolation
benefit, and a wrong `initial-value` there is a footgun.

**Library-specific caveat:** `@property` is global and cannot be redeclared without effect. A
consumer that also registers `--color-primary` with a different `initial-value` will conflict.
Consumers override *values* in a theme class, never the registration.

---

## Units

Choose the unit by what the value is relative to.

| Unit | Relative to | Use for |
|---|---|---|
| `rem` | root font size | spacing, font sizes, consistent scale |
| `em` | current font size | component-internal scaling |
| `%` | parent dimension | fluid widths |
| `vw` / `vh` / `svh` | viewport | full-screen overlays |
| `px` | physical pixels | borders, shadows, hard limits |

### `px` — hairlines and hard stops

```css
border: var(--border-width) solid var(--color-border);
outline: 2px solid var(--color-primary);
min-height: 44px;   /* touch target floor */
```

### `rem` — global scale

Spacing and font sizes that must track the root font.

### `em` — component-relative

**Library-specific and load-bearing:** a library component lands inside text contexts it cannot
predict. Internal padding, icon size, and letter-spacing use `em` so the component scales with
whatever font size the consumer put around it.

```css
.button {
  padding: 0.6em 1.2em;
}

.icon {
  width: 1em;
  height: 1em;
}

.badge {
  font-size: 0.85em;
  letter-spacing: 0.02em;
}
```

Avoid chaining `em` — nesting multiplies and drifts. Past two levels, switch to `rem`.

### `%` and viewport units

`%` for widths that fill the parent. Never `%` height unless the parent has an explicit height.

Viewport units sparingly, and `100svh` rather than `100vh` — `100vh` overflows on mobile under
browser chrome.

---

## Spacing

Use `--space-*` everywhere. Never a raw `rem`/`px` spacing value in a module.

```css
/* Good */
gap: var(--space-4);

/* Bad */
gap: 1rem;
```

Exception: spacing tied to the component's own font size uses `em` (see above).

Spacing **between** siblings belongs to the container as `gap`, never to the children as
`margin`. In a library this is not a preference — see the container-driven layout rule in
`STANDARDS.md`.

---

## Borders, radius, shadows

Borders always `px`, through `--border-width`. Radius and shadow always through tokens.

```css
/* Good */
border: var(--border-width) solid var(--color-border);
border-radius: var(--border-radius-md);
box-shadow: var(--shadow-md);

/* Bad */
border-radius: 8px;
box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
```

Shadow offsets, blur, and spread stay `px` inside the token definition — they must not scale
with font size.

---

## Class naming inside modules

CSS modules hash the names, so collisions are not the concern — readability is. Class names
describe the element part, not the styling:

```css
/* Good */
.button { }
.buttonIcon { }
.intentDanger { }
.variantOutline { }

/* Bad */
.blueButton { }
.mb2 { }
```

Intent and variant classes are composed in the component with `clsx`, consumer `className`
appended last so it wins the cascade.
