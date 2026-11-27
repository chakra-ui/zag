import type { Point } from "../types"

interface Sample extends Point {
  time: number
}

const WINDOW = 100
// a pause this long before letting go reads as placing it, not throwing it
const STALE = 50

/**
 * Recent positions and their times, for the speed at the end of a gesture. Samples older than the window are
 * dropped as new ones arrive.
 */
export function createVelocity() {
  let samples: Sample[] = []

  return {
    add(point: Point, time: number) {
      samples.push({ x: point.x, y: point.y, time })
      while (samples.length > 2 && time - samples[0].time > WINDOW) samples.shift()
    },

    /**
     * Units per millisecond between the newest sample and the oldest one within the window, or zero once the
     * pointer has held still
     */
    get(now: number): Point {
      const last = samples[samples.length - 1]
      if (!last || now - last.time > STALE) return { x: 0, y: 0 }
      const first = samples.find((sample) => last.time - sample.time <= WINDOW) ?? last
      const time = last.time - first.time
      if (time <= 0) return { x: 0, y: 0 }
      return { x: (last.x - first.x) / time, y: (last.y - first.y) / time }
    },

    reset() {
      samples = []
    },
  }
}
