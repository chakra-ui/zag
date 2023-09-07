import type { Middleware, Placement, VirtualElement } from "@floating-ui/dom"
import { type ComputePositionConfig, arrow, computePosition, flip, offset, shift, size } from "@floating-ui/dom"
import { raf } from "@zag-js/dom-query"
import { callAll, compact } from "@zag-js/utils"
import { autoUpdate } from "./auto-update"
import { shiftArrow, transformOrigin } from "./middleware"
import type { BasePlacement, PositioningOptions } from "./types"

const defaultOptions: PositioningOptions = {
  strategy: "absolute",
  placement: "bottom",
  listeners: true,
  gutter: 8,
  flip: true,
  sameWidth: false,
  overflowPadding: 8,
}

type MaybeRectElement = HTMLElement | VirtualElement | null
type MaybeElement = HTMLElement | null
type MaybeFn<T> = T | (() => T)

function getPlacementImpl(reference: MaybeRectElement, floating: MaybeElement, opts: PositioningOptions = {}) {
  if (!floating || !reference) return

  const options = Object.assign({}, defaultOptions, opts)

  /* -----------------------------------------------------------------------------
   * The middleware stack
   * -----------------------------------------------------------------------------*/

  const arrowEl = floating.querySelector<HTMLElement>("[data-part=arrow]")
  const middleware: Middleware[] = []

  const boundary = typeof options.boundary === "function" ? options.boundary() : options.boundary

  if (options.flip) {
    middleware.push(
      flip({
        boundary,
        padding: options.overflowPadding,
      }),
    )
  }

  if (options.gutter || options.offset) {
    const arrowOffset = arrowEl ? arrowEl.offsetHeight / 2 : 0

    let mainAxis = options.offset?.mainAxis ?? options.gutter
    let crossAxis = options.offset?.crossAxis

    if (mainAxis != null) mainAxis += arrowOffset

    const offsetOptions = compact({ mainAxis, crossAxis })
    middleware.push(offset(offsetOptions))
  }

  middleware.push(
    shift({
      boundary,
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
      },
    }),
  )

  /* -----------------------------------------------------------------------------
   * The actual positioning function
   * -----------------------------------------------------------------------------*/

  function compute(config: Omit<ComputePositionConfig, "platform"> = {}) {
    if (!reference || !floating) return
    const { placement, strategy, onComplete } = options

    computePosition(reference, floating, {
      placement,
      middleware,
      strategy,
      ...config,
    }).then((data) => {
      const x = Math.round(data.x)
      floating.style.setProperty("--x", `${x}px`)

      const y = Math.round(data.y)
      floating.style.setProperty("--y", `${y}px`)

      onComplete?.(data)
    })
  }

  compute()

  return callAll(
    options.listeners ? autoUpdate(reference, floating, compute, options.listeners) : undefined,
    options.onCleanup,
  )
}

export function getBasePlacement(placement: Placement): BasePlacement {
  return placement.split("-")[0] as BasePlacement
}

export function getPlacement(
  referenceOrFn: MaybeFn<MaybeRectElement>,
  floatingOrFn: MaybeFn<MaybeElement>,
  opts: PositioningOptions & { defer?: boolean } = {},
) {
  const { defer, ...restOptions } = opts
  const func = defer ? raf : (v: any) => v()
  const cleanups: (VoidFunction | undefined)[] = []
  cleanups.push(
    func(() => {
      const reference = typeof referenceOrFn === "function" ? referenceOrFn() : referenceOrFn
      const floating = typeof floatingOrFn === "function" ? floatingOrFn() : floatingOrFn
      cleanups.push(getPlacementImpl(reference, floating, restOptions))
    }),
  )
  return () => {
    cleanups.forEach((fn) => fn?.())
  }
}
