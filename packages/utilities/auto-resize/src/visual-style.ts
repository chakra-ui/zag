import { getComputedStyle } from "@zag-js/dom-query"

export function getVisualStyles(node: HTMLElement | null) {
  if (!node) return
  const style = getComputedStyle(node)

  // prettier-ignore
  return 'box-sizing:' + style.boxSizing +
                      ';border-left:' + style.borderLeftWidth + ' solid red' +
                      ';border-right:' + style.borderRightWidth + ' solid red' +
                      ';font-family:' + style.fontFamily +
                      ';font-feature-settings:' + style.fontFeatureSettings +
                      ';font-kerning:' + style.fontKerning +
                      ';font-size:' + style.fontSize +
                      ';font-stretch:' + style.fontStretch +
                      ';font-style:' + style.fontStyle +
                      ';font-variant:' + style.fontVariant +
                      ';font-variant-caps:' + style.fontVariantCaps +
                      ';font-variant-ligatures:' + style.fontVariantLigatures +
                      ';font-variant-numeric:' + style.fontVariantNumeric +
                      ';font-weight:' + style.fontWeight +
                      ';letter-spacing:' + style.letterSpacing +
                      ';margin-left:' + style.marginLeft +
                      ';margin-right:' + style.marginRight +
                      ';padding-left:' + style.paddingLeft +
                      ';padding-right:' + style.paddingRight +
                      ';text-indent:' + style.textIndent +
                      ';text-transform:' + style.textTransform
}

export function getLayoutStyles(node: HTMLElement | null) {
  if (!node) return
  const style = getComputedStyle(node)
  // prettier-ignore
  return 'width:' + style.width +
         ';max-width:' + style.maxWidth +
         ';min-width:' + style.minWidth +
         ';height:' + style.height +
         ';max-height:' + style.maxHeight +
         ';min-height:' + style.minHeight +
         ';box-sizing:' + style.boxSizing
}
