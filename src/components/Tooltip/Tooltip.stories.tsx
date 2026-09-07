import type { Meta, StoryObj } from '@storybook/react-vite'

import { Button } from '../Button'
import { Tooltip, type TooltipPlacement } from './Tooltip'

const PLACEMENTS: TooltipPlacement[] = ['top', 'right', 'bottom', 'left']

const meta = {
  title: 'Components/Tooltip',
  component: Tooltip,
  args: {
    content: 'Copies the current URL to your clipboard.',
    placement: 'top',
    children: (
      <Button intent="neutral" variant="outline">
        Share link
      </Button>
    ),
  },
  argTypes: {
    placement: {
      control: 'select',
      options: ['top', 'right', 'bottom', 'left', 'top-start', 'bottom-end'],
    },
  },
} satisfies Meta<typeof Tooltip>

export default meta

type Story = StoryObj<typeof meta>

/** Hover it, then Tab to it — both must open it. Escape closes it. */
export const Playground: Story = {}

export const Placements: Story = {
  render: (args) => (
    <div className="storyRow" data-align="center">
      {PLACEMENTS.map((placement) => (
        <Tooltip key={placement} {...args} placement={placement}>
          <Button intent="neutral" variant="outline">
            {placement}
          </Button>
        </Tooltip>
      ))}
    </div>
  ),
}

/**
 * The reason floating-ui is here rather than plain CSS. The trigger sits inside a scrolling
 * box with clipped overflow — CSS-only positioning would be cut off by the ancestor, and would
 * run past the edge instead of flipping to the other side.
 */
export const InsideAClippingContainer: Story = {
  render: (args) => (
    <div className="storyClip">
      <div className="storyStack" data-gap="loose">
        <Tooltip {...args} placement="top">
          <Button intent="neutral" variant="outline">
            near the top
          </Button>
        </Tooltip>
        <Tooltip {...args} placement="bottom">
          <Button intent="neutral" variant="outline">
            near the bottom
          </Button>
        </Tooltip>
      </div>
    </div>
  ),
}

/** Wraps at a sane width; long words break rather than pushing the box off screen. */
export const LongContent: Story = {
  args: {
    content:
      'Anyone with this link can view the page, including people outside your organisation. The link stops working once you turn sharing off.',
  },
}

/** A tooltip belongs on a focusable trigger, so keyboard users can reach the description too. */
export const OnDifferentTriggers: Story = {
  render: (args) => (
    <div className="storyRow">
      <Tooltip {...args} content="Saves without closing the editor.">
        <Button>Save</Button>
      </Tooltip>
      <Tooltip {...args} content="Removes the item. This cannot be undone.">
        <Button intent="danger" variant="outline">
          Delete
        </Button>
      </Tooltip>
      <Tooltip {...args} content="Opens the full documentation in a new tab.">
        <Button intent="neutral" variant="text">
          Learn more
        </Button>
      </Tooltip>
    </div>
  ),
}
