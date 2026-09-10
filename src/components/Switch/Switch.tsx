import clsx from 'clsx'
import React from 'react'

import { RONIN_SCOPE } from '../../constants'
import type { BaseComponent } from '../../types'
import styles from './Switch.module.css'

export type SwitchLabelPosition = 'start' | 'end'

export type SwitchProps = BaseComponent & {
  label: React.ReactNode
  isChecked: boolean
  onToggle: () => void
  /** Helper text under the row, linked through `aria-describedby`. */
  hint?: string
  /**
   * Where the label sits relative to the track. `end` is the default and reads like a checkbox
   * row; `start` is the settings row — label first, track pushed to the far edge, and the
   * control spans its container because that arrangement only means anything full width.
   */
  labelPosition?: SwitchLabelPosition
  disabled?: boolean
  id?: string
}

/**
 * An on/off control whose change takes effect immediately — a preference, a filter, a mode.
 *
 * A `<button role="switch">` with `aria-checked`, the same shape as `Chip`: the state lives on
 * the attribute a screen reader already reads, so the styling and the announcement cannot
 * disagree. Enter and Space come from the native element.
 *
 * **Not a checkbox.** A checkbox means "this will be submitted with the form" and brings `name`,
 * `required` and an indeterminate state with it; a switch means "this is on now". When the value
 * belongs to a form rather than to the moment, a checkbox is the right control and this is not
 * it.
 *
 * `labelPosition` is the one layout prop, because the alternative is worse: `className` lands on
 * the wrapper that holds the row and the hint, so flipping the row from outside would mean a
 * consumer writing a descendant rule into the component's own markup.
 */
export const Switch = ({
  label,
  isChecked,
  onToggle,
  hint,
  labelPosition = 'end',
  disabled = false,
  id,
  className,
  style,
}: SwitchProps) => {
  const generatedId = React.useId()
  const baseId = id ?? generatedId
  const hintId = `${baseId}-hint`

  return (
    <div className={clsx(RONIN_SCOPE, styles.field, className)} style={style}>
      <button
        type="button"
        role="switch"
        id={baseId}
        className={styles.switch}
        data-label-position={labelPosition}
        aria-checked={isChecked}
        aria-describedby={hint ? hintId : undefined}
        disabled={disabled}
        onClick={onToggle}
      >
        <span className={styles.track} aria-hidden="true">
          <span className={styles.thumb} />
        </span>
        <span className={styles.label}>{label}</span>
      </button>

      {hint ? (
        <span id={hintId} className={styles.hint}>
          {hint}
        </span>
      ) : null}
    </div>
  )
}
