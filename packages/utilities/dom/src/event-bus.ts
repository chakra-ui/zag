import { noop } from "@ui-machines/utils"

type El = HTMLElement | Document | VisualViewport | Window
type Handler = (event: Event) => void
type Group = Map<string, Set<Handler>>
type Option = boolean | AddEventListenerOptions

const listenerElements: Map<El, Group> = new Map()
const listenerCache: Map<El, Map<string, Handler>> = new Map()

/**
 * The global event bus for managing event listeners attached to DOM elements.
 *
 * It's goal is to ensure that only one listener is attached to a DOM element for a given event,
 * regardless of the number of times `addEventListener` is called.
 */

export function globalEventBus(node: El | null, type: string, handler: Handler, options?: Option) {
  if (!node) return noop

  // unique identifier for the event listener
  const hash = JSON.stringify({ type, options })

  function attach() {
    if (!node) return

    function listener(event: Event) {
      const group = listenerElements.get(node!)
      group?.get(hash)?.forEach((fn) => fn(event))
    }

    if (!listenerCache?.has(node)) {
      listenerCache.set(node, new Map([[hash, listener]]))
      node.addEventListener(type, listener, options)
    } else if (!listenerCache?.get(node)?.has(hash)) {
      listenerCache.get(node)?.set(hash, listener)
      node.addEventListener(type, listener, options)
    }
  }

  const group = listenerElements.get(node)

  if (!listenerElements.has(node)) {
    const group: Group = new Map([[hash, new Set([handler])]])
    listenerElements.set(node, group)
  } else if (group?.has(hash)) {
    group?.get(hash)?.add(handler)
  } else {
    group?.set(hash, new Set([handler]))
  }

  attach()

  return function remove() {
    if (!listenerElements.has(node)) return

    const group = listenerElements.get(node)
    const listener = listenerCache.get(node)?.get(hash)!

    group?.get(hash)?.delete(handler)

    if (group?.get(hash)?.size === 0) {
      //
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
