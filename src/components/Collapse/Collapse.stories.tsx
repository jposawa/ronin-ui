import type { Meta, StoryObj } from '@storybook/react-vite'
import React from 'react'

import { Badge } from '../Badge'
import { Button } from '../Button'
import { Input } from '../Input'
import { Collapse, type CollapseProps } from './Collapse'

const meta = {
  title: 'Components/Collapse',
  component: Collapse,
  args: {
    title: 'Advanced settings',
    children: 'Everything here is optional.',
    isOpen: false,
    onToggle: () => {},
  },
  decorators: [
    (Story) => (
      <div className="storyPage">
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof Collapse>

export default meta

type Story = StoryObj<typeof meta>

const ControlledCollapse = ({ isOpen, ...collapseProps }: CollapseProps) => {
  const [isCurrentlyOpen, setIsCurrentlyOpen] = React.useState(isOpen)

  return (
    <Collapse
      {...collapseProps}
      isOpen={isCurrentlyOpen}
      onToggle={() => setIsCurrentlyOpen((wasOpen) => !wasOpen)}
    />
  )
}

/**
 * The trigger carries `aria-expanded` and `aria-controls`, so it announces both that it
 * expands something and what. The chevron points right while closed and down while open.
 */
export const Playground: Story = {
  render: (args) => <ControlledCollapse {...args} />,
}

export const WithDetail: Story = {
  args: { detail: <Badge intent="warning">2 unset</Badge> },
  render: (args) => (
    <ControlledCollapse {...args}>
      <div className="storyStack" data-gap="tight">
        <Input label="Custom domain" value="" onValueChange={() => {}} />
        <Input label="Support email" value="" onValueChange={() => {}} type="email" />
      </div>
    </ControlledCollapse>
  ),
}

/**
 * Passing a heading as the `title` hoists it to wrap the trigger, which puts the collapse in
 * the document outline. Use it when the collapse titles a block of the page.
 *
 * Plain text — `title="Advanced settings"`, as in every other story here — renders no heading
 * at all, which is right when the collapse is a control inside a section that already has one.
 */
export const AsHeading: Story = {
  args: { title: <h3>Advanced settings</h3>, isOpen: true },
  render: (args) => <ControlledCollapse {...args} />,
}

export const Disabled: Story = {
  args: { disabled: true },
  render: (args) => <ControlledCollapse {...args} />,
}

/**
 * `actions` renders beside the trigger, not inside it, so interactive content is fine there —
 * a `<button>` cannot contain another, and making the whole header clickable would hit the
 * same rule while giving up what the native element does for free.
 *
 * `detail` stays inside the trigger, where it joins the accessible name: this one announces as
 * "Notifications, 3 unset".
 */
export const WithActions: Story = {
  args: {
    title: 'Notifications',
    detail: <Badge intent="warning">3 unset</Badge>,
    actions: (
      <>
        <Button intent="neutral" variant="text" onClick={() => {}}>
          Mute
        </Button>
        <Button intent="danger" variant="text" onClick={() => {}}>
          Clear
        </Button>
      </>
    ),
  },
  render: (args) => (
    <ControlledCollapse {...args}>
      <Input label="Reply-to address" value="" onValueChange={() => {}} type="email" />
    </ControlledCollapse>
  ),
}

const PANELS: { id: string; title: string; detail?: React.ReactNode; content: string }[] = [
  {
    id: 'profile',
    title: 'Profile',
    detail: <Badge intent="success">complete</Badge>,
    content: 'Display name, avatar and pronouns.',
  },
  {
    id: 'notifications',
    title: 'Notifications',
    detail: <Badge intent="warning">3 unset</Badge>,
    content: 'What reaches you, and where.',
  },
  {
    id: 'security',
    title: 'Security',
    detail: '2 devices',
    content: 'Two-factor, sessions and recovery codes.',
  },
]

const GroupedCollapses = () => {
  const [openIds, setOpenIds] = React.useState<string[]>(['profile'])

  const handlePanelToggle = (panelId: string) => {
    setOpenIds((previousIds) =>
      previousIds.includes(panelId)
        ? previousIds.filter((openId) => openId !== panelId)
        : [...previousIds, panelId],
    )
  }

  return (
    <div className="storyStack" data-gap="tight">
      {PANELS.map((panel) => (
        <Collapse
          key={panel.id}
          title={<h3>{panel.title}</h3>}
          detail={panel.detail}
          isOpen={openIds.includes(panel.id)}
          onToggle={() => handlePanelToggle(panel.id)}
        >
          {panel.content}
        </Collapse>
      ))}
    </div>
  )
}

/**
 * There is no `Accordion` component. A group of collapses is a `.map()` over `Collapse`, and a
 * container that owns only a loop does not earn a place in the API — unlike `Tabs`, which owns
 * roving focus and the tab-to-panel wiring a consumer could not reasonably hand-roll.
 *
 * Several panels open at once: the state is the set of open ids. `detail` carries the badges.
 */
export const Grouped: Story = {
  render: () => <GroupedCollapses />,
}

const SingleOpenCollapses = () => {
  const [openId, setOpenId] = React.useState<string | null>('profile')

  return (
    <div className="storyStack" data-gap="tight">
      {PANELS.map((panel) => (
        <Collapse
          key={panel.id}
          title={<h3>{panel.title}</h3>}
          detail={panel.detail}
          isOpen={openId === panel.id}
          onToggle={() => setOpenId(openId === panel.id ? null : panel.id)}
        >
          {panel.content}
        </Collapse>
      ))}
    </div>
  )
}

/**
 * The accordion behaviour — one open at a time — is the single line an `Accordion` component
 * would have added: the state is one id instead of a list, and toggling replaces it.
 */
export const OneOpenAtATime: Story = {
  render: () => <SingleOpenCollapses />,
}
