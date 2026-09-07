import clsx from 'clsx'
import React from 'react'

import { RONIN_SCOPE } from '../../constants'
import type { BaseComponent, Intent } from '../../types'
import styles from './Chip.module.css'

export type ChipIntent = Intent

export type ChipProps = BaseComponent & {
  label: string
  isActive: boolean
  onToggle: () => void
  intent?: ChipIntent
  isDisabled?: boolean
  /**
   * Overrides the intent with a one-off colour — any CSS colour, or a token reference such
   * as `var(--color-brand-teal)`.
   */
  color?: string
}

/**
 * A label the reader can switch on and off — a filter, a tag picker. It renders a real
 * `<button>` and carries `aria-pressed`, which is what separates it from `Badge`.
 */
export const Chip = ({
  label,
  isActive,
  onToggle,
  intent = 'primary',
  isDisabled = false,
  color,
  className,
  style,
}: ChipProps) => (
  <button
    type="button"
    className={clsx(RONIN_SCOPE, styles.chip, className)}
    style={{ ...style, '--chip-color': color } as React.CSSProperties}
    data-intent={intent}
    aria-pressed={isActive}
    disabled={isDisabled}
    onClick={onToggle}
  >
    {label}
  </button>
)
