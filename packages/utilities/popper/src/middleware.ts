import type { Coords, Middleware } from "@floating-ui/dom"
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

const getTransformOrigin = (arrow?: Partial<Coords>) => ({
  top: "bottom center",
  "top-start": arrow ? `${arrow.x}px bottom` : "left bottom",
  "top-end": arrow ? `${arrow.x}px bottom` : "right bottom",
  bottom: "top center",
  "bottom-start": arrow ? `${arrow.x}px top` : "top left",
  "bottom-end": arrow ? `${arrow.x}px top` : "top right",
  left: "right center",
  "left-start": arrow ? `right ${arrow.y}px` : "right top",
  "left-end": arrow ? `right ${arrow.y}px` : "right bottom",
  right: "left center",
  "right-start": arrow ? `left ${arrow.y}px` : "left top",
  "right-end": arrow ? `left ${arrow.y}px` : "left bottom",
})

export const transformOriginMiddleware: Middleware = {
  name: "transformOrigin",
  fn({ placement, elements, middlewareData }) {
    const { arrow } = middlewareData
    const transformOrigin = getTransformOrigin(arrow)[placement]

    const { floating } = elements
    floating.style.setProperty(cssVars.transformOrigin.variable, transformOrigin)

    return {
      data: { transformOrigin },
    }
  },
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
