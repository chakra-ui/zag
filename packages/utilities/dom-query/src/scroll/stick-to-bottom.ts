import { addGlobalEvent } from "../global-event"
import { createSharedMutationObserver } from "../mutation-observer"
import { getDocument, isEditableElement } from "../node"
import { AnimationFrame } from "../raf"
import { resizeObserverBorderBox } from "../resize-observer"
import { hasSelectionWithin } from "../text-selection"

export interface StickToBottomDetails {
  /**
   * Whether it keeps the end in view as content grows
   */
  following: boolean
  /**
   * Whether the scroller is at its end, within `threshold`
   */
  atBottom: boolean
  /**
   * Whether content grew below the view while it wasn't following
   */
  unseen: boolean
}

export interface TrackStickToBottomOptions {
  /**
   * The element that holds the rows, when it isn't the scroller itself
   */
  content?: HTMLElement | null | undefined
  /**
   * How close to the end, in px, still counts as at the end
   * @default 24
   */
  threshold?: number | undefined
  /**
   * Whether to start at the end, following
   * @default true
   */
  initial?: boolean | undefined
  /**
   * Whether to keep the rows in view still while content above them changes. Turn it off when the host does its
   * own scroll anchoring, like a virtualizer.
   * @default true
   */
  anchor?: boolean | undefined
  /**
   * Called with the starting state, then whenever `following`, `atBottom` or `unseen` changes
   */
  onChange?: ((details: StickToBottomDetails) => void) | undefined
}

export interface StickToBottom {
  /**
   * Scrolls to the end and follows again
   */
  scrollToBottom: (options?: { behavior?: ScrollBehavior | undefined }) => void
  getState: () => StickToBottomDetails
  cleanup: VoidFunction
}

/**
 * - `following`: at the end, keeping it in view
 * - `catchingUp`: easing to the end frame by frame, then following
 * - `reading`: the user scrolled away; the rows in view stay still
 */
type Phase = "following" | "catchingUp" | "reading"

type Input =
  | { type: "SCROLL" }
  | { type: "INTENT_UP" }
  | { type: "GROW" }
  | { type: "SCROLL_TO_BOTTOM"; behavior: ScrollBehavior }
  | { type: "FRAME"; time: number }

const UP_KEYS = new Set(["ArrowUp", "PageUp", "Home"])

// how quickly a catch-up closes the remaining distance; about 95% in 250ms
const CATCH_UP_MS = 80

const childListObserver = /* @__PURE__ */ createSharedMutationObserver({ childList: true })

/**
 * Keeps a growing scroller's end in view, like a chat streaming a reply or a build log. Scrolling away from the end,
 * by wheel, touch, keys or the scrollbar, stops it so the user can read, and `unseen` says more arrived below.
 */
