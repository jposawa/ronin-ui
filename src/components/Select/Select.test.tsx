import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'

import type { SelectOption } from '../../types'
import { Select } from './Select'

const OPTIONS: SelectOption[] = [
  { value: 'design', label: 'Design' },
  { value: 'engineering', label: 'Engineering' },
  { value: 'marketing', label: 'Marketing' },
  { value: 'legal', label: 'Legal', disabled: true },
]

/**
 * These assert what a screen reader and a keyboard would observe: the combobox pattern, the
 * name coming from the label, and the list closing where it should. None of it is visible in a
 * screenshot, and all of it breaks silently.
 */
describe('Select', () => {
  it('names the trigger from the label and opens the list from it', async () => {
    render(<Select label="Team" options={OPTIONS} value={null} onValueChange={() => {}} />)

    const trigger = screen.getByRole('combobox', { name: /Team/ })

    expect(trigger).toHaveAttribute('aria-expanded', 'false')
    expect(screen.queryByRole('listbox')).not.toBeInTheDocument()

    await userEvent.click(trigger)

    expect(trigger).toHaveAttribute('aria-expanded', 'true')
    expect(screen.getByRole('listbox')).toBeInTheDocument()
    expect(screen.getAllByRole('option')).toHaveLength(4)
  })

  it('reports the chosen value, closes, and hands focus back to the trigger', async () => {
    const handleValueChange = vi.fn()
    render(<Select label="Team" options={OPTIONS} value={null} onValueChange={handleValueChange} />)

    const trigger = screen.getByRole('combobox', { name: /Team/ })
    await userEvent.click(trigger)
    await userEvent.click(screen.getByRole('option', { name: 'Marketing' }))

    expect(handleValueChange).toHaveBeenCalledWith('marketing')
    expect(screen.queryByRole('listbox')).not.toBeInTheDocument()
    expect(trigger).toHaveFocus()
  })

  it('marks the current value as selected and repeats it on the closed trigger', async () => {
    render(
      <Select label="Team" options={OPTIONS} value="engineering" onValueChange={() => {}} />,
    )

    const trigger = screen.getByRole('combobox', { name: /Team/ })

    expect(trigger).toHaveTextContent('Engineering')

    await userEvent.click(trigger)

    expect(screen.getByRole('option', { name: 'Engineering' })).toHaveAttribute(
      'aria-selected',
      'true',
    )
  })

  it('chooses with the keyboard alone', async () => {
    const handleValueChange = vi.fn()
    render(<Select label="Team" options={OPTIONS} value={null} onValueChange={handleValueChange} />)

    await userEvent.tab()
    expect(screen.getByRole('combobox', { name: /Team/ })).toHaveFocus()

    await userEvent.keyboard('{ArrowDown}')
    expect(screen.getByRole('listbox')).toBeInTheDocument()

    await userEvent.keyboard('{ArrowDown}{Enter}')

    expect(handleValueChange).toHaveBeenCalledWith('engineering')
  })

  it('skips a disabled option and never reports it', async () => {
    const handleValueChange = vi.fn()
    render(<Select label="Team" options={OPTIONS} value={null} onValueChange={handleValueChange} />)

    await userEvent.click(screen.getByRole('combobox', { name: /Team/ }))
    await userEvent.click(screen.getByRole('option', { name: 'Legal' }))

    expect(handleValueChange).not.toHaveBeenCalled()
    expect(screen.getByRole('listbox')).toBeInTheDocument()
  })

  it('filters the list by label when it is searchable', async () => {
    render(
      <Select
        isSearchable
        label="Team"
        options={OPTIONS}
        value={null}
        onValueChange={() => {}}
        emptyMessage="No team matches."
      />,
    )

    await userEvent.click(screen.getByRole('combobox', { name: /Team/ }))

    const searchField = screen.getByRole('textbox', { name: 'Search options' })
    expect(searchField).toHaveFocus()

    await userEvent.type(searchField, 'eng')

    expect(screen.getAllByRole('option')).toHaveLength(1)
    expect(screen.getByRole('option', { name: 'Engineering' })).toBeInTheDocument()

    await userEvent.clear(searchField)
    await userEvent.type(searchField, 'zzz')

    expect(screen.queryAllByRole('option')).toHaveLength(0)
    expect(screen.getByText('No team matches.')).toBeInTheDocument()
  })

  it('closes on Escape without reporting anything', async () => {
    const handleValueChange = vi.fn()
    render(<Select label="Team" options={OPTIONS} value={null} onValueChange={handleValueChange} />)

    const trigger = screen.getByRole('combobox', { name: /Team/ })
    await userEvent.click(trigger)
    await userEvent.keyboard('{Escape}')

    expect(screen.queryByRole('listbox')).not.toBeInTheDocument()
    expect(handleValueChange).not.toHaveBeenCalled()
    expect(trigger).toHaveFocus()
  })

  it('marks itself invalid and announces the error when one is given', () => {
    render(
      <Select
        label="Team"
        options={OPTIONS}
        value={null}
        onValueChange={() => {}}
        errorMessage="Pick a team."
      />,
    )

    const trigger = screen.getByRole('combobox', { name: /Team/ })

    expect(trigger).toBeInvalid()
    expect(trigger).toHaveAccessibleDescription('Pick a team.')
    expect(screen.getByRole('alert')).toHaveTextContent('Pick a team.')
  })

  it('does not open while disabled', async () => {
    render(
      <Select disabled label="Team" options={OPTIONS} value={null} onValueChange={() => {}} />,
    )

    await userEvent.click(screen.getByRole('combobox', { name: /Team/ }))

    expect(screen.queryByRole('listbox')).not.toBeInTheDocument()
  })
})
