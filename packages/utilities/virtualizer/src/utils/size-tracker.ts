/**
 * Optimized size tracking with Fenwick tree for fast prefix sums
 * Combines the benefits of Fenwick tree with caching
 */
import { FenwickTree } from "./fenwick-tree"

export class SizeTracker {
  private fenwick: FenwickTree
  private sizes: Float64Array
  private measuredSizes: Map<number, number> = new Map()
  private count: number
  private gap: number
  private estimateFn: (index: number) => number
  private initialized = false

  constructor(count: number, gap: number, estimateFn: (index: number) => number) {
    this.count = count
    this.gap = gap
    this.estimateFn = estimateFn
    this.fenwick = new FenwickTree(count)
    this.sizes = new Float64Array(count)
  }

  /**
   * Initialize all sizes lazily
   */
  private ensureInitialized(): void {
    if (this.initialized) return

    for (let i = 0; i < this.count; i++) {
      const size = this.getSize(i)
      this.sizes[i] = size
      this.fenwick.add(i, size + (i < this.count - 1 ? this.gap : 0))
    }
    this.initialized = true
  }

  /**
   * Get size for an index (measured > estimated)
   */
  getSize(index: number): number {
    // Priority 1: Measured size
    const measured = this.measuredSizes.get(index)
    if (measured !== undefined) return measured

    // Priority 2: Cached size
    if (this.initialized && this.sizes[index] > 0) {
      return this.sizes[index]
    }

    // Priority 3: Estimate
    const size = this.estimateFn(index)
    if (this.initialized) {
      this.sizes[index] = size
    }
    return size
  }

  /**
   * Update measured size
   */
  setMeasuredSize(index: number, size: number): boolean {
    const currentSize = this.getSize(index)
    if (currentSize === size) return false

    this.measuredSizes.set(index, size)

    if (this.initialized) {
      const delta = size - this.sizes[index]
      this.sizes[index] = size

      if (delta !== 0) {
        // O(log n) update
        this.fenwick.add(index, delta)
      }
    }

    return true
  }

  /**
   * Get prefix sum up to index (sum of all sizes from 0 to index)
   */
  getPrefixSum(index: number): number {
    this.ensureInitialized()
    if (index < 0) return 0
    return this.fenwick.prefixSum(index)
  }

  /**
   * Find index at offset using binary search on fenwick tree
   */
  findIndexAtOffset(offset: number, paddingStart: number): number {
    this.ensureInitialized()
    return this.fenwick.lowerBoundWithPadding(offset, paddingStart)
  }

  /**
   * Reset all measurements
   */
  reset(count: number): void {
    this.count = count
    this.measuredSizes.clear()
    this.fenwick = new FenwickTree(count)
    this.sizes = new Float64Array(count)
    this.initialized = false
  }

  /**
   * Reindex internal measurements when items are inserted/removed before existing indices.
   * Used for chat-style prepend without losing measured sizes.
   *
   * Example: prepend N items => old index i becomes i + N.
   *
   * Note: This is an O(m) operation over the number of measured items and is
   * intended for relatively infrequent structural changes (not per-scroll).
   */
  reindex(delta: number, newCount: number): void {
    if (delta === 0 && newCount === this.count) return

    const nextMeasured = new Map<number, number>()
    for (const [index, size] of this.measuredSizes) {
      const nextIndex = index + delta
      if (nextIndex >= 0 && nextIndex < newCount) {
        nextMeasured.set(nextIndex, size)
      }
    }

    this.count = newCount
    this.measuredSizes = nextMeasured
    this.fenwick = new FenwickTree(newCount)
    this.sizes = new Float64Array(newCount)
    this.initialized = false
  }

  /**
   * Clear only measured sizes, keep estimates
   */
  clearMeasurements(): void {
    this.measuredSizes.clear()
    // Don't reset fenwick tree - keep structure
  }

  /**
   * Get total size
   */
  getTotalSize(paddingStart: number, paddingEnd: number): number {
    if (this.count === 0) return paddingStart + paddingEnd
    this.ensureInitialized()

    // Prefix sum at the last index already represents the total content size
    // (sizes + inter-item gaps, no trailing gap).
    const total = this.getPrefixSum(this.count - 1)
    return paddingStart + total + paddingEnd
  }
}
