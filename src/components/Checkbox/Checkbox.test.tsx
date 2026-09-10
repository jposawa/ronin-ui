import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'

import { Checkbox } from './Checkbox'

describe('Checkbox', () => {
  it('associates the label with the box, so the text toggles it', async () => {
    const handleCheckedChange = vi.fn()
    render(
      <Checkbox label="Accept the terms" checked={false} onCheckedChange={handleCheckedChange} />,
    )

    const box = screen.getByRole('checkbox', { name: 'Accept the terms' })
    expect(box).not.toBeChecked()

    await userEvent.click(screen.getByText('Accept the terms'))

    expect(handleCheckedChange).toHaveBeenCalledWith(true)
  })

  it('reports the new state, not a bare toggle', async () => {
    const handleCheckedChange = vi.fn()
    render(<Checkbox label="Accept the terms" checked onCheckedChange={handleCheckedChange} />)

    await userEvent.click(screen.getByRole('checkbox'))

    expect(handleCheckedChange).toHaveBeenCalledWith(false)
  })

  it('toggles from the keyboard', async () => {
    const handleCheckedChange = vi.fn()
    render(
      <Checkbox label="Accept the terms" checked={false} onCheckedChange={handleCheckedChange} />,
    )

    await userEvent.tab()
    expect(screen.getByRole('checkbox')).toHaveFocus()

    await userEvent.keyboard(' ')

    expect(handleCheckedChange).toHaveBeenCalledWith(true)
  })

  /* The state with no HTML attribute behind it, and the one a hand-rolled checkbox always drops. */
  it('carries the indeterminate state', () => {
    const { rerender } = render(
      <Checkbox indeterminate label="Select all" checked={false} onCheckedChange={() => {}} />,
    )

    expect(screen.getByRole('checkbox')).toBePartiallyChecked()

    rerender(<Checkbox label="Select all" checked={false} onCheckedChange={() => {}} />)

    expect(screen.getByRole('checkbox')).not.toBePartiallyChecked()
  })

  it('marks itself invalid and announces the error when one is given', () => {
    render(
      <Checkbox
        label="Accept the terms"
        errorMessage="You have to accept the terms."
        checked={false}
        onCheckedChange={() => {}}
      />,
    )

    const box = screen.getByRole('checkbox')

    expect(box).toBeInvalid()
    expect(box).toHaveAccessibleDescription('You have to accept the terms.')
    expect(screen.getByRole('alert')).toHaveTextContent('You have to accept the terms.')
  })

  it('hides the hint while an error is showing', () => {
    const { rerender } = render(
      <Checkbox
        label="Accept the terms"
        hint="You can withdraw later."
        checked={false}
        onCheckedChange={() => {}}
      />,
    )

    expect(screen.getByRole('checkbox')).toHaveAccessibleDescription('You can withdraw later.')

    rerender(
      <Checkbox
        label="Accept the terms"
        hint="You can withdraw later."
        errorMessage="Required."
        checked={false}
        onCheckedChange={() => {}}
      />,
    )

    expect(screen.queryByText('You can withdraw later.')).not.toBeInTheDocument()
  })

  /* The native element is kept precisely so a form still sees the field. */
  it('passes form attributes through to the element', () => {
    render(
      <Checkbox
        required
        name="terms"
        value="accepted"
        label="Accept the terms"
        checked={false}
        onCheckedChange={() => {}}
      />,
    )

    const box = screen.getByRole('checkbox')

    expect(box).toHaveAttribute('name', 'terms')
    expect(box).toHaveAttribute('value', 'accepted')
    expect(box).toBeRequired()
  })

  it('reports nothing while disabled', async () => {
    const handleCheckedChange = vi.fn()
    render(
      <Checkbox
        disabled
        label="Accept the terms"
        checked={false}
        onCheckedChange={handleCheckedChange}
      />,
    )

    await userEvent.click(screen.getByRole('checkbox'))

    expect(handleCheckedChange).not.toHaveBeenCalled()
  })
})
