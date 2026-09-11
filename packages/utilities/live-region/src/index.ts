export interface LiveRegionOptions {
  level: "polite" | "assertive"
  document?: Document | undefined
  root?: HTMLElement | null | undefined
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

const HIDDEN_STYLES = {
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
  const parent = root ?? doc.body
  const ID = getId(level)

  let announceTimer: number | undefined
  let clearTimer: number | undefined

  // Screen readers only announce a change to a region they already know about,
  // so the region is created up front and kept. Creating it and filling it in
  // the same tick is unreliable -- VoiceOver in particular misses it.
  function getRegion() {
    let region = doc.getElementById(ID)
    if (region) return region

    region = doc.createElement("span")
    region.id = ID
    region.dataset.liveAnnouncer = "true"
    region.setAttribute("aria-live", level)
    region.setAttribute("aria-atomic", "true")
    region.setAttribute("role", level === "assertive" ? "alert" : "status")
    Object.assign(region.style, HIDDEN_STYLES)
    parent.appendChild(region)

    return region
  }

  function getDebugRegion() {
    if (!debug) return

    let region = doc.getElementById(DEBUG_ID)
    if (region) return region

    region = doc.createElement("div")
    region.id = DEBUG_ID
    region.dataset.liveAnnouncerDebug = "true"
    region.setAttribute("aria-hidden", "true")
    region.style.cssText = DEBUG_STYLES
    parent.appendChild(region)

    return region
  }

  function announce(message: string, delay?: number) {
    const region = getRegion()
    delay = delay ?? _delay

    win.clearTimeout(announceTimer)
    win.clearTimeout(clearTimer)

    // empty it first so re-announcing the same message is still a change
    region.textContent = ""

    announceTimer = win.setTimeout(() => {
      if (!region.isConnected) return
      region.textContent = message

      const debugRegion = getDebugRegion()
      if (debugRegion) debugRegion.textContent = message

      if (message) clearTimer = win.setTimeout(clear, timeout)
    }, delay)
  }

  function clear() {
    win.clearTimeout(announceTimer)
    win.clearTimeout(clearTimer)

    const region = doc.getElementById(ID)
    if (region) region.textContent = ""

    const debugRegion = doc.getElementById(DEBUG_ID)
    if (debugRegion) debugRegion.textContent = ""
  }

  function destroy() {
    win.clearTimeout(announceTimer)
    win.clearTimeout(clearTimer)

    doc.getElementById(ID)?.remove()
    doc.getElementById(DEBUG_ID)?.remove()
  }

  // the region has to exist well before the first announcement
  getRegion()

  return {
    announce,
    clear,
    destroy,
    toJSON() {
      return ID
    },
  }
}
