import type { Machine, StateMachine as S } from "@zag-js/core"
import type { DismissableElementHandlers, PersistentElementOptions } from "@zag-js/dismissable"
import type { CommonProperties, DirectionProperty, PropTypes, RequiredBy } from "@zag-js/types"

/* -----------------------------------------------------------------------------
 * Callback details
 * -----------------------------------------------------------------------------*/

export interface OpenChangeDetails {
  open: boolean
}

/* -----------------------------------------------------------------------------
 * Machine context
 * -----------------------------------------------------------------------------*/

export type ElementIds = Partial<{
  trigger: string
  positioner: string
  backdrop: string
  content: string
  closeTrigger: string
  title: string
  description: string
}>

interface PublicContext
  extends DirectionProperty,
    CommonProperties,
    DismissableElementHandlers,
    PersistentElementOptions {
  /**
   * The ids of the elements in the dialog. Useful for composition.
   */
  ids?: ElementIds
  /**
   * Whether to trap focus inside the dialog when it's opened
   * @default true
   */
  trapFocus: boolean
  /**
   * Whether to prevent scrolling behind the dialog when it's opened
   * @default true
   */
  preventScroll: boolean
  /**
   * Whether to prevent pointer interaction outside the element and hide all content below it
   * @default true
   */
  modal?: boolean
  /**
   * Element to receive focus when the dialog is opened
   */
  initialFocusEl?: () => HTMLElement | null
  /**
   * Element to receive focus when the dialog is closed
   */
  finalFocusEl?: () => HTMLElement | null
  /**
   * Whether to restore focus to the element that had focus before the dialog was opened
   */
  restoreFocus?: boolean
  /**
   * Callback to be invoked when the dialog is opened or closed
   */
  onOpenChange?: (details: OpenChangeDetails) => void
  /**
   * Whether to close the dialog when the outside is clicked
   * @default true
   */
  closeOnInteractOutside: boolean
  /**
   * Whether to close the dialog when the escape key is pressed
   * @default true
   */
  closeOnEscape: boolean
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
  /**
   * Whether the dialog is controlled by the user
   */
  "open.controlled"?: boolean
}

export type UserDefinedContext = RequiredBy<PublicContext, "id">

type ComputedContext = Readonly<{}>

interface PrivateContext {
  /**
   * @internal
   * Whether some elements are rendered
   */
  renderedElements: {
    title: boolean
    description: boolean
  }
}

export interface MachineContext extends PublicContext, PrivateContext, ComputedContext {}

export interface MachineState {
  value: "open" | "closed"
}

export type State = S.State<MachineContext, MachineState>

export type Send = S.Send<S.AnyEventObject>

export type Service = Machine<MachineContext, MachineState, S.AnyEventObject>

/* -----------------------------------------------------------------------------
 * Component props
 * -----------------------------------------------------------------------------*/

export interface MachineApi<T extends PropTypes = PropTypes> {
  /**
   * Whether the dialog is open
   */
  open: boolean
  /**
   * Function to open or close the dialog
   */
  setOpen(open: boolean): void

  getTriggerProps(): T["button"]
  getBackdropProps(): T["element"]
  getPositionerProps(): T["element"]
  getContentProps(): T["element"]
  getTitleProps(): T["element"]
  getDescriptionProps(): T["element"]
  getCloseTriggerProps(): T["button"]
}
