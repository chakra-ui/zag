import { describe, expect, test } from "vitest"
import { getPanelFlexBoxStyle } from "../src/utils/panel"
import { preserveFixedPanelSizes } from "../src/utils/preserve-fixed-panel-sizes"
import { resolvePanelSizes, toCssPanelSize } from "../src/utils/size"

describe("@zag-js/splitter utils", () => {
  test("serializes css unit sizes for server style fallback", () => {
    expect(
      getPanelFlexBoxStyle({
        size: undefined,
        defaultSize: "240px",
        dragState: null,
        resolvedSizes: [],
        panels: [{ id: "sidebar", minSize: "200px", maxSize: "360px" }],
        panelIndex: 0,
        horizontal: true,
      }),
    ).toMatchObject({
      flexBasis: "clamp(200px, 240px, 360px)",
      flexGrow: "0",
      flexShrink: 0,
      minWidth: "200px",
      maxWidth: "360px",
    })
  })

  test("serializes percent sizes as flex grow for server style fallback", () => {
    expect(
      getPanelFlexBoxStyle({
        size: undefined,
        defaultSize: 35,
        dragState: null,
        resolvedSizes: [],
        panels: [{ id: "main", minSize: 20 }],
        panelIndex: 0,
        horizontal: false,
      }),
    ).toMatchObject({
      flexBasis: 0,
      flexGrow: "35.0",
      flexShrink: 1,
      minHeight: "20%",
    })
  })

  test("resolves missing server sizes to remaining percentages", () => {
    expect(
      resolvePanelSizes({
        sizes: ["240px", 60],
        panels: [{ id: "sidebar" }, { id: "content" }],
        rootEl: null,
        orientation: "horizontal",
      }),
    ).toEqual([40, 60])
  })

  test("normalizes css panel size values", () => {
    expect(toCssPanelSize(20)).toBe("20%")
    expect(toCssPanelSize("20")).toBe("20%")
    expect(toCssPanelSize("12rem")).toBe("12rem")
    expect(toCssPanelSize(" 25vw ")).toBe("25vw")
  })

  test("preserves fixed pixel-size panels across group resize", () => {
    expect(
      preserveFixedPanelSizes({
        panels: [{ id: "sidebar", resizeBehavior: "preserve-pixel-size" }, { id: "content" }],
        prevLayout: [25, 75],
        prevGroupSize: 1000,
        nextGroupSize: 500,
      }),
    ).toEqual([50, 50])
  })
})
