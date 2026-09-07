import '../src/styles/layers.css'
import '../src/styles/reset.css'
import '../src/styles/tokens.css'
import './stories.css'

import type { Decorator, Preview } from '@storybook/react-vite'

/**
 * The toolbar drives `data-ronin-theme` — the same attribute a consumer sets. There is no
 * provider to configure here because the library does not ship one.
 *
 * `auto` is the real default: with no attribute at all the tokens follow `prefers-color-scheme`.
 */
const withTheme: Decorator = (Story, context) => (
  <div className="storyCanvas" data-ronin-theme={context.globals.roninTheme}>
    <Story />
  </div>
)

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
        items: [
          { value: 'light', title: 'Light' },
          { value: 'dark', title: 'Dark' },
          { value: 'auto', title: 'Auto (OS)' },
        ],
        dynamicTitle: true,
      },
    },
  },
  parameters: {
    controls: { expanded: true },
  },
}

export default preview
