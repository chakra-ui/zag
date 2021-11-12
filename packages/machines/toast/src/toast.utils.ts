import { DOM } from "../utils/types"
import { ToastMachineContext, ToastPlacement, ToastType } from "./toast.machine"

export function getPositionStyle(position: ToastPlacement): React.CSSProperties {
  const top = position.includes("top")

  const verticalStyle: React.CSSProperties = top ? { top: 0 } : { bottom: 0 }
  const horizontalStyle: React.CSSProperties = position.includes("center")
    ? { justifyContent: "center" }
    : position.includes("right")
    ? { justifyContent: "flex-end" }
    : {}

  return {
    left: 0,
    right: 0,
    display: "flex",
    position: "absolute",
    transition: "all 230ms cubic-bezier(.21,1.02,.73,1)",
    ...verticalStyle,
    ...horizontalStyle,
  }
}

export const defaultTimeouts: Record<ToastType, number> = {
  blank: 4000,
  error: 4000,
  success: 2000,
  // https://stackoverflow.com/questions/3468607/why-does-settimeout-break-for-large-millisecond-delay-values
  loading: 2147483647,
  custom: 4000,
}

export function getToastDuration(duration: number | undefined, type: ToastMachineContext["type"]) {
  return duration ?? defaultTimeouts[type]
}

const placementMap = {
  top: "calc(env(safe-area-inset-top) + 1rem)",
  left: "calc(env(safe-area-inset-left) + 1rem)",
  right: "calc(env(safe-area-inset-right) + 1rem)",
  bottom: "calc(env(safe-area-inset-bottom) + 1rem)",
}

export function getPlacementStyle(placement: ToastPlacement): DOM.Style {
  const isTopOrBottom = placement === "top" || placement === "bottom"

  const styles = Object.fromEntries(Object.entries(placementMap).filter(([key]) => placement.includes(key)))

  return {
    ...styles,
    position: "fixed",
    zIndex: 9999,
    pointerEvents: "none",
    display: "flex",
    flexDirection: "column",
    margin: isTopOrBottom ? "0 auto" : undefined,
  }
}
