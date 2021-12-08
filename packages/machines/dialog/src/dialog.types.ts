import { Context } from "@ui-machines/types"

export type MachineContext = Context<{
  hasTitle: boolean
  hasDescription: boolean
  trapFocus: boolean
  preventScroll: boolean
  initialFocusEl?: HTMLElement | (() => HTMLElement)
  finalFocusEl?: HTMLElement | (() => HTMLElement)
  isTopMostDialog: boolean
  restoreFocus?: boolean
  onEsc?: () => void
  onClickOutside?: () => void
  closeOnOverlayClick: boolean
  closeOnEsc: boolean
  "aria-label"?: string
  role: "dialog" | "alertdialog"
}>

export type MachineState = {
  value: "unknown" | "open" | "closed"
}
