import { arrow, computePosition, flip, Middleware, offset, Placement, shift, size } from "@floating-ui/dom"

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
    floating.style.setPropety("--transform-origin", transforms[placement])
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

export function getPlacementData(reference: HTMLElement, floating: HTMLElement, opts: PlacementOptions) {
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
    middleware.push(arrow({ element: opts.arrow.element, padding: opts.arrow.padding ?? 8 }))
  }

  if (opts.matchWidth) {
    middleware.push(
      size({
        apply({ reference }) {
          Object.assign(floating.style, { width: reference.width })
        },
      }),
    )
  }

  function update() {
    computePosition(reference, floating, {
      placement: opts.placement,
      middleware,
    }).then(({ x, y }) => {
      Object.assign(floating.style, { left: `${x}px`, top: `${y}px` })
    })
  }

  function addResizeListeners() {
    const enabled = typeof opts.eventListeners === "boolean" ? opts.eventListeners : opts.eventListeners?.resize
    if (!enabled) return
    const listener = () => update()
    win.addEventListener("resize", listener)
    return () => win.removeEventListener("resize", listener)
  }

  function addScrollListeners() {
    const enabled = typeof opts.eventListeners === "boolean" ? opts.eventListeners : opts.eventListeners?.scroll
    if (!enabled) return
    const listener = () => update()
    win.addEventListener("scroll", listener)
    return () => win.removeEventListener("scroll", listener)
  }

  return {
    addListeners() {
      const cleanups = [addResizeListeners(), addScrollListeners()]
      return () => cleanups.forEach((cleanup) => cleanup?.())
    },
    compute: update,
    floatingStyle: {
      position: "absolute",
      minWidth: "max-content",
      inset: "0 auto auto 0",
    },
  }
}
