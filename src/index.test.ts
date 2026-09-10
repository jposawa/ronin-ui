import { describe, expect, it } from 'vitest'

import * as publicApi from './index'

/**
 * The public API is a contract, and `src/internal/` is a folder that exists to stay out of it.
 * A stray `export * from './internal'` — or a component barrel picking the folder up — would
 * compile, lint, pass every other test, and quietly freeze an implementation detail into the
 * package's surface, where removing it later is a breaking change.
 *
 * So the surface is written down. Adding a component means adding a line here on purpose,
 * which is the point: it is the moment to ask whether the thing is really public.
 *
 * Types are not covered — they are erased before this runs. `tsc` is what guards those.
 */
const PUBLIC_EXPORTS = [
  'Avatar',
  'Badge',
  'Button',
  'Card',
  'Checkbox',
  'Chip',
  'Collapse',
  'Drawer',
  'Input',
  'Modal',
  'MultiSelect',
  'Popover',
  'Section',
  'SectionLabel',
  'Select',
  'Stepper',
  'Switch',
  'Tabs',
  'Tooltip',
]

describe('public API', () => {
  it('exports exactly the documented components', () => {
    expect(Object.keys(publicApi).sort()).toEqual([...PUBLIC_EXPORTS].sort())
  })

  it('leaks nothing from src/internal', () => {
    const internalNames = ['OptionListbox', 'FieldMessage', 'useFloatingPanel']

    for (const internalName of internalNames) {
      expect(publicApi).not.toHaveProperty(internalName)
    }
  })
})
