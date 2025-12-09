import type { ViewRecyclingStats } from "./types"

type ViewFactory<T = HTMLElement> = () => T
type ViewInitializer<T = HTMLElement> = (view: T, index: number, data: unknown) => void
type ViewCleaner<T = HTMLElement> = (view: T) => void

/**
 * Pool for recycling DOM elements to improve performance
 */
export class ViewPool<T extends HTMLElement = HTMLElement> {
  private available: T[] = []
  private inUse = new Set<T>()
  private totalReuses = 0
  private readonly maxPoolSize: number
  private readonly factory: ViewFactory<T>
  private readonly initializer: ViewInitializer<T> | undefined
  private readonly cleaner: ViewCleaner<T> | undefined

  constructor(
    factory: ViewFactory<T>,
    options: {
      maxPoolSize?: number
      initializer?: ViewInitializer<T>
      cleaner?: ViewCleaner<T>
    } = {},
  ) {
    this.factory = factory
    this.maxPoolSize = options.maxPoolSize ?? 50
    this.initializer = options.initializer
    this.cleaner = options.cleaner
  }

  /**
   * Acquire a view from the pool or create a new one
   */
  acquire(index?: number, data?: unknown): T {
    let view = this.available.pop()

    if (!view) {
      view = this.factory()
    } else {
      this.totalReuses++
    }

    this.inUse.add(view)

    // Initialize the view with current data
    if (this.initializer && index !== undefined) {
      this.initializer(view, index, data)
    }

    return view
  }

  /**
   * Release a view back to the pool
   */
  release(view: T): void {
    if (!this.inUse.has(view)) {
      return // View not from this pool
    }

    this.inUse.delete(view)

    // Clean the view before returning to pool
    if (this.cleaner) {
      this.cleaner(view)
    }

    // Only keep up to maxPoolSize views in the pool
    if (this.available.length < this.maxPoolSize) {
      this.available.push(view)
    } else {
      // Remove from DOM if exceeded pool size
      view.remove()
    }
  }

  /**
   * Release all views and clear the pool
   */
  clear(): void {
    // Clean up all available views
    for (const view of this.available) {
      if (this.cleaner) {
        this.cleaner(view)
      }
      view.remove()
    }

    // Clean up in-use views
    for (const view of this.inUse) {
      if (this.cleaner) {
        this.cleaner(view)
      }
      view.remove()
    }

    this.available.length = 0
    this.inUse.clear()
    this.totalReuses = 0
  }

  /**
   * Force release all in-use views
   */
  releaseAll(): void {
    const inUseViews = Array.from(this.inUse)
    for (const view of inUseViews) {
      this.release(view)
    }
  }

  /**
   * Get recycling statistics
   */
  getStats(): ViewRecyclingStats {
    return {
      poolSize: this.available.length + this.inUse.size,
      activeViews: this.inUse.size,
      availableViews: this.available.length,
      reuseCount: this.totalReuses,
    }
  }

  /**
   * Trim pool to optimal size based on usage
   */
  trim(targetSize?: number): void {
    const target = targetSize ?? Math.ceil(this.maxPoolSize / 2)

    while (this.available.length > target) {
      const view = this.available.pop()
      if (view) {
        if (this.cleaner) {
          this.cleaner(view)
        }
        view.remove()
      }
    }
  }
}
