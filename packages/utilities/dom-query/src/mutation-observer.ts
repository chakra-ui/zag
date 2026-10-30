import { getWindow } from "./node"
import { raf } from "./raf"
import { noop } from "./shared"
import type { MaybeElement, MaybeElementOrFn } from "./types"

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

export interface ObserveAttributeOptions {
  attributes: string[]
  callback(record: MutationRecord): void
  defer?: boolean | undefined
}

function observeAttributesImpl(node: MaybeElement, options: ObserveAttributeOptions) {
  if (!node) return
  const { attributes, callback: fn } = options
  const win = node.ownerDocument.defaultView || window
  const obs = new win.MutationObserver((changes) => {
    for (const change of changes) {
      if (change.type === "attributes" && change.attributeName && attributes.includes(change.attributeName)) {
        fn(change)
      }
    }
  })
  obs.observe(node, { attributes: true, attributeFilter: attributes })
  return () => obs.disconnect()
}

export function observeAttributes(nodeOrFn: MaybeElementOrFn, options: ObserveAttributeOptions) {
  const { defer } = options
  const func = defer ? raf : (v: any) => v()
  const cleanups: (VoidFunction | undefined)[] = []
  cleanups.push(
    func(() => {
      const node = typeof nodeOrFn === "function" ? nodeOrFn() : nodeOrFn
      cleanups.push(observeAttributesImpl(node, options))
    }),
  )
  return () => {
    cleanups.forEach((fn) => fn?.())
  }
}

export interface ObserveChildrenOptions extends MutationObserverInit {
  callback: MutationCallback
  defer?: boolean | undefined
}

function observeChildrenImpl(node: MaybeElement, options: ObserveChildrenOptions) {
  const { callback: fn, defer: _defer, ...observerInit } = options
  if (!node) return
  const win = node.ownerDocument.defaultView || window
  const obs = new win.MutationObserver(fn)
  obs.observe(node, { childList: true, subtree: true, ...observerInit })
  return () => obs.disconnect()
}

export function observeChildren(nodeOrFn: MaybeElementOrFn, options: ObserveChildrenOptions) {
  const { defer } = options
  const func = defer ? raf : (v: any) => v()
  const cleanups: (VoidFunction | undefined)[] = []
  cleanups.push(
    func(() => {
      const node = typeof nodeOrFn === "function" ? nodeOrFn() : nodeOrFn
      cleanups.push(observeChildrenImpl(node, options))
    }),
  )
  return () => {
    cleanups.forEach((fn) => fn?.())
  }
}
