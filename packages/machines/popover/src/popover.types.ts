import type { StateMachine as S } from "@zag-js/core"
import type { DismissableElementHandlers } from "@zag-js/dismissable"
import type { Placement, PositioningOptions } from "@zag-js/popper"
import type { CommonProperties, Context, MaybeElement, PropTypes, RequiredBy } from "@zag-js/types"

type ElementIds = Partial<{
  anchor: string
  trigger: string
  content: string
  title: string
  description: string
  closeTrigger: string
  positioner: string
  arrow: string
}>

type PublicContext = DismissableElementHandlers &
  CommonProperties & {
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
     * Function invoked when the popover is closed
     */
    onClose?: VoidFunction
    /**
     * Function invoked when the popover is opened
     */
    onOpen?: VoidFunction
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

export type MachineContext = PublicContext & ComputedContext & PrivateContext

export type MachineState = {
  value: "open" | "closed"
}

export type State = S.State<MachineContext, MachineState>

export type Send = S.Send<S.AnyEventObject>

export type { Placement, PositioningOptions }

export type MachineApi<T extends PropTypes = PropTypes> = {
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
  setPositioning(options?: Partial<PositioningOptions>): void
  arrowProps: T["element"]
  arrowTipProps: T["element"]
  anchorProps: T["element"]
  triggerProps: T["button"]
  positionerProps: T["element"]
  contentProps: T["element"]
  titleProps: T["element"]
  descriptionProps: T["element"]
  closeTriggerProps: T["button"]
}
