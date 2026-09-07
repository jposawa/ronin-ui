import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'

import { type TabItem,Tabs } from './Tabs'

const TABS: TabItem[] = [
  { id: 'one', label: 'One', content: 'First panel' },
  { id: 'two', label: 'Two', content: 'Second panel' },
  { id: 'three', label: 'Three', content: 'Third panel' },
]

const renderTabs = (overrides: Partial<React.ComponentProps<typeof Tabs>> = {}) => {
  const handleTabChange = vi.fn()

  render(<Tabs tabs={TABS} activeTabId="one" onTabChange={handleTabChange} {...overrides} />)

  return { handleTabChange }
}

describe('Tabs', () => {
  it('wires each tab to its panel', () => {
    renderTabs()

    const selectedTab = screen.getByRole('tab', { selected: true })
    const panel = screen.getByRole('tabpanel')

    expect(selectedTab).toHaveAccessibleName('One')
    expect(selectedTab).toHaveAttribute('aria-controls', panel.id)
    expect(panel).toHaveAttribute('aria-labelledby', selectedTab.id)
    expect(panel).toHaveTextContent('First panel')
  })

  it('renders only the selected panel', () => {
    renderTabs()

    expect(screen.getAllByRole('tabpanel')).toHaveLength(1)
    expect(screen.queryByText('Second panel')).not.toBeInTheDocument()
  })

  /** Roving tabindex: the list is one stop, not one per tab. */
  it('gives the list a single tab stop', () => {
    renderTabs()

    const tabs = screen.getAllByRole('tab')

    expect(tabs[0]).toHaveAttribute('tabindex', '0')
    expect(tabs[1]).toHaveAttribute('tabindex', '-1')
    expect(tabs[2]).toHaveAttribute('tabindex', '-1')
  })

  it('moves with the arrow keys, Home and End', async () => {
    const { handleTabChange } = renderTabs()

    await userEvent.tab()
    expect(screen.getByRole('tab', { name: 'One' })).toHaveFocus()

    await userEvent.keyboard('{ArrowRight}')
    expect(handleTabChange).toHaveBeenLastCalledWith('two')

    await userEvent.keyboard('{End}')
    expect(handleTabChange).toHaveBeenLastCalledWith('three')

    await userEvent.keyboard('{Home}')
    expect(handleTabChange).toHaveBeenLastCalledWith('one')
  })

  it('does not wrap past either end', async () => {
    const { handleTabChange } = renderTabs()

    await userEvent.tab()
    await userEvent.keyboard('{ArrowLeft}')

    expect(handleTabChange).not.toHaveBeenCalled()
  })

  it('skips a disabled tab', async () => {
    const { handleTabChange } = renderTabs({
      tabs: TABS.map((tab) => (tab.id === 'two' ? { ...tab, disabled: true } : tab)),
    })

    await userEvent.tab()
    await userEvent.keyboard('{ArrowRight}')

    expect(handleTabChange).toHaveBeenLastCalledWith('three')
  })

  it('selects on click', async () => {
    const { handleTabChange } = renderTabs()

    await userEvent.click(screen.getByRole('tab', { name: 'Three' }))

    expect(handleTabChange).toHaveBeenCalledWith('three')
  })

  /**
   * Arrows and dots repeat what the tab list already offers. Exposing them would announce the
   * same three tabs twice and add tab stops around a pattern that is navigated with arrow keys.
   */
  it('keeps the arrows and dots out of the accessibility tree', () => {
    /* Rendered — the flags are off — but still not exposed. */
    renderTabs()

    /* Three tabs and nothing else — no step buttons, no dots. `queryAll` rather than
     * `getAll`, which throws instead of returning an empty list. */
    expect(screen.queryAllByRole('button')).toHaveLength(0)
    expect(screen.getAllByRole('tab')).toHaveLength(3)
  })

  it('reports the orientation it is navigated in', () => {
    renderTabs({ orientation: 'vertical' })

    expect(screen.getByRole('tablist')).toHaveAttribute('aria-orientation', 'vertical')
  })
})
