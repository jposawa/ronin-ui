import clsx from 'clsx'
import React from 'react'

import { RONIN_SCOPE } from '../../constants'
import type { BaseComponent } from '../../types'
import styles from './Stepper.module.css'

export type StepperProps = BaseComponent & {
  value: React.ReactNode
  /** What is being counted. Used to build the default accessible names of both buttons. */
  label: string
  canDecrease?: boolean
  canIncrease?: boolean
  onDecrease: () => void
  onIncrease: () => void
  /**
   * Accessible names for the two buttons. The defaults are English because the library
   * carries no UI copy — a consumer writing in another language passes its own.
   */
  decreaseLabel?: string
  increaseLabel?: string
}

/** Numeric increment and decrement. Not a wizard step indicator. */
export const Stepper = ({
  value,
  label,
  canDecrease = true,
  canIncrease = true,
  onDecrease,
  onIncrease,
  decreaseLabel,
  increaseLabel,
  className,
  style,
}: StepperProps) => (
  <span className={clsx(RONIN_SCOPE, styles.stepper, className)} style={style}>
    <button
      type="button"
      className={styles.button}
      data-direction="decrease"
      disabled={!canDecrease}
      aria-label={decreaseLabel ?? `Decrease ${label}`}
      onClick={onDecrease}
    >
      <span className={styles.icon} aria-hidden="true" />
    </button>

    <output className={styles.value}>{value}</output>

    <button
      type="button"
      className={styles.button}
      data-direction="increase"
      disabled={!canIncrease}
      aria-label={increaseLabel ?? `Increase ${label}`}
      onClick={onIncrease}
    >
      <span className={styles.icon} aria-hidden="true" />
    </button>
  </span>
)
