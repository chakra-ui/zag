import { is } from "@core-foundation/utils"
import hyphenate from "hyphenate-style-name"

const format = (v: string) => (v.startsWith("--") ? v : hyphenate(v))

type StyleObject = Record<string, any>

// https://github.com/robinweser/css-in-js-utils

export function cssify(style: StyleObject): StyleObject {
  let css = {}
  for (const property in style) {
    const value = style[property]
    if (!is.string(value) && !is.number(value)) continue
    css[format(property)] = value
  }

  return css
}
