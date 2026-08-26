// @vitest-environment jsdom

import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"
import { findSnapPoint, getScrollSnapPositions, getSnapPointTarget, getSnapPositions } from "../src"

/**
 * jsdom has no layout engine, so we stub geometry and computed styles.
 *
 * Geometry model (x-axis): a container of `size` with `items` laid out along the
 * scroll axis. `start` is each item's logical offset from the content start
 * (left edge in LTR, right edge in RTL). Rects are derived from the current
 * scroll offset so `getSnapPositions` recovers the logical offsets.
 */

const styleMap = new WeakMap<Element, Record<string, string>>()

interface ItemSpec {
  start: number
  size: number
  align: string
}

interface ContainerSpec {
  axis?: "x" | "y"
  direction?: "ltr" | "rtl"
  size?: number
  crossSize?: number
  contentSize?: number
  scrollOffset?: number
  padding?: Record<string, string>
  items: ItemSpec[]
}

function setStyle(el: Element, styles: Record<string, string>) {
  styleMap.set(el, styles)
}

function defineRect(el: Element, rect: { left: number; top: number; width: number; height: number }) {
  el.getBoundingClientRect = () =>
    ({
      left: rect.left,
      top: rect.top,
      width: rect.width,
      height: rect.height,
      right: rect.left + rect.width,
      bottom: rect.top + rect.height,
      x: rect.left,
      y: rect.top,
    }) as DOMRect
}

function createContainer(spec: ContainerSpec) {
  const { axis = "x", direction = "ltr", size = 200, crossSize = 100, scrollOffset = 0, padding = {}, items } = spec

  const contentSize = spec.contentSize ?? Math.max(size, ...items.map((item) => item.start + item.size))
  const isRtl = direction === "rtl" && axis === "x"

  const parent = document.createElement("div")
  document.body.appendChild(parent)

  setStyle(parent, { direction, ...padding })

  const width = axis === "x" ? size : crossSize
  const height = axis === "x" ? crossSize : size
  defineRect(parent, { left: 0, top: 0, width, height })

  Object.defineProperties(parent, {
    offsetWidth: { value: width },
    offsetHeight: { value: height },
    scrollWidth: { value: axis === "x" ? contentSize : crossSize },
    scrollHeight: { value: axis === "x" ? crossSize : contentSize },
    scrollLeft: { value: axis === "x" ? scrollOffset : 0, writable: true },
    scrollTop: { value: axis === "y" ? scrollOffset : 0, writable: true },
  })

  const scrollAbs = Math.abs(scrollOffset)

  const children = items.map((item) => {
    const child = document.createElement("div")
    parent.appendChild(child)
    setStyle(child, { "scroll-snap-align": item.align })

    // Visual position of the item's leading edge at the current scroll offset
    let mainStart: number
    if (isRtl) {
      // `start` is measured from the container's right edge
      mainStart = size - (item.start - scrollAbs) - item.size
    } else {
      mainStart = item.start - scrollAbs
    }

    defineRect(child, {
      left: axis === "x" ? mainStart : 0,
      top: axis === "x" ? 0 : mainStart,
      width: axis === "x" ? item.size : crossSize,
      height: axis === "x" ? crossSize : item.size,
    })

    return child
  })

  return { parent, children }
}

beforeEach(() => {
  vi.spyOn(window, "getComputedStyle").mockImplementation((el: Element) => {
    const styles = styleMap.get(el) ?? {}
    return {
      direction: styles.direction ?? "ltr",
      getPropertyValue: (prop: string) => styles[prop] ?? "",
    } as unknown as CSSStyleDeclaration
  })
})

afterEach(() => {
  vi.restoreAllMocks()
  document.body.innerHTML = ""
})

/**
 * Shared geometry: a 200px viewport over 400px of content (four 100px items),
 * so max scroll = 400 - 200 = 200.
 *
 *   content:    0        100       200       300       400
 *               +---------+---------+---------+---------+
 *               | item 0  | item 1  | item 2  | item 3  |
 *               +---------+---------+---------+---------+
 *   viewport:   |<------ 200 ------>|
 *               (shown at scroll = 0; it can slide right by up to 200)
 */
const fourItems = (align: string): ItemSpec[] => [
  { start: 0, size: 100, align },
  { start: 100, size: 100, align },
  { start: 200, size: 100, align },
  { start: 300, size: 100, align },
]

