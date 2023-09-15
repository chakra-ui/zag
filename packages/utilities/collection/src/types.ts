export interface CollectionSearchState {
  keysSoFar: string
  timer: number
}

export interface CollectionSearchOptions {
  state: CollectionSearchState
  currentValue: string | null
  timeout?: number
}

export type CollectionItem = any

export interface CollectionNode<T extends CollectionItem = CollectionItem> {
  item: T
  index: number
  label: string
  value: string
  previousValue: string | null
  nextValue: string | null
}

export interface CollectionOptions<T extends CollectionItem = CollectionItem> {
  /**
   * The options of the select
   */
  items: T[] | readonly T[]
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
