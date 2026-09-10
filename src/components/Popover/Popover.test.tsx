import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'

import { Button } from '../Button'
import { Popover } from './Popover'

/**
 * The distinction these protect is the one that makes `Popover` a separate component from
 * `Tooltip`: its content is reachable, focused and named. A tooltip that grew buttons would
 * pass a screenshot review and be unusable by keyboard.
 */
describe('Popover', () => {
  it('wires the trigger to the panel and announces the panel by its title', async () => {
    const { rerender } = render(
      <Popover isOpen={false} onClose={() => {}} title="Share project" trigger={<Button>Share</Button>}>
        <Button>Copy link</Button>
      </Popover>,
    )

    const trigger = screen.getByRole('button', { name: 'Share' })

    expect(trigger).toHaveAttribute('aria-expanded', 'false')
    expect(trigger).toHaveAttribute('aria-haspopup', 'dialog')
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()

    rerender(
      <Popover isOpen onClose={() => {}} title="Share project" trigger={<Button>Share</Button>}>
        <Button>Copy link</Button>
      </Popover>,
    )

    expect(trigger).toHaveAttribute('aria-expanded', 'true')
    expect(screen.getByRole('dialog', { name: 'Share project' })).toBeInTheDocument()
    expect(trigger).toHaveAttribute('aria-controls', screen.getByRole('dialog').id)
  })

  it('takes focus when it opens, which is what a tooltip must never do', () => {
    render(
      <Popover isOpen onClose={() => {}} title="Share project" trigger={<Button>Share</Button>}>
        <Button>Copy link</Button>
      </Popover>,
    )

    expect(screen.getByRole('dialog')).toHaveFocus()
    expect(screen.getByRole('button', { name: 'Copy link' })).toBeInTheDocument()
  })

  it('keeps the title as the accessible name while hiding it', () => {
    render(
      <Popover
        hideTitle
        isOpen
        onClose={() => {}}
        title="Project actions"
        trigger={<Button>Actions</Button>}
      >
        <Button>Rename</Button>
      </Popover>,
    )

    /* Hidden from the page, still the dialog's name — the point of the prop. */
    expect(screen.getByRole('dialog', { name: 'Project actions' })).toBeInTheDocument()
  })

  it('closes on Escape and hands focus back to the trigger', async () => {
    const handleClose = vi.fn()
    render(
      <Popover isOpen onClose={handleClose} title="Share project" trigger={<Button>Share</Button>}>
        <Button>Copy link</Button>
      </Popover>,
    )

    await userEvent.keyboard('{Escape}')

    expect(handleClose).toHaveBeenCalledTimes(1)
    expect(screen.getByRole('button', { name: 'Share' })).toHaveFocus()
  })

  it('closes on a click outside, and not on a click inside', async () => {
    const handleClose = vi.fn()
    render(
      <div>
        <span>Somewhere else</span>
        <Popover isOpen onClose={handleClose} title="Share project" trigger={<Button>Share</Button>}>
          <Button>Copy link</Button>
        </Popover>
      </div>,
    )

    await userEvent.click(screen.getByRole('button', { name: 'Copy link' }))
    expect(handleClose).not.toHaveBeenCalled()

    await userEvent.click(screen.getByText('Somewhere else'))
    expect(handleClose).toHaveBeenCalledTimes(1)
  })

  it('does not report a close while it is already closed', async () => {
    const handleClose = vi.fn()
    render(
      <Popover
        isOpen={false}
        onClose={handleClose}
        title="Share project"
        trigger={<Button>Share</Button>}
      >
        <Button>Copy link</Button>
      </Popover>,
    )

    await userEvent.keyboard('{Escape}')

    expect(handleClose).not.toHaveBeenCalled()
  })
})
