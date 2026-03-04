// Modified from https://github.com/LachlanArthur/scroll-snap-api
// MIT License

import { getComputedStyle } from "@zag-js/dom-query"

export type ScrollAxis = "x" | "y"

export type ScrollDirection = "left" | "right" | "up" | "down"

export type ScrollSnapAlignment = "start" | "end" | "center" | "none"

type Direction = "ltr" | "rtl"

const getDirection = (element: HTMLElement) => getComputedStyle(element).direction as Direction

function getScrollPadding(element: HTMLElement): Record<ScrollAxis, { before: number; after: number }> {
  const style = getComputedStyle(element)
  const rect = element.getBoundingClientRect()

  let xBeforeRaw = style.getPropertyValue("scroll-padding-left").replace("auto", "0px")
  let yBeforeRaw = style.getPropertyValue("scroll-padding-top").replace("auto", "0px")
  let xAfterRaw = style.getPropertyValue("scroll-padding-right").replace("auto", "0px")
  let yAfterRaw = style.getPropertyValue("scroll-padding-bottom").replace("auto", "0px")

  function convert(raw: string, size: number): number {
    let n = parseFloat(raw)
    if (/%/.test(raw)) {
      n /= 100
      n *= size
    }
    return Number.isNaN(n) ? 0 : n
  }

  let xBefore = convert(xBeforeRaw, rect.width)
  let yBefore = convert(yBeforeRaw, rect.height)
  let xAfter = convert(xAfterRaw, rect.width)
  let yAfter = convert(yAfterRaw, rect.height)

  return {
    x: { before: xBefore, after: xAfter },
    y: { before: yBefore, after: yAfter },
  }
}

function isRectIntersecting(a: DOMRect, b: DOMRect, axis: ScrollAxis | "both" = "both"): boolean {
  return (
    (axis === "x" && a.right >= b.left && a.left <= b.right) ||
    (axis === "y" && a.bottom >= b.top && a.top <= b.bottom) ||
    (axis === "both" && a.right >= b.left && a.left <= b.right && a.bottom >= b.top && a.top <= b.bottom)
  )
}

function getDescendants(parent: HTMLElement): HTMLElement[] {
  let children: HTMLElement[] = []
  for (const child of parent.children) {
    children = children.concat(child as HTMLElement, getDescendants(child as HTMLElement))
  }
  return children
}

export type SnapPositionList = Record<Exclude<ScrollSnapAlignment, "none">, Array<{ node: Element; position: number }>>

export function getSnapPositions(parent: HTMLElement, subtree = false): Record<ScrollAxis, SnapPositionList> {
  const parentRect = parent.getBoundingClientRect()
  const dir = getDirection(parent)
  const isRtl = dir === "rtl"

  const positions: Record<ScrollAxis, SnapPositionList> = {
    x: { start: [], center: [], end: [] },
    y: { start: [], center: [], end: [] },
  }

  const children = subtree ? getDescendants(parent) : parent.children

  for (const axis of ["x", "y"] as ScrollAxis[]) {
    const orthogonalAxis = axis === "x" ? "y" : "x"
    const axisStart = axis === "x" ? "left" : "top"
    const axisEnd = axis === "x" ? "right" : "bottom"
    const axisSize = axis === "x" ? "width" : "height"
    const axisScroll = axis === "x" ? "scrollLeft" : "scrollTop"

    // In RTL mode (for x-axis), we use right edge as the reference
    const useRtlCalc = isRtl && axis === "x"

    for (const child of children) {
      const childRect = child.getBoundingClientRect()

      // Skip child if it doesn't intersect the parent's opposite axis (it can never be in view)
      if (!isRectIntersecting(parentRect, childRect, orthogonalAxis)) {
        continue
      }

      const childStyle = getComputedStyle(child)

      let [childAlignY, childAlignX] = childStyle
        .getPropertyValue("scroll-snap-align")
        .split(" ") as ScrollSnapAlignment[]

      if (typeof childAlignX === "undefined") {
        childAlignX = childAlignY
      }

      const childAlign = axis === "x" ? childAlignX : childAlignY

      // For LTR (or vertical axis): use left/top edge offset
      // For RTL horizontal: use right edge offset from container's right edge
      let childOffsetStart: number
      let childOffsetEnd: number
      let childOffsetCenter: number

      if (useRtlCalc) {
        // RTL: Calculate offset from the right edge (inline-start in RTL)
        // parentRect.right - childRect.right gives visual offset from container's right edge
        // We add Math.abs(scrollLeft) because in RTL Chrome, scrollLeft is negative
        const scrollOffset = Math.abs(parent[axisScroll])
        const rightOffset = parentRect[axisEnd] - childRect[axisEnd] + scrollOffset
        childOffsetStart = rightOffset // "start" in RTL = right edge
        childOffsetEnd = rightOffset + childRect[axisSize] // "end" in RTL = left edge
        childOffsetCenter = rightOffset + childRect[axisSize] / 2
      } else {
        // LTR: Standard calculation from left/top edge
        childOffsetStart = childRect[axisStart] - parentRect[axisStart] + parent[axisScroll]
        childOffsetEnd = childOffsetStart + childRect[axisSize]
        childOffsetCenter = childOffsetStart + childRect[axisSize] / 2
      }

      switch (childAlign) {
        case "none":
          break

        case "start":
          positions[axis].start.push({ node: child, position: childOffsetStart })
          break

        case "center":
          positions[axis].center.push({ node: child, position: childOffsetCenter })
          break

        case "end":
          positions[axis].end.push({ node: child, position: childOffsetEnd })
          break
      }
    }
  }

  return positions
}