describe("getSnapPositions", () => {
  /**
   * Raw (unscrolled) measurement points, before any viewport math:
   *
   *   0        100       200       300
   *   +---------+---------+---------+
   *   | item 0  | item 1  | item 2  |
   *   +---------+---------+---------+
   *   ^ start=0      ^ center=150   ^ end=300
   */
  it("collects positions per alignment", () => {
    const { parent } = createContainer({
      items: [
        { start: 0, size: 100, align: "start" },
        { start: 100, size: 100, align: "center" },
        { start: 200, size: 100, align: "end" },
      ],
    })

    const positions = getSnapPositions(parent)
    expect(positions.x.start.map((v) => v.position)).toEqual([0])
    expect(positions.x.center.map((v) => v.position)).toEqual([150])
    expect(positions.x.end.map((v) => v.position)).toEqual([300])
  })

  it("skips items with align none", () => {
    const { parent } = createContainer({
      items: [
        { start: 0, size: 100, align: "none" },
        { start: 100, size: 100, align: "start" },
      ],
    })

    const positions = getSnapPositions(parent)
    expect(positions.x.start.map((v) => v.position)).toEqual([100])
    expect(positions.x.center).toEqual([])
    expect(positions.x.end).toEqual([])
  })

  /**
   * RTL flips the reading direction, so offsets are measured from the RIGHT edge:
   *
   *   400       300       200       100        0
   *   +---------+---------+---------+---------+
   *   | item 3  | item 2  | item 1  | item 0  |
   *   +---------+---------+---------+---------+
   *                       |<--- viewport ---->|
   *   item 0 sits at the right edge => start offset 0, item 1 => 100, ...
   */
  it("measures from the right edge in RTL", () => {
    const { parent } = createContainer({ direction: "rtl", items: fourItems("start") })
    const positions = getSnapPositions(parent)
    expect(positions.x.start.map((v) => v.position)).toEqual([0, 100, 200, 300])
  })
})

describe("getScrollSnapPositions", () => {
  /**
   * start: scroll so the item's LEFT edge touches the viewport's left edge.
   * e.g. item 1 => scroll = 100:
   *
   *   +---------+---------+---------+---------+
   *   | item 0  | item 1  | item 2  | item 3  |
   *   +---------+---------+---------+---------+
   *             |<---- viewport --->|
   *             ^ item 1 start (100) at viewport left
   *
   *   raw [0, 100, 200, 300] clamped to max scroll 200 => [0, 100, 200]
   */
  it("returns start positions clamped to max scroll", () => {
    const { parent } = createContainer({ items: fourItems("start") })
    expect(getScrollSnapPositions(parent).x).toEqual([0, 100, 200])
  })

  /**
   * center: scroll so the item's CENTER sits at the viewport's center,
   * i.e. scroll = center - viewport/2. e.g. item 2 (center 250) => 150:
   *
   *   +---------+---------+---------+---------+
   *   | item 0  | item 1  | item 2  | item 3  |
   *   +---------+---------+----^----+---------+
   *                  |<---- viewport --->|
   *                            ^ item 2 center (250) at viewport center
   *
   *   centers [50, 150, 250, 350] - 100 => [-50, 50, 150, 250]
   *   clamped to [0, 200]          => [0, 50, 150, 200]
   */
  it("offsets center positions by half the container size", () => {
    const { parent } = createContainer({ items: fourItems("center") })
    expect(getScrollSnapPositions(parent).x).toEqual([0, 50, 150, 200])
  })

  /**
   * end: scroll so the item's RIGHT edge touches the viewport's right edge,
   * i.e. scroll = end - viewport. e.g. item 2 (end 300) => 100:
   *
   *   +---------+---------+---------+---------+
   *   | item 0  | item 1  | item 2  | item 3  |
   *   +---------+---------+---------+---------+
   *             |<---- viewport --->|
   *                                 ^ item 2 end (300) at viewport right
   *
   *   ends [100, 200, 300, 400] - 200 => [-100, 0, 100, 200]
   *   clamped + deduped              => [0, 100, 200]
   */
  it("offsets end positions by the container size", () => {
    const { parent } = createContainer({ items: fourItems("end") })
    expect(getScrollSnapPositions(parent).x).toEqual([0, 100, 200])
  })

  /**
   * scroll-padding-left insets the snap edge, so the item rests 10px
   * inside the viewport: scroll = start - 10. e.g. item 1 => 90:
   *
   *        |<--------- viewport --------->|
   *   -----+----+---------+---------+-----
   *    ..0 |    | item 1  | item 2  | ...
   *   -----+----+---------+---------+-----
   *        |-10-|
   *        ^ scroll-padding-left keeps item 1 10px inside the viewport
   */
  it("applies scroll padding", () => {
    const { parent } = createContainer({
      items: fourItems("start"),
      padding: { "scroll-padding-left": "10px" },
    })
    expect(getScrollSnapPositions(parent).x).toEqual([0, 90, 190, 200])
  })

  it("resolves percentage scroll padding against the container size", () => {
    const { parent } = createContainer({
      items: fourItems("start"),
      padding: { "scroll-padding-left": "10%" },
    })
    // 10% of 200 = 20
    expect(getScrollSnapPositions(parent).x).toEqual([0, 80, 180, 200])
  })

  /**
   * In RTL, Chrome/Safari scroll from 0 (rightmost) to -maxScroll (leftmost),
   * so each snap position is negated:
   *
   *   +---------+---------+---------+---------+
   *   | item 3  | item 2  | item 1  | item 0  |
   *   +---------+---------+---------+---------+
   *                       |<--- viewport ---->|  scrollLeft =    0
   *             |<--- viewport ---->|            scrollLeft = -100
   *   |<--- viewport ---->|                      scrollLeft = -200
   *
   *   (scrollLeft = 0 here means "negative convention" is detected)
   */
  it("negates positions in RTL with negative scrollLeft behavior", () => {
    const { parent } = createContainer({ direction: "rtl", items: fourItems("start") })
    // negating clamped 0 yields -0, which is equivalent for scrollLeft
    expect(getScrollSnapPositions(parent).x).toEqual([-0, -100, -200])
  })

  it("supports the vertical axis", () => {
    const { parent } = createContainer({ axis: "y", items: fourItems("start") })
    expect(getScrollSnapPositions(parent).y).toEqual([0, 100, 200])
  })
})

