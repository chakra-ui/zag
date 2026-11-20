import { createSharedMutationObserver } from "./mutation-observer"
import { raf } from "./raf"

const childListObserver = /* @__PURE__ */ createSharedMutationObserver({ childList: true, subtree: true })

export interface TrackRenderedPartsOptions<K extends string> {
  /**
   * The element whose subtree is watched for parts being added or removed.
   */
  getContainerEl: () => Element | null
  /**
   * The document or shadow root watched until the container mounts.
   */
  getRootNode?: (() => Node) | undefined
  /**
   * Getters for each part to track.
   */
  parts: Record<K, () => Element | null>
  /**
   * Called with the rendered state of each part, initially and whenever it changes.
   */
  onChange: (rendered: Record<K, boolean>) => void
}

/** Tracks which parts are in the DOM, after the framework commits */
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
    // Late-mounted container: wait for it, then narrow to its subtree
    const rootNode = getRootNode?.()
    if (rootNode) stopObserving = childListObserver.observe(rootNode, observeContainer)
  })

  return () => {
    cancelFrame()
    stopObserving?.()
  }
}
