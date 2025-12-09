const now = typeof performance !== "undefined" ? () => performance.now() : () => Date.now()

export interface VelocityState {
  velocity: number
  direction: "forward" | "backward" | "idle"
  acceleration: number
  isStable: boolean
}

export interface OverscanCalculationResult {
  leading: number
  trailing: number
  total: number
  strategy: "static" | "velocity" | "acceleration" | "predictive"
}

/**
 * Enhanced velocity tracker with directional awareness and sophisticated overscan strategies
 * Based on React Spectrum's velocity tracking approach
 */
export class VelocityTracker {
  private lastOffset = 0
  private lastTime = 0

  // Enhanced velocity tracking with direction
  private velocityHistory: Array<{ velocity: number; direction: "forward" | "backward"; timestamp: number }> = []
  private readonly historySize = 12 // Increased for better averaging
  private readonly stabilityThreshold = 0.05 // Lower threshold - more sensitive to changes

  // Velocity thresholds (pixels per millisecond) - LOWERED for earlier activation
  private readonly lowVelocityThreshold = 0.1 // Was 0.3 - now triggers at slower speeds
  private readonly mediumVelocityThreshold = 0.5 // Was 1.0 - activates medium overscan sooner
  private readonly highVelocityThreshold = 1.5 // Was 2.5 - max overscan triggers earlier

  constructor() {
    this.lastTime = now()
  }

  /**
   * Update velocity tracking with new offset
   */
  update(offset: number, rtl?: boolean): VelocityState {
    const currentTime = now()
    const deltaTime = currentTime - this.lastTime
    const deltaOffset = offset - this.lastOffset

    if (deltaTime <= 0) {
      return this.getCurrentVelocityState()
    }

    const rawVelocity = deltaOffset / deltaTime

    // In RTL mode, positive velocity means moving backward (right to left)
    let direction: "forward" | "backward"
    if (rtl) {
      direction = rawVelocity > 0 ? "backward" : "forward"
    } else {
      direction = rawVelocity > 0 ? "forward" : "backward"
    }

    const velocity = Math.abs(rawVelocity)

    // Add to history
    this.velocityHistory.push({
      velocity,
      direction,
      timestamp: currentTime,
    })

    // Trim old history
    if (this.velocityHistory.length > this.historySize) {
      this.velocityHistory.shift()
    }

    // Clean up old entries (older than 200ms)
    const cutoff = currentTime - 200
    this.velocityHistory = this.velocityHistory.filter((entry) => entry.timestamp >= cutoff)

    this.lastOffset = offset
    this.lastTime = currentTime

    return this.getCurrentVelocityState()
  }

  /**
   * Get current velocity state with acceleration and stability info
   */
  getCurrentVelocityState(): VelocityState {
    if (this.velocityHistory.length === 0) {
      return {
        velocity: 0,
        direction: "idle",
        acceleration: 0,
        isStable: true,
      }
    }

    const recentEntries = this.velocityHistory.slice(-3)
    const avgVelocity = recentEntries.reduce((sum, entry) => sum + entry.velocity, 0) / recentEntries.length

    // Calculate acceleration (change in velocity)
    let acceleration = 0
    if (this.velocityHistory.length >= 2) {
      const recent = this.velocityHistory[this.velocityHistory.length - 1]
      const previous = this.velocityHistory[this.velocityHistory.length - 2]
      acceleration = recent.velocity - previous.velocity
    }

    // Determine if velocity is stable
    const velocityVariance = this.calculateVelocityVariance()
    const isStable = velocityVariance < this.stabilityThreshold

    // Determine direction (most common recent direction)
    const directionCounts = recentEntries.reduce(
      (counts, entry) => {
        counts[entry.direction] = (counts[entry.direction] || 0) + 1
        return counts
      },
      {} as Record<string, number>,
    )

    let direction: "forward" | "backward" | "idle" = "idle"
    if (avgVelocity > 0.05) {
      direction = directionCounts.forward > directionCounts.backward ? "forward" : "backward"
    }

    return {
      velocity: avgVelocity,
      direction,
      acceleration,
      isStable,
    }
  }

  /**
   * Calculate velocity variance for stability detection
   */
  private calculateVelocityVariance(): number {
    if (this.velocityHistory.length < 2) return 0

    const velocities = this.velocityHistory.map((entry) => entry.velocity)
    const mean = velocities.reduce((sum, v) => sum + v, 0) / velocities.length
    const variance = velocities.reduce((sum, v) => sum + Math.pow(v - mean, 2), 0) / velocities.length

    return Math.sqrt(variance)
  }

