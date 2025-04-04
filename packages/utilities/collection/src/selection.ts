import { isEqual } from "@zag-js/utils"
import type { ListCollection } from "./list-collection"

/**
 * The mode of the selection.
 *
 * - `none`: A user can't select items.
 * - `single`: A user can select a single item.
 * - `multiple`: The user can select multiple items without using modifier keys.
 * - `extended`: The user can select multiple items by using modifier keys.
 */
export type SelectionMode = "single" | "multiple" | "none" | "extended"

export class Selection extends Set<string> {
  selectionMode: SelectionMode = "single"
  deselectable = true

  constructor(values: Iterable<string> = []) {
    super(values)
  }

  copy = (): Selection => {
    const clone = new Selection([...this])
    return this.sync(clone)
  }

  private sync = (other: Selection): Selection => {
    other.selectionMode = this.selectionMode
    other.deselectable = this.deselectable
    return other
  }

  isEmpty = (): boolean => {
    return this.size === 0
  }

  isSelected = (value: string | null): boolean => {
    if (this.selectionMode === "none" || value == null) {
      return false
    }
    return this.has(value)
  }

  canSelect = (collection: ListCollection, value: string): boolean => {
    return this.selectionMode !== "none" || !collection.getItemDisabled(collection.find(value))
  }

  firstSelectedValue = (collection: ListCollection): string | null => {
    let firstValue: string | null = null
    for (let value of this) {
      if (!firstValue || collection.compareValue(value, firstValue) < 0) {
        firstValue = value
      }
    }
    return firstValue
  }

  lastSelectedValue = (collection: ListCollection): string | null => {
    let lastValue: string | null = null
    for (let value of this) {
      if (!lastValue || collection.compareValue(value, lastValue) > 0) {
        lastValue = value
      }
    }
    return lastValue
  }

  extendSelection = (collection: ListCollection, anchorValue: string, targetValue: string): Selection => {
    if (this.selectionMode === "none") {
      return this
    }

    if (this.selectionMode === "single") {
      return this.replaceSelection(collection, targetValue)
    }

    const selection = this.copy()
    const range = collection.getValueRange(anchorValue, targetValue)
    const forwards = collection.compareValue(targetValue, anchorValue) >= 0

    range.forEach((value) => {
      if (!this.canSelect(collection, value)) return

      if (forwards) {
        // When extending forward, keep anchor and add everything up to target
        selection.add(value)
      } else {
        // When extending backward, keep only values up to and including target
        if (collection.compareValue(value, targetValue) <= 0) {
          selection.add(value)
        } else {
          selection.delete(value)
        }
      }
    })

    return selection
  }

  toggleSelection = (collection: ListCollection, value: string): Selection => {
    if (this.selectionMode === "none") {
      return this
    }

    if (this.selectionMode === "single" && !this.isSelected(value)) {
      return this.replaceSelection(collection, value)
    }

    const selection = this.copy()
    if (selection.has(value)) {
      selection.delete(value)
    } else if (selection.canSelect(collection, value)) {
      selection.add(value)
    }

    return selection
  }

  replaceSelection = (collection: ListCollection, value: string | null): Selection => {
    if (this.selectionMode === "none") {
      return this
    }

    if (value == null) {
      return this
    }

    if (!this.canSelect(collection, value)) {
      return this
    }

    const selection = new Selection([value])
    return this.sync(selection)
  }

  setSelection = (values: Iterable<string>): Selection => {
    if (this.selectionMode === "none") {
      return this
    }

    let selection = new Selection()
    for (let value of values) {
      if (value != null) {
        selection.add(value)
        if (this.selectionMode === "single") {
          break
        }
      }
    }

    return this.sync(selection)
  }

  clearSelection = (): Selection => {
    const selection = this.copy()
    if (selection.deselectable && selection.size > 0) {
      selection.clear()
    }
    return selection
  }

  select = (collection: ListCollection, value: string, forceToggle?: boolean): Selection => {
    if (this.selectionMode === "none") {
      return this
    }

    if (this.selectionMode === "single") {
      if (this.isSelected(value) && this.deselectable) {
        return this.toggleSelection(collection, value)
      } else {
        return this.replaceSelection(collection, value)
      }
    } else if (this.selectionMode === "multiple" || forceToggle) {
      return this.toggleSelection(collection, value)
    } else {
      return this.replaceSelection(collection, value)
    }
  }

  deselect = (value: string): Selection => {
    const selection = this.copy()
    selection.delete(value)
    return selection
  }

  isEqual = (other: Selection): boolean => {
    return isEqual(Array.from(this), Array.from(other))
  }
}
