import type { Scope } from "@zag-js/core"
import { contains, getComputedStyle, getDocument, getScale, getWindow, isWebKit } from "@zag-js/dom-query"
import { getPlacement, type Placement, type PositioningOptions } from "@zag-js/popper"
import type { Point } from "@zag-js/types"
import { clampValue, noop, toPx } from "@zag-js/utils"
import * as dom from "./select.dom"

/* -----------------------------------------------------------------------------
 * Constants
 * -----------------------------------------------------------------------------*/

const SCROLL_EDGE_TOLERANCE_PX = 1
const SCROLL_GROWTH_TOLERANCE_PX = 1
const TRANSFORM_ORIGIN_VAR = "--transform-origin"

const POSITIONER_STYLE_KEYS = [
  "position",
  "left",
  "top",
  "bottom",
  "height",
  "maxHeight",
  "marginTop",
  "marginBottom",
] as const
const CONTENT_STYLE_KEYS = ["height"] as const

type PositionerStyleKey = (typeof POSITIONER_STYLE_KEYS)[number]
type ContentStyleKey = (typeof CONTENT_STYLE_KEYS)[number]

const EMPTY_RESULT: AlignItemWithTriggerReturn = {
  cleanup: noop,
  transformOrigin: "50% 50%",
}

/* -----------------------------------------------------------------------------
 * Types
 * -----------------------------------------------------------------------------*/

type FallbackReason = "viewport-edge" | "min-height" | "pinch-zoom" | "missing-element"

type ScaledRect = ReturnType<typeof getScaledRect>

interface AlignItemWithTriggerOptions {
  triggerEl: HTMLElement | null | undefined
  positionerEl: HTMLElement | null | undefined
  contentEl: HTMLElement | null | undefined
  scrollerEl?: HTMLElement | null | undefined
  valueTextEl?: HTMLElement | null | undefined
  selectedItemTextEl?: HTMLElement | null | undefined
  padding?: { top?: number; bottom?: number; left?: number; right?: number } | undefined
  minHeight?: number | undefined
  triggerCollisionThreshold?: number | undefined
  dir?: "ltr" | "rtl" | undefined
  onFallback?: ((reason: FallbackReason) => void) | undefined
}

interface AlignItemWithTriggerReturn {
  cleanup: () => void
  transformOrigin: string
}

interface TrackAlignItemOptions {
  /** Floating-ui positioning options used when alignment falls back to standard placement. */
  positioning: PositioningOptions
  /** Called when placement changes (fallback mode only). */
  onPlacementChange?: ((placement: Placement) => void) | undefined
  /** Called after each successful alignment pass. */
  onAligned?: VoidFunction | undefined

  dir?: "ltr" | "rtl" | undefined
  minHeight?: number | undefined
  triggerCollisionThreshold?: number | undefined
  padding?: AlignItemWithTriggerOptions["padding"] | undefined

  /** Defer the first alignment pass to the next animation frame. Default: true */
  defer?: boolean | undefined
  /** Re-align on window scroll and resize. Default: true */
  listeners?: boolean | undefined

  /** Called once when alignment yields to normal positioning (informational). */
  onFallback?: ((reason: FallbackReason) => void) | undefined
}

/* -----------------------------------------------------------------------------
 * Helpers
 * -----------------------------------------------------------------------------*/

/** Snapshot inline styles for the given keys. Returns a restore function. */
function captureStyles<K extends string>(el: HTMLElement, keys: readonly K[]) {
  const prev: Record<string, string> = {}
  for (const key of keys) prev[key] = el.style[key as any]
  return () => {
    for (const key of keys) el.style[key as any] = prev[key]
    if (el.style.length === 0) el.removeAttribute("style")
  }
}

/** Bounding rect compensated for CSS scale transforms. */
function getScaledRect(el: HTMLElement, scale: Point) {
  const rect = el.getBoundingClientRect()
  return {
    x: rect.x / scale.x,
    y: rect.y / scale.y,
    width: rect.width / scale.x,
    height: rect.height / scale.y,
    top: rect.top / scale.y,
    left: rect.left / scale.x,
    right: rect.right / scale.x,
    bottom: rect.bottom / scale.y,
  }
}

/* -----------------------------------------------------------------------------
 * alignItemWithTrigger — core positioning (batched reads/writes)
 * -----------------------------------------------------------------------------*/

