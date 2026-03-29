export type HotkeyTarget = Document | ShadowRoot | Element

export type Platform = "mac" | "windows" | "linux"

export interface KeyboardModifiers {
  alt?: boolean | undefined
  ctrl?: boolean | undefined
  meta?: boolean | undefined
  shift?: boolean | undefined
}

export interface SequenceStep extends KeyboardModifiers {
  key: string
}

export interface ParsedHotkey extends KeyboardModifiers {
  keys: string[]
  codes?: string[] | undefined // Physical key codes for layout-independent matching
  isSequence?: boolean | undefined
  description?: string | undefined
  // For sequences: array of parsed steps, each with modifiers and key
  sequenceSteps?: SequenceStep[] | undefined
}

// Store-based hotkey system types
export type HotkeyAction = (event: KeyboardEvent) => void

export interface CommandDefinition {
  /**
   * The unique identifier for the command.
   */
  id: string
  /**
   * The hotkey to trigger the command.
   */
  hotkey: string
  /**
   * The action to perform when the hotkey is triggered.
   */
  action: HotkeyAction
  /**
   * Human-readable label for the command
   */
  label?: string | undefined
  /**
   * Description of what the command does
   */
  description?: string | undefined
  /**
   * Category for organizing commands
   */
  category?: string | undefined
  /**
   * Options for the hotkey command.
   */
  options?: HotkeyOptions | undefined
  /**
   * Whether the command is enabled.
   */
  enabled?: boolean | (() => boolean) | undefined
  /**
   * The scopes to use for the hotkey command.
   *
   * @default "*"
   */
  scopes?: string | string[] | undefined
  /**
   * Keywords for search/command palette integration.
   * Useful for alternative names or search terms for the command.
   */
  keywords?: string[] | undefined
}

export interface HotkeyCommand {
  id: string
  hotkey: string
  action: HotkeyAction
  label?: string | undefined
  description?: string | undefined
  category?: string | undefined
  options: HotkeyOptions
  enabled: boolean | (() => boolean)
  scopes: string[]
  keywords: string[]
  // Cached parsed hotkey for performance
  _parsed: ParsedHotkey
  _priority: number
  _registrationOrder: number
}

export type ConflictBehavior = "warn" | "error" | "replace" | "allow"

export interface HotkeyStoreOptions {
  /**
   * The target element to listen for hotkeys
   */
  target?: HotkeyTarget | undefined
  /**
   * The default options to use for the store
   */
  defaultOptions?: Partial<HotkeyOptions> | undefined
  /**
   * The timeout in milliseconds for sequence completion
   * @default 1000
   */
  sequenceTimeoutMs?: number | undefined
  /**
   * The active scopes when the store is created
   * @default ["*"]
   */
  activeScopes?: string | string[] | undefined
  /**
   * How to handle conflicts when two commands register the same hotkey.
   * @see ConflictBehavior
   * - `"warn"`: Log a warning but allow both (default)
   * - `"error"`: Throw an error preventing registration
   * - `"replace"`: Unregister the existing command
   * - `"allow"`: Silently allow duplicates
   * @default "warn"
   */
  conflictBehavior?: ConflictBehavior | undefined
}

export type FormTagName = "input" | "textarea" | "select"

export interface HotkeyOptions {
  /**
   * Whether to prevent the default browser behavior.
   *
   */
  preventDefault?: boolean | undefined
  /**
   * Whether to stop the event propagation
   */
  stopPropagation?: boolean | undefined
  /**
   * Whether to enable the hotkey on form tags.
   * - `true`: Enable on all form tags (input, textarea, select)
   * - `false`: Disable on all form tags (default)
   * - `FormTagName[]`: Enable only on specific form tag types
   */
  enableOnFormTags?: boolean | FormTagName[] | undefined
  /**
   * Whether to enable the hotkey on content editable elements.
   */
  enableOnContentEditable?: boolean | undefined
  /**
   * Use capture phase for event listeners (default: true)
   */
  capture?: boolean | undefined
  /**
   * When true, the hotkey fires only once per key press.
   * The key must be released before it can fire again.
   * @default false
   */
  requireReset?: boolean | undefined
  /**
   * The event type to listen for.
   * - `"keydown"`: Fire when the key is pressed (default)
   * - `"keyup"`: Fire when the key is released
   * @default "keydown"
   */
  eventType?: "keydown" | "keyup" | undefined
}

// Store state interface
export interface HotkeyStoreState {
  pressedKeys: Set<string>
  /** Physical `KeyboardEvent.code` values currently held (mirrors `matchesHotkey` code path). */
  pressedCodes: Set<string>
  commands: Map<string, HotkeyCommand>
  listening: boolean
  activeScopes: Set<string>
}
