import type { ParsedHotkey, HotkeyOptions, RootNode } from "./types"
import { getWin, normalizeKey } from "./utils"
import { getState, resetSequence } from "./state"
import { parseHotkey, matchesHotkey, shouldTrigger } from "./parser"

// Handle sequence matching
function handleSequence(
  root: RootNode,
  hotkeyString: string,
  parsed: ParsedHotkey,
  eventKey: string,
  options: HotkeyOptions,
): boolean {
  const { sequenceStates } = getState(root)
  const win = getWin(root)

  let state = sequenceStates.get(hotkeyString)
  if (!state) {
    state = { recordedKeys: [] }
    sequenceStates.set(hotkeyString, state)
  }

  // Clear existing timeout
  if (state.timeoutId) {
    clearTimeout(state.timeoutId)
  }

  // Check if this key matches the next expected key in sequence
  const expectedKey = parsed.keys[state.recordedKeys.length]
  if (eventKey === expectedKey) {
    state.recordedKeys.push(eventKey)

    // Check if sequence is complete
    if (state.recordedKeys.length === parsed.keys.length) {
      resetSequence(root, hotkeyString)
      return true
    }

    // Set timeout for sequence completion
    const timeoutMs = options.sequenceTimeoutMs || 1000
    state.timeoutId = win.setTimeout(() => {
      resetSequence(root, hotkeyString)
    }, timeoutMs)
  } else {
    // Wrong key, reset sequence
    resetSequence(root, hotkeyString)
  }

  return false
}

// Simple priority scoring (higher = more specific)
function getHotkeyPriority(parsed: ParsedHotkey): number {
  let priority = 0

  // Sequences get highest priority
  if (parsed.isSequence) priority += 1000

  // Each modifier adds to priority
  if (parsed.alt) priority += 100
  if (parsed.ctrl) priority += 100
  if (parsed.meta) priority += 100
  if (parsed.shift) priority += 100

  // Multiple keys add to priority
  priority += parsed.keys.length * 10

  return priority
}

// Find and execute matching hotkeys for a specific phase
function executeMatchingHotkeys(root: RootNode, event: KeyboardEvent, capture: boolean): void {
  const { currentlyPressedKeys, registeredHotkeys, activeScopes } = getState(root)
  const eventKey = normalizeKey(event.key, event.code)
  currentlyPressedKeys.add(eventKey)

  const matches: Array<{
    callback: any
    options: any
    priority: number
  }> = []

  // Find all matching hotkeys for this phase
  for (const [hotkeyString, { callback, options }] of registeredHotkeys) {
    // Skip if this hotkey doesn't match the current phase
    const hotkeyCapture = options.capture !== false
    if (hotkeyCapture !== capture) continue

    if (!shouldTrigger(event, options, activeScopes)) continue

    const parsed = parseHotkey(hotkeyString)

    const matched = parsed.isSequence
      ? handleSequence(root, hotkeyString, parsed, eventKey, options)
      : matchesHotkey(parsed, event)

    if (matched) {
      matches.push({
        callback,
        options,
        priority: getHotkeyPriority(parsed),
      })
    }
  }

  if (matches.length === 0) return

  // Sort by priority (highest first) and execute the highest priority matches
  matches.sort((a, b) => b.priority - a.priority)
  const highestPriority = matches[0].priority
  const toExecute = matches.filter((m) => m.priority === highestPriority)

  // Execute callbacks
  for (const { callback, options } of toExecute) {
    if (options.preventDefault) event.preventDefault()
    if (options.stopPropagation) event.stopPropagation()
    callback(event)
  }
}

// Create event handlers
function createKeyDownHandler(root: RootNode, isCapture: boolean) {
  const handler = (event: KeyboardEvent) => executeMatchingHotkeys(root, event, isCapture)
  return handler as EventListener
}

function createKeyUpHandler(root: RootNode) {
  const handler = (event: KeyboardEvent) => {
    const { currentlyPressedKeys } = getState(root)
    const eventKey = normalizeKey(event.key, event.code)
    currentlyPressedKeys.delete(eventKey)
  }
  return handler as EventListener
}

