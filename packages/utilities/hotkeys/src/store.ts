import { isModKey } from "./modifier"
import { normalizeKey } from "./normalize"
import { getHotkeyPriority, matchesHotkey, matchesHotkeyStep, parseHotkey, shouldTrigger } from "./parser"
import type {
  CommandDefinition,
  ConflictBehavior,
  HotkeyCommand,
  HotkeyOptions,
  HotkeyStoreOptions,
  HotkeyStoreState,
  ParsedHotkey,
  Platform,
  HotkeyTarget,
} from "./types"
import { getPlatform, getWin, isSymbolKey, MODIFIER_SEPARATOR, toArray } from "./utils"

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

const DEFAULT_SCOPES: string[] = ["*"]

// Check if a parsed hotkey has any non-shift modifiers (Ctrl, Meta, Alt)
function hasNonShiftModifier(parsed: ParsedHotkey): boolean {
  return !!(parsed.ctrl || parsed.meta || parsed.alt)
}

export class HotkeyStore {
  private state: HotkeyStoreState
  private target?: HotkeyTarget | undefined
  private defaultCommandOptions: HotkeyOptions = { ...defaultOptions }
  private commandOptionOverrides = new Map<string, Partial<HotkeyOptions> | undefined>()
  private sequenceTimeoutMs = 1000
  private conflictBehavior: ConflictBehavior = "warn"
  private sequenceStates = new Map<string, SequenceState>()
  private registrationOrder = 0
  private platform: Platform = "mac"
  private listeners: { capture?: ListenerRecord; bubble?: ListenerRecord } = {}
  private firedCommands = new Set<string>()
  private hasKeyupCommands = false

  private subscribers = new Set<{
    selector: (state: HotkeyStoreState) => any
    callback: (value: any) => void
    lastValue: any
  }>()

  constructor(options?: HotkeyStoreOptions) {
    const defaultScopes = options?.activeScopes ? toArray(options.activeScopes) : DEFAULT_SCOPES

    this.state = {
      pressedKeys: new Set<string>(),
      pressedCodes: new Set<string>(),
      commands: new Map(),
      listening: false,
      activeScopes: new Set(defaultScopes),
    }

    if (options?.sequenceTimeoutMs !== undefined) {
      this.sequenceTimeoutMs = options.sequenceTimeoutMs
    }

    if (options?.conflictBehavior !== undefined) {
      this.conflictBehavior = options.conflictBehavior
    }

    this.applyDefaultOptions(options?.defaultOptions)
  }

  // Lifecycle methods
  init(options: HotkeyStoreOptions): this {
    if (!options.target) {
      throw new Error("target is required for initialization")
    }

    this.applyDefaultOptions(options.defaultOptions)
    this.target = options.target

    // Update platform based on actual environment
    this.platform = getPlatform()

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
    this.firedCommands.clear()
    this.target = undefined
    this.registrationOrder = 0
  }

