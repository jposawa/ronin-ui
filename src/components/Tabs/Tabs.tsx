import clsx from 'clsx'
import React from 'react'

import { RONIN_SCOPE } from '../../constants'
import type { BaseComponent } from '../../types'
import styles from './Tabs.module.css'

export type TabsOrientation = 'horizontal' | 'vertical'

export type TabItem = {
  id: string
  label: React.ReactNode
  content: React.ReactNode
  disabled?: boolean
}

export type TabsProps = BaseComponent & {
  tabs: TabItem[]
  activeTabId: string
  onTabChange: (tabId: string) => void
  orientation?: TabsOrientation
  /** Drops the step-through buttons beside the list. They are shown otherwise. */
  hideArrows?: boolean
  /** Drops the position dots under the panel. They are shown otherwise. */
  hideDots?: boolean
  /** Accessible names for the step buttons. English defaults; the library ships no UI copy. */
  previousLabel?: string
  nextLabel?: string
}

const HORIZONTAL_KEYS = { previous: 'ArrowLeft', next: 'ArrowRight' }
const VERTICAL_KEYS = { previous: 'ArrowUp', next: 'ArrowDown' }

/**
 * Tabs, driven by data rather than by compound children.
 *
 * `<Tabs.List>` / `<Tabs.Tab>` would need a context between the pieces, `React.Children`
 * parsing that fails unhelpfully when someone nests them wrong, and implicit ids. The array
 * gives a typed `id`, no context at all, and matches how tabs are actually built — the one real
 * usage found across these projects generated the compound markup from a map with two `.map()`
 * calls.
 *
 * **Arrows and dots are pointer affordances.** They repeat what the tab list already offers,
 * so they carry `aria-hidden` and are not focusable: a keyboard or screen reader user moves
 * with the arrow keys inside the list, which is the WAI-ARIA tabs pattern, and would otherwise
 * meet the same six tabs announced twice.
 */
export const Tabs = ({
  tabs,
  activeTabId,
  onTabChange,
  orientation = 'horizontal',
  hideArrows = false,
  hideDots = false,
  previousLabel = 'Previous tab',
  nextLabel = 'Next tab',
  className,
  style,
}: TabsProps) => {
  const baseId = React.useId()
  const tabRefs = React.useRef(new Map<string, HTMLButtonElement>())

  const activeIndex = tabs.findIndex((tab) => tab.id === activeTabId)
  const activeTab = tabs[activeIndex]

  const toTabId = (tabId: string) => `${baseId}-tab-${tabId}`
  const toPanelId = (tabId: string) => `${baseId}-panel-${tabId}`

  /** Walks in `step` direction from `fromIndex`, skipping disabled tabs, without wrapping. */
  const findSelectableTab = (fromIndex: number, step: number): TabItem | undefined => {
    for (let index = fromIndex + step; index >= 0 && index < tabs.length; index += step) {
      if (!tabs[index].disabled) {
        return tabs[index]
      }
    }

    return undefined
  }

  const moveToTab = (nextTab: TabItem | undefined) => {
    if (!nextTab) {
      return
    }

    onTabChange(nextTab.id)
    /* Selection follows focus in this pattern, so focus has to follow selection back. */
    tabRefs.current.get(nextTab.id)?.focus()
  }

  const handleTabListKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
    const keys = orientation === 'vertical' ? VERTICAL_KEYS : HORIZONTAL_KEYS
    const selectableTabs = tabs.filter((tab) => !tab.disabled)

    if (event.key === keys.previous) {
      moveToTab(findSelectableTab(activeIndex, -1))
    } else if (event.key === keys.next) {
      moveToTab(findSelectableTab(activeIndex, 1))
    } else if (event.key === 'Home') {
      moveToTab(selectableTabs[0])
    } else if (event.key === 'End') {
      moveToTab(selectableTabs[selectableTabs.length - 1])
    } else {
      return
    }

    event.preventDefault()
  }

  const previousTab = findSelectableTab(activeIndex, -1)
  const nextTab = findSelectableTab(activeIndex, 1)

  return (
    <div
      className={clsx(RONIN_SCOPE, styles.tabs, className)}
      style={style}
      data-orientation={orientation}
    >
      <div className={styles.tabBar}>
        {!hideArrows ? (
          <button
            type="button"
            className={styles.arrow}
            data-direction="previous"
            aria-hidden="true"
            tabIndex={-1}
            aria-label={previousLabel}
            disabled={!previousTab}
            onClick={() => previousTab && onTabChange(previousTab.id)}
          >
            <span className={styles.arrowIcon} />
          </button>
        ) : null}

        <div
          role="tablist"
          className={styles.tabList}
          aria-orientation={orientation}
          onKeyDown={handleTabListKeyDown}
        >
          {tabs.map((tab) => {
            const isActive = tab.id === activeTabId

            return (
              <button
                key={tab.id}
                type="button"
                role="tab"
                id={toTabId(tab.id)}
                className={styles.tab}
                ref={(element) => {
                  if (element) {
                    tabRefs.current.set(tab.id, element)
                  } else {
                    tabRefs.current.delete(tab.id)
                  }
                }}
                aria-selected={isActive}
                aria-controls={toPanelId(tab.id)}
                /* Roving tabindex: one stop for the whole list, not one per tab. */
                tabIndex={isActive ? 0 : -1}
                disabled={tab.disabled}
                onClick={() => onTabChange(tab.id)}
              >
                {tab.label}
              </button>
            )
          })}
        </div>

        {!hideArrows ? (
          <button
            type="button"
            className={styles.arrow}
            data-direction="next"
            aria-hidden="true"
            tabIndex={-1}
            aria-label={nextLabel}
            disabled={!nextTab}
            onClick={() => nextTab && onTabChange(nextTab.id)}
          >
            <span className={styles.arrowIcon} />
          </button>
        ) : null}
      </div>

      {activeTab ? (
        <div
          role="tabpanel"
          id={toPanelId(activeTab.id)}
          className={styles.panel}
          aria-labelledby={toTabId(activeTab.id)}
          /* Focusable so a panel whose content has no controls can still be reached. */
          tabIndex={0}
        >
          {activeTab.content}
        </div>
      ) : null}

      {!hideDots ? (
        <div className={styles.dots} aria-hidden="true">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              type="button"
              className={styles.dot}
              tabIndex={-1}
              disabled={tab.disabled}
              data-active={tab.id === activeTabId ? '' : undefined}
              onClick={() => onTabChange(tab.id)}
            />
          ))}
        </div>
      ) : null}
    </div>
  )
}
