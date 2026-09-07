import clsx from 'clsx'
import React from 'react'

import { RONIN_SCOPE } from '../../constants'
import type { BaseComponent } from '../../types'
import styles from './SectionLabel.module.css'

export type SectionLabelProps = BaseComponent & {
  children: React.ReactNode
  /**
   * Renders a real heading at this level and puts the label in the document outline. Omit it
   * when the section already has a heading — a wrong level in the outline is worse than none.
   */
  headingLevel?: 2 | 3 | 4 | 5 | 6
  /** Secondary text on the same line — typically a count, such as `3/8` or `12 items`. */
  detail?: React.ReactNode
}

/**
 * A small uppercase label that names the block of content below it.
 *
 * It draws no divider line. A rule is decoration with its own look, and pairing one with a
 * label is the consumer's composition, not this component's business.
 */
export const SectionLabel = ({
  children,
  headingLevel,
  detail,
  className,
  style,
}: SectionLabelProps) => {
  const Element = headingLevel ? (`h${headingLevel}` as const) : 'span'

  return (
    <Element className={clsx(RONIN_SCOPE, styles.sectionLabel, className)} style={style}>
      {children}
      {detail ? <span className={styles.detail}>{detail}</span> : null}
    </Element>
  )
}
