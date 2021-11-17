import { Style } from "../utils/types"
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

export function getGroupPlacementStyle(placement: ToastPlacement): Style {
  const isRighty = placement.includes("right")
  const isLefty = placement.includes("left")

  const styles: Style = {
    position: "fixed",
    pointerEvents: "none",
    display: "flex",
    flexDirection: "column",
  }

  let alignItems: Style["alignItems"] = "center"
  if (isRighty) alignItems = "flex-end"
  if (isLefty) alignItems = "flex-start"

  styles.alignItems = alignItems

  if (placement.includes("top")) {
    styles.top = "env(safe-area-inset-top, 0px)"
  }

  if (placement.includes("bottom")) {
    styles.bottom = "env(safe-area-inset-bottom, 0px)"
  }

  if (!placement.includes("left")) {
    styles.right = "env(safe-area-inset-right, 0px)"
  }

  if (!placement.includes("right")) {
    styles.left = "env(safe-area-inset-left, 0px)"
  }

  return styles
}
