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
  [key: string]: any
}

export type CollectionNode<T extends CollectionItem> = {
  item: T
  index: number
  key: string
  prevKey: string | null
  nextKey: string | null
}

export type CollectionOptions<T extends CollectionItem> = {
  /**
   * The options of the select
   */
  items: T[]
  /**
   * The key of the item
   */
  getItemKey?: (item: T) => string
  /**
   * The label of the item
   */
  getItemLabel?: (item: T) => string
  /**
   * Whether the item is disabled
   */
  isItemDisabled?: (item: T) => boolean
}
