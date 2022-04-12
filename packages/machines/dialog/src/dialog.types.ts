import type { Context, MaybeElement } from "@zag-js/types"

type IdMap = Partial<{
  trigger: string
  underlay: string
  backdrop: string
  content: string
  closeBtn: string
  title: string
  description: string
}>

export type MachineContext = Context<{
  /**
   * The ids of the elements in the dialog. Useful for composition.
   */
  ids?: IdMap
  /**
   * @internal Whether the dialog title is rendered
   */
  isTitleRendered: boolean
  /**
   * @internal Whether the dialog description is rendered
   */
  isDescriptionRendered: boolean
  /**
   * Whether to trap focus inside the dialog when it's opened
   */
  trapFocus: boolean
  /**
   * Whether to prevent scrolling behind the dialog when it's opened
   */
  preventScroll: boolean
  /**
   * Element to receive focus when the dialog is opened
   */
  initialFocusEl?: MaybeElement | (() => MaybeElement)
  /**
   * Element to receive focus when the dialog is closed
   */
  finalFocusEl?: MaybeElement | (() => MaybeElement)
  /**
   * @internal Whether the dialog is the topmost dialog (in a nested dialog scenario)
   */
  isTopMostDialog: boolean
  /**
   * Whether to restore focus to the element that had focus before the dialog was opened
   */
  restoreFocus?: boolean
  /**
   * Callback to be invoked when the dialog is closed
   */
  onClose?: () => void
  /**
   * Whether to close the dialog when the outside is clicked
   */
  closeOnOutsideClick: boolean
  /**
   * Callback to be invoked when the outside is clicked
   */
  onOutsideClick?: () => void
  /**
   * Whether to close the dialog when the escape key is pressed
   */
  closeOnEsc: boolean
  /**
   * Callback to be invoked when the escape key is pressed
   */
  onEsc?: () => void
  /**
   * Human readable label for the dialog, in event the dialog title is not rendered
   */
  "aria-label"?: string
  /**
   * The dialog's role
   * @default "dialog"
   */
  role: "dialog" | "alertdialog"
}>

export type MachineState = {
  value: "unknown" | "open" | "closed"
}
