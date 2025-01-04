// Modified from https://github.com/dabbott/tree-visit
// MIT License

// Accessors

export function access<T>(node: T, indexPath: IndexPath, options: BaseOptions<T>): T {
  for (let i = 0; i < indexPath.length; i++) node = options.getChildren(node, indexPath.slice(i + 1))[indexPath[i]]
  return node
}

export function accessPath<T>(node: T, indexPath: IndexPath, options: BaseOptions<T>): T[] {
  const result = [node]
  for (let i = 0; i < indexPath.length; i++) {
    node = options.getChildren(node, indexPath.slice(i + 1))[indexPath[i]]
    result.push(node)
  }
  return result
}

export function ancestorIndexPaths(indexPaths: IndexPath[]): IndexPath[] {
  // Sort index paths to ensure we process parents before children
  const sortedPaths = sortIndexPaths(indexPaths)
  const result: IndexPath[] = []
  const seen = new Set<string>()

  for (const indexPath of sortedPaths) {
    // Only include the exact path, not ancestors
    const key = indexPath.join()
    if (!seen.has(key)) {
      seen.add(key)
      result.push(indexPath)
    }
  }
  return result
}

export function compareIndexPaths(a: IndexPath, b: IndexPath): number {
  for (let i = 0; i < Math.min(a.length, b.length); i++) {
    if (a[i] < b[i]) return -1
    if (a[i] > b[i]) return 1
  }
  return a.length - b.length
}

export function sortIndexPaths(indexPaths: IndexPath[]): IndexPath[] {
  return indexPaths.sort(compareIndexPaths)
}

// Operations

export function find<T>(node: T, options: FindOptions<T>): T | undefined
export function find<T, S extends T>(node: T, options: FindOptionsTyped<T, S>): S | undefined
export function find<T>(node: T, options: FindOptions<T>): T | undefined {
  let found: T | undefined
  visit(node, {
    ...options,
    onEnter: (child, indexPath) => {
      if (options.predicate(child, indexPath)) {
        found = child
        return "stop"
      }
    },
  })
  return found
}

export function findAll<T>(node: T, options: FindOptions<T>): T[]
export function findAll<T, S extends T>(node: T, options: FindOptionsTyped<T, S>): S[]
export function findAll<T>(node: T, options: FindOptions<T>): T[] {
  const found: T[] = []
  visit(node, {
    onEnter: (child, indexPath) => {
      if (options.predicate(child, indexPath)) found.push(child)
    },
    getChildren: options.getChildren,
  })
  return found
}

export function findIndexPath<T>(node: T, options: FindOptions<T>): IndexPath | undefined {
  let found: IndexPath | undefined
  visit(node, {
    onEnter: (child, indexPath) => {
      if (options.predicate(child, indexPath)) {
        found = [...indexPath]
        return "stop"
      }
    },
    getChildren: options.getChildren,
  })
  return found
}

export function findAllIndexPaths<T>(node: T, options: FindOptions<T>): IndexPath[] {
  let found: IndexPath[] = []
  visit(node, {
    onEnter: (child, indexPath) => {
      if (options.predicate(child, indexPath)) found.push([...indexPath])
    },
    getChildren: options.getChildren,
  })
  return found
}

export function reduce<T, R>(node: T, options: ReduceOptions<T, R>): R {
  let result = options.initialResult
  visit(node, {
    ...options,
    onEnter: (child, indexPath) => {
      result = options.nextResult(result, child, indexPath)
    },
  })
  return result
}

export function flat<T>(node: T, options: BaseOptions<T>): T[] {
  return reduce<T, T[]>(node, {
    ...options,
    initialResult: [],
    nextResult: (result, child) => {
      result.push(child)
      return result
    },
  })
}

export function flatMap<T, R>(node: T, options: FlatMapOptions<T, R>): R[] {
  return reduce<T, R[]>(node, {
    ...options,
    initialResult: [],
    nextResult: (result, child, indexPath) => {
      result.push(...options.transform(child, indexPath))
      return result
    },
  })
}

// Mutations

function insertOperation<T>(index: number, nodes: T[]): NodeOperation<T> {
  return { type: "insert", index, nodes }
}

function removeOperation<T>(indexes: number[]): NodeOperation<T> {
  return { type: "remove", indexes }
}

function replaceOperation<T>(): NodeOperation<T> {
  return { type: "replace" }
}

type OperationMap<T> = Map<string, NodeOperation<T>>

function splitIndexPath(indexPath: IndexPath): [IndexPath, number] {
  return [indexPath.slice(0, -1), indexPath[indexPath.length - 1]]
}

