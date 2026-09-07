import type { StorybookConfig } from '@storybook/react-vite'

const config: StorybookConfig = {
  stories: ['../src/**/*.stories.@(ts|tsx)'],
  /**
   * `addon-docs` turns the JSDoc above each component and each prop into a Docs page, so the
   * explanation of what a component is for lives next to the code rather than in a wiki that
   * drifts away from it.
   */
  addons: ['@storybook/addon-docs'],
  framework: {
    name: '@storybook/react-vite',
    options: {},
  },
}

export default config
