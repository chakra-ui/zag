import { ColorValue } from "./color"
import { isDisplayP3HsvInSrgbGamut } from "./math"
import type { ColorChannel, ColorType } from "./types"

interface GradientOptions {
  xChannel: ColorChannel
  yChannel: ColorChannel
  dir?: "rtl" | "ltr" | undefined
}

interface GradientStyles {
  areaStyles: Record<string, string>
  areaGradientStyles: Record<string, string>
}

const HUES = [0, 60, 120, 180, 240, 300]

/** Stops around the hue wheel, with `last` closing it (359 or 360) */
const hueStops = (stop: (hue: number) => string, last: number) => [...HUES, last].map(stop).join(",")
const hueStrip = (alpha: number | string) => hueStops((h) => `hsla(${h},100%,50%,${alpha})`, 359)

const masked = (background: Record<string, string>, maskImage: string) => ({
  ...background,
  WebkitMaskImage: maskImage,
  maskImage,
})

/**
 * The CSS for a 2D color area: the plane of two channels, with the third (`z`) fixed at the color's value.
 * `a` and `b` are the gradient's two sides, flipped as the x channel needs.
 */
export function getColorAreaGradient(color: ColorType, options: GradientOptions): GradientStyles {
  const { xChannel, yChannel, dir: dirProp = "ltr" } = options
  const { zChannel } = color.getColorAxes({ xChannel, yChannel })
  const z = color.getChannelValue(zChannel)
  const { minValue, maxValue } = color.getChannelRange(zChannel)
  const alpha = (z - minValue) / (maxValue - minValue)
  const sides = ["top", dirProp === "rtl" ? "left" : "right"]
  const format = color.getFormat()

  // Sides of the two gradients, given whether the x channel runs along the first
  const at = (flip: boolean) => [sides[Number(flip)], sides[Number(!flip)]]
  const empty = { areaStyles: {}, areaGradientStyles: {} }

  switch (zChannel) {
    case "red":
    case "green":
    case "blue": {
      const index = ["red", "green", "blue"].indexOf(zChannel)
      const [a, b] = at(xChannel === (zChannel === "red" ? "green" : "red"))
      const rgb = (x: number, y: number) => {
        const v = [x, y]
        v.splice(index, 0, z)
        return `rgb(${v.join(",")})`
      }
      return {
        areaStyles: { backgroundImage: `linear-gradient(to ${a},${rgb(0, 0)},${rgb(255, 0)})` },
        areaGradientStyles: masked(
          { backgroundImage: `linear-gradient(to ${a},${rgb(0, 255)},${rgb(255, 255)})` },
          `linear-gradient(to ${b}, transparent, #000)`,
        ),
      }
    }

    case "hue": {
      const [a, b] = at(xChannel !== "saturation")
      const background =
        format === "hsla"
          ? [
              `linear-gradient(to ${a}, hsla(0,0%,0%,1) 0%, hsla(0,0%,0%,0) 50%, hsla(0,0%,100%,0) 50%, hsla(0,0%,100%,1) 100%)`,
              `linear-gradient(to ${b},hsl(0,0%,50%),hsla(0,0%,50%,0))`,
            ]
          : [
              `linear-gradient(to ${a},hsl(0,0%,0%),hsla(0,0%,0%,0))`,
              `linear-gradient(to ${b},hsl(0,0%,100%),hsla(0,0%,100%,0))`,
            ]
      return { areaStyles: {}, areaGradientStyles: { background: [...background, `hsl(${z}, 100%, 50%)`].join(",") } }
    }

    case "saturation": {
      const [a, b] = at(xChannel === "hue")
      const background =
        format === "hsla"
          ? [
              `linear-gradient(to ${b}, hsla(0,0%,0%,${alpha}) 0%, hsla(0,0%,0%,0) 50%, hsla(0,0%,100%,0) 50%, hsla(0,0%,100%,${alpha}) 100%)`,
              `linear-gradient(to ${a},${hueStrip(alpha)})`,
              "hsl(0, 0%, 50%)",
            ]
          : [
              `linear-gradient(to ${b},hsla(0,0%,0%,${alpha}),hsla(0,0%,0%,0))`,
              `linear-gradient(to ${a},${hueStrip(alpha)})`,
              `linear-gradient(to ${b},hsl(0,0%,0%),hsl(0,0%,100%))`,
            ]
      return { areaStyles: {}, areaGradientStyles: { background: background.join(",") } }
    }

    case "brightness": {
      const [a, b] = at(xChannel === "hue")
      const background = [
        `linear-gradient(to ${b},hsla(0,0%,100%,${alpha}),hsla(0,0%,100%,0))`,
        `linear-gradient(to ${a},${hueStrip(alpha)})`,
        "#000",
      ]
      return { areaStyles: {}, areaGradientStyles: { background: background.join(",") } }
    }

    case "lightness": {
      if (format === "oklab") {
        const [a, b] = at(xChannel === "b")
        const l = z === 0 ? "none" : `${(z * 100).toFixed(2)}%`
        const mask = `linear-gradient(to ${b}, black, transparent)`
        const plane = (y: string) => `linear-gradient(to ${a} in oklab, oklab(${l} -100% ${y}), oklab(${l} 100% ${y}))`
        return {
          areaStyles: { background: plane("100%") },
          areaGradientStyles: { background: plane("-100%"), maskImage: mask, WebkitMaskImage: mask },
        }
      }
      const [a, b] = at(xChannel === "hue")
      const backgroundImage = [
        `linear-gradient(to ${b},hsl(0,0%,${z}%),hsla(0,0%,${z}%,0))`,
        `linear-gradient(to ${a},${hueStops((h) => `hsl(${h},100%,${z}%)`, 360)})`,
      ].join(",")
      return { areaStyles: {}, areaGradientStyles: { backgroundImage } }
    }
  }

  return empty
}

