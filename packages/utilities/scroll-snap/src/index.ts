// Modified from https://github.com/LachlanArthur/scroll-snap-api
// MIT License

import { getComputedStyle } from "@zag-js/dom-query"

export type ScrollAxis = "x" | "y"

export type ScrollDirection = "left" | "right" | "up" | "down"

export type ScrollSnapAlignment = "start" | "end" | "center" | "none"

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
    return n
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

  const positions: Record<ScrollAxis, SnapPositionList> = {
    x: { start: [], center: [], end: [] },
    y: { start: [], center: [], end: [] },
  }

  const children = subtree ? getDescendants(parent) : parent.children

  for (const axis of ["x", "y"] as ScrollAxis[]) {
    const orthogonalAxis = axis === "x" ? "y" : "x"
    const axisStart = axis === "x" ? "left" : "top"
    const axisSize = axis === "x" ? "width" : "height"
    const axisScroll = axis === "x" ? "scrollLeft" : "scrollTop"

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
      const childOffsetStart = childRect[axisStart] - parentRect[axisStart] + parent[axisScroll]

      switch (childAlign) {
        case "none":
          break

        case "start":
          positions[axis].start.push({ node: child, position: childOffsetStart })
          break

        case "center":
          positions[axis].center.push({ node: child, position: childOffsetStart + childRect[axisSize] / 2 })
          break

        case "end":
          positions[axis].end.push({ node: child, position: childOffsetStart + childRect[axisSize] })
          break
      }
    }
  }

  return positions
}

export function getScrollSnapPositions(element: HTMLElement): Record<ScrollAxis, number[]> {
  const rect = element.getBoundingClientRect()
  const scrollPadding = getScrollPadding(element)
  const snapPositions = getSnapPositions(element)

  const maxScroll = {
    x: element.scrollWidth - element.offsetWidth,
    y: element.scrollHeight - element.offsetHeight,
  }

  return {
    x: uniq(
      [
        ...snapPositions.x.start.map((v) => v.position - scrollPadding.x.before),
        ...snapPositions.x.center.map((v) => v.position - rect.width / 2),
        ...snapPositions.x.end.map((v) => v.position - rect.width + scrollPadding.x.after),
      ].map(clamp(0, maxScroll.x)),
    ),

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
  const snapPositions = getSnapPositions(parent)
  const items = [...snapPositions[axis].start, ...snapPositions[axis].center, ...snapPositions[axis].end]
  for (const item of items) {
    if (predicate(item.node as HTMLElement)) {
      return item.position
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
