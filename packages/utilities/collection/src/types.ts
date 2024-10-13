export interface CollectionSearchState {
  keysSoFar: string
  timer: number
}

export interface CollectionSearchOptions {
  state: CollectionSearchState
  currentValue: string | null
  timeout?: number | undefined
}

export type CollectionItem = any

export interface CollectionMethods<T extends CollectionItem = CollectionItem> {
  /**
   * The value of the item
   */
  itemToValue: (item: T) => string
  /**
   * The label of the item
   */
  itemToString: (item: T) => string
  /**
   * Whether the item is disabled
   */
  isItemDisabled: (item: T) => boolean
}

export interface CollectionOptions<T extends CollectionItem = CollectionItem> extends Partial<CollectionMethods<T>> {
  /**
   * The options of the select
   */
  items: T[] | readonly T[]
}
