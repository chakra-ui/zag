import { setVisuallyHidden } from "./visually-hidden"

export type LiveRegionOptions = {
  /**
   * The element's local or tag name
   */
  name?: string
  /**
   * The aria-live attribute of the reion
   */
  ariaLive: "polite" | "assertive"
  /**
   * The role property of the region
   */
  role: "status" | "alert" | "log"
  /**
   * The aria-relevant attribute of the region
   */
  ariaRelevant: "additions" | "removals" | "text" | "all"
  /**
   * The aria-atomic attribute of the region
   */
  ariaAtomic: "true" | "false"
  /**
   * The owner document of the region
   */
  doc?: Document
  /**
   * The root element to attach the region to.
   * Defaults to the document's body.
   */
  root?: HTMLElement | null
}

export type LiveRegion = ReturnType<typeof createLiveRegion>

export function createLiveRegion(opts: Partial<LiveRegionOptions> = {}) {
  const {
    ariaLive = "polite",
    role = "log",
    ariaRelevant = "additions",
    doc: ownerDocument,
    root,
    name = "machine-announcer",
  } = opts

  let region: HTMLElement | null = null
  const doc = ownerDocument || document
  const win = doc.defaultView || window

  const exists = doc.getElementById("__live-region__")
  if (exists) return null

  region = doc.createElement(name)
  region.id = "__live-region__"
  region.setAttribute("aria-live", ariaLive)
  region.setAttribute("role", role)
  region.setAttribute("aria-relevant", ariaRelevant)
  setVisuallyHidden(region)

  const body = root ?? doc.body
  body.appendChild(region)

  function announce(msg: string, expire = 7e3) {
    if (!region) return

    const div = doc.createElement("p")
    div.innerHTML = msg
    region.appendChild(div)

    win.setTimeout(() => {
      region?.removeChild(div)
    }, expire)
  }

  function destroy() {
    if (!region) return
    region.parentNode?.removeChild(region)
  }

  return { announce, destroy }
}
