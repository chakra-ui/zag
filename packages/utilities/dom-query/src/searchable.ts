import { defaultItemToId, indexOfId, type ItemToId } from "./query"
import { wrap } from "./shared"

const sanitize = (str: string) =>
  str
    .split("")
    .map((char) => {
      const code = char.charCodeAt(0)
      if (code > 0 && code < 128) return char
      if (code >= 128 && code <= 255) return `/x${code.toString(16)}`.replace("/", "\\")
      return ""
    })
    .join("")
    .trim()

const getValueText = <T extends SearchableItem>(el: T) => {
  return sanitize(el.dataset?.valuetext ?? el.textContent ?? "")
}

const match = (valueText: string, query: string) => {
  return valueText.trim().toLowerCase().startsWith(query.toLowerCase())
}

export interface SearchableItem {
  id: string
  textContent: string | null
  dataset?: any
}

export function getByText<T extends SearchableItem>(
  v: T[],
  text: string,
  currentId?: string | null,
  itemToId: ItemToId<T> = defaultItemToId,
) {
  const index = currentId ? indexOfId(v, currentId, itemToId) : -1
  let items = currentId ? wrap(v, index) : v
  const isSingleKey = text.length === 1
  if (isSingleKey) {
    items = items.filter((item) => itemToId(item) !== currentId)
  }
  return items.find((item) => match(getValueText(item), text))
}