function createBlurHandler(root: RootNode) {
  return () => {
    const { currentlyPressedKeys, sequenceStates } = getState(root)
    currentlyPressedKeys.clear()

    // Clear all sequence states on blur
    for (const hotkeyString of sequenceStates.keys()) {
      resetSequence(root, hotkeyString)
    }
  }
}

// Check if we need capture or bubble listeners
function needsCapture(root: RootNode): boolean {
  const { registeredHotkeys } = getState(root)
  return Array.from(registeredHotkeys.values()).some(({ options }) => options.capture !== false)
}

function needsBubble(root: RootNode): boolean {
  const { registeredHotkeys } = getState(root)
  return Array.from(registeredHotkeys.values()).some(({ options }) => options.capture === false)
}

// Start listening for hotkeys
export function startListening(root: RootNode): void {
  const state = getState(root)
  if (state.isListening) return

  const win = getWin(root)

  // Create handlers for both phases
  const captureKeyDownHandler = createKeyDownHandler(root, true)
  const captureKeyUpHandler = createKeyUpHandler(root)
  const captureBlurHandler = createBlurHandler(root)

  const bubbleKeyDownHandler = createKeyDownHandler(root, false)
  const bubbleKeyUpHandler = createKeyUpHandler(root)
  const bubbleBlurHandler = createBlurHandler(root)

  // Store handlers for cleanup
  state.listeners.capture.keyDown = captureKeyDownHandler
  state.listeners.capture.keyUp = captureKeyUpHandler
  state.listeners.capture.blur = captureBlurHandler

  state.listeners.bubble.keyDown = bubbleKeyDownHandler
  state.listeners.bubble.keyUp = bubbleKeyUpHandler
  state.listeners.bubble.blur = bubbleBlurHandler

  // Add capture listeners if needed
  if (needsCapture(root)) {
    root.addEventListener("keydown", captureKeyDownHandler, true)
    root.addEventListener("keyup", captureKeyUpHandler, true)
    win.addEventListener("blur", captureBlurHandler)
    win.addEventListener("contextmenu", captureBlurHandler)
  }

  // Add bubble listeners if needed
  if (needsBubble(root)) {
    root.addEventListener("keydown", bubbleKeyDownHandler, false)
    root.addEventListener("keyup", bubbleKeyUpHandler, false)
    win.addEventListener("blur", bubbleBlurHandler)
    win.addEventListener("contextmenu", bubbleBlurHandler)
  }

  state.isListening = true
}

// Stop listening for hotkeys
export function stopListening(root: RootNode): void {
  const state = getState(root)
  if (!state.isListening) return

  const win = getWin(root)

  // Remove capture listeners
  if (state.listeners.capture.keyDown) {
    root.removeEventListener("keydown", state.listeners.capture.keyDown, true)
  }
  if (state.listeners.capture.keyUp) {
    root.removeEventListener("keyup", state.listeners.capture.keyUp, true)
  }
  if (state.listeners.capture.blur) {
    win.removeEventListener("blur", state.listeners.capture.blur)
    win.removeEventListener("contextmenu", state.listeners.capture.blur)
  }

  // Remove bubble listeners
  if (state.listeners.bubble.keyDown) {
    root.removeEventListener("keydown", state.listeners.bubble.keyDown, false)
  }
  if (state.listeners.bubble.keyUp) {
    root.removeEventListener("keyup", state.listeners.bubble.keyUp, false)
  }
  if (state.listeners.bubble.blur) {
    win.removeEventListener("blur", state.listeners.bubble.blur)
    win.removeEventListener("contextmenu", state.listeners.bubble.blur)
  }

  // Clear stored listeners
  state.listeners.capture = {}
  state.listeners.bubble = {}
  state.isListening = false
}

// Update listeners (simplified - just restart)
export function updateListeners(root: RootNode): void {
  if (getState(root).isListening) {
    stopListening(root)
    startListening(root)
  }
}
