import { describe, expect, test } from "vitest"
import { getPlacementStyles } from "../src/get-styles"

describe("getPlacementStyles", () => {
  test("leaves z-index to runtime positioning by default", () => {
    expect(getPlacementStyles().floating.zIndex).toBeUndefined()
  })

  test("consumes the z-index variable when styles are applied manually", () => {
    expect(getPlacementStyles({ applyStyles: false }).floating.zIndex).toBe("var(--z-index)")
  })
})
