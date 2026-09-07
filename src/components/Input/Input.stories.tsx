import type { Meta, StoryObj } from '@storybook/react-vite'
import React from 'react'

import { Input, type InputProps } from './Input'

const meta = {
  title: 'Components/Input',
  component: Input,
  args: {
    label: 'Project name',
    placeholder: 'e.g. Orion',
    value: '',
    onValueChange: () => {},
  },
  /**
   * The field has no width of its own — it fills whatever it is put in, because layout is the
   * container's job. Every story here is wrapped at a realistic form width; without a wrapper
   * it would stretch across the whole canvas, which says nothing about how it looks in an app.
   *
   * A story that is *about* width opts out with `parameters: { unconstrained: true }` — a
   * story-level decorator would be added to this one, not replace it, and the `max-width`
   * would still cap everything inside.
   */
  decorators: [
    (Story, context) =>
      context.parameters.unconstrained ? (
        <Story />
      ) : (
        <div className="storyForm">
          <Story />
        </div>
      ),
  ],
} satisfies Meta<typeof Input>

export default meta

type Story = StoryObj<typeof meta>

/** Controlled by definition — `value` in, `onValueChange` out. The state lives in the story. */
const ControlledInput = (inputProps: InputProps) => {
  const [currentValue, setCurrentValue] = React.useState(inputProps.value)

  return <Input {...inputProps} value={currentValue} onValueChange={setCurrentValue} />
}

export const Playground: Story = {
  render: (args) => <ControlledInput {...args} />,
}

export const WithHint: Story = {
  args: { hint: 'Visible to everyone in the workspace.' },
  render: (args) => <ControlledInput {...args} />,
}

/**
 * There is no separate `isInvalid` flag: the presence of `errorMessage` is what marks the
 * field invalid, sets `aria-invalid`, replaces the hint, and gives the message `role="alert"`
 * so it is announced when it appears.
 */
export const WithError: Story = {
  args: {
    hint: 'This hint is hidden while an error is showing.',
    errorMessage: 'Project name is required.',
    value: '',
  },
  render: (args) => <ControlledInput {...args} />,
}

export const Disabled: Story = {
  args: {
    disabled: true,
    value: 'Orion',
    hint: 'Set when the project was created and cannot be changed.',
  },
  render: (args) => <ControlledInput {...args} />,
}

/** Any native input attribute passes straight through — `type`, `inputMode`, `min`, `max`. */
export const NativeAttributes: Story = {
  render: (args) => (
    <div className="storyStack" data-gap="tight">
      <ControlledInput {...args} label="Email address" type="email" placeholder="you@example.com" />
      <ControlledInput {...args} label="Seats" type="number" min={1} max={50} placeholder="1" />
    </div>
  ),
}

/**
 * The same field at three container widths.
 *
 * The width comes through a CSS variable rather than an inline declaration — the one use of
 * `style` these standards allow, and the same mechanism `Badge` uses for its `color` prop.
 */
export const ContainerDecidesTheWidth: Story = {
  parameters: { unconstrained: true },
  render: (args) => (
    <div className="storyStack">
      {['14rem', '22rem', '34rem'].map((width) => (
        <div
          key={width}
          className="storyWidth"
          style={{ '--story-width': width } as React.CSSProperties}
        >
          <ControlledInput {...args} label={`Container: ${width}`} />
        </div>
      ))}
    </div>
  ),
}
