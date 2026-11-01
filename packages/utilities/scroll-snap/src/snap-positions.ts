import { getComputedStyle, getScale } from "@zag-js/dom-query"
import type { ScrollAxis, ScrollSnapAlignment, SnapPositionList } from "./types"
import { clamp, getDirection, getScrollPadding, uniq } from "./utils"

const AXES: ScrollAxis[] = ["x", "y"]
const ALIGNS = ["start", "center", "end"] as const
type Align = (typeof ALIGNS)[number]
const ALIGN_FACTOR: Record<string, number> = { start: 0, center: 0.5, end: 1 }

export function getSnapPositions(parent: HTMLElement, subtree = false): Record<ScrollAxis, SnapPositionList> {
  const parentRect = parent.getBoundingClientRect()
  const isRtl = getDirection(parent) === "rtl"
  // Maps transformed rects (e.g. a dialog's scale() animation) back to layout coordinates
  const scale = getScale(parent)

  const positions: Record<ScrollAxis, SnapPositionList> = {
    x: { start: [], center: [], end: [] },
    y: { start: [], center: [], end: [] },
  }

  for (const child of subtree ? parent.querySelectorAll("*") : parent.children) {
    const rect = child.getBoundingClientRect()
    const style = getComputedStyle(child)
    const [alignY, alignX = alignY] = style.getPropertyValue("scroll-snap-align").split(" ") as ScrollSnapAlignment[]

    for (const axis of AXES) {
      const x = axis === "x"
      const align = x ? alignX : alignY
      const factor = ALIGN_FACTOR[align]
      if (factor === undefined) continue

      // Items outside the cross axis can never scroll into view
      const outside = x
        ? rect.bottom < parentRect.top || rect.top > parentRect.bottom
        : rect.right < parentRect.left || rect.left > parentRect.right
      if (outside) continue

      const s = x ? scale.x : scale.y
      const size = (x ? rect.width : rect.height) / s
      const start =
        x && isRtl
          ? (parentRect.right - rect.right) / s + Math.abs(parent.scrollLeft)
          : (x ? rect.left - parentRect.left : rect.top - parentRect.top) / s +
            (x ? parent.scrollLeft : parent.scrollTop)

      positions[axis][align as Align].push({ node: child, position: start + size * factor })
    }
  }

  return positions
}

type ResolvedSnapPosition = { node: Element; position: number }

function resolveScrollSnapPositions(element: HTMLElement): Record<ScrollAxis, ResolvedSnapPosition[]> {
  const isRtl = getDirection(element) === "rtl"
  const padding = getScrollPadding(element)
  const snapPositions = getSnapPositions(element)
  // Chrome/Safari use negative scrollLeft in RTL
  const negate = isRtl && element.scrollLeft <= 0

  const resolve = (axis: ScrollAxis) => {
    const x = axis === "x"
    const size = x ? element.offsetWidth : element.offsetHeight
    const max = (x ? element.scrollWidth : element.scrollHeight) - size
    // RTL offsets run from the right edge, so the padding sides swap
    const before = x ? padding.x[isRtl ? "after" : "before"] : padding.y.before
    const after = x ? padding.x[isRtl ? "before" : "after"] : padding.y.after

    return ALIGNS.flatMap((align) =>
      snapPositions[axis][align].map((v) => {
        const offset = align === "start" ? before : align === "center" ? size / 2 : size - after
        const position = clamp(v.position - offset, max)
        return { ...v, position: x && negate ? -position : position }
      }),
    )
  }

  return { x: resolve("x"), y: resolve("y") }
}

export function getScrollSnapPositions(element: HTMLElement): Record<ScrollAxis, number[]> {
  const { x, y } = resolveScrollSnapPositions(element)
  return { x: uniq(x.map((v) => v.position)), y: uniq(y.map((v) => v.position)) }
}

export function findSnapPoint(
  parent: HTMLElement,
  axis: ScrollAxis,
  predicate: (node: HTMLElement) => boolean,
): number | undefined {
  return resolveScrollSnapPositions(parent)[axis].find((v) => predicate(v.node as HTMLElement))?.position
}

export function getSnapPointTarget(parent: HTMLElement, snapPoint: number): HTMLElement {
  const rect = parent.getBoundingClientRect()
  const scale = getScale(parent)
  const padding = getScrollPadding(parent)
  const children = Array.from(parent.children) as HTMLElement[]

  const matches = (start: number, size: number, viewport: number, before: number, after: number) =>
    [start - before, start + size / 2 - viewport / 2, start + size - viewport + after].some(
      (pos) => Math.abs(pos - snapPoint) < 1,
    )

  return (
    children.find((child) => {
      const r = child.getBoundingClientRect()
      return (
        matches(
          (r.left - rect.left) / scale.x + parent.scrollLeft,
          r.width / scale.x,
          parent.offsetWidth,
          padding.x.before,
          padding.x.after,
        ) ||
        matches(
          (r.top - rect.top) / scale.y + parent.scrollTop,
          r.height / scale.y,
          parent.offsetHeight,
          padding.y.before,
          padding.y.after,
        )
      )
    }) ?? children[0]
  )
}
