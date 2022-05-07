import { findByText } from "./nodelist"

export type TypeaheadState = {
  keysSoFar: string
  timer: number
}

export type TypeaheadOptions = {
  state: TypeaheadState
  activeId: string | null
  key: string
}

export function findByTypeahead<T extends HTMLElement>(_items: T[], options: TypeaheadOptions) {
  const { state, activeId, key } = options

  const search = state.keysSoFar + key
  const isRepeated = search.length > 1 && Array.from(search).every((char) => char === search[0])

  const query = isRepeated ? search[0] : search

  let items = _items.slice()

  const excludeCurrent = query.length === 1

  if (excludeCurrent) {
    items = items.filter((item) => item.id !== activeId)
  }

  const next = findByText(items, query, activeId)

  function cleanup() {
    clearTimeout(state.timer)
    state.timer = -1
  }

  function update(value: string) {
    state.keysSoFar = value
    clearTimeout(state.timer)

    if (value !== "") {
      state.timer = +setTimeout(() => {
        update("")
        cleanup()
      }, 350)
    }
  }

  update(search)

  return next
}

findByTypeahead.defaultOptions = {
  keysSoFar: "",
  timer: -1,
}
