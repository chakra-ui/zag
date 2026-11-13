import type { AnimationFrame } from "@zag-js/dom-query"
import type { NumberParser } from "@internationalized/number"
import type { EventObject, Machine, Service } from "@zag-js/core"
import type { CommonProperties, LocaleProperties, PropTypes } from "@zag-js/types"

/* -----------------------------------------------------------------------------
 * Callback details
 * -----------------------------------------------------------------------------*/

/**
 * The reason for the number input value change
 */
export type ValueChangeReason =
  | "input-change"
  | "input-blur" // clamped or formatted on blur
  | "keyboard"
  | "increment-trigger"
  | "decrement-trigger"
  | "wheel"
  | "scrub"
  | "script"
  | "autofill"

export interface ValueChangeDetails {
  /** The number, or `null` when the input is empty */
  value: number | null
  /** The value as shown in the input */
  formattedValue: string
  reason?: ValueChangeReason | undefined
}

export interface FocusChangeDetails {
  value: number | null
  formattedValue: string
  focused: boolean
}

export type ValidityState = "rangeUnderflow" | "rangeOverflow"

/** Detached from `ValueChangeDetails`: here `reason` is why the value is invalid. */
export interface ValueInvalidDetails {
  value: number
  formattedValue: string
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
  scrubberCursor: string
  hiddenInput: string
}>

export interface IntlTranslations {
  /**
   * The label for the increment button
   */
  incrementLabel?: string | undefined
  /**
   * The label for the decrement button
   */
  decrementLabel?: string | undefined
  /**
   * How screen readers describe the input. Left out on iOS, where VoiceOver would skip the required state.
   */
  roleDescription?: string | undefined
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
   * @default "-?[0-9]*(.[0-9]+)?"
   */
  pattern?: string | undefined
  /**
   * The controlled value. Use `null` for an empty input.
   */
  value?: number | null | undefined
  /**
   * The initial value when rendered.
   * Use when you don't need to control the value.
   */
  defaultValue?: number | null | undefined
  /**
   * The minimum value of the number input
   */
  min?: number | undefined
  /**
   * The maximum value of the number input
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
   * Whether a typed value can stay outside the min/max range instead of being clamped on blur or Enter.
   * The value is then reported as invalid. Stepping always stays within the range.
   * @default false
   */
  allowOutOfRange?: boolean | undefined
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
   * the type of keyboard shown to the user on mobile devices.
   * Defaults to `"text"` on iPhone when negatives are allowed, otherwise `"decimal"`.
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
   * Function invoked when the value settles: the input is blurred or `Enter` is pressed, a stepper
   * or scrub gesture ends, or a key or wheel step completes.
   */
  onValueCommit?: ((details: ValueChangeDetails) => void) | undefined
  /**
   * Whether to spin the value when the increment/decrement button is pressed
   * @default true
   */
  spinOnPress?: boolean | undefined
  /**
   * Step value when Shift key is held (large increments).
   * @default step * 10
   */
  largeStep?: number | undefined
  /**
   * Step value when Alt/Option key is held (fine control).
   * @default step * 0.1
   */
  smallStep?: number | undefined
  /**
   * How many pixels the pointer must move to change the value by one step.
   * Higher values mean more precise control. Lower values mean more sensitivity.
   * @default 2
   */
  scrubberPixelSensitivity?: number | undefined
  /**
   * Distance in pixels before the virtual cursor wraps around.
   * When not set, the viewport bounds are used (default behavior).
   */
  scrubberTeleportDistance?: number | undefined
  /**
   * The direction of scrubbing.
   * @default "horizontal"
   */
  scrubberDirection?: "horizontal" | "vertical" | undefined
  /**
   * Whether values snap to step multiples when scrubbing.
   * @default false
   */
  snapOnStep?: boolean | undefined
}

type PropsWithDefault =
  | "dir"
  | "locale"
  | "focusInputOnChange"
  | "allowOutOfRange"
  | "pattern"
  | "step"
  | "largeStep"
  | "smallStep"
  | "spinOnPress"
  | "scrubberPixelSensitivity"
  | "scrubberDirection"
  | "snapOnStep"

type ComputedContext = Readonly<{
  /**
   * The min, or `-Infinity` when there's none
   */
  min: number
  /**
   * The max, or `Infinity` when there's none
   */
  max: number
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
  formatter: Intl.NumberFormat
  /**
   * The number i18n parser
   */
  parser: NumberParser
}>

export type StepDirection = 1 | -1

