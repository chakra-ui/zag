export interface LiveRegionOptions {
  level: "polite" | "assertive"
  document?: Document
  root?: HTMLElement | null
  delay?: number
}

export type LiveRegion = ReturnType<typeof createLiveRegion>

const ID = "__live-region__"

export function createLiveRegion(opts: Partial<LiveRegionOptions> = {}) {
  const { level = "polite", document: doc = document, root, delay: _delay = 0 } = opts

  const win = doc.defaultView ?? window
  const parent = root ?? doc.body

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
      region.textContent = message
    }, delay)
  }

  function destroy() {
    const oldRegion = doc.getElementById(ID)
    oldRegion?.remove()
  }

  return {
    announce,
    destroy,
    toJSON() {
      return ID
    },
  }
}
