import { memo } from "@zag-js/core"
import { describe, expect, test } from "vitest"
import { hashTranslations } from "../src/utils/placeholders"

// Guards the regression path: `isEqual` compares functions by reference, so a raw
// `translations` object in the memo deps would miss on every render.
describe("segments memo stability", () => {
  const build = (dep: (locale: string, t: any) => unknown) => {
    let runs = 0
    const compute = memo(
      (args: { locale: string; translations: any }) => [args.locale, dep(args.locale, args.translations)],
      () => ++runs,
    )
    return { compute, runs: () => runs }
  }

  // Simulates React re-rendering with an inline object literal prop.
  const render = (n: number) =>
    Array.from({ length: n }, () => ({
      locale: "en-US",
      translations: { placeholder: () => ({ day: "dd", month: "mm", year: "yyyy" }) },
    }))

  test("raw translations object busts the memo on every render", () => {
    const { compute, runs } = build((_locale, t) => t)
    render(5).forEach(compute)
    expect(runs()).toBe(5)
  })

  test("hashTranslations keeps the memo warm across renders", () => {
    const { compute, runs } = build((locale, t) => hashTranslations(t, locale))
    render(5).forEach(compute)
    expect(runs()).toBe(1)
  })

  test("still recomputes when the placeholders actually change", () => {
    const { compute, runs } = build((locale, t) => hashTranslations(t, locale))
    compute({ locale: "en-US", translations: { placeholder: () => ({ day: "dd" }) } })
    compute({ locale: "en-US", translations: { placeholder: () => ({ day: "DD" }) } })
    expect(runs()).toBe(2)
  })

  test("still recomputes when the locale changes", () => {
    const { compute, runs } = build((locale, t) => hashTranslations(t, locale))
    compute({ locale: "en-US", translations: undefined })
    compute({ locale: "de-DE", translations: undefined })
    expect(runs()).toBe(2)
  })
})