describe("findSnapPoint", () => {
  /**
   * findSnapPoint returns the scroll position that snaps a specific item,
   * using the same math as getScrollSnapPositions. For item 2:
   *
   *   +---------+---------+---------+---------+
   *   | item 0  | item 1  | item 2  | item 3  |
   *   +---------+---------+---------+---------+
   *                       |<---- viewport --->|  start:  scroll 200
   *                  |<---- viewport --->|       center: scroll 150
   *             |<---- viewport --->|            end:    scroll 100
   */
  it("returns the start-aligned position of the matching item", () => {
    const { parent, children } = createContainer({ items: fourItems("start") })
    expect(findSnapPoint(parent, "x", (node) => node === children[2])).toBe(200)
  })

  it("offsets center-aligned items by half the container size", () => {
    const { parent, children } = createContainer({ items: fourItems("center") })
    // raw center 250, minus viewport/2 (100)
    expect(findSnapPoint(parent, "x", (node) => node === children[2])).toBe(150)
  })

  it("offsets end-aligned items by the container size", () => {
    const { parent, children } = createContainer({ items: fourItems("end") })
    // raw end 300, minus viewport (200)
    expect(findSnapPoint(parent, "x", (node) => node === children[2])).toBe(100)
  })

  it("applies scroll padding per alignment", () => {
    const start = createContainer({
      items: fourItems("start"),
      padding: { "scroll-padding-left": "10px" },
    })
    expect(findSnapPoint(start.parent, "x", (node) => node === start.children[1])).toBe(90)

    const end = createContainer({
      items: fourItems("end"),
      padding: { "scroll-padding-right": "10px" },
    })
    expect(findSnapPoint(end.parent, "x", (node) => node === end.children[2])).toBe(110)
  })

  /**
   * Edge items can't be centered: the required scroll would fall outside
   * [0, maxScroll], so the position clamps to the nearest reachable value.
   *
   *   +---------+---------+---------+---------+
   *   | item 0  | item 1  | item 2  | item 3  |
   *   +---------+---------+---------+---------+
   *   |<---- viewport --->|                      item 0: wants -50 => 0
   *                       |<---- viewport --->|  item 3: wants 250 => 200
   */
  it("clamps to the scrollable range", () => {
    const { parent, children } = createContainer({ items: fourItems("center") })
    expect(findSnapPoint(parent, "x", (node) => node === children[0])).toBe(0)
    expect(findSnapPoint(parent, "x", (node) => node === children[3])).toBe(200)
  })

  /**
   * Same layout as the RTL diagram above: item 1 sits 100 from the right
   * edge. Chrome/Safari report scrollLeft <= 0, so the result is negated;
   * Firefox reports positive scrollLeft (maxScroll at the right edge), so
   * the result stays positive.
   */
  it("negates positions in RTL with negative scrollLeft behavior", () => {
    const { parent, children } = createContainer({ direction: "rtl", items: fourItems("start") })
    expect(findSnapPoint(parent, "x", (node) => node === children[1])).toBe(-100)
  })

  it("returns positive positions in RTL with positive scrollLeft behavior", () => {
    const { parent, children } = createContainer({
      direction: "rtl",
      scrollOffset: 200,
      items: fourItems("start"),
    })
    expect(findSnapPoint(parent, "x", (node) => node === children[1])).toBe(100)
  })

  it("supports the vertical axis", () => {
    const { parent, children } = createContainer({ axis: "y", items: fourItems("center") })
    expect(findSnapPoint(parent, "y", (node) => node === children[2])).toBe(150)
  })

  it("returns undefined when no item matches", () => {
    const { parent } = createContainer({ items: fourItems("start") })
    expect(findSnapPoint(parent, "x", () => false)).toBeUndefined()
  })

  it.each(["start", "center", "end"] as const)("agrees with getScrollSnapPositions for %s alignment", (align) => {
    const { parent, children } = createContainer({ items: fourItems(align) })
    const positions = getScrollSnapPositions(parent).x

    for (const child of children) {
      const snapPoint = findSnapPoint(parent, "x", (node) => node === child)
      expect(positions).toContain(snapPoint)
    }
  })
})

describe("getSnapPointTarget", () => {
  it("returns the child whose snap position matches the snap point", () => {
    const { parent, children } = createContainer({ items: fourItems("start") })
    expect(getSnapPointTarget(parent, 200)).toBe(children[2])
  })

  it("falls back to the first child when nothing matches", () => {
    const { parent, children } = createContainer({ items: fourItems("start") })
    expect(getSnapPointTarget(parent, 999)).toBe(children[0])
  })
})
