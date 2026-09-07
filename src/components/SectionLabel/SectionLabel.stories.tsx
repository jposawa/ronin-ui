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
    headingLevel: { control: 'inline-radio', options: [undefined, 2, 3, 4, 5, 6] },
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
 * `headingLevel` renders a real `<h2>`…`<h6>` and puts the label in the document outline.
 * Omitted, it renders a `<span>` — the right call when the section already has a heading,
 * because a wrong level in the outline is worse than no heading at all.
 */
export const AsHeading: Story = {
  args: { headingLevel: 2 },
  render: (args) => (
    <div className="storyStack">
      <SectionLabel {...args}>Account</SectionLabel>
      <SectionLabel {...args} headingLevel={3}>
        Email preferences
      </SectionLabel>
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
