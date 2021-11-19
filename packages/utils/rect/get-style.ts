const cache: WeakMap<HTMLElement, CSSStyleDeclaration> = new WeakMap()

export function getStyle(el: HTMLElement): CSSStyleDeclaration {
  if (!el) return {} as CSSStyleDeclaration
  let style: CSSStyleDeclaration | undefined = cache.get(el)
  if (!style) {
    const win = el?.ownerDocument.defaultView || window
    style = win.getComputedStyle(el)
    cache.set(el, style)
  }
  return style
}
