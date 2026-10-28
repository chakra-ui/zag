import { describe, expect, test } from "vitest"
import { getChangedProps } from "./changed-props"

describe("getChangedProps", () => {
  test("lists keys that differ from their default", () => {
    expect(
      getChangedProps(
        { loopFocus: false, dir: { default: "ltr", options: ["ltr", "rtl"] } },
        { loopFocus: true, dir: "ltr" },
      ),
    ).toEqual(["loopFocus"])
  })

  test("compares option sets by their default", () => {
    expect(
      getChangedProps(
        { loopFocus: false, dir: { default: "ltr", options: ["ltr", "rtl"] } },
        { loopFocus: false, dir: "rtl" },
      ),
    ).toEqual(["dir"])
  })

  test("is empty when nothing changed", () => {
    expect(getChangedProps({ open: false }, { open: false })).toEqual([])
  })
})
