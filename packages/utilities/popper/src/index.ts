import {
  arrow,
  computePosition,
  flip,
  getScrollParents,
  Middleware,
  offset,
  Placement,
  shift,
  size,
} from "@floating-ui/dom"
import { observeElementRect } from "@ui-machines/dom-utils"
import { noop } from "@ui-machines/utils"
import { cssVars, positionArrow, transformOrigin } from "./middleware"

export type { Placement }

export type PlacementOptions = {
  arrow?: { padding?: number; element?: HTMLElement; size?: number; shadowColor?: string }
  strategy?: "absolute" | "fixed"
  placement?: Placement
  offset?: { mainAxis?: number; crossAxis?: number }
  gutter?: number
  flip?: boolean
  sameWidth?: boolean
  boundary?: "clippingParents" | Element | Element[]
  eventListeners?: boolean | { scroll?: boolean; resize?: boolean }
  onPlacementComplete?(placement: Placement): void
  onCleanup?: VoidFunction
}

const defaultOpts: PlacementOptions = {
  strategy: "absolute",
  placement: "bottom",
  eventListeners: true,
  gutter: 8,
  flip: true,
  boundary: "clippingParents",
  sameWidth: false,
}

export function getPlacement(reference: HTMLElement | null, floating: HTMLElement | null, opts: PlacementOptions = {}) {
  if (reference == null || floating == null) {
    return noop
  }

  opts = Object.assign({}, defaultOpts, opts)
  const win = reference.ownerDocument.defaultView || window

  const middleware: Middleware[] = [transformOrigin]

  if (opts.flip) {
    middleware.push(flip({ boundary: opts.boundary, padding: 8 }))
  }

  if (opts.gutter || opts.offset) {
    const data = opts.gutter ? { mainAxis: opts.gutter } : opts.offset
    middleware.push(offset(data))
  }

  middleware.push(shift({ boundary: opts.boundary }))

  if (opts.arrow?.element) {
    middleware.push(
      arrow({
        element: opts.arrow.element,
        padding: opts.arrow.padding ?? 8,
      }),
      positionArrow({ element: opts.arrow?.element }),
    )
  }

  if (opts.sameWidth) {
    middleware.push(
      size({
        apply({ reference }) {
          Object.assign(floating.style, {
            width: reference.width + "px",
            minWidth: "unset",
          })
        },
      }),
    )
  }

  function compute() {
    if (reference == null || floating == null) return
    computePosition(reference, floating, {
      placement: opts.placement,
      middleware,
      strategy: opts.strategy,
    }).then(({ x, y, placement, strategy }) => {
      Object.assign(floating.style, { left: `${x}px`, top: `${y}px`, position: strategy })
      opts.onPlacementComplete?.(placement)
    })
  }

  function addResizeListeners() {
    const enabled = typeof opts.eventListeners === "boolean" ? opts.eventListeners : opts.eventListeners?.resize
    if (!enabled) return

    const unobserve = observeElementRect(reference!, compute)
    win.addEventListener("resize", compute)

    return () => {
      win.removeEventListener("resize", compute)
      unobserve()
    }
  }

  function addScrollListeners() {
    const enabled = typeof opts.eventListeners === "boolean" ? opts.eventListeners : opts.eventListeners?.scroll
    if (!enabled || reference == null) return
    const fns = getScrollParents(reference).map((el) => {
      el.addEventListener("scroll", compute)
      return () => {
        el.removeEventListener("scroll", compute)
      }
    })
    return () => {
      fns.forEach((fn) => fn())
    }
  }

  compute()
  const cleanups = [addResizeListeners(), addScrollListeners()]
  return function cleanup() {
    opts.onCleanup?.()
    cleanups.forEach((fn) => fn?.())
  }
}

/* -----------------------------------------------------------------------------
 * Recommended Style (Floating, Arrow, Inner Arrow)
 * -----------------------------------------------------------------------------*/

type ArrowStyleOptions = {
  size?: number
  background?: string
  shadowColor?: string
  measured?: boolean
}

export function getArrowStyle(opts: ArrowStyleOptions = {}) {
  const { size = 8, background, shadowColor, measured } = opts
  return {
    position: "absolute",
    [cssVars.arrowSize.variable]: `${size}px`,
    width: cssVars.arrowSize.reference,
    height: cssVars.arrowSize.reference,
    [cssVars.arrowSizeHalf.variable]: `calc(${cssVars.arrowSize.reference} / 2)`,
    [cssVars.arrowOffset.variable]: `calc(${cssVars.arrowSizeHalf.reference} * -1)`,
    [cssVars.arrowBg.variable]: background,
    [cssVars.arrowShadowColor.variable]: shadowColor,
    ...(!measured && { opacity: 0 }),
  } as const
}

export const innerArrowStyle = {
  transform: "rotate(45deg)",
  background: cssVars.arrowBg.reference,
  top: "0",
  left: "0",
  width: "100%",
  height: "100%",
  position: "absolute",
  zIndex: "inherit",
} as const

const UNMEASURED_FLOATING_STYLE = {
  top: "0",
  left: "0",
  position: "fixed",
  opacity: 0,
  transform: "translate3d(0, -200%, 0)",
} as const

export function getFloatingStyle(measured = false) {
  return {
    position: "absolute",
    minWidth: "max-content",
    ...(!measured && UNMEASURED_FLOATING_STYLE),
  } as const
}
