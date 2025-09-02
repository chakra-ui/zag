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
}

export type HotkeyCallback = (event: KeyboardEvent) => void

export interface HotkeyOptions {
  /**
   * Whether the hotkey is enabled.
   *
   * @default true
   */
  enabled?: boolean
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
   * Whether to enable the hotkey on form tags
   */
  enableOnFormTags?: boolean
  /**
   * Whether to enable the hotkey on content editable elements.
   */
  enableOnContentEditable?: boolean
  /**
   * The scopes to use for the hotkey manager.
   *
   * @default "*"
   */
  scopes?: string | string[]
  /**
   * The timeout in milliseconds for sequence completion
   */
  sequenceTimeoutMs?: number
  /**
   * The root node to use for the hotkey manager
   */
  getRootNode?: () => RootNode
  /**
   * When true, only this hotkey executes (prevents less specific matches)
   */
  exactMatch?: boolean
  /**
   * Use capture phase for event listeners (default: true)
   */
  capture?: boolean
}

export interface HotkeyState {
  currentlyPressedKeys: Set<string>
  registeredHotkeys: Map<string, { callback: HotkeyCallback; options: HotkeyOptions }>
  sequenceStates: Map<string, { recordedKeys: string[]; timeoutId?: number }>
  isListening: boolean
  activeScopes: Set<string>
  listeners: {
    capture: {
      keyDown?: EventListener
      keyUp?: EventListener
      blur?: EventListener
    }
    bubble: {
      keyDown?: EventListener
      keyUp?: EventListener
      blur?: EventListener
    }
  }
}
