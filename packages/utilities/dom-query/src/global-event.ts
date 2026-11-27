type Handler = (event: any) => void

interface ListenerOptions {
  capture?: boolean | undefined
  passive?: boolean | undefined
}

const registry = new WeakMap<EventTarget, Map<string, Set<Handler>>>()
const nativeListeners = new WeakMap<Set<Handler>, (event: Event) => void>()

const getKey = (type: string, { capture = false, passive = false }: ListenerOptions) =>
  `${type}:${capture ? 1 : 0}:${passive ? 1 : 0}`

/**
 * Adds an event listener that shares one native listener with every other handler for the same
 * target, event type and options. Returns a cleanup that removes the handler.
 */
export function addGlobalEvent<E extends Event = Event>(
  target: EventTarget,
  type: string,
  handler: (event: E) => void,
  options: ListenerOptions = {},
): VoidFunction {
  let byKey = registry.get(target)
  if (!byKey) {
    byKey = new Map()
    registry.set(target, byKey)
  }

  const key = getKey(type, options)
  let handlers = byKey.get(key)

  if (!handlers) {
    const set = new Set<Handler>()
    handlers = set
    byKey.set(key, set)
    // snapshot: handlers may remove themselves mid-dispatch
    const dispatch = (event: Event) => {
      for (const fn of Array.from(set)) fn(event)
    }
    target.addEventListener(type, dispatch, { capture: !!options.capture, passive: !!options.passive })
    nativeListeners.set(set, dispatch)
  }

  handlers.add(handler)

  return () => {
    const set = byKey!.get(key)
    if (!set || !set.delete(handler) || set.size > 0) return
    target.removeEventListener(type, nativeListeners.get(set)!, { capture: !!options.capture })
    nativeListeners.delete(set)
    byKey!.delete(key)
  }
}
