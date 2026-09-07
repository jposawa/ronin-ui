import type * as React from 'react'

/**
 * Every exported component extends this. It is the escape hatch that keeps a consumer from
 * forking a component over one margin.
 *
 * `className` is appended last when composing classes, so a consumer class wins the cascade.
 * `style` is passed straight through — the library itself never writes design values inline.
 */
export type BaseComponent = {
  className?: string
  style?: React.CSSProperties
}
