import clsx from 'clsx'
import React from 'react'

import { RONIN_SCOPE } from '../../constants'
import type { BaseComponent } from '../../types'
import styles from './Avatar.module.css'

export type AvatarSize = 'sm' | 'md' | 'lg'

export type AvatarProps = BaseComponent & {
  /** Used as the image's accessible name and as the source of the fallback initials. */
  name: string
  imageUrl?: string
  size?: AvatarSize
}

/** First letter of the first and last word — "Grace Brewster Hopper" becomes "GH". */
const toInitials = (name: string): string => {
  const words = name.trim().split(/\s+/).filter(Boolean)

  if (words.length === 0) {
    return '?'
  }

  const firstInitial = words[0].charAt(0)
  const lastInitial = words.length > 1 ? words[words.length - 1].charAt(0) : ''

  return `${firstInitial}${lastInitial}`.toUpperCase()
}

/**
 * A circular identity mark. Shows `imageUrl` when there is one and it loads; otherwise it
 * falls back to initials taken from `name`, which is also what a broken image URL lands on
 * rather than a torn-image icon.
 */
export const Avatar = ({ name, imageUrl, size = 'md', className, style }: AvatarProps) => {
  const [hasImageFailed, setHasImageFailed] = React.useState(false)

  const shouldShowImage = Boolean(imageUrl) && !hasImageFailed

  return (
    /**
     * The name lives on the root, as `role="img"` plus `aria-label`, so it is announced the
     * same way whether the image loaded or the initials are showing.
     *
     * An earlier version put it in a `title` on the initials — which were `aria-hidden`, so
     * assistive technology never saw it, and the avatar had no accessible name at all.
     */
    <span
      className={clsx(RONIN_SCOPE, styles.avatar, className)}
      style={style}
      data-size={size}
      role="img"
      aria-label={name}
    >
      {shouldShowImage ? (
        /* The root already carries the name; a second one here would be read twice. */
        <img className={styles.image} src={imageUrl} alt="" onError={() => setHasImageFailed(true)} />
      ) : (
        <span className={styles.initials} aria-hidden="true">
          {toInitials(name)}
        </span>
      )}
    </span>
  )
}
