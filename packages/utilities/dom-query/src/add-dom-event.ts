interface EventMap extends DocumentEventMap, WindowEventMap, HTMLElementEventMap {}

type Node = Document | HTMLElement | EventTarget | null

type Target = (() => Node) | Node

export const addDomEvent = <K extends keyof EventMap>(
  target: Target,
  eventName: K,
  handler: (event: EventMap[K]) => void,
  options?: boolean | AddEventListenerOptions,
) => {
  const node = typeof target === "function" ? target() : target
  node?.addEventListener(eventName, handler as any, options)
  return () => {
    node?.removeEventListener(eventName, handler as any, options)
  }
}
