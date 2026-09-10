import React from 'react'

import { type FieldMessageCopy, OptionListbox } from '../../internal'
import type { BaseComponent, SelectOption } from '../../types'

export type SelectProps = BaseComponent &
  FieldMessageCopy & {
    options: SelectOption[]
    /**
     * `null` is "nothing chosen". Not `''` — an empty string is a value an option is allowed to
     * have, so a sentinel made of one would be indistinguishable from a real choice.
     */
    value: string | null
    onValueChange: (value: string) => void
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
 * A single choice out of a list, controlled: `value` in, `onValueChange` out.
 *
 * Choosing closes the list and puts focus back on the trigger, because the reader is done. It
 * never reports a choice it was not given — selecting the option already selected still calls
 * `onValueChange`, so a consumer treating the callback as "the reader confirmed this" is right.
 *
 * With `isSearchable` the popup grows a filter field that matches on `label`, which is why
 * `label` is a string.
 */
export const Select = ({
  options,
  value,
  onValueChange,
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
}: SelectProps) => {
  const selectedOption = options.find((option) => option.value === value)

  return (
    <OptionListbox
      options={options}
      selectedValues={selectedOption ? [selectedOption.value] : []}
      onOptionSelect={onValueChange}
      summary={selectedOption?.label ?? null}
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
