import { clampValue, mod } from "../number"
import { ColorValue } from "./color"
import {
  fromPolar,
  labToLinearRgb,
  linearRgbToOklab,
  p3ToLinearRgb,
  type Vec3,
  xyzD50ToLinearRgb,
  xyzToLinearRgb,
} from "./math"
import type { ColorType } from "./types"

const NAMES =
  "aliceblue:f0f8ff,antiquewhite:faebd7,aqua:00ffff,aquamarine:7fffd4,azure:f0ffff,beige:f5f5dc,bisque:ffe4c4,black:000000,blanchedalmond:ffebcd,blue:0000ff,blueviolet:8a2be2,brown:a52a2a,burlywood:deb887,cadetblue:5f9ea0,chartreuse:7fff00,chocolate:d2691e,coral:ff7f50,cornflowerblue:6495ed,cornsilk:fff8dc,crimson:dc143c,cyan:00ffff,darkblue:00008b,darkcyan:008b8b,darkgoldenrod:b8860b,darkgray:a9a9a9,darkgreen:006400,darkkhaki:bdb76b,darkmagenta:8b008b,darkolivegreen:556b2f,darkorange:ff8c00,darkorchid:9932cc,darkred:8b0000,darksalmon:e9967a,darkseagreen:8fbc8f,darkslateblue:483d8b,darkslategray:2f4f4f,darkturquoise:00ced1,darkviolet:9400d3,deeppink:ff1493,deepskyblue:00bfff,dimgray:696969,dodgerblue:1e90ff,firebrick:b22222,floralwhite:fffaf0,forestgreen:228b22,fuchsia:ff00ff,gainsboro:dcdcdc,ghostwhite:f8f8ff,gold:ffd700,goldenrod:daa520,gray:808080,green:008000,greenyellow:adff2f,honeydew:f0fff0,hotpink:ff69b4,indianred:cd5c5c,indigo:4b0082,ivory:fffff0,khaki:f0e68c,lavender:e6e6fa,lavenderblush:fff0f5,lawngreen:7cfc00,lemonchiffon:fffacd,lightblue:add8e6,lightcoral:f08080,lightcyan:e0ffff,lightgoldenrodyellow:fafad2,lightgray:d3d3d3,lightgreen:90ee90,lightpink:ffb6c1,lightsalmon:ffa07a,lightseagreen:20b2aa,lightskyblue:87cefa,lightslategray:778899,lightsteelblue:b0c4de,lightyellow:ffffe0,lime:00ff00,limegreen:32cd32,linen:faf0e6,magenta:ff00ff,maroon:800000,mediumaquamarine:66cdaa,mediumblue:0000cd,mediumorchid:ba55d3,mediumpurple:9370db,mediumseagreen:3cb371,mediumslateblue:7b68ee,mediumspringgreen:00fa9a,mediumturquoise:48d1cc,mediumvioletred:c71585,midnightblue:191970,mintcream:f5fffa,mistyrose:ffe4e1,moccasin:ffe4b5,navajowhite:ffdead,navy:000080,oldlace:fdf5e6,olive:808000,olivedrab:6b8e23,orange:ffa500,orangered:ff4500,orchid:da70d6,palegoldenrod:eee8aa,palegreen:98fb98,paleturquoise:afeeee,palevioletred:db7093,papayawhip:ffefd5,peachpuff:ffdab9,peru:cd853f,pink:ffc0cb,plum:dda0dd,powderblue:b0e0e6,purple:800080,rebeccapurple:663399,red:ff0000,rosybrown:bc8f8f,royalblue:4169e1,saddlebrown:8b4513,salmon:fa8072,sandybrown:f4a460,seagreen:2e8b57,seashell:fff5ee,sienna:a0522d,silver:c0c0c0,skyblue:87ceeb,slateblue:6a5acd,slategray:708090,snow:fffafa,springgreen:00ff7f,steelblue:4682b4,tan:d2b48c,teal:008080,thistle:d8bfd8,tomato:ff6347,turquoise:40e0d0,violet:ee82ee,wheat:f5deb3,white:ffffff,whitesmoke:f5f5f5,yellow:ffff00,yellowgreen:9acd32,transparent:00000000"

let names: Map<string, string> | undefined

