import clsx from 'clsx'
import React from 'react'
import { createPortal } from 'react-dom'

import { RONIN_SCOPE } from '../../constants'
import type { BaseComponent, SelectOption } from '../../types'
import { FieldMessage, type FieldMessageCopy } from '../FieldMessage'
import { useFloatingPanel } from '../useFloatingPanel'
import styles from './OptionListbox.module.css'

export type OptionListboxProps = BaseComponent &
  FieldMessageCopy & {
    options: SelectOption[]
    selectedValues: string[]
    onOptionSelect: (value: string) => void
    /** What the closed trigger repeats back. `null` shows the placeholder instead. */
    summary: React.ReactNode
    /** Keeps the list open after a choice and announces the list as multi-selectable. */
    isMultiple?: boolean
    label?: string
    placeholder?: string
    disabled?: boolean
    isSearchable?: boolean
    searchPlaceholder?: string
    searchLabel?: string
    emptyMessage?: React.ReactNode
    id?: string
  }

/**
 * The listbox both `Select` and `MultiSelect` are built from: a `role="combobox"` trigger, a
 * portalled popup, an optional search field, and the keyboard pattern that goes with them.
 *
 * **Internal, and deliberately not exported from `components/index.ts`.** Two public components
 * sharing one implementation is what keeps their keyboard behaviour from drifting apart; making
 * the shared piece public would freeze this shape into the API instead.
 *
 * Not a native `<select>`: a native one cannot be filtered, cannot show a checkmark per row, and
 * cannot be styled past its user-agent chrome. What it gives up in return — the mobile
 * platform's own picker — is why the component carries the whole WAI-ARIA combobox pattern by
 * hand rather than half of it.
 */
