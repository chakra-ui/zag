import { caseSensitiveSvgAttrs } from "./normalize-props"

export interface Attrs {
  [key: string]: any
}

interface Spread {
  attrs: Attrs
  // The latest handler per event type, called by one stable listener
  handlers: Record<string, EventListener | undefined>
  listeners: Record<string, EventListener>
}

const spreads = new WeakMap<Element, Map<string, Spread>>()

const assignableProps = new Set(["value", "checked", "selected"])

const isEvent = (key: string) => key.startsWith("on")

const getAttributeName = (node: Element, name: string) => {
  const isSvg = node.tagName === "svg" || node.namespaceURI === "http://www.w3.org/2000/svg"
  return isSvg && caseSensitiveSvgAttrs.has(name) ? name : name.toLowerCase()
}

const toCssProperty = (key: string) =>
  key.startsWith("--") ? key : key.replace(/[A-Z]/g, (match) => `-${match.toLowerCase()}`)

// Patches inline styles property by property (like the react adapter) so that styles written
// directly to the element by other code - popper's `--x`/`--y`, the layer stack's `--layer-index` -
// are not wiped when an unrelated style property changes.
const applyStyle = (node: Element, prevStyle: unknown, nextStyle: unknown) => {
  // a raw string means the caller owns the whole attribute
  if (typeof nextStyle === "string") return node.setAttribute("style", nextStyle)
  if (nextStyle == null && typeof prevStyle === "string") return node.removeAttribute("style")

  const style = (node as HTMLElement).style
  if (style == null) return

  for (const key in prevStyle as Attrs) {
    if ((nextStyle as Attrs)?.[key] == null) style.removeProperty(toCssProperty(key))
  }

  for (const key in nextStyle as Attrs) {
    const value = (nextStyle as Attrs)[key]
    if (value == null) style.removeProperty(toCssProperty(key))
    else style.setProperty(toCssProperty(key), String(value))
  }
}

const applyAttr = (node: Element, name: string, value: any, prev: any) => {
  if (name === "class") (node as HTMLElement).className = value ?? ""
  else if (name === "style") applyStyle(node, prev, value)
  // DOM properties (value, checked, etc.) - must come before the boolean check
  else if (assignableProps.has(name)) (node as any)[name] = value ?? ""
  // Booleans toggle the attribute, except aria-* which keep their string values
  else if (typeof value === "boolean" && !name.includes("aria-"))
    node.toggleAttribute(getAttributeName(node, name), value)
  else if (name === "children" && value != null) node.innerHTML = value
  else if (value != null) node.setAttribute(getAttributeName(node, name), value)
  else node.removeAttribute(getAttributeName(node, name))
}

export function spreadProps(node: Element, attrs: Attrs, machineId?: string): () => void {
  const scopeKey = machineId || "default"

  let nodeSpreads = spreads.get(node)
  if (!nodeSpreads) spreads.set(node, (nodeSpreads = new Map()))

  let spread = nodeSpreads.get(scopeKey)
  if (!spread) nodeSpreads.set(scopeKey, (spread = { attrs: {}, handlers: {}, listeners: {} }))

  const { attrs: prevAttrs, handlers, listeners } = spread

  // Handlers change every render, so swap the reference instead of re-adding listeners
  const setHandler = (key: string, handler: EventListener | undefined) => {
    const type = key.slice(2).toLowerCase()
    handlers[type] = handler
    if (handler && !listeners[type]) {
      listeners[type] = (event) => handlers[type]?.call(node, event)
      node.addEventListener(type, listeners[type])
    } else if (!handler && listeners[type]) {
      node.removeEventListener(type, listeners[type])
      delete listeners[type]
    }
  }

  for (const key in prevAttrs) {
    if (attrs[key] != null) continue
    if (isEvent(key)) setHandler(key, undefined)
    else applyAttr(node, key, null, prevAttrs[key])
  }

  for (const key in attrs) {
    const value = attrs[key]
    if (isEvent(key)) setHandler(key, value)
    else if (value !== prevAttrs[key]) applyAttr(node, key, value, prevAttrs[key])
  }

  spread.attrs = attrs

  return function cleanup() {
    for (const type in listeners) node.removeEventListener(type, listeners[type])
    nodeSpreads.delete(scopeKey)
    if (nodeSpreads.size === 0) spreads.delete(node)
  }
}
