import type { StateMachine as S } from "@zag-js/core"
import type { Context, DirectionProperty } from "@zag-js/types"

type IntlMessages = {
  inputLabel: (index: number, length: number) => string
}

type ElementIds = Partial<{
  root: string
  input(id: string): string
}>

type PublicContext = DirectionProperty & {
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
   * Specifies the localized strings that identifies the accessibility elements and their states
   */
  messages: IntlMessages
}

export type UserDefinedContext = Partial<PublicContext>

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
  value: "unknown" | "idle" | "focused"
}

export type State = S.State<MachineContext, MachineState>

export type Send = S.Send<S.AnyEventObject>
