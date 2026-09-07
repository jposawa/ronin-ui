import type { Meta, StoryObj } from '@storybook/react-vite'

import { Badge, type BadgeIntent, type BadgeVariant } from './Badge'

const INTENTS: BadgeIntent[] = [
  'primary',
  'secondary',
  'danger',
  'warning',
  'success',
  'neutral',
]

const VARIANTS: BadgeVariant[] = ['filled', 'outline', 'subtle']

const meta = {
  title: 'Components/Badge',
  component: Badge,
  args: {
    children: 'active',
    intent: 'neutral',
    variant: 'subtle',
  },
  argTypes: {
    intent: { control: 'select', options: INTENTS },
    variant: { control: 'inline-radio', options: VARIANTS },
  },
} satisfies Meta<typeof Badge>

export default meta

type Story = StoryObj<typeof meta>

export const Playground: Story = {}

export const IntentByVariant: Story = {
  render: (args) => (
    <div className="storyStack" data-gap="loose">
      {VARIANTS.map((variant) => (
        <div key={variant} className="storyStack" data-gap="tight">
          <small className="storyCaption">{variant}</small>
          <div className="storyRow" data-gap="tight">
            {INTENTS.map((intent) => (
              <Badge key={intent} {...args} intent={intent} variant={variant}>
                {intent}
              </Badge>
            ))}
          </div>
        </div>
      ))}
    </div>
  ),
}

/** What the intents are for — status that means something. */
export const StatusLabels: Story = {
  render: (args) => (
    <div className="storyRow" data-gap="tight">
      <Badge {...args} intent="success">
        deployed
      </Badge>
      <Badge {...args} intent="warning">
        pending review
      </Badge>
      <Badge {...args} intent="danger">
        failed
      </Badge>
      <Badge {...args} intent="neutral">
        archived
      </Badge>
    </div>
  ),
}

/**
 * `color` is the escape hatch for a palette the library cannot know about — a per-category
 * colour scale in the consuming app, for instance. It overrides the intent for that one
 * instance and nothing else, and it reaches the CSS as a variable, not as a declaration.
 */
export const CustomColour: Story = {
  render: (args) => (
    <div className="storyRow" data-gap="tight">
      <Badge {...args} color="#7c5cbf">
        design
      </Badge>
      <Badge {...args} color="#0f9b8e" variant="outline">
        research
      </Badge>
      <Badge {...args} color="#c2410c" variant="filled">
        support
      </Badge>
    </div>
  ),
}

/**
 * Sized in `em` and with no `line-height` of its own, so it tracks both the size and the
 * rhythm of the copy it sits in.
 */
export const InsideCopy: Story = {
  render: (args) => (
    <p className="storyProse">
      The last build is <Badge {...args} intent="success">passing</Badge> and two pull requests
      are <Badge {...args} intent="warning">waiting for review</Badge>.
    </p>
  ),
}
