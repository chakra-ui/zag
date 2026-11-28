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
   * The speed at the edge itself, in px per 60Hz frame. Past the edge it keeps rising, up to 3 times this. It covers
   * the same distance per second at any frame rate.
   * @default 6
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

  const { threshold, maxSpeed = 6, onScroll } = options
  const frame = AnimationFrame.create()

  /* -----------------------------------------------------------------------------
   * State
   * -----------------------------------------------------------------------------*/

  const state = {
    phase: "idle" as "idle" | "scrolling",
    // the speed the pointer asks for, and the eased speed actually used
    targetX: 0,
    targetY: 0,
    speedX: 0,
    speedY: 0,
    startTime: 0,
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
        const x = input.x - box.left
        const y = input.y - box.top

        // past an edge keeps scrolling while roughly level with the box, so dragging into a neighbor doesn't
        const levelX = x >= -threshold && x <= box.width + threshold
        const levelY = y >= -threshold && y <= box.height + threshold
        state.targetX = canScrollX && levelY ? getEdgeSpeed(x, box.width, threshold, maxSpeed) : 0
        state.targetY = canScrollY && levelX ? getEdgeSpeed(y, box.height, threshold, maxSpeed) : 0

        const moving = state.targetX !== 0 || state.targetY !== 0
        if (!moving) return send({ type: "STOP" })
        if (state.phase === "idle") begin()
        return
      }

      case "STOP":
        state.phase = "idle"
        state.speedX = 0
        state.speedY = 0
        frame.cancel()
        return
    }
  }

  /* -----------------------------------------------------------------------------
   * Steps
   * -----------------------------------------------------------------------------*/

  function begin() {
    state.phase = "scrolling"
    state.startTime = performance.now()
    state.lastTime = state.startTime
    frame.request(tick)
  }

  function tick() {
    if (state.phase !== "scrolling") return

    const now = performance.now()
    const elapsed = now - state.lastTime
    const frames = Math.min(elapsed / FRAME_MS, 4)
    state.lastTime = now

    if (!canMove(state.targetX, "x") && !canMove(state.targetY, "y")) return send({ type: "STOP" })

    // ease toward the pointer's speed, and ramp up after entering an edge so brushing past it barely scrolls
    const ease = 1 - Math.exp(-elapsed / EASE_MS)
    state.speedX += (state.targetX - state.speedX) * ease
    state.speedY += (state.targetY - state.speedY) * ease
    const ramp = Math.min((now - state.startTime) / RAMP_MS, 1) ** 2

    const x = state.carryX + state.speedX * ramp * frames
    const y = state.carryY + state.speedY * ramp * frames
    state.carryX = x - Math.trunc(x)
    state.carryY = y - Math.trunc(y)

    const { scrollLeft, scrollTop } = scroller!
    scroller!.scrollLeft += Math.trunc(x)
    scroller!.scrollTop += Math.trunc(y)
    if (scroller!.scrollLeft !== scrollLeft || scroller!.scrollTop !== scrollTop) onScroll?.()

    frame.request(tick)
  }

  // when the axis starts at its far end (RTL, or a reversed flex direction), the position runs from -max to 0
  function canMove(speed: number, axis: "x" | "y") {
    if (speed === 0) return false
    const position = axis === "y" ? scroller!.scrollTop : scroller!.scrollLeft
    const range =
      axis === "y" ? scroller!.scrollHeight - scroller!.clientHeight : scroller!.scrollWidth - scroller!.clientWidth
    const [min, max] = startsAtEnd(scroller!, axis) ? [-range, 0] : [0, range]
    return speed > 0 ? position < max - 0.5 : position > min + 0.5
  }

  return {
    move: (x, y) => send({ type: "MOVE", x, y }),
    stop: () => send({ type: "STOP" }),
  }
}

// one 60Hz frame, the unit `maxSpeed` is written in
const FRAME_MS = 1000 / 60
// how long it takes to reach full speed after entering an edge
const RAMP_MS = 300
// how quickly the speed follows the pointer
const EASE_MS = 80
// the top speed, as a multiple of `maxSpeed`, reached a band's width past the edge
const PAST_EDGE_BOOST = 3

function startsAtEnd(el: HTMLElement, axis: "x" | "y") {
  const { direction, flexDirection, display } = getComputedStyle(el)
  const flex = display.includes("flex")
  if (axis === "y") return flex && flexDirection === "column-reverse"
  // RTL and row-reverse each flip the horizontal origin; together they cancel out
  return (direction === "rtl") !== (flex && flexDirection === "row-reverse")
}

// signed px per frame: negative near the start edge, positive near the end. It ramps up to `max` at the edge, then
// keeps rising past it to `PAST_EDGE_BOOST` times that a band's width out. The bands never take more than a third of
// the box each.
function getEdgeSpeed(position: number, size: number, threshold: number, max: number) {
  const band = Math.min(threshold, size / 3)
  if (band <= 0) return 0
  if (position < 0) return -getPastEdgeSpeed(-position, band, max)
  if (position > size) return getPastEdgeSpeed(position - size, band, max)
  if (position < band) return -max * ((band - position) / band)
  if (position > size - band) return max * ((position - (size - band)) / band)
  return 0
}

function getPastEdgeSpeed(distance: number, band: number, max: number) {
  const progress = Math.min(distance / band, 1)
  return max * (1 + (PAST_EDGE_BOOST - 1) * progress)
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
