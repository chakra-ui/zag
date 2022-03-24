import { getComputedStyle } from "./computed-style"

export function copyVisualStyles(fromEl: HTMLElement, toEl: HTMLElement) {
  const elementStyle = getComputedStyle(fromEl)
  // prettier-ignore
  const elementCssText = 'box-sizing:' + elementStyle.boxSizing +
                      ';border-left:' + elementStyle.borderLeftWidth + ' solid red' +
                      ';border-right:' + elementStyle.borderRightWidth + ' solid red' +
                      ';font-family:' + elementStyle.fontFamily +
                      ';font-feature-settings:' + elementStyle.fontFeatureSettings +
                      ';font-kerning:' + elementStyle.fontKerning +
                      ';font-size:' + elementStyle.fontSize +
                      ';font-stretch:' + elementStyle.fontStretch +
                      ';font-style:' + elementStyle.fontStyle +
                      ';font-variant:' + elementStyle.fontVariant +
                      ';font-variant-caps:' + elementStyle.fontVariantCaps +
                      ';font-variant-ligatures:' + elementStyle.fontVariantLigatures +
                      ';font-variant-numeric:' + elementStyle.fontVariantNumeric +
                      ';font-weight:' + elementStyle.fontWeight +
                      ';letter-spacing:' + elementStyle.letterSpacing +
                      ';margin-left:' + elementStyle.marginLeft +
                      ';margin-right:' + elementStyle.marginRight +
                      ';padding-left:' + elementStyle.paddingLeft +
                      ';padding-right:' + elementStyle.paddingRight +
                      ';text-indent:' + elementStyle.textIndent +
                      ';text-transform:' + elementStyle.textTransform

  toEl.style.cssText += elementCssText
}
