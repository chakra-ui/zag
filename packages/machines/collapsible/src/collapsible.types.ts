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
   * The height of the content
   */
  height?: number
  /**
   * @internal
   * Whether the trigger is hovered
   */
  hovered?: boolean
}>

export type UserDefinedContext = RequiredBy<PublicContext, "id">

export interface MachineContext extends PublicContext, PrivateContext, ComputedContext {}

export type MachineState = {
  value: "open" | "closed"
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
