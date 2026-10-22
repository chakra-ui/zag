import { describe, expect, test } from "vitest"
import { endsWithDelimiter } from "../src/tags-input.utils"

describe("@zag-js/tags-input utils", () => {
  test("string delimiter", () => {
    expect(endsWithDelimiter("react,", ",")).toBe(true)
    expect(endsWithDelimiter("re,act", ",")).toBe(false)
    expect(endsWithDelimiter("react", undefined)).toBe(false)
  })

  test("regex delimiter", () => {
    expect(endsWithDelimiter("react,", /[,\s]+/)).toBe(true)
    expect(endsWithDelimiter("react ", /[,\s]+/)).toBe(true)
    expect(endsWithDelimiter("react", /[,\s]+/)).toBe(false)
  })

  test("regex delimiter with alternation only matches at the end", () => {
    expect(endsWithDelimiter("react;", /,|;/)).toBe(true)
    expect(endsWithDelimiter("react,", /,|;/)).toBe(true)
    expect(endsWithDelimiter("re,act", /,|;/)).toBe(false)
  })

  test("regex delimiter keeps its flags", () => {
    expect(endsWithDelimiter("react、", /\u{3001}/u)).toBe(true)
    expect(endsWithDelimiter("react.", /\p{P}/u)).toBe(true)
    expect(endsWithDelimiter("react AND", / and/i)).toBe(true)
    expect(endsWithDelimiter("react,", /,/gy)).toBe(true)
  })
})
