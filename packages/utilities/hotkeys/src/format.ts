import { getPlatform } from "./utils"
import { parseHotkey } from "./parser"
import type { Platform } from "./types"

export interface FormatHotkeyOptions {
  /** Platform-specific formatting ('auto' detects current platform) */
  platform?: Platform | "auto" | undefined
  /** Display style for keys */
  style?: "symbols" | "text" | "mixed" | undefined
  /** Separator between modifier and key */
  separator?: string | undefined
  /** Separator for key sequences */
  sequenceSeparator?: string | undefined
  /** Use abbreviated modifier nampes */
  useShortNames?: boolean | undefined
}

// Platform-specific modifier mappings
const PLATFORM_MODIFIERS = {
  mac: {
    Control: "⌃",
    Alt: "⌥",
    Shift: "⇧",
    Meta: "⌘",
  },
  windows: {
    Control: "Ctrl",
    Alt: "Alt",
    Shift: "Shift",
    Meta: "Win",
  },
  linux: {
    Control: "Ctrl",
    Alt: "Alt",
    Shift: "Shift",
    Meta: "Super",
  },
} as const

// Key symbol mappings
const KEY_SYMBOLS = new Map([
  ["ArrowUp", "↑"],
  ["ArrowDown", "↓"],
  ["ArrowLeft", "←"],
  ["ArrowRight", "→"],
  ["Backspace", "⌫"],
  ["Delete", "⌦"],
  ["Enter", "↵"],
  ["Tab", "⇥"],
  ["Escape", "Esc"],
  ["Space", "␣"],
  [" ", "␣"],
])

// Text-based key mappings
const KEY_NAMES = new Map([
  ["ArrowUp", "Up"],
  ["ArrowDown", "Down"],
  ["ArrowLeft", "Left"],
  ["ArrowRight", "Right"],
  ["Space", "Space"],
  [" ", "Space"],
])

/**
 * Format hotkey string for user-friendly display with platform-aware styling
 */
export function formatHotkey(hotkey: string, options: FormatHotkeyOptions = {}): string {
  const {
    platform = "auto",
    style = "mixed",
    separator = " ",
    sequenceSeparator = " then ",
    useShortNames = true,
  } = options

  // Detect platform if auto
  const targetPlatform = platform === "auto" ? getPlatform() : platform

  // Handle sequences
  if (hotkey.includes(" > ")) {
    return hotkey
      .split(" > ")
      .map((part) => formatSingleHotkey(part.trim(), targetPlatform, style, separator, useShortNames))
      .join(sequenceSeparator)
  }

  return formatSingleHotkey(hotkey, targetPlatform, style, separator, useShortNames)
}

/**
 * Format a single hotkey (not a sequence)
 */
function formatSingleHotkey(
  hotkey: string,
  platform: Platform,
  style: "symbols" | "text" | "mixed",
  separator: string,
  useShortNames: boolean,
): string {
  if (!hotkey.trim()) return ""

  // Use existing parser to handle edge cases like "Alt++" correctly
  const parsed = parseHotkey(hotkey, platform)

  // Extract modifiers from parsed result
  const modifiers: string[] = []
  if (parsed.ctrl) modifiers.push("Control")
  if (parsed.alt) modifiers.push("Alt")
  if (parsed.shift) modifiers.push("Shift")
  if (parsed.meta) modifiers.push("Meta")

  // Get the main keys
  const keys = parsed.keys

  // Format modifiers based on platform and style
  const platformModifiers = PLATFORM_MODIFIERS[platform]
  const formattedModifiers = modifiers.map((modifier) => {
    const mappedModifier = platformModifiers[modifier as keyof typeof platformModifiers]

    if (style === "symbols" && platform === "mac") {
      return mappedModifier || modifier
    }
    if (style === "text" || platform !== "mac") {
      const textModifier = mappedModifier || modifier
      return useShortNames && modifier === "Control" ? "Ctrl" : textModifier
    }
    // Mixed style - use symbols for Mac, text for others
    return mappedModifier || modifier
  })

  // Format keys based on style
  const formattedKeys = keys.map((key) => {
    if (style === "symbols") {
      return KEY_SYMBOLS.get(key) || key
    }
    if (style === "text") {
      return KEY_NAMES.get(key) || key
    }
    // Mixed style - use symbols for arrows/special keys, text for others
    return KEY_SYMBOLS.get(key) || KEY_NAMES.get(key) || key
  })

  // Combine modifiers and keys
  const allParts = [...formattedModifiers, ...formattedKeys]
  return allParts.join(separator)
}
