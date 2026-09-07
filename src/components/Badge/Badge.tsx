import clsx from 'clsx'
import React from 'react'

import { RONIN_SCOPE } from '../../constants'
import type { BaseComponent, Intent } from '../../types'
import styles from './Badge.module.css'

export type BadgeIntent = Intent
export type BadgeVariant = 'filled' | 'outline' | 'subtle'

export type BadgeProps = BaseComponent & {
  children: React.ReactNode
  intent?: BadgeIntent
  variant?: BadgeVariant
  /**
   * Overrides the intent with a one-off colour — any CSS colour, or a token reference such
   * as `var(--color-brand-teal)`. For a palette the library cannot know about.
   */
  color?: string
}

/** A static label. For one the reader can toggle, use `Chip`. */
export const Badge = ({
  children,
  intent = 'neutral',
  variant = 'subtle',
  color,
  className,
  style,
}: BadgeProps) => (
  <span
    className={clsx(RONIN_SCOPE, styles.badge, className)}
    style={{ ...style, '--badge-color': color } as React.CSSProperties}
    data-intent={intent}
    data-variant={variant}
  >
    {children}
  </span>
)
