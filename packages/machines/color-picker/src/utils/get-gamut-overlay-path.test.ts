import { describe, expect, test } from "vitest"
import { parseColor } from "@zag-js/color-utils"
import { gamutOverlayRowCount, getGamutOverlayData } from "./get-gamut-overlay-path"

describe("get-gamut-overlay-path", () => {
  const hsba = parseColor("hsba(0, 100%, 100%, 1)")

  test("wrong area axes returns null", () => {
    expect(
      getGamutOverlayData(hsba, { xChannel: "hue", yChannel: "saturation" }, "oklch", { pixelRatio: 1 }),
    ).toBeNull()
  })

  test("non-wide format returns null", () => {
    expect(getGamutOverlayData(hsba, { xChannel: "saturation", yChannel: "brightness" }, "hsla")).toBeNull()
  })

  test("higher pixelRatio increases row count and path complexity", () => {
    const low = getGamutOverlayData(hsba, { xChannel: "saturation", yChannel: "brightness" }, "oklch", {
      pixelRatio: 1,
    })
    const high = getGamutOverlayData(hsba, { xChannel: "saturation", yChannel: "brightness" }, "oklch", {
      pixelRatio: 2,
    })
    expect(low).not.toBeNull()
    expect(high).not.toBeNull()
    expect(gamutOverlayRowCount(2)).toBeGreaterThan(gamutOverlayRowCount(1))
    expect(high!.path.length).toBeGreaterThan(low!.path.length)
  })

  test("gamutOverlayRowCount scales with DPR and caps at 200", () => {
    expect(gamutOverlayRowCount(1)).toBe(80)
    expect(gamutOverlayRowCount(2)).toBe(160)
    expect(gamutOverlayRowCount(100)).toBe(200)
    expect(gamutOverlayRowCount(0.5)).toBe(80)
  })
})