export interface Platform {
  /** Whether the device is an iPhone */
  iPhone: boolean
  /** Whether the device runs iOS or iPadOS */
  ios: boolean
  /** Whether the browser supports pointer lock (not Safari) */
  supportsPointerLock: boolean
}

interface PrivateContext {
  /**
   * The scrubber cursor position
   */
  scrubberCursorPoint: { x: number; y: number } | null
  /**
   * Whether the checkbox's fieldset is disabled
   */
  fieldsetDisabled: boolean
  /**
   * The number, or `null` when empty
   */
  value: number | null
  /**
   * The text in the input. Kept while typing, reformatted from `value` otherwise.
   */
  inputValue: string
  /**
   * The accumulated delta for pixel sensitivity tracking
   */
  cumulativeDelta: number
  /**
   * The detected platform, read after mount (all false during SSR)
   */
  platform: Platform
  /**
   * The visual viewport scale (for pinch-zoom compensation on the cursor)
   */
  visualScale: number
}

export interface NumberInputSchema {
  state: "idle" | "focused" | "pressed" | "pressed.waiting" | "pressed.repeating" | "scrubbing"
  tag: "focus"
  props: NumberInputProps
  defaultPropKey: PropsWithDefault
  context: PrivateContext
  refs: {
    syncFrame: AnimationFrame
    focusFrame: AnimationFrame
    pressDirection: StepDirection
    committedValue: number | null
  }
  computed: ComputedContext
  action: string
  event: EventObject
  guard: string
  effect: string
}

export type NumberInputService = Service<NumberInputSchema>

export type NumberInputMachine = Machine<NumberInputSchema>

/* -----------------------------------------------------------------------------
 * Component API
 * -----------------------------------------------------------------------------*/

export interface RootState {
  /**
   * Whether the number input is disabled.
   */
  disabled: boolean
  /**
   * Whether the number input is focused.
   */
  focused: boolean
  /**
   * Whether the number input is invalid.
   */
  invalid: boolean
  /**
   * Whether the number input is being scrubbed.
   */
  scrubbing: boolean
}

export interface InputState {
  /**
   * Whether the input is disabled.
   */
  disabled: boolean
  /**
   * Whether the input is invalid.
   */
  invalid: boolean
  /**
   * Whether the input is read-only.
   */
  readOnly: boolean
  /**
   * Whether the input is being scrubbed.
   */
  scrubbing: boolean
}

export interface IncrementTriggerState {
  /**
   * Whether the increment trigger is disabled.
   */
  disabled: boolean
}

export interface DecrementTriggerState {
  /**
   * Whether the decrement trigger is disabled.
   */
  disabled: boolean
}

export interface NumberInputApi<T extends PropTypes = PropTypes> {
  /**
   * Whether the input is focused.
   */
  focused: boolean
  /**
   * Whether the input is being scrubbed.
   */
  scrubbing: boolean
  /**
   * Whether the input is invalid.
   */
  invalid: boolean
  /**
   * Whether the input value is empty.
   */
  empty: boolean
  /**
   * The number, or `null` when the input is empty.
   */
  value: number | null
  /**
   * The value as shown in the input.
   */
  formattedValue: string
  /**
   * Function to set the value of the input.
   */
  setValue: (value: number) => void
  /**
   * Function to clear the value of the input.
   */
  clearValue: VoidFunction
  /**
   * Function to increment the value of the input by the step.
   */
  increment: VoidFunction
  /**
   * Function to decrement the value of the input by the step.
   */
  decrement: VoidFunction
  /**
   * Function to set the value of the input to the max.
   */
  setToMax: VoidFunction
  /**
   * Function to set the value of the input to the min.
   */
  setToMin: VoidFunction
  /**
   * Function to focus the input.
   */
  focus: VoidFunction

  /**
   * Returns the state of the root.
   */
  getRootState: () => RootState
  getRootProps: () => T["element"]
  getLabelProps: () => T["label"]
  getControlProps: () => T["element"]
  getValueTextProps: () => T["element"]
  /**
   * Returns the state of the input.
   */
  getInputState: () => InputState
  getInputProps: () => T["input"]
  getHiddenInputProps: () => T["input"]
  /**
   * Returns the state of the decrement trigger.
   */
  getDecrementTriggerState: () => DecrementTriggerState
  getDecrementTriggerProps: () => T["button"]
  /**
   * Returns the state of the increment trigger.
   */
  getIncrementTriggerState: () => IncrementTriggerState
  getIncrementTriggerProps: () => T["button"]
  getScrubberProps: () => T["element"]
  getScrubberCursorProps: () => T["element"]
}
