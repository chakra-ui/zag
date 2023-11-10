import type { StateMachine as S } from "@zag-js/core"
import type { DismissableElementHandlers } from "@zag-js/dismissable"
import type { Placement, PositioningOptions } from "@zag-js/popper"
import type { CommonProperties, Context, DirectionProperty, MaybeElement, PropTypes, RequiredBy } from "@zag-js/types"

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

interface PublicContext extends DismissableElementHandlers, CommonProperties, DirectionProperty {
  /**
   * The ids of the elements in the popover. Useful for composition.
   */
  ids?: ElementIds
  /**
   * Whether the popover should be modal. When set to `true`:
   * - interaction with outside elements will be disabled
   * - only popover content will be visible to screen readers
   * - scrolling is blocked
   * - focus is trapped within the popover
   *
   * @default false
   */
  modal?: boolean
  /**
   * Whether the popover is rendered in a portal
   *
   * @default true
   */
  portalled?: boolean
  /**
   * Whether to automatically set focus on the first focusable
   * content within the popover when opened.
   */
  autoFocus?: boolean
  /**
   * The element to focus on when the popover is opened.
   */
  initialFocusEl?: MaybeElement | (() => MaybeElement)
  /**
   * Whether to close the popover when the user clicks outside of the popover.
   */
  closeOnInteractOutside?: boolean
  /**
   * Whether to close the popover when the escape key is pressed.
   */
  closeOnEsc?: boolean
  /**
   * Function invoked when the popover opens or closes
   */
  onOpenChange?: (details: OpenChangeDetails) => void
  /**
   * The user provided options used to position the popover content
   */
  positioning: PositioningOptions
  /**
   * Whether the popover is open
   */
  open?: boolean
}

export type UserDefinedContext = RequiredBy<PublicContext, "id">

type ComputedContext = Readonly<{
  /**
   * @computed
   * The computed value of `portalled`
   */
  currentPortalled: boolean
}>

type PrivateContext = Context<{
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
  currentPlacement?: Placement
}>

export interface MachineContext extends PublicContext, ComputedContext, PrivateContext {}

export interface MachineState {
  value: "open" | "closed"
}

export type State = S.State<MachineContext, MachineState>

export type Send = S.Send<S.AnyEventObject>

/* -----------------------------------------------------------------------------
 * Component API
 * -----------------------------------------------------------------------------*/

export interface MachineApi<T extends PropTypes = PropTypes> {
  /**
   * Whether the popover is portalled
   */
  portalled: boolean
  /**
   * Whether the popover is open
   */
  isOpen: boolean
  /**
   * Function to open the popover
   */
  open(): void
  /**
   * Function to close the popover
   */
  close(): void
  /**
   * Function to reposition the popover
   */
  reposition(options?: Partial<PositioningOptions>): void
  arrowProps: T["element"]
  arrowTipProps: T["element"]
  anchorProps: T["element"]
  triggerProps: T["button"]
  indicatorProps: T["element"]
  positionerProps: T["element"]
  contentProps: T["element"]
  titleProps: T["element"]
  descriptionProps: T["element"]
  closeTriggerProps: T["button"]
}

/* -----------------------------------------------------------------------------
 * Re-exported types
 * -----------------------------------------------------------------------------*/

export type { Placement, PositioningOptions }
