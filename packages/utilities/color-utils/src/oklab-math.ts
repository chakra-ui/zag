/**
 * OKLab / linear sRGB conversion (Björn Ottosson / CSS Color 4).
 * https://bottosson.github.io/posts/oklab/
 */

export interface LinearRgb {
  r: number
  g: number
  b: number
}

export interface Oklab {
  L: number
  a: number
  b: number
}

export function srgbChannelToLinear(c: number): number {
  return c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4
}

export function linearChannelToSrgb(c: number): number {
  return c <= 0.0031308 ? 12.92 * c : 1.055 * c ** (1 / 2.4) - 0.055
}

export function srgbToLinearRgb(r255: number, g255: number, b255: number): LinearRgb {
  return {
    r: srgbChannelToLinear(r255 / 255),
    g: srgbChannelToLinear(g255 / 255),
    b: srgbChannelToLinear(b255 / 255),
  }
}

export function linearRgbToSrgb({ r, g, b }: LinearRgb): { r: number; g: number; b: number } {
  return {
    r: Math.round(clamp01(linearChannelToSrgb(r)) * 255),
    g: Math.round(clamp01(linearChannelToSrgb(g)) * 255),
    b: Math.round(clamp01(linearChannelToSrgb(b)) * 255),
  }
}

function clamp01(x: number): number {
  return x < 0 ? 0 : x > 1 ? 1 : x
}

export function linearRgbToOklab({ r, g, b }: LinearRgb): Oklab {
  const l = 0.412_221_470_8 * r + 0.536_332_536_3 * g + 0.051_445_992_9 * b
  const m = 0.211_903_498_2 * r + 0.680_699_545_1 * g + 0.107_396_956_6 * b
  const s = 0.088_302_461_9 * r + 0.281_718_837_6 * g + 0.629_978_700_5 * b

  const l_ = Math.cbrt(l)
  const m_ = Math.cbrt(m)
  const s_ = Math.cbrt(s)

  return {
    L: 0.210_454_255_3 * l_ + 0.793_617_785 * m_ - 0.004_072_046_8 * s_,
    a: 1.977_998_495_1 * l_ - 2.428_592_205 * m_ + 0.450_593_709_9 * s_,
    b: 0.025_904_037_1 * l_ + 0.782_771_766_2 * m_ - 0.808_675_766 * s_,
  }
}

export function oklabToLinearRgb(L: number, a: number, b: number): LinearRgb {
  const l_ = L + 0.396_337_777_4 * a + 0.215_803_757_3 * b
  const m_ = L - 0.105_561_345_8 * a - 0.063_854_172_8 * b
  const s_ = L - 0.089_484_177_5 * a - 1.291_485_548 * b

  const l = l_ * l_ * l_
  const m = m_ * m_ * m_
  const s = s_ * s_ * s_

  return {
    r: +4.076_741_662_1 * l - 3.307_711_591_3 * m + 0.230_969_929_2 * s,
    g: -1.268_438_004_6 * l + 2.609_757_401_1 * m - 0.341_319_396 * s,
    b: -0.004_196_086_3 * l - 0.703_418_614_7 * m + 1.707_614_701 * s,
  }
}

export function oklchToOklab(L: number, C: number, Hdeg: number): Oklab {
  const h = (Hdeg * Math.PI) / 180
  return {
    L,
    a: C * Math.cos(h),
    b: C * Math.sin(h),
  }
}

export function oklabToOklch(L: number, a: number, b: number): { L: number; C: number; H: number } {
  const C = Math.sqrt(a * a + b * b)
  let H = (Math.atan2(b, a) * 180) / Math.PI
  if (H < 0) H += 360
  return { L, C, H }
}

export function isLinearRgbInSrgbGamut({ r, g, b }: LinearRgb, eps = 0.001): boolean {
  return r >= -eps && r <= 1 + eps && g >= -eps && g <= 1 + eps && b >= -eps && b <= 1 + eps
}

/* --------------------------------------------------------------------------
 * Display P3 ↔ sRGB (both use the same 2.2-ish transfer curve)
 * --------------------------------------------------------------------------*/

/** Convert Display P3 linear RGB to linear sRGB via XYZ D65. */
export function linearDisplayP3ToLinearSrgb(r: number, g: number, b: number): LinearRgb {
  // Display P3 → XYZ D65
  const x = 0.4865709486482162 * r + 0.26566769316909306 * g + 0.1982172852343625 * b
  const y = 0.2289745640697488 * r + 0.6917385218365064 * g + 0.079286914093745 * b
  const z = 0.0 * r + 0.04511338185890264 * g + 1.043944368900976 * b
  // XYZ D65 → linear sRGB
  return {
    r: 3.2404541621141054 * x - 1.5371385940306089 * y - 0.4985314095560158 * z,
    g: -0.9692660305051868 * x + 1.8760108454466942 * y + 0.0415560175303498 * z,
    b: 0.0556434309591147 * x - 0.2039769598730574 * y + 1.0572251882231791 * z,
  }
}

/**
 * HSV (0-360, 0-1, 0-1) → RGB (0-1).
 * Standard HSV-to-RGB conversion; the resulting RGB values are in whichever
 * gamut the caller considers them to be (sRGB or Display P3).
 */
export function hsvToRgb(h: number, s: number, v: number): [number, number, number] {
  const c = v * s
  const x = c * (1 - Math.abs(((h / 60) % 2) - 1))
  const m = v - c
  let r1 = 0,
    g1 = 0,
    b1 = 0
  if (h < 60) {
    r1 = c
    g1 = x
    b1 = 0
  } else if (h < 120) {
    r1 = x
    g1 = c
    b1 = 0
  } else if (h < 180) {
    r1 = 0
    g1 = c
    b1 = x
  } else if (h < 240) {
    r1 = 0
    g1 = x
    b1 = c
  } else if (h < 300) {
    r1 = x
    g1 = 0
    b1 = c
  } else {
    r1 = c
    g1 = 0
    b1 = x
  }
  return [r1 + m, g1 + m, b1 + m]
}

/**
 * Check whether an HSV color (interpreted in the Display P3 gamut) falls
 * inside the sRGB gamut. This is how Chrome DevTools draws the sRGB boundary
 * on the color picker when in oklch/oklab mode.
 */
export function isDisplayP3HsvInSrgbGamut(h: number, s: number, v: number, eps = 0.001): boolean {
  const [r, g, b] = hsvToRgb(h, s, v)
  // Gamma decode (P3 uses the same transfer function as sRGB)
  const lr = srgbChannelToLinear(r)
  const lg = srgbChannelToLinear(g)
  const lb = srgbChannelToLinear(b)
  // P3 linear → sRGB linear
  const srgb = linearDisplayP3ToLinearSrgb(lr, lg, lb)
  return isLinearRgbInSrgbGamut(srgb, eps)
}
