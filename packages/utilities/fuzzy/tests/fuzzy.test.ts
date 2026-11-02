import { describe, expect, test } from "vitest"
import {
  createFuzzyMatcher,
  createFuzzySearch,
  fuzzyScore,
  getFuzzyMatchRanges,
  prepareFuzzyTarget,
  rankItems,
} from "../src"

const highlight = (text: string, query: string) =>
  getFuzzyMatchRanges(text, query)
    .map(({ start, end }) => text.slice(start, end))
    .join("|")

describe("fuzzyScore", () => {
  test("empty query matches everything", () => {
    expect(fuzzyScore("Settings", "")).toBe(1)
    expect(fuzzyScore("Settings", "   ")).toBe(1)
  })

  test("exact match scores 1", () => {
    expect(fuzzyScore("Settings", "settings")).toBe(1)
  })

  test("long partial matches still rank below an exact match", () => {
    const query = "Create a new project from an existing template"
    expect(fuzzyScore(`${query} using defaults`, query)).toBeLessThan(fuzzyScore(query, query))
    expect(rankItems([`${query} using defaults`, query], (item) => fuzzyScore(item, query))[0]).toBe(query)
  })

  test("non-subsequence scores 0", () => {
    expect(fuzzyScore("Settings", "xyz")).toBe(0)
    expect(fuzzyScore("Set", "settings")).toBe(0)
  })

  test("ignores case and diacritics", () => {
    expect(fuzzyScore("Café", "cafe")).toBe(1)
    expect(fuzzyScore("cafe", "CAFÉ")).toBe(1)
  })

  test("handles text that changes length when lowercased", () => {
    const long = `${"İ".repeat(300)}x`
    expect(fuzzyScore("İstanbul", "istanbul")).toBe(1)
    expect(fuzzyScore("İstanbul", "stan")).toBeGreaterThan(0)
    expect(Number.isFinite(fuzzyScore(long, "i"))).toBe(true)
  })

  test("prefers consecutive and word-start matches", () => {
    expect(fuzzyScore("Open file", "op")).toBeGreaterThan(fuzzyScore("Copy path", "op"))
    expect(fuzzyScore("Git: Push", "gp")).toBeGreaterThan(fuzzyScore("Toggle panel", "gp"))
    expect(fuzzyScore("getUserName", "un")).toBeGreaterThan(fuzzyScore("getrunner", "un"))
  })

  test("prefers word starts in other scripts", () => {
    expect(fuzzyScore("Открыть файл", "фа")).toBeGreaterThan(fuzzyScore("Шрифтафон", "фа"))
    expect(highlight("Открыть файл", "оф")).toBe("О|ф")
  })

  test("matches keywords below the text", () => {
    const keyword = fuzzyScore("Preferences", "settings", ["settings"])
    expect(keyword).toBeGreaterThan(0)
    expect(keyword).toBeLessThan(fuzzyScore("Settings", "settings"))
  })

  test("matches each word on its own", () => {
    expect(fuzzyScore("Toggle dark theme", "theme dark")).toBeGreaterThan(0)
    expect(fuzzyScore("Preferences", "dark theme", ["dark", "theme"])).toBeGreaterThan(0)
    expect(fuzzyScore("Toggle dark theme", "theme xyz")).toBe(0)
  })
})

describe("createFuzzyMatcher", () => {
  test("scores prepared targets like fuzzyScore", () => {
    const match = createFuzzyMatcher("ofl")
    expect(match(prepareFuzzyTarget("Open file", ["launch"]))).toBe(fuzzyScore("Open file", "ofl", ["launch"]))
  })
})

describe("rankItems", () => {
  test("drops non-matches and sorts by score", () => {
    const items = ["Copy path", "Open file", "Close"]
    expect(rankItems(items, (item) => fuzzyScore(item, "op"))).toEqual(["Open file", "Copy path"])
  })

  test("keeps the original order for ties", () => {
    const items = ["b", "a", "c"]
    expect(rankItems(items, () => 1)).toEqual(["b", "a", "c"])
  })
})

