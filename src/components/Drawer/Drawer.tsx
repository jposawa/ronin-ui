import clsx from 'clsx'
import React from 'react'

import { RONIN_SCOPE } from '../../constants'
import type { BaseComponent } from '../../types'
import styles from './Drawer.module.css'

/** Logical, not physical: `start` and `end` follow the writing direction. */
export type DrawerSide = 'start' | 'end' | 'top' | 'bottom'

export type DrawerProps = BaseComponent & {
  isOpen: boolean
  onClose: () => void
  title: string
  children: React.ReactNode
  footer?: React.ReactNode
  side?: DrawerSide
  /** Escape and a backdrop click stop closing it, and the close button goes away with them. */
  isPersistent?: boolean
  closeLabel?: string
}

/**
 * A panel pinned to one edge of the viewport.
 *
 * The same native `<dialog>` as `Modal`, for the same reasons — focus trapping, Escape,
 * returning focus to the trigger, an inert page behind and the top layer all come from the
 * browser. Only the position differs, which is why this is a sibling component rather than a
 * `Modal` variant: everything visible about it is the placement.
 */
export const Drawer = ({
  isOpen,
  onClose,
  title,
  children,
  footer,
  side = 'end',
  isPersistent = false,
  closeLabel = 'Close drawer',
  className,
  style,
}: DrawerProps) => {
  const dialogRef = React.useRef<HTMLDialogElement>(null)
  const titleId = React.useId()

  React.useEffect(() => {
    const dialog = dialogRef.current

    if (!dialog) {
      return
    }

    if (isOpen && !dialog.open) {
      dialog.showModal()
    }

    if (!isOpen && dialog.open) {
      dialog.close()
    }
  }, [isOpen])

  /** Escape reports the intent; the consumer still owns whether it closes. */
  const handleDialogCancel = (event: React.SyntheticEvent<HTMLDialogElement>) => {
    event.preventDefault()

    if (!isPersistent) {
      onClose()
    }
  }

  const handleDialogClick = (event: React.MouseEvent<HTMLDialogElement>) => {
    if (!isPersistent && event.target === dialogRef.current) {
      onClose()
    }
  }

  return (
    <dialog
      ref={dialogRef}
      className={clsx(RONIN_SCOPE, styles.drawer, className)}
      style={style}
      data-side={side}
      aria-labelledby={titleId}
      onCancel={handleDialogCancel}
      onClick={handleDialogClick}
    >
      {/* Divs, not `<header>` / `<footer>` — see the note in Modal. */}
      <div className={styles.header}>
        <h2 className={styles.title} id={titleId}>
          {title}
        </h2>

        {!isPersistent ? (
          <button
            type="button"
            className={styles.closeButton}
            aria-label={closeLabel}
            onClick={onClose}
          >
            <span className={styles.closeIcon} aria-hidden="true" />
          </button>
        ) : null}
      </div>

      <div className={styles.body}>{children}</div>

      {footer ? <div className={styles.footer}>{footer}</div> : null}
    </dialog>
  )
}