function getInsertionOperations<T>(indexPath: IndexPath, nodes: T[], operations: OperationMap<T> = new Map()) {
  const [parentIndexPath, index] = splitIndexPath(indexPath)
  // Mark all parents for replacing
  for (let i = parentIndexPath.length - 1; i >= 0; i--) {
    const parentKey = parentIndexPath.slice(0, i).join()
    switch (operations.get(parentKey)?.type) {
      case "remove":
        continue
    }
    operations.set(parentKey, replaceOperation())
  }

  const operation = operations.get(parentIndexPath.join())

  // Mark insertion node
  switch (operation?.type) {
    case "remove":
      operations.set(parentIndexPath.join(), {
        type: "removeThenInsert",
        removeIndexes: operation.indexes,
        insertIndex: index,
        insertNodes: nodes,
      })
      break
    default:
      operations.set(parentIndexPath.join(), insertOperation(index, nodes))
  }

  return operations
}

function getRemovalOperations<T>(indexPaths: IndexPath[]) {
  const operations: OperationMap<T> = new Map()
  const indexesToRemove = new Map<string, number[]>()

  // Group indexes to remove by parent path
  for (const indexPath of indexPaths) {
    const parentKey = indexPath.slice(0, -1).join()
    const value = indexesToRemove.get(parentKey) ?? []
    value.push(indexPath[indexPath.length - 1])
    indexesToRemove.set(
      parentKey,
      value.sort((a, b) => a - b),
    )
  }

  // Mark all parents for replacing
  for (const indexPath of indexPaths) {
    for (let i = indexPath.length - 2; i >= 0; i--) {
      const parentKey = indexPath.slice(0, i).join()
      if (!operations.has(parentKey)) {
        operations.set(parentKey, replaceOperation())
      }
    }
  }

  // Mark nodes for removal
  for (const [parentKey, indexes] of indexesToRemove) {
    operations.set(parentKey, removeOperation(indexes))
  }

  return operations
}

function getReplaceOperations<T>(indexPath: IndexPath, node: T) {
  const operations: OperationMap<T> = new Map()
  const [parentIndexPath, index] = splitIndexPath(indexPath)

  // Mark all parents for replacing
  for (let i = parentIndexPath.length - 1; i >= 0; i--) {
    const parentKey = parentIndexPath.slice(0, i).join()

    operations.set(parentKey, replaceOperation())
  }

  operations.set(parentIndexPath.join(), {
    type: "removeThenInsert",
    removeIndexes: [index],
    insertIndex: index,
    insertNodes: [node],
  })

  return operations
}

function mutate<T>(node: T, operations: OperationMap<T>, options: MutationBaseOptions<T>) {
  return map(node, {
    ...options,
    getChildren: (node, indexPath) => {
      const key = indexPath.join()
      const operation = operations.get(key)
      switch (operation?.type) {
        case "replace":
        case "remove":
        case "removeThenInsert":
        case "insert":
          return options.getChildren(node, indexPath)
        default:
          return []
      }
    },
    transform: (node, children: T[], indexPath) => {
      const key = indexPath.join()
      const operation = operations.get(key)
      switch (operation?.type) {
        case "remove":
          return options.create(
            node,
            children.filter((_, index) => !operation.indexes.includes(index)),
            indexPath,
          )
        case "removeThenInsert":
          const updatedChildren = children.filter((_, index) => !operation.removeIndexes.includes(index))
          const adjustedIndex = operation.removeIndexes.reduce(
            (index, removedIndex) => (removedIndex < index ? index - 1 : index),
            operation.insertIndex,
          )
          return options.create(node, splice(updatedChildren, adjustedIndex, 0, ...operation.insertNodes), indexPath)
        case "insert":
          return options.create(node, splice(children, operation.index, 0, ...operation.nodes), indexPath)
        case "replace":
          return options.create(node, children, indexPath)
        default:
          return node
      }
    },
  })
}

function splice<T>(array: T[], start: number, deleteCount: number, ...items: T[]) {
  return [...array.slice(0, start), ...items, ...array.slice(start + deleteCount)]
}

export function map<T, U>(node: T, options: MapOptions<T, U>): U {
  const childrenMap: Record<string, U[]> = {}
  visit(node, {
    ...options,
    onLeave: (child, indexPath) => {
      // Add a 0 so we can always slice off the last element to get a unique parent key
      const keyIndexPath = [0, ...indexPath]
      const key = keyIndexPath.join()
      const transformed = options.transform(child, childrenMap[key] ?? [], indexPath)
      const parentKey = keyIndexPath.slice(0, -1).join()
      const parentChildren = childrenMap[parentKey] ?? []
      parentChildren.push(transformed)
      childrenMap[parentKey] = parentChildren
    },
  })
  return childrenMap[""][0]
}

export function insert<T>(node: T, options: InsertOptions<T>) {
  const { nodes, at } = options
  if (at.length === 0) throw new Error(`Can't insert nodes at the root`)
  const state = getInsertionOperations(at, nodes)
  return mutate(node, state, options)
}

