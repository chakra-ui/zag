import { Context } from "@ui-machines/types"

export type DialogMachineContext = Context<{
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

export type DialogMachineState = {
  value: "unknown" | "open" | "closed"
}
