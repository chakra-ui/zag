import type { StateMachine as S } from "@zag-js/core"
import type { Context, DirectionProperty, MaybeElement } from "@zag-js/types"

//

type ElementIds = Partial<{
  trigger: string
  underlay: string
  backdrop: string
  content: string
  closeBtn: string
  title: string
  description: string
}>

//

type PublicContext = DirectionProperty & {
  /**
   * The ids of the elements in the dialog. Useful for composition.
   */
  ids?: ElementIds
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
  /**
   * Whether to open or close the dialog on setup
   * @default false
   */
  isOpen?: boolean
}

export type UserDefinedContext = Partial<PublicContext>

//

type ComputedContext = Readonly<{}>

//

type PrivateContext = Context<{
  /**
   * @internal
   * Whether the dialog title is rendered
   */
  isTitleRendered: boolean
  /**
   * @internal
   * Whether the dialog description is rendered
   */
  isDescriptionRendered: boolean
  /**
   * @internal
   * Whether the dialog is the topmost dialog (in a nested dialog scenario)
   */
  isTopMostDialog: boolean
}>

//

export type MachineContext = PublicContext & PrivateContext & ComputedContext

//

export type MachineState = {
  value: "unknown" | "open" | "closed"
}

export type State = S.State<MachineContext, MachineState>

//

export type Send = S.Send<S.AnyEventObject>
