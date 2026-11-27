import { getComputedStyle } from "../computed-style"
import { isHTMLElement } from "../node"
import { AnimationFrame } from "../raf"
import { canScrollAxis, getNearestOverflowAncestor, isOverflowElement } from "./overflow"

export interface AutoScrollOptions {
  /**
   * How close to an edge, in px, the pointer starts scrolling toward it
   */
  threshold: number
  /**
   * The fastest it scrolls, in px per 60Hz frame, reached at the edge itself. It covers the same distance per
   * second at any frame rate.
   * @default 4
   */
  maxSpeed?: number | undefined
  /**
   * Called after each frame that scrolled
   */
  onScroll?: VoidFunction | undefined
}

export interface AutoScroll {
  /**
   * Reports the pointer's position in client coordinates
   */
  move: (x: number, y: number) => void
  stop: VoidFunction
}

type Input = { type: "MOVE"; x: number; y: number } | { type: "STOP" }

/**
 * Scrolls a container while a dragged pointer is near its edges, faster the closer it gets. Uses `el` when it
 * scrolls, else a scrolling child, else the nearest scrolling ancestor. Returns `null` when nothing can scroll.
 */
export function createAutoScroll(el: HTMLElement, options: AutoScrollOptions): AutoScroll | null {
  const scroller = findScroller(el)
  if (!scroller) return null

  const canScrollX = canScrollAxis(scroller, "x")
  const canScrollY = canScrollAxis(scroller, "y")
  if (!canScrollX && !canScrollY) return null

  const { threshold, maxSpeed = 4, onScroll } = options
  const frame = AnimationFrame.create()

  /* -----------------------------------------------------------------------------
   * State
   * -----------------------------------------------------------------------------*/

  const state = {
    phase: "idle" as "idle" | "scrolling",
    dx: 0,
    dy: 0,
    lastTime: 0,
    // browsers drop sub-pixel scrolls
    carryX: 0,
    carryY: 0,
  }

  /* -----------------------------------------------------------------------------
   * Transitions
   * -----------------------------------------------------------------------------*/

  function send(input: Input) {
    switch (input.type) {
      case "MOVE": {
        const box = scroller!.getBoundingClientRect()
        state.dx = canScrollX ? getEdgeSpeed(input.x - box.left, box.width, threshold, maxSpeed) : 0
        state.dy = canScrollY ? getEdgeSpeed(input.y - box.top, box.height, threshold, maxSpeed) : 0

        const moving = state.dx !== 0 || state.dy !== 0
        if (!moving) return send({ type: "STOP" })
        if (state.phase === "idle") {
          state.phase = "scrolling"
          state.lastTime = performance.now()
          frame.request(tick)
        }
        return
      }

      case "STOP":
        state.phase = "idle"
        frame.cancel()
        return
    }
  }

  /* -----------------------------------------------------------------------------
   * Steps
   * -----------------------------------------------------------------------------*/

  function tick() {
    if (state.phase !== "scrolling") return

    const now = performance.now()
    const frames = Math.min((now - state.lastTime) / FRAME_MS, 4)
    state.lastTime = now

    if (!canMove(state.dx, "x") && !canMove(state.dy, "y")) return send({ type: "STOP" })

    const x = state.carryX + state.dx * frames
    const y = state.carryY + state.dy * frames
    state.carryX = x - Math.trunc(x)
    state.carryY = y - Math.trunc(y)

    const { scrollLeft, scrollTop } = scroller!
    scroller!.scrollLeft += Math.trunc(x)
    scroller!.scrollTop += Math.trunc(y)
    if (scroller!.scrollLeft !== scrollLeft || scroller!.scrollTop !== scrollTop) onScroll?.()

    frame.request(tick)
  }

  // in RTL, scrollLeft runs from -max to 0
  function canMove(speed: number, axis: "x" | "y") {
    if (speed === 0) return false
    if (axis === "y") {
      const max = scroller!.scrollHeight - scroller!.clientHeight
      return speed > 0 ? scroller!.scrollTop < max - 0.5 : scroller!.scrollTop > 0.5
    }
    const range = scroller!.scrollWidth - scroller!.clientWidth
    const [min, max] = getComputedStyle(scroller!).direction === "rtl" ? [-range, 0] : [0, range]
    return speed > 0 ? scroller!.scrollLeft < max - 0.5 : scroller!.scrollLeft > min + 0.5
  }

  return {
    move: (x, y) => send({ type: "MOVE", x, y }),
    stop: () => send({ type: "STOP" }),
  }
}

// one 60Hz frame, the unit `maxSpeed` is written in
const FRAME_MS = 1000 / 60

// signed px per frame: negative near the start edge, positive near the end, ramping up to `max` at the edge.
// Outside the box it doesn't scroll, and the bands never take more than a third of it each.
function getEdgeSpeed(position: number, size: number, threshold: number, max: number) {
  if (position < 0 || position > size) return 0
  const band = Math.min(threshold, size / 3)
  if (band <= 0) return 0
  if (position < band) return -max * ((band - position) / band)
  if (position > size - band) return max * ((position - (size - band)) / band)
  return 0
}

function findScroller(el: HTMLElement): HTMLElement | null {
  if (isOverflowElement(el)) return el

  for (const child of el.children) {
    if (isHTMLElement(child) && isOverflowElement(child)) return child
  }

  const ancestor = getNearestOverflowAncestor(el)
  if (ancestor && ancestor !== el.ownerDocument.body) return ancestor

  return null
}
