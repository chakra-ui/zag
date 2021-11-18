type Key = keyof CSSStyleDeclaration | (string & {})
type Styles = Record<Key, any>
type El = HTMLElement | null | undefined

const styleCache: WeakMap<HTMLElement, Styles> = new WeakMap()

export function getComputedStyle(el: El): Styles {
  if (!el) return {} as Styles
  let style: Styles | undefined = styleCache.get(el)
  if (!style) {
    const win = el?.ownerDocument.defaultView ?? window
    style = win.getComputedStyle(el) as Styles
    styleCache.set(el, style)
  }
  return style
}

export function setElementStyle(el: El, styles: Styles) {
  if (!el) return
  for (const key in styles) el.style.setProperty(key, styles[key])
}

export function checkElementStyle(el: El, k: Key, v: string | string[]) {
  if (!el) return false
  const style = getComputedStyle(el)
  const val = Array.isArray(v) ? v : [v]
  const vv = style?.getPropertyValue(k)
  return vv !== null ? val.includes(vv) : false
}
