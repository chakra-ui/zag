import type { NumberFormatter, NumberParser } from "@internationalized/number"
import type { EventObject, Service } from "@zag-js/core"
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

export interface NumberInputProps extends LocaleProperties, CommonProperties {
  /**
   * The ids of the elements in the number input. Useful for composition.
   */
  ids?: ElementIds | undefined
  /**
   * The name attribute of the number input. Useful for form submission.
   */
  name?: string | undefined
  /**
   * The associate form of the input element.
   */
  form?: string | undefined
  /**
   * Whether the number input is disabled.
   */
  disabled?: boolean | undefined
  /**
   * Whether the number input is readonly
   */
  readOnly?: boolean | undefined
  /**
   * Whether the number input value is invalid.
   */
  invalid?: boolean | undefined
  /**
   * Whether the number input is required
   */
  required?: boolean | undefined
  /**
   * The pattern used to check the <input> element's value against
   *
   * @default "[0-9]*(.[0-9]+)?"
   */
  pattern?: string | undefined
  /**
   * The controlled value of the input
   */
  value?: string | undefined
  /**
   * The initial value of the input when rendered.
   * Use when you don't need to control the value of the input.
   */
  defaultValue?: string | undefined
  /**
   * The minimum value of the number input
   * @default Number.MIN_SAFE_INTEGER
   */
  min?: number | undefined
  /**
   * The maximum value of the number input
   * @default Number.MAX_SAFE_INTEGER
   */
  max?: number | undefined
  /**
   * The amount to increment or decrement the value by
   * @default 1
   */
  step?: number | undefined
  /**
   * Whether to allow mouse wheel to change the value
   */
  allowMouseWheel?: boolean | undefined
  /**
   * Whether to allow the value overflow the min/max range
   * @default true
   */
  allowOverflow?: boolean | undefined
  /**
   * Whether to clamp the value when the input loses focus (blur)
   * @default true
   */
  clampValueOnBlur?: boolean | undefined
  /**
   * Whether to focus input when the value changes
   * @default true
   */
  focusInputOnChange?: boolean | undefined
  /**
   * Specifies the localized strings that identifies the accessibility elements and their states
   */
  translations?: IntlTranslations | undefined
  /**
   * The options to pass to the `Intl.NumberFormat` constructor
   */
  formatOptions?: Intl.NumberFormatOptions | undefined
  /**
   * Hints at the type of data that might be entered by the user. It also determines
   * the type of keyboard shown to the user on mobile devices
   * @default "decimal"
   */
  inputMode?: InputMode | undefined
  /**
   * Function invoked when the value changes
   */
  onValueChange?: ((details: ValueChangeDetails) => void) | undefined
  /**
   * Function invoked when the value overflows or underflows the min/max range
   */
  onValueInvalid?: ((details: ValueInvalidDetails) => void) | undefined
  /**
   * Function invoked when the number input is focused
   */
  onFocusChange?: ((details: FocusChangeDetails) => void) | undefined
  /**
   * Whether to spin the value when the increment/decrement button is pressed
   * @default true
   */
  spinOnPress?: boolean | undefined
}

type PropsWithDefault =
  | "dir"
  | "locale"
  | "focusInputOnChange"
  | "clampValueOnBlur"
  | "allowOverflow"
  | "inputMode"
  | "pattern"
  | "translations"
  | "step"
  | "spinOnPress"
  | "min"
  | "max"
  | "step"
  | "translations"

type ComputedContext = Readonly<{
  /**
   * The value of the input as a number
   */
  valueAsNumber: number
  /**
   * Whether the value is at the min
   */
  isAtMin: boolean
  /**
   * Whether the value is at the max
   */
  isAtMax: boolean
  /**
   * Whether the value is out of the min/max range
   */
  isOutOfRange: boolean
  /**
   * Whether the value is empty
   */
  isValueEmpty: boolean
  /**
   * Whether the color picker is disabled
   */
  isDisabled: boolean
  /**
   * Whether the increment button is enabled
   */
  canIncrement: boolean
  /**
   * Whether the decrement button is enabled
   */
  canDecrement: boolean
  /**
   * The `aria-valuetext` attribute of the input
   */
  valueText: string | undefined
  /**
   * The formatted value of the input
   */
  formattedValue: string
  /**
   * Whether the writing direction is RTL
   */
  isRtl: boolean
  /**
   * The number i18n formatter
   */
  formatter: NumberFormatter
  /**
   * The number i18n parser
   */
  parser: NumberParser
}>

export type HintValue = "increment" | "decrement" | "set"

interface PrivateContext {
  /**
   * The hint that determines if we're incrementing or decrementing
   */
  hint: HintValue | null
  /**
   * The scrubber cursor position
   */
  scrubberCursorPoint: { x: number; y: number } | null
  /**
   * Whether the checkbox's fieldset is disabled
   */
  fieldsetDisabled: boolean
  /**
   * The value of the input
   */
  value: string
}

export interface NumberInputSchema {
  state: "idle" | "focused" | "spinning" | "before:spin" | "scrubbing"
  tag: "focus"
  props: RequiredBy<NumberInputProps, PropsWithDefault>
  context: PrivateContext
  computed: ComputedContext
  action: string
  event: EventObject
  guard: string
  effect: string
}

export type NumberInputService = Service<NumberInputSchema>

/* -----------------------------------------------------------------------------
 * Component API
 * -----------------------------------------------------------------------------*/

export interface NumberInputApi<T extends PropTypes = PropTypes> {
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
