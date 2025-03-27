import { noop } from "./shared"

export function setAttribute(el: Element, attr: string, v: string) {
  const prev = el.getAttribute(attr)
  const exists = prev != null
  el.setAttribute(attr, v)
  return () => {
    if (!exists) {
      el.removeAttribute(attr)
    } else {
      el.setAttribute(attr, prev)
    }
  }
}

export function setProperty<T extends Element, K extends keyof T & string>(el: T, prop: K, v: T[K]) {
  const exists = prop in el
  const prev = el[prop]
  el[prop] = v
  return () => {
    if (!exists) {
      delete el[prop]
    } else {
      el[prop] = prev
    }
  }
}

export function setStyle(el: HTMLElement | null | undefined, style: Partial<CSSStyleDeclaration>) {
  if (!el) return noop
  const prev = Object.keys(style).reduce<Record<string, string>>((acc, key) => {
    acc[key] = el.style.getPropertyValue(key)
    return acc
  }, {})
  const exists = Object.keys(prev).length > 0
  Object.assign(el.style, style)
  return () => {
    if (!exists) {
      el.removeAttribute("style")
    } else {
      Object.assign(el.style, prev)
    }
  }
}

export function setStyleProperty(el: HTMLElement | null | undefined, prop: string, value: string) {
  if (!el) return noop
  const prev = el.style.getPropertyValue(prop)
  const exists = prev != null
  el.style.setProperty(prop, value)
  return () => {
    if (!exists) {
      el.style.removeProperty(prop)
    } else {
      el.style.setProperty(prop, prev)
    }
  }
}
