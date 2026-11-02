import { hasProp, isObject } from "@zag-js/utils"
import { ListCollection } from "./list-collection"
import type { CollectionItem, CollectionOptions } from "./types"

export interface PageListCollectionOptions<T extends CollectionItem = CollectionItem> extends CollectionOptions<T> {
  /**
   * All the items, on every page. An item whose parent is another item lives on that item's page.
   */
  items: Iterable<T> | Readonly<Iterable<T>>
  /**
   * The value of the item's parent, or `null` for a top-level item
   */
  itemToParent?: ((item: T) => string | null | undefined) | undefined
  /**
   * Whether the item opens a page even without children, e.g. one that loads its items
   */
  isItemPage?: ((item: T) => boolean) | undefined
  /**
   * The value of the page to open, or `null` for the top level
   */
  page?: string | null | undefined
}

export interface PageRestore {
  /**
   * The query to show on the page, as it was when the user left it
   */
  query: string
  /**
   * The item to highlight: the one the user came from when going back or up.
   * It may not be on the page, e.g. after a programmatic jump.
   */
  highlightedValue: string | null
}

interface PageTree<T> {
  items: T[]
  byValue: Map<string, T>
  children: Map<string | null, T[]>
}

interface PageState<T> {
  tree: PageTree<T>
  page: string | null
  // pages to go back to, oldest first
  history: (string | null)[]
  // the query last typed on each page
  queries: ReadonlyMap<string | null, string>
  restore: PageRestore
}

const fallback = {
  itemToParent(item: CollectionItem): string | null {
    if (isObject(item) && hasProp(item, "parent") && item.parent != null) return String(item.parent)
    return null
  },
  isItemPage(item: CollectionItem): boolean {
    return isObject(item) && hasProp(item, "page") && item.page === true
  },
}

const NO_RESTORE: PageRestore = { query: "", highlightedValue: null }

/**
 * A list collection of the items on one page of a drill-down, like a command menu's nested
 * pages (not pagination). `items` are the open page's items; `setItems` replaces them, e.g. with
 * search results, and keeps the page. Edits like `append` change that view, not the pages.
 */
export class PageListCollection<T extends CollectionItem = CollectionItem> extends ListCollection<T> {
  private state: PageState<T>

  constructor(options: PageListCollectionOptions<T>, state?: PageState<T>, items?: T[]) {
    const resolved = state ?? createState(options)
    super({ ...options, items: items ?? resolved.tree.children.get(resolved.page) ?? [] })
    this.state = resolved
  }

  private get pageOptions() {
    return this.options as PageListCollectionOptions<T>
  }

  private with = (state: Partial<PageState<T>>, items?: T[]) => {
    return new PageListCollection(this.pageOptions, { ...this.state, ...state }, items)
  }

  /**
   * Copy the collection, keeping its pages
   */
  copy = (items?: T[]): PageListCollection<T> => {
    return this.with({}, items ?? [...this.items])
  }

  /**
   * Replace the items shown on the open page, e.g. with search results
   */
  setItems = (items: T[]): PageListCollection<T> => {
    return this.copy(items)
  }

  /**
   * The value of the open page, or `null` at the top level
   */
  get page(): string | null {
    return this.state.page
  }

  /**
   * The item of the open page, or `null` at the top level
   */
  get pageItem(): T | null {
    return this.getItem(this.state.page)
  }

  /**
   * What to restore after the last `back` or `up`: the page's query and the item to highlight
   */
  get restore(): PageRestore {
    return this.state.restore
  }

  /**
   * Whether there's a page to go back to
   */
  get canGoBack(): boolean {
    return this.state.history.length > 0
  }

  /**
   * All the items, on every page
   */
  get allItems(): T[] {
    return this.state.tree.items
  }

  /**
   * Get an item on any page by its value
   */
  getItem = (value: string | null | undefined): T | null => {
    if (value == null) return null
    return this.state.tree.byValue.get(value) ?? null
  }

  /**
   * Get the value of the item's parent, or `null` when it's top-level
   */
  getParentValue = (item: T): string | null => {
    return parentOf(this.pageOptions, this.state.tree.byValue, item)
  }

  /**
   * Whether the item opens a page
   */
  isPage = (item: T): boolean => {
    const isItemPage = this.pageOptions.isItemPage ?? fallback.isItemPage
    return this.state.tree.children.has(this.getItemValue(item) ?? "") || isItemPage(item)
  }

  /**
   * Get the items on a page, the open one by default. `null` is the top level.
   */
  getChildren = (page: string | null = this.state.page): T[] => {
    return this.state.tree.children.get(page) ?? []
  }

