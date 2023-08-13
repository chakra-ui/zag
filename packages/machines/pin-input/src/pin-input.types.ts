import type { StateMachine as S } from "@zag-js/core"
import type { CommonProperties, Context, DirectionProperty, PropTypes, RequiredBy } from "@zag-js/types"

type IntlTranslations = {
  inputLabel: (index: number, length: number) => string
}

type ElementIds = Partial<{
  root: string
  hiddenInput: string
  label: string
  control: string
  input(id: string): string
}>

type PublicContext = DirectionProperty &
  CommonProperties & {
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
     */
    type?: "alphanumeric" | "numeric" | "alphabetic"
    /**
     * Function called when all inputs have valid values
     */
    onComplete?: (details: { value: string[]; valueAsString: string }) => void
    /**
     * Function called on input change
     */
    onChange?: (details: { value: string[] }) => void
    /**
     * Function called when an invalid value is entered
     */
    onInvalid?: (details: { value: string; index: number }) => void
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

type PrivateContext = Context<{
  /**
   * @internal
   * The index of the input field that has focus
   */
  focusedIndex: number
}>

export type MachineContext = PublicContext & PrivateContext & ComputedContext

export type MachineState = {
  value: "idle" | "focused"
}

export type State = S.State<MachineContext, MachineState>

export type Send = S.Send<S.AnyEventObject>

export type MachineApi<T extends PropTypes = PropTypes> = {
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
  isValueComplete: boolean
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
  rootProps: T["element"]
  labelProps: T["label"]
  hiddenInputProps: T["input"]
  controlProps: T["element"]
  getInputProps({ index }: { index: number }): T["input"]
}
