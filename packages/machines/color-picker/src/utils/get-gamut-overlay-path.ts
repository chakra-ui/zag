import { isDisplayP3HsvInSrgbGamut, type ColorChannel, type ColorFormat } from "@zag-js/color-utils"
import type { Color } from "@zag-js/color-utils"

interface GamutOverlayOptions {
  xChannel: ColorChannel
  yChannel: ColorChannel
}

export interface GamutOverlayData {
  path: string
  labelPosition: { x: number; y: number }
}

export interface GamutOverlayComputeOptions {
  /**
   * Device pixel ratio; higher values sample more rows along brightness (Chrome DevTools–style).
   * Default `1` when not passed (callers may pass `globalThis.devicePixelRatio` in browsers).
   */
  pixelRatio?: number | undefined
}

/**
 * Computes an SVG path (0–100 user units) tracing the sRGB gamut boundary
 * over the HSB color area when in a wide-gamut output format (oklch/oklab).
 *
 * Approach (matching Chrome DevTools): treat the HSV area as Display P3 gamut,
 * then for each brightness row, sweep saturation left→right to find where
 * the P3 color exits the sRGB gamut.
 */
export function getGamutOverlayData(
  areaValue: Color,
  axes: GamutOverlayOptions,
  format: ColorFormat,
  options?: GamutOverlayComputeOptions,
): GamutOverlayData | null {
  if (format !== "oklch" && format !== "oklab") return null
  if (axes.xChannel !== "saturation" || axes.yChannel !== "brightness") return null

  const hue = areaValue.getChannelValue("hue")
  const pixelRatio = options?.pixelRatio ?? 1
  return buildDisplayP3GamutPath(hue, pixelRatio)
}

/** Visible boundary rows scale with DPR (analogous to Chrome `step = 1 / devicePixelRatio` in px space). */
export function gamutOverlayRowCount(pixelRatio: number): number {
  const pr = Math.max(1, pixelRatio)
  return Math.min(200, Math.max(32, Math.round(80 * pr)))
}

function buildDisplayP3GamutPath(hue: number, pixelRatio: number): GamutOverlayData | null {
  const steps = gamutOverlayRowCount(pixelRatio)
  const points: { x: number; y: number }[] = []

  for (let i = 0; i <= steps; i++) {
    const brightness = i / steps
    if (brightness < 0.01) continue

    // Binary search: find max saturation (0-1) that's still in sRGB
    let lo = 0
    let hi = 1
    for (let j = 0; j < 20; j++) {
      const mid = (lo + hi) / 2
      if (isDisplayP3HsvInSrgbGamut(hue, mid, brightness)) {
        lo = mid
      } else {
        hi = mid
      }
    }

    const xp = Math.min(lo * 100, 100)
    const yp = 100 - brightness * 100
    points.push({ x: xp, y: yp })
  }

  if (points.length < 2) return null

  // Build path
  const cmds = points.map((p, i) => `${i === 0 ? "M" : "L"} ${p.x.toFixed(2)} ${p.y.toFixed(2)}`)

  // Label: fixed y at bottom, x interpolated from the line at that y.
  const labelY = 96
  let labelX = points[0].x
  for (let i = 0; i < points.length - 1; i++) {
    const a = points[i],
      b = points[i + 1]
    if ((a.y >= labelY && b.y <= labelY) || (a.y <= labelY && b.y >= labelY)) {
      const t = (labelY - a.y) / (b.y - a.y)
      labelX = a.x + t * (b.x - a.x)
      break
    }
  }
  // If labelY is below all points, use the bottom-most point's x
  if (points[0].y < labelY) labelX = points[0].x

  return {
    path: cmds.join(" "),
    labelPosition: { x: Math.min(labelX - 16, 99), y: labelY },
  }
}
