import { getHotkeyPriority, matchesHotkey, parseHotkey, shouldTrigger } from "./parser"
import type {
  CommandDefinition,
  HotkeyCommand,
  HotkeyOptions,
  HotkeyStoreInit,
  HotkeyStoreOptions,
  HotkeyStoreState,
  ParsedHotkey,
  Platform,
  RootNode,
} from "./types"
import { getWin, isMac, isModKey, normalizeKey, toArray } from "./utils"

const defaultOptions: HotkeyOptions = {
  preventDefault: true,
  stopPropagation: false,
  enableOnFormTags: false,
  enableOnContentEditable: false,
  capture: true,
}

interface ListenerRecord {
  keyDown?: EventListener
  keyUp?: EventListener
  blur?: EventListener
}

interface SequenceState {
  recordedKeys: string[]
  timeoutId?: number
}

export class HotkeyStore<TContext = any> {
  private state: HotkeyStoreState<TContext>
  private context = {} as TContext
  private rootNode?: RootNode | undefined
  private sequenceTimeoutMs = 1000
  private sequenceStates = new Map<string, SequenceState>()
  private registrationOrder = 0 // For deterministic execution order
  private platform: Platform = "mac"
  private listeners: {
    capture: ListenerRecord
    bubble: ListenerRecord
  } = { capture: {}, bubble: {} }

  private subscribers = new Set<{
    selector: (state: HotkeyStoreState<TContext>, context: TContext) => any
    callback: (value: any) => void
    lastValue: any
  }>()

  constructor(options?: HotkeyStoreOptions<TContext>) {
    const defaultScopes = options?.defaultActiveScopes ? toArray(options.defaultActiveScopes) : ["*"]

    this.state = {
      pressedKeys: new Set<string>(),
      commands: new Map(),
      listening: false,
      activeScopes: new Set(defaultScopes),
    }

    if (options?.sequenceTimeoutMs !== undefined) {
      this.sequenceTimeoutMs = options.sequenceTimeoutMs
    }
  }

  // Lifecycle methods
  init(options: HotkeyStoreInit<TContext>): this {
    this.rootNode = options.rootNode
    this.context = options.defaultContext ?? ({} as TContext)

    // Update platform based on actual environment
    this.platform = isMac() ? "mac" : "windows"

    // Update parsed hotkeys with mod-like keys with correct platform after DOM is available
    this.updateParsedHotkeys()

    // Setup listeners for any commands registered before initialization
    this.updateListeners()
    return this
  }

  destroy(): void {
    this.stopListening()
    this.clear()
    this.subscribers.clear()
    this.sequenceStates.clear()
    this.rootNode = undefined
    this.registrationOrder = 0 // Reset for potential reuse
    // Don't reset context to avoid type issues - let it be garbage collected
  }

  // Context management
  setContext(context: TContext): this {
    this.context = context
    this.notifySubscribers()
    return this
  }

  getContext(): TContext {
    return this.context
  }

  // Scope management
  setScope(scope: string | string[]): this {
    const scopes = toArray(scope)
    this.state.activeScopes = new Set(scopes)
    // Reset all sequences when scope changes as they might no longer be valid
    this.sequenceStates.clear()
    this.notifySubscribers()
    return this
  }

  addScope(scope: string): this {
    this.state.activeScopes.add(scope)
    this.notifySubscribers()
    return this
  }

  removeScope(scope: string): this {
    this.state.activeScopes.delete(scope)
    this.notifySubscribers()
    return this
  }

  getActiveScopes(): readonly string[] {
    return [...this.state.activeScopes]
  }

  getState(): Readonly<HotkeyStoreState<TContext>> {
    return this.state
  }

  toggleScope(scope: string): this {
    if (this.state.activeScopes.has(scope)) {
      this.state.activeScopes.delete(scope)
    } else {
      this.state.activeScopes.add(scope)
    }
    this.notifySubscribers()
    return this
  }

  // Subscription management
  subscribe<T>(
    selector: (state: HotkeyStoreState<TContext>, context: TContext) => T,
    callback: (value: T) => void,
  ): () => void {
    const subscriber = {
      selector,
      callback,
      lastValue: selector(this.state, this.context),
    }

    this.subscribers.add(subscriber)

    // Return unsubscribe function
    return () => {
      this.subscribers.delete(subscriber)
    }
  }

