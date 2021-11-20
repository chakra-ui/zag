import type { Context } from "@ui-machines/types"

export type PinInputMachineContext = Context<{
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
   * The index of the input field that has focus
   */
  focusedIndex: number
  /**
   * Function called when all inputs have valid values
   */
  onComplete?(value: string[], valueAsString: string): void
  /**
   * Function called on input change
   */
  onChange?: (value: string[]) => void
  /**
   * If `true`, the input's value will be masked just like `type=password`
   */
  mask?: boolean
  /**
   * @computed the number of inputs
   */
  readonly valueLength: number
  /**
   * @computed the number of inputs that are not empty
   */
  readonly filledValueLength: number
  /**
   * @computed Whether all input values are valid
   */
  readonly isValueComplete: boolean
  /**
   * @computed The string representation of the input values
   */
  readonly valueAsString: string
}>

export type PinInputMachineState = {
  value: "unknown" | "idle" | "focused"
}
