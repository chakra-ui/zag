import {
  isArray,
  isDecimal,
  isFunction,
  isNumber,
  isObject,
  isObjectEmpty,
  isString,
  __TEST__,
} from "../src"

describe("Assertions", () => {
  it("should run in text environment", () => {
    expect(__TEST__).toBeTruthy()
  })

  it("should check is number", () => {
    expect(isNumber(1)).toBeTruthy()
    expect(isNumber(1.2)).toBeTruthy()
    expect(isNumber("20")).toBeFalsy()
  })

  it("should check is decimal", () => {
    expect(isDecimal(1)).toBeFalsy()
    expect(isDecimal(1.2)).toBeTruthy()
    expect(isDecimal("20")).toBeFalsy()
    expect(isDecimal("20.2")).toBeTruthy()
  })

  it("should check is object", () => {
    expect(isObject([])).toBeFalsy()
    expect(isObject({})).toBeTruthy()
  })

  it("should check is empty object", () => {
    expect(isObjectEmpty([])).toBeFalsy()
    expect(isObjectEmpty({})).toBeTruthy()
  })

  it("should check is array", () => {
    expect(isArray([1])).toBeTruthy()
  })

  it("should check is function", () => {
    expect(isFunction(() => {})).toBeTruthy()
  })

  it("should check is string", () => {
    expect(isString("1")).toBeTruthy()
  })
})
