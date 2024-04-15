import { MAX_Z_INDEX } from "@zag-js/dom-query"
import type { Style } from "@zag-js/types"
import type { GroupMachineContext, MachineContext, Placement, Service, Type } from "./toast.types"

export function getToastsByPlacement<T>(toasts: Service<T>[], placement: Placement) {
  return toasts.filter((toast) => toast.state.context.placement === placement)
}

export const defaultTimeouts: Record<Type, number> = {
  info: 5000,
  error: 5000,
  success: 2000,
  loading: Infinity,
  DEFAULT: 5000,
}

export function getToastDuration(duration: number | undefined, type: NonNullable<MachineContext["type"]>) {
  return duration ?? defaultTimeouts[type] ?? defaultTimeouts.DEFAULT
}

export function getGroupPlacementStyle<T>(ctx: GroupMachineContext<T>, placement: Placement): Style {
  const offset = ctx.offsets
  const computedOffset =
    typeof offset === "string" ? { left: offset, right: offset, bottom: offset, top: offset } : offset

  const rtl = ctx.dir === "rtl"
  const computedPlacement = placement
    .replace("-start", rtl ? "-right" : "-left")
    .replace("-end", rtl ? "-left" : "-right")

  const isRighty = computedPlacement.includes("right")
  const isLefty = computedPlacement.includes("left")

  const styles: Style = {
    position: "fixed",
    pointerEvents: ctx.count > 0 ? undefined : "none",
    display: "flex",
    flexDirection: "column",
    "--gap": `${ctx.gap}px`,
    "--first-height": `${ctx.heights[0]?.height || 0}px`,
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

export function getPlacementStyle<T>(ctx: MachineContext<T>, visible: boolean): Style {
  const [side] = ctx.placement!.split("-")
  const sibling = !ctx.frontmost
  const overlap = !ctx.stacked

  const styles: Style = {
    position: "absolute",
    pointerEvents: "auto",
    "--opacity": "0",
    "--remove-delay": `${ctx.removeDelay}ms`,
    "--duration": `${ctx.type === "loading" ? Number.MAX_SAFE_INTEGER : ctx.duration}ms`,
    "--initial-height": `${ctx.height}px`,
    "--offset": `${ctx.offset}px`,
    "--index": ctx.index,
    "--z-index": ctx.zIndex,
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

  if (ctx.mounted) {
    assign({
      "--y": "0",
      "--opacity": "1",
    })

    if (ctx.stacked) {
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

  if (sibling && ctx.stacked && !visible) {
    assign({
      "--y": "calc(var(--lift) * var(--offset) + var(--lift) * -100%)",
    })
  }

  if (ctx.frontmost && !visible) {
    assign({
      "--y": "calc(var(--lift) * -100%)",
    })
  }

  return styles
}

export function getGhostBeforeStyle<T>(ctx: MachineContext<T>, visible: boolean): Style {
  const styles: Style = {
    position: "absolute",
    inset: "0",
    scale: "1 2",
    pointerEvents: visible ? "none" : "auto",
  }

  const assign = (overrides: Style) => Object.assign(styles, overrides)

  if (ctx.frontmost && !visible) {
    assign({
      height: "calc(var(--initial-height) + 80%)",
    })
  }

  return styles
}

export function getGhostAfterStyle<T>(_ctx: MachineContext<T>, _visible: boolean): Style {
  return {
    position: "absolute",
    left: "0",
    height: "calc(var(--gap) + 2px)",
    bottom: "100%",
    width: "100%",
  }
}
