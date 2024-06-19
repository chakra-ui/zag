import type { Machine, StateMachine as S } from "@zag-js/core"
import type { CommonProperties, DirectionProperty, PropTypes, RequiredBy } from "@zag-js/types"

/* -----------------------------------------------------------------------------
 * Callback details
 * -----------------------------------------------------------------------------*/

export type CheckedState = boolean | "indeterminate"

export interface CheckedChangeDetails {
  checked: CheckedState
}

/* -----------------------------------------------------------------------------
 * Machine context
 * -----------------------------------------------------------------------------*/

export type ElementIds = Partial<{
  root: string
  hiddenInput: string
  control: string
  label: string
}>

interface PublicContext extends DirectionProperty, CommonProperties {
  /**
   * The ids of the elements in the checkbox. Useful for composition.
   */
  ids?: ElementIds
  /**
   * Whether the checkbox is disabled
   */
  disabled?: boolean
  /**
   * Whether the checkbox is invalid
   */
  invalid?: boolean
  /**
   * Whether the checkbox is required
   */
  required?: boolean
  /**
   * The checked state of the checkbox
   */
  checked: CheckedState
  /**
   * Whether the checkbox is read-only
   */
  readOnly?: boolean
  /**
   * The callback invoked when the checked state changes.
   */
  onCheckedChange?(details: CheckedChangeDetails): void
  /**
   * The name of the input field in a checkbox.
   * Useful for form submission.
   */
  name?: string
  /**
   * The id of the form that the checkbox belongs to.
   */
  form?: string
  /**
   * The value of checkbox input. Useful for form submission.
   * @default "on"
   */
  value: string
}

export type UserDefinedContext = RequiredBy<PublicContext, "id">

type ComputedContext = Readonly<{
  /**
   * Whether the checkbox is checked
   */
  isIndeterminate: boolean
  /**
   * Whether the checkbox is checked
   */
  isChecked: boolean
  /**
   * Whether the checkbox is disabled
   */
  isDisabled: boolean
}>

interface PrivateContext {
  /**
   * @internal
   * Whether the checkbox is pressed
   */
  active?: boolean
  /**
   * @internal
   * Whether the checkbox has focus
   */
  focused?: boolean
  /**
   * @internal
   * Whether the checkbox is hovered
   */
  hovered?: boolean
  /**
   * @internal
   * Whether the checkbox's fieldset is disabled
   */
  fieldsetDisabled: boolean
}

export interface MachineContext extends PublicContext, PrivateContext, ComputedContext {}

export interface MachineState {
  value: "ready"
}

export type State = S.State<MachineContext, MachineState>

export type Send = S.Send<S.AnyEventObject>

export type Service = Machine<MachineContext, MachineState, S.AnyEventObject>

/* -----------------------------------------------------------------------------
 * Component API
 * -----------------------------------------------------------------------------*/

export interface MachineApi<T extends PropTypes = PropTypes> {
  /**
   * Whether the checkbox is checked
   */
  checked: boolean
  /**
   * Whether the checkbox is disabled
   */
  disabled: boolean | undefined
  /**
   * Whether the checkbox is indeterminate
   */
  indeterminate: boolean
  /**
   * Whether the checkbox is focused
   */
  focused: boolean | undefined
  /**
   *  The checked state of the checkbox
   */
  checkedState: CheckedState
  /**
   * Function to set the checked state of the checkbox
   */
  setChecked(checked: CheckedState): void
  /**
   * Function to toggle the checked state of the checkbox
   */
  toggleChecked(): void
  getRootProps(): T["label"]
  getLabelProps(): T["element"]
  getControlProps(): T["element"]
  getHiddenInputProps(): T["input"]
  getIndicatorProps(): T["element"]
}
