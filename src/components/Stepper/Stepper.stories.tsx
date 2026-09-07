import type { Meta, StoryObj } from '@storybook/react-vite'
import React from 'react'

import { Section } from '../Section'
import { Stepper, type StepperProps } from './Stepper'

const meta = {
  title: 'Components/Stepper',
  component: Stepper,
  args: {
    value: 3,
    label: 'quantity',
    onDecrease: () => {},
    onIncrease: () => {},
  },
} satisfies Meta<typeof Stepper>

export default meta

type Story = StoryObj<typeof meta>

/** Bounds live in the consumer: the component only reflects `canDecrease` / `canIncrease`. */
const BoundedStepper = ({
  minimum = 0,
  maximum = 9,
  ...stepperProps
}: StepperProps & { minimum?: number; maximum?: number }) => {
  const [currentValue, setCurrentValue] = React.useState(Number(stepperProps.value) || 0)

  return (
    <Stepper
      {...stepperProps}
      value={currentValue}
      canDecrease={currentValue > minimum}
      canIncrease={currentValue < maximum}
      onDecrease={() => setCurrentValue((previousValue) => previousValue - 1)}
      onIncrease={() => setCurrentValue((previousValue) => previousValue + 1)}
    />
  )
}

/** The signs are drawn in CSS, not typed as glyphs, so they centre in any typeface. */
export const Playground: Story = {
  render: (args) => <BoundedStepper {...args} />,
}

/**
 * Accessible names default to English (`Decrease quantity`) because the library ships no UI
 * copy. A consumer writing in another language passes its own — this story does.
 */
export const TranslatedLabels: Story = {
  args: {
    label: 'quantidade',
    decreaseLabel: 'Diminuir quantidade',
    increaseLabel: 'Aumentar quantidade',
  },
  render: (args) => <BoundedStepper {...args} />,
}

/** At a bound the button is `disabled` — not hidden, so the control does not change size. */
export const AtBounds: Story = {
  render: (args) => (
    <div className="storyRow">
      <BoundedStepper {...args} value={0} />
      <BoundedStepper {...args} value={9} />
    </div>
  ),
}

/** How it usually lands: a labelled row of counters. */
export const InsideASection: Story = {
  render: (args) => (
    <div className="storyPage">
      <Section title="Booking" headingLevel={3}>
        <div className="storyRow">
          <BoundedStepper {...args} label="adults" value={2} minimum={1} />
          <BoundedStepper {...args} label="children" value={0} />
          <BoundedStepper {...args} label="rooms" value={1} minimum={1} maximum={4} />
        </div>
      </Section>
    </div>
  ),
}
