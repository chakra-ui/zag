import { Middleware } from "@floating-ui/dom"

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

export const shiftArrow = (opts: ArrowOptions): Middleware => ({
  name: "shiftArrow",
  fn({ placement, middlewareData }) {
    const { element: arrow } = opts
    const { x, y } = middlewareData.arrow ?? { x: 0, y: 0 }

    const dir = {
      top: "bottom",
      right: "left",
      bottom: "top",
      left: "right",
    }[placement.split("-")[0]]!

    Object.assign(arrow.style, {
      top: `${y}px`,
      left: `${x}px`,
      [dir]: cssVars.arrowOffset.reference,
    })

    return {}
  },
})
