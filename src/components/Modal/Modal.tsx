import clsx from 'clsx'
import React from 'react'

import { RONIN_SCOPE } from '../../constants'
import type { BaseComponent } from '../../types'
import styles from './Modal.module.css'

export type ModalSize = 'sm' | 'md' | 'lg'

export type ModalProps = BaseComponent & {
  isOpen: boolean
  onClose: () => void
  title: string
  children: React.ReactNode
  footer?: React.ReactNode
  size?: ModalSize
  /**
   * When false, Escape and a backdrop click stop closing the dialog — for a decision the
   * reader has to make explicitly. The close button goes away with it.
   */
  isDismissible?: boolean
  /** Accessible name of the close button. English default; the library ships no UI copy. */
  closeLabel?: string
}

/**
 * Built on the native `<dialog>` element, which is why there is so little code here: focus
 * trapping, Escape, returning focus to the trigger on close, marking the rest of the page
 * inert, and rendering above every stacking context all come from the browser.
 *
 * A hand-rolled modal has to reimplement each of those, and usually reimplements one wrong.
 */
export const Modal = ({
  isOpen,
  onClose,
  title,
  children,
  footer,
  size = 'md',
  isDismissible = true,
  closeLabel = 'Close dialog',
  className,
  style,
}: ModalProps) => {
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

  /**
   * `cancel` fires on Escape. It is prevented and turned into an `onClose` call so the open
   * state stays owned by the consumer — otherwise the dialog would close itself while the
   * prop still said it was open, and the two would disagree until the next toggle.
   */
  const handleDialogCancel = (event: React.SyntheticEvent<HTMLDialogElement>) => {
    event.preventDefault()

    if (isDismissible) {
      onClose()
    }
  }

  /** A click that lands on the dialog element itself landed on the backdrop, not the panel. */
  const handleDialogClick = (event: React.MouseEvent<HTMLDialogElement>) => {
    if (isDismissible && event.target === dialogRef.current) {
      onClose()
    }
  }

  return (
    <dialog
      ref={dialogRef}
      className={clsx(RONIN_SCOPE, styles.dialog, className)}
      style={style}
      data-size={size}
      aria-labelledby={titleId}
      onCancel={handleDialogCancel}
      onClick={handleDialogClick}
    >
      <div className={styles.panel}>
        <header className={styles.header}>
          <h2 className={styles.title} id={titleId}>
            {title}
          </h2>

          {isDismissible ? (
            <button
              type="button"
              className={styles.closeButton}
              aria-label={closeLabel}
              onClick={onClose}
            >
              <span className={styles.closeIcon} aria-hidden="true" />
            </button>
          ) : null}
        </header>

        <div className={styles.body}>{children}</div>

        {footer ? <footer className={styles.footer}>{footer}</footer> : null}
      </div>
    </dialog>
  )
}
