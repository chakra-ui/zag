export interface Attrs {
  [key: string]: any
}

const prevAttrsMap = new WeakMap<Element, Attrs>()

const assignableProps = new Set<string>(["value", "checked", "htmlFor"])

// SVG attributes that need to preserve case
const caseSensitiveSvgAttrs = new Set<string>(["viewBox", "preserveAspectRatio"])

// Check if element is SVG
const isSvgElement = (node: Element): boolean => {
  return node.tagName === "svg" || node.namespaceURI === "http://www.w3.org/2000/svg"
}

// Get the correct attribute name, preserving case for SVG attributes
const getAttributeName = (node: Element, attrName: string): string => {
  const shouldPreserveCase = isSvgElement(node) && caseSensitiveSvgAttrs.has(attrName)
  return shouldPreserveCase ? attrName : attrName.toLowerCase()
}

export function spreadProps(node: Element, attrs: Attrs): () => void {
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
      if (assignableProps.has(attrName)) {
        ;(node as any)[attrName] = value
      } else {
        node.setAttribute(getAttributeName(node, attrName), value)
      }
      return
    }

    node.removeAttribute(getAttributeName(node, attrName))
  }

  // reconcile old attributes

  for (const key in oldAttrs) {
    if (attrs[key] == null) {
      node.removeAttribute(getAttributeName(node, key))
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
