import type { VirtualElement } from "@floating-ui/dom"
import { arrow, computePosition, flip, Middleware, offset, shift, size } from "@floating-ui/dom"
import { getOwnerDocument } from "@zag-js/dom-utils"
import { noop, pipe } from "@zag-js/utils"
import { autoUpdate } from "./auto-update"
import { shiftArrow, transformOrigin } from "./middleware"
import { PositioningOptions } from "./types"

const defaultOptions: PositioningOptions = {
  strategy: "absolute",
  placement: "bottom",
  listeners: true,
  gutter: 8,
  flip: true,
  sameWidth: false,
}

export function getPlacement(
  reference: HTMLElement | VirtualElement | null,
  floating: HTMLElement | null,
  options: PositioningOptions = {},
) {
  if (reference == null || floating == null) return noop

  options = Object.assign({}, defaultOptions, options)

  /* -----------------------------------------------------------------------------
   * The middleware stack
   * -----------------------------------------------------------------------------*/

  const middleware: Middleware[] = [transformOrigin]

  if (options.flip) {
    middleware.push(flip({ boundary: options.boundary, padding: 8 }))
  }

  if (options.gutter || options.offset) {
    const data = options.gutter ? { mainAxis: options.gutter } : options.offset
    middleware.push(offset(data))
  }

  middleware.push(shift({ boundary: options.boundary }))

  const doc = getOwnerDocument(floating)
  const arrowEl = doc.querySelector<HTMLElement>("[data-part=arrow]")
  if (arrowEl) {
    middleware.push(arrow({ element: arrowEl, padding: 8 }), shiftArrow({ element: arrowEl }))
  }

  if (options.sameWidth) {
    middleware.push(
      size({
        apply(data) {
          const { width } = data.reference
          Object.assign(floating.style, { width: `${width}px`, minWidth: "unset" })
        },
      }),
    )
  }

  /* -----------------------------------------------------------------------------
   * The actual positioning function
   * -----------------------------------------------------------------------------*/

  function compute() {
    if (reference == null || floating == null) return
    const { placement, strategy } = options

    computePosition(reference, floating, { placement, middleware, strategy })
      .then((data) => {
        const { x, y, strategy } = data
        Object.assign(floating.style, { left: `${x}px`, top: `${y}px`, position: strategy })
        return data
      })
      .then((data) => {
        options.onComplete?.(data)
      })
  }

  compute()

  // prettier-ignore
  return pipe(
      autoUpdate(reference, floating, compute, options.listeners),
      options.onCleanup ?? noop
    )
}
