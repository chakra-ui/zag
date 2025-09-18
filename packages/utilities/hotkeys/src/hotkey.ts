import type { HotkeyCallback, HotkeyOptions, RootNode } from "./types"
import { getState, resetSequence } from "./state"
import { startListening, stopListening, updateListeners } from "./listeners"
import { parseHotkey } from "./parser"

const defaultOptions: HotkeyOptions = {
  enabled: true,
  preventDefault: true,
  stopPropagation: false,
  enableOnFormTags: false,
  enableOnContentEditable: false,
  sequenceTimeoutMs: 1000,
  getRootNode: () => document,
  exactMatch: false,
  capture: true,
}

export function registerHotkey(hotkey: string, callback: HotkeyCallback, userOptions: HotkeyOptions = {}): () => void {
  const options: HotkeyOptions = { ...defaultOptions, ...userOptions }

  const root = options.getRootNode!()
  const { registeredHotkeys } = getState(root)

  startListening(root)
  registeredHotkeys.set(hotkey, { callback, options })
  updateListeners(root)

  return () => {
    registeredHotkeys.delete(hotkey)
    resetSequence(root, hotkey)
    if (registeredHotkeys.size === 0) {
      stopListening(root)
    } else {
      updateListeners(root)
    }
  }
}

export function isHotkeyPressed(hotkey: string | string[], getRootNode?: () => RootNode): boolean {
  const root = getRootNode ? getRootNode() : document
  const { currentlyPressedKeys } = getState(root)
  const hotkeys = Array.isArray(hotkey) ? hotkey : [hotkey]

  return hotkeys.some((key) => {
    const parsed = parseHotkey(key)
    // Check if all keys in the combination are currently pressed
    const keysMatch = parsed.keys.every((k) => currentlyPressedKeys.has(k))

    // For combinations with modifiers, we need to check those too
    // The currentlyPressedKeys set contains normalized keys
    const modifiersMatch =
      (!parsed.alt || currentlyPressedKeys.has("Alt")) &&
      (!parsed.ctrl || currentlyPressedKeys.has("Control")) &&
      (!parsed.meta || currentlyPressedKeys.has("Meta")) &&
      (!parsed.shift || currentlyPressedKeys.has("Shift"))

    return keysMatch && modifiersMatch
  })
}

export function getCurrentlyPressedKeys(getRootNode?: () => RootNode): readonly string[] {
  const root = getRootNode ? getRootNode() : document
  const { currentlyPressedKeys } = getState(root)
  return Array.from(currentlyPressedKeys)
}

export function clearAllHotkeys(getRootNode?: () => RootNode): void {
  const root = getRootNode ? getRootNode() : document
  const { registeredHotkeys, sequenceStates } = getState(root)
  registeredHotkeys.clear()
  for (const hotkeyString of sequenceStates.keys()) {
    resetSequence(root, hotkeyString)
  }
  stopListening(root)
}
