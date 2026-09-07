/**
 * Reads the real token values out of `src/styles/tokens.css` and checks every
 * foreground/background pair the components can actually produce against WCAG AA.
 *
 * It parses the stylesheet rather than keeping its own copy of the hexes on purpose: an
 * earlier version held a copy, drifted from the source, and passed three combinations that
 * were failing in the browser.
 *
 * Run with `pnpm verify:contrast`. Exits non-zero on any failure.
 */

import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'

const TOKENS_PATH = fileURLToPath(new URL('../src/styles/tokens.css', import.meta.url))

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
const readThemeBlock = (stylesheet, selector) => {
  const blockStart = stylesheet.indexOf(selector)

  if (blockStart === -1) {
    throw new Error(`selector not found in tokens.css: ${selector}`)
  }

  const bodyStart = stylesheet.indexOf('{', blockStart)
  const bodyEnd = stylesheet.indexOf('}', bodyStart)
  const body = stylesheet.slice(bodyStart, bodyEnd)

  const declarations = body.matchAll(/--color-([a-z-]+):\s*(#[0-9a-f]{6})/gi)

  return Object.fromEntries(
    [...declarations].map(([, tokenName, hex]) => [tokenName, hex.toLowerCase()]),
  )
}

const stylesheet = readFileSync(TOKENS_PATH, 'utf8')

const themes = {
  LIGHT: readThemeBlock(stylesheet, "[data-ronin-theme='light']"),
  DARK: readThemeBlock(stylesheet, "[data-ronin-theme='dark']"),
}

let totalFailures = 0

for (const [themeName, tokens] of Object.entries(themes)) {
  const failures = []

  const requirePair = (label, foreground, background, minimumRatio) => {
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
    SURFACE_TOKENS.length * (TEXT_TOKENS.length + ACCENT_TOKENS.length) +
    ACCENT_TOKENS.length +
    2

  console.log(`\n── ${themeName} ──`)

  if (failures.length === 0) {
    console.log(`  ${checkedPairs} pairs — all pass`)
  } else {
    for (const failure of failures) {
      console.log(`  FAIL ${failure}`)
    }
    console.log(`  ${failures.length} of ${checkedPairs} pairs fail`)
  }

  totalFailures += failures.length
}

process.exit(totalFailures === 0 ? 0 : 1)