  // Scope management
  setScope(scope: string | string[]): this {
    const scopes = toArray(scope)
    this.state.activeScopes = new Set(scopes)
    this.clearAllSequences()
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

  getState(): Readonly<HotkeyStoreState> {
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
  subscribe<T>(selector: (state: HotkeyStoreState) => T, callback: (value: T) => void): () => void {
    const subscriber = {
      selector,
      callback,
      lastValue: selector(this.state),
    }

    this.subscribers.add(subscriber)

    return () => {
      this.subscribers.delete(subscriber)
    }
  }

  // Command registration
  register(commands: CommandDefinition | CommandDefinition[]): this {
    const commandArray = toArray(commands)

    for (const command of commandArray) {
      const scopes = command.scopes ? toArray(command.scopes) : DEFAULT_SCOPES

      // Parse and cache hotkey
      const parsed = parseHotkey(command.hotkey, this.platform)
      const priority = getHotkeyPriority(parsed)

      // Smart input defaults: if hotkey has a modifier (Ctrl/Cmd/Alt),
      // auto-enable on form tags unless explicitly configured
      const resolvedOptions = { ...this.defaultCommandOptions, ...command.options }
      if (command.options?.enableOnFormTags === undefined && hasNonShiftModifier(parsed)) {
        resolvedOptions.enableOnFormTags = true
      }

      // Conflict detection
      this.detectConflicts(command.id, command.hotkey)

      this.state.commands.set(command.id, {
        id: command.id,
        hotkey: command.hotkey,
        action: command.action,
        options: resolvedOptions,
        enabled: command.enabled ?? true,
        scopes,
        keywords: command.keywords ?? [],
        _parsed: parsed,
        _priority: priority,
        _registrationOrder: this.registrationOrder++,
        ...(command.label !== undefined && { label: command.label }),
        ...(command.description !== undefined && { description: command.description }),
        ...(command.category !== undefined && { category: command.category }),
      })
      this.commandOptionOverrides.set(command.id, command.options)
    }

    this.refreshKeyupFlag()
    this.updateListeners()
    this.notifySubscribers()

    return this
  }

  // Command management
  unregister(id: string): this {
    const command = this.state.commands.get(id)
    if (command) {
      this.state.commands.delete(id)
      this.commandOptionOverrides.delete(id)
      this.firedCommands.delete(id)
      this.resetSequence(command.hotkey)
      this.refreshKeyupFlag()
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

  setEnabled(id: string, enabled: boolean | (() => boolean)): this {
    const command = this.state.commands.get(id)
    if (command) {
      command.enabled = enabled
      this.updateListeners()
      this.notifySubscribers()
    }
    return this
  }

  clear(): this {
    this.clearAllSequences()
    this.state.commands.clear()
    this.commandOptionOverrides.clear()
    this.state.pressedKeys.clear()
    this.state.pressedCodes.clear()
    this.firedCommands.clear()
    this.hasKeyupCommands = false
    this.updateListeners()
    this.notifySubscribers()
    return this
  }

  // State queries
  isPressed(hotkey: string): boolean {
    const parsed = parseHotkey(hotkey, this.platform)

    // Sequences are progressive; "all keys held at once" does not apply.
    if (parsed.isSequence) return false

    const logicalKeysMatch = parsed.keys.every((k) => this.state.pressedKeys.has(k))
    const codes = parsed.codes
    const codesAligned =
      codes &&
      codes.length > 0 &&
      codes.length === parsed.keys.length &&
      codes.every((c) => this.state.pressedCodes.has(c))
    const keysMatch = logicalKeysMatch || !!codesAligned

    return keysMatch && this.modifiersMatchPressed(parsed)
  }

  getCurrentlyPressed(): readonly string[] {
    return [...this.state.pressedKeys]
  }

  getPressedCodes(): readonly string[] {
    return [...this.state.pressedCodes]
  }

  private modifiersMatchPressed(parsed: ParsedHotkey): boolean {
    const pk = this.state.pressedKeys
    const has = (name: string) => pk.has(name)
    const anySymbol = parsed.keys.some(isSymbolKey)

    if (anySymbol) {
      if (parsed.ctrl !== has("Control")) return false
      if (parsed.meta !== has("Meta")) return false
      if (parsed.shift && !has("Shift")) return false
      if (parsed.alt && !has("Alt")) return false
      return true
    }

    if (parsed.alt !== has("Alt")) return false
    if (parsed.ctrl !== has("Control")) return false
    if (parsed.meta !== has("Meta")) return false
    if (parsed.shift !== has("Shift")) return false
    return true
  }

  private applyDefaultOptions(options?: Partial<HotkeyOptions>): void {
    if (!options) return

    this.defaultCommandOptions = {
      ...defaultOptions,
      ...options,
    }

    for (const [id, command] of this.state.commands) {
      command.options = {
        ...this.defaultCommandOptions,
        ...this.commandOptionOverrides.get(id),
      }
    }
  }

  private updateParsedHotkeys(): void {
    for (const command of this.state.commands.values()) {
      const hasModKeyInHotkey = command.hotkey.split(MODIFIER_SEPARATOR).some((part) => isModKey(part.trim()))
      if (hasModKeyInHotkey) {
        command._parsed = parseHotkey(command.hotkey, this.platform)
        command._priority = getHotkeyPriority(command._parsed)
      }
    }
  }

  private refreshKeyupFlag(): void {
    this.hasKeyupCommands = false
    for (const command of this.state.commands.values()) {
      if (command.options.eventType === "keyup") {
        this.hasKeyupCommands = true
        break
      }
    }
  }

  // Conflict detection
  private detectConflicts(newId: string, newHotkey: string): void {
    if (this.conflictBehavior === "allow") return

    const toDelete: string[] = []

    for (const [existingId, existing] of this.state.commands) {
      if (existingId === newId) continue
      if (existing.hotkey !== newHotkey) continue

      const message =
        `[hotkeys] Conflict: "${newHotkey}" is already registered by command "${existingId}". ` +
        `Command "${newId}" will also respond to this hotkey.`

      switch (this.conflictBehavior) {
        case "error":
          throw new Error(message)
        case "replace":
          toDelete.push(existingId)
          break
        case "warn":
        default:
          console.warn(message)
          break
      }
    }

    // Delete after iteration to avoid mutating during loop
    for (const id of toDelete) {
      this.state.commands.delete(id)
      this.commandOptionOverrides.delete(id)
    }
  }

  // Event handling
  private updateListeners(): void {
    if (!this.target) return

    if (this.state.commands.size > 0) {
      this.startListening()
    } else {
      this.stopListening()
    }
  }

  private startListening(): void {
    if (!this.target || this.state.listening) return

    const win = getWin(this.target)
    const phases = this.getListenerPhases()

    if (phases.capture) {
      const record: ListenerRecord = {
        keyDown: ((e: Event) => this.executeMatchingCommands(e as KeyboardEvent, true, "keydown")) as EventListener,
        keyUp: ((e: Event) => this.handleKeyUp(e as KeyboardEvent, true)) as EventListener,
        blur: (() => this.handleBlur()) as EventListener,
      }
      this.target.addEventListener("keydown", record.keyDown!, true)
      this.target.addEventListener("keyup", record.keyUp!, true)
      win.addEventListener("blur", record.blur!)
      win.addEventListener("contextmenu", record.blur!)
      this.listeners.capture = record
    }

    if (phases.bubble) {
      const record: ListenerRecord = {
        keyDown: ((e: Event) => this.executeMatchingCommands(e as KeyboardEvent, false, "keydown")) as EventListener,
        keyUp: ((e: Event) => this.handleKeyUp(e as KeyboardEvent, false)) as EventListener,
        blur: (() => this.handleBlur()) as EventListener,
      }
      this.target.addEventListener("keydown", record.keyDown!, false)
      this.target.addEventListener("keyup", record.keyUp!, false)
      win.addEventListener("blur", record.blur!)
      win.addEventListener("contextmenu", record.blur!)
      this.listeners.bubble = record
    }

    this.state.listening = true
  }

  private stopListening(): void {
    if (!this.target || !this.state.listening) return

    const win = getWin(this.target)

    if (this.listeners.capture) {
      const r = this.listeners.capture
      if (r.keyDown) this.target.removeEventListener("keydown", r.keyDown, true)
      if (r.keyUp) this.target.removeEventListener("keyup", r.keyUp, true)
      if (r.blur) {
        win.removeEventListener("blur", r.blur)
        win.removeEventListener("contextmenu", r.blur)
      }
    }

    if (this.listeners.bubble) {
      const r = this.listeners.bubble
      if (r.keyDown) this.target.removeEventListener("keydown", r.keyDown, false)
      if (r.keyUp) this.target.removeEventListener("keyup", r.keyUp, false)
      if (r.blur) {
        win.removeEventListener("blur", r.blur)
        win.removeEventListener("contextmenu", r.blur)
      }
    }

    this.listeners = {}
    this.state.listening = false
  }

  private getListenerPhases(): { capture: boolean; bubble: boolean } {
    let capture = false
    let bubble = false

    for (const command of this.state.commands.values()) {
      const isEnabled = typeof command.enabled === "function" ? command.enabled() : command.enabled
      if (!isEnabled) continue

      if (command.options.capture !== false) {
        capture = true
      } else {
        bubble = true
      }

      if (capture && bubble) break
    }

    return { capture, bubble }
  }

  private handleKeyUp(event: KeyboardEvent, capture: boolean): void {
    // Execute keyup commands BEFORE removing the key from pressed state
    if (this.hasKeyupCommands) {
      this.executeMatchingCommands(event, capture, "keyup")
    }

    const eventKey = normalizeKey(event.key)
    this.state.pressedKeys.delete(eventKey)
    if (event.code) {
      this.state.pressedCodes.delete(event.code)
    }

    if (this.firedCommands.size > 0) {
      this.firedCommands.clear()
    }
    this.notifySubscribers()
  }

  private handleBlur(): void {
    this.state.pressedKeys.clear()
    this.state.pressedCodes.clear()
    this.firedCommands.clear()
    this.clearAllSequences()
    this.notifySubscribers()
  }

  private executeMatchingCommands(event: KeyboardEvent, capture: boolean, eventType: "keydown" | "keyup"): void {
    if (event.key === "Dead") return

    const eventKey = normalizeKey(event.key)

    if (eventType === "keydown") {
      this.state.pressedKeys.add(eventKey)
      if (event.code) {
        this.state.pressedCodes.add(event.code)
      }
      this.notifySubscribers()
    }

    const matches: Array<{ command: HotkeyCommand; priority: number }> = []

    for (const [_id, command] of this.state.commands) {
      const enabled = typeof command.enabled === "function" ? command.enabled() : command.enabled
      if (!enabled) continue

      const commandCapture = command.options.capture !== false
      if (commandCapture !== capture) continue

      const commandEventType = command.options.eventType ?? "keydown"
      if (commandEventType !== eventType) continue

      const hasValidScope = command.scopes.some((scope) => scope === "*" || this.state.activeScopes.has(scope))
      if (!hasValidScope) continue

      if (!shouldTrigger(event, command.options)) continue

      if (command.options.requireReset && this.firedCommands.has(command.id)) continue

      const matched = command._parsed.isSequence
        ? this.handleSequence(command.hotkey, command._parsed, eventKey, event)
        : matchesHotkey(command._parsed, event)

      if (matched) {
        matches.push({ command, priority: command._priority })
      }
    }

    if (matches.length === 0) return

    // Sort by priority (highest first), then registration order
    matches.sort((a, b) => {
      if (b.priority !== a.priority) return b.priority - a.priority
      return a.command._registrationOrder - b.command._registrationOrder
    })

    const highestPriority = matches[0].priority
    const toExecute = matches.filter((m) => m.priority === highestPriority)

    for (const { command } of toExecute) {
      if (command.options.preventDefault) event.preventDefault()
      if (command.options.stopPropagation) event.stopPropagation()

      if (command.options.requireReset) {
        this.firedCommands.add(command.id)
      }

      try {
        command.action(event)
      } catch (error) {
        console.error(`Error executing hotkey command "${command.id}":`, error)
      }
    }
  }

  private handleSequence(hotkeyString: string, parsed: ParsedHotkey, eventKey: string, event: KeyboardEvent): boolean {
    if (!this.target) {
      console.warn("Cannot handle sequence: target is not initialized")
      return false
    }

    const win = getWin(this.target)

    let state = this.sequenceStates.get(hotkeyString)
    if (!state) {
      state = { recordedKeys: [] }
      this.sequenceStates.set(hotkeyString, state)
    }

    if (state.timeoutId) {
      clearTimeout(state.timeoutId)
    }

    const currentStepIndex = state.recordedKeys.length
    const expectedStep = parsed.sequenceSteps?.[currentStepIndex]

    if (expectedStep) {
      const matched = matchesHotkeyStep(
        {
          key: expectedStep.key,
          code: parsed.codes?.[currentStepIndex],
          alt: expectedStep.alt,
          ctrl: expectedStep.ctrl,
          meta: expectedStep.meta,
          shift: expectedStep.shift,
        },
        event,
      )

      if (matched) {
        state.recordedKeys.push(eventKey)

        if (state.recordedKeys.length === parsed.sequenceSteps!.length) {
          this.resetSequence(hotkeyString)
          return true
        }

        state.timeoutId = win.setTimeout(() => {
          this.resetSequence(hotkeyString)
        }, this.sequenceTimeoutMs)
      } else {
        this.resetSequence(hotkeyString)
      }
    } else {
      this.resetSequence(hotkeyString)
    }

    return false
  }

  private clearAllSequences(): void {
    for (const state of this.sequenceStates.values()) {
      if (typeof state.timeoutId === "number") {
        clearTimeout(state.timeoutId)
      }
    }
    this.sequenceStates.clear()
  }

  private resetSequence(hotkey: string): void {
    const state = this.sequenceStates.get(hotkey)
    if (state && typeof state.timeoutId === "number") {
      clearTimeout(state.timeoutId)
    }
    this.sequenceStates.delete(hotkey)
  }

  private notifySubscribers(): void {
    for (const subscriber of this.subscribers) {
      try {
        const newValue = subscriber.selector(this.state)
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

export function createHotkeyStore(options?: HotkeyStoreOptions): HotkeyStore {
  const store = new HotkeyStore(options)
  if (options?.target) {
    store.init(options)
  }
  return store
}
