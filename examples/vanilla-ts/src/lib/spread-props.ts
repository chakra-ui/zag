export interface Attrs {
  [key: string]: any // Change 'any' to the specific type you want to allow for attributes
}

const prevAttrsMap = new WeakMap<HTMLElement, Attrs>()

export function spreadProps(node: HTMLElement, attrs: Attrs): () => void {
  const oldAttrs = prevAttrsMap.get(node) || {}

  const attrKeys = Object.keys(attrs)

  const addEvt = (e: string, f: EventListener) => {
    node.addEventListener(e.toLowerCase(), f)
  }

  const remEvt = (e: string, f: EventListener) => {
    node.removeEventListener(e.toLowerCase(), f)
  }

  const onEvents = (attr: string) => attr.startsWith("on")
  const others = (attr: string) => !attr.startsWith("on")

  const setup = (attr: string) => addEvt(attr.substring(2), attrs[attr])
  const teardown = (attr: string) => remEvt(attr.substring(2), attrs[attr])

  const apply = (attrName: string) => {
    let value = attrs[attrName]

    const oldValue = oldAttrs[attrName]
    if (value === oldValue) return

    if (typeof value === "boolean") {
      value = value || undefined
    }

    if (value != null) {
      if (["value", "checked", "htmlFor"].includes(attrName)) {
        ;(node as any)[attrName] = value // Using 'any' here because TypeScript can't narrow the type based on the array check
      } else {
        node.setAttribute(attrName.toLowerCase(), value)
      }
      return
    }

    node.removeAttribute(attrName.toLowerCase())
  }

  // reconcile old attributes

  for (const key in oldAttrs) {
    if (attrs[key] == null) {
      node.removeAttribute(key.toLowerCase())
    }
  }

  const oldEvents = Object.keys(oldAttrs).filter(onEvents)
  oldEvents.forEach((evt) => {
    remEvt(evt.substring(2), oldAttrs[evt])
  })

  attrKeys.filter(onEvents).forEach(setup)
  attrKeys.filter(others).forEach(apply)

  prevAttrsMap.set(node, attrs)

  return function cleanup() {
    attrKeys.filter(onEvents).forEach(teardown)
  }
}
