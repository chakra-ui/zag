import { getWindow } from "../node"
import { noop } from "../shared"

export type MutationObserverListener = (records: readonly MutationRecord[]) => void

export interface SharedMutationObserver {
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
    // An old-value option or filter implies observation, like the native defaults
    attributes:
      options.attributes ?? (options.attributeOldValue !== undefined || options.attributeFilter !== undefined),
    characterData: options.characterData ?? options.characterDataOldValue !== undefined,
    attributeOldValue: !!options.attributeOldValue,
    characterDataOldValue: !!options.characterDataOldValue,
  }
  if (options.attributeFilter !== undefined) config.attributeFilter = [...new Set(options.attributeFilter)].sort()
  return config
}

/** One native observer per target and configuration, shared by all subscriptions */
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
          for (const callback of [...listeners]) {
            if (!listeners.has(callback)) continue
            try {
              callback(records)
            } catch (error) {
              // Rethrow later so other listeners still run
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

      // Wrap so the same listener subscribed twice is released separately
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
