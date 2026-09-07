import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it } from 'vitest'

import { Button } from '../Button'
import { Tooltip } from './Tooltip'

describe('Tooltip', () => {
  it('opens on hover and on focus — hover alone would be unreachable by keyboard and touch', async () => {
    render(
      <Tooltip content="Copies the URL.">
        <Button>Share</Button>
      </Tooltip>,
    )

    const trigger = screen.getByRole('button', { name: 'Share' })

    expect(screen.queryByRole('tooltip')).not.toBeInTheDocument()

    await userEvent.hover(trigger)
    expect(screen.getByRole('tooltip')).toHaveTextContent('Copies the URL.')

    await userEvent.unhover(trigger)
    expect(screen.queryByRole('tooltip')).not.toBeInTheDocument()

    await userEvent.tab()
    expect(screen.getByRole('tooltip')).toBeInTheDocument()
  })

  it('describes the trigger only while it is open', async () => {
    render(
      <Tooltip content="Copies the URL.">
        <Button>Share</Button>
      </Tooltip>,
    )

    const trigger = screen.getByRole('button', { name: 'Share' })

    expect(trigger).not.toHaveAttribute('aria-describedby')

    await userEvent.hover(trigger)

    expect(trigger).toHaveAccessibleDescription('Copies the URL.')
  })

  it('closes on Escape', async () => {
    render(
      <Tooltip content="Copies the URL.">
        <Button>Share</Button>
      </Tooltip>,
    )

    await userEvent.hover(screen.getByRole('button', { name: 'Share' }))
    expect(screen.getByRole('tooltip')).toBeInTheDocument()

    await userEvent.keyboard('{Escape}')

    expect(screen.queryByRole('tooltip')).not.toBeInTheDocument()
  })
})
