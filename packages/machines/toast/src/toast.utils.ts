import type { Service } from "@zag-js/core"
import { MAX_Z_INDEX } from "@zag-js/dom-query"
import type { Style } from "@zag-js/types"
import type { Placement, ToastGroupService, ToastSchema, Type } from "./toast.types"

export const defaultTimeouts: Record<Type, number> = {
  info: 5000,
  error: 5000,
  success: 2000,
  loading: Infinity,
  DEFAULT: 5000,
}

export function getToastDuration(duration: number | undefined, type: Type) {
  return duration ?? defaultTimeouts[type] ?? defaultTimeouts.DEFAULT
}

const getOffsets = (offsets: string | Record<"left" | "right" | "bottom" | "top", string>) =>
  typeof offsets === "string" ? { left: offsets, right: offsets, bottom: offsets, top: offsets } : offsets

export function getGroupPlacementStyle(service: ToastGroupService, placement: Placement): Style {
  const { prop, computed, context } = service
  const { offsets, gap } = prop("store").attrs

  const heights = context.get("heights")
  const computedOffset = getOffsets(offsets)

  const rtl = prop("dir") === "rtl"
  const computedPlacement = placement
    .replace("-start", rtl ? "-right" : "-left")
    .replace("-end", rtl ? "-left" : "-right")

  const isRighty = computedPlacement.includes("right")
  const isLefty = computedPlacement.includes("left")

  const styles: Style = {
    position: "fixed",
    pointerEvents: computed("count") > 0 ? undefined : "none",
    display: "flex",
    flexDirection: "column",
    "--gap": `${gap}px`,
    "--first-height": `${heights[0]?.height || 0}px`,
    "--viewport-offset-left": computedOffset.left,
    "--viewport-offset-right": computedOffset.right,
    "--viewport-offset-top": computedOffset.top,
    "--viewport-offset-bottom": computedOffset.bottom,
    zIndex: MAX_Z_INDEX,
  }

  let alignItems: Style["alignItems"] = "center"
  if (isRighty) alignItems = "flex-end"
  if (isLefty) alignItems = "flex-start"

  styles.alignItems = alignItems

  if (computedPlacement.includes("top")) {
    const offset = computedOffset.top
    styles.top = `max(env(safe-area-inset-top, 0px), ${offset})`
  }

  if (computedPlacement.includes("bottom")) {
    const offset = computedOffset.bottom
    styles.bottom = `max(env(safe-area-inset-bottom, 0px), ${offset})`
  }

  if (!computedPlacement.includes("left")) {
    const offset = computedOffset.right
    styles.insetInlineEnd = `calc(env(safe-area-inset-right, 0px) + ${offset})`
  }

  if (!computedPlacement.includes("right")) {
    const offset = computedOffset.left
    styles.insetInlineStart = `calc(env(safe-area-inset-left, 0px) + ${offset})`
  }

  return styles
}

export function getPlacementStyle(service: Service<ToastSchema>, visible: boolean): Style {
  const { prop, context, computed } = service

  const parent = prop("parent")
  const placement = parent.computed("placement")
  const { gap } = parent.prop("store").attrs

  const [side] = placement.split("-")

  const mounted = context.get("mounted")
  const remainingTime = context.get("remainingTime")

  const height = computed("height")
  const frontmost = computed("frontmost")
  const sibling = !frontmost

  const overlap = !prop("stacked")
  const stacked = prop("stacked")
  const type = prop("type")

  const duration = type === "loading" ? Number.MAX_SAFE_INTEGER : remainingTime
  const offset = computed("heightIndex") * gap + computed("heightBefore")

  const styles: Style = {
    position: "absolute",
    pointerEvents: "auto",
    "--opacity": "0",
    "--remove-delay": `${prop("removeDelay")}ms`,
    "--duration": `${duration}ms`,
    "--initial-height": `${height}px`,
    "--offset": `${offset}px`,
    "--index": prop("index"),
    "--z-index": computed("zIndex"),
    "--lift-amount": "calc(var(--lift) * var(--gap))",
    "--y": "100%",
    "--x": "0",
  }

  const assign = (overrides: Style) => Object.assign(styles, overrides)

  if (side === "top") {
    //
    assign({
      top: "0",
      "--sign": "-1",
      "--y": "-100%",
      "--lift": "1",
    })
    //
  } else if (side === "bottom") {
    //
    assign({
      bottom: "0",
      "--sign": "1",
      "--y": "100%",
      "--lift": "-1",
    })
  }

  if (mounted) {
    assign({
      "--y": "0",
      "--opacity": "1",
    })

    if (stacked) {
      assign({
        "--y": "calc(var(--lift) * var(--offset))",
        "--height": "var(--initial-height)",
      })
    }
  }

  if (!visible) {
    assign({
      "--opacity": "0",
      pointerEvents: "none",
    })
  }

  if (sibling && overlap) {
    assign({
      "--base-scale": "var(--index) * 0.05 + 1",
      "--y": "calc(var(--lift-amount) * var(--index))",
      "--scale": "calc(-1 * var(--base-scale))",
      "--height": "var(--first-height)",
    })

    if (!visible) {
      assign({
        "--y": "calc(var(--sign) * 40%)",
      })
    }
  }

  if (sibling && stacked && !visible) {
    assign({
      "--y": "calc(var(--lift) * var(--offset) + var(--lift) * -100%)",
    })
  }

  if (frontmost && !visible) {
    assign({
      "--y": "calc(var(--lift) * -100%)",
    })
  }

  return styles
}

export function getGhostBeforeStyle(service: Service<ToastSchema>, visible: boolean): Style {
  const { computed } = service
  const styles: Style = {
    position: "absolute",
    inset: "0",
    scale: "1 2",
    pointerEvents: visible ? "none" : "auto",
  }

  const assign = (overrides: Style) => Object.assign(styles, overrides)

  if (computed("frontmost") && !visible) {
    assign({
      height: "calc(var(--initial-height) + 80%)",
    })
  }

  return styles
}

export function getGhostAfterStyle(): Style {
  return {
    position: "absolute",
    left: "0",
    height: "calc(var(--gap) + 2px)",
    bottom: "100%",
    width: "100%",
  }
}
