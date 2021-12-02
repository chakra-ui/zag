import { srOnlyStyle } from "./sr-only"

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

export class LiveRegion {
  region: HTMLElement | null = null
  doc: Document | null

  constructor(opts: Partial<LiveRegionOptions> = {}) {
    const {
      ariaLive = "polite",
      role = "log",
      ariaRelevant = "additions",
      doc: _doc,
      root,
      name = "machine-announcer",
    } = opts

    this.doc = _doc || document
    const exists = this.doc?.getElementById("__live-region__")

    if (!this.doc || exists) return

    const region = this.doc.createElement(name)
    region.id = "__live-region__"
    region.setAttribute("aria-live", ariaLive)
    region.setAttribute("role", role)
    region.setAttribute("aria-relevant", ariaRelevant)

    Object.assign(region.style, srOnlyStyle)

    this.region = region
    const body = root ?? this.doc.body
    body.appendChild(region)
  }

  announce = (msg: string, expire = 7e3) => {
    if (!this.doc || !this.region) return

    const div = this.doc.createElement("p")
    div.innerHTML = msg
    this.region.appendChild(div)

    setTimeout(() => {
      this.region?.removeChild(div)
    }, expire)
  }

  destroy = () => {
    if (!this.doc || !this.region) return
    this.region.parentNode?.removeChild(this.region)
  }
}
