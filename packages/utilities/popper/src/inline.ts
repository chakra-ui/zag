import type { Middleware } from "@floating-ui/dom"

export interface RectLike {
  x: number
  y: number
  left: number
  top: number
  right: number
  bottom: number
  width: number
  height: number
}

export interface InlineRectCoords {
  x: number
  y: number
  /** The line under the pointer when the coords were captured. */
  lineIndex?: number | undefined
  /** The element these coords were captured on. */
  element: Element
}

interface ClientRectsReference {
  getClientRects(): ArrayLike<RectLike>
}

function createRect(left: number, top: number, right: number, bottom: number): RectLike {
  return { x: left, y: top, left, top, right, bottom, width: right - left, height: bottom - top }
}

/** A rect starts a new line once its top clears half the previous rect's height. */
export function getLineRects(rects: ArrayLike<RectLike>): { lines: RectLike[]; fallback: RectLike } {
  const lines: RectLike[] = []
  let prev: RectLike | undefined
  let left = Number.POSITIVE_INFINITY
  let top = Number.POSITIVE_INFINITY
  let right = Number.NEGATIVE_INFINITY
  let bottom = Number.NEGATIVE_INFINITY

  for (const rect of Array.from(rects).sort((a, b) => a.top - b.top)) {
    left = Math.min(left, rect.left)
    top = Math.min(top, rect.top)
    right = Math.max(right, rect.right)
    bottom = Math.max(bottom, rect.bottom)

    if (!prev || rect.top - prev.top > prev.height / 2) {
      lines.push(createRect(rect.left, rect.top, rect.right, rect.bottom))
    } else {
      const line = lines[lines.length - 1]
      lines[lines.length - 1] = createRect(
        Math.min(line.left, rect.left),
        line.top,
        Math.max(line.right, rect.right),
        Math.max(line.bottom, rect.bottom),
      )
    }

    prev = rect
  }

  return { lines, fallback: createRect(left, top, right, bottom) }
}

/** A pointer event's client coords can sit up to 2px outside the rect that fired it. */
const DEFAULT_PADDING = 2

export function findLineIndex(lines: RectLike[], x: number, y: number, padding = DEFAULT_PADDING): number {
  return lines.findIndex(
    (line) =>
      x > line.left - padding && x < line.right + padding && y > line.top - padding && y < line.bottom + padding,
  )
}

export interface InlineRectCoordsOptions {
  element: Element
  x: number
  y: number
  /** Pre-measured lines, to avoid a layout read per pointer move. */
  lines?: RectLike[] | undefined
  /** @default 2 */
  padding?: number | undefined
}

/** Capture the line under the pointer. `undefined` when the reference occupies a single line. */
export function getInlineRectCoords(options: InlineRectCoordsOptions): InlineRectCoords | undefined {
  const { element, x, y, padding } = options
  const lines = options.lines ?? getLineRects(element.getClientRects()).lines
  if (lines.length < 2) return undefined
  const lineIndex = findLineIndex(lines, x, y, padding)
  return { x, y, lineIndex: lineIndex === -1 ? undefined : lineIndex, element }
}

export interface InlineReferenceRectOptions {
  reference: ClientRectsReference
  placement: string
  coords: InlineRectCoords | undefined
  /** @default 2 */
  padding?: number | undefined
}

export function getInlineReferenceRect(options: InlineReferenceRectOptions): RectLike | null {
  const { reference, placement, coords, padding } = options
  const { lines, fallback } = getLineRects(reference.getClientRects())
  if (lines.length < 2) return null

  // The captured line wins, so a reflow cannot move the anchor.
  if (coords?.lineIndex != null && lines[coords.lineIndex]) {
    return lines[coords.lineIndex]
  }

  const { x, y } = coords ?? {}
  if (x != null && y != null) {
    const lineIndex = findLineIndex(lines, x, y, padding)
    if (lineIndex !== -1) return lines[lineIndex]
    // Disjoint lines, pointer in neither: span both.
    if (lines.length === 2 && lines[0].left > lines[1].right) return fallback
  }

  const side = placement[0]

  if (side === "t" || side === "b") {
    const first = lines[0]
    const last = lines[lines.length - 1]
    const target = side === "t" ? first : last
    return createRect(target.left, first.top, target.right, last.bottom)
  }

  // Side placements anchor to the line reaching furthest towards that side.
  const isLeft = side === "l"
  let left = lines[0].left
  let right = lines[0].right
  let edge = isLeft ? Number.POSITIVE_INFINITY : Number.NEGATIVE_INFINITY
  let first = lines[0]
  let last = lines[0]

  for (const line of lines) {
    left = Math.min(left, line.left)
    right = Math.max(right, line.right)

    const nextEdge = isLeft ? line.left : line.right
    if (isLeft ? nextEdge < edge : nextEdge > edge) {
      edge = nextEdge
      first = line
      last = line
    } else if (nextEdge === edge) {
      last = line
    }
  }

  return createRect(left, first.top, right, last.bottom)
}

function getContextElement(reference: any): Element | undefined {
  return reference?.contextElement ?? (typeof reference?.tagName === "string" ? reference : undefined)
}

export interface InlineOptions {
  getCoords: () => InlineRectCoords | undefined
  /** Must match the padding used to capture. @default 2 */
  padding?: number | undefined
}

/**
 * Anchors to the line under the pointer when the reference wraps. Floating UI's own `inline()`
 * consults the pointer only for two disjoint rects, spanning first-to-last line otherwise.
 */
export function inline(options: InlineOptions): Middleware {
  const { getCoords, padding } = options
  return {
    name: "inline",
    async fn(state) {
      const { elements, platform, placement, rects, strategy } = state

      const reference = elements.reference as any
      if (typeof reference?.getClientRects !== "function") return {}

      const coords = getCoords()
      const contextElement = getContextElement(reference)
      // Another trigger's coords say nothing about this one.
      const current = coords?.element === reference || coords?.element === contextElement ? coords : undefined

      const rect = getInlineReferenceRect({ reference, placement, coords: current, padding })
      if (!rect) return {}

      // Through the platform, so the viewport rect lands in the floating element's space.
      const resetRects = await platform.getElementRects({
        reference: { getBoundingClientRect: () => rect } as any,
        floating: elements.floating,
        strategy,
      })

      const prev = rects.reference
      const next = resetRects.reference
      const unchanged =
        prev.x === next.x && prev.y === next.y && prev.width === next.width && prev.height === next.height

      // Terminates the reset loop: the second pass matches.
      return unchanged ? {} : { reset: { rects: resetRects } }
    },
  }
}
