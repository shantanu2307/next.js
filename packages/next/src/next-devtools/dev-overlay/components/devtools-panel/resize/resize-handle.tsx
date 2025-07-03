import { useState, useLayoutEffect } from 'react'
import type { Corners } from '../../../shared'
import { useResize, type ResizeDirection } from './resize-provider'

const STORAGE_KEY_DIMENSIONS = 'nextjs-devtools-dimensions'

export const ResizeHandle = ({ direction }: { direction: ResizeDirection }) => {
  const {
    resizeRef,
    minWidth,
    minHeight,
    devToolsPosition,
    draggingDirection,
    setDraggingDirection,
  } = useResize()
  const [borderWidths, setBorderWidths] = useState({
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
  })

  // TODO(rob): if parallel with >2 sides (user resizes panel to be max width/height)
  // then we need to relax disabled resize heuristic
  const shouldShowHandle = () => {
    const getOppositeCorner = (corner: Corners): ResizeDirection => {
      switch (corner) {
        case 'top-left':
          return 'bottom-right'
        case 'top-right':
          return 'bottom-left'
        case 'bottom-left':
          return 'top-right'
        case 'bottom-right':
          return 'top-left'
        default: {
          corner satisfies never
          return null!
        }
      }
    }

    // we block the sides of the corner its in (bottom-left has bottom and left sides blocked from resizing)
    // because there shouldn't be anywhere to resize, and if the user decides to resize from that point it
    // would be unhandled/slightly janky (the component would have to re-magnetic-snap after the resize)
    if (devToolsPosition.split('-').includes(direction)) return false

    // same logic as above, but the only corner resize that makes
    // sense is the corner fully exposed (the opposing corner)
    const isCorner = direction.includes('-')
    if (isCorner) {
      const opposite = getOppositeCorner(devToolsPosition)
      return direction === opposite
    }

    return true
  }

  // we want the resize lines to be flush with the entire true width of the containers box
  // and we don't want the user of ResizeHandle to have to tell us the border width
  useLayoutEffect(() => {
    if (!resizeRef.current) return

    const element = resizeRef.current
    const computedStyle = window.getComputedStyle(element)

    const borderTop = parseFloat(computedStyle.borderTopWidth) || 0
    const borderRight = parseFloat(computedStyle.borderRightWidth) || 0
    const borderBottom = parseFloat(computedStyle.borderBottomWidth) || 0
    const borderLeft = parseFloat(computedStyle.borderLeftWidth) || 0

    setBorderWidths({
      top: borderTop,
      right: borderRight,
      bottom: borderBottom,
      left: borderLeft,
    })
  }, [resizeRef])

  const handleMouseDown = (mouseDownEvent: React.MouseEvent) => {
    mouseDownEvent.preventDefault()
    if (!resizeRef.current) return
    setDraggingDirection(direction)

    const element = resizeRef.current
    const initialRect = element.getBoundingClientRect()
    const initialLeft = element.offsetLeft
    const initialTop = element.offsetTop
    const startX = mouseDownEvent.clientX
    const startY = mouseDownEvent.clientY

    const handleMouseMove = (mouseMoveEvent: MouseEvent) => {
      const deltaX = mouseMoveEvent.clientX - startX
      const deltaY = mouseMoveEvent.clientY - startY

      const { newWidth, newHeight, newLeft, newTop } = getNewDimensions(
        direction,
        deltaX,
        deltaY,
        initialRect,
        initialLeft,
        initialTop,
        minWidth,
        minHeight
      )

      element.style.width = `${newWidth}px`
      element.style.height = `${newHeight}px`

      if (direction.includes('left') || direction === 'left') {
        element.style.left = `${newLeft}px`
      }
      if (direction.includes('top') || direction === 'top') {
        element.style.top = `${newTop}px`
      }
    }

    const handleMouseUp = () => {
      setDraggingDirection(null)
      document.removeEventListener('mousemove', handleMouseMove)
      document.removeEventListener('mouseup', handleMouseUp)

      // invariant ref exists
      const { width, height } = resizeRef.current!.getBoundingClientRect()
      localStorage.setItem(
        STORAGE_KEY_DIMENSIONS,
        JSON.stringify({ width, height })
      )
    }
    document.addEventListener('mousemove', handleMouseMove)
    document.addEventListener('mouseup', handleMouseUp)
  }

  if (!shouldShowHandle()) {
    return null
  }
  const totalHorizontalBorder = borderWidths.left + borderWidths.right
  const totalVerticalBorder = borderWidths.top + borderWidths.bottom

  const isCornerHandle = direction.includes('-')

  return (
    <>
      {/* this is what actually captures the events, its partially on the container, and partially off */}
      <div
        className={`resize-container ${direction}`}
        onMouseDown={handleMouseDown}
      />

      {/* this panel appears to capture the click, but its just a visual indicator for user of the resize target */}
      {!isCornerHandle && (
        <div
          className={`resize-line ${direction} ${draggingDirection === direction ? 'dragging' : ''}`}
          style={
            {
              // we want the resize line to appear to come out of the back
              // of the div flush with the full box, otherwise there are a
              // few px missing and it looks jank
              '--border-horizontal': `${totalHorizontalBorder}px`,
              '--border-vertical': `${totalVerticalBorder}px`,
              '--border-top': `${borderWidths.top}px`,
              '--border-right': `${borderWidths.right}px`,
              '--border-bottom': `${borderWidths.bottom}px`,
              '--border-left': `${borderWidths.left}px`,
            } as React.CSSProperties
          }
        />
      )}
      <style jsx>{`
        .resize-container {
          position: absolute;
          /* todo: better z index */
          z-index: 10;
          /* todo: is this needed */
          background: transparent;
        }

        .resize-line {
          position: absolute;
          /* todo smarter z index */
          z-index: -1;
          pointer-events: none;
          /* a normal exit animation curve- at this point the exit animation is */
          /* immediately responsive so we don't need a bespoke curve */
          transition: transform 0.4s cubic-bezier(0.4, 0, 0.2, 1);
          /* todo: better var? */
          border: 1px solid var(--color-gray-100);
        }

        /* start really fast because we start super hidden initially behind the panel, otherwise feels like an unintended animation delay */
        .resize-container:hover ~ .resize-line {
          transition: transform 0.2s cubic-bezier(0.05, 0.9, 0.2, 1); /* Fast start for animate in */
        }

        .resize-container.right,
        .resize-container.left {
          top: 0;
          height: 100%;
          width: 25px;
          cursor: ew-resize;
        }

        /* todo: don't hard code all these values/use vars */

        .resize-container.bottom,
        .resize-container.top {
          left: 0;
          width: 100%;
          height: 25px;
          cursor: ns-resize;
        }

        .resize-container.top {
          top: -12px;
        }
        .resize-container.bottom {
          bottom: -12px;
        }
        .resize-container.left {
          left: -12px;
        }
        .resize-container.right {
          right: -12px;
        }

        .resize-container.top-left,
        .resize-container.top-right,
        .resize-container.bottom-left,
        .resize-container.bottom-right {
          width: 32px;
          height: 32px;
          z-index: 15;
        }

        .resize-container.top-left {
          top: -16px;
          left: -16px;
          cursor: nwse-resize;
        }
        .resize-container.top-right {
          top: -16px;
          right: -16px;
          cursor: nesw-resize;
        }
        .resize-container.bottom-left {
          bottom: -16px;
          left: -16px;
          cursor: nesw-resize;
        }
        .resize-container.bottom-right {
          bottom: -16px;
          right: -16px;
          cursor: nwse-resize;
        }

        .resize-line.top,
        .resize-line.bottom {
          height: 28px;
          width: 100%;
          background-color: var(--color-background-100);
        }

        .resize-line.left,
        .resize-line.right {
          width: 28px;
          height: 100%;
          background-color: var(--color-background-100);
        }

        .resize-line.top {
          top: -12px;
          left: calc(-1 * var(--border-left, 2px));
          width: calc(100% + var(--border-horizontal, 4px));
          border-radius: var(--rounded-md) var(--rounded-md) 0 0;
          transform: translateY(28px);
        }

        .resize-line.bottom {
          bottom: -12px;
          left: calc(-1 * var(--border-left, 2px));
          width: calc(100% + var(--border-horizontal, 4px));
          border-radius: 0 0 var(--rounded-md) var(--rounded-md);
          transform: translateY(-28px);
        }

        .resize-line.left {
          top: calc(-1 * var(--border-top, 2px));
          left: -12px;
          height: calc(100% + var(--border-vertical, 4px));
          border-radius: var(--rounded-md) 0 0 var(--rounded-md);
          transform: translateX(28px);
        }

        .resize-line.right {
          top: calc(-1 * var(--border-top, 2px));
          right: -12px;
          height: calc(100% + var(--border-vertical, 4px));
          border-radius: 0 var(--rounded-md) var(--rounded-md) 0;
          transform: translateX(-28px);
        }

        .resize-container.right:hover ~ .resize-line.right,
        .resize-container.left:hover ~ .resize-line.left,
        .resize-line.right.dragging,
        .resize-line.left.dragging {
          transform: translateX(0);
        }

        .resize-container.bottom:hover ~ .resize-line.bottom,
        .resize-container.top:hover ~ .resize-line.top,
        .resize-line.bottom.dragging,
        .resize-line.top.dragging {
          transform: translateY(0);
        }
      `}</style>
    </>
  )
}

