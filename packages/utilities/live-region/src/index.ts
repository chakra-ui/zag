export interface LiveRegionOptions {
  level: "polite" | "assertive"
  document?: Document | undefined
  /**
   * Where to add the region. Defaults to `document.body`. Inside a modal dialog, pass an element
   * in the dialog, since screen readers can ignore regions outside it.
   */
  root?: HTMLElement | null | (() => HTMLElement | null) | undefined
  delay?: number | undefined
  debug?: boolean | undefined
}

export type LiveRegion = ReturnType<typeof createLiveRegion>

const DEBUG_ID = "__live-region-debug__"
const DEBUG_STYLES =
  "position:fixed;inset-inline:0;bottom:0;z-index:2147483647;padding:12px 16px;background:black;color:white;font-size:14px;line-height:20px;text-align:center;pointer-events:none;"

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
  height: "1px",
  margin: "-1px",
  overflow: "hidden",
  padding: "0",
  position: "absolute",
  width: "1px",
  whiteSpace: "nowrap",
  wordWrap: "normal",
}

export function createLiveRegion(opts: Partial<LiveRegionOptions> = {}) {
  const { level = "polite", document: doc = document, root, delay: _delay = 0, debug = false } = opts

  const win = doc.defaultView ?? window
  const getParent = () => (typeof root === "function" ? root() : root) ?? doc.body

  let timer: number | undefined

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

  function createRegion() {
    const el = doc.createElement("span")
    el.dataset.liveAnnouncer = "true"
    el.setAttribute("aria-live", level)
    el.setAttribute("aria-atomic", "true")
    el.setAttribute("role", level === "assertive" ? "alert" : "status")
    Object.assign(el.style, HIDDEN_STYLES)
    getParent().appendChild(el)
    readyAt = Date.now() + INITIAL_DELAY
    return el
  }

  // screen readers only announce changes to a region that is already in the DOM
  let readyAt = 0
  let region: HTMLElement | null = createRegion()

  /**
   * Cancels the pending announcement, if any.
   */
  function cancel() {
    win.clearTimeout(timer)
    timer = undefined
  }

  /**
   * Announces the message after `delay`, replacing this region's pending announcement.
   */
  function announce(message: string, delay = _delay) {
    cancel()
    if (!region?.isConnected) region = createRegion()

    // clearing first lets screen readers repeat the same message
    const target = region
    target.textContent = ""

    timer = win.setTimeout(
      () => {
        timer = undefined
        target.textContent = message
        const debugRegion = getDebugRegion()
        if (debugRegion) debugRegion.textContent = message
      },
      Math.max(delay, MIN_DELAY, readyAt - Date.now()),
    )
  }

  /**
   * Cancels the pending announcement and removes the region.
   */
  function destroy() {
    cancel()
    region?.remove()
    region = null
    if (debug) doc.getElementById(DEBUG_ID)?.remove()
  }

  return {
    announce,
    cancel,
    destroy,
    toJSON() {
      return "live-region"
    },
  }
}
