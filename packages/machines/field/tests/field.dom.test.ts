import { describe, expect, test } from "vitest"
import type { Scope } from "@zag-js/core"
import { getControlId, getDirectControlId, getItemControlId } from "../src/field.dom"

const scope = { id: "f1" } as Scope

describe("getControlId", () => {
  test("defaults to `{id}:control`", () => {
    expect(getControlId(scope)).toBe("f1:control")
  })

  test("target owns the control id", () => {
    expect(getControlId(scope, "amount")).toBe("f1:item:amount")
    expect(getItemControlId(scope, "amount")).toBe("f1:item:amount")
  })

  test("ids.control names the targeted item's control", () => {
    const custom = {
      id: "f1",
      ids: { control: "custom-control" },
    } as unknown as Scope
    expect(getControlId(custom, "amount")).toBe("custom-control")
    expect(getItemControlId(custom, "amount", "amount")).toBe("custom-control")
    expect(getItemControlId(custom, "currency", "amount")).toBe("f1:item:currency")
  })

  test("a control without an item keeps its own id when target is set", () => {
    expect(getDirectControlId(scope)).toBe("f1:control")
    expect(getItemControlId(scope, "currency", "currency")).toBe("f1:item:currency")
  })

  test("ids.control applies to a control without an item", () => {
    const custom = {
      id: "f1",
      ids: { control: "custom-control" },
    } as unknown as Scope
    expect(getDirectControlId(custom)).toBe("custom-control")
    expect(getControlId(custom)).toBe("custom-control")
  })
})
