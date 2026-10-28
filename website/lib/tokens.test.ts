import { describe, expect, test } from "vitest"
import { grays, semanticColors } from "../theme/colors"

const modes = (value: unknown) =>
  (value as { value: Record<string, string> }).value

describe("redesign tokens", () => {
  test("the dark page is #0b0b0c and the light page is white", () => {
    expect(grays["925"].value).toBe("#0b0b0c")
    expect(modes(semanticColors.bg.page)).toEqual({
      _light: "{colors.white}",
      _dark: "{colors.gray.925}",
    })
  })

  test("accent is green.600 in light and a bright #4ade80 in dark", () => {
    expect(modes(semanticColors.accent.DEFAULT)).toEqual({
      _light: "{colors.green.600}",
      _dark: "#4ade80",
    })
  })

  test("every spec token exists", () => {
    const keys = {
      bg: ["page", "raised", "inset", "control", "deep"],
      border: ["DEFAULT", "subtle", "strong"],
      fg: ["DEFAULT", "muted", "subtle", "faint"],
      accent: ["DEFAULT", "tint", "line", "solid", "solidFg"],
    } as const
    for (const [group, names] of Object.entries(keys)) {
      for (const name of names) {
        expect(semanticColors[group as keyof typeof keys]).toHaveProperty(name)
      }
    }
  })
})
