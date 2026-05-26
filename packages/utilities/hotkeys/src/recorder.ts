import { formatHotkey, type FormatHotkeyOptions } from "./format"
import { normalizeKey } from "./normalize"
import type { HotkeyTarget, Platform } from "./types"
import { getPlatform, MODIFIER_SEPARATOR, SEQUENCE_SEPARATOR } from "./utils"

const MODIFIER_KEYS = new Set(["Control", "Alt", "Shift", "Meta"])

const DEFAULT_SEQUENCE_TIMEOUT = 1000

export interface RecordedHotkey {
  /**
   * The raw hotkey string (e.g., "Control+Shift+K" or "G > H")
   */
  value: string
  /**
   * The platform-formatted display string (e.g., "⌃⇧K" on Mac)
   */
  display: string
}

export interface HotkeyRecorderOptions {
  /**
   * The target element to listen for key events
   */
  target?: HotkeyTarget | undefined
  /**
   * Called when a hotkey is successfully recorded
   */
  onRecord?: (hotkey: RecordedHotkey) => void
  /**
   * Called when recording is cancelled (via Escape)
   */
  onCancel?: () => void
  /**
   * Called when the recorded hotkey is cleared (via Backspace/Delete)
   */
  onClear?: () => void
  /**
   * Options for formatting the display string
   */
  formatOptions?: FormatHotkeyOptions | undefined
  /**
   * Timeout in milliseconds to wait for the next sequence step.
   * If no key is pressed within this window, the recording finalizes.
   * @default 1000
   */
  sequenceTimeoutMs?: number | undefined
}

export interface HotkeyRecorderState {
  /**
   * Whether the recorder is currently listening for key events
   */
  recording: boolean
  /**
   * The current recorded hotkey, or null if nothing recorded.
   * Updates live as steps are added (e.g., "G" then "G > H").
   */
  value: RecordedHotkey | null
}

type RecorderSubscriber = (state: HotkeyRecorderState) => void

export class HotkeyRecorder {
  private state: HotkeyRecorderState = { recording: false, value: null }
  private target?: HotkeyTarget | undefined
  private options: HotkeyRecorderOptions
  private platform: Platform
  private keyDownHandler?: EventListener | undefined
  private keyUpHandler?: EventListener | undefined
  private subscribers = new Set<RecorderSubscriber>()
  // Sequence state
  private steps: string[] = []
  private sequenceTimerId?: ReturnType<typeof setTimeout> | undefined

  constructor(options: HotkeyRecorderOptions = {}) {
    this.options = options
    this.platform = getPlatform()
  }

  /**
   * Initialize the recorder with a target DOM element.
   * Must be called before `start()` if target was not provided in options.
   */
  init(target: HotkeyTarget): this {
    this.target = target
    this.platform = getPlatform()
    return this
  }

  /**
   * Start recording. Captures key combinations, automatically detecting sequences.
   */
  start(): this {
    if (this.state.recording) return this

    const root = this.target
    if (!root) {
      console.warn("HotkeyRecorder: target is not set. Call init() first.")
      return this
    }

    this.steps = []
    this.clearSequenceTimer()
    this.setState({ recording: true, value: this.state.value })
    this.attachListeners(root)
    return this
  }

  /**
   * Stop recording without changing the current value.
   */
  stop(): this {
    if (!this.state.recording) return this
    this.finalize()
    return this
  }

  /**
   * Cancel recording. Stops recording and invokes onCancel.
   */
  cancel(): this {
    if (!this.state.recording) return this
    this.detachListeners()
    this.clearSequenceTimer()
    this.steps = []
    this.setState({ recording: false, value: this.state.value })
    this.options.onCancel?.()
    return this
  }

  /**
   * Clear the recorded hotkey and stop recording.
   */
  clear(): this {
    this.detachListeners()
    this.clearSequenceTimer()
    this.steps = []
    this.setState({ recording: false, value: null })
    this.options.onClear?.()
    return this
  }

  /**
   * Update options (callbacks, formatOptions) without recreating the recorder.
   * Useful for keeping callbacks in sync with component state.
   */
  setOptions(options: Partial<HotkeyRecorderOptions>): this {
    this.options = { ...this.options, ...options }
    return this
  }

