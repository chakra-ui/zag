import { Middleware, Placement } from "@floating-ui/dom"

/* -----------------------------------------------------------------------------
 * Shared middleware utils
 * -----------------------------------------------------------------------------*/

const toVar = (value: string, fallback?: string | number) => ({
  variable: value,
  reference: fallback ? `var(${value}, ${fallback})` : `var(${value})`,
})

export const cssVars = {
  arrowShadowColor: toVar("--arrow-shadow-color"),
  arrowSize: toVar("--arrow-size"),
  arrowSizeHalf: toVar("--arrow-size-half"),
  arrowBg: toVar("--arrow-background"),
  transformOrigin: toVar("--transform-origin"),
  arrowOffset: toVar("--arrow-offset"),
  boxShadow: toVar("--arrow-box-shadow"),
}

/* -----------------------------------------------------------------------------
 * Transform Origin Middleware
 * -----------------------------------------------------------------------------*/

const transforms = {
  top: "bottom center",
  "top-start": "bottom left",
  "top-end": "bottom right",
  bottom: "top center",
  "bottom-start": "top left",
  "bottom-end": "top right",
  left: "right center",
  "left-start": "right top",
  "left-end": "right bottom",
  right: "left center",
  "right-start": "left top",
  "right-end": "left bottom",
}

export const transformOrigin: Middleware = {
  name: "transformOrigin",
  fn({ placement, elements }) {
    const { floating } = elements
    floating.style.setProperty(cssVars.transformOrigin.variable, transforms[placement])
    return {
      data: { transformOrigin: transforms[placement] },
    }
  },
}

/* -----------------------------------------------------------------------------
 * Arrow Middleware
 * -----------------------------------------------------------------------------*/

type ArrowOptions = { element: HTMLElement }

export const positionArrow = (opts: ArrowOptions): Middleware => ({
  name: "positionArrow",
  fn({ placement, middlewareData }) {
    const { element: arrow } = opts
    const { x, y } = middlewareData.arrow ?? { x: 0, y: 0 }

    const staticSide = {
      top: "bottom",
      right: "left",
      bottom: "top",
      left: "right",
    }[placement.split("-")[0]]

    Object.assign(arrow.style, {
      left: x != null ? `${x}px` : "",
      top: y != null ? `${y}px` : "",
      right: "",
      bottom: "",
      [<string>staticSide]: cssVars.arrowOffset.reference,
      [cssVars.boxShadow.variable]: getBoxShadow(placement)!,
    })

    return {}
  },
})

export function getBoxShadow(placement: Placement) {
  if (placement.includes("top")) return `1px 1px 1px 0 ${cssVars.arrowShadowColor.reference}`
  if (placement.includes("bottom")) return `-1px -1px 1px 0 ${cssVars.arrowShadowColor.reference}`
  if (placement.includes("right")) return `-1px 1px 1px 0 ${cssVars.arrowShadowColor.reference}`
  if (placement.includes("left")) return `1px -1px 1px 0 ${cssVars.arrowShadowColor.reference}`
}
