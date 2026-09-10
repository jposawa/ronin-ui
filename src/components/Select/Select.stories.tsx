import type { Meta, StoryObj } from '@storybook/react-vite'
import React from 'react'

import type { SelectOption } from '../../types'
import { Select, type SelectProps } from './Select'

const TEAMS: SelectOption[] = [
  { value: 'design', label: 'Design' },
  { value: 'engineering', label: 'Engineering' },
  { value: 'marketing', label: 'Marketing' },
  { value: 'operations', label: 'Operations' },
  { value: 'legal', label: 'Legal', disabled: true },
]

const TIMEZONES: SelectOption[] = [
  { value: 'utc-08', label: 'Los Angeles (UTC−08)' },
  { value: 'utc-05', label: 'New York (UTC−05)' },
  { value: 'utc-03', label: 'São Paulo (UTC−03)' },
  { value: 'utc+00', label: 'Lisbon (UTC+00)' },
  { value: 'utc+01', label: 'Berlin (UTC+01)' },
  { value: 'utc+02', label: 'Athens (UTC+02)' },
  { value: 'utc+03', label: 'Nairobi (UTC+03)' },
  { value: 'utc+05:30', label: 'Mumbai (UTC+05:30)' },
  { value: 'utc+07', label: 'Bangkok (UTC+07)' },
  { value: 'utc+09', label: 'Tokyo (UTC+09)' },
  { value: 'utc+10', label: 'Sydney (UTC+10)' },
  { value: 'utc+12', label: 'Auckland (UTC+12)' },
]

const meta = {
  title: 'Components/Select',
  component: Select,
  args: {
    label: 'Team',
    placeholder: 'Choose a team',
    options: TEAMS,
    value: null,
    onValueChange: () => {},
  },
  /**
   * The field has no width of its own — it fills whatever it is put in, and the list follows the
   * trigger's width. Every story is wrapped at a realistic form width for that reason.
   */
  decorators: [
    (Story, context) =>
      context.parameters.unconstrained ? (
        <Story />
      ) : (
        <div className="storyForm">
          <Story />
        </div>
      ),
  ],
} satisfies Meta<typeof Select>

export default meta

type Story = StoryObj<typeof meta>

/** Controlled by definition — `value` in, `onValueChange` out. The state lives in the story. */
const ControlledSelect = (selectProps: SelectProps) => {
  const [currentValue, setCurrentValue] = React.useState(selectProps.value)

  return <Select {...selectProps} value={currentValue} onValueChange={setCurrentValue} />
}

export const Playground: Story = {
  render: (args) => <ControlledSelect {...args} />,
}

/**
 * `null` is "nothing chosen", never `''` — an empty string is a value an option may legitimately
 * have, so a sentinel made of one could not be told apart from a real choice.
 */
export const WithHint: Story = {
  args: { hint: 'Everyone on the team gets access to the project.' },
  render: (args) => <ControlledSelect {...args} />,
}

/**
 * `isSearchable` adds a filter above the list. It matches on `label`, which is why `label` is a
 * string rather than a node: the same text is the visible option, what the filter matches, and
 * what the closed trigger repeats back.
 *
 * `emptyMessage` has no default. It is visible copy, and the library ships none.
 */
export const Searchable: Story = {
  args: {
    isSearchable: true,
    label: 'Timezone',
    placeholder: 'Choose a timezone',
    options: TIMEZONES,
    searchPlaceholder: 'Filter timezones',
    emptyMessage: 'No timezone matches.',
  },
  render: (args) => <ControlledSelect {...args} />,
}

/**
 * There is no separate `isInvalid` flag: passing `errorMessage` is what marks the field invalid,
 * sets `aria-invalid`, replaces the hint, and gives the message `role="alert"`. Same contract as
 * `Input`.
 */
export const WithError: Story = {
  args: {
    hint: 'This hint is hidden while an error is showing.',
    errorMessage: 'Pick a team before continuing.',
  },
  render: (args) => <ControlledSelect {...args} />,
}

/** A disabled option stays visible and announced, and cannot be chosen by pointer or keyboard. */
export const DisabledOption: Story = {
  args: { hint: 'Legal is listed but cannot be picked here.' },
  render: (args) => <ControlledSelect {...args} />,
}

export const Disabled: Story = {
  args: { disabled: true, value: 'design' },
  render: (args) => <ControlledSelect {...args} />,
}

/**
 * Every string a reader sees is a prop, so the whole control speaks the consumer's language —
 * including `searchLabel`, which is the accessible name of the filter field and the one string
 * that ships with an English default.
 */
export const TranslatedCopy: Story = {
  args: {
    isSearchable: true,
    label: 'Fuso horário',
    placeholder: 'Escolha um fuso',
    options: TIMEZONES,
    searchLabel: 'Pesquisar fusos',
    searchPlaceholder: 'Filtrar fusos',
    emptyMessage: 'Nenhum fuso encontrado.',
    hint: 'Usado para agendar as reuniões da equipe.',
  },
  render: (args) => <ControlledSelect {...args} />,
}

/**
 * The list is portalled and positioned `fixed`, so a scrolling or clipping ancestor cannot cut
 * it off — the same reason `Tooltip` is portalled. Open the list and scroll the box.
 */
export const InsideAClippingBox: Story = {
  parameters: { unconstrained: true },
  render: (args) => (
    <div className="storyClip">
      <div className="storyStack">
        <span className="storyCaption">This box clips its overflow. The list escapes it.</span>
        <ControlledSelect {...args} />
        <span className="storyCaption">Scroll me.</span>
        <span className="storyCaption">Still scrolling.</span>
        <span className="storyCaption">Bottom of the box.</span>
      </div>
    </div>
  ),
}