export function getScrollSnapPositions(element: HTMLElement): Record<ScrollAxis, number[]> {
  const dir = getDirection(element)
  const rect = element.getBoundingClientRect()
  const scrollPadding = getScrollPadding(element)
  const snapPositions = getSnapPositions(element)

  const maxScroll = {
    x: element.scrollWidth - element.offsetWidth,
    y: element.scrollHeight - element.offsetHeight,
  }

  const isRtl = dir === "rtl"
  // In RTL mode, Chrome/Safari use negative scrollLeft values (0 to -maxScroll)
  // Firefox uses positive values (maxScroll to 0)
  // We detect which browser behavior we're dealing with
  const usesNegativeScrollLeft = isRtl && element.scrollLeft <= 0

  let xPositions: number[]

  if (isRtl) {
    // In RTL, snap positions are calculated from the right edge (inline-start)
    // For "start" alignment: position is the offset from right edge
    // For "center" alignment: position is offset + half container width
    // For "end" alignment: position is offset + container width (left edge aligns with container left)
    xPositions = uniq(
      [
        ...snapPositions.x.start.map((v) => v.position - scrollPadding.x.after),
        ...snapPositions.x.center.map((v) => v.position - rect.width / 2),
        ...snapPositions.x.end.map((v) => v.position - rect.width + scrollPadding.x.before),
      ].map(clamp(0, maxScroll.x)),
    )

    // Chrome/Safari use negative scrollLeft in RTL
    if (usesNegativeScrollLeft) {
      xPositions = xPositions.map((pos) => -pos)
    }
  } else {
    // LTR: Standard calculation
    xPositions = uniq(
      [
        ...snapPositions.x.start.map((v) => v.position - scrollPadding.x.before),
        ...snapPositions.x.center.map((v) => v.position - rect.width / 2),
        ...snapPositions.x.end.map((v) => v.position - rect.width + scrollPadding.x.after),
      ].map(clamp(0, maxScroll.x)),
    )
  }

  return {
    x: xPositions,

    y: uniq(
      [
        ...snapPositions.y.start.map((v) => v.position - scrollPadding.y.before),
        ...snapPositions.y.center.map((v) => v.position - rect.height / 2),
        ...snapPositions.y.end.map((v) => v.position - rect.height + scrollPadding.y.after),
      ].map(clamp(0, maxScroll.y)),
    ),
  }
}

export function findSnapPoint(
  parent: HTMLElement,
  axis: ScrollAxis,
  predicate: (node: HTMLElement) => boolean,
): number | undefined {
  const dir = getDirection(parent)
  const scrollPadding = getScrollPadding(parent)
  const snapPositions = getSnapPositions(parent)
  const items = [...snapPositions[axis].start, ...snapPositions[axis].center, ...snapPositions[axis].end]

  const isRtl = dir === "rtl"
  const usesNegativeScrollLeft = isRtl && axis === "x" && parent.scrollLeft <= 0

  for (const item of items) {
    if (predicate(item.node as HTMLElement)) {
      // Apply the same transformation as getScrollSnapPositions
      let position: number

      if (axis === "x" && isRtl) {
        // RTL horizontal: use right-edge based calculation
        position = item.position - scrollPadding.x.after
        if (usesNegativeScrollLeft) {
          position = -position
        }
      } else {
        // LTR or vertical: standard calculation
        position = item.position - (axis === "x" ? scrollPadding.x.before : scrollPadding.y.before)
      }

      return position
    }
  }
}

export function getSnapPointTarget(parent: HTMLElement, snapPoint: number): HTMLElement {
  const rect = parent.getBoundingClientRect()
  const scrollPadding = getScrollPadding(parent)
  const children = Array.from(parent.children) as HTMLElement[]

  for (const child of children) {
    const childRect = child.getBoundingClientRect()
    const childOffsetStart = {
      x: childRect.left - rect.left + parent.scrollLeft,
      y: childRect.top - rect.top + parent.scrollTop,
    }

    // Check if any of the child's snap positions match the target snapPoint
    const matchesX = [
      childOffsetStart.x - scrollPadding.x.before, // start
      childOffsetStart.x + childRect.width / 2 - rect.width / 2, // center
      childOffsetStart.x + childRect.width - rect.width + scrollPadding.x.after, // end
    ].some((pos) => Math.abs(pos - snapPoint) < 1)

    const matchesY = [
      childOffsetStart.y - scrollPadding.y.before,
      childOffsetStart.y + childRect.height / 2 - rect.height / 2,
      childOffsetStart.y + childRect.height - rect.height + scrollPadding.y.after,
    ].some((pos) => Math.abs(pos - snapPoint) < 1)

    if (matchesX || matchesY) {
      return child
    }
  }

  // If no match found, return first child
  return children[0]
}

const uniq = <T>(arr: T[]): T[] => [...new Set(arr)]
const clamp = (min: number, max: number) => (value: number) => Math.max(min, Math.min(max, value))
