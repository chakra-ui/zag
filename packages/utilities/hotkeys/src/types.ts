export type RootNode = Document | ShadowRoot

export interface KeyboardModifiers {
  alt?: boolean
  ctrl?: boolean
  meta?: boolean
  shift?: boolean
}

export interface ParsedHotkey extends KeyboardModifiers {
  keys: string[]
  isSequence?: boolean
  description?: string
  // For sequences: array of parsed steps, each with modifiers and key
  sequenceSteps?: Array<{
    key: string
    alt?: boolean
    ctrl?: boolean
    meta?: boolean
    shift?: boolean
  }>
}

// Store-based hotkey system types
export type HotkeyAction<TContext = any> = (context: TContext, event: KeyboardEvent) => Promise<void> | void

export interface CommandDefinition<TContext = any> {
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
  action: HotkeyAction<TContext>
  /**
   * Human-readable label for the command
   */
  label?: string
  /**
   * Description of what the command does
   */
  description?: string
  /**
   * Category for organizing commands
   */
  category?: string
  /**
   * Options for the hotkey command.
   */
  options?: HotkeyOptions
  /**
   * Whether the command is enabled.
   */
  enabled?: boolean | ((context: TContext) => boolean)
  /**
   * The scopes to use for the hotkey command.
   *
   * @default "*"
   */
  scopes?: string | string[]
  /**
   * Keywords for search/command palette integration.
   * Useful for alternative names or search terms for the command.
   */
  keywords?: string[]
}

export interface HotkeyCommand<TContext = any> {
  id: string
  hotkey: string
  action: HotkeyAction<TContext>
  label?: string
  description?: string
  category?: string
  options: HotkeyOptions
  enabled: boolean | ((context: TContext) => boolean)
  scopes: string[]
  keywords: string[]
  // Cached parsed hotkey for performance
  _parsed: ParsedHotkey
  _priority: number
  _registrationOrder: number
}

export interface HotkeyStoreInit<TContext = any> {
  rootNode: RootNode
  defaultContext?: TContext
}

export interface HotkeyStoreOptions<TContext = any> {
  rootNode?: RootNode
  context?: TContext
  defaultOptions?: Partial<HotkeyOptions>
  /**
   * The timeout in milliseconds for sequence completion
   * @default 1000
   */
  sequenceTimeoutMs?: number
  /**
   * The default active scopes when the store is created
   * @default ["*"]
   */
  defaultActiveScopes?: string | string[]
}

export type FormTagName = "input" | "textarea" | "select"

export interface HotkeyOptions {
  /**
   * Whether to prevent the default browser behavior.
   *
   */
  preventDefault?: boolean
  /**
   * Whether to stop the event propagation
   */
  stopPropagation?: boolean
  /**
   * Whether to enable the hotkey on form tags.
   * - `true`: Enable on all form tags (input, textarea, select)
   * - `false`: Disable on all form tags (default)
   * - `FormTagName[]`: Enable only on specific form tag types
   */
  enableOnFormTags?: boolean | FormTagName[]
  /**
   * Whether to enable the hotkey on content editable elements.
   */
  enableOnContentEditable?: boolean
  /**
   * Use capture phase for event listeners (default: true)
   */
  capture?: boolean
}

// Store state interface
export interface HotkeyStoreState<TContext = any> {
  pressedKeys: Set<string>
  commands: Map<string, HotkeyCommand<TContext>>
  sequenceStates: Map<string, { recordedKeys: string[]; timeoutId?: number }>
  listening: boolean
  activeScopes: Set<string>
}
