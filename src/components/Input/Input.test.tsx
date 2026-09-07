import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'

import { Input } from './Input'

/**
 * These assert the wiring a consumer cannot see and would not notice breaking: the label
 * association, the described-by link, and the invalid state. A visual regression is obvious in
 * Storybook; a detached label is not.
 */
describe('Input', () => {
  it('associates the label with the field', () => {
    render(<Input label="Project name" value="" onValueChange={() => {}} />)

    expect(screen.getByLabelText('Project name')).toBeInTheDocument()
  })

  it('reports each keystroke through onValueChange', async () => {
    const handleValueChange = vi.fn()
    render(<Input label="Project name" value="" onValueChange={handleValueChange} />)

    await userEvent.type(screen.getByLabelText('Project name'), 'Ori')

    expect(handleValueChange).toHaveBeenCalledTimes(3)
    expect(handleValueChange).toHaveBeenLastCalledWith('i')
  })

  it('describes the field by its hint', () => {
    render(
      <Input label="Project name" hint="Visible to everyone." value="" onValueChange={() => {}} />,
    )

    expect(screen.getByLabelText('Project name')).toHaveAccessibleDescription(
      'Visible to everyone.',
    )
  })

  it('marks itself invalid and announces the error when one is given', () => {
    render(
      <Input
        label="Project name"
        errorMessage="Project name is required."
        value=""
        onValueChange={() => {}}
      />,
    )

    const field = screen.getByLabelText('Project name')

    expect(field).toBeInvalid()
    expect(field).toHaveAccessibleDescription('Project name is required.')
    expect(screen.getByRole('alert')).toHaveTextContent('Project name is required.')
  })

  it('hides the hint while an error is showing, and is not invalid without one', () => {
    const { rerender } = render(
      <Input label="Project name" hint="A hint." value="" onValueChange={() => {}} />,
    )

    expect(screen.getByLabelText('Project name')).not.toBeInvalid()
    expect(screen.queryByRole('alert')).not.toBeInTheDocument()

    rerender(
      <Input
        label="Project name"
        hint="A hint."
        errorMessage="An error."
        value=""
        onValueChange={() => {}}
      />,
    )

    expect(screen.queryByText('A hint.')).not.toBeInTheDocument()
  })

  it('passes native attributes through to the element', () => {
    render(
      <Input label="Seats" type="number" min={1} max={50} value="" onValueChange={() => {}} />,
    )

    const field = screen.getByLabelText('Seats')

    expect(field).toHaveAttribute('type', 'number')
    expect(field).toHaveAttribute('min', '1')
  })
})
