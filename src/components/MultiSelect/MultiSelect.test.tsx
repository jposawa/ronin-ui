import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'

import type { SelectOption } from '../../types'
import { MultiSelect } from './MultiSelect'

const OPTIONS: SelectOption[] = [
  { value: 'design', label: 'Design' },
  { value: 'engineering', label: 'Engineering' },
  { value: 'marketing', label: 'Marketing' },
]

describe('MultiSelect', () => {
  it('announces the list as multi-selectable', async () => {
    render(<MultiSelect label="Teams" options={OPTIONS} values={[]} onValuesChange={() => {}} />)

    await userEvent.click(screen.getByRole('combobox', { name: /Teams/ }))

    expect(screen.getByRole('listbox')).toHaveAttribute('aria-multiselectable', 'true')
  })

  it('adds a value and keeps the list open for the next choice', async () => {
    const handleValuesChange = vi.fn()
    render(
      <MultiSelect
        label="Teams"
        options={OPTIONS}
        values={['design']}
        onValuesChange={handleValuesChange}
      />,
    )

    await userEvent.click(screen.getByRole('combobox', { name: /Teams/ }))
    await userEvent.click(screen.getByRole('option', { name: 'Marketing' }))

    expect(handleValuesChange).toHaveBeenCalledWith(['design', 'marketing'])
    expect(screen.getByRole('listbox')).toBeInTheDocument()
  })

  it('removes a value that was already chosen', async () => {
    const handleValuesChange = vi.fn()
    render(
      <MultiSelect
        label="Teams"
        options={OPTIONS}
        values={['design', 'marketing']}
        onValuesChange={handleValuesChange}
      />,
    )

    await userEvent.click(screen.getByRole('combobox', { name: /Teams/ }))

    const chosenOption = screen.getByRole('option', { name: 'Design' })
    expect(chosenOption).toHaveAttribute('aria-selected', 'true')

    await userEvent.click(chosenOption)

    expect(handleValuesChange).toHaveBeenCalledWith(['marketing'])
  })

  it('summarises the chosen options on the closed trigger', () => {
    render(
      <MultiSelect
        label="Teams"
        options={OPTIONS}
        values={['marketing', 'design']}
        onValuesChange={() => {}}
      />,
    )

    /* Read in the order the options were given, not the order they were picked. */
    expect(screen.getByRole('combobox', { name: /Teams/ })).toHaveTextContent('Design, Marketing')
  })

  it('lets the consumer write the summary, which is where any copy belongs', () => {
    render(
      <MultiSelect
        label="Teams"
        options={OPTIONS}
        values={['design', 'marketing']}
        onValuesChange={() => {}}
        renderSummary={(selectedOptions) => `${selectedOptions.length} selecionados`}
      />,
    )

    expect(screen.getByRole('combobox', { name: /Teams/ })).toHaveTextContent('2 selecionados')
  })

  it('shows the placeholder while nothing is chosen', () => {
    render(
      <MultiSelect
        label="Teams"
        options={OPTIONS}
        values={[]}
        onValuesChange={() => {}}
        placeholder="Any team"
      />,
    )

    expect(screen.getByRole('combobox', { name: /Teams/ })).toHaveTextContent('Any team')
  })

  it('keeps the search field focused while options are picked', async () => {
    const handleValuesChange = vi.fn()
    render(
      <MultiSelect
        isSearchable
        label="Teams"
        options={OPTIONS}
        values={[]}
        onValuesChange={handleValuesChange}
      />,
    )

    await userEvent.click(screen.getByRole('combobox', { name: /Teams/ }))

    const searchField = screen.getByRole('textbox', { name: 'Search options' })
    await userEvent.type(searchField, 'mark')
    await userEvent.click(screen.getByRole('option', { name: 'Marketing' }))

    expect(handleValuesChange).toHaveBeenCalledWith(['marketing'])
    expect(searchField).toHaveFocus()
  })
})
