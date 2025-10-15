import type { AutoUpdateOptions, Middleware, Placement } from "@floating-ui/dom"
import { arrow, autoUpdate, computePosition, flip, hide, limitShift, offset, shift, size } from "@floating-ui/dom"
import { getComputedStyle, getWindow, raf } from "@zag-js/dom-query"
import { compact, isNull, noop } from "@zag-js/utils"
import { getAnchorElement } from "./get-anchor"
import { createTransformOriginMiddleware, rectMiddleware, shiftArrowMiddleware } from "./middleware"
import { getPlacementDetails } from "./placement"
import type { MaybeFn } from "@zag-js/types"
import type { MaybeElement, MaybeRectElement, PositioningOptions } from "./types"

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

type NonNullable<T> = T extends null | undefined ? never : T
type RequiredBy<T, K extends keyof T> = Omit<T, K> & { [P in K]-?: NonNullable<T[P]> }

interface Options
  extends RequiredBy<
    PositioningOptions,
    | "strategy"
    | "placement"
    | "listeners"
    | "gutter"
    | "flip"
    | "slide"
    | "overlap"
    | "sameWidth"
    | "fitViewport"
    | "overflowPadding"
    | "arrowPadding"
  > {}

function roundByDpr(win: Window, value: number) {
  const dpr = win.devicePixelRatio || 1
  return Math.round(value * dpr) / dpr
}

function resolveBoundaryOption(boundary: Options["boundary"]) {
  if (typeof boundary === "function") return boundary()
  if (boundary === "clipping-ancestors") return "clippingAncestors"
  return boundary
}

function getArrowMiddleware(arrowElement: HTMLElement | null, doc: Document, opts: Options) {
  const element = arrowElement || doc.createElement("div")
  return arrow({ element, padding: opts.arrowPadding })
}

function getOffsetMiddleware(arrowElement: HTMLElement | null, opts: Options) {
  if (isNull(opts.offset ?? opts.gutter)) return
  return offset(({ placement }) => {
    const arrowOffset = (arrowElement?.clientHeight || 0) / 2

    const gutter = opts.offset?.mainAxis ?? opts.gutter
    const mainAxis = typeof gutter === "number" ? gutter + arrowOffset : (gutter ?? arrowOffset)

    const { hasAlign } = getPlacementDetails(placement)
    const shift = !hasAlign ? opts.shift : undefined
    const crossAxis = opts.offset?.crossAxis ?? shift

    return compact({
      crossAxis: crossAxis as number,
      mainAxis: mainAxis,
      alignmentAxis: opts.shift as number,
    })
  })
}

function getFlipMiddleware(opts: Options) {
  if (!opts.flip) return
  const boundary = resolveBoundaryOption(opts.boundary)
  return flip({
    ...(boundary ? { boundary } : undefined),
    padding: opts.overflowPadding,
    fallbackPlacements: (opts.flip === true ? undefined : opts.flip) as Placement[],
  })
}

function getShiftMiddleware(opts: Options) {
  if (!opts.slide && !opts.overlap) return
  const boundary = resolveBoundaryOption(opts.boundary)
  return shift({
    ...(boundary ? { boundary } : undefined),
    mainAxis: opts.slide,
    crossAxis: opts.overlap,
    padding: opts.overflowPadding,
    limiter: limitShift(),
  })
}

function getSizeMiddleware(opts: Options) {
  return size({
    padding: opts.overflowPadding,
    apply({ elements, rects, availableHeight, availableWidth }) {
      const floating = elements.floating

      const referenceWidth = Math.round(rects.reference.width)
      const referenceHeight = Math.round(rects.reference.height)
      availableWidth = Math.floor(availableWidth)
      availableHeight = Math.floor(availableHeight)

      floating.style.setProperty("--reference-width", `${referenceWidth}px`)
      floating.style.setProperty("--reference-height", `${referenceHeight}px`)
      floating.style.setProperty("--available-width", `${availableWidth}px`)
      floating.style.setProperty("--available-height", `${availableHeight}px`)
    },
  })
}

function hideWhenDetachedMiddleware(opts: Options) {
  if (!opts.hideWhenDetached) return
  return hide({ strategy: "referenceHidden", boundary: resolveBoundaryOption(opts.boundary) ?? "clippingAncestors" })
}

function getAutoUpdateOptions(opts?: boolean | AutoUpdateOptions): AutoUpdateOptions {
  if (!opts) return {}
  if (opts === true) {
    return { ancestorResize: true, ancestorScroll: true, elementResize: true, layoutShift: true }
  }
  return opts
}

function getPlacementImpl(referenceOrVirtual: MaybeRectElement, floating: MaybeElement, opts: PositioningOptions = {}) {
  const reference = getAnchorElement(referenceOrVirtual, opts.getAnchorRect)
  if (!floating || !reference) return
  const options = Object.assign({}, defaultOptions, opts) as Options

  /* -----------------------------------------------------------------------------
   * The middleware stack
   * -----------------------------------------------------------------------------*/

  const arrowEl = floating.querySelector<HTMLElement>("[data-part=arrow]")

  const middleware: (Middleware | undefined)[] = [
    getOffsetMiddleware(arrowEl, options),
    getFlipMiddleware(options),
    getShiftMiddleware(options),
    getArrowMiddleware(arrowEl, floating.ownerDocument, options),
    shiftArrowMiddleware(arrowEl),
    createTransformOriginMiddleware(
      { gutter: options.gutter, offset: options.offset, overlap: options.overlap },
      arrowEl,
    ),
    getSizeMiddleware(options),
    hideWhenDetachedMiddleware(options),
    rectMiddleware,
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
    const x = roundByDpr(win, pos.x)
    const y = roundByDpr(win, pos.y)

    floating.style.setProperty("--x", `${x}px`)
    floating.style.setProperty("--y", `${y}px`)

    if (options.hideWhenDetached) {
      const isHidden = pos.middlewareData.hide?.referenceHidden
      if (isHidden) {
        floating.style.setProperty("visibility", "hidden")
        floating.style.setProperty("pointer-events", "none")
      } else {
        floating.style.removeProperty("visibility")
        floating.style.removeProperty("pointer-events")
      }
    }

    const contentEl = floating.firstElementChild

    if (contentEl) {
      const styles = getComputedStyle(contentEl)
      floating.style.setProperty("--z-index", styles.zIndex)
    }
  }

  const update = async () => {
    if (opts.updatePosition) {
      await opts.updatePosition({ updatePosition, floatingElement: floating })
      onPositioned?.({ placed: true })
    } else {
      await updatePosition()
    }
  }

  const autoUpdateOptions = getAutoUpdateOptions(options.listeners)
  const cancelAutoUpdate = options.listeners ? autoUpdate(reference, floating, update, autoUpdateOptions) : noop

  update()

  return () => {
    cancelAutoUpdate?.()
    onPositioned?.({ placed: false })
  }
}

export function getPlacement(
  referenceOrFn: MaybeFn<MaybeRectElement>,
  floatingOrFn: MaybeFn<MaybeElement>,
  opts: PositioningOptions & { defer?: boolean | undefined } = {},
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
