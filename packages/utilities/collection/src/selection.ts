import { isEqual } from "@zag-js/utils"
import type { ListCollection } from "./list-collection"

export type SelectionMode = "single" | "multiple" | "none"

export type SelectionBehavior = "toggle" | "replace"

export class Selection extends Set<string> {
  selectionMode: SelectionMode = "single"
  disallowEmptySelection = false
  selectionBehavior: SelectionBehavior = "toggle"

  constructor(keys: Iterable<string> = []) {
    super(keys)
  }

  copy = (): Selection => {
    const clone = new Selection([...this])
    return this.sync(clone)
  }

  private sync = (other: Selection): Selection => {
    other.selectionMode = this.selectionMode
    other.disallowEmptySelection = this.disallowEmptySelection
    other.selectionBehavior = this.selectionBehavior
    return other
  }

  isEmpty = (): boolean => {
    return this.size === 0
  }

  isSelected = (key: string | null): boolean => {
    if (this.selectionMode === "none" || key == null) {
      return false
    }
    return this.has(key)
  }

  canSelect = (collection: ListCollection, key: string): boolean => {
    return this.selectionMode !== "none" || !collection.getItemDisabled(collection.find(key))
  }

  firstSelectedKey = (collection: ListCollection): string | null => {
    let firstKey: string | null = null
    for (let key of this) {
      if (!firstKey || collection.compareValueOrder(key, firstKey) < 0) {
        firstKey = key
      }
    }

    return firstKey
  }

  lastSelectedKey = (collection: ListCollection): string | null => {
    let lastKey: string | null = null
    for (let key of this) {
      if (!lastKey || collection.compareValueOrder(key, lastKey) > 0) {
        lastKey = key
      }
    }
    return lastKey
  }

  extendSelection = (collection: ListCollection, anchorKey: string, targetKey: string): Selection => {
    if (this.selectionMode === "none") {
      return this
    }

    if (this.selectionMode === "single") {
      return this.replaceSelection(collection, targetKey)
    }

    const selection = this.copy()
    const range = collection.getValueRange(anchorKey, targetKey)
    const forwards = collection.compareValueOrder(targetKey, anchorKey) >= 0

    range.forEach((value) => {
      if (!this.canSelect(collection, value)) return

      if (forwards) {
        // When extending forward, keep anchor and add everything up to target
        selection.add(value)
      } else {
        // When extending backward, keep only values up to and including target
        if (collection.compareValueOrder(value, targetKey) <= 0) {
          selection.add(value)
        } else {
          selection.delete(value)
        }
      }
    })

    return selection
  }

  toggleSelection = (collection: ListCollection, key: string): Selection => {
    if (this.selectionMode === "none") {
      return this
    }

    if (this.selectionMode === "single" && !this.isSelected(key)) {
      return this.replaceSelection(collection, key)
    }

    const selection = this.copy()
    if (selection.has(key)) {
      selection.delete(key)
    } else if (selection.canSelect(collection, key)) {
      selection.add(key)
    }

    return selection
  }

  replaceSelection = (collection: ListCollection, key: string | null): Selection => {
    if (this.selectionMode === "none") {
      return this
    }

    if (key == null) {
      return this
    }

    if (!this.canSelect(collection, key)) {
      return this
    }

    const selection = new Selection([key])
    return this.sync(selection)
  }

  setSelection = (keys: Iterable<string>): Selection => {
    if (this.selectionMode === "none") {
      return this
    }

    let selection = new Selection()
    for (let key of keys) {
      if (key != null) {
        selection.add(key)
        if (this.selectionMode === "single") {
          break
        }
      }
    }

    return this.sync(selection)
  }

  clearSelection = (): Selection => {
    const selection = this.copy()
    if (!selection.disallowEmptySelection && selection.size > 0) {
      selection.clear()
    }
    return selection
  }

  select = (collection: ListCollection, key: string, metaKey?: boolean): Selection => {
    if (this.selectionMode === "none") {
      return this
    }

    if (this.selectionMode === "single") {
      if (this.isSelected(key) && !this.disallowEmptySelection) {
        return this.toggleSelection(collection, key)
      } else {
        return this.replaceSelection(collection, key)
      }
    } else if (this.selectionBehavior === "toggle" || metaKey) {
      return this.toggleSelection(collection, key)
    } else {
      return this.replaceSelection(collection, key)
    }
  }

  deselect = (key: string): Selection => {
    const selection = this.copy()
    selection.delete(key)
    return selection
  }

  isEqual = (other: Selection): boolean => {
    return isEqual(Array.from(this), Array.from(other))
  }
}
