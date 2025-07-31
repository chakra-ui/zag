import type { HotkeyCallback, HotkeyOptions, RootNode } from "./types"
import { registerHotkey } from "./hotkey"

// Hotkey manager class for more complex use cases
export class HotkeyManager {
  private hotkeys = new Map<string, () => void>()
  private getRootNode: () => RootNode

  constructor(getRootNode?: () => RootNode) {
    this.getRootNode = getRootNode || (() => document)
  }

  register(hotkey: string, callback: HotkeyCallback, options?: HotkeyOptions): this {
    const mergedOptions = { ...options, getRootNode: this.getRootNode }
    const cleanup = registerHotkey(hotkey, callback, mergedOptions)
    this.hotkeys.set(hotkey, cleanup)
    return this
  }

  unregister(hotkey: string): this {
    const cleanup = this.hotkeys.get(hotkey)
    if (cleanup) {
      cleanup()
      this.hotkeys.delete(hotkey)
    }
    return this
  }

  clear(): void {
    for (const cleanup of this.hotkeys.values()) {
      cleanup()
    }
    this.hotkeys.clear()
  }

  destroy(): void {
    this.clear()
  }
}

// Create a new hotkey manager instance
export function createHotkeyManager(getRootNode?: () => RootNode): HotkeyManager {
  return new HotkeyManager(getRootNode)
}
