import { describe, expect, test, vi } from "vitest"
import { defaultTranslations } from "../src/combobox.translations"

describe("combobox translations", () => {
  test("defaultTranslations.highlightedItem formats correctly when unselected", () => {
    expect(defaultTranslations.highlightedItem({ label: "Apple", selected: false })).toBe("Apple")
  })

  test("defaultTranslations.highlightedItem formats correctly when selected", () => {
    expect(defaultTranslations.highlightedItem({ label: "Apple", selected: true })).toBe("Apple, selected")
  })

  test("custom highlightedItem translation overrides default text", () => {
    const customTranslation = vi.fn(({ label, selected }: { label: string; selected: boolean }) =>
      selected ? `${label}, sélectionné` : label,
    )

    const result = customTranslation({ label: "Banane", selected: true })
    expect(result).toBe("Banane, sélectionné")
    expect(customTranslation).toHaveBeenCalledWith({ label: "Banane", selected: true })
  })

  test("custom highlightedItem translation can disable announcement with empty string", () => {
    const customTranslation = vi.fn(() => "")
    const result = customTranslation()
    expect(result).toBe("")
  })
})
