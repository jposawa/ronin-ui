import type { Meta, StoryObj } from '@storybook/react-vite'
import React from 'react'

import { Input } from '../Input'
import { Section } from '../Section'
import { type TabItem, Tabs, type TabsProps } from './Tabs'

const TABS: TabItem[] = [
  { id: 'general', label: 'General', content: 'Workspace name, description and visibility.' },
  { id: 'members', label: 'Members', content: 'Who can open this workspace, and with what role.' },
  { id: 'billing', label: 'Billing', content: 'Plan, payment method and invoices.' },
  { id: 'audit', label: 'Audit log', content: 'Every change, with who made it and when.' },
  { id: 'danger', label: 'Danger zone', content: 'Transfer ownership or delete the workspace.' },
]

const meta = {
  title: 'Components/Tabs',
  component: Tabs,
  args: {
    tabs: TABS,
    activeTabId: 'general',
    orientation: 'horizontal',
    onTabChange: () => {},
  },
  argTypes: {
    orientation: { control: 'inline-radio', options: ['horizontal', 'vertical'] },
  },
  decorators: [
    (Story) => (
      <div className="storyPage">
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof Tabs>

export default meta

type Story = StoryObj<typeof meta>

/** Selection is the consumer's state, as everything stateful in this library is. */
const ControlledTabs = (tabsProps: TabsProps) => {
  const [activeTabId, setActiveTabId] = React.useState(tabsProps.activeTabId)

  return <Tabs {...tabsProps} activeTabId={activeTabId} onTabChange={setActiveTabId} />
}

/**
 * Worth trying with the keyboard: Tab reaches the list once, then Left/Right move between
 * tabs and Home/End jump to the ends. The arrows and dots do the same thing for the pointer,
 * and are hidden from assistive technology so the same five tabs are not announced twice.
 */
export const Playground: Story = {
  render: (args) => <ControlledTabs {...args} />,
}

export const Vertical: Story = {
  args: { orientation: 'vertical' },
  render: (args) => <ControlledTabs {...args} />,
}

/**
 * Without the extra controls it is a plain tab bar.
 *
 * Both flags default to `false`, so the bare shorthand is the useful direction:
 * `<Tabs hideDots />` rather than `hasDots={false}`.
 */
export const WithoutArrowsOrDots: Story = {
  args: { hideArrows: true, hideDots: true },
  render: (args) => <ControlledTabs {...args} />,
}

/** A disabled tab is skipped by the arrows, the dots and the arrow keys alike. */
export const WithDisabledTab: Story = {
  args: {
    tabs: TABS.map((tab) => (tab.id === 'billing' ? { ...tab, disabled: true } : tab)),
  },
  render: (args) => <ControlledTabs {...args} />,
}

/** Many tabs: the list scrolls rather than wrapping to a second row. */
export const ManyTabs: Story = {
  args: {
    tabs: Array.from({ length: 12 }, (_, index) => ({
      id: `tab-${index}`,
      label: `Section ${index + 1}`,
      content: `Content for section ${index + 1}.`,
    })),
  },
  render: (args) => <ControlledTabs {...args} />,
}

/** The section-ness is composition: put it in a `Section` when it wants a title. */
export const InsideASection: Story = {
  render: (args) => (
    <Section title={<h2>Workspace settings</h2>}>
      <ControlledTabs
        {...args}
        tabs={[
          {
            id: 'general',
            label: 'General',
            content: <Input label="Workspace name" value="Orion" onValueChange={() => {}} />,
          },
          {
            id: 'billing',
            label: 'Billing',
            content: <Input label="Billing email" value="" onValueChange={() => {}} type="email" />,
          },
        ]}
      />
    </Section>
  ),
}
