import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'

import { Chip } from './Chip'

describe('Chip', () => {
  it('is a toggle button, not a label — that is what separates it from Badge', () => {
    render(<Chip label="Design" isActive={false} onToggle={() => {}} />)

    const chip = screen.getByRole('button', { name: 'Design', pressed: false })

    expect(chip).toBeInTheDocument()
    expect(chip).toHaveAttribute('type', 'button')
  })

  it('reflects isActive in aria-pressed, which is also what the styling reads', () => {
    const { rerender } = render(<Chip label="Design" isActive={false} onToggle={() => {}} />)

    expect(screen.getByRole('button', { name: 'Design' })).toHaveAttribute(
      'aria-pressed',
      'false',
    )

    rerender(<Chip label="Design" isActive onToggle={() => {}} />)

    expect(screen.getByRole('button', { name: 'Design' })).toHaveAttribute('aria-pressed', 'true')
  })

  it('calls onToggle from pointer and from keyboard', async () => {
    const handleToggle = vi.fn()
    render(<Chip label="Design" isActive={false} onToggle={handleToggle} />)

    /* Clicking leaves the chip focused, so the two key presses land on it. */
    await userEvent.click(screen.getByRole('button', { name: 'Design' }))
    await userEvent.keyboard('{Enter}')
    await userEvent.keyboard(' ')

    expect(handleToggle).toHaveBeenCalledTimes(3)
  })

  it('does not toggle while disabled', async () => {
    const handleToggle = vi.fn()
    render(<Chip label="Design" isActive={false} disabled onToggle={handleToggle} />)

    await userEvent.click(screen.getByRole('button', { name: 'Design' }))

    expect(handleToggle).not.toHaveBeenCalled()
  })
})
