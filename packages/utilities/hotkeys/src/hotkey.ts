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
    return parsed.keys.every((k) => currentlyPressedKeys.has(k))
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
