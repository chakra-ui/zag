import { createFilter, type FilterReturn } from "./filter"

export interface TypeaheadState {
  keysSoFar: string
  timer: number
}

export interface TypeaheadOptions<T> {
  /**
   * The state kept between keystrokes, from `createTypeaheadState`
   */
  state: TypeaheadState
  /**
   * The key that was typed
   */
  key: string
  /**
   * The items to search, in display order
   */
  items: readonly T[]
  /**
   * The index of the active item, or -1
   */
  activeIndex: number
  /**
   * The text an item is matched against
   */
  itemToString: (item: T) => string
  /**
   * Whether an item is skipped
   */
  isItemDisabled?: ((item: T) => boolean) | undefined
  /**
   * How long to wait before the typed keys reset, in ms
   * @default 350
   */
  timeout?: number | undefined
}

let filter: FilterReturn | undefined

export const createTypeaheadState = (): TypeaheadState => ({ keysSoFar: "", timer: -1 })

/**
 * Whether a keydown should be handled by typeahead: a printable key without ctrl or meta.
 */
export const isTypeaheadKey = (event: Pick<KeyboardEvent, "key" | "ctrlKey" | "metaKey">) =>
  event.key.length === 1 && !event.ctrlKey && !event.metaKey

/**
 * Finds the next item whose text starts with the keys typed so far, ignoring case and accents.
 * Repeating one key cycles through the items that start with it.
 */
export function typeahead<T>(options: TypeaheadOptions<T>): T | undefined {
  const { state, key, items, activeIndex, itemToString, isItemDisabled, timeout = 350 } = options

  const search = state.keysSoFar + key
  const chars = Array.from(search)
  const query = chars.every((char) => char === chars[0]) ? chars[0] : search

  clearTimeout(state.timer)
  state.keysSoFar = search
  state.timer = +setTimeout(() => {
    state.keysSoFar = ""
    state.timer = -1
  }, timeout)

  filter ??= createFilter({ sensitivity: "base" })

  // a single key moves past the active item; a longer query may keep it
  const single = query === chars[0]
  const from = activeIndex < 0 ? 0 : single ? activeIndex + 1 : activeIndex
  for (let i = 0; i < items.length; i++) {
    const index = (from + i) % items.length
    if (single && index === activeIndex) continue
    const item = items[index]
    if (isItemDisabled?.(item)) continue
    if (filter.startsWith(itemToString(item).trim(), query)) return item
  }
  return undefined
}
