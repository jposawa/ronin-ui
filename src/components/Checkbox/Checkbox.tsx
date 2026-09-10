import clsx from 'clsx'
import React from 'react'

import { RONIN_SCOPE } from '../../constants'
import { FieldMessage, type FieldMessageCopy } from '../../internal'
import type { BaseComponent } from '../../types'
import styles from './Checkbox.module.css'

export type CheckboxProps = BaseComponent &
  FieldMessageCopy &
  Omit<React.InputHTMLAttributes<HTMLInputElement>, 'checked' | 'onChange' | 'type'> & {
    label: React.ReactNode
    checked: boolean
    onCheckedChange: (checked: boolean) => void
    /**
     * Neither checked nor unchecked — the "some of the children are selected" state of a parent
     * box. It is a DOM property with no HTML attribute, so it can only be set from script, which
     * is why hand-rolled checkboxes almost never have it.
     */
    indeterminate?: boolean
  }

/**
 * A real `<input type="checkbox">` with its label beside it, restyled rather than rebuilt.
 *
 * **Not a mode of `Input`.** `Input` is `value: string` with the label above the field; this is
 * a boolean with the label next to a box, and it has an indeterminate state that a text field
 * has no meaning for. A prop switching between them would change the rendered element and the
 * accessibility tree at once — the mistake `Badge` and `Chip` were kept apart to avoid.
 *
 * **Not a `Switch` either.** A checkbox means "this will be submitted with the form" and brings
 * `name`, `value`, `required` and form participation; a switch means "this is on now". The
 * native element is kept precisely for that half, so `name`, `required` and `form` pass straight
 * through and `FormData` sees it.
 *
 * The box is drawn with `appearance: none` on the input itself rather than hidden behind a
 * decorated `<span>`. The element that is styled stays the element that is focused, validated
 * and announced, so nothing can drift between what is seen and what is read out.
 */
export const Checkbox = ({
  label,
  checked,
  onCheckedChange,
  indeterminate = false,
  hint,
  errorMessage,
  id,
  className,
  style,
  ...inputProps
}: CheckboxProps) => {
  const generatedId = React.useId()
  const inputId = id ?? generatedId
  const messageId = `${inputId}-message`
  const inputRef = React.useRef<HTMLInputElement>(null)

  const isInvalid = Boolean(errorMessage)
  const hasMessage = Boolean(errorMessage ?? hint)

  /* `indeterminate` exists only as a DOM property — there is no attribute React could set. */
  React.useEffect(() => {
    if (inputRef.current) {
      inputRef.current.indeterminate = indeterminate
    }
  }, [indeterminate])

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    onCheckedChange(event.target.checked)
  }

  return (
    <div className={clsx(RONIN_SCOPE, styles.field, className)} style={style}>
      <div className={styles.row}>
        <input
          {...inputProps}
          ref={inputRef}
          type="checkbox"
          id={inputId}
          className={styles.input}
          checked={checked}
          aria-invalid={isInvalid || undefined}
          aria-describedby={hasMessage ? messageId : undefined}
          onChange={handleInputChange}
        />

        {/* A real `<label>`: the input is labelable, so clicking the text toggles the box. */}
        <label className={styles.label} htmlFor={inputId}>
          {label}
        </label>
      </div>

      <FieldMessage id={messageId} hint={hint} errorMessage={errorMessage} />
    </div>
  )
}
