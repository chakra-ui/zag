import { describe, expect, test } from "vitest"
import { calculateDuration } from "../src/marquee.utils"

describe("@zag-js/marquee utils", () => {
  describe("calculateDuration", () => {
    // Each content element translates by 100% of its own size, so the animation distance is
    // the content size. The duration must therefore be contentSize / speed for the configured
    // speed to be the actual pixel speed, independent of the viewport size.
    test("uses content size for the distance when content is smaller than the viewport", () => {
      // Regression for the case reported in #3231: 1000px viewport, 100px content, speed 100.
      // The content only moves 100px, so the duration should be 1s (=> 100px/s), not 10s.
      expect(calculateDuration({ rootSize: 1000, contentSize: 100, speed: 100, multiplier: 1, autoFill: false })).toBe(
        1,
      )
    })

    test("keeps the configured speed when content is larger than the viewport", () => {
      expect(calculateDuration({ rootSize: 500, contentSize: 1000, speed: 100, multiplier: 1, autoFill: false })).toBe(
        10,
      )
    })

    test("actual pixel speed equals the configured speed regardless of viewport size", () => {
      const speed = 100
      for (const [rootSize, contentSize] of [
        [1000, 100],
        [1000, 2000],
        [300, 300],
      ]) {
        const duration = calculateDuration({ rootSize, contentSize, speed, multiplier: 1, autoFill: false })
        expect(contentSize / duration).toBe(speed)
      }
    })

    test("autoFill scales the distance by the multiplier", () => {
      expect(calculateDuration({ rootSize: 1000, contentSize: 100, speed: 100, multiplier: 10, autoFill: true })).toBe(
        10,
      )
    })
  })
})
