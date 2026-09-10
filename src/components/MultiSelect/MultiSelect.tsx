import React from 'react'

import { type FieldMessageCopy, OptionListbox } from '../../internal'
import type { BaseComponent, SelectOption } from '../../types'

export type MultiSelectProps = BaseComponent &
  FieldMessageCopy & {
    options: SelectOption[]
    values: string[]
    onValuesChange: (values: string[]) => void
    /**
     * What the closed trigger shows once something is chosen. The default joins the labels with
     * a comma, which is the only summary the library can write without inventing copy — a
     * consumer wanting "3 selected" supplies it here, in its own language.
     */
    renderSummary?: (selectedOptions: SelectOption[]) => React.ReactNode
    label?: string
    /** Shown while nothing is chosen. Visible copy, so it has no default. */
    placeholder?: string
    disabled?: boolean
    /** Adds a filter field above the list. Off otherwise. */
    isSearchable?: boolean
    searchPlaceholder?: string
    /** Accessible name for the filter field. English default; the library ships no UI copy. */
    searchLabel?: string
    /** Shown when the filter matches nothing. Visible copy, so it has no default. */
    emptyMessage?: React.ReactNode
    id?: string
  }

/**
 * Several choices out of a list, controlled: `values` in, `onValuesChange` out.
 *
 * It is a sibling of `Select` rather than a `isMultiple` flag on it, because the flag would
 * change the type of `value` and of the callback — a prop that silently rewrites the contract
 * around it, which is the same reason `Badge` and `Chip` are two components. Both are built
 * from one internal listbox, so the keyboard behaviour cannot drift apart.
 *
 * Picking an option toggles it and the list stays open, since a second choice is the expected
 * next move. Escape or a click outside closes it.
 */
export const MultiSelect = ({
  options,
  values,
  onValuesChange,
  renderSummary,
  label,
  placeholder,
  hint,
  errorMessage,
  disabled,
  isSearchable,
  searchPlaceholder,
  searchLabel,
  emptyMessage,
  id,
  className,
  style,
}: MultiSelectProps) => {
  /* Read in the order the options were given, not the order they were picked: the summary is a
     list the reader scans against the open list, and a shuffled one is harder to check. */
  const selectedOptions = options.filter((option) => values.includes(option.value))

  const handleOptionSelect = (optionValue: string) => {
    const isSelected = values.includes(optionValue)

    if (isSelected) {
      onValuesChange(values.filter((value) => value !== optionValue))

      return
    }

    onValuesChange([...values, optionValue])
  }

  const toDefaultSummary = () => {
    return selectedOptions.map((option) => option.label).join(', ')
  }

  const summary = renderSummary ? renderSummary(selectedOptions) : toDefaultSummary()

  return (
    <OptionListbox
      isMultiple
      options={options}
      selectedValues={values}
      onOptionSelect={handleOptionSelect}
      summary={selectedOptions.length > 0 ? summary : null}
      label={label}
      placeholder={placeholder}
      hint={hint}
      errorMessage={errorMessage}
      disabled={disabled}
      isSearchable={isSearchable}
      searchPlaceholder={searchPlaceholder}
      searchLabel={searchLabel}
      emptyMessage={emptyMessage}
      id={id}
      className={className}
      style={style}
    />
  )
}
