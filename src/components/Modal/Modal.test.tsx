import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'

import { Modal } from './Modal'

/**
 * Scope note: focus trapping and the top layer come from the browser's `<dialog>` and are not
 * simulated by the jsdom stubs in `vitest.setup.ts`, so they are not asserted here. What is
 * asserted is the part this component actually owns — that open state stays the consumer's.
 */
describe('Modal', () => {
  it('opens and closes from the isOpen prop', () => {
    const { rerender } = render(
      <Modal isOpen={false} onClose={() => {}} title="Delete project">
        Body
      </Modal>,
    )

    expect(screen.getByRole('dialog', { hidden: true })).not.toHaveAttribute('open')

    rerender(
      <Modal isOpen onClose={() => {}} title="Delete project">
        Body
      </Modal>,
    )

    expect(screen.getByRole('dialog')).toHaveAttribute('open')
  })

  it('is named by its title', () => {
    render(
      <Modal isOpen onClose={() => {}} title="Delete project">
        Body
      </Modal>,
    )

    expect(screen.getByRole('dialog', { name: 'Delete project' })).toBeInTheDocument()
  })

  /**
   * The dialog must not close itself: it reports the intent and waits for the prop to change.
   * Otherwise it would be shut while `isOpen` still said open, and the two would disagree.
   */
  it('asks to close on Escape rather than closing itself', () => {
    const handleClose = vi.fn()
    render(
      <Modal isOpen onClose={handleClose} title="Delete project">
        Body
      </Modal>,
    )

    const dialog = screen.getByRole('dialog')
    dialog.dispatchEvent(new Event('cancel', { bubbles: false, cancelable: true }))

    expect(handleClose).toHaveBeenCalledTimes(1)
    expect(dialog).toHaveAttribute('open')
  })

  it('closes from the close button', async () => {
    const handleClose = vi.fn()
    render(
      <Modal isOpen onClose={handleClose} title="Delete project">
        Body
      </Modal>,
    )

    await userEvent.click(screen.getByRole('button', { name: 'Close dialog' }))

    expect(handleClose).toHaveBeenCalledTimes(1)
  })

  it('drops the close button and ignores Escape when persistent', () => {
    const handleClose = vi.fn()
    render(
      <Modal isOpen isPersistent onClose={handleClose} title="Delete project">
        Body
      </Modal>,
    )

    expect(screen.queryByRole('button', { name: 'Close dialog' })).not.toBeInTheDocument()

    screen
      .getByRole('dialog')
      .dispatchEvent(new Event('cancel', { bubbles: false, cancelable: true }))

    expect(handleClose).not.toHaveBeenCalled()
  })

  /**
   * `<header>` and `<footer>` map to the banner and contentinfo landmarks outside sectioning
   * content, and `<dialog>` is not sectioning content — so a modal built with them would add a
   * second page banner.
   */
  it('adds no banner or contentinfo landmark', () => {
    render(
      <Modal isOpen onClose={() => {}} title="Delete project" footer={<button>Delete</button>}>
        Body
      </Modal>,
    )

    expect(screen.queryByRole('banner')).not.toBeInTheDocument()
    expect(screen.queryByRole('contentinfo')).not.toBeInTheDocument()
  })
})
