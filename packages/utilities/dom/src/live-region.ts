import { setVisuallyHidden } from "./visually-hidden"

export type LiveRegionOptions = {
  level: "polite" | "assertive"
  doc?: Document
  root?: HTMLElement | null
  delay?: number
}

export type LiveRegion = ReturnType<typeof createLiveRegion>

export function createLiveRegion(opts: Partial<LiveRegionOptions> = {}) {
  const { level = "polite", doc: ownerDocument, root, delay: rootDelay = 0 } = opts

  const doc = ownerDocument ?? document
  const win = doc.defaultView ?? window

  const parent = root ?? doc.body

  function announce(msg: string, delay?: number) {
    const oldRegion = doc.getElementById("__live-region__")

    // remove old region
    if (!!oldRegion) {
      parent.removeChild(oldRegion)
    }

    // Did an override level get set?
    delay = delay ?? rootDelay

    // create fresh region
    const region = doc.createElement("span")
    region.id = "__live-region__"

    // Determine redundant role
    var role = level !== "assertive" ? "status" : "alert"

    // add role and attributes
    region.setAttribute("aria-live", level)
    region.setAttribute("role", role)

    // hide live region
    setVisuallyHidden(region)

    parent.appendChild(region)

    // populate region to trigger it
    win.setTimeout(() => {
      region!.textContent = msg
    }, delay)
  }

  function destroy() {
    const oldRegion = doc.getElementById("__live-region__")
    if (oldRegion) {
      parent.removeChild(oldRegion)
    }
  }

  return { announce, destroy }
}
