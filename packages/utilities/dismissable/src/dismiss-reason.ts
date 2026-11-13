import type { FocusOutsideEvent, PointerDownOutsideEvent } from "@zag-js/interact-outside"

export type DismissReason = "escape-key" | "interact-outside" | "focus-outside"

/** Why a dismissable layer was dismissed, from the event passed to `onDismiss` */
export function getDismissReason(event?: KeyboardEvent | PointerDownOutsideEvent | FocusOutsideEvent): DismissReason {
  if (event?.type === "keydown") return "escape-key"
  if (event?.type === "focus.outside") return "focus-outside"
  return "interact-outside"
}
