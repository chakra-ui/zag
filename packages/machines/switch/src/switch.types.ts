import type { Machine, StateMachine as S } from "@zag-js/core"
import type { CommonProperties, DirectionProperty, PropTypes, RequiredBy } from "@zag-js/types"

/* -----------------------------------------------------------------------------
 * Callback details
 * -----------------------------------------------------------------------------*/

export interface CheckedChangeDetails {
  checked: boolean
}

/* -----------------------------------------------------------------------------
 * Machine context
 * -----------------------------------------------------------------------------*/

export type ElementIds = Partial<{
  root: string
  hiddenInput: string
  control: string
  label: string
  thumb: string
}>

interface PublicContext extends DirectionProperty, CommonProperties {
  /**
   * The ids of the elements in the switch. Useful for composition.
   */
  ids?: ElementIds
  /**
   * Specifies the localized strings that identifies the accessibility elements and their states
   */
  label: string
  /**
   * Whether the switch is disabled.
   */
  disabled?: boolean
  /**
   * If `true`, the switch is marked as invalid.
   */
  invalid?: boolean
  /**
   * If `true`, the switch input is marked as required,
   */
  required?: boolean
  /**
   * Whether the switch is read-only
   */
  readOnly?: boolean
  /**
   * Function to call when the switch is clicked.
   */
  onCheckedChange?: (details: CheckedChangeDetails) => void
  /**
   * Whether the switch is checked.
   */
  checked: boolean
  /**
   * The name of the input field in a switch
   * (Useful for form submission).
   */
  name?: string
  /**
   * The id of the form that the switch belongs to
   */
  form?: string
  /**
   * The value of switch input. Useful for form submission.
   * @default "on"
   */
  value?: string | number
}

export type UserDefinedContext = RequiredBy<PublicContext, "id">

type ComputedContext = Readonly<{
  /**
   * Whether the switch is disabled
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
   * Whether the checkbox fieldset is disabled
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
   * Whether the checkbox is focused
   */
  focused: boolean | undefined
  /**
   * Function to set the checked state of the switch.
   */
  setChecked(checked: boolean): void
  /**
   * Function to toggle the checked state of the checkbox
   */
  toggleChecked(): void

  getRootProps(): T["label"]
  getLabelProps(): T["element"]
  getThumbProps(): T["element"]
  getControlProps(): T["element"]
  getHiddenInputProps(): T["input"]
}
