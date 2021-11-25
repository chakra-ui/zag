import { srOnlyStyle } from "./sr-only"

type LiveRegionOptions = {
  ariaLive: "polite" | "assertive"
  role: "status" | "alert" | "log"
  ariaRelevant: "additions" | "removals" | "text" | "all"
  ariaAtomic: "true" | "false"
  doc?: Document
}

export class LiveRegion {
  region: HTMLElement | null = null
  doc: Document | null

  constructor(opts: Partial<LiveRegionOptions> = {}) {
    const { ariaLive = "polite", role = "log", ariaRelevant = "additions", doc: _doc } = opts
    this.doc = _doc || document
    const exists = this.doc?.getElementById("__machine-region")

    if (!this.doc || exists) return

    const region = this.doc.createElement("machine-announcer")
    region.id = "__live-region__"
    region.setAttribute("aria-live", ariaLive)
    region.setAttribute("role", role)
    region.setAttribute("aria-relevant", ariaRelevant)

    Object.assign(region.style, srOnlyStyle)

    this.region = region
    this.doc.body.appendChild(region)
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
