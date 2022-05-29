import { noop } from "@zag-js/utils"

type El = HTMLElement | Document | VisualViewport | Window
type Handler = (event: Event) => void
type Group = Map<string, Set<Handler>>
type Option = boolean | AddEventListenerOptions

function getListenerElements(): Map<El, Group> {
  ;(globalThis as any).__listenerElements__ = (globalThis as any).__listenerElements__ || new Map()
  return (globalThis as any).__listenerElements__
}

function getListenerCache(): Map<El, Map<string, Handler>> {
  ;(globalThis as any).__listenerCache__ = (globalThis as any).__listenerCache__ || new Map()
  return (globalThis as any).__listenerCache__
}

/**
 * The global event bus for managing event listeners attached to DOM elements.
 *
 * It's goal is to ensure that only one listener is attached to a DOM element for a given event,
 * regardless of the number of times `addEventListener` is called.
 */

export function addGlobalEventListener(node: El | null, type: string, handler: Handler, options?: Option) {
  if (!node) return noop

  // unique identifier for the event listener
  const hash = JSON.stringify({ type, options })

  // Subscribe pattern
  const listenerElements = getListenerElements()
  const listenerCache = getListenerCache()

  const group = listenerElements.get(node)

  if (!listenerElements.has(node)) {
    // create group of listeners per hash
    const group: Group = new Map([[hash, new Set([handler])]])
    listenerElements.set(node, group)
  } else if (group?.has(hash)) {
    group?.get(hash)?.add(handler)
  } else {
    group?.set(hash, new Set([handler]))
  }

  // add the event listener to the node or register it in the cache
  function attach(node: El) {
    // Publish pattern
    function listener(event: Event) {
      const group = listenerElements.get(node)
      group?.get(hash)?.forEach((fn) => fn(event))
    }

    if (!listenerCache?.has(node)) {
      listenerCache.set(node, new Map([[hash, listener]]))
      node.addEventListener(type, listener, options)
      return
    }

    if (!listenerCache?.get(node)?.has(hash)) {
      listenerCache.get(node)?.set(hash, listener)
      node.addEventListener(type, listener, options)
    }
  }

  attach(node)

  return function remove() {
    if (!listenerElements.has(node)) return

    const group = listenerElements.get(node)
    group?.get(hash)?.delete(handler)

    if (group?.get(hash)?.size === 0) {
      const listener = listenerCache.get(node)?.get(hash)!
      node.removeEventListener(type, listener, options)
      group?.delete(hash)
      listenerCache.get(node)?.delete(hash)

      if (group?.size === 0) {
        listenerElements.delete(node)
        listenerCache.delete(node)
      }
    }
  }
}
