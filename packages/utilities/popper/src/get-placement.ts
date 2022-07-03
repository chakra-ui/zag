import {
  arrow,
  computePosition,
  ComputePositionConfig,
  flip,
  Middleware,
  offset,
  shift,
  size,
  VirtualElement,
} from "@floating-ui/dom"
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
  _options: PositioningOptions = {},
) {
  if (!floating || !reference) return

  const options = Object.assign({}, defaultOptions, _options)

  /* -----------------------------------------------------------------------------
   * The middleware stack
   * -----------------------------------------------------------------------------*/

  const arrowEl = floating.querySelector<HTMLElement>("[data-part=arrow]")
  const middleware: Middleware[] = []

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
      shiftArrow({ element: arrowEl }),
    )
  }

  middleware.push(transformOrigin)

  middleware.push(
    size({
      padding: options.overflowPadding,
      apply({ rects, availableHeight, availableWidth }) {
        const referenceWidth = Math.round(rects.reference.width)

        floating.style.setProperty("--reference-width", `${referenceWidth}px`)
        floating.style.setProperty("--available-width", `${availableWidth}px`)
        floating.style.setProperty("--available-height", `${availableHeight}px`)

        if (options.sameWidth) {
          Object.assign(floating.style, {
            width: `${referenceWidth}px`,
            minWidth: "unset",
          })
        }

        if (options.fitViewport) {
          Object.assign(floating.style, {
            maxWidth: `${availableWidth}px`,
            maxHeight: `${availableHeight}px`,
          })
        }
      },
    }),
  )

  /* -----------------------------------------------------------------------------
   * The actual positioning function
   * -----------------------------------------------------------------------------*/

  function compute(config: Omit<ComputePositionConfig, "platform"> = {}) {
    if (reference == null || floating == null) return
    const { placement, strategy } = options

    computePosition(reference, floating, {
      placement,
      middleware,
      strategy,
      ...config,
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
        options.onComplete?.({ ...data, compute })
      })
  }

  compute()

  // prettier-ignore
  return pipe(
      autoUpdate(reference, floating, compute, options.listeners),
      options.onCleanup ?? noop
    )
}
