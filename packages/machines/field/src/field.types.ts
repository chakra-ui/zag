import type { EventObject, Machine, Params, Service } from "@zag-js/core"
import type { CommonProperties, DirectionProperty, PropTypes } from "@zag-js/types"

/* -----------------------------------------------------------------------------
 * Validity
 * -----------------------------------------------------------------------------*/

/**
 * A plain-object snapshot of the control's native `ValidityState`.
 * The live DOM object is never exposed — its getters change under the framework's feet.
 */
export interface ValiditySnapshot {
  badInput: boolean
  customError: boolean
  patternMismatch: boolean
  rangeOverflow: boolean
  rangeUnderflow: boolean
  stepMismatch: boolean
  tooLong: boolean
  tooShort: boolean
  typeMismatch: boolean
  valueMissing: boolean
  valid: boolean
}

export type ValidityMatch = Exclude<keyof ValiditySnapshot, "valid">

export interface ValidateDetails {
  /**
   * The current value of the control.
   */
  value: string
  /**
   * Snapshot of the control's native validity, taken before custom validation runs.
   */
  validity: ValiditySnapshot
}

/**
 * Return a string or list of strings to mark the field invalid; anything else means valid.
 */
export type ValidateResult = string | string[] | null | undefined | void

export interface ValidityChangeDetails {
  valid: boolean
  errors: string[]
  validity: ValiditySnapshot
  value: string
}

/**
 * When validation is committed (made visible):
 * - `onSubmit`: on form submission — behaves like `onChange` after the first submit attempt
 * - `onBlur`: when the control loses focus
 * - `onChange`: on every change
 */
export type ValidationMode = "onSubmit" | "onBlur" | "onChange"

/* -----------------------------------------------------------------------------
 * Machine context
 * -----------------------------------------------------------------------------*/

export type ElementIds = Partial<{
  root: string
  control: string
  label: string
  errorText: string
  helperText: string
}>

export interface FieldProps extends DirectionProperty, CommonProperties {
  /**
   * The ids of the elements. Useful for composition.
   */
  ids?: ElementIds | undefined
  /**
   * Whether the field is disabled. Also inherited from a surrounding native `<fieldset disabled>`.
   * @default false
   */
  disabled?: boolean | undefined
  /**
   * Whether the field is invalid, regardless of computed validity.
   * Use for app-level errors (e.g. server errors) the machine cannot compute itself.
   */
  invalid?: boolean | undefined
  /**
   * Whether the field's value has been changed from its initial value.
   * Useful when the field state is controlled by an external library.
   */
  dirty?: boolean | undefined
  /**
   * Whether the field has been touched.
   * Useful when the field state is controlled by an external library.
   */
  touched?: boolean | undefined
  /**
   * Whether the field is read-only.
   * @default false
   */
  readOnly?: boolean | undefined
  /**
   * Whether the field is required.
   * @default false
   */
  required?: boolean | undefined
  /**
   * The item whose control the field tracks, for fields composed of multiple controls.
   * The tracked control id (and the root label's `htmlFor`) become `{id}:item:{target}`.
   * `ids.control` overrides this.
   */
  target?: string | undefined
  /**
   * Custom validation, run against the value and the native validity snapshot.
   * May return a promise; a newer validation run supersedes an in-flight one.
   */
  validate?: ((details: ValidateDetails) => ValidateResult | Promise<ValidateResult>) | undefined
  /**
   * When validation results become visible.
   * @default "onSubmit"
   */
  validationMode?: ValidationMode | undefined
  /**
   * Called when the committed validity changes.
   */
  onValidityChange?: ((details: ValidityChangeDetails) => void) | undefined
}

type PropsWithDefault = "disabled" | "readOnly" | "required" | "validationMode"

export interface FieldSchema {
  state: "idle"
  props: FieldProps
  defaultPropKey: PropsWithDefault
  context: {
    touched: boolean
    dirty: boolean
    filled: boolean
    focused: boolean
    validating: boolean
    errors: string[]
    validity: ValiditySnapshot | null
    errorTextIds: string[]
    hasHelperText: boolean
    fieldsetDisabled: boolean
    submitAttempted: boolean
  }
  computed: {
    disabled: boolean
    /**
     * `null` until validation has run — the field is neither valid nor invalid.
     */
    valid: boolean | null
    invalid: boolean
  }
  refs: {
    /**
     * Latches to `true` the first time the field is dirtied. Gates `valueMissing`
     * so a pristine empty required field is not flagged before interaction or submit.
     */
    markedDirty: boolean
    /**
     * The control value at first tracking, the baseline for `dirty`.
     */
    initialValue: string | null
    /**
     * Async validation sequence — stale resolutions are discarded.
     */
    seq: number
  }
  event: EventObject
  action: string
  effect: string
  guard: string
}

export type FieldParams = Params<FieldSchema>

export type FieldService = Service<FieldSchema>

export type FieldMachine = Machine<FieldSchema>

/* -----------------------------------------------------------------------------
 * Component API
 * -----------------------------------------------------------------------------*/

export interface ItemProps {
  /**
   * Identifies this control among siblings in a multi-control field.
   * The id becomes `{id}:item:{item}`. The field tracks the item that matches `target`.
   */
  item?: string | undefined
}

export interface ErrorTextProps {
  /**
   * Narrows when the error text shows:
   * - a `ValidityState` key shows it only for that native failure
   * - `true` forces it visible (e.g. driven by an external form library)
   * - omitted shows it whenever the field is invalid
   */
  match?: ValidityMatch | boolean | undefined
  /**
   * Overrides the generated id. Use when two error texts share the same `match`.
   */
  id?: string | undefined
}

