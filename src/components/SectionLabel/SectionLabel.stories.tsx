import type { Meta, StoryObj } from '@storybook/react-vite'
import React from 'react'

import { Badge } from '../Badge'
import { SectionLabel } from './SectionLabel'

const meta = {
  title: 'Components/SectionLabel',
  component: SectionLabel,
  args: {
    children: 'Notifications',
  },
  argTypes: {
    as: { control: 'inline-radio', options: [undefined, 'h2', 'h3', 'h4', 'h5', 'h6'] },
  },
  decorators: [
    (Story) => (
      <div className="storyPage">
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof SectionLabel>

export default meta

type Story = StoryObj<typeof meta>

/**
 * The label on its own. Most of the time you want `Section`, which pairs this with content —
 * this component is exported for the cases where the wrapper is yours: a card header, a
 * toolbar, a column heading inside a grid you already control.
 */
export const Playground: Story = {}

/**
 * `as` renders the label as a real heading, which puts it in the document outline.
 * Omitted, it renders a `<span>` — the right call when the section already has a heading,
 * because a wrong level in the outline is worse than no heading at all.
 */
export const AsHeading: Story = {
  render: (args) => (
    <div className="storyStack">
      <SectionLabel {...args}>
        <h2>Account</h2>
      </SectionLabel>
      <SectionLabel {...args}>
        <h3>Email preferences</h3>
      </SectionLabel>
      <SectionLabel {...args}>Plain text — no heading</SectionLabel>
    </div>
  ),
}

/** `detail` sits at the end of the line — usually a count, sometimes a status. */
export const WithDetail: Story = {
  render: (args) => (
    <div className="storyStack">
      <SectionLabel {...args} detail="12" />
      <SectionLabel {...args} detail="3/8">
        Onboarding steps
      </SectionLabel>
      <SectionLabel {...args} detail={<Badge intent="warning">3 unread</Badge>}>
        Team members
      </SectionLabel>
    </div>
  ),
}

/**
 * It draws no divider line and takes no outer margin. A rule is decoration with a look of its
 * own, and spacing belongs to the container — both are compositions the consumer makes.
 *
 * The widths come through a CSS variable, the one use of inline `style` these standards allow.
 */
export const AtDifferentWidths: Story = {
  render: (args) => (
    <div className="storyStack">
      {['16rem', '24rem', '30rem'].map((width) => (
        <div
          key={width}
          className="storyWidth"
          style={{ '--story-width': width } as React.CSSProperties}
        >
          <SectionLabel {...args} detail="12" />
        </div>
      ))}
    </div>
  ),
}