  // Command registration
  register(commands: CommandDefinition<TContext> | CommandDefinition<TContext>[]): this {
    const commandArray = toArray(commands)

    for (const command of commandArray) {
      const scopes = command.scopes ? toArray(command.scopes) : ["*"]

      // Parse and cache hotkey for performance
      const parsed = parseHotkey(command.hotkey, this.platform)
      const priority = getHotkeyPriority(parsed)

      this.state.commands.set(command.id, {
        id: command.id,
        hotkey: command.hotkey,
        action: command.action,
        options: { ...defaultOptions, ...command.options },
        enabled: command.enabled ?? true, // default to true
        scopes,
        keywords: command.keywords ?? [],
        _parsed: parsed,
        _priority: priority,
        _registrationOrder: this.registrationOrder++,
        ...(command.label !== undefined && { label: command.label }),
        ...(command.description !== undefined && { description: command.description }),
        ...(command.category !== undefined && { category: command.category }),
      })
    }

    this.updateListeners()
    this.notifySubscribers()

    return this
  }

  // Command management
  unregister(id: string): this {
    const command = this.state.commands.get(id)
    if (command) {
      this.state.commands.delete(id)
      this.resetSequence(command.hotkey)
      this.updateListeners()
      this.notifySubscribers()
    }
    return this
  }

  enable(id: string): this {
    const command = this.state.commands.get(id)
    if (command) {
      command.enabled = true
      this.updateListeners()
      this.notifySubscribers()
    }
    return this
  }

  disable(id: string): this {
    const command = this.state.commands.get(id)
    if (command) {
      command.enabled = false
      this.updateListeners()
      this.notifySubscribers()
    }
    return this
  }

  setEnabled(id: string, enabled: boolean | ((context: TContext) => boolean)): this {
    const command = this.state.commands.get(id)
    if (command) {
      command.enabled = enabled
      this.updateListeners()
      this.notifySubscribers()
    }
    return this
  }

  clear(): this {
    // Clear all active sequences
    for (const hotkey of this.sequenceStates.keys()) {
      this.resetSequence(hotkey)
    }
    this.state.commands.clear()
    this.updateListeners()
    this.notifySubscribers()
    return this
  }

  // State queries
  isPressed(hotkey: string): boolean {
    // Check if we have a cached parsed version from any registered command
    let cachedCommand
    for (const cmd of this.state.commands.values()) {
      if (cmd.hotkey === hotkey) {
        cachedCommand = cmd
        break
      }
    }
    const parsed = cachedCommand?._parsed ?? parseHotkey(hotkey, this.platform)

    const keysMatch = parsed.keys.every((k) => this.state.pressedKeys.has(k))

    const modifiersMatch =
      (!parsed.alt || this.state.pressedKeys.has("Alt")) &&
      (!parsed.ctrl || this.state.pressedKeys.has("Control")) &&
      (!parsed.meta || this.state.pressedKeys.has("Meta")) &&
      (!parsed.shift || this.state.pressedKeys.has("Shift"))

    return keysMatch && modifiersMatch
  }

  getCurrentlyPressed(): readonly string[] {
    return [...this.state.pressedKeys]
  }

  // Update parsed hotkeys with mod-like keys with correct platform
  private updateParsedHotkeys(): void {
    for (const command of this.state.commands.values()) {
      // Check if hotkey contains mod-like keywords by splitting and checking each part
      const hasModKey = command.hotkey.split("+").some((part) => isModKey(part.trim()))
      if (hasModKey) {
        const parsed = parseHotkey(command.hotkey, this.platform)
        command._parsed = parsed
        command._priority = getHotkeyPriority(parsed)
      }
    }
  }

  // Private methods for event handling
  private updateListeners(): void {
    if (!this.rootNode) return

    if (this.state.commands.size > 0) {
      this.startListening()
    } else {
      this.stopListening()
    }
  }