  /**
   * Get the current recorder state.
   */
  getState(): Readonly<HotkeyRecorderState> {
    return this.state
  }

  /**
   * Subscribe to state changes.
   */
  subscribe(callback: RecorderSubscriber): () => void {
    this.subscribers.add(callback)
    return () => {
      this.subscribers.delete(callback)
    }
  }

  /**
   * Clean up all listeners and subscriptions.
   */
  destroy(): void {
    this.detachListeners()
    this.clearSequenceTimer()
    this.subscribers.clear()
    this.steps = []
    this.target = undefined
  }

  private setState(next: HotkeyRecorderState): void {
    this.state = next
    for (const fn of this.subscribers) {
      try {
        fn(this.state)
      } catch (error) {
        console.error("Error in hotkey recorder subscriber:", error)
      }
    }
  }

  private attachListeners(root: HotkeyTarget): void {
    this.keyDownHandler = ((event: Event) => {
      this.handleKeyDown(event as KeyboardEvent)
    }) as EventListener

    this.keyUpHandler = ((event: Event) => {
      event.preventDefault()
    }) as EventListener

    root.addEventListener("keydown", this.keyDownHandler, true)
    root.addEventListener("keyup", this.keyUpHandler, true)
  }

  private detachListeners(): void {
    if (!this.target) return

    if (this.keyDownHandler) {
      this.target.removeEventListener("keydown", this.keyDownHandler, true)
    }
    if (this.keyUpHandler) {
      this.target.removeEventListener("keyup", this.keyUpHandler, true)
    }

    this.keyDownHandler = undefined
    this.keyUpHandler = undefined
  }

  private handleKeyDown(event: KeyboardEvent): void {
    event.preventDefault()
    event.stopPropagation()

    const key = event.key

    // Escape cancels recording
    if (key === "Escape") {
      this.cancel()
      return
    }

    // Backspace/Delete clears the recorded value
    if (key === "Backspace" || key === "Delete") {
      this.clear()
      return
    }

    // Skip lone modifier presses — wait for a non-modifier key
    if (MODIFIER_KEYS.has(key)) return

    // Skip dead keys
    if (key === "Dead") return

    // Clear any pending sequence timer
    this.clearSequenceTimer()

    // Build the chord string from active modifiers + key
    const parts: string[] = []
    if (event.ctrlKey) parts.push("Control")
    if (event.altKey) parts.push("Alt")
    if (event.shiftKey) parts.push("Shift")
    if (event.metaKey) parts.push("Meta")

    const normalizedKey = normalizeKey(key)
    parts.push(normalizedKey)

    const chord = parts.join(MODIFIER_SEPARATOR)
    this.steps.push(chord)

    // Build current value from all steps so far
    const currentValue = this.buildRecordedHotkey()
    this.setState({ recording: true, value: currentValue })

    // Start timeout — if no next key within the window, finalize
    const timeout = this.options.sequenceTimeoutMs ?? DEFAULT_SEQUENCE_TIMEOUT
    this.sequenceTimerId = setTimeout(() => {
      this.finalize()
    }, timeout)
  }

  private buildRecordedHotkey(): RecordedHotkey {
    const value = this.steps.join(` ${SEQUENCE_SEPARATOR} `)
    const display = formatHotkey(value, {
      platform: this.platform,
      ...this.options.formatOptions,
    })
    return { value, display }
  }

  private finalize(): void {
    this.detachListeners()
    this.clearSequenceTimer()

    const recorded = this.steps.length > 0 ? this.buildRecordedHotkey() : null
    this.steps = []
    this.setState({ recording: false, value: recorded })

    if (recorded) {
      this.options.onRecord?.(recorded)
    }
  }

  private clearSequenceTimer(): void {
    if (this.sequenceTimerId !== undefined) {
      clearTimeout(this.sequenceTimerId)
      this.sequenceTimerId = undefined
    }
  }
}

export function createHotkeyRecorder(options?: HotkeyRecorderOptions): HotkeyRecorder {
  const recorder = new HotkeyRecorder(options)
  if (options?.target) {
    recorder.init(options.target)
  }
  return recorder
}
