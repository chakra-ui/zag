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
import { noop } from "@ui-machines/utils"
import { observeElementRect } from "./rect-observer"

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

const transformOrigin: Middleware = {
  name: "transformOrigin",
  fn({ placement, elements }) {
    const { floating } = elements
    floating.style.setProperty("--transform-origin", transforms[placement])
    return {
      data: { origin: transforms[placement] },
    }
  },
}

type PlacementOptions = {
  arrow?: { padding?: number; element?: HTMLElement }
  strategy?: "absolute" | "fixed"
  placement?: Placement
  offset?: { mainAxis?: number; crossAxis?: number }
  gutter?: number
  flip?: boolean
  matchWidth?: boolean
  boundary?: "clippingParents" | Element | Element[]
  direction?: "ltr" | "rtl"
  eventListeners?: boolean | { scroll?: boolean; resize?: boolean }
}

const defaultOpts: PlacementOptions = {
  strategy: "absolute",
  placement: "bottom",
  eventListeners: true,
  gutter: 8,
  flip: true,
  boundary: "clippingParents",
  matchWidth: false,
  direction: "ltr",
}

export function getPlacementData(
  reference: HTMLElement | null,
  floating: HTMLElement | null,
  opts: PlacementOptions = {},
) {
  if (reference == null || floating == null) {
    return { addListeners: noop, compute: noop }
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

  middleware.push(shift())

  if (opts.arrow?.element) {
    middleware.push(
      arrow({
        element: opts.arrow.element,
        padding: opts.arrow.padding ?? 8,
      }),
    )
  }

  if (opts.matchWidth) {
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
    }).then(({ x, y, middlewareData }) => {
      Object.assign(floating.style, { left: `${x}px`, top: `${y}px` })

      const arrowData = middlewareData.arrow
      if (opts.arrow?.element) {
        Object.assign(opts.arrow.element.style, {
          left: arrowData?.x != null ? `${arrowData.x}px` : "",
          top: arrowData?.y != null ? `${arrowData.y}px` : "",
        })
      }
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

  return {
    addListeners() {
      const cleanups = [addResizeListeners(), addScrollListeners()]
      return () => cleanups.forEach((cleanup) => cleanup?.())
    },
    compute: compute,
  }
}

export const DEFAULT_FLOATING_STYLE = {
  position: "absolute",
  minWidth: "max-content",
  inset: "0 auto auto 0",
} as const
