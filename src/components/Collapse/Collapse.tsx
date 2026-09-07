import clsx from 'clsx'
import React from 'react'

import { RONIN_SCOPE } from '../../constants'
import { isHeadingElement } from '../../helpers'
import type { BaseComponent } from '../../types'
import styles from './Collapse.module.css'

export type CollapseProps = BaseComponent & {
  /**
   * The trigger's label, or a heading element wrapping it.
   *
   * Pass a heading — `title={<h3>Advanced</h3>}` — and it is **hoisted** to wrap the trigger,
   * which is where the accordion pattern puts it and the only place it works: `<button>`
   * accepts phrasing content only, so a heading rendered inside it would be invalid markup and
   * would be flattened into the button's accessible name, losing the role it was written for.
   *
   * Plain text renders no heading, which is right when the collapse is a control inside a
   * section that already has one.
   */
  title: React.ReactNode
  children: React.ReactNode
  isOpen: boolean
  onToggle: () => void
  /**
   * Secondary content inside the trigger — a count, a `Badge`, an icon. It becomes part of the
   * trigger's accessible name, which is usually what you want for a status.
   *
   * Anything interactive goes in `actions` instead: a `<button>` cannot contain another.
   */
  detail?: React.ReactNode
  /**
   * Arbitrary content beside the trigger, rendered as its sibling rather than inside it — so
   * buttons, links and menus are all fair game.
   *
   * This is the answer to "the trigger is a `<button>`, so what can I put in the header?".
   * Making the whole header clickable would not help: a `role="button"` container is barred
   * from holding focusable children by the same rule, and would give up everything the native
   * element does for free.
   */
  actions?: React.ReactNode
  disabled?: boolean
}

/**
 * A disclosure: a trigger that shows and hides one region.
 *
 * Built as a button with `aria-expanded` and `aria-controls` rather than `<details>` /
 * `<summary>`. `<details>` owns its own open state and toggles before React hears about it, so
 * a controlled version fights the element every render. The cost of not using it is find-in-page:
 * a browser can reveal collapsed `<details>` content when searching, and cannot do that here.
 *
 * The hand-rolled version this replaces (`ficha-pet`) had the button and the conditional body
 * but neither `aria-expanded` nor `aria-controls` — so nothing announced that the control
 * expanded anything, or what.
 */
export const Collapse = ({
  title,
  children,
  isOpen,
  onToggle,
  detail,
  actions,
  disabled = false,
  className,
  style,
}: CollapseProps) => {
  const baseId = React.useId()
  const triggerId = `${baseId}-trigger`
  const regionId = `${baseId}-region`

  const heading = isHeadingElement(title) ? title : undefined

  /* Hoisted: the heading wraps the trigger, and its children become the trigger's label. */
  const HeadingElement = heading?.type ?? 'div'
  const triggerLabel = heading?.props?.children ?? title

  return (
    <div className={clsx(RONIN_SCOPE, styles.collapse, className)} style={style}>
      <div className={styles.header}>
        <HeadingElement
          {...heading?.props}
          className={clsx(styles.heading, heading?.props.className)}
        >
          <button
            type="button"
            id={triggerId}
            className={styles.trigger}
            aria-expanded={isOpen}
            aria-controls={regionId}
            disabled={disabled}
            onClick={onToggle}
          >
            <span className={styles.title}>{triggerLabel}</span>
            {detail ? <span className={styles.detail}>{detail}</span> : null}
            <span className={styles.icon} aria-hidden="true" />
          </button>
        </HeadingElement>

        {actions ? <div className={styles.actions}>{actions}</div> : null}
      </div>

      {/* Stays in the DOM so `aria-controls` always points at something real. */}
      <div id={regionId} className={styles.region} role="region" aria-labelledby={triggerId} hidden={!isOpen}>
        <div className={styles.body}>{children}</div>
      </div>
    </div>
  )
}
