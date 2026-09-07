import type { Meta, StoryObj } from '@storybook/react-vite'
import React from 'react'

import { Chip, type ChipIntent, type ChipProps } from './Chip'

const INTENTS: ChipIntent[] = [
  'primary',
  'secondary',
  'danger',
  'warning',
  'success',
  'neutral',
]

const TAGS = ['Design', 'Engineering', 'Marketing', 'Research', 'Support', 'Sales'] as const

const meta = {
  title: 'Components/Chip',
  component: Chip,
  args: {
    label: 'Design',
    isActive: false,
    intent: 'primary',
    onToggle: () => {},
  },
  argTypes: {
    intent: { control: 'select', options: INTENTS },
  },
} satisfies Meta<typeof Chip>

export default meta

type Story = StoryObj<typeof meta>

export const Playground: Story = {}

/**
 * The real use: a filter row. Each chip is a `<button>` carrying `aria-pressed`, which is what
 * separates it from `Badge` — a screen reader announces it as a toggle, not as a label. The
 * pressed styling is read off that same attribute, so the two cannot drift apart.
 */
const ChipFilterRow = (chipProps: ChipProps) => {
  const [activeTags, setActiveTags] = React.useState<string[]>(['Engineering'])

  const handleTagToggle = (tag: string) => {
    setActiveTags((previousTags) =>
      previousTags.includes(tag)
        ? previousTags.filter((activeTag) => activeTag !== tag)
        : [...previousTags, tag],
    )
  }

  return (
    <div className="storyStack storyPage">
      <div className="storyRow" data-gap="tight">
        {TAGS.map((tag) => (
          <Chip
            key={tag}
            {...chipProps}
            label={tag}
            isActive={activeTags.includes(tag)}
            onToggle={() => handleTagToggle(tag)}
          />
        ))}
      </div>
      <small className="storyCaption">
        active: {activeTags.length > 0 ? activeTags.join(', ') : 'none'}
      </small>
    </div>
  )
}

export const FilterRow: Story = {
  render: (args) => <ChipFilterRow {...args} />,
}

export const Intents: Story = {
  render: (args) => (
    <div className="storyRow" data-gap="tight">
      {INTENTS.map((intent) => (
        <Chip key={intent} {...args} label={intent} intent={intent} isActive />
      ))}
    </div>
  ),
}

/** Pressed and unpressed side by side — the state must survive greyscale, not rest on hue. */
export const PressedAndUnpressed: Story = {
  render: (args) => (
    <div className="storyRow" data-gap="tight">
      <Chip {...args} label="off" isActive={false} />
      <Chip {...args} label="on" isActive />
    </div>
  ),
}

export const Disabled: Story = {
  args: { isDisabled: true },
  render: (args) => (
    <div className="storyRow" data-gap="tight">
      <Chip {...args} label="off" isActive={false} />
      <Chip {...args} label="on" isActive />
    </div>
  ),
}
