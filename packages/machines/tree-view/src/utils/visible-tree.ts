import type { TreeCollection, TreeNode } from "@zag-js/collection"
import type { VisibleNode } from "../tree-view.types"

/** One expansion's rows and their positions. Disabled rows remain renderable. */
export class VisibleTree<T extends TreeNode = TreeNode> {
  readonly nodes: VisibleNode<T>[]
  private keys: string[]
  private positions = new Map<string, number>()

  constructor(
    private collection: TreeCollection<T>,
    expandedValue: readonly string[],
  ) {
    this.nodes = collection.getVisibleNodes(expandedValue)
    this.keys = this.nodes.map(({ node }, index) => {
      const value = collection.getNodeValue(node)
      this.positions.set(value, index)
      return value
    })
  }

  values(): Iterable<string> {
    return this.keys
  }

  getIndex(value: string): number | undefined {
    return this.positions.get(value)
  }

  getNode(value: string): VisibleNode<T> | undefined {
    const index = this.getIndex(value)
    return index == null ? undefined : this.nodes[index]
  }

  getFirstNode(): T | undefined {
    return this.findEnabled(0, 1)
  }

  getLastNode(): T | undefined {
    return this.findEnabled(this.nodes.length - 1, -1)
  }

  getNextNode(value: string): T | undefined {
    const index = this.getIndex(value)
    return index == null ? undefined : this.findEnabled(index + 1, 1)
  }

  getPreviousNode(value: string): T | undefined {
    const index = this.getIndex(value)
    return index == null ? undefined : this.findEnabled(index - 1, -1)
  }

  private findEnabled(start: number, direction: 1 | -1): T | undefined {
    for (let index = start; index >= 0 && index < this.nodes.length; index += direction) {
      const node = this.nodes[index].node
      if (!this.collection.getNodeDisabled(node)) return node
    }
    return undefined
  }
}

/**
 * Keep one snapshot per machine. Tree edits (including lazy loading) must replace
 * the collection, as the editing functions already do.
 * Copy expansion values so equivalent arrays hit the cache and in-place edits
 * to the expansion array still invalidate it.
 */
export function createVisibleTreeCache<T extends TreeNode = TreeNode>() {
  let previousCollection: TreeCollection<T> | undefined
  let previousExpanded: string[] = []
  let tree: VisibleTree<T> | undefined

  return (collection: TreeCollection<T>, expandedValue: readonly string[]): VisibleTree<T> => {
    const unchanged =
      collection === previousCollection &&
      expandedValue.length === previousExpanded.length &&
      expandedValue.every((value, index) => value === previousExpanded[index])

    if (tree && unchanged) return tree

    tree = new VisibleTree(collection, expandedValue)
    previousCollection = collection
    previousExpanded = Array.from(expandedValue)
    return tree
  }
}
