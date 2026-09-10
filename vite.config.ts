import { readdirSync, readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'

import react from '@vitejs/plugin-react'
import { defineConfig, type Plugin } from 'vite'
import { libInjectCss } from 'vite-plugin-lib-inject-css'

const resolveFromRoot = (relativePath: string) =>
  fileURLToPath(new URL(relativePath, import.meta.url))

/**
 * `tokens.css` is bundled into `styles.css` like every other stylesheet, but it is also
 * published on its own so a consumer can take the tokens without the components.
 *
 * The palette presets are copied out too, and are **not** in the bundle: five palettes times
 * two themes is weight almost nobody uses, so each is an opt-in import.
 */
const emitStandaloneStylesheets = (): Plugin => ({
  name: 'ronin-emit-stylesheets',
  generateBundle() {
    this.emitFile({
      type: 'asset',
      fileName: 'tokens.css',
      source: readFileSync(resolveFromRoot('./src/styles/tokens.css'), 'utf8'),
    })

    const palettesDir = resolveFromRoot('./src/styles/palettes')

    for (const fileName of readdirSync(palettesDir).filter((name) => name.endsWith('.css'))) {
      this.emitFile({
        type: 'asset',
        fileName: `palettes/${fileName}`,
        source: readFileSync(`${palettesDir}/${fileName}`, 'utf8'),
      })
    }
  },
})

export default defineConfig({
  plugins: [react(), libInjectCss(), emitStandaloneStylesheets()],
  build: {
    lib: {
      entry: resolveFromRoot('./src/index.ts'),
      formats: ['es'],
      fileName: () => 'index.js',
    },
    cssCodeSplit: false,
    sourcemap: true,
    rollupOptions: {
      /**
       * Dependencies are not bundled. Beyond avoiding duplicate copies in the consumer's
       * graph, it is what keeps floating-ui out of the bundle of an app that never imports
       * `Tooltip`: the import survives as a bare specifier the consumer's bundler resolves,
       * and dead-code elimination drops it along with the component.
       */
      external: [/^react($|\/)/, /^react-dom($|\/)/, /^@floating-ui\//],
      output: {
        assetFileNames: 'styles.css',
      },
    },
  },
})
