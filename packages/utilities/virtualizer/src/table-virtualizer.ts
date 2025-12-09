import { ListVirtualizer } from "./list-virtualizer"
import type { TableVirtualizerOptions, StickyConfig } from "./types"

/**
 * Virtualizer specialized for tabular layouts.
 * Inherits list measurement logic and exposes advanced sticky positioning.
 */
export class TableVirtualizer extends ListVirtualizer {
  private stickyConfig: StickyConfig | undefined

  constructor(options: TableVirtualizerOptions & { stickyConfig?: StickyConfig }) {
    super({ ...options, horizontal: options.horizontal ?? false })
    this.stickyConfig = options.stickyConfig
  }

  getHeaderProps(height: number = (this.options as TableVirtualizerOptions).headerHeight ?? 40) {
    return {
      style: {
        position: "sticky" as const,
        top: 0,
        zIndex: 10,
        height,
        background: "inherit",
        backdropFilter: "blur(8px)",
      },
      "data-virtualized": "header",
    }
  }

  /**
   * Get props for sticky row elements
   */
  getStickyRowProps(index: number, currentScrollOffset: number) {
    if (!this.stickyConfig?.stickyIndices?.includes(index)) {
      return { style: {} }
    }

    const measurement = this.getMeasurement(index)
    const behavior = this.stickyConfig.stickyBehavior ?? "stack"

    let top = 0
    let zIndex = 5

    switch (behavior) {
      case "stack":
        // Calculate stacked position based on other sticky items
        const precedingStickyIndices = this.stickyConfig.stickyIndices.filter(
          (i) => i < index && this.isIndexSticky(i, currentScrollOffset),
        )

        top = precedingStickyIndices.reduce((acc, idx) => {
          return acc + this.getMeasurement(idx).size
        }, 0)
        zIndex = 5 + precedingStickyIndices.length
        break

      case "push":
        // Push current sticky item up when next one approaches
        const nextStickyIndex = this.stickyConfig.stickyIndices.find((i) => i > index)

        if (nextStickyIndex) {
          const nextMeasurement = this.getMeasurement(nextStickyIndex)
          const nextStart = nextMeasurement.start
          const distance = nextStart - currentScrollOffset - measurement.size

          if (distance < 0) {
            top = Math.max(distance, -measurement.size)
          }
        }
        break

      case "overlay":
        // Simply stick at the top
        top = 0
        break
    }

    return {
      style: {
        position: "sticky" as const,
        top,
        zIndex,
        background: "inherit",
        backdropFilter: "blur(4px)",
      },
      "data-virtualized": "sticky-row",
      "data-sticky-index": index,
    }
  }

  /**
   * Check if an index should be sticky at the current scroll position
   */
  private isIndexSticky(index: number, scrollOffset: number): boolean {
    const measurement = this.getMeasurement(index)
    return measurement.start <= scrollOffset
  }

  /**
   * Get all currently sticky rows
   */
  getStickyRows(currentScrollOffset: number) {
    if (!this.stickyConfig?.stickyIndices) return []

    return this.stickyConfig.stickyIndices
      .filter((index) => this.isIndexSticky(index, currentScrollOffset))
      .map((index) => ({
        index,
        measurement: this.getMeasurement(index),
        props: this.getStickyRowProps(index, currentScrollOffset),
      }))
  }

  /**
   * Update sticky configuration
   */
  setStickyConfig(config: StickyConfig) {
    this.stickyConfig = config
  }
}
