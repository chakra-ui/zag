import { describe, expect, test } from "vitest"
import { splitResizeTriggerId } from "../src/utils/panel"

const panels = (...ids: string[]) => ids.map((id) => ({ id }))

describe("splitResizeTriggerId", () => {
  test("splits plain ids", () => {
    expect(splitResizeTriggerId("a:b", panels("a", "b"))).toEqual(["a", "b"])
  })

  test("splits ids that contain colons, like React's useId", () => {
    expect(splitResizeTriggerId(":r1:::r2:", panels(":r1:", ":r2:"))).toEqual([":r1:", ":r2:"])
    expect(splitResizeTriggerId("nav:main:content", panels("nav:main", "content"))).toEqual(["nav:main", "content"])
  })

  test("splits one-sided ids", () => {
    expect(splitResizeTriggerId("left:", panels("left", "right"))).toEqual(["left", ""])
    expect(splitResizeTriggerId(":right", panels("left", "right"))).toEqual(["", "right"])
    expect(splitResizeTriggerId(":r1::", panels(":r1:", ":r2:"))).toEqual([":r1:", ""])
  })

  test("falls back to the first colon for unknown ids", () => {
    expect(splitResizeTriggerId("x:y", panels("a", "b"))).toEqual(["x", "y"])
  })
})
