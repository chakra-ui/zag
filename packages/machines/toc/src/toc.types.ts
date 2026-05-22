import type { EventObject, Machine, Service } from "@zag-js/core"
import type { CommonProperties, DirectionProperty, PropTypes, Rect, RequiredBy } from "@zag-js/types"

/* -----------------------------------------------------------------------------
 * Item types
 * -----------------------------------------------------------------------------*/

export interface TocItem {
  /**
   * The slug/id of the heading element in the document
   */
  value: string
  /**
   * The nesting depth (e.g., 2 for h2, 3 for h3)
   */
  depth: number
}

/* -----------------------------------------------------------------------------
 * Callback details
 * -----------------------------------------------------------------------------*/

export interface ActiveChangeDetails {
  /**
   * All currently active (visible) heading ids
   */
  activeIds: string[]
  /**
   * The active (visible) TOC items
   */
  activeItems: TocItem[]
}

export interface ScrollToDetails {
  /**
   * The behavior to use when scrolling to the heading.
   */
  behavior?: ScrollBehavior | undefined
}

/* -----------------------------------------------------------------------------
 * Machine context
 * -----------------------------------------------------------------------------*/

export type ElementIds = Partial<{
  root: string
  title: string
  list: string
  item: (value: string) => string
  link: (value: string) => string
  indicator: string
}>

export interface TocProps extends DirectionProperty, CommonProperties {
  /**
   * The ids of the elements in the TOC. Useful for composition.
   */
  ids?: ElementIds | undefined
  /**
   * The TOC items with `value` (slug/id) and `depth` (heading level).
   */
  items: TocItem[]
  /**
   * The root margin for the IntersectionObserver.
   * Controls the effective viewport area for determining active headings.
   *
   * @default "-20px 0px -40% 0px"
   */
  rootMargin?: string | undefined
  /**
   * The IntersectionObserver threshold. A value of `0` means the heading is
   * active as soon as even one pixel is visible within the root margin area.
   * @default 0
   */
  threshold?: number | number[] | undefined
  /**
   * Function that returns the scroll container element to observe within.
   * Defaults to the document/viewport.
   */
  scrollEl?: (() => HTMLElement | null) | undefined
  /**
   * Whether to auto-scroll the TOC container so the first active item
   * is visible when active headings change.
   * @default true
   */
  autoScroll?: boolean | undefined
  /**
   * The default scroll behavior used when auto-scrolling the TOC container
   * and when scrolling to a heading (via link click or `api.scrollTo`).
   * Can be overridden per-call by passing `behavior` to `api.scrollTo`.
   * @default "smooth"
   */
  scrollBehavior?: ScrollBehavior | undefined
  /**
   * Callback when the active (visible) headings change.
   */
  onActiveChange?: ((details: ActiveChangeDetails) => void) | undefined
  /**
   * The controlled active heading ids.
   */
  activeIds?: string[] | undefined
  /**
   * The default active heading ids when rendered.
   * Use when you don't need to control the active headings.
   */
  defaultActiveIds?: string[] | undefined
}

type PropsWithDefault = "rootMargin" | "threshold" | "autoScroll" | "scrollBehavior" | "items"

export interface TocSchema {
  state: "idle"
  props: RequiredBy<TocProps, PropsWithDefault>
  context: {
    activeIds: string[]
    indicatorRect: Rect | null
  }
  refs: {
    visibilityMap: Map<string, boolean>
    indicatorCleanup: VoidFunction | null
  }
  computed: {
    activeItems: TocItem[]
  }
  action: string
  guard: string
  effect: string
  event: EventObject
}

export type TocService = Service<TocSchema>

export type TocMachine = Machine<TocSchema>

/* -----------------------------------------------------------------------------
 * Component API
 * -----------------------------------------------------------------------------*/

export interface ItemProps {
  /**
   * The TOC item
   */
  item: TocItem
}

export interface ItemState {
  /**
   * Whether this heading is currently visible/active
   */
  active: boolean
  /**
   * Whether this is the first active heading
   */
  first: boolean
  /**
   * Whether this is the last active heading
   */
  last: boolean
  /**
   * The depth of this heading (for indentation)
   */
  depth: number
}

export interface TocApi<T extends PropTypes = PropTypes> {
  /**
   * All currently active (visible) heading ids
   */
  activeIds: string[]
  /**
   * The active (visible) TOC items
   */
  activeItems: TocItem[]
  /**
   * The resolved items list
   */
  items: TocItem[]
  /**
   * Manually set the active heading ids
   */
  setActiveIds(value: string[]): void
  /**
   * Scrolls to the heading with the given id.
   */
  scrollTo(value: string, details?: ScrollToDetails): void
  /**
   * Returns the state of a TOC item
   */
  getItemState(props: ItemProps): ItemState

  getRootProps(): T["element"]
  getTitleProps(): T["element"]
  getListProps(): T["element"]
  getItemProps(props: ItemProps): T["element"]
  getLinkProps(props: ItemProps): T["element"]
  getIndicatorProps(): T["element"]
}
