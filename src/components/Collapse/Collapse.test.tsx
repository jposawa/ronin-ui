import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'

import { Collapse } from './Collapse'

describe('Collapse', () => {
  /**
   * The two attributes the hand-rolled versions in these projects were missing: one says the
   * control expands something, the other says what.
   */
  it('announces that it expands, and what', () => {
    render(
      <Collapse title="Advanced" isOpen={false} onToggle={() => {}}>
        Body
      </Collapse>,
    )

    const trigger = screen.getByRole('button', { name: 'Advanced', expanded: false })
    const region = screen.getByRole('region', { hidden: true })

    expect(trigger).toHaveAttribute('aria-controls', region.id)
    expect(region).toHaveAttribute('aria-labelledby', trigger.id)
  })

  it('hides the region while closed and shows it while open', () => {
    const { rerender } = render(
      <Collapse title="Advanced" isOpen={false} onToggle={() => {}}>
        Body
      </Collapse>,
    )

    expect(screen.queryByText('Body')).not.toBeVisible()

    rerender(
      <Collapse title="Advanced" isOpen onToggle={() => {}}>
        Body
      </Collapse>,
    )

    expect(screen.getByText('Body')).toBeVisible()
    expect(screen.getByRole('button', { name: 'Advanced' })).toHaveAttribute(
      'aria-expanded',
      'true',
    )
  })

  /**
   * The content sits outside the trigger. `dhsw`'s StatBlock nests it inside the `<button>`,
   * which folds the whole panel into the button's accessible name and would bury any control
   * in there inside a button.
   */
  it('keeps the content out of the trigger', () => {
    render(
      <Collapse title="Advanced" isOpen onToggle={() => {}}>
        <button type="button">Inner action</button>
      </Collapse>,
    )

    const trigger = screen.getByRole('button', { name: 'Advanced' })

    expect(trigger).toHaveAccessibleName('Advanced')
    expect(trigger).not.toContainElement(screen.getByRole('button', { name: 'Inner action' }))
  })

  /**
   * The point of the `actions` slot: a `<button>` cannot contain another, so header controls
   * have to be its siblings. They stay reachable, and stay out of the trigger's name.
   */
  it('renders actions beside the trigger, not inside it', async () => {
    const handleAction = vi.fn()
    render(
      <Collapse
        title="Notifications"
        isOpen={false}
        onToggle={() => {}}
        actions={
          <button type="button" onClick={handleAction}>
            Clear
          </button>
        }
      >
        Body
      </Collapse>,
    )

    const trigger = screen.getByRole('button', { name: 'Notifications' })
    const action = screen.getByRole('button', { name: 'Clear' })

    expect(trigger).not.toContainElement(action)

    await userEvent.click(action)
    expect(handleAction).toHaveBeenCalledTimes(1)
  })

  it('reports the toggle rather than opening itself', async () => {
    const handleToggle = vi.fn()
    render(
      <Collapse title="Advanced" isOpen={false} onToggle={handleToggle}>
        Body
      </Collapse>,
    )

    await userEvent.click(screen.getByRole('button', { name: 'Advanced' }))

    expect(handleToggle).toHaveBeenCalledTimes(1)
    expect(screen.getByRole('button', { name: 'Advanced' })).toHaveAttribute(
      'aria-expanded',
      'false',
    )
  })

  /**
   * A heading passed as `title` is hoisted to wrap the trigger — rendered where it was written
   * it would be invalid inside a `<button>`, and would be flattened into the button's name.
   * Plain text stays plain: a collapse inside a form is not a section heading.
   */
  it('hoists a heading title to wrap the trigger, and leaves text alone', () => {
    const { rerender } = render(
      <Collapse title="Advanced" isOpen={false} onToggle={() => {}}>
        Body
      </Collapse>,
    )

    expect(screen.queryByRole('heading')).not.toBeInTheDocument()

    rerender(
      <Collapse title={<h3>Advanced</h3>} isOpen={false} onToggle={() => {}}>
        Body
      </Collapse>,
    )

    expect(screen.getByRole('heading', { level: 3, name: 'Advanced' })).toBeInTheDocument()
  })
})
