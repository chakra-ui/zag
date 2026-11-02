import { describe, expect, test } from "vitest"
import { trimTrailingDelimiter } from "../src/tags-input.utils"

describe("@zag-js/tags-input utils", () => {
  test("string delimiter", () => {
    expect(trimTrailingDelimiter("react,", ",")).toBe("react")
    expect(trimTrailingDelimiter("re,act", ",")).toBeUndefined()
    expect(trimTrailingDelimiter("react", undefined)).toBeUndefined()
  })

  test("regex delimiter", () => {
    expect(trimTrailingDelimiter("react, ", /[,\s]+/)).toBe("react")
    expect(trimTrailingDelimiter("react", /[,\s]+/)).toBeUndefined()
  })

  test("regex delimiter with alternation only matches at the end", () => {
    expect(trimTrailingDelimiter("react;", /,|;/)).toBe("react")
    expect(trimTrailingDelimiter("re,act", /,|;/)).toBeUndefined()
  })

  test("regex delimiter keeps its flags", () => {
    expect(trimTrailingDelimiter("react、", /\u{3001}/u)).toBe("react")
    expect(trimTrailingDelimiter("react.", /\p{P}/u)).toBe("react")
    expect(trimTrailingDelimiter("react AND", / and/i)).toBe("react")
    expect(trimTrailingDelimiter("react,", /,/gy)).toBe("react")
  })

  test("regex delimiter that matches an empty string", () => {
    expect(trimTrailingDelimiter("react", /,*/)).toBeUndefined()
  })
})