function alignItemWithTrigger(options: AlignItemWithTriggerOptions): AlignItemWithTriggerReturn {
  const {
    triggerEl,
    positionerEl,
    contentEl,
    scrollerEl: providedScrollerEl,
    valueTextEl,
    selectedItemTextEl,
    padding,
    minHeight = 100,
    triggerCollisionThreshold = 20,
    dir = "ltr",
    onFallback,
  } = options

  if (!triggerEl || !positionerEl || !contentEl || !triggerEl.isConnected || !positionerEl.isConnected) {
    onFallback?.("missing-element")
    return EMPTY_RESULT
  }

  const scroller = providedScrollerEl ?? contentEl
  const doc = getDocument(triggerEl)
  const win = getWindow(triggerEl)

  // ---- PHASE 1: measure (all reads upfront, no writes) ----

  if ((win.visualViewport?.scale ?? 1) !== 1 && isWebKit()) {
    onFallback?.("pinch-zoom")
    return EMPTY_RESULT
  }

  const scale = getScale(triggerEl)
  const triggerRect = getScaledRect(triggerEl, scale)
  const positionerRect = getScaledRect(positionerEl, scale)

  // The content may be offset inside the positioner by margin/padding/border.
  // Vertical scroll math must be relative to content, not positioner.
  const contentRect = contentEl === scroller ? getScaledRect(contentEl, scale) : positionerRect
  const contentOffsetTop = contentRect.top - positionerRect.top
  const scrollHeight = scroller.scrollHeight

  const marginTop = padding?.top ?? 10
  const marginBottom = padding?.bottom ?? 10
  const paddingLeft = padding?.left ?? 5
  const paddingRight = padding?.right ?? 5

  const viewportHeight = doc.documentElement.clientHeight - marginTop - marginBottom
  const viewportWidth = doc.documentElement.clientWidth
  const availableSpaceBeneathTrigger = viewportHeight - triggerRect.bottom + triggerRect.height

  let valueRect: ScaledRect | undefined
  let selectedTextRect: ScaledRect | undefined

  if (valueTextEl && selectedItemTextEl && valueTextEl.isConnected && selectedItemTextEl.isConnected) {
    valueRect = getScaledRect(valueTextEl, scale)
    selectedTextRect = getScaledRect(selectedItemTextEl, scale)
  }

  // ---- PHASE 2: compute (pure math, no DOM access) ----

  let alignedLeft = dir === "rtl" ? triggerRect.right - positionerRect.width : triggerRect.left
  let verticalOffset = 0

  if (valueRect && selectedTextRect) {
    alignedLeft =
      positionerRect.left +
      (dir === "rtl" ? valueRect.right - selectedTextRect.right : valueRect.left - selectedTextRect.left)

    const valueCenterFromTriggerTop = valueRect.top - triggerRect.top + valueRect.height / 2
    const selectedCenterFromPositionerTop = selectedTextRect.top - positionerRect.top + selectedTextRect.height / 2
    verticalOffset = selectedCenterFromPositionerTop - valueCenterFromTriggerTop
  }

  const idealHeight = availableSpaceBeneathTrigger + verticalOffset + marginBottom
  let height = Math.min(viewportHeight, idealHeight)
  const maxHeight = viewportHeight - marginTop - marginBottom
  const scrollTopTarget = idealHeight - height
  const maxRight = viewportWidth - paddingRight

  const nearViewportEdge =
    triggerRect.top < triggerCollisionThreshold || triggerRect.bottom > viewportHeight - triggerCollisionThreshold

  if (nearViewportEdge) {
    onFallback?.("viewport-edge")
    return EMPTY_RESULT
  }

  const clampedLeft = clampValue(alignedLeft, paddingLeft, maxRight - positionerRect.width)

  let transformOrigin = "50% 50%"
  if (selectedTextRect) {
    const textCenterY = selectedTextRect.top + selectedTextRect.height / 2
    const originY = positionerRect.height > 0 ? ((textCenterY - positionerRect.top) / positionerRect.height) * 100 : 50
    transformOrigin = `50% ${clampValue(originY, 0, 100)}%`
  }

  // ---- PHASE 3: first write pass (size the positioner) ----

  const restorePositioner = captureStyles<PositionerStyleKey>(positionerEl, POSITIONER_STYLE_KEYS)
  const restoreContent = captureStyles<ContentStyleKey>(contentEl, CONTENT_STYLE_KEYS)

  positionerEl.style.position = "fixed"
  positionerEl.style.left = toPx(clampedLeft)!
  positionerEl.style.height = toPx(height)!
  positionerEl.style.maxHeight = "auto"
  positionerEl.style.marginTop = toPx(marginTop)!
  positionerEl.style.marginBottom = toPx(marginBottom)!
  contentEl.style.height = "100%"

  // ---- PHASE 4: read (single forced reflow for post-layout metrics) ----
  // CSS max-height on the content may clamp clientHeight below `height`.
  // We need the actual post-layout value to decide top- vs bottom-positioning.

  const actualMaxScrollTop = Math.max(0, scrollHeight - scroller.clientHeight)
  const isTopPositioned = scrollTopTarget >= actualMaxScrollTop - SCROLL_EDGE_TOLERANCE_PX

  if (isTopPositioned) {
    height = Math.min(viewportHeight, positionerRect.height) - (scrollTopTarget - actualMaxScrollTop)
  }

  if (Math.ceil(height) + SCROLL_EDGE_TOLERANCE_PX < Math.min(scrollHeight, minHeight)) {
    restoreContent()
    restorePositioner()
    onFallback?.("min-height")
    return EMPTY_RESULT
  }

  // ---- PHASE 5: final write pass (anchor + scroll) ----

  if (isTopPositioned) {
    const topOffset = Math.max(0, viewportHeight - idealHeight)
    positionerEl.style.top = positionerRect.height >= maxHeight ? "0px" : toPx(topOffset)!
    positionerEl.style.bottom = "auto"
    // Shrink by contentOffsetTop so the scroller gains extra scroll room,
    // compensating for the content being offset inside the positioner.
    const adjustedHeight = Math.max(0, height - contentOffsetTop)
    positionerEl.style.height = toPx(adjustedHeight)!
    scroller.scrollTop = Math.max(0, scrollHeight - adjustedHeight)
  } else {
    positionerEl.style.top = "auto"
    positionerEl.style.bottom = "0px"
    scroller.scrollTop = scrollTopTarget
  }

  return {
    transformOrigin,
    cleanup() {
      restoreContent()
      restorePositioner()
    },
  }
}

