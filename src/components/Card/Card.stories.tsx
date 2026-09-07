import type { Meta, StoryObj } from '@storybook/react-vite'

import { Badge } from '../Badge'
import { Button } from '../Button'
import { Input } from '../Input'
import { SectionLabel } from '../SectionLabel'
import { Card, type CardVariant } from './Card'

const VARIANTS: CardVariant[] = ['outlined', 'elevated']

const meta = {
  title: 'Components/Card',
  component: Card,
  args: {
    variant: 'outlined',
    children: 'A card owns its surface and its bands. What goes in the body is yours.',
  },
  argTypes: {
    variant: { control: 'inline-radio', options: VARIANTS },
  },
  decorators: [
    (Story) => (
      <div className="storyPage">
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof Card>

export default meta

type Story = StoryObj<typeof meta>

export const Playground: Story = {}

export const Variants: Story = {
  render: (args) => (
    <div className="storyStack">
      {VARIANTS.map((variant) => (
        <Card key={variant} {...args} variant={variant} header={<SectionLabel>{variant}</SectionLabel>}>
          The outlined card draws a border; the elevated one lifts off the page instead.
        </Card>
      ))}
    </div>
  ),
}

export const WithHeaderAndFooter: Story = {
  render: (args) => (
    <Card
      {...args}
      header={<SectionLabel detail={<Badge intent="success">active</Badge>}>Workspace</SectionLabel>}
      footer={
        <>
          <Button intent="neutral" variant="text">
            Cancel
          </Button>
          <Button>Save changes</Button>
        </>
      }
    >
      <div className="storyStack" data-gap="tight">
        <Input label="Workspace name" value="Analytical Engine" onValueChange={() => {}} />
        <Input label="Billing email" value="" onValueChange={() => {}} type="email" />
      </div>
    </Card>
  ),
}

/**
 * Two cards holding differently arranged content, to make the point that the component has no
 * opinion about the body — only about the surface around it.
 */
export const DifferentContentLayouts: Story = {
  render: (args) => (
    <div className="storyStack">
      <Card {...args} header={<SectionLabel>Stacked fields</SectionLabel>}>
        <div className="storyStack" data-gap="tight">
          <Input label="First name" value="" onValueChange={() => {}} />
          <Input label="Last name" value="" onValueChange={() => {}} />
        </div>
      </Card>

      <Card {...args} header={<SectionLabel detail="4">A row of badges</SectionLabel>}>
        <div className="storyRow" data-gap="tight">
          <Badge intent="success">deployed</Badge>
          <Badge intent="warning">pending</Badge>
          <Badge intent="danger">failed</Badge>
          <Badge>archived</Badge>
        </div>
      </Card>
    </div>
  ),
}

/** Body only. Both bands are optional. */
export const BodyOnly: Story = {
  render: (args) => <Card {...args} />,
}
