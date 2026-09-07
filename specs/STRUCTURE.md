# Project Structure

Library, not an app. There is no `pages/`, no `services/`, no `states/`, no `lib/` — those are
app layers. A library that grows one of them has stopped being a library.

All source lives under `src/`. Only `dist/` is published.

```
ronin-ui/
  .storybook/
  src/
    components/
    hooks/
    helpers/
    styles/
    types/
    index.ts        ← the public API. Nothing is exported that is not listed here
  specs/
  package.json
  vite.config.ts
```

---

## `src/components/`

One folder per component. Each ships its own CSS module and its own story.

```
components/
  Button/
    Button.tsx
    Button.module.css
    Button.stories.tsx
    Button.test.tsx      ← when there is behaviour worth asserting
    index.ts             ← exports Button and its prop types
  index.ts               ← re-exports every component
```

A component belongs here only if it holds no domain knowledge. Self-contained state is fine —
a `Modal` tracking its own animation state, an `Input` owning its own focus ring. State that
reaches outward is not.

## `src/hooks/`

Reusable React logic, named `useXxx`. Only hooks a **consumer** would want. A hook used by
exactly one component lives next to that component, not here.

## `src/helpers/`

Pure functions. No side effects, no React. If it touches the DOM or fetches, it does not
belong.

## `src/styles/`

Global CSS shipped to consumers.

```
styles/
  tokens.css     ← @property registrations, :root defaults, [data-ronin-theme] values
  reset.css      ← optional, opt-in via its own export
```

Never a `.module.css` here — those live beside their component.

## `src/types/`

Shared types. `BaseComponent` lives here. Types owned by a single component stay in that
component's file and are re-exported through its `index.ts`.

---

## Public API

`src/index.ts` is the contract. Anything not exported there is internal and may change without
a version bump.

```ts
// src/index.ts
export * from "./components"
export * from "./hooks"
export type { BaseComponent } from "./types"
```

Package exports map:

```json
{
  "exports": {
    ".":             { "types": "./dist/index.d.ts", "import": "./dist/index.js" },
    "./styles.css":  "./dist/styles.css",
    "./tokens.css":  "./dist/tokens.css",
    "./reset.css":   "./dist/reset.css"
  }
}
```

Two `package.json` fields that fail silently if forgotten:

- `"sideEffects": ["**/*.css"]` — without it the consumer's bundler tree-shakes the stylesheet
  away and every component arrives unstyled.
- `"publishConfig": { "access": "public" }` — a scoped package is private by default and the
  publish is rejected.

---

## Barrel exports

Every folder exposes an `index.ts` re-exporting its contents. No deep imports, inside the
library or from outside it.

```ts
// Good
import { Button } from "@jposawa/ronin-ui"

// Bad — reaches past the public API, breaks on any internal move
import { Button } from "@jposawa/ronin-ui/dist/components/Button/Button"
```

A component folder's `index.ts` exports the component and its prop type:

```ts
// components/Button/index.ts
export { Button } from "./Button"
export type { ButtonProps, ButtonIntent, ButtonVariant } from "./Button"
```

Prop types are exported on purpose — a consumer building a wrapper needs them.