export const OptionListbox = ({
  options,
  selectedValues,
  onOptionSelect,
  summary,
  isMultiple = false,
  label,
  placeholder,
  hint,
  errorMessage,
  disabled = false,
  isSearchable = false,
  searchPlaceholder,
  searchLabel = 'Search options',
  emptyMessage,
  id,
  className,
  style,
}: OptionListboxProps) => {
  const generatedId = React.useId()
  const baseId = id ?? generatedId
  const triggerId = `${baseId}-trigger`
  const labelId = `${baseId}-label`
  const listboxId = `${baseId}-listbox`
  const messageId = `${baseId}-message`

  const [isOpen, setIsOpen] = React.useState(false)
  const [searchTerm, setSearchTerm] = React.useState('')
  const [activeValue, setActiveValue] = React.useState<string | null>(null)
  const [popupElement, setPopupElement] = React.useState<HTMLDivElement | null>(null)

  /**
   * State rather than a ref, because the position hook has to re-run when the element arrives —
   * a ref mutation does not re-render, so the first open would compute against nothing.
   */
  const [triggerElement, setTriggerElement] = React.useState<HTMLButtonElement | null>(null)
  const searchRef = React.useRef<HTMLInputElement>(null)
  const listRef = React.useRef<HTMLUListElement>(null)

  const isInvalid = Boolean(errorMessage)
  const message = errorMessage ?? hint

  /**
   * Option ids are built from the position in `options`, never from the value: a value is the
   * consumer's string and may hold a space, which is not legal in an `id` and would silently
   * break the `aria-activedescendant` reference.
   */
  const toOptionId = (optionValue: string) => {
    return `${baseId}-option-${options.findIndex((option) => option.value === optionValue)}`
  }

  const normalizedTerm = searchTerm.trim().toLowerCase()
  const visibleOptions =
    isSearchable && normalizedTerm
      ? options.filter((option) => option.label.toLowerCase().includes(normalizedTerm))
      : options

  const selectableOptions = visibleOptions.filter((option) => !option.disabled)
  const activeOptionId = activeValue ? toOptionId(activeValue) : undefined

  useFloatingPanel({
    isOpen,
    anchorElement: triggerElement,
    panelElement: popupElement,
    placement: 'bottom-start',
    offsetDistance: 4,
    /* The list is as wide as the field it drops from, and never taller than the room left. */
    shouldMatchAnchorWidth: true,
  })

  /**
   * Focus follows the popup, because the keyboard pattern lives there: the search field when
   * there is one, the list itself otherwise. The list is `tabIndex={-1}` — reachable that way,
   * never an extra tab stop.
   */
  React.useEffect(() => {
    if (!isOpen) {
      return
    }

    if (isSearchable) {
      searchRef.current?.focus()
    } else {
      listRef.current?.focus()
    }
  }, [isOpen, isSearchable])

  React.useEffect(() => {
    if (!isOpen || !activeOptionId) {
      return
    }

    /* jsdom implements no layout and defines no `scrollIntoView`, hence the optional call. */
    document.getElementById(activeOptionId)?.scrollIntoView?.({ block: 'nearest' })
  }, [isOpen, activeOptionId])

  React.useEffect(() => {
    if (!isOpen) {
      return
    }

    const handleDocumentPointerDown = (event: PointerEvent) => {
      const target = event.target as Node | null

      if (!target) {
        return
      }

      if (triggerElement?.contains(target) || popupElement?.contains(target)) {
        return
      }

      /* Focus is not pulled back to the trigger: the pointer already chose where it goes. */
      setIsOpen(false)
    }

    document.addEventListener('pointerdown', handleDocumentPointerDown)

    return () => document.removeEventListener('pointerdown', handleDocumentPointerDown)
  }, [isOpen, popupElement, triggerElement])

  const openListbox = () => {
    setSearchTerm('')
    /**
     * The list opens on the first selected option, or on the first choosable one. The selected
     * value is looked up in `options` rather than trusted: a value with no option behind it
     * would leave `aria-activedescendant` pointing at an element that does not exist.
     */
    const selectedOption = options.find((option) => selectedValues.includes(option.value))
    const firstChoosableOption = options.find((option) => !option.disabled)

    setActiveValue(selectedOption?.value ?? firstChoosableOption?.value ?? null)
    setIsOpen(true)
  }

  const closeListbox = () => {
    setIsOpen(false)
    triggerElement?.focus()
  }

  const selectOption = (option: SelectOption) => {
    if (option.disabled) {
      return
    }

    onOptionSelect(option.value)
    setActiveValue(option.value)

    if (!isMultiple) {
      closeListbox()
    }
  }

  /** Steps through the choosable options without wrapping, as `Tabs` does with its arrow keys. */
  const moveActiveOption = (step: number) => {
    if (selectableOptions.length === 0) {
      return
    }

    const currentIndex = selectableOptions.findIndex((option) => option.value === activeValue)

    if (currentIndex === -1) {
      const edgeOption =
        step > 0 ? selectableOptions[0] : selectableOptions[selectableOptions.length - 1]
      setActiveValue(edgeOption.value)

      return
    }

    const nextIndex = Math.min(Math.max(currentIndex + step, 0), selectableOptions.length - 1)
    setActiveValue(selectableOptions[nextIndex].value)
  }

  const handleTriggerClick = () => {
    if (isOpen) {
      setIsOpen(false)

      return
    }

    openListbox()
  }

  const handleTriggerKeyDown = (event: React.KeyboardEvent<HTMLButtonElement>) => {
    /* Enter and Space already reach `onClick` — a button opens itself. Only the arrows are ours. */
    if (event.key !== 'ArrowDown' && event.key !== 'ArrowUp') {
      return
    }

    event.preventDefault()

    if (!isOpen) {
      openListbox()
    }
  }

  const handleNavigationKeyDown = (event: React.KeyboardEvent) => {
    if (event.key === 'Tab') {
      /**
       * No `preventDefault`: focus goes back to the trigger and the browser continues the tab
       * order from there, which is where the reader left off.
       */
      closeListbox()

      return
    }

    if (event.key === 'ArrowDown') {
      moveActiveOption(1)
    } else if (event.key === 'ArrowUp') {
      moveActiveOption(-1)
    } else if (event.key === 'Home') {
      setActiveValue(selectableOptions[0]?.value ?? null)
    } else if (event.key === 'End') {
      setActiveValue(selectableOptions[selectableOptions.length - 1]?.value ?? null)
    } else if (event.key === 'Enter') {
      const activeOption = selectableOptions.find((option) => option.value === activeValue)

      if (activeOption) {
        selectOption(activeOption)
      }
    } else if (event.key === 'Escape') {
      closeListbox()
    } else {
      return
    }

    event.preventDefault()
  }

  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(event.target.value)
    /* Filtering can drop the active option out of the list, so the highlight starts over. */
    setActiveValue(null)
  }

  return (
    <div className={clsx(RONIN_SCOPE, styles.field, className)} style={style}>
      {/**
       * A `<span>`, not a `<label>`: a label points at a labelable element and a `<button>` is
       * not one, so the association would be dropped and the trigger left unnamed. The
       * reference runs the other way instead, and includes the trigger itself so the
       * announcement is the field's name followed by what is chosen.
       */}
      {label ? (
        <span className={styles.label} id={labelId}>
          {label}
        </span>
      ) : null}

      <button
        type="button"
        ref={setTriggerElement}
        id={triggerId}
        role="combobox"
        className={styles.trigger}
        aria-expanded={isOpen}
        aria-haspopup="listbox"
        /* Only while open: a reference to an element that is not rendered says nothing. */
        aria-controls={isOpen ? listboxId : undefined}
        aria-labelledby={label ? `${labelId} ${triggerId}` : undefined}
        aria-invalid={isInvalid || undefined}
        aria-describedby={message ? messageId : undefined}
        disabled={disabled}
        onClick={handleTriggerClick}
        onKeyDown={handleTriggerKeyDown}
      >
        <span className={styles.summary} data-empty={summary === null ? '' : undefined}>
          {summary ?? placeholder}
        </span>
        <span className={styles.icon} aria-hidden="true" />
      </button>

      {message ? (
        <FieldMessage id={messageId} hint={hint} errorMessage={errorMessage} />
      ) : null}

      {/**
       * Portalled and positioned `fixed`, so an `overflow: hidden` ancestor cannot clip the
       * list — the same reason `Tooltip` is portalled.
       */}
      {isOpen
        ? createPortal(
            <div ref={setPopupElement} className={clsx(RONIN_SCOPE, styles.popup)}>
              {isSearchable ? (
                <input
                  ref={searchRef}
                  type="text"
                  className={styles.search}
                  value={searchTerm}
                  placeholder={searchPlaceholder}
                  aria-label={searchLabel}
                  aria-controls={listboxId}
                  aria-activedescendant={activeOptionId}
                  aria-autocomplete="list"
                  autoComplete="off"
                  onChange={handleSearchChange}
                  onKeyDown={handleNavigationKeyDown}
                />
              ) : null}

              <ul
                ref={listRef}
                id={listboxId}
                role="listbox"
                className={styles.list}
                tabIndex={-1}
                aria-multiselectable={isMultiple || undefined}
                aria-labelledby={label ? labelId : undefined}
                aria-activedescendant={isSearchable ? undefined : activeOptionId}
                onKeyDown={isSearchable ? undefined : handleNavigationKeyDown}
                /* Keeps the caret in the search field: a press on a row must not blur it. */
                onMouseDown={(event) => event.preventDefault()}
              >
                {visibleOptions.map((option) => {
                  const isSelected = selectedValues.includes(option.value)

                  return (
                    <li
                      key={option.value}
                      id={toOptionId(option.value)}
                      role="option"
                      className={styles.option}
                      aria-selected={isSelected}
                      aria-disabled={option.disabled || undefined}
                      data-active={option.value === activeValue ? '' : undefined}
                      onClick={() => selectOption(option)}
                    >
                      <span className={styles.optionLabel}>{option.label}</span>
                      {isMultiple ? <span className={styles.check} aria-hidden="true" /> : null}
                    </li>
                  )
                })}

                {/**
                 * `emptyMessage` carries no default, because it is visible copy and the library
                 * ships none. Left out, a search that matches nothing shows an empty list.
                 */}
                {visibleOptions.length === 0 && emptyMessage ? (
                  <li className={styles.empty} role="presentation">
                    {emptyMessage}
                  </li>
                ) : null}
              </ul>
            </div>,
            document.body,
          )
        : null}
    </div>
  )
}
