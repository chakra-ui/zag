export function zag(node: Element, handlers: Record<string, EventListener>) {
  Object.entries(handlers).forEach(([key, value]) => {
    node.addEventListener(key, value)
  })

  return {
    destroy() {
      Object.entries(handlers).forEach(([key, value]) => {
        node.removeEventListener(key, value)
      })
    },
  }
}
