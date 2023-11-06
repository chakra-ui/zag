import type { StateMachine as S } from "@zag-js/core"
import type { CommonProperties, Context, DirectionProperty, PropTypes, RequiredBy } from "@zag-js/types"

/* -----------------------------------------------------------------------------
 * Callback details
 * -----------------------------------------------------------------------------*/

export interface OpenChangeDetails {
  open: boolean
}

/* -----------------------------------------------------------------------------
 * Machine context
 * -----------------------------------------------------------------------------*/

type ElementIds = Partial<{
  root: string
  content: string
  trigger: string
}>

interface PublicContext extends DirectionProperty, CommonProperties {
  /**
   * The ids of the elements in the collapsible. Useful for composition.
   */
  ids?: ElementIds
  /**
   * If `true`, the collapsible will be disabled
   */
  disabled?: boolean
  /**
   * Function called when the popup is opened
   */
  onOpenChange?: (details: OpenChangeDetails) => void
  /**
   * Whether the collapsible is open
   */
  open: boolean
  /**
   * Whether the collapsible is animated
   */
  animate?: boolean
  /**
   * Name of the expand animation
   */
  expandAnimationName?: string
  /**
   * Name of the collapse animation
   */
  collapseAnimationName?: string
  /**
   * Duration of the animation in milliseconds
   * @default 300
   */
  animationDuration: number
}

type ComputedContext = Readonly<{
  /**
   * Whether the collapsible is disabled
   */
  isDisabled: boolean
  /**
   * Whether the collapsible is open
   */
  isOpen: boolean
  /**
   * Whether the collapsible is animated
   */
  isAnimated: boolean
  /**
   * Duration of the collapsible animation, 0 if not animated
   */
  duration: number
}>

type PrivateContext = Context<{
  /**
   * @internal
   * Whether the trigger is pressed
   */
  active?: boolean
  /**
   * @internal
   * Whether the trigger has focus
   */
  focused?: boolean
  /**
   * @internal
   * Whether the trigger is hovered
   */
  hovered?: boolean
  /**
   * @internal
   * Whether the trigger is opening
   */
  opening?: boolean
  /**
   * @internal
   * Whether the trigger is closing
   */
  closing?: boolean
}>

export type UserDefinedContext = RequiredBy<PublicContext, "id">

export interface MachineContext extends PublicContext, PrivateContext, ComputedContext {}

export type MachineState = {
  value: "open" | "closed" | "opening" | "closing"
  tags: "hidden"
}

export type State = S.State<MachineContext, MachineState>

export type Send = S.Send<S.AnyEventObject>

/* -----------------------------------------------------------------------------
 * Component API
 * -----------------------------------------------------------------------------*/

export interface MachineApi<T extends PropTypes = PropTypes> {
  /**
   * Whether the collapsible is open.
   */
  isOpen: boolean
  /**
   * Whether the collapsible is disabled
   */
  isDisabled: boolean
  /**
   * Whether the checkbox is focused
   */
  isFocused: boolean | undefined
  /**
   * Whether the checkbox is animated
   */
  isAnimated: boolean
  /**
   * Function to open the collapsible.
   */
  open(): void
  /**
   * Function to close the collapsible.
   */
  close(): void
  rootProps: T["element"]
  triggerProps: T["button"]
  contentProps: T["element"]
}
