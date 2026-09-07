import {
  autoUpdate,
  computePosition,
  flip,
  offset,
  type Placement,
  shift,
} from '@floating-ui/dom'
import clsx from 'clsx'
import React from 'react'
import { createPortal } from 'react-dom'

import { RONIN_SCOPE } from '../../constants'
import type { BaseComponent } from '../../types'
import styles from './Tooltip.module.css'

export type TooltipPlacement = Placement

export type TooltipProps = BaseComponent & {
  content: React.ReactNode
  /** The element the tooltip describes. Must be focusable — a button, a link, an input. */
  children: React.ReactElement<{ 'aria-describedby'?: string }>
  placement?: TooltipPlacement
  /** Distance from the trigger, in pixels. */
  offsetDistance?: number
}

/**
 * Opens on hover AND on focus — never hover alone, which `STANDARDS.md` forbids and which
 * touch has no way to produce. Escape closes it, as it does any transient overlay.
 *
 * Rendered in a portal with a fixed positioning strategy so an `overflow: hidden` ancestor
 * cannot clip it, and repositioned by `autoUpdate` while scrolling or resizing.
 */
export const Tooltip = ({
  content,
  children,
  placement = 'top',
  offsetDistance = 8,
  className,
  style,
}: TooltipProps) => {
  const [isVisible, setIsVisible] = React.useState(false)
  const [triggerElement, setTriggerElement] = React.useState<HTMLSpanElement | null>(null)
  const tooltipRef = React.useRef<HTMLDivElement>(null)
  const tooltipId = React.useId()

  React.useEffect(() => {
    const tooltipElement = tooltipRef.current

    if (!isVisible || !triggerElement || !tooltipElement) {
      return
    }

    const updatePosition = async () => {
      const { x, y } = await computePosition(triggerElement, tooltipElement, {
        placement,
        strategy: 'fixed',
        middleware: [offset(offsetDistance), flip(), shift({ padding: 8 })],
      })

      /**
       * Written as custom properties rather than as `transform` directly: the stylesheet keeps
       * ownership of how the position is applied, and JS only supplies the two numbers it
       * alone can compute. Same rule as the `color` prop on `Badge` — inline style carries a
       * variable, never a finished declaration.
       */
      tooltipElement.style.setProperty('--tooltip-x', `${Math.round(x)}px`)
      tooltipElement.style.setProperty('--tooltip-y', `${Math.round(y)}px`)
    }

    return autoUpdate(triggerElement, tooltipElement, updatePosition)
  }, [isVisible, triggerElement, placement, offsetDistance])

  React.useEffect(() => {
    if (!isVisible) {
      return
    }

    const handleWindowKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsVisible(false)
      }
    }

    window.addEventListener('keydown', handleWindowKeyDown)

    return () => window.removeEventListener('keydown', handleWindowKeyDown)
  }, [isVisible])

  /**
   * Focus and blur bubble in React, so wrapping the trigger is enough to catch them — no
   * handler has to be merged into the consumer's element, which would silently drop any
   * handler of the same name it already had.
   */
  return (
    <>
      <span
        ref={setTriggerElement}
        className={styles.trigger}
        onMouseEnter={() => setIsVisible(true)}
        onMouseLeave={() => setIsVisible(false)}
        onFocus={() => setIsVisible(true)}
        onBlur={() => setIsVisible(false)}
      >
        {React.isValidElement(children)
          ? React.cloneElement(children, {
              'aria-describedby': isVisible ? tooltipId : undefined,
            })
          : children}
      </span>

      {isVisible
        ? createPortal(
            <div
              ref={tooltipRef}
              id={tooltipId}
              role="tooltip"
              className={clsx(RONIN_SCOPE, styles.tooltip, className)}
              style={style}
            >
              {content}
            </div>,
            document.body,
          )
        : null}
    </>
  )
}
