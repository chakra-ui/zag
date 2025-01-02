import type { ItemToId } from "./query"
import { getByText, type SearchableItem } from "./searchable"

export interface TypeaheadState {
  keysSoFar: string
  timer: number
}

export interface TypeaheadOptions<T> {
  state: TypeaheadState
  activeId: string | null
  key: string
  timeout?: number | undefined
  itemToId?: ItemToId<T> | undefined
}

function getByTypeaheadImpl<T extends SearchableItem>(baseItems: T[], options: TypeaheadOptions<T>) {
  const { state, activeId, key, timeout = 350, itemToId } = options

  const search = state.keysSoFar + key
  const isRepeated = search.length > 1 && Array.from(search).every((char) => char === search[0])

  const query = isRepeated ? search[0] : search

  let items = baseItems.slice()

  const next = getByText(items, query, activeId, itemToId)

  function cleanup() {
    clearTimeout(state.timer)
    state.timer = -1
  }

  function update(value: string) {
    state.keysSoFar = value
    cleanup()

    if (value !== "") {
      state.timer = +setTimeout(() => {
        update("")
        cleanup()
      }, timeout)
    }
  }

  update(search)

  return next
}
export const getByTypeahead = /*#__PURE__*/ Object.assign(getByTypeaheadImpl, {
  defaultOptions: { keysSoFar: "", timer: -1 },
  isValidEvent: isValidTypeaheadEvent,
})

function isValidTypeaheadEvent(event: Pick<KeyboardEvent, "key" | "ctrlKey" | "metaKey">) {
  return event.key.length === 1 && !event.ctrlKey && !event.metaKey
}