const RAINBOW =
  "rgb(255, 0, 0) 0%, rgb(255, 255, 0) 17%, rgb(0, 255, 0) 33%, rgb(0, 255, 255) 50%, rgb(0, 0, 255) 67%, rgb(255, 0, 255) 83%, rgb(255, 0, 0) 100%"

/** The CSS gradient along one channel, from its minimum to its maximum, toward `side` (`"right"`, `"left"`, `"top"`) */
export function getChannelGradient(color: ColorType, channel: ColorChannel, side: string): string {
  const format = color.getFormat()
  if (channel === "hue") {
    if (format !== "oklch") return `linear-gradient(to ${side}, ${RAINBOW})`
    const L = color.getChannelValue("lightness")
    const C = color.getChannelValue("chroma")
    return `linear-gradient(to ${side} in oklch increasing hue, oklch(${L} ${C} 0), oklch(${L} ${C} 360))`
  }
  const { minValue, maxValue } = color.getChannelRange(channel)
  const at = (v: number) => color.withChannelValue(channel, v).toString("css")
  // Lightness passes through its middle, so the gradient doesn't wash out
  const stops = channel === "lightness" ? [minValue, (maxValue - minValue) / 2, maxValue] : [minValue, maxValue]
  const space =
    (format === "oklab" && (channel === "a" || channel === "b")) || (format === "oklch" && channel === "chroma")
      ? ` in ${format}`
      : ""
  return `linear-gradient(to ${side}${space}, ${stops.map(at).join(", ")})`
}

/** The color a channel's slider thumb shows: the full hue for hue, the opaque color for the rest */
export function getChannelThumbColor(color: ColorType, channel: ColorChannel): ColorType {
  if (channel === "alpha") return color
  if (channel === "hue" && color.getFormat() !== "oklch") {
    return new ColorValue("hsla", [color.getChannelValue("hue"), 100, 50], 1)
  }
  return color.withChannelValue("alpha", 1)
}

export interface SrgbGamutPath {
  /** SVG path in a 0-100 box */
  path: string
  /** Where to put an "sRGB" label, near the bottom of the line */
  labelPosition: { x: number; y: number }
}

const gamutRows = (pixelRatio: number) => Math.min(200, Math.round(80 * Math.max(1, pixelRatio)))

/**
 * The line where colors leave sRGB on a saturation (x) by brightness (y) plane of `hue`, reading the plane as
 * Display P3. Each row binary-searches the highest saturation still inside sRGB.
 */
export function getSrgbGamutPath(hue: number, pixelRatio = 1): SrgbGamutPath | null {
  const rows = gamutRows(pixelRatio)
  const points: { x: number; y: number }[] = []

  for (let i = 0; i <= rows; i++) {
    const brightness = i / rows
    if (brightness < 0.01) continue

    let lo = 0
    let hi = 1
    for (let j = 0; j < 20; j++) {
      const mid = (lo + hi) / 2
      if (isDisplayP3HsvInSrgbGamut(hue, mid, brightness)) lo = mid
      else hi = mid
    }
    points.push({ x: Math.min(lo * 100, 100), y: 100 - brightness * 100 })
  }

  if (points.length < 2) return null

  const path = points.map((p, i) => `${i === 0 ? "M" : "L"} ${p.x.toFixed(2)} ${p.y.toFixed(2)}`).join(" ")

  const labelY = 96
  let labelX = points[0].x
  if (points[0].y >= labelY) {
    for (let i = 0; i < points.length - 1; i++) {
      const a = points[i]
      const b = points[i + 1]
      if ((a.y >= labelY && b.y <= labelY) || (a.y <= labelY && b.y >= labelY)) {
        labelX = a.x + ((labelY - a.y) / (b.y - a.y)) * (b.x - a.x)
        break
      }
    }
  }

  return { path, labelPosition: { x: Math.min(labelX - 16, 99), y: labelY } }
}
