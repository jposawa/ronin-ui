/**
 * Semantic colour role, shared by every component that has one. It names *what the thing
 * means*, never how it is drawn — that is each component's `variant`.
 *
 * Adding a value here means adding a matching `--color-<intent>` family to `tokens.css`;
 * a component reading an undefined token renders colourless and fails silently.
 */
export type Intent =
  | 'primary'
  | 'secondary'
  | 'danger'
  | 'warning'
  | 'success'
  | 'neutral'
