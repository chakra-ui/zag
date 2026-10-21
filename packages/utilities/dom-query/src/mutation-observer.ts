import { getWindow } from "./node"
import { raf } from "./raf"
import { noop } from "./shared"
import type { MaybeElement, MaybeElementOrFn } from "./types"

export type MutationObserverListener = (records: readonly MutationRecord[]) => void

export interface SharedMutationObserver {
  /**
   * Subscribe to a target. Cleanup releases only this subscription.
   * A subscription joining an active observer can receive records queued just before it subscribed.
   */
  observe: (target: Node, listener: MutationObserverListener) => VoidFunction
}

interface TargetObserver {
  observer: MutationObserver
  listeners: Set<MutationObserverListener>
}

const targets = /* @__PURE__ */ new WeakMap<Node, Map<string, TargetObserver>>()

function normalizeOptions(options: MutationObserverInit): MutationObserverInit {
  const config: MutationObserverInit = {
    childList: !!options.childList,
    subtree: !!options.subtree,
    // Match the native defaults: even an explicitly false old-value option enables observation when omitted.
    attributes:
      options.attributes ?? (options.attributeOldValue !== undefined || options.attributeFilter !== undefined),
    characterData: options.characterData ?? options.characterDataOldValue !== undefined,
    attributeOldValue: !!options.attributeOldValue,
    characterDataOldValue: !!options.characterDataOldValue,
  }
  if (options.attributeFilter !== undefined) config.attributeFilter = [...new Set(options.attributeFilter)].sort()
  return config
}

/** Share a native observer across subscriptions with the same target and normalized configuration. */
export function createSharedMutationObserver(options: MutationObserverInit): SharedMutationObserver {
  const config = normalizeOptions(options)
  const key = JSON.stringify(config)

  return {
    observe(target, listener) {
      const win = getWindow(target)
      if (typeof win.MutationObserver !== "function") return noop

      const configurations = targets.get(target) ?? new Map<string, TargetObserver>()
      let entry = configurations.get(key)
      if (!entry) {
        const listeners = new Set<MutationObserverListener>()
        const observer = new win.MutationObserver((records) => {
          // Listener changes apply to the next batch; unsubscribed listeners are skipped immediately.
          for (const callback of [...listeners]) {
            if (!listeners.has(callback)) continue
            try {
              callback(records)
            } catch (error) {
              // One consumer must not prevent delivery to the remaining subscribers.
              win.queueMicrotask(() => {
                throw error
              })
            }
          }
        })
        observer.observe(target, config)
        entry = { observer, listeners }
        configurations.set(key, entry)
        targets.set(target, configurations)
      }

      // Duplicate listener subscriptions have independent ownership.
      const callback: MutationObserverListener = (records) => listener(records)
      entry.listeners.add(callback)
      return () => {
        if (!entry.listeners.delete(callback) || entry.listeners.size > 0) return
        entry.observer.disconnect()
        configurations.delete(key)
        if (configurations.size === 0) targets.delete(target)
      }
    },
  }
}

export interface ObserveAttributeOptions {
  attributes: string[]
  callback(record: MutationRecord): void
  defer?: boolean | undefined
}

function observeAttributesImpl(node: MaybeElement, options: ObserveAttributeOptions) {
  if (!node) return
  const { attributes, callback: fn } = options
  const observer = createSharedMutationObserver({ attributes: true, attributeFilter: attributes })
  return observer.observe(node, (changes) => {
    for (const change of changes) {
      fn(change)
    }
  })
}

export function observeAttributes(nodeOrFn: MaybeElementOrFn, options: ObserveAttributeOptions) {
  const setup = () => {
    const node = typeof nodeOrFn === "function" ? nodeOrFn() : nodeOrFn
    return observeAttributesImpl(node, options)
  }
  return options.defer ? raf(setup) : (setup() ?? noop)
}

export interface ObserveChildrenOptions {
  callback: MutationCallback
  defer?: boolean | undefined
}

function observeChildrenImpl(node: MaybeElement, options: ObserveChildrenOptions) {
  const { callback: fn } = options
  if (!node) return
  // Preserve the native observer passed to callbacks, including disconnect/observe/takeRecords.
  const win = node.ownerDocument.defaultView || window
  const obs = new win.MutationObserver(fn)
  obs.observe(node, { childList: true, subtree: true })
  return () => obs.disconnect()
}

export function observeChildren(nodeOrFn: MaybeElementOrFn, options: ObserveChildrenOptions) {
  const setup = () => {
    const node = typeof nodeOrFn === "function" ? nodeOrFn() : nodeOrFn
    return observeChildrenImpl(node, options)
  }
  return options.defer ? raf(setup) : (setup() ?? noop)
}
