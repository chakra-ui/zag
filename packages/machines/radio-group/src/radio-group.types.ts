import type { StateMachine as S } from "@zag-js/core"
import type { CommonProperties, Context, DirectionProperty, PropTypes, RequiredBy } from "@zag-js/types"

export interface ValueChangeDetails {
  value: string
}

/* -----------------------------------------------------------------------------
 * Machine context
 * -----------------------------------------------------------------------------*/

export type ElementIds = Partial<{
  root: string
  label: string
  indicator: string
  item(value: string): string
  itemLabel(value: string): string
  itemControl(value: string): string
  itemHiddenInput(value: string): string
}>

interface PublicContext extends DirectionProperty, CommonProperties {
  /**
   * The ids of the elements in the radio. Useful for composition.
   */
  ids?: ElementIds
  /**
   * The value of the checked radio
   */
  value: string | null

  /**
   * The name of the input fields in the radio
   * (Useful for form submission).
   */
  name?: string
  /**
   * The associate form of the underlying input.
   */
  form?: string
  /**
   * If `true`, the radio group will be disabled
   */
  disabled?: boolean
  /**
   * Function called once a radio is checked
   * @param value the value of the checked radio
   */
  onValueChange?(details: ValueChangeDetails): void
  /**
   * Orientation of the radio group
   */
  orientation?: "horizontal" | "vertical"
}

type PrivateContext = Context<{
  /**
   * @internal
   * The id of the active radio
   */
  activeId: string | null
  /**
   * @internal
   * The id of the focused radio
   */
  focusedId: string | null
  /**
   * @internal
   * The id of the hovered radio
   */
  hoveredId: string | null
  /**
   * @internal
   * The active tab indicator's dom rect
   */
  indicatorRect?: Partial<{ left: string; top: string; width: string; height: string }>
  /**
   * @internal
   * Whether the active tab indicator's rect can transition
   */
  canIndicatorTransition?: boolean
  /**
   * @internal
   * Function to clean up the observer for the active tab's rect
   */
  indicatorCleanup?: VoidFunction | null
  /**
   * @internal
   * Whether the radio group's fieldset is disabled
   */
  fieldsetDisabled: boolean
}>

export type UserDefinedContext = RequiredBy<PublicContext, "id">

type ComputedContext = Readonly<{
  /**
   * @computed
   * Whether the radio group is disabled
   */
  isDisabled: boolean
}>

export interface MachineContext extends PublicContext, PrivateContext, ComputedContext {}

export interface MachineState {
  value: "idle"
}

export type State = S.State<MachineContext, MachineState>

export type Send = S.Send<S.AnyEventObject>

/* -----------------------------------------------------------------------------
 * Component API
 * -----------------------------------------------------------------------------*/

export interface ItemProps {
  value: string
  disabled?: boolean
  invalid?: boolean
}

export interface ItemState {
  isInvalid: boolean
  isDisabled: boolean
  isChecked: boolean
  isFocused: boolean
  isHovered: boolean
  isActive: boolean
}

/* -----------------------------------------------------------------------------
 * Component API
 * -----------------------------------------------------------------------------*/

export interface MachineApi<T extends PropTypes = PropTypes> {
  /**
   * The current value of the radio group
   */
  value: string | null
  /**
   * Function to set the value of the radio group
   */
  setValue(value: string): void
  /**
   * Function to clear the value of the radio group
   */
  clearValue(): void
  /**
   * Function to focus the radio group
   */
  focus: () => void
  /**
   * Returns the state details of a radio input
   */
  getItemState(props: ItemProps): ItemState
  rootProps: T["element"]
  labelProps: T["element"]
  getItemProps(props: ItemProps): T["label"]
  getItemTextProps(props: ItemProps): T["element"]
  getItemControlProps(props: ItemProps): T["element"]
  getItemHiddenInputProps(props: ItemProps): T["input"]
  indicatorProps: T["element"]
}
