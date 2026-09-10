/**
 * Internal. `components/index.ts` does not re-export this folder — `Select` and `MultiSelect`
 * are the public API, and the piece they share stays free to change without a version bump.
 */
export type { OptionListboxProps } from './OptionListbox'
export { OptionListbox } from './OptionListbox'