const getNewDimensions = (
  direction: ResizeDirection,
  deltaX: number,
  deltaY: number,
  initialRect: DOMRect,
  initialLeft: number,
  initialTop: number,
  minWidth: number,
  minHeight: number
) => {
  const maxWidth = window.innerWidth * 0.95
  const maxHeight = window.innerHeight * 0.95

  switch (direction) {
    case 'right':
      return {
        newWidth: Math.min(
          maxWidth,
          Math.max(minWidth, initialRect.width + deltaX)
        ),
        newHeight: initialRect.height,
        newLeft: initialLeft,
        newTop: initialTop,
      }

    case 'left': {
      const newWidth = Math.min(
        maxWidth,
        Math.max(minWidth, initialRect.width - deltaX)
      )
      const widthDiff = newWidth - initialRect.width
      return {
        newWidth,
        newHeight: initialRect.height,
        newLeft: initialLeft - widthDiff,
        newTop: initialTop,
      }
    }

    case 'bottom':
      return {
        newWidth: initialRect.width,
        newHeight: Math.min(
          maxHeight,
          Math.max(minHeight, initialRect.height + deltaY)
        ),
        newLeft: initialLeft,
        newTop: initialTop,
      }

    case 'top': {
      const newHeight = Math.min(
        maxHeight,
        Math.max(minHeight, initialRect.height - deltaY)
      )
      const heightDiff = newHeight - initialRect.height
      return {
        newWidth: initialRect.width,
        newHeight,
        newLeft: initialLeft,
        newTop: initialTop - heightDiff,
      }
    }

    case 'top-left': {
      const newWidth = Math.min(
        maxWidth,
        Math.max(minWidth, initialRect.width - deltaX)
      )
      const newHeight = Math.min(
        maxHeight,
        Math.max(minHeight, initialRect.height - deltaY)
      )
      const widthDiff = newWidth - initialRect.width
      const heightDiff = newHeight - initialRect.height
      return {
        newWidth,
        newHeight,
        newLeft: initialLeft - widthDiff,
        newTop: initialTop - heightDiff,
      }
    }

    case 'top-right': {
      const newHeight = Math.min(
        maxHeight,
        Math.max(minHeight, initialRect.height - deltaY)
      )
      const heightDiff = newHeight - initialRect.height
      return {
        newWidth: Math.min(
          maxWidth,
          Math.max(minWidth, initialRect.width + deltaX)
        ),
        newHeight,
        newLeft: initialLeft,
        newTop: initialTop - heightDiff,
      }
    }

    case 'bottom-left': {
      const newWidth = Math.min(
        maxWidth,
        Math.max(minWidth, initialRect.width - deltaX)
      )
      const widthDiff = newWidth - initialRect.width
      return {
        newWidth,
        newHeight: Math.min(
          maxHeight,
          Math.max(minHeight, initialRect.height + deltaY)
        ),
        newLeft: initialLeft - widthDiff,
        newTop: initialTop,
      }
    }

    case 'bottom-right':
      return {
        newWidth: Math.min(
          maxWidth,
          Math.max(minWidth, initialRect.width + deltaX)
        ),
        newHeight: Math.min(
          maxHeight,
          Math.max(minHeight, initialRect.height + deltaY)
        ),
        newLeft: initialLeft,
        newTop: initialTop,
      }
    default: {
      direction satisfies never
      return null!
    }
  }
}
