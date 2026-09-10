import clsx from 'clsx'
import React from 'react'

import { RONIN_SCOPE } from '../../constants'
import { FieldMessage, type FieldMessageCopy } from '../../internal'
import type { BaseComponent } from '../../types'
import styles from './Input.module.css'

export type InputProps = BaseComponent &
  FieldMessageCopy &
  Omit<React.InputHTMLAttributes<HTMLInputElement>, 'value' | 'onChange'> & {
    value: string
    onValueChange: (value: string) => void
    label?: string
  }

/**
 * A controlled text field with its label, hint and error message wired together — the label is
 * associated by a generated id, and the message is announced through `aria-describedby`.
 *
 * There is no `isInvalid` flag: passing `errorMessage` is what marks the field invalid, sets
 * `aria-invalid` and replaces the hint. One source of truth instead of two that can disagree.
 *
 * It fills the width of its container and sets none of its own — where it sits and how wide it
 * gets is the container's decision.
 */
export const Input = ({
  value,
  onValueChange,
  label,
  hint,
  errorMessage,
  id,
  className,
  style,
  ...inputProps
}: InputProps) => {
  const generatedId = React.useId()
  const inputId = id ?? generatedId
  const messageId = `${inputId}-message`

  const isInvalid = Boolean(errorMessage)
  const message = errorMessage ?? hint

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    onValueChange(event.target.value)
  }

  return (
    <div className={clsx(RONIN_SCOPE, styles.field, className)} style={style}>
      {label ? (
        <label className={styles.label} htmlFor={inputId}>
          {label}
        </label>
      ) : null}

      {/**
       * The invalid state is read off `aria-invalid` in CSS rather than a parallel class, so
       * the styling and the announcement cannot drift apart.
       */}
      <input
        {...inputProps}
        id={inputId}
        className={styles.input}
        value={value}
        onChange={handleInputChange}
        aria-invalid={isInvalid || undefined}
        aria-describedby={message ? messageId : undefined}
      />

      {/**
       * A `<span>`, not `<small>`: `<small>` means fine print or a side comment, which a
       * validation error is not.
       *
       * `role="alert"` only while invalid, so an error that appears after the field has been
       * left is announced rather than sitting silently until the field is focused again.
       *
       * Both rules live in `FieldMessage` now, shared with the select fields and `Checkbox`.
       */}
      <FieldMessage id={messageId} hint={hint} errorMessage={errorMessage} />
    </div>
  )
}
