import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'

import { Drawer } from './Drawer'

/**
 * Scope note, as in `Modal.test.tsx`: focus trapping, the backdrop and the top layer come from
 * the browser's `<dialog>` and are not simulated by the jsdom stubs, so nothing here claims
 * them. What is asserted is that open state stays the consumer's.
 */
describe('Drawer', () => {
  it('opens from the isOpen prop and is named by its title', () => {
    const { rerender } = render(
      <Drawer isOpen={false} onClose={() => {}} title="Filters">
        Body
      </Drawer>,
    )

    expect(screen.getByRole('dialog', { hidden: true })).not.toHaveAttribute('open')

    rerender(
      <Drawer isOpen onClose={() => {}} title="Filters">
        Body
      </Drawer>,
    )

    expect(screen.getByRole('dialog', { name: 'Filters' })).toHaveAttribute('open')
  })

  it('asks to close on Escape rather than closing itself', () => {
    const handleClose = vi.fn()
    render(
      <Drawer isOpen onClose={handleClose} title="Filters">
        Body
      </Drawer>,
    )

    const dialog = screen.getByRole('dialog')
    dialog.dispatchEvent(new Event('cancel', { bubbles: false, cancelable: true }))

    expect(handleClose).toHaveBeenCalledTimes(1)
    expect(dialog).toHaveAttribute('open')
  })

  it('closes from the close button', async () => {
    const handleClose = vi.fn()
    render(
      <Drawer isOpen onClose={handleClose} title="Filters">
        Body
      </Drawer>,
    )

    await userEvent.click(screen.getByRole('button', { name: 'Close drawer' }))

    expect(handleClose).toHaveBeenCalledTimes(1)
  })

  it('drops the close button and ignores Escape when persistent', () => {
    const handleClose = vi.fn()
    render(
      <Drawer isOpen isPersistent onClose={handleClose} title="Filters">
        Body
      </Drawer>,
    )

    expect(screen.queryByRole('button', { name: 'Close drawer' })).not.toBeInTheDocument()

    screen
      .getByRole('dialog')
      .dispatchEvent(new Event('cancel', { bubbles: false, cancelable: true }))

    expect(handleClose).not.toHaveBeenCalled()
  })

  it('reports its side, and defaults to the inline end', () => {
    const { rerender } = render(
      <Drawer isOpen onClose={() => {}} title="Filters">
        Body
      </Drawer>,
    )

    expect(screen.getByRole('dialog')).toHaveAttribute('data-side', 'end')

    rerender(
      <Drawer isOpen side="bottom" onClose={() => {}} title="Filters">
        Body
      </Drawer>,
    )

    expect(screen.getByRole('dialog')).toHaveAttribute('data-side', 'bottom')
  })

  it('adds no banner or contentinfo landmark', () => {
    render(
      <Drawer isOpen onClose={() => {}} title="Filters" footer={<button>Apply</button>}>
        Body
      </Drawer>,
    )

    expect(screen.queryByRole('banner')).not.toBeInTheDocument()
    expect(screen.queryByRole('contentinfo')).not.toBeInTheDocument()
  })
})