export type IndicatorType = "required" | "invalid" | "valid" | "validating"

export interface IndicatorProps {
  /**
   * The state the indicator reflects. Hidden (not unmounted) unless the state
   * matches, so CSS transitions survive:
   * - `required`: the field is required (e.g. an asterisk)
   * - `invalid`: committed validity is invalid
   * - `valid`: committed validity is valid — a pristine field shows neither
   * - `validating`: an async validation is in flight (e.g. a spinner)
   */
  type: IndicatorType
}

export interface ResolvedElementIds {
  root: string
  control: string
  label: string
  errorText: string
  helperText: string
}

/**
 * Shared interaction and validity state, mirrored onto every field part.
 */
export interface FieldState {
  /**
   * Whether the field is disabled (including inherited fieldset disabled state).
   */
  disabled: boolean
  /**
   * Whether the field is invalid.
   */
  invalid: boolean
  /**
   * Committed validity: `null` until validation has run.
   */
  valid: boolean | null
  /**
   * Whether the field is required.
   */
  required: boolean
  /**
   * Whether the field is read-only.
   */
  readOnly: boolean
  /**
   * Whether the control has been blurred at least once.
   */
  touched: boolean
  /**
   * Whether the value differs from the initial value.
   */
  dirty: boolean
  /**
   * Whether the control has a non-empty value.
   */
  filled: boolean
  /**
   * Whether the control is focused.
   */
  focused: boolean
  /**
   * Whether an async validation is in flight.
   */
  validating: boolean
}

export interface RootState extends FieldState {}

export interface LabelState extends FieldState {}

export interface ControlState extends FieldState {}

export interface HelperTextState extends FieldState {}

export interface ErrorTextState extends FieldState {
  /**
   * Whether the error text is hidden.
   */
  hidden: boolean
}

export interface IndicatorState extends FieldState {
  /**
   * The state this indicator reflects.
   */
  type: IndicatorType
  /**
   * Whether the indicator is hidden.
   */
  hidden: boolean
}

export interface FieldApi<T extends PropTypes = PropTypes> {
  /**
   * The resolved element ids, for composition with other components.
   */
  ids: ResolvedElementIds
  /**
   * Whether the field is disabled (including inherited fieldset disabled state).
   */
  disabled: boolean
  /**
   * Whether the field is invalid.
   */
  invalid: boolean
  /**
   * Committed validity: `null` until validation has run.
   */
  valid: boolean | null
  /**
   * Whether the field is required.
   */
  required: boolean
  /**
   * Whether the field is read-only.
   */
  readOnly: boolean
  /**
   * Whether the control is focused.
   */
  focused: boolean
  /**
   * Whether the control has been blurred at least once.
   */
  touched: boolean
  /**
   * Whether the value differs from the initial value.
   */
  dirty: boolean
  /**
   * Whether the control has a non-empty value.
   */
  filled: boolean
  /**
   * Whether an async validation is in flight.
   */
  validating: boolean
  /**
   * The committed error messages.
   */
  errors: string[]
  /**
   * The committed validity snapshot, `null` until validation has run.
   */
  validity: ValiditySnapshot | null
  /**
   * The composed `aria-describedby`, for wiring custom controls.
   */
  ariaDescribedby: string | undefined
  /**
   * Runs validation now, surfacing `valueMissing` even on a pristine field.
   */
  validate: VoidFunction
  /**
   * Clears committed errors and returns validity to the pristine (unvalidated) state.
   */
  clearErrors: VoidFunction
  /**
   * Resets interaction state and validity to pristine.
   */
  reset: VoidFunction
  /**
   * The control id for a field item (`{id}:item:{item}`).
   */
  getItemControlId: (item: string) => string
  /**
   * Returns the state of the root.
   */
  getRootState: () => RootState
  getRootProps: () => T["element"]
  /**
   * Returns the state of the label.
   */
  getLabelState: () => LabelState
  /**
   * Root label points at the tracked control (`target`). Pass `item` to point at a sibling.
   */
  getLabelProps: (props?: ItemProps) => T["label"]
  /**
   * Returns the state of the control (input, textarea, select, or a custom host).
   */
  getControlState: () => ControlState
  /**
   * Shared control props (id, ARIA, data attrs, listeners) for custom or composed controls.
   * Prefer `getInputProps`, `getTextareaProps`, or `getSelectProps` for native elements.
   * Pass `item` in a multi-control field; the tracked item (`target`) keeps listeners.
   */
  getControlProps: (props?: ItemProps) => T["element"]
  /**
   * Native input props. Pass `item` in a multi-control field.
   */
  getInputProps: (props?: ItemProps) => T["input"]
  /**
   * Native textarea props. Pass `item` in a multi-control field.
   */
  getTextareaProps: (props?: ItemProps) => T["textarea"]
  /**
   * Native select props. Pass `item` in a multi-control field.
   */
  getSelectProps: (props?: ItemProps) => T["select"]
  /**
   * Returns the state of the helper text.
   */
  getHelperTextState: () => HelperTextState
  getHelperTextProps: () => T["element"]
  /**
   * Returns the state of the error text.
   */
  getErrorTextState: (props?: ErrorTextProps) => ErrorTextState
  getErrorTextProps: (props?: ErrorTextProps) => T["element"]
  /**
   * Returns the state of the indicator.
   */
  getIndicatorState: (props: IndicatorProps) => IndicatorState
  getIndicatorProps: (props: IndicatorProps) => T["element"]
}
