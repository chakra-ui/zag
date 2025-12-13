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
}

/**
 * Velocity tracker for dynamic overscan.
 * Tracks recent scroll deltas to estimate velocity, direction, and acceleration,
 * then converts that into leading/trailing overscan counts.
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
   * Dynamic overscan calculation based on current velocity/acceleration.
   */
  calculateDynamicOverscan(baseOverscan: number, viewportSize: number, itemSize: number): OverscanCalculationResult {
    // Internal max multiplier to prevent runaway overscan.
    const maxMultiplier = 4

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

    // Cap at max multiplier
    leading = Math.min(leading, baseOverscan * maxMultiplier)
    trailing = Math.min(trailing, baseOverscan * maxMultiplier)

    // Ensure we never return less than minimum overscan
    return {
      leading: Math.max(minOverscan, leading),
      trailing: Math.max(minOverscan, trailing),
      total: Math.max(minOverscan, leading) + Math.max(minOverscan, trailing),
    }
  }

  /**
   * Reset all tracking state
   */
  reset(): void {
    this.velocityHistory.length = 0
    this.lastTime = now()
    this.lastOffset = 0
  }
}