  private startListening(): void {
    if (!this.rootNode || this.state.listening) return

    const win = getWin(this.rootNode)

    // Create handlers
    const captureKeyDownHandler = this.createKeyDownHandler(true)
    const captureKeyUpHandler = this.createKeyUpHandler()
    const captureBlurHandler = this.createBlurHandler()

    const bubbleKeyDownHandler = this.createKeyDownHandler(false)
    const bubbleKeyUpHandler = this.createKeyUpHandler()
    const bubbleBlurHandler = this.createBlurHandler()

    // Store handlers for cleanup
    this.listeners.capture.keyDown = captureKeyDownHandler
    this.listeners.capture.keyUp = captureKeyUpHandler
    this.listeners.capture.blur = captureBlurHandler

    this.listeners.bubble.keyDown = bubbleKeyDownHandler
    this.listeners.bubble.keyUp = bubbleKeyUpHandler
    this.listeners.bubble.blur = bubbleBlurHandler

    // Add listeners
    const phases = this.getListenerPhases()

    if (phases.capture) {
      this.rootNode.addEventListener("keydown", captureKeyDownHandler, true)
      this.rootNode.addEventListener("keyup", captureKeyUpHandler, true)
      win.addEventListener("blur", captureBlurHandler)
      win.addEventListener("contextmenu", captureBlurHandler)
    }

    if (phases.bubble) {
      this.rootNode.addEventListener("keydown", bubbleKeyDownHandler, false)
      this.rootNode.addEventListener("keyup", bubbleKeyUpHandler, false)
      win.addEventListener("blur", bubbleBlurHandler)
      win.addEventListener("contextmenu", bubbleBlurHandler)
    }

    this.state.listening = true
  }

  private stopListening(): void {
    if (!this.rootNode || !this.state.listening) return

    const win = getWin(this.rootNode)

    // Remove capture listeners
    if (this.listeners.capture.keyDown) {
      this.rootNode.removeEventListener("keydown", this.listeners.capture.keyDown, true)
    }
    if (this.listeners.capture.keyUp) {
      this.rootNode.removeEventListener("keyup", this.listeners.capture.keyUp, true)
    }
    if (this.listeners.capture.blur) {
      win.removeEventListener("blur", this.listeners.capture.blur)
      win.removeEventListener("contextmenu", this.listeners.capture.blur)
    }

    // Remove bubble listeners
    if (this.listeners.bubble.keyDown) {
      this.rootNode.removeEventListener("keydown", this.listeners.bubble.keyDown, false)
    }
    if (this.listeners.bubble.keyUp) {
      this.rootNode.removeEventListener("keyup", this.listeners.bubble.keyUp, false)
    }
    if (this.listeners.bubble.blur) {
      win.removeEventListener("blur", this.listeners.bubble.blur)
      win.removeEventListener("contextmenu", this.listeners.bubble.blur)
    }

    // Clear stored listeners
    this.listeners.capture = {}
    this.listeners.bubble = {}
    this.state.listening = false
  }

  private getListenerPhases(): { capture: boolean; bubble: boolean } {
    let capture = false
    let bubble = false

    for (const command of this.state.commands.values()) {
      const isEnabled = typeof command.enabled === "function" ? command.enabled(this.context) : command.enabled
      if (!isEnabled) continue

      if (command.options.capture !== false) {
        capture = true
      } else {
        bubble = true
      }

      // Early exit if both are found
      if (capture && bubble) break
    }

    return { capture, bubble }
  }

  private createKeyDownHandler(isCapture: boolean) {
    return ((event: Event) => {
      this.executeMatchingCommands(event as KeyboardEvent, isCapture)
    }) as EventListener
  }

  private createKeyUpHandler() {
    return ((event: Event) => {
      const keyEvent = event as KeyboardEvent
      const eventKey = normalizeKey(keyEvent.key, keyEvent.code)
      this.state.pressedKeys.delete(eventKey)
      this.notifySubscribers()
    }) as EventListener
  }

  private createBlurHandler() {
    return (() => {
      this.state.pressedKeys.clear()
      // Clear all active sequences on blur
      for (const hotkey of this.sequenceStates.keys()) {
        this.resetSequence(hotkey)
      }
      this.notifySubscribers()
    }) as EventListener
  }

