import { ToastMachineContext, ToastPlacement, ToastType } from "./toast.machine"

export function getPositionStyle(
  position: ToastPlacement,
): React.CSSProperties {
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
  loading: Infinity,
  custom: 4000,
}

export function getToastDuration(options: any, toast: ToastMachineContext) {
  return (
    toast.duration ??
    options[toast.type!]?.duration ??
    options?.duration ??
    defaultTimeouts[toast.type!]
  )
}