const getNamedColor = (name: string) => {
  if (!names) {
    names = new Map()
    for (const entry of NAMES.split(",")) {
      const [key, value] = entry.split(":")
      names.set(key, `#${value}`)
      if (key.includes("gray")) names.set(key.replace("gray", "grey"), `#${value}`)
    }
  }
  return names.get(name)
}

const NUMBER = /^[-+]?(?:\d+(?:\.\d*)?|\.\d+)(?:e[-+]?\d+)?$/i
const HEX = /^#[\da-f]+$/i

/** The tokens of `name(a, b, c[, d])` or `name(a b c[ / d])`, for one of `names` */
function args(value: string, names: string[]): string[] | undefined {
  const start = value.indexOf("(")
  if (start < 0 || value[value.length - 1] !== ")" || !names.includes(value.slice(0, start))) return
  const body = value.slice(start + 1, -1)
  let tokens: string[]
  if (body.includes(",")) {
    tokens = body.split(",")
  } else {
    const [main, alpha, ...rest] = body.split("/")
    if (rest.length) return
    tokens = main.trim().split(/\s+/)
    if (alpha !== undefined) tokens.push(alpha)
  }
  return tokens.length < 3 || tokens.length > 4 ? undefined : tokens
}

/** A number, or a percentage where 100% is `percentOf`. Percentages are rejected without it. */
function num(token: string, percentOf?: number): number | undefined {
  token = token.trim()
  const percent = token.endsWith("%")
  if (percent) {
    if (percentOf === undefined) return
    token = token.slice(0, -1)
  }
  if (!NUMBER.test(token)) return
  return percent ? (Number(token) / 100) * percentOf! : Number(token)
}

