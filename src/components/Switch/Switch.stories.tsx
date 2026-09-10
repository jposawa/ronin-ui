import type { Meta, StoryObj } from '@storybook/react-vite'
import React from 'react'

import { Switch, type SwitchProps } from './Switch'

const meta = {
  title: 'Components/Switch',
  component: Switch,
  args: {
    label: 'Email notifications',
    isChecked: false,
    onToggle: () => {},
  },
  decorators: [
    (Story) => (
      <div className="storyForm">
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof Switch>

export default meta

type Story = StoryObj<typeof meta>

/** Controlled — `isChecked` in, `onToggle` out. The state lives in the story. */
const ControlledSwitch = (switchProps: SwitchProps) => {
  const [isChecked, setIsChecked] = React.useState(switchProps.isChecked)

  return <Switch {...switchProps} isChecked={isChecked} onToggle={() => setIsChecked(!isChecked)} />
}

/**
 * A `<button role="switch">` with `aria-checked` — the state lives on the attribute a screen
 * reader already reads, so the styling and the announcement cannot disagree. Enter and Space
 * come from the native element.
 */
export const Playground: Story = {
  render: (args) => <ControlledSwitch {...args} />,
}

export const WithHint: Story = {
  args: {
    isChecked: true,
    hint: 'Sent once a day at most, and never for your own changes.',
  },
  render: (args) => <ControlledSwitch {...args} />,
}

/**
 * `labelPosition="start"` is the settings row: the label takes the row and the track sits at the
 * far edge. It is the one arrangement the component owns, because `className` lands on the
 * wrapper rather than on the row itself.
 */
export const SettingsRows: Story = {
  render: (args) => (
    <div className="storyStack">
      <ControlledSwitch {...args} labelPosition="start" label="Email notifications" />
      <ControlledSwitch {...args} labelPosition="start" label="Weekly summary" isChecked />
      <ControlledSwitch
        {...args}
        labelPosition="start"
        label="Mentions only"
        hint="Applies to every project you follow."
      />
    </div>
  ),
}

/**
 * A switch takes effect the moment it is flipped. A value that should travel with a form is a
 * checkbox instead — a different control, not a variant of this one.
 */
export const Disabled: Story = {
  render: (args) => (
    <div className="storyStack">
      <ControlledSwitch {...args} disabled label="Off and locked" />
      <ControlledSwitch
        {...args}
        disabled
        isChecked
        label="On and locked"
        hint="Set by the workspace owner."
      />
    </div>
  ),
}

/**
 * The track is sized in `em`, so it scales with whatever font size surrounds it — a library
 * control lands in text contexts it cannot predict.
 */
export const FollowsTheSurroundingText: Story = {
  parameters: { unconstrained: true },
  render: (args) => (
    <div className="storyStack">
      {['0.875rem', '1rem', '1.5rem'].map((fontSize) => (
        <div
          key={fontSize}
          className="storyFontSize"
          style={{ '--story-font-size': fontSize } as React.CSSProperties}
        >
          <ControlledSwitch {...args} label={`Email notifications (${fontSize})`} />
        </div>
      ))}
    </div>
  ),
}
