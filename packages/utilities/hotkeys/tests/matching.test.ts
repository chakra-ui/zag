// @vitest-environment jsdom

import { describe, expect, it } from "vitest"
import { isHotKey, matchesHotkey, parseHotkey } from "../src/parser"
import { isSymbolKey } from "../src/utils"

// Helper to create a simulated KeyboardEvent-like object
function createKeyEvent(options: {
  key: string
  code: string
  ctrlKey?: boolean
  altKey?: boolean
  shiftKey?: boolean
  metaKey?: boolean
  altGraph?: boolean
}): KeyboardEvent {
  const { key, code, ctrlKey = false, altKey = false, shiftKey = false, metaKey = false, altGraph = false } = options
  return {
    key,
    code,
    ctrlKey,
    altKey,
    shiftKey,
    metaKey,
    getModifierState(modifier: string) {
      if (modifier === "AltGraph") return altGraph
      if (modifier === "Control") return ctrlKey
      if (modifier === "Alt") return altKey
      if (modifier === "Shift") return shiftKey
      if (modifier === "Meta") return metaKey
      return false
    },
  } as unknown as KeyboardEvent
}

describe("matchesHotkey", () => {
  // ---------------------------------------------------------------------------
  // US QWERTY baseline
  // ---------------------------------------------------------------------------
  describe("US QWERTY layout", () => {
    it("matches / on US keyboard", () => {
      const parsed = parseHotkey("/", "windows")
      const event = createKeyEvent({ key: "/", code: "Slash" })
      expect(matchesHotkey(parsed, event)).toBe(true)
    })

    it("matches Ctrl+/ on US keyboard", () => {
      const parsed = parseHotkey("Control+/", "windows")
      const event = createKeyEvent({ key: "/", code: "Slash", ctrlKey: true })
      expect(matchesHotkey(parsed, event)).toBe(true)
    })

    it("matches Mod+/ on Mac", () => {
      const parsed = parseHotkey("mod+/", "mac")
      const event = createKeyEvent({ key: "/", code: "Slash", metaKey: true })
      expect(matchesHotkey(parsed, event)).toBe(true)
    })

    it("does not match / when Ctrl is pressed (no Ctrl in hotkey)", () => {
      const parsed = parseHotkey("/", "windows")
      const event = createKeyEvent({ key: "/", code: "Slash", ctrlKey: true })
      // Ctrl is an intentional modifier, so "/" without Ctrl should not match
      expect(matchesHotkey(parsed, event)).toBe(false)
    })

    it("matches letter keys with strict modifier check", () => {
      const parsed = parseHotkey("Control+S", "windows")
      const event = createKeyEvent({ key: "s", code: "KeyS", ctrlKey: true })
      expect(matchesHotkey(parsed, event)).toBe(true)
    })

    it("does not match letter key when extra shift is pressed", () => {
      const parsed = parseHotkey("Control+S", "windows")
      const event = createKeyEvent({ key: "S", code: "KeyS", ctrlKey: true, shiftKey: true })
      expect(matchesHotkey(parsed, event)).toBe(false)
    })
  })

  // ---------------------------------------------------------------------------
  // German QWERTZ layout
  // ---------------------------------------------------------------------------
  describe("German QWERTZ layout", () => {
    it("matches / when produced via Shift+7", () => {
      // On German QWERTZ: / is at Shift+7
      // event.key = "/", event.code = "Digit7", shiftKey = true
      const parsed = parseHotkey("/", "windows")
      const event = createKeyEvent({ key: "/", code: "Digit7", shiftKey: true })
      expect(matchesHotkey(parsed, event)).toBe(true)
    })

    it("matches Ctrl+/ when produced via Ctrl+Shift+7", () => {
      // German: Ctrl+/ requires Ctrl+Shift+7
      const parsed = parseHotkey("Control+/", "windows")
      const event = createKeyEvent({ key: "/", code: "Digit7", ctrlKey: true, shiftKey: true })
      expect(matchesHotkey(parsed, event)).toBe(true)
    })

    it("does NOT false-positive on - key from physical Slash position", () => {
      // German: the physical Slash key produces "-"
      // A "/" hotkey should NOT trigger when "-" is pressed
      const parsed = parseHotkey("/", "windows")
      const event = createKeyEvent({ key: "-", code: "Slash" })
      expect(matchesHotkey(parsed, event)).toBe(false)
    })

    it("matches - key correctly on German keyboard", () => {
      const parsed = parseHotkey("-", "windows")
      const event = createKeyEvent({ key: "-", code: "Slash" })
      expect(matchesHotkey(parsed, event)).toBe(true)
    })

    it("matches [ produced via AltGr+8", () => {
      // German: [ is AltGr+8 → reports ctrlKey=true, altKey=true, altGraph=true
      const parsed = parseHotkey("[", "windows")
      const event = createKeyEvent({
        key: "[",
        code: "Digit8",
        ctrlKey: true,
        altKey: true,
        altGraph: true,
      })
      expect(matchesHotkey(parsed, event)).toBe(true)
    })

    it("matches { produced via AltGr+7", () => {
      const parsed = parseHotkey("{", "windows")
      const event = createKeyEvent({
        key: "{",
        code: "Digit7",
        ctrlKey: true,
        altKey: true,
        altGraph: true,
      })
      expect(matchesHotkey(parsed, event)).toBe(true)
    })

    it("matches @ produced via AltGr+Q on German", () => {
      const parsed = parseHotkey("@", "windows")
      const event = createKeyEvent({
        key: "@",
        code: "KeyQ",
        ctrlKey: true,
        altKey: true,
        altGraph: true,
      })
      expect(matchesHotkey(parsed, event)).toBe(true)
    })
  })

  // ---------------------------------------------------------------------------
  // French AZERTY layout
  // ---------------------------------------------------------------------------
  describe("French AZERTY layout", () => {
    it("matches / on French keyboard (Shift+:)", () => {
      // French AZERTY: / is at Shift+: (physical Period key)
      const parsed = parseHotkey("/", "windows")
      const event = createKeyEvent({ key: "/", code: "Period", shiftKey: true })
      expect(matchesHotkey(parsed, event)).toBe(true)
    })

    it("matches ; produced via different physical key", () => {
      const parsed = parseHotkey(";", "windows")
      const event = createKeyEvent({ key: ";", code: "Comma", shiftKey: true })
      expect(matchesHotkey(parsed, event)).toBe(true)
    })
  })

  // ---------------------------------------------------------------------------
  // AltGr (AltGraph) handling
  // ---------------------------------------------------------------------------
  describe("AltGr handling", () => {
    it("does NOT false-trigger Ctrl+[ when AltGr+8 produces [", () => {
      // AltGr sets ctrlKey+altKey, but Ctrl+[ should NOT match AltGr+8
      const parsed = parseHotkey("Control+[", "windows")
      const event = createKeyEvent({
        key: "[",
        code: "Digit8",
        ctrlKey: true,
        altKey: true,
        altGraph: true,
      })
      // AltGr neutralizes Ctrl, so this is not a real Ctrl press
      expect(matchesHotkey(parsed, event)).toBe(false)
    })

    it("matches real Ctrl+[ (no AltGr)", () => {
      const parsed = parseHotkey("Control+[", "windows")
      const event = createKeyEvent({ key: "[", code: "BracketLeft", ctrlKey: true })
      expect(matchesHotkey(parsed, event)).toBe(true)
    })

    it("does NOT false-trigger Ctrl+Alt+E when AltGr+E produces €", () => {
      const parsed = parseHotkey("Control+Alt+E", "windows")
      const event = createKeyEvent({
        key: "€",
        code: "KeyE",
        ctrlKey: true,
        altKey: true,
        altGraph: true,
      })
      // AltGr+E produces €, not Ctrl+Alt+E — different key, should not match
      expect(matchesHotkey(parsed, event)).toBe(false)
    })
  })

  // ---------------------------------------------------------------------------
  // Dead key handling
  // ---------------------------------------------------------------------------
  describe("dead keys", () => {
    it("isHotKey returns false for dead key events", () => {
      // Dead keys (accent/compose) produce key="Dead"
      const event = createKeyEvent({ key: "Dead", code: "BracketLeft" })
      expect(isHotKey("[", event)).toBe(false)
    })

    it("isHotKey returns false for dead key with modifiers", () => {
      const event = createKeyEvent({ key: "Dead", code: "Quote", shiftKey: true })
      expect(isHotKey("Shift+'", event)).toBe(false)
    })
  })

  // ---------------------------------------------------------------------------
  // Turkish Q keyboard layout
  // ---------------------------------------------------------------------------
  describe("Turkish Q layout", () => {
    it("matches / when produced via Shift+7 (Turkish Q)", () => {
      // Turkish Q: / is at Shift+7, same as German
      const parsed = parseHotkey("/", "windows")
      const event = createKeyEvent({ key: "/", code: "Digit7", shiftKey: true })
      expect(matchesHotkey(parsed, event)).toBe(true)
    })

    it("matches Ctrl+/ on Turkish Q (Ctrl+Shift+7)", () => {
      const parsed = parseHotkey("Control+/", "windows")
      const event = createKeyEvent({ key: "/", code: "Digit7", ctrlKey: true, shiftKey: true })
      expect(matchesHotkey(parsed, event)).toBe(true)
    })

    it("matches ; produced via Shift+, on Turkish Q", () => {
      // Turkish Q: ; is at Shift+Comma
      const parsed = parseHotkey(";", "windows")
      const event = createKeyEvent({ key: ";", code: "Comma", shiftKey: true })
      expect(matchesHotkey(parsed, event)).toBe(true)
    })

    it("matches @ produced via AltGr+Q on Turkish Q", () => {
      // Turkish Q: @ requires AltGr+Q
      const parsed = parseHotkey("@", "windows")
      const event = createKeyEvent({
        key: "@",
        code: "KeyQ",
        ctrlKey: true,
        altKey: true,
        altGraph: true,
      })
      expect(matchesHotkey(parsed, event)).toBe(true)
    })

    it("matches € produced via AltGr+E on Turkish Q", () => {
      const parsed = parseHotkey("€", "windows")
      const event = createKeyEvent({
        key: "€",
        code: "KeyE",
        ctrlKey: true,
        altKey: true,
        altGraph: true,
      })
      expect(matchesHotkey(parsed, event)).toBe(true)
    })

    it("does NOT false-positive Ctrl+I when AltGr+I produces İ", () => {
      // Turkish: AltGr+I produces İ (capital I with dot)
      const parsed = parseHotkey("Control+I", "windows")
      const event = createKeyEvent({
        key: "İ",
        code: "KeyI",
        ctrlKey: true,
        altKey: true,
        altGraph: true,
      })
      // AltGr active → hotkey with Ctrl should not match
      expect(matchesHotkey(parsed, event)).toBe(false)
    })

    it("matches Turkish-specific ğ character via its physical key", () => {
      // Turkish Q: ğ is at the physical BracketLeft key (no modifier needed)
      const parsed = parseHotkey("ğ", "windows")
      const event = createKeyEvent({ key: "ğ", code: "BracketLeft" })
      // ğ is a Unicode letter → non-symbol path (logical key or strict layout behavior)
      expect(matchesHotkey(parsed, event)).toBe(true)
    })

    it("Turkish İ/I dotless handling: letters on different physical keys", () => {
      // On Turkish Q, pressing the physical KeyI produces ı (dotless i)
      // Code matching for "I" should still work via physical KeyI
      const parsed = parseHotkey("I", "windows")
      // If user presses physical KeyI which produces ı on Turkish
      const event = createKeyEvent({ key: "ı", code: "KeyI" })
      // Code match: parsed has code "KeyI", event has code "KeyI" → matches
      expect(matchesHotkey(parsed, event)).toBe(true)
    })
  })

  // ---------------------------------------------------------------------------
  // Nordic layout (Swedish/Norwegian/Danish)
  // ---------------------------------------------------------------------------
  describe("Nordic layout", () => {
    it("matches / when produced via Shift+7 on Swedish layout", () => {
      const parsed = parseHotkey("/", "windows")
      const event = createKeyEvent({ key: "/", code: "Digit7", shiftKey: true })
      expect(matchesHotkey(parsed, event)).toBe(true)
    })

    it("matches @ produced via AltGr+2 on Swedish layout", () => {
      const parsed = parseHotkey("@", "windows")
      const event = createKeyEvent({
        key: "@",
        code: "Digit2",
        ctrlKey: true,
        altKey: true,
        altGraph: true,
      })
      expect(matchesHotkey(parsed, event)).toBe(true)
    })

    it("matches \\ produced via AltGr++ on Nordic layout", () => {
      const parsed = parseHotkey("\\", "windows")
      const event = createKeyEvent({
        key: "\\",
        code: "Minus",
        ctrlKey: true,
        altKey: true,
        altGraph: true,
      })
      expect(matchesHotkey(parsed, event)).toBe(true)
    })
  })

  // ---------------------------------------------------------------------------
  // Non-symbol keys remain strict
  // ---------------------------------------------------------------------------
  describe("non-symbol keys (strict matching)", () => {
    it("letter keys require exact modifier match", () => {
      const parsed = parseHotkey("A", "windows")
      const event = createKeyEvent({ key: "a", code: "KeyA", shiftKey: true })
      // Extra shift should NOT match a bare "A" hotkey
      expect(matchesHotkey(parsed, event)).toBe(false)
    })

    it("letter key matches via physical code on different layout", () => {
      // On AZERTY, physical KeyQ produces "a", but code is still "KeyQ"
      // If hotkey is "Q" (physical Q), code matching should work
      const parsed = parseHotkey("Q", "windows")
      const event = createKeyEvent({ key: "a", code: "KeyQ" })
      expect(matchesHotkey(parsed, event)).toBe(true)
    })

    it("Enter matches regardless of layout", () => {
      const parsed = parseHotkey("Enter", "windows")
      const event = createKeyEvent({ key: "Enter", code: "Enter" })
      expect(matchesHotkey(parsed, event)).toBe(true)
    })

    it("digit keys match strictly", () => {
      const parsed = parseHotkey("1", "windows")
      const event = createKeyEvent({ key: "1", code: "Digit1" })
      expect(matchesHotkey(parsed, event)).toBe(true)
    })

    it("digit key does not match when shift is extra", () => {
      const parsed = parseHotkey("1", "windows")
      const event = createKeyEvent({ key: "!", code: "Digit1", shiftKey: true })
      expect(matchesHotkey(parsed, event)).toBe(false)
    })
  })

  // ---------------------------------------------------------------------------
  // Symbol keys with explicit modifiers
  // ---------------------------------------------------------------------------
  describe("symbol keys with explicit modifiers", () => {
    it("Ctrl+/ requires Ctrl to be pressed", () => {
      const parsed = parseHotkey("Control+/", "windows")
      const event = createKeyEvent({ key: "/", code: "Slash" })
      expect(matchesHotkey(parsed, event)).toBe(false)
    })

    it("Meta+/ requires Meta to be pressed", () => {
      const parsed = parseHotkey("mod+/", "mac")
      const event = createKeyEvent({ key: "/", code: "Slash" })
      expect(matchesHotkey(parsed, event)).toBe(false)
    })

    it("Alt+/ requires Alt to be pressed", () => {
      const parsed = parseHotkey("Alt+/", "windows")
      const event = createKeyEvent({ key: "/", code: "Slash" })
      expect(matchesHotkey(parsed, event)).toBe(false)
    })

    it("Alt+/ does not match when Alt is not pressed", () => {
      const parsed = parseHotkey("Alt+/", "windows")
      const event = createKeyEvent({ key: "/", code: "Slash", altKey: false })
      expect(matchesHotkey(parsed, event)).toBe(false)
    })
  })

  // ---------------------------------------------------------------------------
  // Various symbol keys
  // ---------------------------------------------------------------------------
  describe("various symbol keys across layouts", () => {
    const symbols = [
      { hotkey: ".", key: ".", code: "Period" },
      { hotkey: ",", key: ",", code: "Comma" },
      { hotkey: ";", key: ";", code: "Semicolon" },
      { hotkey: "'", key: "'", code: "Quote" },
      { hotkey: "=", key: "=", code: "Equal" },
      { hotkey: "\\", key: "\\", code: "Backslash" },
    ]

    for (const { hotkey, key, code } of symbols) {
      it(`matches "${hotkey}" on US layout`, () => {
        const parsed = parseHotkey(hotkey, "windows")
        const event = createKeyEvent({ key, code })
        expect(matchesHotkey(parsed, event)).toBe(true)
      })

      it(`matches "${hotkey}" when produced with Shift on international layout`, () => {
        const parsed = parseHotkey(hotkey, "windows")
        const event = createKeyEvent({ key, code: "SomeOtherKey", shiftKey: true })
        expect(matchesHotkey(parsed, event)).toBe(true)
      })
    }
  })

  // ---------------------------------------------------------------------------
  // macOS Option key for international characters
  // ---------------------------------------------------------------------------
  describe("macOS Option key (no AltGraph)", () => {
    it("matches | produced via Option+1 on macOS Spanish layout", () => {
      // macOS: Option does NOT set AltGraph, only altKey
      const parsed = parseHotkey("|", "mac")
      const event = createKeyEvent({ key: "|", code: "Digit1", altKey: true })
      expect(matchesHotkey(parsed, event)).toBe(true)
    })

    it("matches ~ produced via Option+N on macOS", () => {
      const parsed = parseHotkey("~", "mac")
      const event = createKeyEvent({ key: "~", code: "KeyN", altKey: true })
      expect(matchesHotkey(parsed, event)).toBe(true)
    })

    it("Alt+/ explicitly defined still requires Alt", () => {
      const parsed = parseHotkey("Alt+/", "mac")
      const event = createKeyEvent({ key: "/", code: "Slash" })
      // Alt not pressed → should not match
      expect(matchesHotkey(parsed, event)).toBe(false)
    })
  })

  // ---------------------------------------------------------------------------
  // Space key (symbol but layout-independent)
  // ---------------------------------------------------------------------------
  describe("space key", () => {
    it("matches space on any layout", () => {
      const parsed = parseHotkey("space", "windows")
      const event = createKeyEvent({ key: " ", code: "Space" })
      expect(matchesHotkey(parsed, event)).toBe(true)
    })
  })
})

describe("symbol classification", () => {
  it("treats ASCII letters and digits as non-symbols", () => {
    expect(isSymbolKey("a")).toBe(false)
    expect(isSymbolKey("Z")).toBe(false)
    expect(isSymbolKey("7")).toBe(false)
  })

  it("treats Unicode letters and numbers as non-symbols", () => {
    expect(isSymbolKey("ğ")).toBe(false)
    expect(isSymbolKey("İ")).toBe(false)
    expect(isSymbolKey("ы")).toBe(false)
    expect(isSymbolKey("日")).toBe(false)
    expect(isSymbolKey("٣")).toBe(false)
  })

  it("treats single punctuation / symbols as symbols", () => {
    expect(isSymbolKey("/")).toBe(true)
    expect(isSymbolKey("@")).toBe(true)
    expect(isSymbolKey(" ")).toBe(true)
    expect(isSymbolKey("€")).toBe(true)
  })

  it("treats named keys (length !== 1) as non-symbols", () => {
    expect(isSymbolKey("Enter")).toBe(false)
    expect(isSymbolKey("F1")).toBe(false)
    expect(isSymbolKey("ArrowUp")).toBe(false)
  })
})
