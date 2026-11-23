// Color math on plain numbers: sRGB gamma, OKLab and OKLCH, and gamut checks.

export type Vec3 = [number, number, number]

export const clamp01 = (x: number) => (x < 0 ? 0 : x > 1 ? 1 : x)

export const toLinear = (c: number) => (c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4)
export const fromLinear = (c: number) => (c <= 0.0031308 ? 12.92 * c : 1.055 * c ** (1 / 2.4) - 0.055)

export const mul = (m: number[], [x, y, z]: Vec3): Vec3 => [
  m[0] * x + m[1] * y + m[2] * z,
  m[3] * x + m[4] * y + m[5] * z,
  m[6] * x + m[7] * y + m[8] * z,
]

// https://bottosson.github.io/posts/oklab
const RGB_LMS = [
  0.4122214708, 0.5363325363, 0.0514459929, 0.2119034982, 0.6806995451, 0.1073969566, 0.0883024619, 0.2817188376,
  0.6299787005,
]
const LMS_LAB = [
  0.2104542553, 0.793617785, -0.0040720468, 1.9779984951, -2.428592205, 0.4505937099, 0.0259040371, 0.7827717662,
  -0.808675766,
]
const LAB_LMS = [1, 0.3963377774, 0.2158037573, 1, -0.1055613458, -0.0638541728, 1, -0.0894841775, -1.291485548]
const LMS_RGB = [
  4.0767416621, -3.3077115913, 0.2309699292, -1.2684380046, 2.6097574011, -0.341319396, -0.0041960863, -0.7034186147,
  1.707614701,
]
// Display P3 to linear sRGB, through XYZ D65 (CSS Color 4)
const P3_SRGB = [
  1.2249401762805596, -0.22494017628055993, 0, -0.04205695470968818, 1.0420569547096883, 0, -0.019637554590334436,
  -0.07863604555063189, 1.0982736001409663,
]

// CSS Color 4: XYZ (D65) to linear sRGB, and the D50 to D65 white point adaptation
const XYZ_SRGB = [
  12831 / 3959,
  -329 / 214,
  -1974 / 3959,
  -851781 / 878810,
  1648619 / 878810,
  36519 / 878810,
  705 / 12673,
  -2585 / 12673,
  705 / 667,
]
const D50_D65 = [
  0.955473421488075, -0.02309845494876471, 0.06325924320057072, -0.0283697093338637, 1.0099953980813041,
  0.021041441191917323, 0.012314014864481998, -0.020507649298898964, 1.330365926242124,
]
const D50_WHITE: Vec3 = [0.3457 / 0.3585, 1, (1 - 0.3457 - 0.3585) / 0.3585]
const KAPPA = 24389 / 27
const EPSILON = 216 / 24389

const SRGB_P3 = [
  0.8224619687143625, 0.17753803128563778, 0, 0.033194198850961636, 0.9668058011490384, 0, 0.01708263072112004,
  0.07239744066396346, 0.9105199286149167,
]

export const linearRgbToP3 = (rgb: Vec3) => mul(SRGB_P3, rgb).map(fromLinear) as Vec3
export const xyzToLinearRgb = (xyz: Vec3) => mul(XYZ_SRGB, xyz)
export const xyzD50ToLinearRgb = (xyz: Vec3) => xyzToLinearRgb(mul(D50_D65, xyz))
export const p3ToLinearRgb = (p3: Vec3) => mul(P3_SRGB, p3.map(toLinear) as Vec3)

/** CIE Lab (D50, lightness 0-100) to linear sRGB */
export const labToLinearRgb = ([L, a, b]: Vec3) => {
  const y = (L + 16) / 116
  const x = a / 500 + y
  const z = y - b / 200
  const f = (t: number) => (t ** 3 > EPSILON ? t ** 3 : (116 * t - 16) / KAPPA)
  return xyzD50ToLinearRgb([
    f(x) * D50_WHITE[0],
    (L > KAPPA * EPSILON ? y ** 3 : L / KAPPA) * D50_WHITE[1],
    f(z) * D50_WHITE[2],
  ])
}

/** Polar (lightness, chroma, hue in degrees) to rectangular coordinates */
export const fromPolar = ([L, C, H]: Vec3): Vec3 => {
  const h = (H * Math.PI) / 180
  return [L, C * Math.cos(h), C * Math.sin(h)]
}

export const linearRgbToOklab = (rgb: Vec3) => mul(LMS_LAB, mul(RGB_LMS, rgb).map(Math.cbrt) as Vec3)
export const oklabToLinearRgb = (lab: Vec3) => mul(LMS_RGB, mul(LAB_LMS, lab).map((v) => v * v * v) as Vec3)

export const oklchToOklab = fromPolar

export const oklabToOklch = ([L, a, b]: Vec3): Vec3 => {
  const H = (Math.atan2(b, a) * 180) / Math.PI
  return [L, Math.sqrt(a * a + b * b), H < 0 ? H + 360 : H]
}

export const isLinearRgbInSrgbGamut = (rgb: Vec3, eps = 0.001) => rgb.every((v) => v >= -eps && v <= 1 + eps)

/** HSV (hue in degrees, saturation and value from 0 to 1) to RGB from 0 to 1 */
export const hsvToRgb = (h: number, s: number, v: number): Vec3 => {
  const f = (n: number, k = (n + h / 60) % 6) => v - v * s * Math.max(Math.min(k, 4 - k, 1), 0)
  return [f(5), f(3), f(1)]
}

/** Whether an HSV color in Display P3 is inside sRGB */
export const isDisplayP3HsvInSrgbGamut = (h: number, s: number, v: number, eps = 0.001) =>
  isLinearRgbInSrgbGamut(p3ToLinearRgb(hsvToRgb(h, s, v)), eps)
