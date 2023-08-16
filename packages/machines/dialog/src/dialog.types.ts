import type { StateMachine as S } from "@zag-js/core"
import type { CommonProperties, Context, DirectionProperty, MaybeElement, PropTypes, RequiredBy } from "@zag-js/types"

type ElementIds = Partial<{
  trigger: string
  container: string
  backdrop: string
  content: string
  closeTrigger: string
  title: string
  description: string
}>

type PublicContext = DirectionProperty &
  CommonProperties & {
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
     * Whether to prevent pointer interaction outside the element and hide all content below it
     */
    modal?: boolean
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
     * Callback to be invoked when the dialog is opened
     */
    onOpen?: () => void
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
     * Whether the dialog is open
     */
    open?: boolean
  }

export type UserDefinedContext = RequiredBy<PublicContext, "id">

type ComputedContext = Readonly<{}>

type PrivateContext = Context<{
  /**
   * @internal
   * Whether some elements are rendered
   */
  renderedElements: {
    title: boolean
    description: boolean
  }
}>

export type MachineContext = PublicContext & PrivateContext & ComputedContext

export type MachineState = {
  value: "open" | "closed"
}

export type State = S.State<MachineContext, MachineState>

export type Send = S.Send<S.AnyEventObject>

export type MachineApi<T extends PropTypes = PropTypes> = {
  /**
   * Whether the dialog is open
   */
  isOpen: boolean
  /**
   * Function to open the dialog
   */
  open(): void
  /**
   * Function to close the dialog
   */
  close(): void
  triggerProps: T["button"]
  backdropProps: T["element"]
  containerProps: T["element"]
  contentProps: T["element"]
  titleProps: T["element"]
  descriptionProps: T["element"]
  closeTriggerProps: T["button"]
}
