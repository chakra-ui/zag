import { createTypeaheadState, isTypeaheadKey, typeahead, type TypeaheadState } from "@zag-js/utils/search"
import { defaultItemToId, indexOfId, type ItemToId } from "./query"

export type { TypeaheadState }

export interface SearchableItem {
  id: string
  textContent: string | null
  dataset?: any | undefined
}

export interface TypeaheadOptions<T> {
  state: TypeaheadState
  activeId: string | null
  key: string
  timeout?: number | undefined
  itemToId?: ItemToId<T> | undefined
}

const getValueText = (el: SearchableItem) => el.dataset?.valuetext ?? el.textContent ?? ""

function getByTypeaheadImpl<T extends SearchableItem>(items: T[], options: TypeaheadOptions<T>) {
  const { state, activeId, key, timeout, itemToId = defaultItemToId } = options
  const activeIndex = activeId ? indexOfId(items, activeId, itemToId) : -1
  return typeahead({ state, key, items, activeIndex, timeout, itemToString: getValueText })
}

export const getByTypeahead = /*#__PURE__*/ Object.assign(getByTypeaheadImpl, {
  defaultOptions: createTypeaheadState(),
  isValidEvent: isTypeaheadKey,
})
