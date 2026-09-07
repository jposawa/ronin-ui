import clsx from 'clsx'
import React from 'react'

import { RONIN_SCOPE } from '../../constants'
import type { BaseComponent, Intent } from '../../types'
import styles from './Button.module.css'

/** Semantic colour role — which token family the button reads. Shared across components. */
export type ButtonIntent = Intent

/** Visual form — how the box is drawn. Orthogonal to `intent`. */
export type ButtonVariant = 'filled' | 'outline' | 'text'

export type ButtonProps = BaseComponent &
  React.ButtonHTMLAttributes<HTMLButtonElement> & {
    intent?: ButtonIntent
    variant?: ButtonVariant
    /** Stretches to the width of its container. Off by default — the container decides. */
    isFullWidth?: boolean
  }

/**
 * A native `<button>` with two independent axes.
 *
 * `intent` is what the action *means* and picks the colour family; `variant` is how the box is
 * *drawn*. They never merge, which is what makes `variant="text" intent="danger"` — an inline,
 * destructive link inside a sentence — expressible at all.
 *
 * Every other button attribute passes straight through to the element, so `onClick`, `form`,
 * `aria-*` and `data-*` behave exactly as they would on plain HTML.
 */
export const Button = ({
  children,
  intent = 'primary',
  variant = 'filled',
  isFullWidth = false,
  type = 'button',
  className,
  ...buttonProps
}: ButtonProps) => (
  <button
    type={type}
    className={clsx(RONIN_SCOPE, styles.button, className)}
    data-intent={intent}
    data-variant={variant}
    data-full-width={isFullWidth ? '' : undefined}
    {...buttonProps}
  >
    {children}
  </button>
)
