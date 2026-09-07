import type { Meta, StoryObj } from '@storybook/react-vite'

import { Avatar, type AvatarSize } from './Avatar'

const SIZES: AvatarSize[] = ['sm', 'md', 'lg']

const meta = {
  title: 'Components/Avatar',
  component: Avatar,
  args: {
    name: 'Ada Lovelace',
    size: 'md',
  },
  argTypes: {
    size: { control: 'inline-radio', options: SIZES },
  },
} satisfies Meta<typeof Avatar>

export default meta

type Story = StoryObj<typeof meta>

export const Playground: Story = {}

/** Each size sets the circle and its type together, so the initials scale with the box. */
export const Sizes: Story = {
  render: (args) => (
    <div className="storyRow">
      {SIZES.map((size) => (
        <Avatar key={size} {...args} size={size} />
      ))}
    </div>
  ),
}

/**
 * Initials come from the first and last word, so "Grace Brewster Hopper" gives "GH". A
 * single-word name gives one letter, and an empty one falls back to a question mark rather
 * than rendering an empty circle.
 *
 * The accessible name lives on the root as `role="img"` plus `aria-label`, so it reads the
 * same whether the image loaded or the initials are showing.
 */
export const InitialsFallback: Story = {
  render: (args) => (
    <div className="storyRow">
      <Avatar {...args} name="Grace Brewster Hopper" />
      <Avatar {...args} name="Ada Lovelace" />
      <Avatar {...args} name="alan" />
      <Avatar {...args} name="" />
    </div>
  ),
}

/** A broken URL falls back to the initials instead of showing a torn image icon. */
export const BrokenImage: Story = {
  args: { imageUrl: 'https://example.invalid/missing.png' },
}

/** How it usually lands: an avatar next to the name it belongs to. */
export const InsideAListRow: Story = {
  render: (args) => (
    <div className="storyStack storyPage" data-gap="tight">
      {['Ada Lovelace', 'Grace Hopper', 'Alan Turing'].map((memberName) => (
        <div key={memberName} className="storyRow" data-gap="tight">
          <Avatar {...args} size="sm" name={memberName} />
          <span className="storyItem">{memberName}</span>
        </div>
      ))}
    </div>
  ),
}
