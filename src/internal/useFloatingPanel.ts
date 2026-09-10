import {
  autoUpdate,
  computePosition,
  flip,
  offset,
  type Placement,
  shift,
  size,
} from '@floating-ui/dom'
import React from 'react'

export type FloatingPanelOptions = {
  isOpen: boolean
  /** The element the panel is positioned against. */
  anchorElement: HTMLElement | null
  panelElement: HTMLElement | null
  placement?: Placement
  /** Distance from the anchor, in pixels. */
  offsetDistance?: number
  /**
   * Writes `--floating-width` and `--floating-available-height` as well, so the panel can be
   * sized to its anchor. What a listbox needs and a tooltip does not.
   */
  shouldMatchAnchorWidth?: boolean
}

/**
 * Positions a portalled panel against an anchor, and keeps it there while the page scrolls or
 * resizes.
 *
 * Internal, and extracted at the third copy — `Tooltip`, the option listbox behind `Select` and
 * `MultiSelect`, and `Popover` all place a floating box the same way. Three hand-written
 * `computePosition` calls is how the middleware order, the strategy and the reduced-motion
 * behaviour end up disagreeing without anyone noticing.
 *
 * The numbers are written as **custom properties**, never as a finished `transform`: the
 * stylesheet keeps ownership of how a position is applied, and JavaScript supplies only the two
 * values it alone can compute. Same rule as the `color` prop on `Badge`.
 *
 * `strategy: 'fixed'` throughout, because every caller portals to `<body>` — which is what stops
 * an `overflow: hidden` ancestor from clipping the panel.
 */
export const useFloatingPanel = ({
  isOpen,
  anchorElement,
  panelElement,
  placement = 'bottom-start',
  offsetDistance = 8,
  shouldMatchAnchorWidth = false,
}: FloatingPanelOptions) => {
  React.useEffect(() => {
    if (!isOpen || !anchorElement || !panelElement) {
      return
    }

    const middleware = [offset(offsetDistance), flip(), shift({ padding: 8 })]

    if (shouldMatchAnchorWidth) {
      middleware.push(
        size({
          padding: 8,
          apply: ({ rects, availableHeight, elements }) => {
            elements.floating.style.setProperty(
              '--floating-width',
              `${Math.round(rects.reference.width)}px`,
            )
            elements.floating.style.setProperty(
              '--floating-available-height',
              `${Math.round(availableHeight)}px`,
            )
          },
        }),
      )
    }

    const updatePosition = async () => {
      const { x, y } = await computePosition(anchorElement, panelElement, {
        placement,
        strategy: 'fixed',
        middleware,
      })

      panelElement.style.setProperty('--floating-x', `${Math.round(x)}px`)
      panelElement.style.setProperty('--floating-y', `${Math.round(y)}px`)
    }

    return autoUpdate(anchorElement, panelElement, updatePosition)
  }, [isOpen, anchorElement, panelElement, placement, offsetDistance, shouldMatchAnchorWidth])
}