describe("createFuzzySearch", () => {
  const items = [
    { label: "Open file", keywords: ["launch"] },
    { label: "Close file" },
    { label: "Copy path" },
    { label: "Settings", keywords: ["preferences"] },
  ]
  const labels = (list: typeof items) => list.map((item) => item.label)

  test("returns all items for an empty query", () => {
    const fuzzy = createFuzzySearch<(typeof items)[number]>({ itemToString: (item) => item.label })
    expect(fuzzy.search(items, "")).toEqual(items)
  })

  test("ranks by text and keywords", () => {
    const fuzzy = createFuzzySearch<(typeof items)[number]>({
      itemToString: (item) => item.label,
      itemToKeywords: (item) => item.keywords,
    })
    expect(labels(fuzzy.search(items, "file"))).toEqual(["Open file", "Close file"])
    expect(labels(fuzzy.search(items, "pref"))).toEqual(["Settings"])
  })

  test("narrowing gives the same result as a fresh search", () => {
    const options = { itemToString: (item: (typeof items)[number]) => item.label }
    const narrowed = createFuzzySearch(options)
    for (const query of ["c", "co", "cop"]) narrowed.search(items, query)
    const fresh = createFuzzySearch(options)
    expect(narrowed.search(items, "copy")).toEqual(fresh.search(items, "copy"))
  })

  test("narrowing keeps ties in their original order", () => {
    const tied = [{ label: "ab" }, { label: "ba" }, { label: "ab" }]
    const fuzzy = createFuzzySearch<{ label: string }>({ itemToString: (item) => item.label })
    fuzzy.search(tied, "b")
    expect(fuzzy.search(tied, "ab")).toEqual([tied[0], tied[2]])
  })

  test("searches all items again when they change", () => {
    const fuzzy = createFuzzySearch<(typeof items)[number]>({ itemToString: (item) => item.label })
    fuzzy.search(items, "set")
    const next = [...items, { label: "Reset" }]
    expect(labels(fuzzy.search(next, "sett"))).toEqual(["Settings"])
    expect(labels(fuzzy.search(next, "reset"))).toEqual(["Reset"])
  })

  test("searches all items again when the array grows in place", () => {
    const list = [{ label: "Settings" }]
    const fuzzy = createFuzzySearch<{ label: string }>({ itemToString: (item) => item.label })
    fuzzy.search(list, "s")
    list.push({ label: "Sync" })
    expect(fuzzy.search(list, "sy")).toEqual([{ label: "Sync" }])
  })

  test("works with primitive items", () => {
    const fuzzy = createFuzzySearch<string>({ itemToString: (item) => item })
    expect(fuzzy.search(["apple", "banana", "grape"], "ap")).toEqual(["apple", "grape"])
  })
})

describe("getFuzzyMatchRanges", () => {
  test("returns nothing for an empty or unmatched query", () => {
    expect(getFuzzyMatchRanges("Open file", "")).toEqual([])
    expect(getFuzzyMatchRanges("Open file", "xyz")).toEqual([])
  })

  test("merges consecutive characters", () => {
    expect(getFuzzyMatchRanges("Open file", "file")).toEqual([{ start: 5, end: 9 }])
  })

  test("prefers word starts", () => {
    expect(highlight("Git: Push", "gp")).toBe("G|P")
    expect(highlight("Open file", "of")).toBe("O|f")
  })

  test("maps back to the original text with diacritics", () => {
    expect(getFuzzyMatchRanges("Café au lait", "cafe")).toEqual([{ start: 0, end: 4 }])
  })

  test("highlights the whole query when it matches across words", () => {
    expect(highlight("new git file", "new file")).toBe("new |file")
  })

  test("falls back to each word", () => {
    expect(highlight("Toggle dark theme", "theme dark")).toBe("dark|theme")
  })
})
