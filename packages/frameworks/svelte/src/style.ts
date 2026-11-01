import { createAttachmentKey } from "svelte/attachments"

export type StyleObject = Record<string, string | number | null | undefined>

/**
 * Svelte replaces the whole `style` attribute when a spread style changes, which drops the properties machines
 * write to the element directly (positioning variables, measured sizes). On the client, styles are applied
 * through an attachment one property at a time instead, like the other frameworks do. The server keeps the
 * style string, since attachments only run in the browser.
 */
export const STYLE_KEY = createAttachmentKey()

export const isServer = typeof document === "undefined"

const STYLES = Symbol("styles")

const toCssName = (key: string) =>
  key.startsWith("--") ? key : key.replace(/[A-Z]/g, (match) => `-${match.toLowerCase()}`)

export function toCssNames(style: StyleObject) {
  const res: StyleObject = {}
  for (const key in style) res[toCssName(key)] = style[key]
  return res
}

export function toStyleString(style: StyleObject) {
  let string = ""
  for (const key in style) {
    const value = style[key]
    if (value === null || value === undefined) continue
    string += `${toCssName(key)}:${value};`
  }
  return string
}

const CSS_REGEX = /((?:--)?(?:\w+-?)+)\s*:\s*([\s\S]*)/

export function parseStyleString(style: string): StyleObject {
  const res: StyleObject = {}
  const add = (declaration: string) => {
    const match = CSS_REGEX.exec(declaration)
    if (match) res[match[1]!] = match[2]!
  }
  let start = 0
  let depth = 0
  let quote = ""
  let comment = false

  for (let i = 0; i < style.length; i++) {
    const char = style[i]

    if (comment) {
      if (char === "*" && style[i + 1] === "/") {
        comment = false
        i++
      }
    } else if (quote) {
      if (char === "\\") i++
      if (char === quote) quote = ""
    } else if (char === "\\") {
      i++
    } else if (char === "/" && style[i + 1] === "*") {
      comment = true
      i++
    } else if (char === '"' || char === "'") quote = char
    else if (char === "(") depth++
    else if (char === ")" && depth) depth--
    else if (char === ";" && !depth) {
      add(style.slice(start, i))
      start = i + 1
    }
  }
  add(style.slice(start))
  return res
}

const applied = new WeakMap<Element, Record<string, string>>()

function applyStyle(node: HTMLElement, style: StyleObject) {
  const prev = applied.get(node) ?? {}
  const next: Record<string, string> = {}
  for (const key in style) {
    const value = style[key]
    if (value === null || value === undefined) continue
    next[toCssName(key)] = String(value)
  }
  for (const name in prev) {
    if (!(name in next)) node.style.removeProperty(name)
  }
  for (const name in next) {
    if (node.style.getPropertyValue(name) !== next[name]) node.style.setProperty(name, next[name]!)
  }
  applied.set(node, next)
}

export function createStyleAttachment(style: StyleObject) {
  const attachment = (node: Element) => applyStyle(node as HTMLElement, style)
  return Object.assign(attachment, { [STYLES]: style })
}

export const getAttachedStyle = (value: unknown): StyleObject | undefined => (value as any)?.[STYLES]

/** Puts a style where Svelte applies it: an attachment in the browser, the `style` attribute on the server */
export function toStyleProps(style: StyleObject) {
  return isServer ? { style: toStyleString(style) } : { [STYLE_KEY]: createStyleAttachment(style) }
}
