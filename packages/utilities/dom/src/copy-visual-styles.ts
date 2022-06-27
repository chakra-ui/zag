import { getComputedStyle } from "./get-computed-style"

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
