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
  const isSkipKey =
    isPageKey || (event.shiftKey && ARROW_KEYS.includes(event.key))
  return isSkipKey ? 10 : 1
}

type Booleanish = boolean | "true" | "false"

export const dataAttr = (cond: boolean | undefined) => {
  return (cond ? "" : undefined) as Booleanish
}

export const ariaAttr = (cond: boolean | undefined) => {
  return cond ? true : undefined
}

export function observeNodeAttr(
  node: HTMLElement | null,
  attributes: string[],
  fn: VoidFunction,
) {
  if (!node) return noop
  const obs = new MutationObserver((changes) => {
    for (const change of changes) {
      if (
        change.type === "attributes" &&
        change.attributeName &&
        attributes.includes(change.attributeName)
      ) {
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
    const {
      ariaLive = "polite",
      role = "log",
      ariaRelevant = "additions",
      ariaAtomic = "false",
      doc: _doc,
    } = opts
    this.doc = _doc ?? env.dom() ? document : null

    if (!this.doc) return

    const region = this.doc.createElement("live-region")

    region.setAttribute("aria-live", ariaLive)
    region.setAttribute("role", role)
    region.setAttribute("aria-relevant", ariaRelevant)
    region.setAttribute("aria-atomic", ariaAtomic)

    region.style.position = "absolute"
    region.style.width = "1px"
    region.style.height = "1px"
    region.style.marginTop = "-1px"
    region.style.clip = "rect(1px, 1px, 1px, 1px)"
    region.style.overflow = "hidden"

    this.region = region
    this.doc.body.appendChild(region)
  }

  announce = (msg: string, expire?: number) => {
    if (!this.doc || !this.region) return

    const announcement = this.doc.createElement("div")
    announcement.innerHTML = msg

    this.region.appendChild(announcement)
    let region = this.region

    if (expire || typeof expire === "undefined") {
      setTimeout(() => {
        region.removeChild(announcement)
      }, expire || 7000)
    }
  }

  destroy = () => {
    if (!this.doc || !this.region) return
    this.region.parentNode?.removeChild(this.region)
  }
}
