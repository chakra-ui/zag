import type { HotkeyState, RootNode } from "./types"

// Internal state per root node
const globalState = new Map<RootNode, HotkeyState>()

// Get or create state for a root node
export function getState(root: RootNode): HotkeyState {
  if (!globalState.has(root)) {
    globalState.set(root, {
      currentlyPressedKeys: new Set<string>(),
      registeredHotkeys: new Map(),
      sequenceStates: new Map(),
      isListening: false,
      activeScopes: new Set(["*"]), // Default scope
      listeners: {
        capture: {},
        bubble: {},
      },
    })
  }
  return globalState.get(root)!
}

// Reset sequence state
export function resetSequence(root: RootNode, hotKey: string): void {
  const { sequenceStates } = getState(root)
  const state = sequenceStates.get(hotKey)
  if (state?.timeoutId !== undefined) {
    clearTimeout(state.timeoutId)
  }
  sequenceStates.delete(hotKey)
}
