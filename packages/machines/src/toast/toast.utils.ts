import { DOM } from "../utils/types"
import { ToastMachine, ToastMachineContext, ToastPlacement, ToastType } from "./toast.types"

export function getToastsByPlacement(toasts: ToastMachine[]) {
  const result: Partial<Record<ToastPlacement, ToastMachine[]>> = {}

  for (const toast of toasts) {
    const placement = toast.state.context.placement!
    result[placement] ||= []
    result[placement]!.push(toast)
  }

  return result
}

export const defaultTimeouts: Record<ToastType, number> = {
  info: 5000,
  error: 5000,
  success: 2000,
  loading: Number.MAX_SAFE_INTEGER,
  custom: 5000,
}

export function getToastDuration(duration: number | undefined, type: ToastMachineContext["type"]) {
  return duration ?? defaultTimeouts[type]
}

export function getPlacementStyle(placement: ToastPlacement): DOM.Style {
  const isRighty = placement.includes("right")
  const isLefty = placement.includes("left")

  let alignItems = "center"
  if (isRighty) alignItems = "flex-end"
  if (isLefty) alignItems = "flex-start"

  return {
    display: "flex",
    flexDirection: "column",
    alignItems,
    pointerEvents: "auto",
    maxWidth: "35rem",
    minWidth: "18.75rem",
    margin: "calc(var(--toast-gutter) / 2)",
  }
}

const placementMap = {
  top: "env(safe-area-inset-top, 0px)",
  left: "env(safe-area-inset-left, 0px)",
  right: "env(safe-area-inset-right, 0px)",
  bottom: "env(safe-area-inset-bottom, 0px)",
}

export function getGroupPlacementStyle(placement: ToastPlacement): DOM.Style {
  const isTopOrBottom = placement === "top" || placement === "bottom"
  const margin = isTopOrBottom ? "0 auto" : undefined

  const styles: DOM.Style = {
    position: "fixed",
    pointerEvents: "none",
    display: "flex",
    flexDirection: "column",
    margin,
  }

  for (const key in placementMap) {
    if (placement.includes(key)) {
      styles[key] = placementMap[key]
    }
  }

  return styles
}
