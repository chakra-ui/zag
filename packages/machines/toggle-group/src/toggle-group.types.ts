import type { Machine, StateMachine as S } from "@zag-js/core"
import type { CommonProperties, DirectionProperty, Orientation, PropTypes, RequiredBy } from "@zag-js/types"

/* -----------------------------------------------------------------------------
 * Callback details
 * -----------------------------------------------------------------------------*/

export interface ValueChangeDetails {
  value: string[]
}

/* -----------------------------------------------------------------------------
 * Machine context
 * -----------------------------------------------------------------------------*/

export type ElementIds = Partial<{
  root: string
  item(value: string): string
}>

interface PublicContext extends DirectionProperty, CommonProperties {
  /**
   * The ids of the elements in the toggle. Useful for composition.
   */
  ids?: ElementIds
  /**
   * Whether the toggle is disabled.
   */
  disabled?: boolean
  /**
   * The values of the toggles in the group.
   */
  value: string[]
  /**
   * Function to call when the toggle is clicked.
   */
  onValueChange?: (details: ValueChangeDetails) => void
  /**
   * Whether to loop focus inside the toggle group.
   * @default true
   */
  loopFocus: boolean
  /**
   *  Whether to use roving tab index to manage focus.
   * @default true
   */
  rovingFocus?: boolean
  /**
   * The orientation of the toggle group.
   * @default "horizontal"
   */
  orientation: Orientation
  /**
   * Whether to allow multiple toggles to be selected.
   */
  multiple?: boolean
}

export type UserDefinedContext = RequiredBy<PublicContext, "id">

type ComputedContext = Readonly<{
  currentLoopFocus: boolean
}>

interface PrivateContext {
  /**
   * @internal
   * Whether the user is tabbing backward.
   */
  isTabbingBackward: boolean
  /**
   * @internal
   * Whether the toggle was focused by a click.
   */
  isClickFocus: boolean
  /**
   * @internal
   * The value of the toggle that was focused.
   */
  focusedId: string | null
  /**
   * @internal
   * Whether the toggle group is within a toolbar.
   * This is used to determine whether to use roving tab index.
   */
  isWithinToolbar: boolean
}

export interface MachineContext extends PublicContext, PrivateContext, ComputedContext {}

export interface MachineState {
  value: "idle" | "focused"
}

export type State = S.State<MachineContext, MachineState>

export type Send = S.Send<S.AnyEventObject>

export type Service = Machine<MachineContext, MachineState, S.AnyEventObject>

/* -----------------------------------------------------------------------------
 * Component API
 * -----------------------------------------------------------------------------*/

export interface ItemProps {
  value: string
  disabled?: boolean
}

export interface ItemState {
  /**
   * The underlying id of the item.
   */
  id: string
  /**
   * Whether the toggle item is disabled.
   */
  disabled: boolean
  /**
   * Whether the toggle item is pressed.
   */
  pressed: boolean
  /**
   * Whether the toggle item is focused.
   */
  focused: boolean
}

export interface MachineApi<T extends PropTypes = PropTypes> {
  /**
   * The value of the toggle group.
   */
  value: string[]
  /**
   * Function to set the value of the toggle group.
   */
  setValue: (values: string[]) => void
  /**
   * Returns the state of the toggle item.
   */
  getItemState(props: ItemProps): ItemState
  getRootProps(): T["element"]
  getItemProps(props: ItemProps): T["button"]
}

/* -----------------------------------------------------------------------------
 * Re-exported types
 * -----------------------------------------------------------------------------*/

export type { Orientation }
