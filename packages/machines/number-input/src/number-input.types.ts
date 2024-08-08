import type { NumberFormatter, NumberParser } from "@internationalized/number"
import type { Machine, StateMachine as S } from "@zag-js/core"
import type { CommonProperties, LocaleProperties, PropTypes, RequiredBy } from "@zag-js/types"

/* -----------------------------------------------------------------------------
 * Callback details
 * -----------------------------------------------------------------------------*/

export interface ValueChangeDetails {
  value: string
  valueAsNumber: number
}

export interface FocusChangeDetails extends ValueChangeDetails {
  focused: boolean
}

export type ValidityState = "rangeUnderflow" | "rangeOverflow"

export interface ValueInvalidDetails extends ValueChangeDetails {
  reason: ValidityState
}

/* -----------------------------------------------------------------------------
 * Machine context
 * -----------------------------------------------------------------------------*/

export type InputMode = "text" | "tel" | "numeric" | "decimal"

export type ElementIds = Partial<{
  root: string
  label: string
  input: string
  incrementTrigger: string
  decrementTrigger: string
  scrubber: string
}>

export type IntlTranslations = {
  /**
   * Function that returns the human-readable value.
   * It is used to set the `aria-valuetext` property of the input
   */
  valueText?: (value: string) => string
  /**
   * The label foe the increment button
   */
  incrementLabel: string
  /**
   * The label for the decrement button
   */
  decrementLabel: string
}

interface PublicContext extends LocaleProperties, CommonProperties {
  /**
   * The ids of the elements in the number input. Useful for composition.
   */
  ids?: ElementIds
  /**
   * The name attribute of the number input. Useful for form submission.
   */
  name?: string
  /**
   * The associate form of the input element.
   */
  form?: string
  /**
   * Whether the number input is disabled.
   */
  disabled?: boolean
  /**
   * Whether the number input is readonly
   */
  readOnly?: boolean
  /**
   * Whether the number input value is invalid.
   */
  invalid?: boolean
  /**
   * Whether the number input is required
   */
  required?: boolean
  /**
   * The pattern used to check the <input> element's value against
   *
   * @default "[0-9]*(.[0-9]+)?"
   */
  pattern: string
  /**
   * The value of the input
   */
  value: string
  /**
   * The minimum value of the number input
   * @default Number.MIN_SAFE_INTEGER
   */
  min: number
  /**
   * The maximum value of the number input
   * @default Number.MAX_SAFE_INTEGER
   */
  max: number
  /**
   * The amount to increment or decrement the value by
   * @default 1
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
  allowOverflow: boolean
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
   * Specifies the localized strings that identifies the accessibility elements and their states
   */
  translations: IntlTranslations
  /**
   * The options to pass to the `Intl.NumberFormat` constructor
   */
  formatOptions?: Intl.NumberFormatOptions
  /**
   * Hints at the type of data that might be entered by the user. It also determines
   * the type of keyboard shown to the user on mobile devices
   * @default "decimal"
   */
  inputMode: InputMode
  /**
   * Function invoked when the value changes
   */
  onValueChange?: (details: ValueChangeDetails) => void
  /**
   * Function invoked when the value overflows or underflows the min/max range
   */
  onValueInvalid?: (details: ValueInvalidDetails) => void
  /**
   * Function invoked when the number input is focused
   */
  onFocusChange?: (details: FocusChangeDetails) => void
  /**
   * Whether to spin the value when the increment/decrement button is pressed
   * @default true
   */
  spinOnPress?: boolean
}

export type UserDefinedContext = RequiredBy<PublicContext, "id">

type ComputedContext = Readonly<{
  /**
   * @computed
   * The value of the input as a number
   */
  valueAsNumber: number
  /**
   * @computed
   * Whether the value is at the min
   */
  isAtMin: boolean
  /**
   * @computed
   * Whether the value is at the max
   */
  isAtMax: boolean
  /**
   * @computed
   * Whether the value is out of the min/max range
   */
  isOutOfRange: boolean
  /**
   * @computed
   * Whether the value is empty
   */
  isValueEmpty: boolean
  /**
   * @computed
   * Whether the color picker is disabled
   */
  isDisabled: boolean
  /**
   * @computed
   * Whether the increment button is enabled
   */
  canIncrement: boolean
  /**
   * @computed
   * Whether the decrement button is enabled
   */
  canDecrement: boolean
  /**
   * @computed
   * The `aria-valuetext` attribute of the input
   */
  valueText: string | undefined
  /**
   * @computed
   * The formatted value of the input
   */
  formattedValue: string
  /**
   * @computed
   * Whether the writing direction is RTL
   */
  isRtl: boolean
}>

interface PrivateContext {
  /**
   * @internal
   * The hint that determines if we're incrementing or decrementing
   */
  hint: "increment" | "decrement" | "set" | null
  /**
   * @internal
   * The scrubber cursor position
   */
  scrubberCursorPoint: { x: number; y: number } | null
  /**
   * @internal
   * The number i18n formatter
   */
  formatter: NumberFormatter
  /**
   * @internal
   * The number i18n parser
   */
  parser: NumberParser
  /**
   * @internal
   * Whether the checkbox's fieldset is disabled
   */
  fieldsetDisabled: boolean
}

export interface MachineContext extends PublicContext, PrivateContext, ComputedContext {}

export interface MachineState {
  value: "idle" | "focused" | "spinning" | "before:spin" | "scrubbing"
  tags: "focus"
}

export type State = S.State<MachineContext, MachineState>

export type Send = S.Send<S.AnyEventObject>

export type Service = Machine<MachineContext, MachineState, S.AnyEventObject>

/* -----------------------------------------------------------------------------
 * Component API
 * -----------------------------------------------------------------------------*/

export interface MachineApi<T extends PropTypes = PropTypes> {
  /**
   * Whether the input is focused.
   */
  focused: boolean
  /**
   * Whether the input is invalid.
   */
  invalid: boolean
  /**
   * Whether the input value is empty.
   */
  empty: boolean
  /**
   * The formatted value of the input.
   */
  value: string
  /**
   * The value of the input as a number.
   */
  valueAsNumber: number
  /**
   * Function to set the value of the input.
   */
  setValue(value: number): void
  /**
   * Function to clear the value of the input.
   */
  clearValue(): void
  /**
   * Function to increment the value of the input by the step.
   */
  increment(): void
  /**
   * Function to decrement the value of the input by the step.
   */
  decrement(): void
  /**
   * Function to set the value of the input to the max.
   */
  setToMax(): void
  /**
   * Function to set the value of the input to the min.
   */
  setToMin(): void
  /**
   * Function to focus the input.
   */
  focus(): void

  getRootProps(): T["element"]
  getLabelProps(): T["label"]
  getControlProps(): T["element"]
  getValueTextProps(): T["element"]
  getInputProps(): T["input"]
  getDecrementTriggerProps(): T["button"]
  getIncrementTriggerProps(): T["button"]
  getScrubberProps(): T["element"]
}
