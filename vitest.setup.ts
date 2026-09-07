import '@testing-library/jest-dom/vitest'

import { afterEach } from 'vitest'

/**
 * jsdom implements the `<dialog>` element but not `showModal()` or `close()`, so a `Modal`
 * test would throw before asserting anything.
 *
 * The stubs do the two things the component actually depends on: flip the `open` attribute,
 * and fire `close`. Focus trapping and the top layer are the browser's, are not simulated
 * here, and are therefore not what these tests claim to cover.
 */
if (typeof HTMLDialogElement !== 'undefined' && !HTMLDialogElement.prototype.showModal) {
  HTMLDialogElement.prototype.showModal = function showModal() {
    this.open = true
  }

  HTMLDialogElement.prototype.close = function close(returnValue?: string) {
    this.open = false

    if (returnValue !== undefined) {
      this.returnValue = returnValue
    }

    this.dispatchEvent(new Event('close'))
  }
}

afterEach(() => {
  document.body.innerHTML = ''
})
