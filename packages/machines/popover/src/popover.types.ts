import type { StateMachine as S } from "@zag-js/core"
import type { PositioningOptions, Placement } from "@zag-js/popper"
import type { Context, MaybeElement } from "@zag-js/types"

type ElementIds = Partial<{
  anchor: string
  trigger: string
  content: string
  title: string
  description: string
  closeBtn: string
}>

type PublicContext = {
  /**
   * The ids of the elements in the popover. Useful for composition.
   */
  ids?: ElementIds
  /**
   * Whether the popover should be modal. When set to `true`:
   * - interaction with outside elements will be disabled
   * - only popover content will be visible to screen readers
   * - focus is trapped within the popover
   * - scrolling is blocked
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
  closeOnBlur?: boolean
  /**
   * Whether to close the popover when the escape key is pressed.
   */
  closeOnEsc?: boolean
  /**
   * Function invoked when the popover is opened.
   */
  onOpen?: () => void
  /**
   * Function invoked when the popover is closed.
   */
  onClose?: () => void
  /**
   * The user provided options used to position the popover content
   */
  positioning: PositioningOptions
  /**
   * Whether to open the popover on page load
   */
  open?: boolean
}

export type UserDefinedContext = Partial<PublicContext>

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
    anchor: boolean
  }
  /**
   * @internal
   * The computed placement (maybe different from initial placement)
   */
  currentPlacement?: Placement
  /**
   * @internal
   * Whether the dynamic placement has been computed
   */
  isPlacementComplete?: boolean
}>

export type MachineContext = PublicContext & ComputedContext & PrivateContext

export type MachineState = {
  value: "unknown" | "open" | "closed"
}

export type State = S.State<MachineContext, MachineState>

export type Send = S.Send<S.AnyEventObject>
