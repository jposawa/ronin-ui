import type { Meta, StoryObj } from '@storybook/react-vite'
import React from 'react'

import { Button } from '../Button'
import { Checkbox } from '../Checkbox'
import { Input } from '../Input'
import { Tooltip } from '../Tooltip'
import { Popover, type PopoverProps } from './Popover'

const meta = {
  title: 'Components/Popover',
  component: Popover,
  args: {
    title: 'Share project',
    isOpen: false,
    onClose: () => {},
    trigger: <Button>Share</Button>,
    children: null,
  },
} satisfies Meta<typeof Popover>

export default meta

type Story = StoryObj<typeof meta>

type ControlledPopoverProps = Omit<PopoverProps, 'isOpen' | 'onClose' | 'trigger'> & {
  triggerLabel: string
}

/**
 * The open state belongs to the consumer, as it does for `Modal` and `Drawer` — `isOpen` in,
 * `onClose` out. This wrapper owns it on the story's behalf, the same way `Input`'s stories own
 * the field's value.
 */
const ControlledPopover = ({ triggerLabel, ...popoverProps }: ControlledPopoverProps) => {
  const [isOpen, setIsOpen] = React.useState(false)

  return (
    <Popover
      {...popoverProps}
      isOpen={isOpen}
      onClose={() => setIsOpen(false)}
      trigger={<Button onClick={() => setIsOpen(!isOpen)}>{triggerLabel}</Button>}
    />
  )
}

export const Playground: Story = {
  render: (args) => (
    <ControlledPopover {...args} triggerLabel="Share">
      <Input
        label="Invite by email"
        placeholder="you@example.com"
        value=""
        onValueChange={() => {}}
      />
      <Checkbox label="Allow editing" checked onCheckedChange={() => {}} />
      <Button>Send invite</Button>
    </ControlledPopover>
  ),
}

/**
 * The distinction worth seeing side by side.
 *
 * A `Tooltip` **describes** its trigger: `role="tooltip"`, opens on hover and focus, and must
 * contain nothing focusable — a button inside one is unreachable by keyboard and by touch.
 *
 * A `Popover` **holds** content: a non-modal `role="dialog"` that opens on a deliberate action
 * and takes focus. Try tabbing through both.
 */
export const NotATooltip: Story = {
  render: (args) => (
    <div className="storyRow">
      <Tooltip content="Copies the URL to your clipboard.">
        <Button variant="outline">Hover me — tooltip</Button>
      </Tooltip>

      <ControlledPopover {...args} title="Copy options" triggerLabel="Click me — popover">
        <Button variant="outline">Copy link</Button>
        <Button variant="outline">Copy embed code</Button>
      </ControlledPopover>
    </div>
  ),
}

/**
 * `hideTitle` keeps the title as the dialog's accessible name and takes it off the screen — for
 * a menu or a picker, where a visible header would be noise.
 *
 * It is not optional copy: a `role="dialog"` with no name is announced as an unnamed dialog,
 * which tells the reader nothing about what just opened.
 */
export const HiddenTitle: Story = {
  render: (args) => (
    <ControlledPopover {...args} hideTitle title="Project actions" triggerLabel="Actions">
      <Button variant="text">Rename</Button>
      <Button variant="text">Duplicate</Button>
      <Button variant="text" intent="danger">
        Delete
      </Button>
    </ControlledPopover>
  ),
}

/** Any floating-ui placement. The panel flips and shifts on its own when the room runs out. */
export const Placements: Story = {
  render: (args) => (
    <div className="storyRow" data-align="center">
      {(['top', 'right', 'bottom', 'left'] as const).map((placement) => (
        <ControlledPopover
          key={placement}
          {...args}
          placement={placement}
          title={`Placed ${placement}`}
          triggerLabel={placement}
        >
          <span className="storyItem">This panel is placed {placement} of its trigger.</span>
        </ControlledPopover>
      ))}
    </div>
  ),
}

/**
 * Portalled and positioned `fixed`, so a clipping ancestor cannot cut the panel off — the same
 * trade `Tooltip` makes, and the reason tabbing forward out of the panel continues from the end
 * of the document rather than from after the trigger.
 */
export const InsideAClippingBox: Story = {
  render: (args) => (
    <div className="storyClip">
      <div className="storyStack">
        <span className="storyCaption">This box clips its overflow. The panel escapes it.</span>

        <ControlledPopover {...args} triggerLabel="Share">
          <span className="storyItem">Anyone with the link can view this project.</span>
          <Button>Copy link</Button>
        </ControlledPopover>

        <span className="storyCaption">Scroll me.</span>
        <span className="storyCaption">Bottom of the box.</span>
      </div>
    </div>
  ),
}
