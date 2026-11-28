import { addGlobalEvent } from "../global-event"
import { getDocument, getWindow, isNode } from "../node"
import { Timeout } from "../timeout"

export interface ScrollEndOptions {
  /** How long scrolling must pause, in ms. Defaults to `150` */
  delay?: number | undefined
  /** Starts waiting right away, so `fn` also runs when nothing scrolls */
  immediate?: boolean | undefined
  /** Catches scrolling in any descendant, since scroll events don't bubble */
  capture?: boolean | undefined
  /** The timer to use, so a pending call can be cleared elsewhere */
  timeout?: Timeout | undefined
}

type ScrollEndInput =
  | { type: "SCROLL"; scroller: EventTarget | null }
  | { type: "NATIVE_END"; scroller: EventTarget | null }
  | { type: "TIMER_END" }
  | { type: "TOUCH"; down: boolean }

/**
 * Calls `fn` once scrolling on `target` ends: on the native `scrollend` event where the browser has it, else after
 * scroll events pause for `delay`. It never ends while a finger is still down, since a held touch pauses scrolling.
 */
export function trackScrollEnd(target: EventTarget, fn: VoidFunction, options: ScrollEndOptions = {}): VoidFunction {
  const { delay = 150, immediate = false, capture = false, timeout = Timeout.create() } = options
  const native = "onscrollend" in getWindow(target as Node)

  /* -----------------------------------------------------------------------------
   * State
   * -----------------------------------------------------------------------------*/

  const state = {
    touching: false,
    // an end that arrived while a finger was down, reported once it lifts
    deferred: false,
    // with `capture`, several scrollers can move at once; it ends when the last one does
    scrolling: new Set<EventTarget>(),
  }

  /* -----------------------------------------------------------------------------
   * Transitions: every input goes through here
   * -----------------------------------------------------------------------------*/

  function send(input: ScrollEndInput) {
    switch (input.type) {
      case "SCROLL":
        // native ends come from the browser; without them, every scroll restarts the pause
        if (!native) {
          wait()
          break
        }
        timeout.cancel()
        if (input.scroller) state.scrolling.add(input.scroller)
        break

      case "NATIVE_END":
        if (input.scroller) state.scrolling.delete(input.scroller)
        if (isStillScrolling()) break
        if (state.touching) state.deferred = true
        else report()
        break

      // already on the timer, so cancelling it would have stopped this
      case "TIMER_END":
        if (state.touching) state.deferred = true
        else fn()
        break

      case "TOUCH":
        state.touching = input.down
        if (input.down || !state.deferred) break
        state.deferred = false
        if (native) report()
        else wait()
        break
    }
  }

  /* -----------------------------------------------------------------------------
   * Steps
   * -----------------------------------------------------------------------------*/

  // a scroller removed mid-scroll never sends its end
  function isStillScrolling() {
    for (const scroller of state.scrolling) {
      if (isNode(scroller) && !scroller.isConnected) state.scrolling.delete(scroller)
    }
    return state.scrolling.size > 0
  }

  function wait() {
    timeout.start(delay, () => send({ type: "TIMER_END" }))
  }

  // a native end goes through the timer, so cancelling it also drops an end that's about to be reported
  function report() {
    timeout.start(0, fn)
  }

  /* -----------------------------------------------------------------------------
   * Listeners: they only turn DOM events into inputs
   * -----------------------------------------------------------------------------*/

  const doc = getDocument(target as Node)
  const touchEnd = (event: TouchEvent) => {
    if (event.touches.length === 0) send({ type: "TOUCH", down: false })
  }

  const cleanups = [
    addGlobalEvent(target, "scroll", (event) => send({ type: "SCROLL", scroller: event.target }), {
      capture,
      passive: true,
    }),
    addGlobalEvent(target, "touchstart", () => send({ type: "TOUCH", down: true }), { capture, passive: true }),
    addGlobalEvent<TouchEvent>(doc, "touchend", touchEnd, { passive: true }),
    addGlobalEvent<TouchEvent>(doc, "touchcancel", touchEnd, { passive: true }),
  ]
  if (native) {
    const onEnd = (event: Event) => send({ type: "NATIVE_END", scroller: event.target })
    cleanups.push(addGlobalEvent(target, "scrollend", onEnd, { capture }))
  }

  if (immediate) wait()

  return () => {
    for (const cleanup of cleanups) cleanup()
    timeout.cancel()
  }
}
