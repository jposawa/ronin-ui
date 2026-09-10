import '../src/styles/layers.css'
import '../src/styles/reset.css'
import '../src/styles/tokens.css'
/* The presets are opt-in for consumers; Storybook loads them all so they can be compared. */
import '../src/styles/palettes/brass.css'
import '../src/styles/palettes/cyan.css'
import '../src/styles/palettes/luna.css'
import '../src/styles/palettes/mint.css'
import './stories.css'

import type { Decorator, Preview } from '@storybook/react-vite'

/**
 * The toolbar drives `data-ronin-theme` — the same attribute a consumer sets. There is no
 * provider to configure here because the library does not ship one.
 *
 * Preset values are `<name>`, `<name>-dark` and `<name>-auto`, one attribute for both axes.
 */
const withTheme: Decorator = (Story, context) => (
  <div className="storyCanvas" data-ronin-theme={context.globals.roninTheme}>
    <Story />
  </div>
)

const THEME_ITEMS = [
  { value: 'light', title: 'Default · light' },
  { value: 'dark', title: 'Default · dark' },
  { value: 'auto', title: 'Default · auto' },
  { value: 'luna', title: 'Luna · light' },
  { value: 'luna-dark', title: 'Luna · dark' },
  { value: 'brass', title: 'Brass · light' },
  { value: 'brass-dark', title: 'Brass · dark' },
  { value: 'mint', title: 'Mint · light' },
  { value: 'mint-dark', title: 'Mint · dark' },
  { value: 'cyan', title: 'Cyan · light' },
  { value: 'cyan-dark', title: 'Cyan · dark' },
]

const preview: Preview = {
  /** Every component gets a generated Docs page from its JSDoc and prop types. */
  tags: ['autodocs'],
  decorators: [withTheme],
  initialGlobals: {
    roninTheme: 'light',
  },
  globalTypes: {
    roninTheme: {
      description: 'data-ronin-theme value applied to the wrapper',
      toolbar: {
        title: 'Theme',
        icon: 'paintbrush',
        items: THEME_ITEMS,
        dynamicTitle: true,
      },
    },
  },
  parameters: {
    controls: { expanded: true },
  },
}

export default preview
