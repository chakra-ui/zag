export type CollectionSearchState = {
  keysSoFar: string
  timer: number
}

export type CollectionSearchOptions = {
  state: CollectionSearchState
  currentValue: string | null
  timeout?: number
}

export type CollectionItem = any

export type CollectionNode<T extends CollectionItem = CollectionItem> = {
  item: T
  index: number
  label: string
  value: string
  previousValue: string | null
  nextValue: string | null
}

export type CollectionOptions<T extends CollectionItem = CollectionItem> = {
  /**
   * The options of the select
   */
  items: T[]
  /**
   * The value of the item
   */
  itemToValue?: (item: T) => string
  /**
   * The label of the item
   */
  itemToString?: (item: T) => string
  /**
   * Whether the item is disabled
   */
  isItemDisabled?: (item: T) => boolean
}
