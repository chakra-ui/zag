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
  groupBy?: ((item: T, index: number) => string) | undefined
  /**
   * Function to sort items
   */
  groupSort?: ((a: string, b: string) => number) | string[] | "asc" | "desc" | undefined
}

// ==============================
// Tree Collections
// ==============================

export type IndexPath = number[]

export type ValuePath = string[]

export interface TreeCollectionMethods<T> {
  isNodeDisabled: (node: T) => boolean
  nodeToValue: (node: T) => string
  nodeToString: (node: T) => string
  nodeToChildren: (node: T) => any[]
  nodeToChildrenCount: (node: T) => number | undefined
}

export interface TreeCollectionOptions<T> extends Partial<TreeCollectionMethods<T>> {
  rootNode: T
}

export type TreeNode = any

export type FilePathTreeNode<T = TreeNode> = T & {
  children?: FilePathTreeNode<T>[] | undefined
}

export interface FlatTreeNodeMeta {
  _children: number[] | undefined
  _parent: number | undefined
  _index: number
}

export type FlatTreeNode<T = TreeNode> = T & FlatTreeNodeMeta

export interface TreeSkipFnArgs<T> {
  value: string
  node: T
  indexPath: number[]
}

export type TreeSkipFn<T> = (args: TreeSkipFnArgs<T>) => boolean | void

export interface TreeSkipOptions<T> {
  skip?: TreeSkipFn<T> | undefined
}

export interface DescendantOptions {
  withBranch?: boolean
}
