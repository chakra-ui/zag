import { describe, expect, test } from "vitest"
import { getByTypeahead } from "../src/typeahead"

const items = ["Copy", "Éditer", "Экспорт", "日本語"].map((text, i) => ({ id: `item-${i}`, textContent: text }))

const search = (key: string) => getByTypeahead(items, { state: { keysSoFar: "", timer: -1 }, activeId: null, key })

describe("getByTypeahead", () => {
  test("matches ASCII text", () => {
    expect(search("c")?.textContent).toBe("Copy")
  })

  test("matches text that starts with an accented character", () => {
    expect(search("é")?.textContent).toBe("Éditer")
  })

  test("matches text in a non-Latin script", () => {
    expect(search("э")?.textContent).toBe("Экспорт")
    expect(search("日")?.textContent).toBe("日本語")
  })
})
