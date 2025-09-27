import { normalizeKey } from "../src/normalize"

describe("normalizeKey", () => {
  describe("single letters", () => {
    it("should uppercase lowercase letters", () => {
      expect(normalizeKey("a")).toBe("A")
      expect(normalizeKey("z")).toBe("Z")
      expect(normalizeKey("m")).toBe("M")
    })

    it("should preserve uppercase letters", () => {
      expect(normalizeKey("A")).toBe("A")
      expect(normalizeKey("Z")).toBe("Z")
      expect(normalizeKey("M")).toBe("M")
    })

    it("should handle single letter edge cases", () => {
      expect(normalizeKey("")).toBe("")
      expect(normalizeKey("1")).toBe("1") // digits should not be uppercased
      expect(normalizeKey("!")).toBe("!") // special chars should be preserved
    })
  })

  describe("special keys", () => {
    it("should normalize backspace variants", () => {
      expect(normalizeKey("backspace")).toBe("Backspace")
      expect(normalizeKey("Backspace")).toBe("Backspace")
      expect(normalizeKey("BACKSPACE")).toBe("Backspace")
    })

    it("should normalize tab", () => {
      expect(normalizeKey("tab")).toBe("Tab")
      expect(normalizeKey("Tab")).toBe("Tab")
    })

    it("should normalize clear", () => {
      expect(normalizeKey("clear")).toBe("Clear")
      expect(normalizeKey("Clear")).toBe("Clear")
    })

    it("should normalize enter/return", () => {
      expect(normalizeKey("enter")).toBe("Enter")
      expect(normalizeKey("return")).toBe("Enter")
      expect(normalizeKey("Enter")).toBe("Enter")
      expect(normalizeKey("Return")).toBe("Enter")
    })

    it("should normalize escape variants", () => {
      expect(normalizeKey("esc")).toBe("Escape")
      expect(normalizeKey("escape")).toBe("Escape")
      expect(normalizeKey("Esc")).toBe("Escape")
      expect(normalizeKey("Escape")).toBe("Escape")
    })

    it("should normalize space variants", () => {
      expect(normalizeKey("space")).toBe(" ")
      expect(normalizeKey("spacebar")).toBe(" ")
      expect(normalizeKey("Space")).toBe(" ")
      expect(normalizeKey("Spacebar")).toBe(" ")
    })

    it("should normalize arrow keys", () => {
      expect(normalizeKey("up")).toBe("ArrowUp")
      expect(normalizeKey("arrowup")).toBe("ArrowUp")
      expect(normalizeKey("Up")).toBe("ArrowUp")
      expect(normalizeKey("ArrowUp")).toBe("ArrowUp")

      expect(normalizeKey("down")).toBe("ArrowDown")
      expect(normalizeKey("arrowdown")).toBe("ArrowDown")
      expect(normalizeKey("Down")).toBe("ArrowDown")

      expect(normalizeKey("left")).toBe("ArrowLeft")
      expect(normalizeKey("arrowleft")).toBe("ArrowLeft")
      expect(normalizeKey("Left")).toBe("ArrowLeft")

      expect(normalizeKey("right")).toBe("ArrowRight")
      expect(normalizeKey("arrowright")).toBe("ArrowRight")
      expect(normalizeKey("Right")).toBe("ArrowRight")
    })

    it("should normalize page navigation keys", () => {
      expect(normalizeKey("pageup")).toBe("PageUp")
      expect(normalizeKey("pgup")).toBe("PageUp")
      expect(normalizeKey("PageUp")).toBe("PageUp")

      expect(normalizeKey("pagedown")).toBe("PageDown")
      expect(normalizeKey("pgdn")).toBe("PageDown")
      expect(normalizeKey("PageDown")).toBe("PageDown")

      expect(normalizeKey("home")).toBe("Home")
      expect(normalizeKey("Home")).toBe("Home")

      expect(normalizeKey("end")).toBe("End")
      expect(normalizeKey("End")).toBe("End")
    })

    it("should normalize delete/insert keys", () => {
      expect(normalizeKey("del")).toBe("Delete")
      expect(normalizeKey("delete")).toBe("Delete")
      expect(normalizeKey("Del")).toBe("Delete")
      expect(normalizeKey("Delete")).toBe("Delete")

      expect(normalizeKey("ins")).toBe("Insert")
      expect(normalizeKey("insert")).toBe("Insert")
      expect(normalizeKey("Ins")).toBe("Insert")
      expect(normalizeKey("Insert")).toBe("Insert")
    })
  })

  describe("function keys", () => {
    it("should normalize function keys F1-F19", () => {
      expect(normalizeKey("f1")).toBe("F1")
      expect(normalizeKey("F1")).toBe("F1")
      expect(normalizeKey("f10")).toBe("F10")
      expect(normalizeKey("F10")).toBe("F10")
      expect(normalizeKey("f19")).toBe("F19")
      expect(normalizeKey("F19")).toBe("F19")
    })

    it("should not normalize F20 or higher", () => {
      expect(normalizeKey("f20")).toBe("f20") // Should not be normalized
      expect(normalizeKey("F20")).toBe("F20") // Should be preserved as-is
      expect(normalizeKey("f25")).toBe("f25")
    })

    it("should not normalize invalid function key formats", () => {
      expect(normalizeKey("f")).toBe("F") // single letter gets uppercased
      expect(normalizeKey("f0")).toBe("f0")
      expect(normalizeKey("fa")).toBe("fa")
    })
  })

  describe("default cases", () => {
    it("should preserve already normalized keys", () => {
      expect(normalizeKey("ArrowUp")).toBe("ArrowUp")
      expect(normalizeKey("Backspace")).toBe("Backspace")
      expect(normalizeKey("Enter")).toBe("Enter")
      expect(normalizeKey(" ")).toBe(" ")
    })

    it("should preserve special characters", () => {
      expect(normalizeKey("+")).toBe("+")
      expect(normalizeKey("-")).toBe("-")
      expect(normalizeKey("=")).toBe("=")
      expect(normalizeKey("@")).toBe("@")
      expect(normalizeKey("#")).toBe("#")
    })

    it("should preserve numbers", () => {
      expect(normalizeKey("1")).toBe("1")
      expect(normalizeKey("0")).toBe("0")
      expect(normalizeKey("123")).toBe("123")
    })

    it("should preserve mixed case words", () => {
      expect(normalizeKey("SomeKey")).toBe("SomeKey")
      expect(normalizeKey("camelCase")).toBe("camelCase")
    })

    it("should handle edge cases", () => {
      expect(normalizeKey("")).toBe("")
      expect(normalizeKey("a1")).toBe("a1") // mixed alphanumeric
      expect(normalizeKey("key.with.dots")).toBe("key.with.dots")
    })
  })
})
