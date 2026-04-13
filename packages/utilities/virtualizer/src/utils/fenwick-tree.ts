/**
 * Fenwick tree (Binary Indexed Tree) backed by a typed array for fast prefix sums.
 * Supports point updates and prefix queries in O(log n), suitable for variable-size lists.
 */
export class FenwickTree {
  private tree: Float64Array
  private size: number

  constructor(length: number) {
    this.size = length
    this.tree = new Float64Array(length + 1) // 1-based indexing
  }

  /**
   * Build the tree from an array of values.
   */
  build(values: ArrayLike<number>) {
    const n = Math.min(values.length, this.size)
    for (let i = 0; i < n; i++) {
      this.add(i, values[i])
    }
  }

  /**
   * Add delta to position i (0-based).
   */
  add(index: number, delta: number) {
    for (let i = index + 1; i <= this.size; i += i & -i) {
      this.tree[i] += delta
    }
  }

  /**
   * Set value at i to newValue by computing delta.
   */
  set(index: number, newValue: number, currentValue: number) {
    const delta = newValue - currentValue
    if (delta !== 0) {
      this.add(index, delta)
    }
  }

  /**
   * Prefix sum [0, index] inclusive.
   */
  prefixSum(index: number): number {
    let sum = 0
    for (let i = index + 1; i > 0; i -= i & -i) {
      sum += this.tree[i]
    }
    return sum
  }

  /**
   * Range sum [l, r] inclusive.
   */
  rangeSum(left: number, right: number): number {
    if (right < left) return 0
    return this.prefixSum(right) - (left > 0 ? this.prefixSum(left - 1) : 0)
  }

  /**
   * Find the smallest index such that prefixSum(index) >= target.
   * Returns size if target exceeds total sum.
   */
  lowerBound(target: number): number {
    let idx = 0
    let bitMask = 1
    while (bitMask << 1 <= this.size) {
      bitMask <<= 1
    }

    let curr = 0
    for (let bit = bitMask; bit !== 0; bit >>= 1) {
      const next = idx + bit
      if (next <= this.size && curr + this.tree[next] < target) {
        idx = next
        curr += this.tree[next]
      }
    }

    return Math.min(idx, this.size - 1)
  }

  /**
   * Find index at offset with padding adjustment.
   * Subtracts padding before searching.
   */
  lowerBoundWithPadding(offset: number, paddingStart: number): number {
    const target = Math.max(0, offset - paddingStart)
    return this.lowerBound(target)
  }

  clear() {
    this.tree.fill(0)
  }
}
