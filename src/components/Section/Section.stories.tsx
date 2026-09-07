import type { Meta, StoryObj } from '@storybook/react-vite'

import { Badge } from '../Badge'
import { Button } from '../Button'
import { Input } from '../Input'
import { Section } from './Section'

const meta = {
  title: 'Components/Section',
  component: Section,
  args: {
    title: <h3>Recent files</h3>,
    children: 'Anything can go here — this section holds a single string.',
  },
  decorators: [
    (Story) => (
      <div className="storyPage">
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof Section>

export default meta

type Story = StoryObj<typeof meta>

export const Playground: Story = {}

/** With a `detail`, and a list as the content. */
export const WithDetail: Story = {
  args: { detail: '4' },
  render: (args) => (
    <Section {...args}>
      <div className="storyStack" data-gap="tight">
        {['Roadmap.pdf', 'Budget.xlsx', 'Notes.md', 'Logo.svg'].map((fileName) => (
          <span key={fileName} className="storyItem">
            {fileName}
          </span>
        ))}
      </div>
    </Section>
  ),
}

/**
 * `title` is optional, and the element does not change with it: always `<section>`.
 *
 * Unnamed, it maps to `role="generic"` — the same as a `<div>` to a screen reader — so nothing
 * is over-claimed. Named, it becomes a `region` landmark. The gain is in the inspector, where
 * a page of `<section>` boundaries is readable and a page of `<div>` is not.
 */
export const WithoutTitle: Story = {
  args: { title: undefined },
  render: (args) => (
    <div className="storyStack" data-gap="loose">
      <Section title={<h3>Notifications</h3>} detail={<Badge intent="warning">3</Badge>}>
        <Input label="Reply-to address" value="" onValueChange={() => {}} type="email" />
      </Section>

      <Section {...args}>
        <div className="storyRow" data-gap="tight">
          <Button>Save</Button>
          <Button intent="neutral" variant="outline">
            Cancel
          </Button>
        </div>
      </Section>
    </div>
  ),
}

/**
 * Several sections in a page. Each owns the gap between its own label and content; the gap
 * *between* sections is the page's, which is why `Section` sets no outer margin.
 */
export const StackedSections: Story = {
  render: () => (
    <div className="storyStack" data-gap="loose">
      <Section title={<h2>Account</h2>}>
        <Input label="Display name" value="Ada Lovelace" onValueChange={() => {}} />
      </Section>

      <Section title={<h2>Workspace</h2>} detail="2 members">
        <Input label="Workspace name" value="Analytical Engine" onValueChange={() => {}} />
      </Section>
    </div>
  ),
}

/**
 * The section is a vertical stack with one gap, so multiple children are spaced evenly. Pass a
 * single wrapper element instead when the inner spacing should be yours.
 */
export const MultipleChildren: Story = {
  render: (args) => (
    <Section {...args} title="Billing">
      <Input label="Card holder" value="" onValueChange={() => {}} />
      <Input label="Billing email" value="" onValueChange={() => {}} type="email" />
      <Button>Update payment method</Button>
    </Section>
  ),
}
