# Agent Instructions — RoninUI

## What this project is

`@jposawa/ronin-ui` — a React component library. Published to npm, consumed by the
personal projects under `../` (dhsw, ficha-pet, ficha-medica, dknav, fantraveller, …).

**Ronin = serves no daimyo.** The library wraps no design system. No antd, no mantine,
no Tailwind, no Bootstrap. Own CSS modules, own tokens, own opinions.

## Communication

Caveman skill ALWAYS active. Invoke via `/caveman` (default: full level).
Drop articles, fragments OK, short synonyms. Technical terms exact. Code blocks unchanged.
Off only if user says "stop caveman" or "normal mode".

Levels: `/caveman lite` | `/caveman full` (If not specified otherwise, use just `/caveman`)

## Specs

Read the relevant files in `specs/` **before starting any task** — every task, not only the
first one in a session:

- `specs/RONINUI.md` — decisions record, public API contracts, roadmap
- `specs/STANDARDS.md` — coding standards, patterns, conventions
- `specs/STRUCTURE.md` — folder purposes, naming rules, barrel exports
- `specs/STYLING.md` — CSS tokens, theming, units, responsiveness

Treat specs as source of truth. Conflict between specs and existing code → let the user know
and double check with them. Since you are not a developer, the user — mainly @jposawa — has
the final say.

## Library hard rules

These are what separate a library from an app. Breaking one breaks a consumer.

1. **Zero global state.** No jotai, no recoil, no zustand, no context that spans components.
   Props in, callbacks out. A consumer running recoil and jotai side by side (fantraveller
   does) must not care.
2. **No third-party UI wrapping.** A component that renders an antd `Button` is not this
   library's component.
3. **`react` and `react-dom` are `peerDependencies`, never `dependencies`.** Two React copies
   in one bundle breaks hooks. Range stays `>=18` — consumers span React 18 and 19.
4. **No domain knowledge.** A component that knows what a pet, a character sheet, or a
   medicine is belongs in the consuming app, not here.
5. **Every component accepts `className` and `style`** via `BaseComponent`. It is the escape
   hatch that keeps consumers from forking a component over one margin.
6. **Tokens define names and defaults, not final values.** The consumer overrides values in
   its own CSS. See `STYLING.md`.
7. **Public API change = version bump.** On `0.x`, a breaking change bumps the minor.

## Working agreement

### Always re-consult the specs

Consulting specs is not a once-per-session step. Before each new task, re-read the files that
task touches. A spec read twenty turns ago may have changed since — by the user, or by you.

### Don't trust stale recall

Do not answer from memory about file contents, project state, or decisions after a short
window of turns has passed. Re-read the file. Re-run the check. What was true earlier in the
session is not evidence that it is true now, and a confident answer built on stale recall is
worse than a slow one built on a fresh read.

Applies equally to persisted memories: they record what was true when written, not what is
true now.

### User questions are genuine

When @jposawa asks a question — "why this approach?", "are you sure?", "what about X?" — it is
a real question, asked to understand the reasoning and the trade-offs. It is **not** a
rhetorical nudge toward a different answer and not a signal that the previous answer was wrong.

So: answer the question. Explain the reasoning. Do not reverse a correct position because it
was questioned, and do not hedge to appear agreeable. If the reasoning was in fact wrong, say
so plainly and correct it — but only when it is actually wrong, not because the question
implied pressure.
