import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'

import { Switch } from './Switch'

describe('Switch', () => {
  it('is a switch carrying its own state, not a pressed button', () => {
    render(<Switch label="Email notifications" isChecked onToggle={() => {}} />)

    expect(screen.getByRole('switch', { name: 'Email notifications', checked: true })).toBeInTheDocument()
  })

  it('reports a toggle from the pointer and from the keyboard', async () => {
    const handleToggle = vi.fn()
    render(<Switch label="Email notifications" isChecked={false} onToggle={handleToggle} />)

    const control = screen.getByRole('switch', { name: 'Email notifications' })

    await userEvent.click(control)
    expect(handleToggle).toHaveBeenCalledTimes(1)

    control.focus()
    await userEvent.keyboard(' ')
    expect(handleToggle).toHaveBeenCalledTimes(2)

    await userEvent.keyboard('{Enter}')
    expect(handleToggle).toHaveBeenCalledTimes(3)
  })

  it('describes itself by its hint', () => {
    render(
      <Switch
        label="Email notifications"
        hint="Sent once a day at most."
        isChecked={false}
        onToggle={() => {}}
      />,
    )

    expect(screen.getByRole('switch')).toHaveAccessibleDescription('Sent once a day at most.')
  })

  it('reports nothing while disabled', async () => {
    const handleToggle = vi.fn()
    render(
      <Switch disabled label="Email notifications" isChecked={false} onToggle={handleToggle} />,
    )

    await userEvent.click(screen.getByRole('switch'))

    expect(handleToggle).not.toHaveBeenCalled()
  })
})
