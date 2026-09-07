import type { Meta, StoryObj } from '@storybook/react-vite'
import React from 'react'

import { Button } from '../Button'
import { Input } from '../Input'
import { Modal, type ModalProps } from './Modal'

const meta = {
  title: 'Components/Modal',
  component: Modal,
  args: {
    title: 'Leave without saving?',
    children: 'Your changes to this page will be discarded.',
    isOpen: false,
    onClose: () => {},
  },
} satisfies Meta<typeof Modal>

export default meta

type Story = StoryObj<typeof meta>

type ModalTriggerProps = ModalProps & {
  /**
   * Receives the close callback, so footer actions can actually close the dialog. Passing a
   * plain `footer` node instead leaves those buttons with no way to reach the open state —
   * which, under `isPersistent`, traps the reader with no exit at all.
   */
  renderFooter?: (closeModal: () => void) => React.ReactNode
  triggerLabel?: string
}

/** Open state is the consumer's, as everything stateful in this library is. */
const ModalTrigger = ({
  children,
  renderFooter,
  triggerLabel = 'Open',
  ...modalProps
}: ModalTriggerProps) => {
  const [isOpen, setIsOpen] = React.useState(false)
  const closeModal = () => setIsOpen(false)

  return (
    <>
      <Button onClick={() => setIsOpen(true)}>{triggerLabel}</Button>

      <Modal
        {...modalProps}
        isOpen={isOpen}
        onClose={closeModal}
        footer={renderFooter?.(closeModal)}
      >
        {children}
      </Modal>
    </>
  )
}

/**
 * Worth checking here, all of it free from the native `<dialog>`: Tab cannot leave the panel,
 * Escape closes it, the backdrop click closes it, and focus returns to the Open button.
 */
export const Playground: Story = {
  render: (args) => <ModalTrigger {...args} />,
}

export const WithFooter: Story = {
  render: (args) => (
    <ModalTrigger
      {...args}
      renderFooter={(closeModal) => (
        <>
          <Button intent="neutral" variant="text" onClick={closeModal}>
            Keep editing
          </Button>
          <Button intent="danger" onClick={closeModal}>
            Discard changes
          </Button>
        </>
      )}
    />
  ),
}

/**
 * Escape and the backdrop stop closing the dialog, and the close button goes away with them.
 * The footer actions become the only way out, so they have to be wired — a dialog with no
 * working exit is a trap, not a confirmation.
 */
export const Persistent: Story = {
  args: {
    isPersistent: true,
    title: 'Delete this project?',
    children: 'This removes the project and everything in it. It cannot be undone.',
  },
  render: (args) => (
    <ModalTrigger
      {...args}
      triggerLabel="Delete project"
      renderFooter={(closeModal) => (
        <>
          <Button intent="neutral" variant="outline" onClick={closeModal}>
            Cancel
          </Button>
          <Button intent="danger" onClick={closeModal}>
            Delete
          </Button>
        </>
      )}
    />
  ),
}

/** Long content scrolls inside the body; the header and footer stay put. */
export const ScrollingBody: Story = {
  args: {
    size: 'lg',
    title: 'Invite teammates',
    children: (
      <div className="storyStack" data-gap="tight">
        {Array.from({ length: 12 }, (_, index) => (
          <Input
            key={index}
            label={`Email ${index + 1}`}
            value=""
            onValueChange={() => {}}
            type="email"
            placeholder="name@example.com"
          />
        ))}
      </div>
    ),
  },
  render: (args) => (
    <ModalTrigger
      {...args}
      triggerLabel="Invite people"
      renderFooter={(closeModal) => (
        <>
          <Button intent="neutral" variant="text" onClick={closeModal}>
            Cancel
          </Button>
          <Button onClick={closeModal}>Send invites</Button>
        </>
      )}
    />
  ),
}

export const Sizes: Story = {
  render: (args) => (
    <div className="storyRow" data-gap="tight">
      <ModalTrigger {...args} size="sm" triggerLabel="Small" title="Small dialog" />
      <ModalTrigger {...args} size="md" triggerLabel="Medium" title="Medium dialog" />
      <ModalTrigger {...args} size="lg" triggerLabel="Large" title="Large dialog" />
    </div>
  ),
}
