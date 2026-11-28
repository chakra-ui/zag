import { raf } from "../raf"
import { createSharedMutationObserver } from "./mutation-observer"

const childListObserver = /* @__PURE__ */ createSharedMutationObserver({ childList: true, subtree: true })

export interface TrackRenderedPartsOptions<K extends string> {
  getContainerEl: () => Element | null
  getRootNode?: (() => Node) | undefined
  parts: Record<K, () => Element | null>
  onChange: (rendered: Record<K, boolean>) => void
}

export function trackRenderedParts<K extends string>(options: TrackRenderedPartsOptions<K>): VoidFunction {
  const { getContainerEl, getRootNode, parts, onChange } = options
  const keys = Object.keys(parts) as K[]

  let prev: Record<K, boolean> | undefined
  const sync = () => {
    const next = {} as Record<K, boolean>
    for (const key of keys) next[key] = !!parts[key]()
    if (prev && keys.every((key) => prev![key] === next[key])) return
    prev = next
    onChange(next)
  }

  let stopObserving: VoidFunction | undefined
  const observeContainer = () => {
    const containerEl = getContainerEl()
    if (!containerEl) return false
    stopObserving?.()
    sync()
    stopObserving = childListObserver.observe(containerEl, sync)
    return true
  }

  const cancelFrame = raf(() => {
    if (observeContainer()) return
    sync()
    const rootNode = getRootNode?.()
    if (rootNode) stopObserving = childListObserver.observe(rootNode, observeContainer)
  })

  return () => {
    cancelFrame()
    stopObserving?.()
  }
}
