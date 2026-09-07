import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'

import { Button } from './Button'

describe('Button', () => {
  /**
   * `type` defaults to `button`, not `submit`. A component library that gets this wrong turns
   * every unlabelled button inside a form into an accidental submit.
   */
  it('defaults to type="button"', () => {
    render(<Button>Save</Button>)

    expect(screen.getByRole('button', { name: 'Save' })).toHaveAttribute('type', 'button')
  })

  it('still accepts an explicit type', () => {
    render(<Button type="submit">Save</Button>)

    expect(screen.getByRole('button', { name: 'Save' })).toHaveAttribute('type', 'submit')
  })

  it('exposes intent and variant as attributes the styling reads', () => {
    render(
      <Button intent="danger" variant="outline">
        Delete
      </Button>,
    )

    const button = screen.getByRole('button', { name: 'Delete' })

    expect(button).toHaveAttribute('data-intent', 'danger')
    expect(button).toHaveAttribute('data-variant', 'outline')
  })

  it('keeps the consumer class alongside its own', () => {
    render(<Button className="my-button">Save</Button>)

    expect(screen.getByRole('button', { name: 'Save' })).toHaveClass('my-button')
  })

  it('passes arbitrary attributes through to the element', async () => {
    const handleClick = vi.fn()
    render(
      <Button aria-keyshortcuts="Control+S" data-testid="save" onClick={handleClick}>
        Save
      </Button>,
    )

    const button = screen.getByTestId('save')
    expect(button).toHaveAttribute('aria-keyshortcuts', 'Control+S')

    await userEvent.click(button)
    expect(handleClick).toHaveBeenCalledTimes(1)
  })

  it('does not fire while disabled', async () => {
    const handleClick = vi.fn()
    render(
      <Button disabled onClick={handleClick}>
        Save
      </Button>,
    )

    await userEvent.click(screen.getByRole('button', { name: 'Save' }))

    expect(handleClick).not.toHaveBeenCalled()
  })
})
