export interface LiveRegionOptions {
  level: "polite" | "assertive"
  document?: Document | undefined
  /**
   * Where to add the region. Defaults to `document.body`. Inside a modal dialog, pass an element
   * in the dialog, since screen readers can ignore regions outside it.
   */
  root?: HTMLElement | null | (() => HTMLElement | null) | undefined
  delay?: number | undefined
  timeout?: number | undefined
  debug?: boolean | undefined
}

export type LiveRegion = ReturnType<typeof createLiveRegion>

// one region per level: a polite announcer must not inherit an assertive
// region left behind by another machine on the page
const getId = (level: string) => `__live-region-${level}__`

const DEBUG_ID = "__live-region-debug__"
const DEBUG_STYLES =
  "position:fixed;inset-inline:0;bottom:0;z-index:2147483647;padding:12px 16px;background:black;color:white;font-size:14px;line-height:20px;text-align:center;pointer-events:none;"

// how long an announcement is left in the DOM. it has been read by then, and
// keeping it makes stale text readable as page content long afterwards
const CLEAR_DELAY = 7000

/**
 * How long a cleared region stays empty before the next message, so the change is noticed
 */
const MIN_DELAY = 100

/**
 * How long a new region waits before its first message, since Safari VoiceOver can miss earlier changes
 */
const INITIAL_DELAY = 200

const HIDDEN_STYLES: Partial<CSSStyleDeclaration> = {
  border: "0",
  clip: "rect(0 0 0 0)",
  clipPath: "inset(50%)",
  height: "1px",
  margin: "-1px",
  overflow: "hidden",
  padding: "0",
  position: "absolute",
  width: "1px",
  whiteSpace: "nowrap",
  wordWrap: "normal",
}

// when each region (shared across instances) can first be announced into
const readyAt = new WeakMap<Element, number>()

export function createLiveRegion(opts: Partial<LiveRegionOptions> = {}) {
  const {
    level = "polite",
    document: doc = document,
    root,
    delay: _delay = 0,
    timeout = CLEAR_DELAY,
    debug = false,
  } = opts

  const win = doc.defaultView ?? window
  const getParent = () => (typeof root === "function" ? root() : root) ?? doc.body
  const ID = getId(level)

  let announceTimer: number | undefined
  let clearTimer: number | undefined

  // Screen readers only announce a change to a region they already know about,
  // so the region is created up front and kept.
  function getRegion() {
    const parent = getParent()
    let region = doc.getElementById(ID)

    if (!region) {
      region = doc.createElement("span")
      region.id = ID
      region.dataset.liveAnnouncer = "true"
      region.setAttribute("aria-live", level)
      region.setAttribute("aria-atomic", "true")
      region.setAttribute("role", level === "assertive" ? "alert" : "status")
      Object.assign(region.style, HIDDEN_STYLES)
    }

    // a moved region is new to screen readers too
    if (region.parentElement !== parent) {
      parent.appendChild(region)
      readyAt.set(region, Date.now() + INITIAL_DELAY)
    }

    return region
  }

  function getDebugRegion() {
    if (!debug) return

    let debugRegion = doc.getElementById(DEBUG_ID)
    if (debugRegion) return debugRegion

    debugRegion = doc.createElement("div")
    debugRegion.id = DEBUG_ID
    debugRegion.dataset.liveAnnouncerDebug = "true"
    debugRegion.setAttribute("aria-hidden", "true")
    debugRegion.style.cssText = DEBUG_STYLES
    getParent().appendChild(debugRegion)

    return debugRegion
  }

  /**
   * Cancels the pending announcement, if any.
   */
  function cancel() {
    win.clearTimeout(announceTimer)
    announceTimer = undefined
  }

  /**
   * Announces the message after `delay`, replacing this instance's pending announcement.
   */
  function announce(message: string, delay = _delay) {
    const region = getRegion()

    cancel()
    win.clearTimeout(clearTimer)

    // empty it first so re-announcing the same message is still a change
    region.textContent = ""

    announceTimer = win.setTimeout(
      () => {
        announceTimer = undefined
        if (!region.isConnected) return
        region.textContent = message

        const debugRegion = getDebugRegion()
        if (debugRegion) debugRegion.textContent = message

        if (message) clearTimer = win.setTimeout(clear, timeout)
      },
      Math.max(delay, MIN_DELAY, (readyAt.get(region) ?? 0) - Date.now()),
    )
  }

  /**
   * Cancels the pending announcement and empties the region.
   */
  function clear() {
    cancel()
    win.clearTimeout(clearTimer)

    const region = doc.getElementById(ID)
    if (region) region.textContent = ""

    const debugRegion = doc.getElementById(DEBUG_ID)
    if (debugRegion) debugRegion.textContent = ""
  }

  /**
   * Cancels pending work and removes the region.
   */
  function destroy() {
    cancel()
    win.clearTimeout(clearTimer)

    doc.getElementById(ID)?.remove()
    if (debug) doc.getElementById(DEBUG_ID)?.remove()
  }

  // the region has to exist well before the first announcement
  getRegion()

  return {
    announce,
    cancel,
    clear,
    destroy,
    toJSON() {
      return "live-region"
    },
  }
}
