import type { Placement } from '@floating-ui/dom'
import clsx from 'clsx'
import React from 'react'
import { createPortal } from 'react-dom'

import { RONIN_SCOPE } from '../../constants'
import { useFloatingPanel } from '../../internal'
import type { BaseComponent } from '../../types'
import styles from './Popover.module.css'

export type PopoverPlacement = Placement

export type PopoverProps = BaseComponent & {
  isOpen: boolean
  onClose: () => void
  /**
   * The element the panel is anchored to and returns focus to. One element — it is the thing
   * the panel points at, not the panel's content.
   *
   * It is rendered in place, so it stays wherever it sits in your markup. `aria-expanded`,
   * `aria-haspopup` and `aria-controls` are attached to it here.
   */
  trigger: React.ReactElement<{
    'aria-expanded'?: boolean
    'aria-haspopup'?: string
    'aria-controls'?: string
  }>
  children: React.ReactNode
  /**
   * The panel's accessible name, always. A `role="dialog"` without one is announced as an
   * unnamed dialog, which tells the reader nothing about what just opened.
   */
  title: string
  /** Keeps `title` as the accessible name but takes it off the screen — for a menu or picker. */
  hideTitle?: boolean
  placement?: PopoverPlacement
  /** Distance from the trigger, in pixels. */
  offsetDistance?: number
}

const FOCUSABLE_SELECTOR =
  'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'

/**
 * A panel anchored to a trigger, holding content the reader can interact with.
 *
 * **Not a `Tooltip` with buttons in it.** A tooltip is `role="tooltip"`, describes its trigger,
 * opens on hover, and must contain nothing focusable — content inside it is unreachable by
 * keyboard and touch. This is a non-modal `role="dialog"`: it opens on a deliberate action,
 * takes focus, and its content is the point.
 *
 * **Not a `Modal` either.** It leaves the page behind it live and interactive, and does not
 * trap focus. When a decision has to be made before anything else can happen, that is a modal.
 *
 * The open state belongs to the consumer, as it does for `Modal` and `Drawer`: `isOpen` in,
 * `onClose` out. Escape closes it and hands focus back to the trigger; a click outside closes
 * it and leaves focus wherever the pointer put it; moving focus out of the panel closes it too.
 *
 * Known limitation, inherent to portalling: the panel is rendered at the end of `<body>`, so
 * tabbing forward out of it continues from there rather than from after the trigger. Portalling
 * is what stops an `overflow: hidden` ancestor from clipping the panel, and the trade is the
 * same one `Tooltip` makes.
 */
export const Popover = ({
  isOpen,
  onClose,
  trigger,
  children,
  title,
  hideTitle = false,
  placement = 'bottom-start',
  offsetDistance = 8,
  className,
  style,
}: PopoverProps) => {
  const [triggerElement, setTriggerElement] = React.useState<HTMLSpanElement | null>(null)
  const [panelElement, setPanelElement] = React.useState<HTMLDivElement | null>(null)
  const baseId = React.useId()
  const panelId = `${baseId}-panel`
  const titleId = `${baseId}-title`

  useFloatingPanel({
    isOpen,
    anchorElement: triggerElement,
    panelElement,
    placement,
    offsetDistance,
  })

  /**
   * Focus moves into the panel when it opens — that is what separates this from a tooltip. The
   * panel itself is the target rather than its first control: a reader hears the dialog's name
   * before its contents, and a panel whose content is not focusable still gets focus.
   */
  React.useEffect(() => {
    if (isOpen && panelElement) {
      panelElement.focus()
    }
  }, [isOpen, panelElement])

  React.useEffect(() => {
    if (!isOpen) {
      return
    }

    const handleWindowKeyDown = (event: KeyboardEvent) => {
      if (event.key !== 'Escape') {
        return
      }

      /**
       * Escape is a deliberate dismissal, so focus goes back where it came from.
       *
       * The measured anchor is the wrapper `<span>`, which is not focusable — focus has to go
       * to the control inside it. Calling `focus()` on the span silently does nothing, which is
       * how this was written the first time and how the test caught it.
       */
      triggerElement?.querySelector<HTMLElement>(FOCUSABLE_SELECTOR)?.focus()
      onClose()
    }

    const handleDocumentPointerDown = (event: PointerEvent) => {
      const target = event.target as Node | null

      if (!target || panelElement?.contains(target) || triggerElement?.contains(target)) {
        return
      }

      /* No focus restore: the pointer already chose where it goes. */
      onClose()
    }

    window.addEventListener('keydown', handleWindowKeyDown)
    document.addEventListener('pointerdown', handleDocumentPointerDown)

    return () => {
      window.removeEventListener('keydown', handleWindowKeyDown)
      document.removeEventListener('pointerdown', handleDocumentPointerDown)
    }
  }, [isOpen, onClose, panelElement, triggerElement])

  /**
   * Tabbing past the last control closes the panel, because a non-modal dialog does not trap
   * focus and one left open behind the reader is worse than one that closes.
   *
   * A **null** `relatedTarget` is deliberately ignored. It means focus went nowhere the page can
   * name — the browser's address bar, another window, or a click on inert text — and the
   * pointer case is already covered above. Closing on it as well fired `onClose` twice for a
   * single outside click, and would dismiss the panel when the reader merely switched windows.
   */
  const handlePanelBlur = (event: React.FocusEvent<HTMLDivElement>) => {
    const nextFocused = event.relatedTarget as Node | null

    if (!nextFocused) {
      return
    }

    if (panelElement?.contains(nextFocused) || triggerElement?.contains(nextFocused)) {
      return
    }

    onClose()
  }

  return (
    <>
      {/**
       * The same wrapper `Tooltip` uses, and for the same reason: it is a real box floating-ui
       * can measure, where `display: contents` would have an empty rect and position the panel
       * against nothing.
       */}
      <span ref={setTriggerElement} className={styles.trigger}>
        {React.isValidElement(trigger)
          ? React.cloneElement(trigger, {
              'aria-expanded': isOpen,
              'aria-haspopup': 'dialog',
              'aria-controls': isOpen ? panelId : undefined,
            })
          : trigger}
      </span>

      {isOpen
        ? createPortal(
            <div
              ref={setPanelElement}
              id={panelId}
              role="dialog"
              className={clsx(RONIN_SCOPE, styles.panel, className)}
              style={style}
              aria-labelledby={titleId}
              /* Focusable so the panel can receive focus itself — never a tab stop of its own. */
              tabIndex={-1}
              onBlur={handlePanelBlur}
            >
              <h2 className={styles.title} id={titleId} data-hidden={hideTitle ? '' : undefined}>
                {title}
              </h2>

              <div className={styles.body}>{children}</div>
            </div>,
            document.body,
          )
        : null}
    </>
  )
}
