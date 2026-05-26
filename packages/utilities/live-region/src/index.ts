export interface LiveRegionOptions {
  level: "polite" | "assertive"
  document?: Document | undefined
  root?: HTMLElement | null | undefined
  delay?: number | undefined
  debug?: boolean | undefined
}

export type LiveRegion = ReturnType<typeof createLiveRegion>

const ID = "__live-region__"
const DEBUG_ID = "__live-region-debug__"
const DEBUG_STYLES =
  "position:fixed;inset-inline:0;bottom:0;z-index:2147483647;padding:12px 16px;background:black;color:white;font-size:14px;line-height:20px;text-align:center;pointer-events:none;"

export function createLiveRegion(opts: Partial<LiveRegionOptions> = {}) {
  const { level = "polite", document: doc = document, root, delay: _delay = 0, debug = false } = opts

  const win = doc.defaultView ?? window
  const parent = root ?? doc.body

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
    const oldRegion = doc.getElementById(ID)

    // remove old region
    oldRegion?.remove()

    // Did an override level get set?
    delay = delay ?? _delay

    // create fresh region
    const region = doc.createElement("span")
    region.id = ID
    region.dataset.liveAnnouncer = "true"

    // Determine redundant role
    const role = level !== "assertive" ? "status" : "alert"

    // add role and attributes
    region.setAttribute("aria-live", level)
    region.setAttribute("role", role)

    // hide live region
    Object.assign(region.style, {
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
    })

    parent.appendChild(region)

    // populate region to trigger it
    win.setTimeout(() => {
      if (!region.isConnected) return
      region.textContent = message
      const debugRegion = getDebugRegion()
      if (debugRegion) debugRegion.textContent = message
    }, delay)
  }

  function destroy() {
    const oldRegion = doc.getElementById(ID)
    oldRegion?.remove()
    const debugRegion = doc.getElementById(DEBUG_ID)
    debugRegion?.remove()
  }

  return {
    announce,
    destroy,
    toJSON() {
      return ID
    },
  }
}
