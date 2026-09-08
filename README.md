# RoninUI

A React component library that serves no design system.

No antd, no mantine, no Tailwind, no Bootstrap underneath — own CSS modules, own tokens, own
opinions. Install it, drop a component in, override what you like in ordinary CSS.

```bash
npm install @jposawa/ronin-ui
```

```tsx
import { Button, Input, Modal } from '@jposawa/ronin-ui'

export const Example = () => (
  <Button intent="primary" variant="filled">
    Save changes
  </Button>
)
```

There is no stylesheet to import and no provider to mount. The built entry carries its own CSS,
so pulling any export brings the styles with it.

## Requirements

`react` and `react-dom` are peer dependencies at `>=18`. Nothing here uses an API newer than
React 18 — `useId` is the newest — but the tests run against React 19, so 18 is supported by
declaration rather than by verification. The package is **ESM only**; `require()` will not
resolve it.

## Theming

The theme selector is `data-ronin-theme`, on any element you already have. No wrapper is added
for it, and no state lives in the library — you drive the attribute however you like.

```tsx
<div id="app" data-ronin-theme="dark">
  <App />
</div>
```

| You do | You get |
| --- | --- |
| nothing | the defaults, following `prefers-color-scheme` |
| `data-ronin-theme="dark"` | dark, always |
| `data-ronin-theme="auto"` | explicitly follows the OS |
| a nested element with its own value | that subtree only |

## Overriding tokens

The library defines token *names* and defaults; your app owns the values. Redefine any of them
in ordinary CSS and it wins — everything shipped here lives in a cascade layer, and unlayered
CSS beats every layer regardless of import order.

```css
[data-ronin-theme='dark'] {
  --color-primary: #b8863f;
  --color-bg: #12100c;
}
```

The `-bg` and `-border` tints of each accent are derived with `color-mix()`, so overriding
`--color-primary` carries through to them.

Every foreground/background pair in the default palette is verified against WCAG AA — each
accent on every surface, and the on-accent colour on every accent fill.

### Separate entry points

```ts
import '@jposawa/ronin-ui/tokens.css' // the variables alone, without the components
import '@jposawa/ronin-ui/styles.css' // the component CSS, if you want to control where it lands
```

## Components

| | |
| --- | --- |
| `Button` | `intent` × `variant`, two orthogonal axes |
| `Input` | controlled, with label, hint and error wired together |
| `Modal` · `Drawer` | native `<dialog>`: focus trap, Escape and top layer from the browser |
| `Tooltip` | opens on hover *and* focus, positioned with floating-ui |
| `Tabs` | roving focus, arrow keys, horizontal or vertical |
| `Collapse` | disclosure with `aria-expanded` and `aria-controls` |
| `Card` · `Section` · `SectionLabel` | surfaces and headings |
| `Avatar` · `Badge` · `Chip` · `Stepper` | small pieces |

Every component takes `className` and `style`, so one margin never means forking a component.

## Decisions behind it

Not promises — the choices that explain why it looks the way it does.

- **No global state.** Props in, callbacks out. Nothing to configure, nothing to mount, and no
  opinion about which state library you use.
- **The container owns layout.** Components set no outer margin and no width of their own, so
  where they sit is always your call.
- **Roles and keyboard behaviour ship with the component.** `Modal` and `Drawer` are the native
  `<dialog>`; `Tabs` implements the WAI-ARIA tab pattern; `Collapse` carries `aria-expanded` and
  `aria-controls`. The tests assert those rather than appearance.
- **Almost nothing is imposed on your page.** The two things that are: a `box-sizing` reset
  scoped to the library's own elements, and the `data-ronin-theme` attribute name.

## Known limits

Honest ones, at `0.1`:

- **The API is not stable.** On `0.x` a breaking change bumps the minor, and it will.
- **ESM only.** `require()` will not resolve it.
- **`:has()` is used** for two rules in `Collapse`. Baseline since late 2023 — on an older
  browser the chevron does not rotate and the header's focus ring is missing. Nothing breaks.
- **Accessibility is tested, not audited.** Roles, names, state and keyboard paths have unit
  tests; there has been no screen-reader pass and no automated audit. Treat the components as a
  good starting point, not a certification.
- **Contrast is verified for the default palette only.** `pnpm verify:contrast` checks 39 pairs
  per theme against WCAG AA. Override the tokens and that guarantee is yours to re-run.
- **Not battle-tested.** It was built for a handful of personal projects and has the bugs a
  library that young has.

## Development

```bash
pnpm install
pnpm storybook        # the component gallery
pnpm test             # behaviour and accessibility
pnpm verify:contrast  # every token pair against WCAG AA
pnpm build
```

## Licence

[MIT](./LICENSE) — use it, fork it, ship it commercially, no attribution required beyond
keeping the licence notice. No warranty of any kind.
