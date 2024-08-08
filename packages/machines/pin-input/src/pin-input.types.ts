import type { StateMachine as S } from "@zag-js/core"
import type { CommonProperties, DirectionProperty, PropTypes, RequiredBy } from "@zag-js/types"

/* -----------------------------------------------------------------------------
 * Callback details
 * -----------------------------------------------------------------------------*/

export interface ValueChangeDetails {
  value: string[]
  valueAsString: string
}

export interface ValueInvalidDetails {
  value: string
  index: number
}

/* -----------------------------------------------------------------------------
 * Machine context
 * -----------------------------------------------------------------------------*/

export type IntlTranslations = {
  inputLabel: (index: number, length: number) => string
}

export type ElementIds = Partial<{
  root: string
  hiddenInput: string
  label: string
  control: string
  input(id: string): string
}>

interface PublicContext extends DirectionProperty, CommonProperties {
  /**
   * The name of the input element. Useful for form submission.
   */
  name?: string
  /**
   * The associate form of the underlying input element.
   */
  form?: string
  /**
   * The regular expression that the user-entered input value is checked against.
   */
  pattern?: string
  /**
   * The ids of the elements in the pin input. Useful for composition.
   */
  ids?: ElementIds
  /**
   * Whether the inputs are disabled
   */
  disabled?: boolean
  /**
   * The placeholder text for the input
   * @default "○"
   */
  placeholder?: string
  /**
   * Whether to auto-focus the first input.
   */
  autoFocus?: boolean
  /**
   * Whether the pin input is in the invalid state
   */
  invalid?: boolean
  /**
   * Whether the pin input is required
   */
  required?: boolean
  /**
   * Whether the pin input is in the valid state
   */
  readOnly?: boolean
  /**
   * If `true`, the pin input component signals to its fields that they should
   * use `autocomplete="one-time-code"`.
   */
  otp?: boolean
  /**
   * The value of the the pin input.
   */
  value: string[]
  /**
   * The type of value the pin-input should allow
   * @default "numeric"
   */
  type?: "alphanumeric" | "numeric" | "alphabetic"
  /**
   * Function called when all inputs have valid values
   */
  onValueComplete?: (details: ValueChangeDetails) => void
  /**
   * Function called on input change
   */
  onValueChange?: (details: ValueChangeDetails) => void
  /**
   * Function called when an invalid value is entered
   */
  onValueInvalid?: (details: ValueInvalidDetails) => void
  /**
   * If `true`, the input's value will be masked just like `type=password`
   */
  mask?: boolean
  /**
   * Whether to blur the input when the value is complete
   */
  blurOnComplete?: boolean
  /**
   * Whether to select input value when input is focused
   */
  selectOnFocus?: boolean
  /**
   * Specifies the localized strings that identifies the accessibility elements and their states
   */
  translations: IntlTranslations
}

export type UserDefinedContext = RequiredBy<PublicContext, "id">

type ComputedContext = Readonly<{
  /**
   * @computed
   * The number of inputs
   */
  valueLength: number
  /**
   * @computed
   * The number of inputs that are not empty
   */
  filledValueLength: number
  /**
   * @computed
   * Whether all input values are valid
   */
  isValueComplete: boolean
  /**
   * @computed
   * The string representation of the input values
   */
  valueAsString: string
  /**
   * @computed
   * The value at focused index
   */
  focusedValue: string
}>

interface PrivateContext {
  /**
   * @internal
   * The index of the input field that has focus
   */
  focusedIndex: number
}

export interface MachineContext extends PublicContext, PrivateContext, ComputedContext {}

export interface MachineState {
  value: "idle" | "focused"
}

export type State = S.State<MachineContext, MachineState>

export type Send = S.Send<S.AnyEventObject>

/* -----------------------------------------------------------------------------
 * Component API
 * -----------------------------------------------------------------------------*/

export interface InputProps {
  index: number
}

export interface MachineApi<T extends PropTypes = PropTypes> {
  /**
   * The value of the input as an array of strings.
   */
  value: string[]
  /**
   * The value of the input as a string.
   */
  valueAsString: string
  /**
   * Whether all inputs are filled.
   */
  complete: boolean
  /**
   * Function to set the value of the inputs.
   */
  setValue(value: string[]): void
  /**
   * Function to clear the value of the inputs.
   */
  clearValue(): void
  /**
   * Function to set the value of the input at a specific index.
   */
  setValueAtIndex(index: number, value: string): void
  /**
   * Function to focus the pin-input. This will focus the first input.
   */
  focus: () => void
  getRootProps(): T["element"]
  getLabelProps(): T["label"]
  getHiddenInputProps(): T["input"]
  getControlProps(): T["element"]
  getInputProps(props: InputProps): T["input"]
}
