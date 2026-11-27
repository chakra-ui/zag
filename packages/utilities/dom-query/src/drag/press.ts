import { addGlobalEvent } from "../global-event"
import { Timeout } from "../timeout"

const isSecondaryPointer = (event: PointerEvent) =>
  !event.isPrimary && event.pointerType !== "mouse" && event.pointerType !== ""

/**
 * Whether a press can start a drag: the main button, not a second finger or pen, and not already handled.
 */
export function isDragStart(event: Pick<PointerEvent, "button" | "isPrimary" | "pointerType" | "defaultPrevented">) {
  return event.button === 0 && !isSecondaryPointer(event as PointerEvent) && !event.defaultPrevented
}

export interface SuppressClickOptions {
  /**
   * Keeps waiting until the pointer lifts, for a drag cancelled while still pressed, like by Escape
   */
  untilRelease?: boolean | undefined
  /**
   * The pointer whose click to swallow. Another pointer's press, release or click leaves it armed.
   */
  pointerId?: number | undefined
}

/**
 * Swallows the click a drag's release sends, so the drag doesn't press what it ends on, like a link.
 * Call it on the release, or with `untilRelease` while the pointer is still down. It stops after the
 * release's task or at the next press, so a later click goes through.
 */
export function suppressNextClick(doc: Document, options: SuppressClickOptions = {}) {
  const { untilRelease, pointerId } = options
  const timeout = Timeout.create()

  const isOurs = (event: Event) => pointerId == null || !("pointerId" in event) || event.pointerId === pointerId

  const cleanups = [
    addGlobalEvent<MouseEvent>(
      doc,
      "click",
      (event) => {
        if (!isOurs(event)) return
        event.preventDefault()
        event.stopPropagation()
        cleanup()
      },
      { capture: true },
    ),
    addGlobalEvent(doc, "pointerdown", (event) => isOurs(event) && cleanup(), { capture: true }),
  ]

  // the click fires in the release's task
  const afterRelease = () => timeout.start(0, cleanup)

  if (untilRelease) {
    const onRelease = (event: Event) => isOurs(event) && afterRelease()
    cleanups.push(
      addGlobalEvent(doc, "pointerup", onRelease, { capture: true }),
      addGlobalEvent(doc, "pointercancel", onRelease, { capture: true }),
    )
  } else {
    afterRelease()
  }

  function cleanup() {
    timeout.cancel()
    for (const fn of cleanups.splice(0)) fn()
  }

  return cleanup
}