export function replace<T>(node: T, options: ReplaceOptions<T>) {
  if (options.at.length === 0) return options.node
  const operations = getReplaceOperations<T>(options.at, options.node)
  return mutate(node, operations, options)
}

export function remove<T>(node: T, options: RemoveOptions<T>) {
  if (options.indexPaths.length === 0) return node
  for (const indexPath of options.indexPaths) {
    if (indexPath.length === 0) throw new Error(`Can't remove the root node`)
  }
  const operations = getRemovalOperations<T>(options.indexPaths)
  return mutate(node, operations, options)
}

export function move<T>(node: T, options: MoveOptions<T>) {
  if (options.indexPaths.length === 0) return node
  for (const indexPath of options.indexPaths) {
    if (indexPath.length === 0) throw new Error(`Can't move the root node`)
  }
  if (options.to.length === 0) throw new Error(`Can't move nodes to the root`)
  const _ancestorIndexPaths = ancestorIndexPaths(options.indexPaths)
  const nodesToInsert = _ancestorIndexPaths.map((indexPath) => access(node, indexPath, options))
  const operations = getInsertionOperations(options.to, nodesToInsert, getRemovalOperations<T>(_ancestorIndexPaths))
  return mutate(node, operations, options)
}

export function visit<T>(node: T, options: TreeVisitOptions<T>): void {
  const { onEnter, onLeave, getChildren } = options
  let indexPath: IndexPath = []
  let stack: TreeVisitStack<T>[] = [{ node }]
  const getIndexPath = options.reuseIndexPath ? () => indexPath : () => indexPath.slice()
  while (stack.length > 0) {
    let wrapper = stack[stack.length - 1]
    if (wrapper.state === undefined) {
      const enterResult = onEnter?.(wrapper.node, getIndexPath())
      if (enterResult === "stop") return
      wrapper.state = enterResult === "skip" ? -1 : 0
    }
    const children = wrapper.children || getChildren(wrapper.node, getIndexPath())
    wrapper.children ||= children
    if (wrapper.state !== -1) {
      if (wrapper.state < children.length) {
        let currentIndex = wrapper.state

        indexPath.push(currentIndex)
        stack.push({ node: children[currentIndex] })

        wrapper.state = currentIndex + 1

        continue
      }

      const leaveResult = onLeave?.(wrapper.node, getIndexPath())

      if (leaveResult === "stop") return
    }
    indexPath.pop()
    stack.pop()
  }
}

// Types

export type NodeOperation<T> =
  | { type: "insert"; index: number; nodes: T[] }
  | { type: "remove"; indexes: number[] }
  | { type: "replace" }
  | { type: "removeThenInsert"; removeIndexes: number[]; insertIndex: number; insertNodes: T[] }

export type IndexPath = number[]

export interface BaseOptions<T> {
  getChildren: (node: T, indexPath: IndexPath) => T[]
  reuseIndexPath?: boolean
}

export interface FindOptions<T> extends BaseOptions<T> {
  predicate: (node: T, indexPath: IndexPath) => boolean
}

export interface RemoveOptions<T> extends MutationBaseOptions<T> {
  indexPaths: IndexPath[]
}

export interface MapOptions<T, U> extends BaseOptions<T> {
  transform: (node: T, transformedChildren: U[], indexPath: IndexPath) => U
}

export interface FindOptionsTyped<T, S extends T> extends BaseOptions<T> {
  predicate: (node: T, indexPath: IndexPath) => node is S
}

export interface ReduceOptions<T, R> extends BaseOptions<T> {
  initialResult: R
  nextResult: (result: R, node: T, indexPath: IndexPath) => R
}

export interface FlatMapOptions<T, R> extends BaseOptions<T> {
  transform: (node: T, indexPath: IndexPath) => R[]
}

export interface MutationBaseOptions<T> extends BaseOptions<T> {
  create: (node: T, children: T[], indexPath: IndexPath) => T
}

export interface InsertOptions<T> extends MutationBaseOptions<T> {
  nodes: T[]
  at: IndexPath
}

export interface MoveOptions<T> extends MutationBaseOptions<T> {
  indexPaths: IndexPath[]
  to: IndexPath
}

export interface ReplaceOptions<T> extends MutationBaseOptions<T> {
  at: IndexPath
  node: T
}

interface TreeVisitStack<T> {
  node: T

  /**
   * The current traversal state of the node.
   *
   * undefined => not visited
   * -1        => skipped
   * n         => nth child
   */
  state?: number

  /**
   * Cached children, so we only call getChildren once per node
   */
  children?: T[]
}

export type TreeVisitEnterReturnValue = void | "skip" | "stop"
export type TreeVisitLeaveReturnValue = void | "stop"

export interface TreeVisitOptions<T> extends BaseOptions<T> {
  onEnter?(node: T, indexPath: IndexPath): TreeVisitEnterReturnValue
  onLeave?(node: T, indexPath: IndexPath): TreeVisitLeaveReturnValue
}