export function trackStickToBottom(scroller: HTMLElement, options: TrackStickToBottomOptions = {}): StickToBottom {
  const { threshold = 24, initial = true, anchor = true, onChange } = options
  const content = options.content ?? scroller
  const doc = getDocument(scroller)
  const frame = AnimationFrame.create()

  /* -----------------------------------------------------------------------------
   * State
   * -----------------------------------------------------------------------------*/

  const state = {
    phase: (initial ? "following" : "reading") as Phase,
    atBottom: false,
    unseen: false,
    lastTop: scroller.scrollTop,
    lastHeight: scroller.scrollHeight,
    behind: 0,
    // our last write, so its scroll event isn't read as the user's
    ownTop: null as number | null,
    pin: null as { row: Element; top: number } | null,
    pointerDown: false,
    lastFrame: 0,
  }

  const distanceToBottom = () => scroller.scrollHeight - scroller.scrollTop - scroller.clientHeight
  const canScroll = () => scroller.scrollHeight > scroller.clientHeight

  const getState = (): StickToBottomDetails => ({
    following: state.phase !== "reading",
    atBottom: state.atBottom,
    unseen: state.unseen,
  })

  /* -----------------------------------------------------------------------------
   * Transitions: every input goes through here
   * -----------------------------------------------------------------------------*/

  function send(input: Input) {
    const before = getState()

    switch (input.type) {
      case "SCROLL": {
        const top = scroller.scrollTop
        const ours = state.ownTop != null && Math.abs(top - state.ownTop) <= 1
        // a height change means content moved the view, not the user
        const resized = scroller.scrollHeight !== state.lastHeight
        const movedAway = !resized && top < state.lastTop && distanceToBottom() > 1

        if (ours) state.ownTop = null
        else if (movedAway) read()
        else if (distanceToBottom() <= threshold && state.phase === "reading") arrive()

        state.lastTop = top
        break
      }

      case "INTENT_UP":
        if (canScroll()) read()
        break

      case "GROW": {
        // the user may have scrolled this frame, before its scroll event fired
        const top = scroller.scrollTop
        const gapBefore = state.lastHeight - top - scroller.clientHeight
        // a host that anchors also moves the view when rows land above
        const arrived = anchor && top > state.lastTop && gapBefore <= threshold
        const leftEnd = top < state.lastTop - 1 && gapBefore > 1 && distanceToBottom() > 1
        if (state.phase === "reading" && arrived) arrive()
        else if (state.phase === "following" && leftEnd) read()

        // don't pull a selection being dragged out
        if (state.phase !== "reading" && state.pointerDown && hasSelectionWithin(doc, content)) read()

        // a catch-up reads the end every frame, so growth needs nothing here
        if (state.phase === "following") write(scroller.scrollHeight)
        else if (state.phase === "reading") keepPinnedRowStill()

        if (state.phase === "reading" && distanceToBottom() > state.behind + 1) state.unseen = true
        state.lastTop = scroller.scrollTop
        break
      }

      case "SCROLL_TO_BOTTOM":
        if (input.behavior === "smooth" && !prefersReducedMotion() && distanceToBottom() > 1) {
          state.phase = "catchingUp"
          state.unseen = false
          state.lastFrame = performance.now()
          frame.request(tick)
        } else {
          arrive()
          write(scroller.scrollHeight)
        }
        break

      case "FRAME": {
        if (state.phase !== "catchingUp") break
        const elapsed = Math.min(input.time - state.lastFrame, 64)
        state.lastFrame = input.time

        const remaining = distanceToBottom()
        const step = remaining * (1 - Math.exp(-elapsed / CATCH_UP_MS))
        // the last pixels at full speed, so the ease doesn't crawl
        if (remaining - step <= 1) {
          arrive()
          write(scroller.scrollHeight)
        } else {
          write(scroller.scrollTop + Math.max(step, 1))
          frame.request(tick)
        }
        state.lastTop = scroller.scrollTop
        break
      }
    }

    settle()

    const after = getState()
    if (before.following !== after.following || before.atBottom !== after.atBottom || before.unseen !== after.unseen) {
      onChange?.(after)
    }
  }

  /* -----------------------------------------------------------------------------
   * Steps
   * -----------------------------------------------------------------------------*/

  function arrive() {
    frame.cancel()
    state.phase = "following"
    state.unseen = false
    state.ownTop = null
  }

  function read() {
    frame.cancel()
    state.phase = "reading"
    state.ownTop = null
  }

  function settle() {
    state.lastHeight = scroller.scrollHeight
    state.behind = distanceToBottom()
    state.atBottom = state.behind <= threshold
    if (state.atBottom) state.unseen = false
    pinFirstVisibleRow()
  }

  function write(top: number) {
    const max = scroller.scrollHeight - scroller.clientHeight
    const target = Math.max(0, Math.min(top, max))
    if (Math.abs(scroller.scrollTop - target) < 1) return
    state.ownTop = target
    scroller.scrollTo({ top: target, behavior: "instant" })
  }

  function tick() {
    send({ type: "FRAME", time: performance.now() })
  }

  function prefersReducedMotion() {
    return !!doc.defaultView?.matchMedia?.("(prefers-reduced-motion: reduce)").matches
  }

  function pinFirstVisibleRow() {
    state.pin = null
    if (!anchor || state.phase !== "reading") return

    const box = scroller.getBoundingClientRect()
    const row = findFirstVisibleRow(content.children, box.top)
    if (!row || row.getBoundingClientRect().top >= box.bottom) return

    state.pin = { row, top: topInContent(row) }
  }

  function keepPinnedRowStill() {
    const pin = state.pin
    if (!pin || !pin.row.isConnected) return

    const moved = topInContent(pin.row) - pin.top
    if (Math.abs(moved) < 1) return

    // shrinking content below already clamped the view
    const clamped = scroller.scrollTop < state.lastTop && distanceToBottom() < 1
    write((clamped ? state.lastTop : scroller.scrollTop) + moved)
  }

  function topInContent(row: Element) {
    return row.getBoundingClientRect().top - scroller.getBoundingClientRect().top + scroller.scrollTop
  }

  /* -----------------------------------------------------------------------------
   * Listeners: they only turn DOM events into inputs
   * -----------------------------------------------------------------------------*/

  // the pinned row replaces browser anchoring; both would correct the same shift
  const previousAnchor = scroller.style.overflowAnchor
  if (anchor) scroller.style.overflowAnchor = "none"

  const grow = () => send({ type: "GROW" })
  const intentUp = () => send({ type: "INTENT_UP" })

  const rowCleanups = new Map<Element, VoidFunction>()
  const watchRow = (node: Node) => {
    if (node.nodeType !== Node.ELEMENT_NODE || rowCleanups.has(node as Element)) return
    rowCleanups.set(node as Element, resizeObserverBorderBox.observe(node as Element, grow))
  }
  const unwatchRow = (node: Node) => {
    rowCleanups.get(node as Element)?.()
    rowCleanups.delete(node as Element)
  }

  const stopWatchingScroller = resizeObserverBorderBox.observe(scroller, grow)
  const stopWatchingContent = content !== scroller ? resizeObserverBorderBox.observe(content, grow) : undefined
  for (const row of content.children) watchRow(row)

  const stopWatchingRows = childListObserver.observe(content, (records) => {
    for (const record of records) {
      record.addedNodes.forEach(watchRow)
      record.removedNodes.forEach(unwatchRow)
    }
    grow()
  })

  let touchY: number | null = null

  const cleanups = [
    addGlobalEvent(scroller, "scroll", () => send({ type: "SCROLL" }), { passive: true }),

    addGlobalEvent<WheelEvent>(
      scroller,
      "wheel",
      (event) => {
        if (event.deltaY < 0) intentUp()
      },
      { passive: true },
    ),

    addGlobalEvent<TouchEvent>(
      scroller,
      "touchstart",
      (event) => {
        touchY = event.touches[0]?.clientY ?? null
      },
      { passive: true },
    ),

    addGlobalEvent<TouchEvent>(
      scroller,
      "touchmove",
      (event) => {
        const y = event.touches[0]?.clientY
        if (touchY != null && y != null && y > touchY + 1) intentUp()
        touchY = y ?? touchY
      },
      { passive: true },
    ),

    addGlobalEvent<KeyboardEvent>(scroller, "keydown", (event) => {
      if (event.defaultPrevented || !UP_KEYS.has(event.key) || isEditableElement(event.target)) return
      intentUp()
    }),

    addGlobalEvent(scroller, "pointerdown", () => {
      state.pointerDown = true
    }),
    addGlobalEvent(doc, "pointerup", () => {
      state.pointerDown = false
    }),
  ]

  if (initial) write(scroller.scrollHeight)
  state.lastTop = scroller.scrollTop
  settle()
  onChange?.(getState())

  return {
    scrollToBottom: ({ behavior = "auto" } = {}) => send({ type: "SCROLL_TO_BOTTOM", behavior }),
    getState,
    cleanup() {
      frame.cancel()
      for (const cleanup of cleanups) cleanup()
      stopWatchingScroller()
      stopWatchingContent?.()
      stopWatchingRows()
      for (const cleanup of rowCleanups.values()) cleanup()
      rowCleanups.clear()
      scroller.style.overflowAnchor = previousAnchor
    },
  }
}

// binary search; rows without a box are skipped
function findFirstVisibleRow(rows: HTMLCollection, top: number): Element | null {
  let low = 0
  let high = rows.length - 1
  let found: Element | null = null

  while (low <= high) {
    const mid = (low + high) >> 1
    let probe = mid
    while (probe <= high && !rows[probe].getClientRects().length) probe++

    if (probe > high) {
      high = mid - 1
      continue
    }

    if (rows[probe].getBoundingClientRect().bottom > top) {
      found = rows[probe]
      high = mid - 1
    } else {
      low = probe + 1
    }
  }

  return found
}
