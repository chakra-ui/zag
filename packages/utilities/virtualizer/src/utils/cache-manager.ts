/**
 * Generic cache manager with LRU eviction
 * Shared between list and grid virtualizers
 */
export class CacheManager<K = string, V = any> {
  private cache: Map<K, V>
  private maxSize: number

  constructor(maxSize: number = 100) {
    this.cache = new Map()
    this.maxSize = maxSize
  }

  /**
   * Get cached value
   */
  get(key: K): V | undefined {
    return this.cache.get(key)
  }

  /**
   * Set cached value with LRU eviction
   */
  set(key: K, value: V): void {
    // Delete and re-add to move to end (most recent)
    if (this.cache.has(key)) {
      this.cache.delete(key)
    }

    // Evict oldest if at capacity
    if (this.cache.size >= this.maxSize) {
      const firstKey = this.cache.keys().next().value
      if (firstKey !== undefined) {
        this.cache.delete(firstKey)
      }
    }

    this.cache.set(key, value)
  }

  /**
   * Check if key exists
   */
  has(key: K): boolean {
    return this.cache.has(key)
  }

  /**
   * Delete specific key
   */
  delete(key: K): boolean {
    return this.cache.delete(key)
  }

  /**
   * Clear all cached values
   */
  clear(): void {
    this.cache.clear()
  }

  /**
   * Get cache size
   */
  get size(): number {
    return this.cache.size
  }

  /**
   * Clean up entries outside a range
   */
  cleanupOutsideRange(isInRange: (key: K, value: V) => boolean): void {
    for (const [key, value] of this.cache) {
      if (!isInRange(key, value)) {
        this.cache.delete(key)
      }
    }
  }

  /**
   * Make the cache iterable
   */
  [Symbol.iterator]() {
    return this.cache[Symbol.iterator]()
  }

  /**
   * Get all entries
   */
  entries() {
    return this.cache.entries()
  }
}
