import clsx from 'clsx'
import React from 'react'

import { RONIN_SCOPE } from '../../constants'
import type { BaseComponent } from '../../types'
import styles from './Card.module.css'

export type CardVariant = 'outlined' | 'elevated'

export type CardProps = BaseComponent & {
  children: React.ReactNode
  /** Optional band above the content, separated by a rule. */
  header?: React.ReactNode
  /** Optional band below it — usually actions. */
  footer?: React.ReactNode
  variant?: CardVariant
}

/**
 * A surface with optional header and footer bands.
 *
 * It is slots, not layout: the card owns the surface, the padding of each band, and the rules
 * between them. What goes inside the body is arranged entirely by the consumer, so a card of
 * stacked fields and a card of a chart-plus-legend both fit without the component knowing.
 *
 * The bands are `<div>`, not `<header>` / `<footer>`. Those map to the `banner` and
 * `contentinfo` landmarks, and the rule that scopes them away inside sectioning content is not
 * applied consistently — the accessibility check in `Section.test.tsx` computed `banner` for a
 * `<header>` inside this very `<section>`. A page of cards each announcing a page banner is a
 * real defect; a `<div>` here costs nothing, since the card announces no structure either way.
 */
export const Card = ({
  children,
  header,
  footer,
  variant = 'outlined',
  className,
  style,
}: CardProps) => (
  <section className={clsx(RONIN_SCOPE, styles.card, className)} style={style} data-variant={variant}>
    {header ? <div className={styles.header}>{header}</div> : null}

    <div className={styles.body}>{children}</div>

    {footer ? <div className={styles.footer}>{footer}</div> : null}
  </section>
)