  private async executeMatchingCommands(event: KeyboardEvent, capture: boolean): Promise<void> {
    const eventKey = normalizeKey(event.key, event.code)
    this.state.pressedKeys.add(eventKey)
    this.notifySubscribers()

    const matches: Array<{
      command: HotkeyCommand
      priority: number
    }> = []

    // Find all matching commands for this phase
    for (const [_id, command] of this.state.commands) {
      // Evaluate enabled state (can be boolean or function)
      const enabled = typeof command.enabled === "function" ? command.enabled(this.context) : command.enabled
      if (!enabled) continue

      // Skip if this command doesn't match the current phase
      const commandCapture = command.options.capture !== false
      if (commandCapture !== capture) continue

      // Check if command scopes intersect with active scopes
      const hasValidScope = command.scopes.some((scope) => scope === "*" || this.state.activeScopes.has(scope))
      if (!hasValidScope) continue

      if (!shouldTrigger(event, command.options)) continue

      // Use cached parsed hotkey for performance
      const matched = command._parsed.isSequence
        ? this.handleSequence(command.hotkey, command._parsed, eventKey, event)
        : matchesHotkey(command._parsed, event)

      if (matched) {
        matches.push({
          command,
          priority: command._priority,
        })
      }
    }

    if (matches.length === 0) return

    // Sort by priority (highest first), then by registration order for deterministic execution
    matches.sort((a, b) => {
      if (b.priority !== a.priority) {
        return b.priority - a.priority
      }
      // Same priority: use registration order (earlier registered = lower number = higher precedence)
      return a.command._registrationOrder - b.command._registrationOrder
    })
    const highestPriority = matches[0].priority
    const toExecute = matches.filter((m) => m.priority === highestPriority)

    // Execute callbacks with context first, then event
    for (const { command } of toExecute) {
      if (command.options.preventDefault) event.preventDefault()
      if (command.options.stopPropagation) event.stopPropagation()

      try {
        await command.action(this.context, event)
      } catch (error) {
        console.error(`Error executing hotkey command "${command.id}":`, error)
      }
    }
  }

  private handleSequence(hotkeyString: string, parsed: ParsedHotkey, eventKey: string, event: KeyboardEvent): boolean {
    if (!this.rootNode) {
      console.warn("Cannot handle sequence: rootNode is not initialized")
      return false
    }

    const win = getWin(this.rootNode)

    let state = this.sequenceStates.get(hotkeyString)
    if (!state) {
      state = { recordedKeys: [] }
      this.sequenceStates.set(hotkeyString, state)
    }

    // Clear existing timeout
    if (state.timeoutId) {
      clearTimeout(state.timeoutId)
    }

    // Check if this step matches the next expected step in sequence
    const currentStepIndex = state.recordedKeys.length
    const expectedStep = parsed.sequenceSteps?.[currentStepIndex]

    if (expectedStep) {
      // Check both logical key and physical code for layout independence
      const keyMatches = eventKey === expectedStep.key
      const codeMatches = parsed.codes && parsed.codes[currentStepIndex] === event.code
      const modifiersMatch =
        (expectedStep.alt || false) === event.altKey &&
        (expectedStep.ctrl || false) === event.ctrlKey &&
        (expectedStep.meta || false) === event.metaKey &&
        (expectedStep.shift || false) === event.shiftKey

      if ((keyMatches || codeMatches) && modifiersMatch) {
        state.recordedKeys.push(eventKey)

        // Check if sequence is complete
        if (state.recordedKeys.length === parsed.sequenceSteps!.length) {
          this.resetSequence(hotkeyString)
          return true
        }

        // Set timeout for sequence completion
        state.timeoutId = win.setTimeout(() => {
          this.resetSequence(hotkeyString)
        }, this.sequenceTimeoutMs)
      } else {
        // Wrong key or modifiers, reset sequence
        this.resetSequence(hotkeyString)
      }
    } else {
      // No more steps expected, reset sequence
      this.resetSequence(hotkeyString)
    }

    return false
  }

  private resetSequence(hotkey: string): void {
    const state = this.sequenceStates.get(hotkey)
    if (state && typeof state.timeoutId === "number") {
      clearTimeout(state.timeoutId)
    }
    this.sequenceStates.delete(hotkey)
  }

  // Notification system
  private notifySubscribers(): void {
    for (const subscriber of this.subscribers) {
      try {
        const newValue = subscriber.selector(this.state, this.context)
        if (newValue !== subscriber.lastValue) {
          subscriber.lastValue = newValue
          subscriber.callback(newValue)
        }
      } catch (error) {
        console.error("Error in hotkey store subscriber:", error)
      }
    }
  }
}

// Factory functions
export function createHotkeyStore<TContext = any>(options?: HotkeyStoreOptions<TContext>): HotkeyStore<TContext> {
  const store = new HotkeyStore<TContext>(options)

  // Auto-initialize if rootNode is provided, otherwise require manual initialization
  if (options?.rootNode) {
    const initOptions: HotkeyStoreInit<TContext> = {
      rootNode: options.rootNode,
    }
    if (options.context !== undefined) {
      initOptions.defaultContext = options.context
    }
    store.init(initOptions)
  }

  return store
}
