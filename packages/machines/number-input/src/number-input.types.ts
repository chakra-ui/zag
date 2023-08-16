import type { StateMachine as S } from "@zag-js/core"
import type { CommonProperties, Context, DirectionProperty, PropTypes, RequiredBy } from "@zag-js/types"

type ValidityState = "rangeUnderflow" | "rangeOverflow"

type ElementIds = Partial<{
  root: string
  label: string
  input: string
  incrementTrigger: string
  decrementTrigger: string
  scrubber: string
}>

type IntlTranslations = {
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

type Value = {
  value: string
  valueAsNumber: number
}

type PublicContext = DirectionProperty &
  CommonProperties & {
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
     * The minimum value of the number input
     */
    min: number
    /**
     * The maximum value of the number input
     */
    max: number
    /**
     * The amount to increment or decrement the value by
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
     * Whether the pressed key should be allowed in the input.
     * The default behavior is to allow DOM floating point characters defined by /^[Ee0-9+\-.]$/
     */
    validateCharacter?: (char: string) => boolean
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
     * If using a custom display format, this converts the custom format to a format `parseFloat` understands.
     */
    parse?: (value: string) => string
    /**
     * If using a custom display format, this converts the default format to the custom format.
     */
    format?: (value: string) => string | number
    /**
     * Hints at the type of data that might be entered by the user. It also determines
     * the type of keyboard shown to the user on mobile devices
     * @default "decimal"
     */
    inputMode: "text" | "tel" | "numeric" | "decimal"
    /**
     * Function invoked when the value changes
     */
    onChange?: (details: Value) => void
    /**
     * Function invoked when the value overflows or underflows the min/max range
     */
    onInvalid?: (details: Value & { reason: ValidityState }) => void
    /**
     * Function invoked when the number input is focused
     */
    onFocus?: (details: Value & { srcElement: HTMLElement | null }) => void
    /**
     * The value of the input when it is blurred
     */
    onBlur?: (details: Value) => void
    /**
     * The minimum number of fraction digits to use. Possible values are from 0 to 20
     */
    minFractionDigits?: number
    /**
     * The maximum number of fraction digits to use. Possible values are from 0 to 20;
     */
    maxFractionDigits?: number
    /**
     * Whether to spin the value when the increment/decrement button is pressed
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

type PrivateContext = Context<{
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
}>

export type MachineContext = PublicContext & PrivateContext & ComputedContext

export type MachineState = {
  value: "idle" | "focused" | "spinning" | "before:spin" | "scrubbing"
  tags: "focus"
}

export type State = S.State<MachineContext, MachineState>

export type Send = S.Send<S.AnyEventObject>

export type MachineApi<T extends PropTypes = PropTypes> = {
  /**
   * Whether the input is focused.
   */
  isFocused: boolean
  /**
   * Whether the input is invalid.
   */
  isInvalid: boolean
  /**
   * Whether the input value is empty.
   */
  isValueEmpty: boolean
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
  setValue(value: string | number): void
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
  /**
   * Function to blur the input.
   */
  blur(): void
  rootProps: T["element"]
  labelProps: T["label"]
  controlProps: T["element"]
  inputProps: T["input"]
  decrementTriggerProps: T["button"]
  incrementTriggerProps: T["button"]
  scrubberProps: T["element"]
}
