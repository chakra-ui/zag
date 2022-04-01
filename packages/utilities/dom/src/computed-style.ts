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

export function copyVisualStyles(fromEl: HTMLElement | null, toEl: HTMLElement) {
  if (!fromEl) return
  const el = getComputedStyle(fromEl)
  // prettier-ignore
  const cssText = 'box-sizing:' + el.boxSizing +
                      ';border-left:' + el.borderLeftWidth + ' solid red' +
                      ';border-right:' + el.borderRightWidth + ' solid red' +
                      ';font-family:' + el.fontFamily +
                      ';font-feature-settings:' + el.fontFeatureSettings +
                      ';font-kerning:' + el.fontKerning +
                      ';font-size:' + el.fontSize +
                      ';font-stretch:' + el.fontStretch +
                      ';font-style:' + el.fontStyle +
                      ';font-variant:' + el.fontVariant +
                      ';font-variant-caps:' + el.fontVariantCaps +
                      ';font-variant-ligatures:' + el.fontVariantLigatures +
                      ';font-variant-numeric:' + el.fontVariantNumeric +
                      ';font-weight:' + el.fontWeight +
                      ';letter-spacing:' + el.letterSpacing +
                      ';margin-left:' + el.marginLeft +
                      ';margin-right:' + el.marginRight +
                      ';padding-left:' + el.paddingLeft +
                      ';padding-right:' + el.paddingRight +
                      ';text-indent:' + el.textIndent +
                      ';text-transform:' + el.textTransform

  toEl.style.cssText += cssText
}
