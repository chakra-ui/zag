import { parseHotkey } from "../src/parser"

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
