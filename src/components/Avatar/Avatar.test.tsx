import { fireEvent, render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'

import { Avatar } from './Avatar'

/**
 * The first test is the regression guard for a real bug: the name used to live in a `title` on
 * an `aria-hidden` element, so the avatar had no accessible name at all and nothing failed.
 */
describe('Avatar', () => {
  it('exposes the name whether the image loads or not', () => {
    const { rerender } = render(<Avatar name="Ada Lovelace" />)

    expect(screen.getByRole('img', { name: 'Ada Lovelace' })).toBeInTheDocument()

    rerender(<Avatar name="Ada Lovelace" imageUrl="https://example.test/ada.png" />)

    expect(screen.getByRole('img', { name: 'Ada Lovelace' })).toBeInTheDocument()
  })

  it('names the avatar once, not twice, when showing an image', () => {
    render(<Avatar name="Ada Lovelace" imageUrl="https://example.test/ada.png" />)

    expect(screen.getAllByRole('img', { name: 'Ada Lovelace' })).toHaveLength(1)
  })

  it('builds initials from the first and last word', () => {
    render(<Avatar name="Grace Brewster Hopper" />)

    expect(screen.getByText('GH')).toBeInTheDocument()
  })

  it('takes one letter from a single word and falls back on an empty name', () => {
    const { rerender } = render(<Avatar name="alan" />)

    expect(screen.getByText('A')).toBeInTheDocument()

    rerender(<Avatar name="   " />)

    expect(screen.getByText('?')).toBeInTheDocument()
  })

  it('falls back to initials when the image fails to load', () => {
    render(<Avatar name="Ada Lovelace" imageUrl="https://example.invalid/missing.png" />)

    fireEvent.error(screen.getByRole('img', { name: 'Ada Lovelace' }).querySelector('img')!)

    expect(screen.getByText('AL')).toBeInTheDocument()
  })
})
