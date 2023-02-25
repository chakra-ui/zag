import type { Style } from "@zag-js/types"
import type { GroupMachineContext, MachineContext, Placement, Service, Type } from "./toast.types"

export function getToastsByPlacement(toasts: Service[]) {
  const result: Partial<Record<Placement, Service[]>> = {}

  for (const toast of toasts) {
    const placement = toast.state.context.placement!
    result[placement] ||= []
    result[placement]!.push(toast)
  }

  return result
}

export const defaultTimeouts: Record<Type, number> = {
  info: 5000,
  error: 5000,
  success: 2000,
  loading: Infinity,
  custom: 5000,
}

export function getToastDuration(duration: number | undefined, type: MachineContext["type"]) {
  return duration ?? defaultTimeouts[type]
}

export function getGroupPlacementStyle(ctx: GroupMachineContext, placement: Placement): Style {
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
    "--toast-gutter": ctx.gutter,
    zIndex: ctx.zIndex,
  }

  let alignItems: Style["alignItems"] = "center"
  if (isRighty) alignItems = "flex-end"
  if (isLefty) alignItems = "flex-start"

  styles.alignItems = alignItems

  if (computedPlacement.includes("top")) {
    const offset = computedOffset.top
    styles.top = `calc(env(safe-area-inset-top, 0px) + ${offset})`
  }

  if (computedPlacement.includes("bottom")) {
    const offset = computedOffset.bottom
    styles.bottom = `calc(env(safe-area-inset-bottom, 0px) + ${offset})`
  }

  if (!computedPlacement.includes("left")) {
    const offset = computedOffset.right
    styles.right = `calc(env(safe-area-inset-right, 0px) + ${offset})`
  }

  if (!computedPlacement.includes("right")) {
    const offset = computedOffset.left
    styles.left = `calc(env(safe-area-inset-left, 0px) + ${offset})`
  }

  return styles
}
