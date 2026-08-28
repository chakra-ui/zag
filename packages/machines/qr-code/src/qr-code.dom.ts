import type { Scope } from "@zag-js/core"
import { getDataUrl as svgToDataUrl, getWindow, type DataUrlOptions } from "@zag-js/dom-query"
import { parts } from "./qr-code.anatomy"

const SVG_NS = "http://www.w3.org/2000/svg"

type Win = ReturnType<typeof getWindow>

export const getRootId = (scope: Scope) => scope.ids?.root ?? `${scope.id}:root`
export const getFrameId = (scope: Scope) => scope.ids?.frame ?? `${scope.id}:frame`
export const getOverlayId = (scope: Scope) => scope.ids?.overlay ?? `${scope.id}:overlay`

export const getFrameEl = (scope: Scope) => scope.query<SVGSVGElement>(scope.selector(parts.frame))
export const getOverlayEl = (scope: Scope) => scope.query<HTMLElement>(scope.selector(parts.overlay))

export async function getDataUrl(scope: Scope, options: DataUrlOptions): Promise<string> {
  const svgEl = getFrameEl(scope)
  const overlayEl = getOverlayEl(scope)
  if (!svgEl || !overlayEl) return svgToDataUrl(svgEl, options)

  const svgRect = svgEl.getBoundingClientRect()
  const overlayRect = overlayEl.getBoundingClientRect()
  const href = svgRect.width && overlayRect.width ? await getOverlayHref(overlayEl) : null
  if (!href) return svgToDataUrl(svgEl, options)

  const viewBox = svgEl.viewBox.baseVal
  const sx = (viewBox.width || svgRect.width) / svgRect.width
  const sy = (viewBox.height || svgRect.height) / svgRect.height
  const x = (overlayRect.left - svgRect.left) * sx
  const y = (overlayRect.top - svgRect.top) * sy
  const w = overlayRect.width * sx
  const h = overlayRect.height * sy

  const style = getWindow(overlayEl).getComputedStyle(overlayEl)
  const pad = style.outlineStyle === "none" ? 0 : (parseFloat(style.outlineWidth) || 0) * sx

  const clone = svgEl.cloneNode(true) as SVGSVGElement
  clone.querySelectorAll("foreignObject").forEach((node) => node.remove())

  const fill = pad ? style.outlineColor : style.backgroundColor
  if (pad || (fill && fill !== "transparent" && fill !== "rgba(0, 0, 0, 0)")) {
    const rect = clone.ownerDocument.createElementNS(SVG_NS, "rect")
    rect.setAttribute("x", String(x - pad))
    rect.setAttribute("y", String(y - pad))
    rect.setAttribute("width", String(w + pad * 2))
    rect.setAttribute("height", String(h + pad * 2))
    rect.setAttribute("fill", fill)
    clone.appendChild(rect)
  }

  const image = clone.ownerDocument.createElementNS(SVG_NS, "image")
  image.setAttribute("href", href)
  image.setAttribute("x", String(x))
  image.setAttribute("y", String(y))
  image.setAttribute("width", String(w))
  image.setAttribute("height", String(h))
  clone.appendChild(image)

  return svgToDataUrl(clone, { ...options, size: { width: svgRect.width, height: svgRect.height } })
}

async function getOverlayHref(overlay: Element) {
  const img = overlay.localName === "img" ? (overlay as HTMLImageElement) : overlay.querySelector("img")
  if (img) {
    const src = img.currentSrc || img.src
    if (!src) return null
    if (src.startsWith("data:")) return src
    try {
      return await imageToDataUrl(getWindow(overlay), src)
    } catch {
      return null
    }
  }

  const svg = overlay.localName === "svg" ? (overlay as SVGSVGElement) : overlay.querySelector("svg")
  if (!svg) return null
  const clone = svg.cloneNode(true) as SVGSVGElement
  clone.setAttribute("xmlns", SVG_NS)
  return "data:image/svg+xml;charset=utf-8," + encodeURIComponent(new XMLSerializer().serializeToString(clone))
}

function imageToDataUrl(win: Win, src: string) {
  return new Promise<string>((resolve, reject) => {
    const img = new win.Image()
    img.crossOrigin = "anonymous"
    img.onload = () => {
      const canvas = win.document.createElement("canvas")
      canvas.width = img.naturalWidth || img.width
      canvas.height = img.naturalHeight || img.height
      const context = canvas.getContext("2d")
      if (!canvas.width || !context) {
        reject()
        return
      }
      context.drawImage(img, 0, 0)
      resolve(canvas.toDataURL())
    }
    img.onerror = () => reject()
    img.src = src
  })
}
