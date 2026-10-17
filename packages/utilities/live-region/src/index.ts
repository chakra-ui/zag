export interface LiveRegionOptions {
  level: "polite" | "assertive"
  document?: Document | undefined
  root?: HTMLElement | null | undefined
  delay?: number | undefined
  debug?: boolean | undefined
}

export type LiveRegion = ReturnType<typeof createLiveRegion>

const DEBUG_ID = "__live-region-debug__"
const DEBUG_STYLES =
  "position:fixed;inset-inline:0;bottom:0;z-index:2147483647;padding:12px 16px;background:black;color:white;font-size:14px;line-height:20px;text-align:center;pointer-events:none;"

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
  const parent = root ?? doc.body

  let region: HTMLElement | null = null
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
    parent.appendChild(debugRegion)

    return debugRegion
  }

  function createRegion() {
    const el = doc.createElement("span")
    el.dataset.liveAnnouncer = "true"
    el.setAttribute("aria-live", level)
    el.setAttribute("role", level === "assertive" ? "alert" : "status")
    Object.assign(el.style, HIDDEN_STYLES)
    parent.appendChild(el)
    return el
  }

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

    // a fresh element makes screen readers repeat the same message
    region?.remove()
    const target = createRegion()
    region = target

    timer = win.setTimeout(() => {
      timer = undefined
      target.textContent = message
      const debugRegion = getDebugRegion()
      if (debugRegion) debugRegion.textContent = message
    }, delay)
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