  /**
   * Get the items on a page and all its nested pages, in depth-first order, e.g. for deep search
   */
  getDescendants = (page: string | null = this.state.page): T[] => {
    const seen = new Set<T>()
    const visit = (items: T[] | undefined) => {
      for (const item of items ?? []) {
        if (seen.has(item)) continue
        seen.add(item)
        visit(this.state.tree.children.get(this.getItemValue(item)))
      }
    }
    visit(this.state.tree.children.get(page))
    return [...seen]
  }

  /**
   * Get the item's ancestors, from the top level down to its parent, below the open page
   */
  getAncestors = (item: T, page: string | null = this.state.page): T[] => {
    const path: T[] = []
    let parent = this.getItem(this.getParentValue(item))
    while (parent && this.getItemValue(parent) !== page && !path.includes(parent)) {
      path.unshift(parent)
      parent = this.getItem(this.getParentValue(parent))
    }
    return path
  }

  /**
   * Get the pages from the top level to a page, the open one by default, e.g. for breadcrumbs
   */
  getPath = (page: string | null = this.state.page): T[] => {
    const item = this.getItem(page)
    return item ? [...this.getAncestors(item, null), item] : []
  }

  /**
   * Open a page, or the top level for `null`, and remember `query` for the page being left.
   * Returns the same collection when nothing changes.
   */
  setPage = (page: string | null, query = ""): PageListCollection<T> => {
    return this.go(page, query, "push") ?? this
  }

  /**
   * Go back to the previous page in the history. Returns the same collection when there's none.
   */
  back = (query = ""): PageListCollection<T> => {
    const { history } = this.state
    if (!history.length) return this
    return this.go(history[history.length - 1], query, "back") ?? this
  }

  /**
   * Go up to the parent page. Returns the same collection at the top level.
   */
  up = (query = ""): PageListCollection<T> => {
    const item = this.pageItem
    if (!item) return this
    return this.go(this.getParentValue(item), query, "up") ?? this
  }

  /**
   * Go to the top level, or the given page, and forget the history
   */
  reset = (page: string | null = null): PageListCollection<T> => {
    return this.with({ page: resolvePage(this.state.tree, page), history: [], queries: new Map(), restore: NO_RESTORE })
  }

  private go = (page: string | null, query: string, mode: "push" | "back" | "up"): PageListCollection<T> | null => {
    const { page: current, history } = this.state
    if (page === current) return null
    if (page != null && !this.getItem(page)) return null

    const queries = new Map(this.state.queries).set(current, query)

    // going to a page in the history drops everything after it
    const visited = history.lastIndexOf(page)
    const nextHistory = visited >= 0 ? history.slice(0, visited) : mode === "push" ? [...history, current] : history

    return this.with({ page, history: nextHistory, queries, restore: this.getRestore(page, queries, mode) })
  }

  private getRestore = (
    page: string | null,
    queries: ReadonlyMap<string | null, string>,
    mode: string,
  ): PageRestore => {
    // back: the page as it was left, highlighting the item that opened the current page (even after a deep-search jump)
    if (mode === "back") return { query: queries.get(page) ?? "", highlightedValue: this.state.page }

    // up the path: restore the query and highlight the page we came from
    const path = this.getPath()
    const depth = page == null ? 0 : path.findIndex((item) => this.getItemValue(item) === page) + 1
    const from = page == null || depth > 0 ? path[depth] : undefined
    return from ? { query: queries.get(page) ?? "", highlightedValue: this.getItemValue(from) } : NO_RESTORE
  }
}

function parentOf<T>(options: PageListCollectionOptions<T>, byValue: Map<string, T>, item: T): string | null {
  const parent = options.itemToParent?.(item) ?? fallback.itemToParent(item)
  return parent != null && byValue.has(parent) ? parent : null
}

function resolvePage<T>(tree: PageTree<T>, page: string | null | undefined): string | null {
  return page != null && tree.byValue.has(page) ? page : null
}

function createState<T>(options: PageListCollectionOptions<T>): PageState<T> {
  const list = new ListCollection<T>({ ...options, items: [] })
  const items = [...options.items] as T[]

  const byValue = new Map<string, T>()
  for (const item of items) byValue.set(list.getItemValue(item) ?? "", item)

  const children = new Map<string | null, T[]>()
  for (const item of items) {
    const parent = parentOf(options, byValue, item)
    const siblings = children.get(parent)
    if (siblings) siblings.push(item)
    else children.set(parent, [item])
  }

  const tree = { items, byValue, children }
  return { tree, page: resolvePage(tree, options.page), history: [], queries: new Map(), restore: NO_RESTORE }
}

export function isPageListCollection(v: unknown): v is PageListCollection<any> {
  return v instanceof PageListCollection
}
