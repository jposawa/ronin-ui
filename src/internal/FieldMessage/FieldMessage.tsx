import clsx from 'clsx'

import styles from './FieldMessage.module.css'

/**
 * The two props every field with a message accepts, declared once.
 *
 * They travel together because they are one mechanism, not two: `errorMessage` replaces `hint`
 * and marks the field invalid. Four components declared them separately before this, with the
 * rule repeated in four doc comments — so changing the contract meant finding all four, and
 * missing one would have left a field whose docs disagreed with its behaviour.
 */
export type FieldMessageCopy = {
  /** Helper text under the field. Hidden while `errorMessage` is showing. */
  hint?: string
  /** Presence of a message is what marks the field invalid — there is no separate flag. */
  errorMessage?: string
}

export type FieldMessageProps = FieldMessageCopy & {
  /** The id `aria-describedby` on the field points at. */
  id: string
  className?: string
}

/**
 * The hint-or-error line under a form field.
 *
 * Internal, and extracted at the third copy: `Input`, `Select` / `MultiSelect` and `Checkbox`
 * all carry the same rule — **the presence of `errorMessage` is what marks the field invalid**,
 * it replaces the hint, and it is announced through `role="alert"` so a message that appears
 * after the field was left is read out instead of waiting for focus to come back.
 *
 * That rule is subtle enough to drift, and drifting is silent: nobody notices an error that
 * stopped being announced. One implementation, one behaviour.
 *
 * A `<span>`, never `<small>` — `<small>` means fine print or a side comment, which a
 * validation failure is not.
 *
 * What it deliberately does **not** own is `aria-invalid` and `aria-describedby`. Both belong on
 * the field element itself, which this component cannot reach, so each field wires them from
 * the same two values it passes here.
 */
export const FieldMessage = ({ id, hint, errorMessage, className }: FieldMessageProps) => {
  const isInvalid = Boolean(errorMessage)
  const message = errorMessage ?? hint

  if (!message) {
    return null
  }

  return (
    <span
      id={id}
      className={clsx(styles.message, className)}
      data-tone={isInvalid ? 'error' : 'hint'}
      role={isInvalid ? 'alert' : undefined}
    >
      {message}
    </span>
  )
}
