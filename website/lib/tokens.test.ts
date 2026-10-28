import { describe, expect, test } from "vitest"
import config from "../panda.config"
import { grays, semanticColors } from "../theme/colors"

type Mode = "_light" | "_dark"

const modes = (value: unknown) =>
  (value as { value: Record<Mode, string> }).value

const palette = config.theme!.extend!.tokens!.colors as Record<
  string,
  Record<string, { value: string }>
>

const resolve = (ref: string) => {
  if (ref === "{colors.white}") return "#ffffff"
  const match = /^\{colors\.(\w+)\.(\w+)\}$/.exec(ref)
  return match ? palette[match[1]][match[2]].value : ref
}

const luminance = (hex: string) => {
  const [r, g, b] = [1, 3, 5].map((i) => {
    const c = parseInt(hex.slice(i, i + 2), 16) / 255
    return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4
  })
  return 0.2126 * r + 0.7152 * g + 0.0722 * b
}

const contrast = (a: string, b: string) => {
  const [hi, lo] = [luminance(a), luminance(b)].sort((x, y) => y - x)
  return (hi + 0.05) / (lo + 0.05)
}

describe("redesign tokens", () => {
  test("the dark page is #0b0b0c and the light page is white", () => {
    expect(grays["925"].value).toBe("#0b0b0c")
    expect(modes(semanticColors.bg.page)).toEqual({
      _light: "{colors.white}",
      _dark: "{colors.gray.925}",
    })
  })

  const text = {
    "fg.muted": semanticColors.fg.muted,
    "fg.subtle": semanticColors.fg.subtle,
    accent: semanticColors.accent.DEFAULT,
    "syntax.comment": semanticColors.syntax.comment,
    "syntax.string": semanticColors.syntax.string,
  }
  const surfaces = {
    "bg.page": semanticColors.bg.page,
    "bg.raised": semanticColors.bg.raised,
    "bg.control": semanticColors.bg.control,
    "accent.tint": semanticColors.accent.tint,
  }

  for (const mode of ["_light", "_dark"] as const) {
    for (const [fg, fgToken] of Object.entries(text)) {
      test(`${fg} clears WCAG AA on every surface in ${mode}`, () => {
        for (const [bg, bgToken] of Object.entries(surfaces)) {
          const ratio = contrast(
            resolve(modes(fgToken)[mode]),
            resolve(modes(bgToken)[mode]),
          )
          expect(ratio, `${fg} on ${bg}`).toBeGreaterThanOrEqual(4.5)
        }
      })
    }
  }

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
