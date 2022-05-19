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

export const transformOrigin: Middleware = {
  name: "transformOrigin",
  fn({ placement, elements }) {
    const { floating, reference } = elements
    const { height: triggerHeight, width: triggerWidth } = reference.getBoundingClientRect()
    const { height: floatingHeight, width: floatingWidth } = floating.getBoundingClientRect()

    const transforms = {
      top: "bottom center",
      "top-start": `${triggerWidth / 2}px bottom`,
      "top-end": `${floatingWidth - triggerWidth / 2}px bottom`,
      bottom: "top center",
      "bottom-start": `${triggerWidth / 2}px top`,
      "bottom-end": `${floatingWidth - triggerWidth / 2}px top`,
      left: "right center",
      "left-start": `right ${triggerHeight / 2}px`,
      "left-end": `right ${floatingHeight - triggerHeight / 2}px`,
      right: "left center",
      "right-start": `left ${triggerHeight / 2}px`,
      "right-end": `left ${floatingHeight - triggerHeight / 2}px`,
    }

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
