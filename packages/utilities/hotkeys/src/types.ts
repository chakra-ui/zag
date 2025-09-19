export type RootNode = Document | ShadowRoot

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
  enabled?: boolean | ((context: TContext) => boolean) | undefined
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

export interface HotkeyCommand<TContext = any> {
  id: string
  hotkey: string
  action: HotkeyAction<TContext>
  label?: string | undefined
  description?: string | undefined
  category?: string | undefined
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
  defaultContext?: TContext | undefined
}

export interface HotkeyStoreOptions<TContext = any> {
  /**
   * The root node to listen for hotkeys
   */
  rootNode?: RootNode | undefined
  /**
   * The default context to use for the store
   */
  context?: TContext | undefined
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
   * The default active scopes when the store is created
   * @default ["*"]
   */
  defaultActiveScopes?: string | string[] | undefined
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
}

// Store state interface
export interface HotkeyStoreState<TContext = any> {
  pressedKeys: Set<string>
  commands: Map<string, HotkeyCommand<TContext>>
  listening: boolean
  activeScopes: Set<string>
}
