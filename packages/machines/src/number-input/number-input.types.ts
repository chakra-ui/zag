import { StateMachine as S } from "@ui-machines/core"
import { PointValue } from "tiny-point"
import { Context } from "../utils"

type ValidityState = "rangeUnderflow" | "rangeOverflow"

type InputSelection = Record<"start" | "end", number | null>

export type NumberInputMachineContext = Context<{
  /**
   * The name attribute of the number input. Useful for form submission.
   */
  name?: string
  /**
   * Whether the number input is disabled.
   */
  disabled?: boolean
  /**
   * Whether the number input is readonly
   */
  readonly?: boolean
  /**
   * Whether the number input value is invalid.
   */
  invalid?: boolean
  /**
   * The number of decimal points used to round the value
   */
  precision?: number
  /**
   * The pattern used to check the <input> element's value against
   *
   * @default
   * "[0-9]*(.[0-9]+)?"
   */
  pattern: string
  /**
   * The value of the input
   */
  value: string
  /**
   * @computed the value of the input as a number
   */
  readonly valueAsNumber: number
  /**
   * The minimum value of the number input
   */
  min: number
  /**
   * The maximum value of the number input
   */
  max: number
  /**
   * The step value of the number input
   */
  step: number
  /**
   * Whether to allow mouse wheel to change the value
   */
  allowMouseWheel?: boolean
  /**
   * Whether to allow the value overflow the min/max range
   * @default true
   */
  keepWithinRange?: boolean
  /**
   * Whether the pressed key should be allowed in the input.
   * The default behavior is to allow DOM floating point characters defined by /^[Ee0-9+\-.]$/
   */
  validateCharacter?(value: string): boolean
  /**
   * Whether to clamp the value when the input loses focus (blur)
   * @default true
   */
  clampValueOnBlur: boolean
  /**
   * Whether to focus input when the value changes
   * @default true
   */
  focusInputOnChange: boolean
  /**
   * Function that returns the human-readable value.
   * It is used to set the `aria-valuetext` property of the input
   */
  getAriaValueText?(value: string): string
  /**
   * If using a custom display format, this converts the custom format to a format `parseFloat` understands.
   */
  parse?(value: string): string
  /**
   * If using a custom display format, this converts the default format to the custom format.
   */
  format?(value: string): string | number
  /**
   * The hint that determines if we're incrementing or decrementing
   */
  hint: "increment" | "decrement" | "set" | null
  /**
   * Hints at the type of data that might be entered by the user. It also determines
   * the type of keyboard shown to the user on mobile devices
   * @default "decimal"
   */
  inputMode: "none" | "text" | "tel" | "url" | "email" | "numeric" | "decimal" | "search"
  /**
   * The scrubber cursor position
   */
  cursorPoint: PointValue | null
  /**
   * Function invoked when the value changes
   */
  onChange?(value: string, valueAsNumber: number): void
  /**
   * Function invoked when the value overflows or underflows the min/max range
   */
  onInvalid?(message: ValidityState, value: string, valueAsNumber: number): void
  /**
   * The selection range of the input
   */
  inputSelection: InputSelection | null
  /**
   * @computed Whehter the value is at the min
   */
  readonly isAtMin: boolean
  /**
   * @computed Whether the value is at the max
   */
  readonly isAtMax: boolean
  /**
   * @computed Whether the value is out of the min/max range
   */
  readonly isOutOfRange: boolean
  /**
   * @computed Whether the increment button is enabled
   */
  readonly canIncrement: boolean
  /**
   * @computed Whether the decrement button is enabled
   */
  readonly canDecrement: boolean
  /**
   * @computed The `aria-valuetext` attribute of the input
   */
  readonly ariaValueText: string
  /**
   * @computed The formatted value of the input
   */
  readonly formattedValue: string
  /**
   * @computed Whether the writing direction is RTL
   */
  readonly isRtl: boolean
}>

export type NumberInputMachineState = {
  value: "unknown" | "idle" | "focused" | "spinning" | "before:spin" | "scrubbing"
}

export type NumberInputState = S.State<NumberInputMachineContext, NumberInputMachineState>

export type NumberInputSend = (event: S.Event<S.AnyEventObject>) => void
