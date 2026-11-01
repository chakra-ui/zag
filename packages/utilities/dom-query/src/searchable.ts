import { defaultItemToId, indexOfId, type ItemToId } from "./query"
import { wrap } from "./shared"

let collator: Intl.Collator | undefined

// Locale-aware prefix match that ignores case and accents ("e" finds "Éditer")
const getCollator = () => (collator ??= new Intl.Collator(undefined, { usage: "search", sensitivity: "base" }))

const normalize = (str: string) => str.normalize("NFC").trim()

const getValueText = <T extends SearchableItem>(el: T) => {
  return normalize(el.dataset?.valuetext ?? el.textContent ?? "")
}

const match = (valueText: string, query: string) => {
  const text = query.normalize("NFC")
  return getCollator().compare(valueText.slice(0, text.length), text) === 0
}

export interface SearchableItem {
  id: string
  textContent: string | null
  dataset?: any | undefined
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
