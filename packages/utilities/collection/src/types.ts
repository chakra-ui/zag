// ==============================
// Grid and List Collections
// ==============================

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
  items: Iterable<T> | Readonly<Iterable<T>>
  /**
   * Function to group items
   */
  groupBy?: (item: T, index: number) => string
  /**
   * Function to sort items
   */
  groupSort?: ((a: string, b: string) => number) | string[] | "asc" | "desc"
}

// ==============================
// Tree Collections
// ==============================

export interface TreeCollectionMethods<T> {
  isNodeDisabled: (node: T) => boolean
  nodeToValue: (node: T) => string
  nodeToString: (node: T) => string
  nodeToChildren: (node: T) => any[]
}

export interface TreeCollectionOptions<T> extends Partial<TreeCollectionMethods<T>> {
  rootNode: T
}

export type TreeNode = any

export interface FilePathTreeNode {
  label: string
  value: string
  children?: FilePathTreeNode[]
}

export interface FlatTreeNode {
  label?: string | undefined
  value: string
  indexPath: number[]
  children?: string[] | undefined
}

export interface TreeSkipFnArgs<T> {
  value: string
  node: T
  indexPath: number[]
}

export type TreeSkipFn<T> = (args: TreeSkipFnArgs<T>) => boolean | void

export interface TreeSkipOptions<T> {
  skip?: TreeSkipFn<T>
}
