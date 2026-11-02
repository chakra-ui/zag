import { hasProp, isObject } from "@zag-js/utils"
import type { CollectionItem } from "./types"

export interface PageTreeOptions<T extends CollectionItem = CollectionItem> {
  /**
   * The flat list of items. An item whose parent is another item lives on that item's page.
   */
  items: Iterable<T> | Readonly<Iterable<T>>
  /**
   * The value of the item
   */
  itemToValue?: ((item: T) => string) | undefined
  /**
   * The value of the item's parent, or `null` for a top-level item
   */
  itemToParent?: ((item: T) => string | null | undefined) | undefined
  /**
   * Whether the item opens a page even without children, e.g. one that loads its items
   */
  isItemPage?: ((item: T) => boolean) | undefined
}

export interface PageState {
  /**
   * The value of the open page, or `null` at the top level
   */
  page: string | null
  /**
   * The pages to go back to, oldest first
   */
  history: (string | null)[]
  /**
   * The query last typed on each page, restored when going back to it
   */
  queries: ReadonlyMap<string | null, string>
}

export interface PageChange {
  /**
   * The next state
   */
  state: PageState
  /**
   * The query to show on the new page
   */
  query: string
  /**
   * The item to highlight on the new page: the one the user came from when going back or up.
   * It may not be on the new page, e.g. after a programmatic `navigate`.
   */
  highlightedValue: string | null
}

const fallback = {
  itemToValue(item: CollectionItem): string {
    if (typeof item === "string") return item
    if (isObject(item) && hasProp(item, "value")) return String(item.value)
    return ""
  },
  itemToParent(item: CollectionItem): string | null {
    if (isObject(item) && hasProp(item, "parent") && item.parent != null) return String(item.parent)
    return null
  },
  isItemPage(item: CollectionItem): boolean {
    return isObject(item) && hasProp(item, "page") && item.page === true
  },
}

/**
 * Creates the initial navigation state, at the top level or the given page.
 */
export function createPageState(page: string | null = null): PageState {
  return { page, history: [], queries: new Map() }
}

/**
 * A flat list of items arranged into nested pages by their parent, with
 * history-based navigation between pages. Navigation is pure: each method
 * takes a `PageState` and returns the next one.
 */
export class PageTree<T extends CollectionItem = CollectionItem> {
  /**
   * The items in the tree
   */
  readonly items: T[]
  private byValue = new Map<string, T>()
  private children = new Map<string | null, T[]>()

  constructor(private options: PageTreeOptions<T>) {
    this.items = [...options.items] as T[]

    for (const item of this.items) this.byValue.set(this.getItemValue(item), item)

    for (const item of this.items) {
      const parent = this.getParentValue(item)
      const list = this.children.get(parent)
      if (list) list.push(item)
      else this.children.set(parent, [item])
    }
  }

  /**
   * Convert an item to a value
   */
  getItemValue = (item: T): string => {
    return this.options.itemToValue?.(item) ?? fallback.itemToValue(item)
  }

  /**
   * Get the value of the item's parent, or `null` when it's missing from the tree
   */
  getParentValue = (item: T): string | null => {
    const parent = this.options.itemToParent?.(item) ?? fallback.itemToParent(item)
    return parent != null && this.byValue.has(parent) ? parent : null
  }

  /**
   * Get the item based on its value
   */
  find = (value: string | null | undefined): T | null => {
    if (value == null) return null
    return this.byValue.get(value) ?? null
  }

  /**
   * Whether the tree has an item with the value
   */
  has = (value: string): boolean => {
    return this.byValue.has(value)
  }

  /**
   * Whether the item opens a page
   */
  isPage = (item: T): boolean => {
    return this.children.has(this.getItemValue(item)) || !!(this.options.isItemPage ?? fallback.isItemPage)(item)
  }

  /**
   * Get the items on a page, or the top-level items for `null`
   */
  getChildren = (page: string | null): T[] => {
    return this.children.get(page) ?? []
  }

  /**
   * Get the items on a page and all its nested pages, in depth-first order
   */
  getDescendants = (page: string | null): T[] => {
    const seen = new Set<T>()
    const visit = (items: T[] | undefined) => {
      for (const item of items ?? []) {
        if (seen.has(item)) continue
        seen.add(item)
        visit(this.children.get(this.getItemValue(item)))
      }
    }
    visit(this.children.get(page))
    return [...seen]
  }

  /**
   * Get the item's ancestors, from the top level down to its parent. Stops below `page` when given.
   */
  getAncestors = (item: T, page: string | null = null): T[] => {
    const path: T[] = []
    let parent = this.find(this.getParentValue(item))
    while (parent && this.getItemValue(parent) !== page && !path.includes(parent)) {
      path.unshift(parent)
      parent = this.find(this.getParentValue(parent))
    }
    return path
  }

  /**
   * Get the pages from the top level to the given page, e.g. for breadcrumbs
   */
  getPath = (page: string | null): T[] => {
    const item = this.find(page)
    return item ? [...this.getAncestors(item), item] : []
  }

  /**
   * Open a page, or the top level for `null`. Returns `null` when nothing changes.
   */
  navigate = (state: PageState, page: string | null, query: string): PageChange | null => {
    return this.go(state, page, query, true)
  }

  /**
   * Go back to the previous page in the history, restoring its query. Returns `null` when there's none.
   */
  back = (state: PageState, query: string): PageChange | null => {
    if (!state.history.length) return null
    const page = state.history[state.history.length - 1]
    const change = this.go(state, page, query, false)
    // restore the page as it was left, and highlight the item that opened the page we're leaving
    return change && { ...change, query: change.state.queries.get(page) ?? "", highlightedValue: state.page }
  }

  /**
   * Go up to the parent page. Returns `null` at the top level.
   */
  up = (state: PageState, query: string): PageChange | null => {
    const item = this.find(state.page)
    if (!item) return null
    return this.go(state, this.getParentValue(item), query, false)
  }

  private go = (state: PageState, page: string | null, query: string, push: boolean): PageChange | null => {
    if (page === state.page) return null
    if (page != null && !this.has(page)) return null

    const queries = new Map(state.queries).set(state.page, query)

    // going back to a page in the history drops everything after it
    const visited = state.history.lastIndexOf(page)
    const history =
      visited >= 0 ? state.history.slice(0, visited) : push ? [...state.history, state.page] : state.history

    // when moving up the path, restore the query and highlight the page we came from
    const path = this.getPath(state.page)
    const depth = page == null ? 0 : path.findIndex((item) => this.getItemValue(item) === page) + 1
    const from = page == null || depth > 0 ? path[depth] : undefined

    return {
      state: { page, history, queries },
      query: from ? (queries.get(page) ?? "") : "",
      highlightedValue: from ? this.getItemValue(from) : null,
    }
  }
}
