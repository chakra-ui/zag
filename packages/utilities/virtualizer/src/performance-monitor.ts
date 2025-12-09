import type { PerformanceMetrics } from "./types"

const now = typeof performance !== "undefined" ? () => performance.now() : () => Date.now()

/**
 * Monitors virtualizer performance metrics
 */
export class PerformanceMonitor {
  private frameCount = 0
  private lastFpsUpdate = 0
  private currentFps = 60
  private cacheHits = 0
  private cacheMisses = 0
  private metricsCallback: ((metrics: PerformanceMetrics) => void) | undefined
  private lastMetricsTime = 0
  private readonly metricsInterval: number

  constructor(options: { metricsInterval?: number; onMetrics?: (metrics: PerformanceMetrics) => void } = {}) {
    this.metricsInterval = options.metricsInterval ?? 1000 // 1 second
    this.metricsCallback = options.onMetrics
    this.lastFpsUpdate = now()
    this.lastMetricsTime = now()
  }

  /**
   * Track start of frame/calculation
   */
  startFrame(): number {
    const currentTime = now()

    // Update FPS calculation
    this.frameCount++
    if (currentTime - this.lastFpsUpdate >= 1000) {
      this.currentFps = (this.frameCount * 1000) / (currentTime - this.lastFpsUpdate)
      this.frameCount = 0
      this.lastFpsUpdate = currentTime
    }

    return currentTime
  }

  /**
   * Track end of frame/calculation
   */
  endFrame(startTime: number): number {
    const renderTime = now() - startTime

    // Emit metrics if interval has passed
    const currentTime = now()
    if (currentTime - this.lastMetricsTime >= this.metricsInterval) {
      this.emitMetrics(renderTime)
      this.lastMetricsTime = currentTime
    }

    return renderTime
  }

  /**
   * Record cache hit
   */
  recordCacheHit(): void {
    this.cacheHits++
  }

  /**
   * Record cache miss
   */
  recordCacheMiss(): void {
    this.cacheMisses++
  }

  /**
   * Get current cache hit rate as percentage
   */
  getCacheHitRate(): number {
    const total = this.cacheHits + this.cacheMisses
    return total === 0 ? 100 : (this.cacheHits / total) * 100
  }

  /**
   * Reset cache statistics
   */
  resetCacheStats(): void {
    this.cacheHits = 0
    this.cacheMisses = 0
  }

  /**
   * Update metrics callback
   */
  setMetricsCallback(callback: (metrics: PerformanceMetrics) => void): void {
    this.metricsCallback = callback
  }

  /**
   * Get current FPS
   */
  getCurrentFPS(): number {
    return this.currentFps
  }

  /**
   * Emit current metrics
   */
  private emitMetrics(renderTime: number): void {
    if (!this.metricsCallback) return

    // Calculate scroll velocity (would be provided by the virtualizer)
    // This is a placeholder - actual implementation would track scroll deltas
    const scrollVelocity = 0

    const metrics: PerformanceMetrics = {
      renderTime,
      scrollFPS: this.currentFps,
      cacheSize: 0, // Would be provided by virtualizer
      cacheHitRate: this.getCacheHitRate(),
      scrollVelocity,
      visibleCount: 0, // Would be provided by virtualizer
      totalSize: 0, // Would be provided by virtualizer
    }

    this.metricsCallback(metrics)
  }

  /**
   * Create a metrics object with current data
   */
  createMetrics(data: {
    renderTime: number
    cacheSize: number
    scrollVelocity: number
    visibleCount: number
    totalSize: number
  }): PerformanceMetrics {
    return {
      ...data,
      scrollFPS: this.currentFps,
      cacheHitRate: this.getCacheHitRate(),
    }
  }

  /**
   * Reset all metrics
   */
  reset(): void {
    this.frameCount = 0
    this.currentFps = 60
    this.resetCacheStats()
    this.lastFpsUpdate = now()
    this.lastMetricsTime = now()
  }
}
