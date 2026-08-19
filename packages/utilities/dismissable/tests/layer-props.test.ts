import { describe, expect, test } from "vitest"
import type { LayerSnapshot } from "../src/layer-stack"
import { getDismissableLayerAttrs, getDismissableLayerStyle } from "../src/layer-props"

const inactiveLayer: LayerSnapshot = {
  active: false,
  type: "dialog",
  index: 1,
  nested: true,
  hasNested: true,
  nestedCount: 1,
  blocked: false,
}

describe("layer props", () => {
  test("clears stack metadata for inactive layers", () => {
    expect(getDismissableLayerAttrs(inactiveLayer)).toEqual({
      "data-nested": undefined,
      "data-has-nested": undefined,
    })
    expect(getDismissableLayerStyle(inactiveLayer, { zIndex: true, pointerEvents: true })).toEqual({
      "--layer-index": undefined,
      "--nested-layer-count": undefined,
      "--z-index": undefined,
      pointerEvents: undefined,
    })
  })
})
