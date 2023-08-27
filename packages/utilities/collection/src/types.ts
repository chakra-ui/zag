export type CollectionSearchState = {
  keysSoFar: string
  timer: number
}

export type CollectionSearchOptions = {
  state: CollectionSearchState
  fromKey: string | null
  eventKey: string
  timeout?: number
}

export type CollectionItem = {
  label?: string
  value: string
  [key: string]: any
}

export type CollectionNode = {
  item: CollectionItem
  index: number
  key: string
  prevKey: string | null
  nextKey: string | null
}

export type CollectionOptions = {
  /**
   * The options of the select
   */
  items: CollectionItem[]
  /**
   * The number of items in the select
   */
  itemCount?: number
  /**
   * The key of the item
   */
  getItemKey?: (item: CollectionItem) => string
  /**
   * The label of the item
   */
  getItemLabel?: (item: CollectionItem) => string
  /**
   * Whether the item is disabled
   */
  isItemDisabled?: (item: CollectionItem) => boolean
}