  /**
   * Enhanced overscan calculation with multiple strategies
   */
  calculateAdvancedOverscan(
    baseOverscan: number,
    viewportSize: number,
    itemSize: number,
    options: {
      maxMultiplier?: number
      strategy?: "adaptive" | "conservative" | "aggressive" | "velocity"
      enablePredictive?: boolean
    } = {},
  ): OverscanCalculationResult {
    const { maxMultiplier = 4, strategy = "adaptive", enablePredictive = true } = options

    const state = this.getCurrentVelocityState()
    const { velocity, direction, acceleration, isStable } = state

    // Calculate items visible in viewport for scaling
    const itemsInViewport = Math.ceil(viewportSize / itemSize)

    // Minimum overscan - never go below base even when "stable"
    const minOverscan = Math.max(baseOverscan, Math.ceil(itemsInViewport * 0.5))

    // Strategy 1: Static overscan for truly idle/very slow velocity
    // Only use static when BOTH velocity is very low AND stable
    if (velocity < this.lowVelocityThreshold && isStable) {
      return {
        leading: minOverscan,
        trailing: minOverscan,
        total: minOverscan * 2,
        strategy: "static",
      }
    }

    // Strategy 2: Velocity-based overscan with more aggressive scaling
    let velocityMultiplier = 1
    if (velocity < this.mediumVelocityThreshold) {
      // Linear ramp from 1x to 2x
      velocityMultiplier = 1 + velocity / this.mediumVelocityThreshold
    } else if (velocity < this.highVelocityThreshold) {
      // Quadratic ramp from 2x to maxMultiplier
      const normalizedVelocity =
        (velocity - this.mediumVelocityThreshold) / (this.highVelocityThreshold - this.mediumVelocityThreshold)
      velocityMultiplier = 2 + normalizedVelocity * normalizedVelocity * (maxMultiplier - 2)
    } else {
      // Beyond high threshold - use max multiplier
      velocityMultiplier = maxMultiplier
    }

    // Strategy 3: Acceleration-based adjustments (more aggressive)
    let accelerationMultiplier = 1
    if (Math.abs(acceleration) > 0.05) {
      // Accelerating: boost overscan significantly
      // Decelerating: still maintain good overscan (don't reduce as much)
      accelerationMultiplier = acceleration > 0 ? 1.5 : 0.9
    }

    // Strategy 4: Predictive overscan based on direction
    // Keep substantial overscan in BOTH directions to handle direction changes
    let leading = baseOverscan
    let trailing = baseOverscan

    const directionalMultiplier = velocityMultiplier * accelerationMultiplier
    // Keep minimum 80% overscan in non-scroll direction (was 60%)
    const minDirectionRatio = 0.8

    if (direction === "forward") {
      leading = Math.ceil(baseOverscan * directionalMultiplier)
      trailing = Math.max(minOverscan, Math.ceil(baseOverscan * minDirectionRatio * velocityMultiplier))
    } else if (direction === "backward") {
      trailing = Math.ceil(baseOverscan * directionalMultiplier)
      leading = Math.max(minOverscan, Math.ceil(baseOverscan * minDirectionRatio * velocityMultiplier))
    } else {
      // Idle/unknown direction - boost both equally
      leading = Math.ceil(baseOverscan * velocityMultiplier)
      trailing = Math.ceil(baseOverscan * velocityMultiplier)
    }

    // Strategy 5: Predictive overscan - calculate how many items we need to pre-render
    if (enablePredictive && velocity > this.lowVelocityThreshold) {
      // How many frames until we scroll past current viewport?
      const msPerFrame = 16.67 // 60fps
      const pxPerFrame = velocity * msPerFrame
      const framesToScrollViewport = viewportSize / pxPerFrame

      // Pre-render enough items to cover 3-5 frames of scrolling
      const framesToPrerender = Math.min(5, Math.max(3, framesToScrollViewport * 0.5))
      const pxToPrerender = pxPerFrame * framesToPrerender
      const predictiveOverscan = Math.ceil(pxToPrerender / itemSize)

      if (direction === "forward") {
        leading = Math.max(leading, predictiveOverscan)
      } else if (direction === "backward") {
        trailing = Math.max(trailing, predictiveOverscan)
      } else {
        // Unknown direction - boost both
        leading = Math.max(leading, predictiveOverscan)
        trailing = Math.max(trailing, predictiveOverscan)
      }
    }

    // Apply strategy constraints
    if (strategy === "conservative") {
      leading = Math.min(leading, baseOverscan * 2)
      trailing = Math.min(trailing, baseOverscan * 2)
    } else if (strategy === "aggressive" || strategy === "velocity") {
      // Aggressive/velocity: use higher multiplier and ensure minimum
      const aggressiveMin = Math.ceil(itemsInViewport * 0.75)
      leading = Math.max(aggressiveMin, Math.min(leading, baseOverscan * maxMultiplier))
      trailing = Math.max(aggressiveMin, Math.min(trailing, baseOverscan * maxMultiplier))
    }
    // "adaptive" (default) - no additional constraints, use calculated values

    // Ensure we never return less than minimum overscan
    return {
      leading: Math.max(minOverscan, leading),
      trailing: Math.max(minOverscan, trailing),
      total: Math.max(minOverscan, leading) + Math.max(minOverscan, trailing),
      strategy: enablePredictive ? "predictive" : Math.abs(acceleration) > 0.05 ? "acceleration" : "velocity",
    }
  }

  /**
   * Legacy method for backward compatibility
   */
  calculateOverscan(baseOverscan: number, maxMultiplier: number = 3): number {
    const result = this.calculateAdvancedOverscan(baseOverscan, 800, 50, { maxMultiplier })
    return Math.max(result.leading, result.trailing)
  }

  /**
   * Get simple average velocity for backward compatibility
   */
  getAverageVelocity(): number {
    const state = this.getCurrentVelocityState()
    return state.velocity
  }

  /**
   * Reset all tracking state
   */
  reset(): void {
    this.velocityHistory.length = 0
    this.lastTime = now()
    this.lastOffset = 0
  }

  /**
   * Get detailed velocity statistics for debugging
   */
  getVelocityStats() {
    const state = this.getCurrentVelocityState()
    return {
      ...state,
      historyLength: this.velocityHistory.length,
      variance: this.calculateVelocityVariance(),
      velocityCategory: this.getVelocityCategory(state.velocity),
    }
  }

  /**
   * Categorize velocity for easier debugging
   */
  private getVelocityCategory(velocity: number): "idle" | "slow" | "medium" | "fast" | "very-fast" {
    if (velocity < 0.05) return "idle"
    if (velocity < this.lowVelocityThreshold) return "slow"
    if (velocity < this.mediumVelocityThreshold) return "medium"
    if (velocity < this.highVelocityThreshold) return "fast"
    return "very-fast"
  }
}
