import { describe, expect, test } from "vitest"
import type { Scope } from "@zag-js/core"
import { getControlId, getItemControlId } from "../src/field.dom"

const scope = { id: "f1" } as Scope

describe("getControlId", () => {
  test("defaults to `{id}:control`", () => {
    expect(getControlId(scope)).toBe("f1:control")
  })

  test("target owns the control id", () => {
    expect(getControlId(scope, "amount")).toBe("f1:item:amount")
    expect(getItemControlId(scope, "amount")).toBe("f1:item:amount")
  })

  test("ids.control overrides target", () => {
    const custom = { id: "f1", ids: { control: "custom-control" } } as unknown as Scope
    expect(getControlId(custom, "amount")).toBe("custom-control")
  })
})
