import { describe, expect, test } from "vitest"
import { getEventMove } from "../src"

const key = (key: string, mods: { shiftKey?: boolean; altKey?: boolean; isComposing?: boolean } = {}) => ({
  key,
  shiftKey: false,
  altKey: false,
  ...mods,
})

describe("getEventMove", () => {
  test("arrows step, Shift and Alt change the size", () => {
    expect(getEventMove(key("ArrowUp"))).toEqual({ direction: 1, size: "step" })
    expect(getEventMove(key("ArrowLeft"))).toEqual({ direction: -1, size: "step" })
    expect(getEventMove(key("ArrowRight", { shiftKey: true }))).toEqual({ direction: 1, size: "large" })
    expect(getEventMove(key("ArrowDown", { altKey: true }))).toEqual({ direction: -1, size: "small" })
  })

  test("Page keys take a large step, Home and End jump to the bounds", () => {
    expect(getEventMove(key("PageDown"))).toEqual({ direction: -1, size: "large" })
    expect(getEventMove(key("Home"))).toEqual({ bound: "min" })
    expect(getEventMove(key("End"))).toEqual({ bound: "max" })
  })

  test("right to left flips the horizontal arrows", () => {
    expect(getEventMove(key("ArrowRight"), { dir: "rtl" })).toEqual({ direction: -1, size: "step" })
    expect(getEventMove(key("ArrowRight"), { dir: "rtl", orientation: "vertical" })).toEqual({
      direction: 1,
      size: "step",
    })
  })

  test("arrows can be limited to one axis", () => {
    expect(getEventMove(key("ArrowUp"), { arrows: "horizontal" })).toBeNull()
    expect(getEventMove(key("ArrowLeft"), { arrows: "vertical" })).toBeNull()
  })

  test("ignores other keys and keys typed during composition", () => {
    expect(getEventMove(key("a"))).toBeNull()
    expect(getEventMove(key("ArrowUp", { isComposing: true }))).toBeNull()
  })
})
