import { ArrayCollection } from "./array"
import { domHelper } from "./dom-helper"

export class DOMCollection<
  T extends HTMLElement = HTMLElement,
> extends ArrayCollection<T> {
  // create an array util instance from a DOM selector
  constructor(public root: Document | Element | null, selector: string) {
    super(domHelper(root as HTMLElement).$$<T>(selector))
  }

  // get a node by id
  itemById(id: string) {
    return this.find((node) => node.id === id)
  }

  // get the index of a node by `id`
  indexOfId(id: string) {
    const item = this.itemById(id)
    return item ? this.value.indexOf(item) : -1
  }

  // get the next node by current node's id
  nextById(id: string, loop?: boolean) {
    const index = this.indexOfId(id)
    return this.next(index, 1, loop)
  }

  // get the prev node by current node's id
  prevById(id: string, loop?: boolean) {
    const index = this.indexOfId(id)
    return this.prev(index, 1, loop)
  }

  // get the node whose text content matches the event key pressed
  findByEventKey(key: string, currentId?: string | null) {
    const fn = (item: T) =>
      !!item.textContent?.toLowerCase().startsWith(key.toLowerCase())

    const matched = this.find(fn)
    const filtered = this.filter(fn)

    if (matched && matched.id === currentId && filtered.size > 1) {
      const index = filtered.value.indexOf(matched)
      return this.next(index)
    }

    return matched
  }

  // get active descendant
  getActiveDescendantId(node?: HTMLElement) {
    const el = node ?? this.root
    return el instanceof HTMLElement
      ? el.getAttribute("aria-activedescendant")
      : undefined
  }
}
