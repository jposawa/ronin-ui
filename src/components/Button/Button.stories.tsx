import type { Meta, StoryObj } from '@storybook/react-vite'
import React from 'react'

import { Button, type ButtonIntent, type ButtonProps, type ButtonVariant } from './Button'

const INTENTS: ButtonIntent[] = [
  'primary',
  'secondary',
  'danger',
  'warning',
  'success',
  'neutral',
]

const VARIANTS: ButtonVariant[] = ['filled', 'outline', 'text']

const meta = {
  title: 'Components/Button',
  component: Button,
  args: {
    children: 'Save changes',
    intent: 'primary',
    variant: 'filled',
    isFullWidth: false,
    disabled: false,
  },
  argTypes: {
    intent: { control: 'select', options: INTENTS },
    variant: { control: 'select', options: VARIANTS },
  },
} satisfies Meta<typeof Button>

export default meta

type Story = StoryObj<typeof meta>

export const Playground: Story = {}

/** The two axes are orthogonal: every intent works under every variant. */
export const IntentByVariant: Story = {
  render: (args) => (
    <div className="storyStack" data-gap="loose">
      {VARIANTS.map((variant) => (
        <div key={variant} className="storyStack" data-gap="tight">
          <small className="storyCaption">{variant}</small>
          <div className="storyRow">
            {INTENTS.map((intent) => (
              <Button key={intent} {...args} intent={intent} variant={variant}>
                {intent}
              </Button>
            ))}
          </div>
        </div>
      ))}
    </div>
  ),
}

/**
 * The point of this one is behaviour, not looks: every press appends a line, so it is visible
 * that `onClick` fired — including from the keyboard, where Enter and Space must both work.
 *
 * Nothing here is library behaviour. `Button` forwards `onClick` to the native element and
 * nothing else; the log lives in the story.
 */
const ClickLog = (buttonProps: ButtonProps) => {
  const [pressLog, setPressLog] = React.useState<string[]>([])
  const pressCountRef = React.useRef(0)

  const handleButtonPress = (pressedLabel: string) => {
    pressCountRef.current += 1
    const logLine = `#${pressCountRef.current} ${new Date().toLocaleTimeString()} — ${pressedLabel}`
    setPressLog((previousLog) => [logLine, ...previousLog].slice(0, 6))
  }

  const handleClearPress = () => {
    pressCountRef.current = 0
    setPressLog([])
  }

  return (
    <div className="storyStack storyPage">
      <div className="storyRow">
        {VARIANTS.map((variant) => (
          <Button
            key={variant}
            {...buttonProps}
            variant={variant}
            onClick={() => handleButtonPress(`variant="${variant}"`)}
          >
            {variant}
          </Button>
        ))}
        <Button
          {...buttonProps}
          intent="neutral"
          variant="text"
          disabled={pressLog.length === 0}
          onClick={handleClearPress}
        >
          clear
        </Button>
      </div>

      <output className="storyLog">
        {pressLog.length === 0 ? (
          <span className="storyCaption">
            no clicks yet — press a button, or Tab to one and use Enter/Space
          </span>
        ) : (
          pressLog.map((logLine) => <div key={logLine}>{logLine}</div>)
        )}
      </output>
    </div>
  )
}

export const ClickBehaviour: Story = {
  render: (args) => <ClickLog {...args} />,
}

/** `variant="text"` has to sit on the surrounding baseline and inherit the copy's font. */
export const TextInsideCopy: Story = {
  args: { variant: 'text' },
  render: (args) => (
    <p className="storyProse">
      Your trial ends in three days. You can <Button {...args}>upgrade your plan</Button> to keep
      every feature, or{' '}
      <Button {...args} intent="danger">
        close your account
      </Button>{' '}
      and export the data first.
    </p>
  ),
}

/** The container decides the width — `isFullWidth` only opts into filling it. */
export const FullWidth: Story = {
  args: { isFullWidth: true },
  render: (args) => (
    <div className="storyStack storyForm" data-gap="tight">
      <Button {...args}>Confirm</Button>
      <Button {...args} intent="neutral" variant="outline">
        Cancel
      </Button>
    </div>
  ),
}

export const Disabled: Story = {
  args: { disabled: true },
  render: (args) => (
    <div className="storyRow">
      {VARIANTS.map((variant) => (
        <Button key={variant} {...args} variant={variant}>
          {variant}
        </Button>
      ))}
    </div>
  ),
}
