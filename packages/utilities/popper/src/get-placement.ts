import type { VirtualElement } from "@floating-ui/dom"
import { arrow, computePosition, flip, Middleware, offset, shift, size } from "@floating-ui/dom"
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
  overflowPadding: 8,
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
  const arrowEl = floating.querySelector<HTMLElement>("[data-part=arrow]")

  if (options.flip) {
    middleware.push(
      flip({
        boundary: options.boundary,
        padding: options.overflowPadding,
      }),
    )
  }

  if (options.gutter || options.offset) {
    const arrowOffset = arrowEl ? arrowEl.offsetHeight / 2 : 0
    const data = options.gutter ? { mainAxis: options.gutter } : options.offset
    if (data?.mainAxis != null) data.mainAxis += arrowOffset
    middleware.push(offset(data))
  }

  middleware.push(
    shift({
      boundary: options.boundary,
      crossAxis: options.overlap,
      padding: options.overflowPadding,
    }),
  )

  if (arrowEl) {
    // prettier-ignore
    middleware.push(
      arrow({ element: arrowEl, padding: 8 }),
      shiftArrow({ element: arrowEl })
    )
  }

  if (options.sameWidth || options.fitViewport) {
    middleware.push(
      size({
        padding: options.overflowPadding,
        apply(data) {
          const { reference, height, width } = data

          if (options.sameWidth) {
            Object.assign(floating.style, { width: `${reference.width}px` })
          }

          if (options.fitViewport) {
            Object.assign(floating.style, {
              maxWidth: `${width}px`,
              maxHeight: `${height}px`,
            })
          }
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

    computePosition(reference, floating, {
      placement,
      middleware,
      strategy,
    })
      .then((data) => {
        const x = Math.round(data.x)
        const y = Math.round(data.y)

        Object.assign(floating.style, {
          position: data.strategy,
          top: "0",
          left: "0",
          transform: `translate3d(${x}px, ${y}px, 0)`,
        })

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