function parseRgb(value: string): ColorValue | undefined {
  const c: (number | undefined)[] = []
  if (HEX.test(value) && [4, 5, 7, 9].includes(value.length)) {
    const digits = value.length < 6 ? value.replace(/[^#]/g, "$&$&") : value
    for (let i = 1; i < digits.length; i += 2) c.push(parseInt(digits.slice(i, i + 2), 16))
    if (c[3] !== undefined) c[3] /= 255
  }
  const tokens = args(value, ["rgb", "rgba"])
  if (tokens) {
    for (let i = 0; i < tokens.length; i++) {
      const max = i < 3 ? 255 : 1
      const n = num(tokens[i], max)
      if (n === undefined) return
      c[i] = clampValue(n, 0, max)
    }
  }
  if (c.length >= 3) return new ColorValue("rgba", c.slice(0, 3) as Vec3, c[3] ?? 1)
}

/** `hsl()` and `hsb()`: a hue in degrees, two percentages, and alpha */
function parseHue(value: string, name: "hsl" | "hsb"): ColorValue | undefined {
  const tokens = args(value, [name, name + "a"])
  if (!tokens) return
  const hueToken = tokens[0].trim()
  const hue = num(hueToken.endsWith("deg") ? hueToken.slice(0, -3) : hueToken)
  const x = num(tokens[1], 100)
  const y = num(tokens[2], 100)
  const alpha = tokens[3] === undefined ? 1 : num(tokens[3], 1)
  if (hue === undefined || x === undefined || y === undefined || alpha === undefined) return
  const v: Vec3 = [mod(hue, 360), clampValue(x, 0, 100), clampValue(y, 0, 100)]
  return new ColorValue(name === "hsl" ? "hsla" : "hsba", v, clampValue(alpha, 0, 1))
}

/** A CSS number, percentage (as a fraction) or angle (in degrees). `none` and junk are undefined. */
function cssValue(token: string): number | undefined {
  const t = token.trim().toLowerCase()
  const n = Number.parseFloat(t)
  if (t === "none" || !Number.isFinite(n)) return
  if (t.endsWith("%")) return n / 100
  if (t.endsWith("turn")) return n * 360
  if (t.endsWith("grad")) return (n / 400) * 360
  if (t.endsWith("rad")) return (n * 180) / Math.PI
  return n
}

/** The lowercase name, channel tokens and alpha of `name(x y z[ / alpha])` */
function fnArgs(value: string) {
  const open = value.indexOf("(")
  const end = value.lastIndexOf(")")
  if (open < 0 || end < open) return
  const [main, alphaPart] = value.slice(open + 1, end).split(/\s*\/\s*/)
  let alpha = 1
  const av = alphaPart && cssValue(alphaPart)
  if (av !== undefined && av !== "") alpha = clampValue(av, 0, 1)
  return { name: value.slice(0, open).toLowerCase(), tokens: main.trim().split(/\s+/).filter(Boolean), alpha }
}

/** `oklab(L a b[ / alpha])` and `oklch(L C H[ / alpha])` */
function parseOk(value: string): ColorValue | undefined {
  const f = fnArgs(value)
  if (!f || (f.name !== "oklab" && f.name !== "oklch") || f.tokens.length < 3) return
  const { name, tokens, alpha } = f
  const [a, b, c] = tokens.map(cssValue)
  if (a === undefined || b === undefined || c === undefined) return
  const isPercent = (i: number) => tokens[i].endsWith("%")
  if (name === "oklab") return new ColorValue("oklab", [clampValue(a, 0, 1), b, c], alpha)
  // An OKLCH chroma of 100% is 0.5; stored as lightness, hue, chroma
  const chroma = clampValue(isPercent(1) ? b * 0.5 : b, 0, 0.5)
  return new ColorValue("oklch", [isPercent(0) ? a : clampValue(a, 0, 1), mod(c, 360), chroma], alpha)
}

/** Spaces of `color()` that convert through linear sRGB, so colors outside sRGB keep their values */
const LINEAR: Record<string, (v: Vec3) => Vec3> = {
  "srgb-linear": (v) => v,
  "display-p3": p3ToLinearRgb,
  xyz: xyzToLinearRgb,
  "xyz-d65": xyzToLinearRgb,
  "xyz-d50": xyzD50ToLinearRgb,
}

const okFromLinear = (rgb: Vec3, alpha: number) => new ColorValue("oklab", linearRgbToOklab(rgb), alpha)

/**
 * `hwb()`, `lab()`, `lch()` and `color(<space> …)`, read into the closest space the picker works in:
 * HWB into HSB, `color(srgb …)` into RGB, and the rest into OKLab or OKLCH, which hold any visible color.
 */
function parseCss4(value: string): ColorType | undefined {
  const f = fnArgs(value)
  if (!f) return
  const { alpha } = f
  const tokens = [...f.tokens]
  const space = f.name === "color" ? tokens.shift()?.toLowerCase() : f.name
  if (!space || tokens.length !== 3) return
  // `none` is a missing channel, which converts as 0
  const v = tokens.map((t) => (t.toLowerCase() === "none" ? 0 : cssValue(t)))
  if (v.some((n) => n === undefined)) return
  const [x, y, z] = v as Vec3
  const pct = (i: number, of: number, n: number) => (tokens[i].endsWith("%") ? n * of : n)

  switch (space) {
    case "hwb": {
      // whiteness and blackness as fractions: 20% and 20 both mean 0.2
      const w = tokens[1].endsWith("%") ? y : y / 100
      const b = tokens[2].endsWith("%") ? z : z / 100
      const total = w + b
      const brightness = total >= 1 ? w / total : 1 - b
      const saturation = total >= 1 || brightness === 0 ? 0 : 1 - w / brightness
      return new ColorValue("hsba", [mod(x, 360), saturation * 100, brightness * 100], alpha)
    }
    case "srgb":
      return new ColorValue("rgba", [x, y, z].map((n) => clampValue(n * 255, 0, 255)) as Vec3, alpha)
    case "lab":
      return okFromLinear(labToLinearRgb([pct(0, 100, x), pct(1, 125, y), pct(2, 125, z)]), alpha)
    case "lch": {
      const lab = fromPolar([pct(0, 100, x), pct(1, 150, y), z])
      return okFromLinear(labToLinearRgb(lab), alpha).toFormat("oklch")
    }
  }
  const toLinear = LINEAR[space]
  return toLinear && okFromLinear(toLinear([x, y, z]), alpha)
}

export const parseColor = (value: string): ColorType => {
  const named = getNamedColor(value.trim().toLowerCase())
  if (named) return parseColor(named)

  const result =
    parseOk(value) || parseRgb(value) || parseHue(value, "hsb") || parseHue(value, "hsl") || parseCss4(value)

  if (!result) {
    const error = new Error("Invalid color value: " + value)
    Error.captureStackTrace?.(error, parseColor)
    throw error
  }

  return result
}

export const normalizeColor = (v: string | ColorType) => (typeof v === "string" ? parseColor(v) : v)
