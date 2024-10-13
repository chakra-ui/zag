import type { Machine, StateMachine as S } from "@zag-js/core"
import type { DismissableElementHandlers, PersistentElementOptions } from "@zag-js/dismissable"
import type { Placement, PositioningOptions } from "@zag-js/popper"
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
  anchor: string
  trigger: string
  content: string
  title: string
  description: string
  closeTrigger: string
  positioner: string
  arrow: string
}>

interface PublicContext
  extends CommonProperties,
    DirectionProperty,
    DismissableElementHandlers,
    PersistentElementOptions {
  /**
   * The ids of the elements in the popover. Useful for composition.
   */
  ids?: ElementIds | undefined
  /**
   * Whether the popover should be modal. When set to `true`:
   * - interaction with outside elements will be disabled
   * - only popover content will be visible to screen readers
   * - scrolling is blocked
   * - focus is trapped within the popover
   *
   * @default false
   */
  modal?: boolean | undefined
  /**
   * Whether the popover is portalled. This will proxy the tabbing behavior regardless of the DOM position
   * of the popover content.
   *
   * @default true
   */
  portalled?: boolean | undefined
  /**
   * Whether to automatically set focus on the first focusable
   * content within the popover when opened.
   *
   * @default true
   */
  autoFocus?: boolean | undefined
  /**
   * The element to focus on when the popover is opened.
   */
  initialFocusEl?: (() => HTMLElement | null) | undefined
  /**
   * Whether to close the popover when the user clicks outside of the popover.
   * @default true
   */
  closeOnInteractOutside?: boolean | undefined
  /**
   * Whether to close the popover when the escape key is pressed.
   * @default true
   */
  closeOnEscape?: boolean | undefined
  /**
   * Function invoked when the popover opens or closes
   */
  onOpenChange?: ((details: OpenChangeDetails) => void) | undefined
  /**
   * The user provided options used to position the popover content
   */
  positioning: PositioningOptions
  /**
   * Whether the popover is open
   */
  open?: boolean | undefined
  /**
   * Whether the popover is controlled by the user
   */
  "open.controlled"?: boolean | undefined
}

export type UserDefinedContext = RequiredBy<PublicContext, "id">

type ComputedContext = Readonly<{
  /**
   * @computed
   * The computed value of `portalled`
   */
  currentPortalled: boolean
}>

interface PrivateContext {
  /**
   * @internal
   * The elements that are rendered on mount
   */
  renderedElements: {
    title: boolean
    description: boolean
  }
  /**
   * @internal
   * The computed placement (maybe different from initial placement)
   */
  currentPlacement?: Placement | undefined
}

export interface MachineContext extends PublicContext, ComputedContext, PrivateContext {}

export interface MachineState {
  value: "open" | "closed"
}

export type State = S.State<MachineContext, MachineState>

export type Send = S.Send<S.AnyEventObject>

export type Service = Machine<MachineContext, MachineState, S.AnyEventObject>

/* -----------------------------------------------------------------------------
 * Component API
 * -----------------------------------------------------------------------------*/

export interface MachineApi<T extends PropTypes = PropTypes> {
  /**
   * Whether the popover is portalled.
   */
  portalled: boolean
  /**
   * Whether the popover is open
   */
  open: boolean
  /**
   * Function to open or close the popover
   */
  setOpen(open: boolean): void
  /**
   * Function to reposition the popover
   */
  reposition(options?: Partial<PositioningOptions>): void

  getArrowProps(): T["element"]
  getArrowTipProps(): T["element"]
  getAnchorProps(): T["element"]
  getTriggerProps(): T["button"]
  getIndicatorProps(): T["element"]
  getPositionerProps(): T["element"]
  getContentProps(): T["element"]
  getTitleProps(): T["element"]
  getDescriptionProps(): T["element"]
  getCloseTriggerProps(): T["button"]
}

/* -----------------------------------------------------------------------------
 * Re-exported types
 * -----------------------------------------------------------------------------*/

export type { Placement, PositioningOptions }
