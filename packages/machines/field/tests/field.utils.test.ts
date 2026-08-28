// @vitest-environment jsdom

import { describe, expect, test } from "vitest"
import type { ValiditySnapshot } from "../src/field.types"
import {
  composeDescribedBy,
  getValiditySnapshot,
  isErrorMatch,
  resolveErrorTextId,
  resolveValidation,
  shouldCommit,
  suppressValueMissing,
  toErrorArray,
  VALID_SNAPSHOT,
} from "../src/field.utils"

const snapshot = (overrides: Partial<ValiditySnapshot> = {}): ValiditySnapshot => ({
  ...VALID_SNAPSHOT,
  ...overrides,
})

describe("getValiditySnapshot", () => {
  test("copies the live ValidityState into a plain object", () => {
    const input = document.createElement("input")
    input.required = true

    const result = getValiditySnapshot(input)
    expect(result.valueMissing).toBe(true)
    expect(result.valid).toBe(false)

    // the snapshot must not track later changes
    input.value = "hello"
    expect(result.valueMissing).toBe(true)
    expect(input.validity.valueMissing).toBe(false)
  })

  test("reflects custom errors", () => {
    const input = document.createElement("input")
    input.setCustomValidity("nope")
    const result = getValiditySnapshot(input)
    expect(result.customError).toBe(true)
    expect(result.valid).toBe(false)
  })
})

describe("suppressValueMissing", () => {
  test("clears valueMissing when it is the only failure", () => {
    const result = suppressValueMissing(snapshot({ valueMissing: true, valid: false }))
    expect(result.valueMissing).toBe(false)
    expect(result.valid).toBe(true)
  })

  test("keeps valueMissing when another constraint also fails", () => {
    const result = suppressValueMissing(snapshot({ valueMissing: true, tooShort: true, valid: false }))
    expect(result.valueMissing).toBe(true)
    expect(result.valid).toBe(false)
  })

  test("passes an already-valid snapshot through", () => {
    const valid = snapshot()
    expect(suppressValueMissing(valid)).toBe(valid)
  })
})

describe("toErrorArray", () => {
  test("normalizes strings, arrays, and empty results", () => {
    expect(toErrorArray("error")).toEqual(["error"])
    expect(toErrorArray(["a", "b"])).toEqual(["a", "b"])
    expect(toErrorArray(null)).toEqual([])
    expect(toErrorArray(undefined)).toEqual([])
    expect(toErrorArray(["a", "", "b"])).toEqual(["a", "b"])
  })
})

describe("resolveValidation (priority chain)", () => {
  test("custom errors outrank native validity", () => {
    const result = resolveValidation({
      customErrors: ["custom error"],
      validity: snapshot({ tooShort: true, valid: false }),
      nativeMessage: "native message",
    })
    expect(result.errors).toEqual(["custom error"])
    expect(result.validity.customError).toBe(true)
    expect(result.validity.valid).toBe(false)
    // the native failure stays visible in the snapshot for `match`
    expect(result.validity.tooShort).toBe(true)
  })

  test("native validity applies when no custom errors", () => {
    const result = resolveValidation({
      customErrors: [],
      validity: snapshot({ valueMissing: true, valid: false }),
      nativeMessage: "Please fill out this field.",
    })
    expect(result.errors).toEqual(["Please fill out this field."])
    expect(result.validity.valid).toBe(false)
  })

  test("valid when neither fails", () => {
    const result = resolveValidation({ customErrors: [], validity: snapshot(), nativeMessage: "" })
    expect(result.errors).toEqual([])
    expect(result.validity.valid).toBe(true)
  })
})

describe("isErrorMatch", () => {
  const base = { validity: snapshot({ valueMissing: true, valid: false }), invalid: true, disabled: false }

  test("no match shows whenever the field is invalid", () => {
    expect(isErrorMatch(undefined, base)).toBe(true)
    expect(isErrorMatch(undefined, { ...base, invalid: false })).toBe(false)
  })

  test("validity key matches only that native failure", () => {
    expect(isErrorMatch("valueMissing", base)).toBe(true)
    expect(isErrorMatch("tooShort", base)).toBe(false)
    expect(isErrorMatch("valueMissing", { ...base, validity: null })).toBe(false)
  })

  test("boolean forces or suppresses", () => {
    expect(isErrorMatch(true, { ...base, invalid: false })).toBe(true)
    expect(isErrorMatch(false, base)).toBe(false)
  })

  test("disabled hides the error unless forced", () => {
    expect(isErrorMatch(undefined, { ...base, disabled: true })).toBe(false)
    expect(isErrorMatch("valueMissing", { ...base, disabled: true })).toBe(false)
    expect(isErrorMatch(true, { ...base, disabled: true })).toBe(true)
  })
})

describe("shouldCommit", () => {
  test("onChange commits on every change, not on blur", () => {
    expect(shouldCommit({ mode: "onChange", submitAttempted: false, eventType: "CONTROL.CHANGE" })).toBe(true)
    expect(shouldCommit({ mode: "onChange", submitAttempted: false, eventType: "CONTROL.BLUR" })).toBe(false)
  })

  test("onBlur commits on blur, not on change", () => {
    expect(shouldCommit({ mode: "onBlur", submitAttempted: false, eventType: "CONTROL.BLUR" })).toBe(true)
    expect(shouldCommit({ mode: "onBlur", submitAttempted: true, eventType: "CONTROL.CHANGE" })).toBe(false)
  })

  test("onSubmit commits on change only after a submit attempt", () => {
    expect(shouldCommit({ mode: "onSubmit", submitAttempted: false, eventType: "CONTROL.CHANGE" })).toBe(false)
    expect(shouldCommit({ mode: "onSubmit", submitAttempted: true, eventType: "CONTROL.CHANGE" })).toBe(true)
    expect(shouldCommit({ mode: "onSubmit", submitAttempted: true, eventType: "CONTROL.BLUR" })).toBe(false)
  })
})

describe("resolveErrorTextId", () => {
  test("uses the default id, or a validity-key suffix", () => {
    expect(resolveErrorTextId({ machineId: "f1" })).toBe("f1:error-text")
    expect(resolveErrorTextId({ machineId: "f1", override: "custom" })).toBe("custom")
    expect(resolveErrorTextId({ machineId: "f1", match: "valueMissing" })).toBe("f1:error-text:valueMissing")
    expect(resolveErrorTextId({ machineId: "f1", match: true, override: "custom" })).toBe("custom")
  })

  test("an explicit id wins", () => {
    expect(resolveErrorTextId({ machineId: "f1", match: "valueMissing", id: "mine" })).toBe("mine")
  })
})

describe("composeDescribedBy", () => {
  test("description first, visible errors in DOM order", () => {
    expect(composeDescribedBy({ helperTextId: "helper", hasHelperText: true, errorTextIds: ["err-a", "err-b"] })).toBe(
      "helper err-a err-b",
    )
  })

  test("hidden or unrendered errors are excluded", () => {
    expect(composeDescribedBy({ helperTextId: "helper", hasHelperText: true, errorTextIds: [] })).toBe("helper")
    expect(composeDescribedBy({ helperTextId: "helper", hasHelperText: false, errorTextIds: ["err"] })).toBe("err")
    expect(composeDescribedBy({ helperTextId: "helper", hasHelperText: false, errorTextIds: [] })).toBeUndefined()
  })
})
