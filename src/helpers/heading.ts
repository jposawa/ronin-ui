import React from 'react'

const HEADING_TAGS = ['h1', 'h2', 'h3', 'h4', 'h5', 'h6'] as const

export type HeadingTagName = (typeof HEADING_TAGS)[number]

export type HeadingElement = React.ReactElement<
  React.HTMLAttributes<HTMLHeadingElement>,
  HeadingTagName
>

const isHeadingTagName = (tagName: string): tagName is HeadingTagName =>
  (HEADING_TAGS as readonly string[]).includes(tagName)

/**
 * Whether a title node is a bare heading element — `<h2>`…`<h6>` — rather than text or
 * arbitrary markup.
 *
 * Components use this to **hoist** the heading: the tag becomes the wrapper the markup needs it
 * to be, and its children become the title's content.
 *
 * The reason it is worth doing at all: `<h3>` cannot simply be rendered where a title sits. In
 * `Collapse` the title is inside a `<button>`, which accepts only phrasing content, so a
 * heading there is invalid markup *and* gets flattened into the button's accessible name —
 * losing the role it was written for. In `SectionLabel` the default wrapper is a `<span>`,
 * which has the same problem. Both need the heading on the outside.
 *
 * The alternative was a prop naming the level, and it read as magic to the person who has to
 * use this library. Passing the tag is what people reach for; this makes reaching for it work.
 */
export const isHeadingElement = (node: React.ReactNode): node is HeadingElement =>
  React.isValidElement(node) && typeof node.type === 'string' && isHeadingTagName(node.type)
