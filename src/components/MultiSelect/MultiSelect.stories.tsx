import type { Meta, StoryObj } from '@storybook/react-vite'
import React from 'react'

import type { SelectOption } from '../../types'
import { MultiSelect, type MultiSelectProps } from './MultiSelect'

const TEAMS: SelectOption[] = [
  { value: 'design', label: 'Design' },
  { value: 'engineering', label: 'Engineering' },
  { value: 'marketing', label: 'Marketing' },
  { value: 'operations', label: 'Operations' },
  { value: 'legal', label: 'Legal', disabled: true },
]

const PERMISSIONS: SelectOption[] = [
  { value: 'projects.read', label: 'Read projects' },
  { value: 'projects.write', label: 'Edit projects' },
  { value: 'files.read', label: 'Read files' },
  { value: 'files.write', label: 'Upload files' },
  { value: 'members.invite', label: 'Invite members' },
  { value: 'members.remove', label: 'Remove members' },
  { value: 'billing.read', label: 'View billing' },
  { value: 'billing.write', label: 'Change billing' },
]

const meta = {
  title: 'Components/MultiSelect',
  component: MultiSelect,
  args: {
    label: 'Teams',
    placeholder: 'Any team',
    options: TEAMS,
    values: [],
    onValuesChange: () => {},
  },
  decorators: [
    (Story) => (
      <div className="storyForm">
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof MultiSelect>

export default meta

type Story = StoryObj<typeof meta>

/** Controlled — `values` in, `onValuesChange` out. The state lives in the story. */
const ControlledMultiSelect = (multiSelectProps: MultiSelectProps) => {
  const [currentValues, setCurrentValues] = React.useState(multiSelectProps.values)

  return (
    <MultiSelect {...multiSelectProps} values={currentValues} onValuesChange={setCurrentValues} />
  )
}

/**
 * Picking toggles the option and the list stays open, because a second choice is the expected
 * next move. Escape, Tab or a click outside closes it.
 */
export const Playground: Story = {
  render: (args) => <ControlledMultiSelect {...args} />,
}

export const WithChoicesMade: Story = {
  args: {
    values: ['design', 'marketing'],
    hint: 'The summary reads in the order the options were given, not the order they were picked.',
  },
  render: (args) => <ControlledMultiSelect {...args} />,
}

/**
 * Searching and choosing work together: the filter field keeps focus while options are picked,
 * so a reader can type, choose, and type again without leaving the keyboard.
 */
export const Searchable: Story = {
  args: {
    isSearchable: true,
    label: 'Permissions',
    placeholder: 'No permission granted',
    options: PERMISSIONS,
    searchPlaceholder: 'Filter permissions',
    emptyMessage: 'No permission matches.',
  },
  render: (args) => <ControlledMultiSelect {...args} />,
}

/**
 * The default summary joins the chosen labels with a comma — the only summary the library can
 * write without inventing copy. A count is text in someone's language, so it arrives as a
 * function instead.
 */
export const CustomSummary: Story = {
  args: {
    isSearchable: true,
    label: 'Permissions',
    placeholder: 'No permission granted',
    options: PERMISSIONS,
    values: ['projects.read', 'files.read', 'members.invite'],
    searchPlaceholder: 'Filter permissions',
    renderSummary: (selectedOptions) =>
      selectedOptions.length === 1
        ? selectedOptions[0].label
        : `${selectedOptions.length} permissions`,
  },
  render: (args) => <ControlledMultiSelect {...args} />,
}

export const WithError: Story = {
  args: {
    hint: 'This hint is hidden while an error is showing.',
    errorMessage: 'Pick at least one team.',
  },
  render: (args) => <ControlledMultiSelect {...args} />,
}

export const Disabled: Story = {
  args: { disabled: true, values: ['design', 'operations'] },
  render: (args) => <ControlledMultiSelect {...args} />,
}
