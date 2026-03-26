import type { Middleware } from "@floating-ui/dom"
import type { PlacementSide } from "./types"

/* -----------------------------------------------------------------------------
 * Shared middleware utils
 * -----------------------------------------------------------------------------*/

const toVar = (value: string) => ({ variable: value, reference: `var(${value})` })

export const cssVars = {
  arrowSize: toVar("--arrow-size"),
  arrowSizeHalf: toVar("--arrow-size-half"),
  arrowBg: toVar("--arrow-background"),
  transformOrigin: toVar("--transform-origin"),
  arrowOffset: toVar("--arrow-offset"),
}

/* -----------------------------------------------------------------------------
 * Transform Origin Middleware
 * -----------------------------------------------------------------------------*/

/* -----------------------------------------------------------------------------
 * Transform Origin with overlap handling
 * -----------------------------------------------------------------------------*/

const getSideAxis = (side: PlacementSide) => (side === "top" || side === "bottom" ? "y" : "x")

export function createTransformOriginMiddleware(
  opts: {
    gutter?: number | undefined
    offset?: { mainAxis?: number | undefined } | undefined
    overlap?: boolean | undefined
  },
  arrowEl: HTMLElement | null,
): Middleware {
  return {
    name: "transformOrigin",
    fn(state) {
      const { elements, middlewareData, placement, rects, y } = state

      const side = placement.split("-")[0] as PlacementSide
      const axis = getSideAxis(side)

      const arrowX = middlewareData.arrow?.x || 0
      const arrowY = middlewareData.arrow?.y || 0
      const arrowWidth = arrowEl?.clientWidth || 0
      const arrowHeight = arrowEl?.clientHeight || 0
      const transformX = arrowX + arrowWidth / 2
      const transformY = arrowY + arrowHeight / 2

      const shiftY = Math.abs(middlewareData.shift?.y || 0)
      const halfAnchorHeight = rects.reference.height / 2

      const arrowOffset = arrowHeight / 2
      const gutter = opts.offset?.mainAxis ?? opts.gutter
      const sideOffsetValue = typeof gutter === "number" ? gutter + arrowOffset : (gutter ?? arrowOffset)

      const isOverlappingAnchor = shiftY > sideOffsetValue

      const adjacentTransformOrigin = (
        {
          top: `${transformX}px calc(100% + ${sideOffsetValue}px)`,
          bottom: `${transformX}px ${-sideOffsetValue}px`,
          left: `calc(100% + ${sideOffsetValue}px) ${transformY}px`,
          right: `${-sideOffsetValue}px ${transformY}px`,
        } as const
      )[side]
      const overlapTransformOrigin = `${transformX}px ${rects.reference.y + halfAnchorHeight - y}px`

      const useOverlap = Boolean(opts.overlap) && axis === "y" && isOverlappingAnchor

      elements.floating.style.setProperty(
        cssVars.transformOrigin.variable,
        useOverlap ? overlapTransformOrigin : adjacentTransformOrigin,
      )

      return {
        data: {
          transformOrigin: useOverlap ? overlapTransformOrigin : adjacentTransformOrigin,
        },
      }
    },
  }
}

/* -----------------------------------------------------------------------------
 * Rect Middleware (to expose the rect data)
 * -----------------------------------------------------------------------------*/

export const rectMiddleware: Middleware = {
  name: "rects",
  fn({ rects }) {
    return {
      data: rects,
    }
  },
}

/* -----------------------------------------------------------------------------
 * Arrow Middleware
 * -----------------------------------------------------------------------------*/

export const shiftArrowMiddleware = (arrowEl: HTMLElement | null): Middleware | undefined => {
  if (!arrowEl) return
  return {
    name: "shiftArrow",
    fn({ placement, middlewareData }) {
      if (!middlewareData.arrow) return {}
      const { x, y } = middlewareData.arrow
      const dir = placement.split("-")[0] as PlacementSide

      Object.assign(arrowEl.style, {
        left: x != null ? `${x}px` : "",
        top: y != null ? `${y}px` : "",
        [dir]: `calc(100% + ${cssVars.arrowOffset.reference})`,
      })

      return {}
    },
  }
}
