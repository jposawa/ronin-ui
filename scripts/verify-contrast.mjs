/**
 * Reads the real token values out of the stylesheets and checks every foreground/background
 * pair the components can produce against WCAG AA — for the default palette and for every
 * opt-in preset in `src/styles/palettes/`.
 *
 * It parses the CSS rather than keeping its own copy of the hexes on purpose: an earlier
 * version held a copy, drifted from the source, and passed four combinations that were failing
 * in the browser.
 *
 * Run with `pnpm verify:contrast`. Exits non-zero on any failure.
 */

import { readdirSync, readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'

const STYLES_DIR = fileURLToPath(new URL('../src/styles/', import.meta.url))
const PALETTES_DIR = `${STYLES_DIR}palettes/`

const SURFACE_TOKENS = ['bg', 'bg-elevated', 'surface']
const TEXT_TOKENS = ['text', 'text-strong', 'text-muted']
const ACCENT_TOKENS = [
  'primary',
  'secondary',
  'success',
  'warning',
  'danger',
  'info',
  'neutral',
]

const toLinearChannel = (channel) => {
  const value = channel / 255
  return value <= 0.03928 ? value / 12.92 : ((value + 0.055) / 1.055) ** 2.4
}

const relativeLuminance = (hex) => {
  const clean = hex.replace('#', '')
  return (
    0.2126 * toLinearChannel(parseInt(clean.slice(0, 2), 16)) +
    0.7152 * toLinearChannel(parseInt(clean.slice(2, 4), 16)) +
    0.0722 * toLinearChannel(parseInt(clean.slice(4, 6), 16))
  )
}

const contrastRatio = (foreground, background) => {
  const [lighter, darker] = [
    relativeLuminance(foreground),
    relativeLuminance(background),
  ].sort((first, second) => second - first)

  return (lighter + 0.05) / (darker + 0.05)
}

/** Pulls every `--color-*: #hex` declaration out of the block a selector opens. */
const readBlock = (stylesheet, selector) => {
  const blockStart = stylesheet.indexOf(selector)

  if (blockStart === -1) {
    throw new Error(`selector not found: ${selector}`)
  }

  const bodyStart = stylesheet.indexOf('{', blockStart)
  const bodyEnd = stylesheet.indexOf('}', bodyStart)
  const declarations = stylesheet.slice(bodyStart, bodyEnd).matchAll(/--color-([a-z-]+):\s*(#[0-9a-f]{6})/gi)

  return Object.fromEntries(
    [...declarations].map(([, tokenName, hex]) => [tokenName, hex.toLowerCase()]),
  )
}

/**
 * A preset's dark theme is its base overridden by the deltas in the `-dark` block, which is the
 * whole point of the single-attribute shape: dark restates only what changes.
 */
const readThemes = () => {
  const themes = []

  const defaultTokens = readFileSync(`${STYLES_DIR}tokens.css`, 'utf8')
  themes.push(['default · light', readBlock(defaultTokens, "[data-ronin-theme='light']")])
  themes.push(['default · dark', readBlock(defaultTokens, "[data-ronin-theme='dark']")])

  for (const fileName of readdirSync(PALETTES_DIR).filter((name) => name.endsWith('.css'))) {
    const paletteName = fileName.replace('.css', '')
    const stylesheet = readFileSync(`${PALETTES_DIR}${fileName}`, 'utf8')

    /* `^=` for the base so it covers every variant; exact for the deltas, which must not
     * match the base group when searched for. */
    const base = readBlock(stylesheet, `[data-ronin-theme^='${paletteName}']`)
    const darkDeltas = readBlock(stylesheet, `[data-ronin-theme='${paletteName}-dark']`)

    themes.push([`${paletteName} · light`, base])
    themes.push([`${paletteName} · dark`, { ...base, ...darkDeltas }])
  }

  return themes
}

let totalFailures = 0

for (const [themeName, tokens] of readThemes()) {
  const failures = []

  const requirePair = (label, foreground, background, minimumRatio) => {
    if (!foreground || !background) {
      failures.push(`${label.padEnd(34)} missing token`)
      return
    }

    const value = contrastRatio(foreground, background)

    if (value < minimumRatio) {
      failures.push(`${label.padEnd(34)} ${value.toFixed(2)}:1  (min ${minimumRatio})`)
    }
  }

  for (const surface of SURFACE_TOKENS) {
    for (const textToken of TEXT_TOKENS) {
      requirePair(`${textToken} on ${surface}`, tokens[textToken], tokens[surface], 4.5)
    }
  }

  for (const accent of ACCENT_TOKENS) {
    /* An accent can land on any surface, so it has to hold on all of them. */
    for (const surface of SURFACE_TOKENS) {
      requirePair(`${accent} on ${surface}`, tokens[accent], tokens[surface], 4.5)
    }

    /* And it has to carry `on-accent` when it is used as a fill. */
    requirePair(`on-accent on ${accent}`, tokens['on-accent'], tokens[accent], 4.5)
  }

  /* A border only has to be visible, not readable. */
  requirePair('border vs bg', tokens.border, tokens.bg, 1.4)
  requirePair('border vs bg-elevated', tokens.border, tokens['bg-elevated'], 1.4)

  const checkedPairs =
    SURFACE_TOKENS.length * (TEXT_TOKENS.length + ACCENT_TOKENS.length) + ACCENT_TOKENS.length + 2

  if (failures.length === 0) {
    console.log(`  ok    ${themeName.padEnd(20)} ${checkedPairs} pairs`)
  } else {
    console.log(`  FAIL  ${themeName}`)
    for (const failure of failures) {
      console.log(`          ${failure}`)
    }
  }

  totalFailures += failures.length
}

console.log(totalFailures === 0 ? '\n  all themes pass\n' : `\n  ${totalFailures} failing pairs\n`)

process.exit(totalFailures === 0 ? 0 : 1)
