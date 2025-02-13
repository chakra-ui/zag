import type { CommonProperties, DirectionProperty, PropTypes, RequiredBy } from "@zag-js/types"
import type { EventObject, Service } from "@zag-js/core"

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

export interface CheckboxProps extends DirectionProperty, CommonProperties {
  /**
   * The ids of the elements in the checkbox. Useful for composition.
   */
  ids?: ElementIds | undefined
  /**
   * Whether the checkbox is disabled
   */
  disabled?: boolean | undefined
  /**
   * Whether the checkbox is invalid
   */
  invalid?: boolean | undefined
  /**
   * Whether the checkbox is required
   */
  required?: boolean | undefined
  /**
   * The checked state of the checkbox
   */
  checked?: CheckedState
  /**
   * The default checked state of the checkbox
   */
  defaultChecked?: CheckedState
  /**
   * Whether the checkbox is read-only
   */
  readOnly?: boolean | undefined
  /**
   * The callback invoked when the checked state changes.
   */
  onCheckedChange?(details: CheckedChangeDetails): void
  /**
   * The name of the input field in a checkbox.
   * Useful for form submission.
   */
  name?: string | undefined
  /**
   * The id of the form that the checkbox belongs to.
   */
  form?: string | undefined
  /**
   * The value of checkbox input. Useful for form submission.
   * @default "on"
   */
  value?: string | undefined
}

type PropsWithDefault = "value"

export interface CheckboxSchema {
  state: "ready"
  props: RequiredBy<CheckboxProps, PropsWithDefault>
  context: {
    checked: CheckedState
    active: boolean
    focused: boolean
    focusVisible: boolean
    hovered: boolean
    fieldsetDisabled: boolean
  }
  computed: {
    indeterminate: boolean
    checked: boolean
    disabled: boolean
  }
  event: EventObject
  action: string
  effect: string
  guard: string
}

export type CheckboxService = Service<CheckboxSchema>

/* -----------------------------------------------------------------------------
 * Component API
 * -----------------------------------------------------------------------------*/

export interface CheckboxApi<T extends PropTypes = PropTypes> {
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
