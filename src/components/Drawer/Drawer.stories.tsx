import type { Meta, StoryObj } from '@storybook/react-vite'
import React from 'react'

import { Button } from '../Button'
import { Input } from '../Input'
import { Drawer, type DrawerProps, type DrawerSide } from './Drawer'

const SIDES: DrawerSide[] = ['start', 'end', 'top', 'bottom']

const meta = {
  title: 'Components/Drawer',
  component: Drawer,
  args: {
    title: 'Filters',
    children: 'Narrow the list without leaving the page.',
    side: 'end',
    isOpen: false,
    onClose: () => {},
  },
  argTypes: {
    side: { control: 'inline-radio', options: SIDES },
  },
} satisfies Meta<typeof Drawer>

export default meta

type Story = StoryObj<typeof meta>

type DrawerTriggerProps = DrawerProps & {
  renderFooter?: (closeDrawer: () => void) => React.ReactNode
  triggerLabel?: string
}

const DrawerTrigger = ({
  children,
  renderFooter,
  triggerLabel = 'Open',
  ...drawerProps
}: DrawerTriggerProps) => {
  const [isOpen, setIsOpen] = React.useState(false)
  const closeDrawer = () => setIsOpen(false)

  return (
    <>
      <Button onClick={() => setIsOpen(true)}>{triggerLabel}</Button>

      <Drawer
        {...drawerProps}
        isOpen={isOpen}
        onClose={closeDrawer}
        footer={renderFooter?.(closeDrawer)}
      >
        {children}
      </Drawer>
    </>
  )
}

/**
 * The same native `<dialog>` as `Modal`, so the same things come free: Tab cannot leave the
 * panel, Escape closes it, and focus returns to the trigger. Only the placement differs.
 */
export const Playground: Story = {
  render: (args) => <DrawerTrigger {...args} />,
}

/** `start` and `end` are logical, so they follow the writing direction rather than the screen. */
export const Sides: Story = {
  render: (args) => (
    <div className="storyRow" data-gap="tight">
      {SIDES.map((side) => (
        <DrawerTrigger key={side} {...args} side={side} triggerLabel={side} title={`Drawer: ${side}`} />
      ))}
    </div>
  ),
}

export const WithFooter: Story = {
  render: (args) => (
    <DrawerTrigger
      {...args}
      triggerLabel="Open filters"
      renderFooter={(closeDrawer) => (
        <>
          <Button intent="neutral" variant="text" onClick={closeDrawer}>
            Reset
          </Button>
          <Button onClick={closeDrawer}>Apply</Button>
        </>
      )}
    >
      <div className="storyStack" data-gap="tight">
        <Input label="Owner" value="" onValueChange={() => {}} />
        <Input label="Updated after" value="" onValueChange={() => {}} type="date" />
      </div>
    </DrawerTrigger>
  ),
}

/** Long content scrolls inside the body; the header and footer stay put. */
export const ScrollingBody: Story = {
  args: { side: 'end', title: 'Activity' },
  render: (args) => (
    <DrawerTrigger {...args} triggerLabel="Open activity">
      <div className="storyStack" data-gap="tight">
        {Array.from({ length: 14 }, (_, index) => (
          <Input key={index} label={`Entry ${index + 1}`} value="" onValueChange={() => {}} />
        ))}
      </div>
    </DrawerTrigger>
  ),
}
