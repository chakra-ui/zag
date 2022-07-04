type Key = keyof CSSStyleDeclaration | (string & {})
type Styles = Record<Key, any>
type El = HTMLElement | null | undefined

function getCache(): WeakMap<HTMLElement, Styles> {
  const g = globalThis as any
  g.__styleCache = g.__styleCache || new WeakMap()
  return g.__styleCache
}

export function getComputedStyle(el: El): Styles {
  if (!el) return {} as Styles
  const cache = getCache()
  let style: Styles | undefined = cache.get(el)
  if (!style) {
    const win = el?.ownerDocument.defaultView ?? window
    style = win.getComputedStyle(el) as Styles
    cache.set(el, style)
  }
  return style
}
