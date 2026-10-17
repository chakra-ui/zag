import { describe, expect, test } from "vitest"
import { getByTypeahead } from "../src/typeahead"

const items = ["Copy", "Éditer", "Öffnen", "Экспорт", "日本語"].map((text, i) => ({
  id: `item-${i}`,
  textContent: text,
}))

const search = (key: string, list = items) =>
  getByTypeahead(list, { state: { keysSoFar: "", timer: -1 }, activeId: null, key })?.textContent

describe("getByTypeahead", () => {
  test("matches regardless of case", () => {
    expect(search("c")).toBe("Copy")
    expect(search("C")).toBe("Copy")
  })

  test("matches text that starts with an accented character", () => {
    expect(search("é")).toBe("Éditer")
    expect(search("ö")).toBe("Öffnen")
  })

  test("matches accented text from the unaccented letter", () => {
    expect(search("e")).toBe("Éditer")
    expect(search("o")).toBe("Öffnen")
  })

  test("matches decomposed accents", () => {
    const decomposed = [{ id: "item", textContent: "Éditer" }]
    expect(search("é", decomposed)).toBe("Éditer")
  })

  test("matches text in a non-Latin script", () => {
    expect(search("э")).toBe("Экспорт")
    expect(search("日")).toBe("日本語")
  })
})
