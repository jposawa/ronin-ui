/**
 * One choice offered by `Select` and `MultiSelect`.
 *
 * `label` is a `string` and not a `ReactNode` on purpose: it is read three times — as the
 * visible option, as the text the search field matches against, and as what the closed trigger
 * repeats back. A node could not be matched, and repeating it would render the same element
 * twice in two places.
 *
 * It lives in `types/` rather than beside either component because both read it, and a type
 * exported twice through the barrel is ambiguous to the module graph.
 */
export type SelectOption = {
  value: string
  label: string
  disabled?: boolean
}
