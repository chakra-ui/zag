import type { EventObject, Machine, Service } from "@zag-js/core"
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
  input: (id: string) => string
}>

export interface PinInputProps extends DirectionProperty, CommonProperties {
  /**
   * The name of the input element. Useful for form submission.
   */
  name?: string | undefined
  /**
   * The associate form of the underlying input element.
   */
  form?: string | undefined
  /**
   * The regular expression that the user-entered input value is checked against.
   */
  pattern?: string | undefined
  /**
   * The ids of the elements in the pin input. Useful for composition.
   */
  ids?: ElementIds | undefined
  /**
   * Whether the inputs are disabled
   */
  disabled?: boolean | undefined
  /**
   * The placeholder text for the input
   * @default "○"
   */
  placeholder?: string | undefined
  /**
   * Whether to auto-focus the first input.
   */
  autoFocus?: boolean | undefined
  /**
   * Whether the pin input is in the invalid state
   */
  invalid?: boolean | undefined
  /**
   * Whether the pin input is required
   */
  required?: boolean | undefined
  /**
   * Whether the pin input is in the valid state
   */
  readOnly?: boolean | undefined
  /**
   * If `true`, the pin input component signals to its fields that they should
   * use `autocomplete="one-time-code"`.
   */
  otp?: boolean | undefined
  /**
   * The controlled value of the the pin input.
   */
  value?: string[] | undefined
  /**
   * The initial value of the the pin input when rendered.
   * Use when you don't need to control the value of the pin input.
   */
  defaultValue?: string[] | undefined
  /**
   * The type of value the pin-input should allow
   * @default "numeric"
   */
  type?: "alphanumeric" | "numeric" | "alphabetic" | undefined
  /**
   * Function called when all inputs have valid values
   */
  onValueComplete?: ((details: ValueChangeDetails) => void) | undefined
  /**
   * Function called on input change
   */
  onValueChange?: ((details: ValueChangeDetails) => void) | undefined
  /**
   * Function called when an invalid value is entered
   */
  onValueInvalid?: ((details: ValueInvalidDetails) => void) | undefined
  /**
   * If `true`, the input's value will be masked just like `type=password`
   */
  mask?: boolean | undefined
  /**
   * Whether to auto-submit the owning form when all inputs are filled.
   */
  autoSubmit?: boolean | undefined
  /**
   * Whether to blur the input when the value is complete
   */
  blurOnComplete?: boolean | undefined
  /**
   * Whether to select input value when input is focused
   */
  selectOnFocus?: boolean | undefined
  /**
   * Function to sanitize pasted values before validation.
   * Useful for stripping dashes, spaces, or other formatting.
   * @example (value) => value.replace(/-/g, "")
   */
  sanitizeValue?: ((value: string) => string) | undefined
  /**
   * Specifies the localized strings that identifies the accessibility elements and their states
   */
  translations?: IntlTranslations | undefined
  /**
   * The number of pin input fields.
   */
  count: number
}

type PropsWithDefault = "placeholder" | "otp" | "type" | "defaultValue" | "count"

export interface PinInputSchema {
  state: "idle" | "focused"
  props: RequiredBy<PinInputProps, PropsWithDefault>
  context: {
    value: string[]
    focusedIndex: number
  }
  computed: {
    // normalized value
    _value: string[]
    valueLength: number
    filledValueLength: number
    isValueComplete: boolean
    valueAsString: string
    focusedValue: string
  }
  event: EventObject
  action: string
  effect: string
  guard: string
}

export type PinInputService = Service<PinInputSchema>

export type PinInputMachine = Machine<PinInputSchema>

/* -----------------------------------------------------------------------------
 * Component API
 * -----------------------------------------------------------------------------*/

export interface InputProps {
  index: number
}

export interface RootState {
  /**
   * Whether the pin input is invalid.
   */
  invalid: boolean
  /**
   * Whether the pin input is disabled.
   */
  disabled: boolean
  /**
   * Whether all inputs are filled.
   */
  complete: boolean
  /**
   * Whether the pin input is read-only.
   */
  readOnly: boolean
}

export interface LabelState {
  /**
   * Whether the pin input is invalid.
   */
  invalid: boolean
  /**
   * Whether the pin input is disabled.
   */
  disabled: boolean
  /**
   * Whether all inputs are filled.
   */
  complete: boolean
  /**
   * Whether the pin input is required.
   */
  required: boolean
  /**
   * Whether the pin input is read-only.
   */
  readOnly: boolean
}

export interface InputState {
  /**
   * The index of the input.
   */
  index: number
  /**
   * Whether the input is disabled.
   */
  disabled: boolean
  /**
   * Whether the input is read-only.
   */
  readOnly: boolean
  /**
   * Whether the input value is invalid.
   */
  invalid: boolean
  /**
   * Whether all inputs are filled.
   */
  complete: boolean
  /**
   * Whether this input has a value.
   */
  filled: boolean
  /**
   * Whether this input is focused.
   */
  focused: boolean
  /**
   * Whether this input is the tabbable input in the group.
   */
  tabbable: boolean
}

export interface PinInputApi<T extends PropTypes = PropTypes> {
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
   * The number of inputs to render
   */
  count: number
  /**
   * The array of input values.
   */
  items: number[]
  /**
   * Function to set the value of the inputs.
   */
  setValue: (value: string[]) => void
  /**
   * Function to clear the value of the inputs.
   */
  clearValue: VoidFunction
  /**
   * Function to set the value of the input at a specific index.
   */
  setValueAtIndex: (index: number, value: string) => void
  /**
   * Function to focus the pin-input. This will focus the first input.
   */
  focus: VoidFunction
  /**
   * Returns the state of the root.
   */
  getRootState: () => RootState
  getRootProps: () => T["element"]
  /**
   * Returns the state of the label.
   */
  getLabelState: () => LabelState
  getLabelProps: () => T["label"]
  getHiddenInputProps: () => T["input"]
  getControlProps: () => T["element"]
  /**
   * Returns the state of a given input.
   */
  getInputState: (props: InputProps) => InputState
  getInputProps: (props: InputProps) => T["input"]
}
