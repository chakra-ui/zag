import { indexOfId } from "./get-by-id"

const sanitize = (str: string) =>
  str
    .split("")
    .map((char) => {
      const code = char.charCodeAt(0)

      if (code > 0 && code < 128) {
        return char
      }

      if (code >= 128 && code <= 255) {
        return `/x${code.toString(16)}`.replace("/", "\\")
      }

      return ""
    })
    .join("")
    .trim()

const getValueText = <T extends HTMLElement>(item: T) => sanitize(item.dataset.valuetext ?? item.textContent ?? "")

const match = (valueText: string, query: string) => valueText.trim().toLowerCase().startsWith(query.toLowerCase())

const wrap = <T>(v: T[], idx: number) => {
  return v.map((_, index) => v[(Math.max(idx, 0) + index) % v.length])
}

export function getByText<T extends HTMLElement>(v: T[], text: string, currentId?: string | null) {
  const index = currentId ? indexOfId(v, currentId) : -1
  let items = currentId ? wrap(v, index) : v

  const isSingleKey = text.length === 1

  if (isSingleKey) {
    items = items.filter((item) => item.id !== currentId)
  }

  return items.find((item) => match(getValueText(item), text))
}
