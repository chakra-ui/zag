import type { VirtualItem } from "../types"

interface DOMElement {
  element: HTMLElement
  virtualItem: VirtualItem
  currentPosition: number
  targetPosition: number
}

/**
 * Manages DOM element order optimization to prevent layout thrashing during scroll
 * Defers DOM reordering until scroll stops for better performance
 */
export class DOMOrderManager {
  private elements = new Map<number, DOMElement>()
  private pendingReorder = false
  private reorderTimer: ReturnType<typeof setTimeout> | null = null
  private enabled = true

  constructor(private options: { reorderDelay?: number } = {}) {}

  /**
   * Register a DOM element for order management
   */
  registerElement(element: HTMLElement, virtualItem: VirtualItem): void {
    if (!this.enabled) return

    const domElement: DOMElement = {
      element,
      virtualItem,
      currentPosition: Array.from(element.parentElement?.children || []).indexOf(element),
      targetPosition: virtualItem.index,
    }

    this.elements.set(virtualItem.index, domElement)
  }

  /**
   * Update target positions for visible elements
   */
  updateTargetPositions(visibleItems: VirtualItem[]): void {
    if (!this.enabled) return

    for (const item of visibleItems) {
      const domElement = this.elements.get(item.index)
      if (domElement) {
        domElement.virtualItem = item
        domElement.targetPosition = item.index
      }
    }

    this.scheduleReorder()
  }

  /**
   * Force immediate reordering (e.g., when scrolling stops)
   */
  flushReorder(): void {
    if (!this.pendingReorder) return

    this.performReorder()
    this.clearReorderTimer()
  }

  /**
   * Schedule a DOM reorder with debouncing
   */
  private scheduleReorder(): void {
    if (!this.enabled || this.pendingReorder) return

    this.pendingReorder = true
    this.clearReorderTimer()

    // Defer reordering to prevent layout thrashing during active scrolling
    this.reorderTimer = setTimeout(() => {
      this.flushReorder()
    }, this.options.reorderDelay ?? 50)
  }

  /**
   * Perform the actual DOM reordering
   */
  private performReorder(): void {
    if (!this.pendingReorder) return

    const elementsToReorder = Array.from(this.elements.values())
      .filter((el) => el.currentPosition !== el.targetPosition && el.element.parentElement)
      .sort((a, b) => a.targetPosition - b.targetPosition)

    if (elementsToReorder.length === 0) {
      this.pendingReorder = false
      return
    }

    // Group by parent to minimize DOM manipulation
    const elementsByParent = new Map<Element, DOMElement[]>()

    for (const domElement of elementsToReorder) {
      const parent = domElement.element.parentElement!
      if (!elementsByParent.has(parent)) {
        elementsByParent.set(parent, [])
      }
      elementsByParent.get(parent)!.push(domElement)
    }

    // Reorder elements within each parent
    for (const [, elements] of elementsByParent) {
      this.reorderElementsInParent(elements)
    }

    // Update current positions
    for (const domElement of elementsToReorder) {
      domElement.currentPosition = domElement.targetPosition
    }

    this.pendingReorder = false
  }

  /**
   * Reorder elements within a specific parent container
   */
  private reorderElementsInParent(elements: DOMElement[]): void {
    // Sort elements by their target position
    const sortedElements = elements.slice().sort((a, b) => a.targetPosition - b.targetPosition)

    // Detach elements from parent (but keep references)
    const detachedElements = new Map<HTMLElement, Comment>()

    for (const { element } of sortedElements) {
      // Use comment node as placeholder to maintain position
      const placeholder = document.createComment(`virtualizer-placeholder-${element.dataset.index || ""}`)
      element.parentElement?.insertBefore(placeholder, element)
      element.remove()
      detachedElements.set(element, placeholder)
    }

    // Re-insert elements in correct order
    for (const { element } of sortedElements) {
      const placeholder = detachedElements.get(element)
      if (placeholder && placeholder.parentElement) {
        placeholder.parentElement.insertBefore(element, placeholder)
        placeholder.remove()
      }
    }
  }

  /**
   * Clean up element from management
   */
  unregisterElement(index: number): void {
    this.elements.delete(index)
  }

  /**
   * Enable/disable DOM order optimization
   */
  setEnabled(enabled: boolean): void {
    this.enabled = enabled

    if (!enabled && this.pendingReorder) {
      this.clearReorderTimer()
      this.pendingReorder = false
    }
  }

  /**
   * Get current reorder statistics
   */
  getStats(): {
    managedElements: number
    pendingReorder: boolean
    outOfOrderElements: number
  } {
    const outOfOrderElements = Array.from(this.elements.values()).filter(
      (el) => el.currentPosition !== el.targetPosition,
    ).length

    return {
      managedElements: this.elements.size,
      pendingReorder: this.pendingReorder,
      outOfOrderElements,
    }
  }

  /**
   * Clear the reorder timer
   */
  private clearReorderTimer(): void {
    if (this.reorderTimer) {
      clearTimeout(this.reorderTimer)
      this.reorderTimer = null
    }
  }

  /**
   * Force immediate reorder when scrolling stops
   */
  onScrollStop(): void {
    this.flushReorder()
  }

  /**
   * Clear all managed elements and timers
   */
  destroy(): void {
    this.clearReorderTimer()
    this.elements.clear()
    this.pendingReorder = false
  }
}
