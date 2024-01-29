import type { Middleware } from "@floating-ui/dom"
import { arrow, computePosition, flip, offset, shift, size } from "@floating-ui/dom"
import { getWindow, raf } from "@zag-js/dom-query"
import { compact, isNull, runIfFn } from "@zag-js/utils"
import { autoUpdate } from "./auto-update"
import { getAnchorElement } from "./get-anchor"
import { __shiftArrow, __transformOrigin } from "./middleware"
import { getPlacementDetails } from "./placement"
import type { MaybeElement, MaybeFn, MaybeRectElement, PositioningOptions } from "./types"

const defaultOptions: PositioningOptions = {
  strategy: "absolute",
  placement: "bottom",
  listeners: true,
  gutter: 8,
  flip: true,
  slide: true,
  overlap: false,
  sameWidth: false,
  fitViewport: false,
  overflowPadding: 8,
  arrowPadding: 4,
}

function __dpr(win: Window, value: number) {
  const dpr = win.devicePixelRatio || 1
  return Math.round(value * dpr) / dpr
}

function __boundary(opts: PositioningOptions) {
  return runIfFn(opts.boundary)
}

function __arrow(arrowElement: HTMLElement | null, opts: PositioningOptions) {
  if (!arrowElement) return
  return arrow({
    element: arrowElement,
    padding: opts.arrowPadding,
  })
}

function __offset(arrowElement: HTMLElement | null, opts: PositioningOptions) {
  if (isNull(opts.offset ?? opts.gutter)) return
  return offset(({ placement }) => {
    const arrowOffset = (arrowElement?.clientHeight || 0) / 2

    const gutter = opts.offset?.mainAxis ?? opts.gutter
    const mainAxis = typeof gutter === "number" ? gutter + arrowOffset : gutter ?? arrowOffset

    const { hasAlign } = getPlacementDetails(placement)

    return compact({
      crossAxis: hasAlign ? opts.shift : undefined,
      mainAxis: mainAxis,
      alignmentAxis: opts.shift,
    })
  })
}

function __flip(opts: PositioningOptions) {
  if (!opts.flip) return
  return flip({
    boundary: __boundary(opts),
    padding: opts.overflowPadding,
    fallbackPlacements: opts.flip === true ? undefined : opts.flip,
  })
}

function __shift(opts: PositioningOptions) {
  if (!opts.slide && !opts.overlap) return
  return shift({
    boundary: __boundary(opts),
    mainAxis: opts.slide,
    crossAxis: opts.overlap,
    padding: opts.overflowPadding,
  })
}

function __size(opts: PositioningOptions) {
  return size({
    padding: opts.overflowPadding,
    apply({ elements, rects, availableHeight, availableWidth }) {
      const floating = elements.floating

      const referenceWidth = Math.round(rects.reference.width)
      availableWidth = Math.floor(availableWidth)
      availableHeight = Math.floor(availableHeight)

      floating.style.setProperty("--reference-width", `${referenceWidth}px`)
      floating.style.setProperty("--available-width", `${availableWidth}px`)
      floating.style.setProperty("--available-height", `${availableHeight}px`)
    },
  })
}

function getPlacementImpl(referenceOrVirtual: MaybeRectElement, floating: MaybeElement, opts: PositioningOptions = {}) {
  const reference = getAnchorElement(referenceOrVirtual, opts.getAnchorRect)

  if (!floating || !reference) return

  const options = Object.assign({}, defaultOptions, opts)

  /* -----------------------------------------------------------------------------
   * The middleware stack
   * -----------------------------------------------------------------------------*/

  const arrowEl = floating.querySelector<HTMLElement>("[data-part=arrow]")

  const middleware: (Middleware | undefined)[] = [
    __offset(arrowEl, options),
    __flip(options),
    __shift(options),
    __arrow(arrowEl, options),
    __shiftArrow(arrowEl),
    __transformOrigin,
    __size(options),
  ]

  /* -----------------------------------------------------------------------------
   * The actual positioning function
   * -----------------------------------------------------------------------------*/

  const { placement, strategy, onComplete, onPositioned } = options

  const updatePosition = async () => {
    if (!reference || !floating) return

    const pos = await computePosition(reference, floating, {
      placement,
      middleware,
      strategy,
    })

    onComplete?.(pos)
    onPositioned?.({ placed: true })

    const win = getWindow(floating)
    const x = __dpr(win, pos.x)
    const y = __dpr(win, pos.y)

    floating.style.setProperty("--x", `${x}px`)
    floating.style.setProperty("--y", `${y}px`)

    const contentEl = floating.firstElementChild

    if (contentEl) {
      const zIndex = win.getComputedStyle(contentEl).zIndex
      floating.style.setProperty("--z-index", zIndex)
    }
  }

  const update = async () => {
    if (opts.updatePosition) {
      await opts.updatePosition({ updatePosition })
      onPositioned?.({ placed: true })
    } else {
      await updatePosition()
    }
  }

  const cancelAutoUpdate = options.listeners ? autoUpdate(reference, floating, update, options.listeners) : undefined

  update()

  return () => {
    cancelAutoUpdate?.()
    onPositioned?.({ placed: false })
  }
}

export function getPlacement(
  referenceOrFn: MaybeFn<MaybeRectElement>,
  floatingOrFn: MaybeFn<MaybeElement>,
  opts: PositioningOptions & { defer?: boolean } = {},
) {
  const { defer, ...options } = opts
  const func = defer ? raf : (v: any) => v()
  const cleanups: (VoidFunction | undefined)[] = []
  cleanups.push(
    func(() => {
      const reference = typeof referenceOrFn === "function" ? referenceOrFn() : referenceOrFn
      const floating = typeof floatingOrFn === "function" ? floatingOrFn() : floatingOrFn
      cleanups.push(getPlacementImpl(reference, floating, options))
    }),
  )
  return () => {
    cleanups.forEach((fn) => fn?.())
  }
}
