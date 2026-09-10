import type { Meta, StoryObj } from '@storybook/react-vite'
import React from 'react'

import { Checkbox, type CheckboxProps } from './Checkbox'

const meta = {
  title: 'Components/Checkbox',
  component: Checkbox,
  args: {
    label: 'Send me a weekly summary',
    checked: false,
    onCheckedChange: () => {},
  },
  decorators: [
    (Story) => (
      <div className="storyForm">
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof Checkbox>

export default meta

type Story = StoryObj<typeof meta>

/** Controlled — `checked` in, `onCheckedChange` out. The state lives in the story. */
const ControlledCheckbox = (checkboxProps: CheckboxProps) => {
  const [isChecked, setIsChecked] = React.useState(checkboxProps.checked)

  return <Checkbox {...checkboxProps} checked={isChecked} onCheckedChange={setIsChecked} />
}

/**
 * A real `<input type="checkbox">` restyled with `appearance: none`, not a `<div>` wearing a
 * tick. The element that is styled stays the one that is focused, validated and announced.
 */
export const Playground: Story = {
  render: (args) => <ControlledCheckbox {...args} />,
}

export const WithHint: Story = {
  args: {
    checked: true,
    hint: 'Sent on Mondays. You can turn it off at any time.',
  },
  render: (args) => <ControlledCheckbox {...args} />,
}

/**
 * The same contract as `Input` and `Select`: passing `errorMessage` is what marks the field
 * invalid, replaces the hint, and gives the message `role="alert"`. All three read it from one
 * internal piece, so the behaviour cannot drift between them.
 */
export const WithError: Story = {
  args: {
    label: 'I accept the terms',
    hint: 'This hint is hidden while an error is showing.',
    errorMessage: 'You have to accept the terms to continue.',
  },
  render: (args) => <ControlledCheckbox {...args} />,
}

const PERMISSIONS = ['Read projects', 'Edit projects', 'Invite members']

/**
 * `indeterminate` is a DOM property with no HTML attribute behind it, so it can only be set from
 * script — which is why hand-rolled checkboxes almost always lose it. The parent box reads it
 * from its children.
 */
const PermissionTree = () => {
  const [checkedNames, setCheckedNames] = React.useState<string[]>(['Read projects'])

  const isEveryChecked = checkedNames.length === PERMISSIONS.length
  const isSomeChecked = checkedNames.length > 0 && !isEveryChecked

  const handleParentChange = (isChecked: boolean) => {
    setCheckedNames(isChecked ? [...PERMISSIONS] : [])
  }

  const handleChildChange = (permission: string, isChecked: boolean) => {
    setCheckedNames(
      isChecked
        ? [...checkedNames, permission]
        : checkedNames.filter((checkedName) => checkedName !== permission),
    )
  }

  return (
    <div className="storyStack" data-gap="tight">
      <Checkbox
        label="All permissions"
        checked={isEveryChecked}
        indeterminate={isSomeChecked}
        onCheckedChange={handleParentChange}
      />

      <div className="storyIndent">
        <div className="storyStack" data-gap="tight">
          {PERMISSIONS.map((permission) => (
            <Checkbox
              key={permission}
              label={permission}
              checked={checkedNames.includes(permission)}
              onCheckedChange={(isChecked) => handleChildChange(permission, isChecked)}
            />
          ))}
        </div>
      </div>
    </div>
  )
}

export const ParentAndChildren: Story = {
  render: () => <PermissionTree />,
}

/**
 * The native element is kept precisely for this half: `name`, `value` and `required` pass
 * straight through, so `FormData` sees the field and the browser validates it. That is the line
 * between this and `Switch` — a switch takes effect now, a checkbox travels with the form.
 */
export const InsideAForm: Story = {
  render: (args) => (
    <form className="storyStack">
      <ControlledCheckbox {...args} required name="terms" value="accepted" label="I accept the terms" />
      <ControlledCheckbox {...args} name="newsletter" value="yes" label="Send me product news" />
    </form>
  ),
}

export const Disabled: Story = {
  render: (args) => (
    <div className="storyStack" data-gap="tight">
      <ControlledCheckbox {...args} disabled label="Off and locked" />
      <ControlledCheckbox {...args} disabled checked label="On and locked" />
      <ControlledCheckbox
        {...args}
        disabled
        indeterminate
        label="Partly on and locked"
        hint="Set by the workspace owner."
      />
    </div>
  ),
}
