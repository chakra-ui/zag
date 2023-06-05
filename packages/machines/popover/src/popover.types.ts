import type { StateMachine as S } from "@zag-js/core"
import type { DismissableElementHandlers } from "@zag-js/dismissable"
import type { PositioningOptions, Placement } from "@zag-js/popper"
import type { CommonProperties, Context, MaybeElement, RequiredBy } from "@zag-js/types"

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

export type { PositioningOptions, Placement }
