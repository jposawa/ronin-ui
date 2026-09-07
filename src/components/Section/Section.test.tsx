import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'

import { Card } from '../Card'
import { SectionLabel } from '../SectionLabel'
import { Section } from './Section'

describe('SectionLabel', () => {
  it('renders as the heading it was given', () => {
    render(
      <SectionLabel>
        <h3>Notifications</h3>
      </SectionLabel>,
    )

    expect(screen.getByRole('heading', { level: 3, name: 'Notifications' })).toBeInTheDocument()
  })

  it('renders no heading for plain text', () => {
    render(<SectionLabel>Notifications</SectionLabel>)

    expect(screen.queryByRole('heading')).not.toBeInTheDocument()
    expect(screen.getByText('Notifications')).toBeInTheDocument()
  })
})

describe('Section', () => {
  it('renders no label when there is no title', () => {
    render(
      <Section>
        <p>Body</p>
      </Section>,
    )

    expect(screen.queryByRole('heading')).not.toBeInTheDocument()
    expect(screen.getByText('Body')).toBeInTheDocument()
  })

  /**
   * An unnamed `<section>` maps to `role="generic"`, so it adds no landmark — which is what
   * makes it safe to use unconditionally instead of dropping to a `<div>`.
   */
  it('adds no region landmark', () => {
    render(
      <Section title={<h2>Account</h2>}>
        <p>Body</p>
      </Section>,
    )

    expect(screen.queryByRole('region')).not.toBeInTheDocument()
    expect(screen.getByRole('heading', { level: 2, name: 'Account' })).toBeInTheDocument()
  })
})

describe('Card', () => {
  it('renders its bands only when given', () => {
    const { rerender } = render(<Card>Body</Card>)

    expect(screen.queryByRole('banner')).not.toBeInTheDocument()
    expect(screen.queryByRole('contentinfo')).not.toBeInTheDocument()

    rerender(
      <Card header="Workspace" footer="Actions">
        Body
      </Card>,
    )

    expect(screen.getByText('Workspace')).toBeInTheDocument()
    expect(screen.getByText('Actions')).toBeInTheDocument()
  })

  /**
   * This test is why the bands are `<div>`. `<header>` inside a `<section>` is supposed to be
   * scoped away from the `banner` landmark, but that rule is not applied consistently — this
   * assertion failed against exactly that markup. A page of cards each announcing a page
   * banner is a real defect, so the library does not rely on the rule.
   */
  it('keeps its header and footer out of the page landmarks', () => {
    render(
      <Card header="Workspace" footer="Actions">
        Body
      </Card>,
    )

    expect(screen.queryByRole('banner')).not.toBeInTheDocument()
    expect(screen.queryByRole('contentinfo')).not.toBeInTheDocument()
  })
})
