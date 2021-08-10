import { trackPointerDown as onPointerDown } from "@core-dom/event"
import { env, noop } from "@core-foundation/utils"
import type { KeyboardEvent } from "react"
import { ref } from "valtio"

type Dict = Record<string, any>

const keyMap = {
  ArrowLeft: "ArrowRight",
  ArrowRight: "ArrowLeft",
  Home: "End",
  End: "Home",
}

/**
 * Determine the event key based on text direction.
 */
export function determineEventKey(
  event: KeyboardEvent,
  options: {
    direction?: "ltr" | "rtl"
    orientation?: "horizontal" | "vertical"
  },
) {
  let { key } = event
  const { direction, orientation = "horizontal" } = options

  const isRtl = direction === "rtl" && orientation === "horizontal"

  if (isRtl && key in keyMap) {
    key = keyMap[key]
  }

  return key
}

const PAGE_KEYS = ["PageUp", "PageDown"]
const ARROW_KEYS = ["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight"]

/**
 * Determine the step factor for keyboard events
 */
export function getStepMultipler(event: KeyboardEvent) {
  const isPageKey = PAGE_KEYS.includes(event.key)
  const isSkipKey = isPageKey || (event.shiftKey && ARROW_KEYS.includes(event.key))
  return isSkipKey ? 10 : 1
}

type Booleanish = boolean | "true" | "false"

export const dataAttr = (cond: boolean | undefined) => {
  return (cond ? "" : undefined) as Booleanish
}

export const ariaAttr = (cond: boolean | undefined) => {
  return cond ? true : undefined
}

export function observeNodeAttr(node: HTMLElement | null, attributes: string[], fn: VoidFunction) {
  if (!node) return noop
  const obs = new MutationObserver((changes) => {
    for (const change of changes) {
      if (change.type === "attributes" && change.attributeName && attributes.includes(change.attributeName)) {
        fn()
      }
    }
  })

  obs.observe(node, {
    attributes: true,
    attributeFilter: attributes,
  })

  return () => obs.disconnect()
}

type TrackPointerDownOptions = {
  doc?: Document
  pointerdownNode?: HTMLElement | null
}

export function trackPointerDown(ctx: TrackPointerDownOptions) {
  const doc = ctx.doc ?? document
  return onPointerDown(doc, (el) => {
    ctx.pointerdownNode = ref(el)
  })
}

export interface PropNormalizer {
  <T extends Dict = Dict>(props: T): Dict
}

export const defaultPropNormalizer: PropNormalizer = (props: Dict) => props

/* -----------------------------------------------------------------------------
 * Live Region for screen reader technology
 * -----------------------------------------------------------------------------*/

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
    this.doc = _doc ?? env.dom() ? document : null
    const exists = this.doc?.getElementById("__machine-region")

    if (!this.doc || exists) return

    const region = this.doc.createElement("machine-announcer")
    region.id = "__machine-region"
    region.setAttribute("aria-live", ariaLive)
    region.setAttribute("role", role)
    region.setAttribute("aria-relevant", ariaRelevant)

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
    })

    this.region = region
    this.doc.body.prepend(region)
  }

  announce = (msg: string, expire = 7e3) => {
    if (!this.doc || !this.region) return

    const div = this.doc.createElement("div")
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
