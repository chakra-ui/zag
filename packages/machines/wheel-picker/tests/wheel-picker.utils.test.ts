import { ListCollection } from "@zag-js/collection"
import { describe, expect, test } from "vitest"
import {
  findNearestEnabledIndex,
  getClickedStep,
  getExpandedItems,
  getHighlightItems,
  getInertiaTarget,
  getRenderItems,
  getWheelGeometry,
  normalizeScroll,
  normalizeVisibleCount,
  resolveEnabledIndex,
} from "../src/wheel-picker.utils"

const items = [
  { label: "One", value: "one" },
  { disabled: true, label: "Two", value: "two" },
  { label: "Three", value: "three" },
]

const collection = new ListCollection({ items })

describe("wheel picker utilities", () => {
  test("normalizes scroll positions", () => {
    expect(normalizeScroll(-1, 5)).toBe(4)
    expect(normalizeScroll(5, 5)).toBe(0)
    expect(normalizeScroll(2.5, 5)).toBe(2.5)
    expect(normalizeScroll(1, 0)).toBe(0)
  })

  test("normalizes visible count to a usable multiple of four", () => {
    expect(normalizeVisibleCount(2)).toBe(4)
    expect(normalizeVisibleCount(19)).toBe(16)
    expect(normalizeVisibleCount(20)).toBe(20)
    expect(normalizeVisibleCount(Number.NaN)).toBe(20)
  })

  test("calculates the reference wheel geometry", () => {
    expect(getWheelGeometry(20, 30)).toEqual({
      containerHeight: 192,
      halfItemHeight: 15,
      itemAngle: 18,
      quarterCount: 5,
      radius: expect.closeTo(92.3305, 4),
      visibleCount: 20,
    })
  })

  test("expands short infinite collections and adds edge render items", () => {
    const expanded = getExpandedItems(items, true, 20)
    expect(expanded).toHaveLength(12)

    const rendered = getRenderItems(items, true, 20)
    expect(rendered).toHaveLength(22)
    expect(rendered[0]?.index).toBe(-5)
    expect(rendered.at(-1)?.index).toBe(16)

    const highlighted = getHighlightItems(items, true, 20)
    expect(highlighted).toHaveLength(14)
    expect(highlighted[0]?.index).toBe(-1)
    expect(highlighted.at(-1)?.index).toBe(12)
  })

  test("skips disabled items in either direction", () => {
    expect(findNearestEnabledIndex(1, 1, items, false, collection)).toBe(2)
    expect(findNearestEnabledIndex(1, -1, items, false, collection)).toBe(0)
    expect(resolveEnabledIndex(1, 1, items, false, collection)).toBe(2)
    expect(resolveEnabledIndex(0, -1, items, true, collection)).toBe(0)
  })

  test("maps projected click segments to relative steps", () => {
    const geometry = getWheelGeometry(20, 30)
    expect(getClickedStep(0, 0, geometry, 30)).toBe(-4)
    expect(getClickedStep(geometry.containerHeight / 2, 0, geometry, 30)).toBe(0)
    expect(getClickedStep(geometry.containerHeight - 4, 0, geometry, 30)).toBe(4)
  })

  test("projects and clamps inertia targets", () => {
    expect(getInertiaTarget({ current: 2, dragSensitivity: 3, infinite: false, itemCount: 5, velocity: 30 })).toEqual({
      duration: expect.any(Number),
      target: 4,
    })

    expect(getInertiaTarget({ current: -0.5, dragSensitivity: 3, infinite: false, itemCount: 5, velocity: 0 })).toEqual(
      { duration: expect.any(Number), target: 0 },
    )

    expect(
      getInertiaTarget({ current: 2, dragSensitivity: 3, infinite: true, itemCount: 5, velocity: 30 }).target,
    ).toBeGreaterThan(4)
  })
})
