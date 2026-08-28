import type { ValidateResult, ValidationMode, ValidityMatch, ValiditySnapshot } from "./field.types"

const VALIDITY_KEYS = [
  "badInput",
  "customError",
  "patternMismatch",
  "rangeOverflow",
  "rangeUnderflow",
  "stepMismatch",
  "tooLong",
  "tooShort",
  "typeMismatch",
  "valueMissing",
] as const satisfies readonly ValidityMatch[]

export const VALID_SNAPSHOT: ValiditySnapshot = Object.freeze({
  badInput: false,
  customError: false,
  patternMismatch: false,
  rangeOverflow: false,
  rangeUnderflow: false,
  stepMismatch: false,
  tooLong: false,
  tooShort: false,
  typeMismatch: false,
  valueMissing: false,
  valid: true,
})

/** Copy the live `ValidityState` — its getters are recomputed on every read. */
export function getValiditySnapshot(el: { validity: ValidityState }): ValiditySnapshot {
  const snapshot = {} as ValiditySnapshot
  for (const key of VALIDITY_KEYS) snapshot[key] = el.validity[key]
  snapshot.valid = el.validity.valid
  return snapshot
}

/**
 * A pristine empty required field is not an error yet. When `valueMissing` is the
 * only failure, report the field as valid until the user interacts or a submit forces it.
 */
export function suppressValueMissing(validity: ValiditySnapshot): ValiditySnapshot {
  if (!validity.valueMissing) return validity
  const onlyValueMissing = VALIDITY_KEYS.every((key) => key === "valueMissing" || !validity[key])
  if (!onlyValueMissing) return validity
  return { ...validity, valueMissing: false, valid: true }
}

export function toErrorArray(result: ValidateResult): string[] {
  if (result == null) return []
  const errors = Array.isArray(result) ? result : [result]
  return errors.filter((error) => typeof error === "string" && error.length > 0)
}

export interface ResolveErrorsOptions {
  customErrors: string[]
  validity: ValiditySnapshot
  nativeMessage: string
}

export interface ResolvedValidation {
  errors: string[]
  validity: ValiditySnapshot
}

/**
 * Priority: custom `validate` errors outrank native constraint errors.
 * (The controlled `invalid` prop outranks both, at the computed level.)
 */
export function resolveValidation(options: ResolveErrorsOptions): ResolvedValidation {
  const { customErrors, validity, nativeMessage } = options
  if (customErrors.length > 0) {
    return {
      errors: customErrors,
      validity: { ...validity, customError: true, valid: false },
    }
  }
  if (!validity.valid) {
    return { errors: nativeMessage ? [nativeMessage] : [], validity }
  }
  return { errors: [], validity }
}

export interface DescribedByOptions {
  helperTextId: string
  hasHelperText: boolean
  errorTextIds: string[]
}

/**
 * Description first, then visible error ids in DOM order.
 * Hidden error texts must not be referenced — screen readers still announce them.
 */
export function composeDescribedBy(options: DescribedByOptions): string | undefined {
  const ids: string[] = []
  if (options.hasHelperText) ids.push(options.helperTextId)
  ids.push(...options.errorTextIds)
  return ids.length > 0 ? ids.join(" ") : undefined
}

export interface ResolveErrorTextIdOptions {
  machineId: string
  override?: string | undefined
  match?: ValidityMatch | boolean | undefined
  id?: string | undefined
}

/** Default id, or `{id}:error-text:{match}` when `match` is a validity key. */
export function resolveErrorTextId(options: ResolveErrorTextIdOptions): string {
  if (options.id) return options.id
  if (typeof options.match === "string") return `${options.machineId}:error-text:${options.match}`
  return options.override ?? `${options.machineId}:error-text`
}

export interface ErrorMatchOptions {
  validity: ValiditySnapshot | null
  invalid: boolean
  disabled: boolean
}

export interface ShouldCommitOptions {
  mode: ValidationMode
  submitAttempted: boolean
  eventType: string
}

/**
 * Whether this event should commit validation (make it visible).
 * `VALIDATE` / `SUBMIT.INVALID` always commit and do not go through this.
 */
export function shouldCommit(options: ShouldCommitOptions): boolean {
  const { mode, submitAttempted, eventType } = options
  if (eventType === "CONTROL.BLUR") return mode === "onBlur"
  if (eventType === "CONTROL.CHANGE") return mode === "onChange" || (mode === "onSubmit" && submitAttempted)
  return false
}

/** Whether the error text should show for the given `match`. */
export function isErrorMatch(match: ValidityMatch | boolean | undefined, options: ErrorMatchOptions): boolean {
  const { validity, invalid, disabled } = options
  if (match === true) return true
  if (match === false || disabled) return false
  if (typeof match === "string") return validity?.[match] === true
  return invalid
}
