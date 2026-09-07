/**
 * Applied to the root element of every component. It is the hook the scoped reset in
 * `styles/reset.css` keys off — see that file for why the reset is scoped rather than global.
 *
 * Written literally rather than through a CSS module, because it has to survive class hashing
 * to be usable from a plain stylesheet.
 */
export const RONIN_SCOPE = 'ronin-scope'
