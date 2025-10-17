import type { Machine, Service } from "@zag-js/core"
import type { DismissableElementHandlers, PersistentElementOptions } from "@zag-js/dismissable"
import type { CommonProperties, DirectionProperty, MaybeElement, PropTypes, RequiredBy } from "@zag-js/types"

/* -----------------------------------------------------------------------------
 * Callback details
 * -----------------------------------------------------------------------------*/

export interface OpenChangeDetails {
  open: boolean
}

export interface ActiveTriggerChangeDetails {
  /**
   * The value of the trigger that activated the dialog
   */
  value: string | null
}

/* -----------------------------------------------------------------------------
 * Machine context
 * -----------------------------------------------------------------------------*/

export type ElementIds = Partial<{
  trigger: string | ((value?: string) => string)
  positioner: string
  backdrop: string
  content: string
  closeTrigger: string
  title: string
  description: string
}>

export interface DialogProps
  extends DirectionProperty,
    CommonProperties,
    DismissableElementHandlers,
    PersistentElementOptions {
  /**
   * The ids of the elements in the dialog. Useful for composition.
   */
  ids?: ElementIds | undefined
  /**
   * Whether to trap focus inside the dialog when it's opened
   * @default true
   */
  trapFocus?: boolean | undefined
  /**
   * Whether to prevent scrolling behind the dialog when it's opened
   * @default true
   */
  preventScroll?: boolean | undefined
  /**
   * Whether to prevent pointer interaction outside the element and hide all content below it
   * @default true
   */
  modal?: boolean | undefined
  /**
   * Element to receive focus when the dialog is opened
   */
  initialFocusEl?: (() => MaybeElement) | undefined
  /**
   * Element to receive focus when the dialog is closed
   */
  finalFocusEl?: (() => MaybeElement) | undefined
  /**
   * Whether to restore focus to the element that had focus before the dialog was opened
   */
  restoreFocus?: boolean | undefined
  /**
   * Whether to close the dialog when the outside is clicked
   * @default true
   */
  closeOnInteractOutside?: boolean | undefined
  /**
   * Whether to close the dialog when the escape key is pressed
   * @default true
   */
  closeOnEscape?: boolean | undefined
  /**
   * Human readable label for the dialog, in event the dialog title is not rendered
   */
  "aria-label"?: string | undefined
  /**
   * The dialog's role
   * @default "dialog"
   */
  role?: "dialog" | "alertdialog" | undefined
  /**
   * The controlled open state of the dialog
   */
  open?: boolean | undefined
  /**
   * The initial open state of the dialog when rendered.
   * Use when you don't need to control the open state of the dialog.
   * @default false
   */
  defaultOpen?: boolean | undefined
  /**
   * Function to call when the dialog's open state changes
   */
  onOpenChange?: ((details: OpenChangeDetails) => void) | undefined
  /**
   * The controlled active trigger value
   */
  activeTriggerValue?: string | null | undefined
  /**
   * The initial active trigger value when rendered.
   * Use when you don't need to control the active trigger value.
   */
  defaultActiveTriggerValue?: string | null | undefined
  /**
   * Function to call when the active trigger changes
   */
  onActiveTriggerChange?: ((details: ActiveTriggerChangeDetails) => void) | undefined
}

type PropsWithDefault =
  | "closeOnInteractOutside"
  | "closeOnEscape"
  | "role"
  | "modal"
  | "trapFocus"
  | "restoreFocus"
  | "preventScroll"
  | "initialFocusEl"

export interface DialogSchema {
  props: RequiredBy<DialogProps, PropsWithDefault>
  state: "open" | "closed"
  context: {
    rendered: { title: boolean; description: boolean }
    activeTriggerValue: string | null
  }
  guard: "isOpenControlled"
  effect: "trackDismissableElement" | "preventScroll" | "trapFocus" | "hideContentBelow"
  action:
    | "checkRenderedElements"
    | "syncZIndex"
    | "invokeOnClose"
    | "invokeOnOpen"
    | "toggleVisibility"
    | "setActiveTrigger"

  event: {
    type: "CONTROLLED.OPEN" | "CONTROLLED.CLOSE" | "OPEN" | "CLOSE" | "TOGGLE" | "ACTIVE_TRIGGER.SET"
    value?: string | null | undefined
  }
}

export type DialogService = Service<DialogSchema>

export type DialogMachine = Machine<DialogSchema>

/* -----------------------------------------------------------------------------
 * Component props
 * -----------------------------------------------------------------------------*/

export interface TriggerProps {
  /**
   * The value that identifies this specific trigger
   */
  value?: string
}

export interface DialogApi<T extends PropTypes = PropTypes> {
  /**
   * Whether the dialog is open
   */
  open: boolean
  /**
   * Function to open or close the dialog
   */
  setOpen: (open: boolean) => void
  /**
   * The active trigger value
   */
  activeTriggerValue: string | null
  /**
   * Function to set the active trigger value
   */
  setActiveTriggerValue: (value: string | null) => void

  getTriggerProps: (props?: TriggerProps) => T["button"]
  getBackdropProps: () => T["element"]
  getPositionerProps: () => T["element"]
  getContentProps: () => T["element"]
  getTitleProps: () => T["element"]
  getDescriptionProps: () => T["element"]
  getCloseTriggerProps: () => T["button"]
}
