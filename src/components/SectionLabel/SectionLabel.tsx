import clsx from 'clsx'
import React from 'react'

import { RONIN_SCOPE } from '../../constants'
import { isHeadingElement } from '../../helpers'
import type { BaseComponent } from '../../types'
import styles from './SectionLabel.module.css'

export type SectionLabelProps = BaseComponent & {
  /**
   * The label text, or a heading element wrapping it.
   *
   * Pass a heading — `<h2>Account</h2>` — and the label renders **as** that tag, joining the
   * document outline so a screen reader user can jump to the block it names. Pass plain text
   * and it renders as a `<span>`, which is the right call when the section already has a
   * heading: a wrong level in the outline is worse than none.
   */
  children: React.ReactNode
  /** Secondary text on the same line — typically a count, such as `3/8` or `12 items`. */
  detail?: React.ReactNode
}

const EMPTY_HEADING_PROPS: React.HTMLAttributes<HTMLHeadingElement> = {}

/**
 * A small uppercase label that names the block of content below it.
 *
 * It draws no divider line. A rule is decoration with its own look, and pairing one with a
 * label is the consumer's composition, not this component's business.
 */
export const SectionLabel = ({ children, detail, className, style }: SectionLabelProps) => {
  const heading = isHeadingElement(children) ? children : undefined

  /* The heading becomes the element; anything else stays inside the default span. */
  const Element = heading ? heading.type : 'span'
  const {
    children: headingContent,
    className: headingClassName,
    ...headingAttributes
  } = heading?.props ?? EMPTY_HEADING_PROPS

  return (
    <Element
      {...headingAttributes}
      className={clsx(RONIN_SCOPE, styles.sectionLabel, headingClassName, className)}
      style={style}
    >
      {heading ? headingContent : children}
      {detail ? <span className={styles.detail}>{detail}</span> : null}
    </Element>
  )
}
