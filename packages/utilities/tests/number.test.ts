import { isFloatingPoint } from "../src"

describe("number.utils", () => {
  it("checks exponents", () => {
    expect(isFloatingPoint("ee")).toBeFalsy()
    expect(isFloatingPoint("e")).toBeFalsy()
    expect(isFloatingPoint("0.2e4")).toBeTruthy()
  })

  it("checks decimals", () => {
    expect(isFloatingPoint("1.2")).toBeTruthy()
    expect(isFloatingPoint(".2")).toBeTruthy()
    expect(isFloatingPoint("12.3.34.34")).toBeFalsy()
  })

  it("checks integers", () => {
    expect(isFloatingPoint("1")).toBeTruthy()
    expect(isFloatingPoint("-12")).toBeTruthy()
  })
})
