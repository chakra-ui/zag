import type { StateMachine as S } from "@zag-js/core"
import type { CommonProperties, Context, DirectionProperty, Orientation, PropTypes, RequiredBy } from "@zag-js/types"

type ElementIds = Partial<{
  root: string
  toggle(value: string): string
}>

export interface ValueChangeDetails {
  value: string[]
}

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
   */
  loop: boolean
  /**
   *  Whether to use roving tab index to manage focus.
   */
  rovingFocus?: boolean
  /**
   * The orientation of the toggle group.
   */
  orientation: Orientation
  /**
   * Whether to allow multiple toggles to be selected.
   */
  multiple?: boolean
}

export type UserDefinedContext = RequiredBy<PublicContext, "id">

type ComputedContext = Readonly<{
  currentLoop: boolean
}>

type PrivateContext = Context<{
  /**
   * @internal
   * Whether the user is tabbing backward.
   */
  isTabbingBackward: boolean
  /**
   * @internal
   * Whether the toggle group has focusable toggles.
   */
  hasFocusableToggle: boolean
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
}>

export interface MachineContext extends PublicContext, PrivateContext, ComputedContext {}

export interface MachineState {
  value: "idle" | "focused"
}

export type State = S.State<MachineContext, MachineState>

export type Send = S.Send<S.AnyEventObject>

export interface ToggleProps {
  value: string
  disabled?: boolean
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
  rootProps: T["element"]
  getToggleProps(props: ToggleProps): T["button"]
}
