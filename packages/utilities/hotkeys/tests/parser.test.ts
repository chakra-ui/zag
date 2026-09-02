import { isHotkeyEqual, normalizeHotkey, parseHotkey } from "../src/parser"

describe("parseHotkey", () => {
  describe("plus key handling", () => {
    it("should parse mod++ correctly on mac", () => {
      const result = parseHotkey("mod++", "mac")
      expect(result).toMatchInlineSnapshot(`
        {
          "alt": false,
          "codes": [
            "Equal",
          ],
          "ctrl": false,
          "isSequence": false,
          "keys": [
            "+",
          ],
          "meta": true,
          "shift": false,
        }
      `)
    })

    it("should parse mod++ correctly on windows", () => {
      const result = parseHotkey("mod++", "windows")
      expect(result).toMatchInlineSnapshot(`
        {
          "alt": false,
          "codes": [
            "Equal",
          ],
          "ctrl": true,
          "isSequence": false,
          "keys": [
            "+",
          ],
          "meta": false,
          "shift": false,
        }
      `)
    })

    it("should parse Control++ correctly", () => {
      const result = parseHotkey("Control++", "windows")
      expect(result).toMatchInlineSnapshot(`
        {
          "alt": false,
          "codes": [
            "Equal",
          ],
          "ctrl": true,
          "isSequence": false,
          "keys": [
            "+",
          ],
          "meta": false,
          "shift": false,
        }
      `)
    })

    it("should parse simple + key", () => {
      const result = parseHotkey("+", "mac")
      expect(result).toMatchInlineSnapshot(`
        {
          "alt": false,
          "codes": [
            "Equal",
          ],
          "ctrl": false,
          "isSequence": false,
          "keys": [
            "+",
          ],
          "meta": false,
          "shift": false,
        }
      `)
    })

    it("should parse mod+S correctly", () => {
      const result = parseHotkey("mod+S", "mac")
      expect(result).toMatchInlineSnapshot(`
        {
          "alt": false,
          "codes": [
            "KeyS",
          ],
          "ctrl": false,
          "isSequence": false,
          "keys": [
            "S",
          ],
          "meta": true,
          "shift": false,
        }
      `)
    })
  })
})

describe("bare modifiers", () => {
  it("should parse a lone modifier as a modifier, not a key", () => {
    expect(parseHotkey("shift", "mac")).toMatchObject({ keys: [], shift: true })
    expect(parseHotkey("ctrl", "mac")).toMatchObject({ keys: [], ctrl: true })
    expect(parseHotkey("alt", "mac")).toMatchObject({ keys: [], alt: true })
    expect(parseHotkey("meta", "mac")).toMatchObject({ keys: [], meta: true })
  })

  it("should be case insensitive for lone modifiers", () => {
    expect(parseHotkey("Shift", "mac")).toMatchObject({ keys: [], shift: true })
  })

  it("should resolve a lone mod per platform", () => {
    expect(parseHotkey("mod", "mac")).toMatchObject({ keys: [], meta: true })
    expect(parseHotkey("mod", "windows")).toMatchObject({ keys: [], ctrl: true })
  })

  it("should still treat non-modifier single keys as keys", () => {
    expect(parseHotkey("k", "mac")).toMatchObject({ keys: ["K"], shift: false })
  })
})

describe("normalizeHotkey", () => {
  it("should produce the same string for equivalent hotkeys", () => {
    expect(normalizeHotkey("mod+k", "mac")).toBe(normalizeHotkey("Meta+K", "mac"))
    expect(normalizeHotkey("mod+k", "windows")).toBe(normalizeHotkey("Control+K", "windows"))
    expect(normalizeHotkey("ctrl+shift+k", "mac")).toBe(normalizeHotkey("Shift+Control+K", "mac"))
  })

  it("should order modifiers canonically", () => {
    expect(normalizeHotkey("shift+ctrl+alt+meta+k", "mac")).toBe("Control+Alt+Shift+Meta+K")
  })

  it("should normalize sequences", () => {
    expect(normalizeHotkey("g > h", "mac")).toBe("G > H")
    expect(normalizeHotkey("G>H", "mac")).toBe("G > H")
  })

  it("should normalize a bare modifier", () => {
    expect(normalizeHotkey("shift", "mac")).toBe("Shift")
  })

  it("should agree with isHotkeyEqual", () => {
    const pairs: Array<[string, string]> = [
      ["mod+k", "Meta+K"],
      ["ctrl+shift+k", "Shift+Control+K"],
      ["g > h", "G>H"],
    ]
    for (const [a, b] of pairs) {
      expect(normalizeHotkey(a, "mac") === normalizeHotkey(b, "mac")).toBe(isHotkeyEqual(a, b, "mac"))
    }
  })

  it("should distinguish different hotkeys", () => {
    expect(normalizeHotkey("mod+k", "mac")).not.toBe(normalizeHotkey("mod+j", "mac"))
    expect(normalizeHotkey("ctrl+k", "mac")).not.toBe(normalizeHotkey("meta+k", "mac"))
  })
})
