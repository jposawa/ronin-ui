import clsx from 'clsx'
import React from 'react'

import { RONIN_SCOPE } from '../../constants'
import type { BaseComponent } from '../../types'
import { SectionLabel } from '../SectionLabel'
import styles from './Section.module.css'

export type SectionProps = BaseComponent & {
  children: React.ReactNode
  /**
   * The title, or a heading element wrapping it — `title={<h2>Account</h2>}` renders the label
   * as that tag and puts it in the document outline.
   *
   * Nullish renders no label at all, which is useful for a block that is grouped and spaced
   * like the others but does not announce itself.
   */
  title?: React.ReactNode
  /** Secondary text on the title's line — typically a count, such as `3/8` or `12 items`. */
  detail?: React.ReactNode
}

/**
 * A `<section>` with an optional `SectionLabel` above its content.
 *
 * It exists because the label-plus-content pairing is the same four lines of markup every
 * time. It is a vertical stack with one gap between its children, so passing a single element
 * as `children` keeps the inner spacing entirely yours.
 *
 * Internal spacing only — it sets no outer margin and no width. Where the section sits is
 * still the parent's decision.
 */
export const Section = ({
  children,
  title,
  detail,
  className,
  style,
}: SectionProps) => (
  /**
   * Always `<section>`, titled or not.
   *
   * A `<section>` with no accessible name maps to `role="generic"` — identical to a `<div>` in
   * the accessibility tree, so nothing is claimed that is not provided. With a name it becomes
   * a `region` landmark. Either way the markup is honest.
   *
   * What is left is a devtools argument, and it decides it: an inspector full of `<div>` tells
   * you nothing about where a block starts, and `<section>` costs nothing to read.
   */
  <section className={clsx(RONIN_SCOPE, styles.section, className)} style={style}>
    {title ? (
      <SectionLabel detail={detail}>{title}</SectionLabel>
    ) : null}

    {children}
  </section>
)
