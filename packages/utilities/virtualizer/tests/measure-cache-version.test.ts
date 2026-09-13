import { describe, expect, test } from "vitest"
import { ListVirtualizer } from "../src/list-virtualizer"

const make = () =>
  new ListVirtualizer({
    count: 1000,
    estimatedSize: () => 20,
    overscan: 0,
    initialRect: { width: 100, height: 100 },
  } as any)

describe("measure cache invalidation", () => {
  test("an item outside the rendered window is not served from a pre-measurement cache", () => {
    const v = make() as any

    expect(v.getMeasurement(500).start).toBe(500 * 20)

    // an early item is taller than estimated, shifting everything after it
    v.measureItem(1, 120)
    // recomputing the visible window must not mark the whole cache clean
    v.getVirtualItems()

    expect(v.getMeasurement(500).start).toBe(500 * 20 + 100)
  })

  test("repeated reads at the same version still hit the cache", () => {
    const v = make() as any
    const first = v.getMeasurement(300)
    expect(v.getMeasurement(300)).toBe(first)

    v.measureItem(0, 50)
    expect(v.getMeasurement(300)).not.toBe(first)
  })
})
