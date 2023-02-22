import { getDocument, getWindow } from "@zag-js/dom-query"

function copyVisualStyles(fromEl: HTMLElement | null, toEl: HTMLElement) {
  if (!fromEl) return

  const win = getWindow(fromEl)
  const el = win.getComputedStyle(fromEl)

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

function createGhostElement(doc: Document) {
  var el = doc.createElement("div")
  el.id = "ghost"
  el.style.cssText =
    "display:inline-block;height:0;overflow:hidden;position:absolute;top:0;visibility:hidden;white-space:nowrap;"
  doc.body.appendChild(el)
  return el
}

export function autoResizeInput(input: HTMLInputElement | null) {
  if (!input) return
  const doc = getDocument(input)
  const win = getWindow(input)

  const ghost = createGhostElement(doc)

  copyVisualStyles(input, ghost)

  function resize() {
    win.requestAnimationFrame(() => {
      ghost.innerHTML = input!.value
      const rect = win.getComputedStyle(ghost)
      input?.style.setProperty("width", rect.width)
    })
  }

  resize()

  input?.addEventListener("input", resize)
  input?.addEventListener("change", resize)

  return () => {
    doc.body.removeChild(ghost)
    input?.removeEventListener("input", resize)
    input?.removeEventListener("change", resize)
  }
}