/* -----------------------------------------------------------------------------
 * trackAlignItemWithTrigger — lifecycle wrapper
 * -----------------------------------------------------------------------------*/

export interface TrackAlignItemReturn {
  cleanup: VoidFunction
  /** Re-run alignment (e.g., after collection changes). No-op if in fallback mode. */
  realign: VoidFunction
  /** Grow the popup to absorb scroll distance. Call from auto-scroll tick. */
  handleGrowth: VoidFunction
}

export function trackAlignItemWithTrigger(scope: Scope, options: TrackAlignItemOptions): TrackAlignItemReturn {
  const { defer = true, listeners = true, onFallback, onPlacementChange, onAligned } = options

  let currentCleanup: VoidFunction | undefined
  let fallbackCleanup: VoidFunction | undefined
  let disposed = false
  let fellBack = false
  let reachedMaxHeight = false
  let pendingFrame: number | null = null
  let scheduleHandle: number | null = null

  const win = scope.getWin()

  const clearTransformOrigin = () => {
    dom.getContentEl(scope)?.style.removeProperty(TRANSFORM_ORIGIN_VAR)
  }

  // --- Growth handler ---
  // On scroll, grow the positioner to absorb scroll distance instead of
  // moving content. Stops once viewport-max is reached.

  const handleGrowth = () => {
    if (disposed || fellBack || reachedMaxHeight) return

    const positionerEl = dom.getPositionerEl(scope)
    const contentEl = dom.getContentEl(scope)
    if (!positionerEl || !contentEl) return

    const isTopPositioned = positionerEl.style.top === "0px"
    const isBottomPositioned = positionerEl.style.bottom === "0px"
    if (!isTopPositioned && !isBottomPositioned) return

    const scroller = contentEl
    const scale = getScale(positionerEl)
    const currentHeight = positionerEl.getBoundingClientRect().height / scale.y

    const positionerStyles = getComputedStyle(positionerEl)
    const marginTop = parseFloat(positionerStyles.marginTop) || 0
    const marginBottom = parseFloat(positionerStyles.marginBottom) || 0
    const viewportMax = win.document.documentElement.clientHeight - marginTop - marginBottom
    const contentMaxHeight = parseFloat(getComputedStyle(scroller).maxHeight)
    const maxAvailableHeight = contentMaxHeight > 0 ? Math.min(viewportMax, contentMaxHeight) : viewportMax

    const scrollTop = scroller.scrollTop
    const maxScrollTop = Math.max(0, scroller.scrollHeight - scroller.clientHeight)
    const diff = isTopPositioned ? maxScrollTop - scrollTop : scrollTop

    if (diff <= SCROLL_GROWTH_TOLERANCE_PX) return

    const nextHeight = Math.min(currentHeight + diff, maxAvailableHeight)
    if (nextHeight - currentHeight <= SCROLL_GROWTH_TOLERANCE_PX) return

    positionerEl.style.height = toPx(nextHeight)!

    // Rebalance scrollTop so visible content doesn't jump
    if (isBottomPositioned) {
      scroller.scrollTop = 0
    } else {
      scroller.scrollTop = Math.max(0, scroller.scrollHeight - scroller.clientHeight)
    }

    if (nextHeight >= maxAvailableHeight - SCROLL_GROWTH_TOLERANCE_PX) {
      reachedMaxHeight = true
    }
  }

  // --- Fallback ---

  const runFallbackPlacement = () => {
    fallbackCleanup?.()
    fallbackCleanup = getPlacement(
      () => dom.getTriggerEl(scope),
      () => dom.getPositionerEl(scope),
      {
        defer: true,
        ...options.positioning,
        onComplete(data) {
          onPlacementChange?.(data.placement)
        },
      },
    )
  }

  // --- Align ---

  const runAlign = () => {
    if (disposed || fellBack) return
    currentCleanup?.()
    currentCleanup = undefined
    reachedMaxHeight = false

    const result = alignItemWithTrigger({
      triggerEl: dom.getTriggerEl(scope),
      positionerEl: dom.getPositionerEl(scope),
      contentEl: dom.getContentEl(scope),
      valueTextEl: dom.getValueTextEl(scope),
      selectedItemTextEl: dom.getSelectedItemTextEl(scope),
      dir: options.dir,
      minHeight: options.minHeight,
      triggerCollisionThreshold: options.triggerCollisionThreshold,
      padding: options.padding,
      onFallback(reason) {
        fellBack = true
        clearTransformOrigin()
        detachListeners()
        onFallback?.(reason)
        if (!disposed) runFallbackPlacement()
      },
    })

    if (disposed) {
      result.cleanup()
      return
    }
    if (fellBack) return

    currentCleanup = result.cleanup
    dom.getContentEl(scope)?.style.setProperty(TRANSFORM_ORIGIN_VAR, result.transformOrigin)
    onAligned?.()
  }

  // --- Scroll/resize re-alignment ---

  const scheduleAlign = () => {
    if (disposed || fellBack || pendingFrame != null) return
    pendingFrame = win.requestAnimationFrame(() => {
      pendingFrame = null
      runAlign()
    })
  }

  const onScroll = (event: Event) => {
    if (contains(dom.getContentEl(scope), event.target as Element)) return
    scheduleAlign()
  }

  const attachListeners = () => {
    if (!listeners) return
    win.addEventListener("scroll", onScroll, { capture: true, passive: true })
    win.addEventListener("resize", scheduleAlign)
  }

  const detachListeners = () => {
    win.removeEventListener("scroll", onScroll, true)
    win.removeEventListener("resize", scheduleAlign)
  }

  // --- Boot ---

  const boot = () => {
    if (disposed) return
    runAlign()
    if (!fellBack) attachListeners()
  }

  if (defer) {
    scheduleHandle = win.requestAnimationFrame(() => {
      scheduleHandle = null
      boot()
    })
  } else {
    boot()
  }

  // --- Return ---

  return {
    realign: scheduleAlign,
    handleGrowth,
    cleanup() {
      disposed = true
      if (scheduleHandle != null) win.cancelAnimationFrame(scheduleHandle)
      if (pendingFrame != null) win.cancelAnimationFrame(pendingFrame)
      detachListeners()
      currentCleanup?.()
      fallbackCleanup?.()
      clearTransformOrigin()
    },
  }
}
