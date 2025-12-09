import type { ScrollHistoryEntry, ScrollRestorationOptions } from "./types"

/**
 * Manages scroll position history and restoration
 * Supports restoration across navigation, data changes, and resizes
 */
export class ScrollRestorationManager {
  private history: ScrollHistoryEntry[] = []
  private options: Required<ScrollRestorationOptions>
  private sessionStorageKey: string
  private pendingRestore: ScrollHistoryEntry | null = null
  private lastSavedPosition: ScrollHistoryEntry | null = null

  constructor(options: ScrollRestorationOptions = {}) {
    this.options = {
      enableScrollRestoration: true,
      maxHistoryEntries: 10,
      restorationKey: "default",
      restorationTolerance: 5,
      ...options,
    }

    this.sessionStorageKey = `zag-virtualizer-scroll-${this.options.restorationKey}`
    this.loadFromSessionStorage()
  }

  /**
   * Record a scroll position in history
   */
  recordScrollPosition(offset: number, reason: ScrollHistoryEntry["reason"] = "user", key?: string | number): void {
    if (!this.options.enableScrollRestoration) return

    const entry: ScrollHistoryEntry = {
      offset: Math.round(offset),
      timestamp: Date.now(),
      key,
      reason,
    }

    // Don't record duplicate positions
    if (
      this.lastSavedPosition &&
      Math.abs(this.lastSavedPosition.offset - entry.offset) < this.options.restorationTolerance
    ) {
      return
    }

    this.history.push(entry)
    this.lastSavedPosition = entry

    // Trim history to max size
    if (this.history.length > this.options.maxHistoryEntries) {
      this.history.shift()
    }

    this.saveToSessionStorage()
  }

  /**
   * Get the most recent scroll position for restoration
   */
  getRestorationPosition(): ScrollHistoryEntry | null {
    if (!this.options.enableScrollRestoration || this.history.length === 0) {
      return null
    }

    // Return pending restore if available
    if (this.pendingRestore) {
      const restore = this.pendingRestore
      this.pendingRestore = null
      return restore
    }

    // Return most recent user scroll position
    for (let i = this.history.length - 1; i >= 0; i--) {
      const entry = this.history[i]
      if (entry.reason === "user" || entry.reason === "programmatic") {
        return entry
      }
    }

    return this.history[this.history.length - 1]
  }

  /**
   * Set a pending restoration position (e.g., from navigation)
   */
  setPendingRestore(offset: number, key?: string | number): void {
    if (!this.options.enableScrollRestoration) return

    this.pendingRestore = {
      offset: Math.round(offset),
      timestamp: Date.now(),
      key,
      reason: "programmatic",
    }
  }

  /**
   * Get scroll history for debugging or analysis
   */
  getHistory(): readonly ScrollHistoryEntry[] {
    return [...this.history]
  }

  /**
   * Clear all history
   */
  clearHistory(): void {
    this.history = []
    this.lastSavedPosition = null
    this.pendingRestore = null
    this.clearSessionStorage()
  }

  /**
   * Update restoration key (useful for dynamic content)
   */
  updateRestorationKey(key: string): void {
    if (key !== this.options.restorationKey) {
      this.saveToSessionStorage() // Save current state
      this.options.restorationKey = key
      this.sessionStorageKey = `zag-virtualizer-scroll-${key}`
      this.loadFromSessionStorage() // Load new state
    }
  }

  /**
   * Check if current position should be restored
   */
  shouldRestore(currentOffset: number): boolean {
    if (!this.options.enableScrollRestoration) return false

    const restoration = this.getRestorationPosition()
    if (!restoration) return false

    return Math.abs(currentOffset - restoration.offset) > this.options.restorationTolerance
  }

  /**
   * Save history to session storage for persistence across page loads
   */
  private saveToSessionStorage(): void {
    if (typeof sessionStorage === "undefined") return

    try {
      const data = {
        history: this.history,
        timestamp: Date.now(),
      }
      sessionStorage.setItem(this.sessionStorageKey, JSON.stringify(data))
    } catch (error) {
      console.warn("Failed to save scroll restoration data:", error)
    }
  }

  /**
   * Load history from session storage
   */
  private loadFromSessionStorage(): void {
    if (typeof sessionStorage === "undefined") return

    try {
      const stored = sessionStorage.getItem(this.sessionStorageKey)
      if (!stored) return

      const data = JSON.parse(stored)

      // Only restore recent data (within last hour)
      const oneHour = 60 * 60 * 1000
      if (Date.now() - data.timestamp < oneHour && Array.isArray(data.history)) {
        this.history = data.history
        this.lastSavedPosition = this.history[this.history.length - 1] || null
      }
    } catch (error) {
      console.warn("Failed to load scroll restoration data:", error)
    }
  }

  /**
   * Clear session storage
   */
  private clearSessionStorage(): void {
    if (typeof sessionStorage === "undefined") return

    try {
      sessionStorage.removeItem(this.sessionStorageKey)
    } catch (error) {
      console.warn("Failed to clear scroll restoration data:", error)
    }
  }

  /**
   * Handle data changes that might affect scroll position
   */
  handleDataChange(): void {
    if (!this.options.enableScrollRestoration) return

    // Record current position before data change
    const lastEntry = this.history[this.history.length - 1]
    if (lastEntry) {
      this.recordScrollPosition(lastEntry.offset, "data-change")
    }
  }

  /**
   * Handle resize that might affect scroll position
   */
  handleResize(currentOffset: number): void {
    if (!this.options.enableScrollRestoration) return

    this.recordScrollPosition(currentOffset, "resize")
  }

  /**
   * Clean up resources
   */
  destroy(): void {
    this.saveToSessionStorage()
    this.history = []
    this.lastSavedPosition = null
    this.pendingRestore = null
  }
}
