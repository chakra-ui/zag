import type { EventObject, Service } from "@zag-js/core"
import type { CommonProperties, DirectionProperty, PropTypes, RequiredBy } from "@zag-js/types"

/* -----------------------------------------------------------------------------
 * Callback details
 * -----------------------------------------------------------------------------*/

export interface PageChangeDetails {
  page: number
  pageSize: number
}

export interface PageSizeChangeDetails {
  pageSize: number
}

/* -----------------------------------------------------------------------------
 * Machine context
 * -----------------------------------------------------------------------------*/

export interface ItemLabelDetails {
  page: number
  totalPages: number
}

export interface IntlTranslations {
  rootLabel?: string | undefined
  prevTriggerLabel?: string | undefined
  nextTriggerLabel?: string | undefined
  itemLabel?(details: ItemLabelDetails): string
}

export type ElementIds = Partial<{
  root: string
  ellipsis(index: number): string
  prevTrigger: string
  nextTrigger: string
  item(page: number): string
}>

export interface PaginationProps extends DirectionProperty, CommonProperties {
  /**
   * The ids of the elements in the accordion. Useful for composition.
   */
  ids?: ElementIds | undefined
  /**
   * Specifies the localized strings that identifies the accessibility elements and their states
   */
  translations?: IntlTranslations | undefined
  /**
   * Total number of data items
   */
  count?: number | undefined
  /**
   * Number of data items per page
   */
  pageSize?: number | undefined
  /**
   * Default number of data items per page
   * @default 10
   */
  defaultPageSize?: number | undefined
  /**
   * Number of pages to show beside active page
   * @default 1
   */
  siblingCount?: number | undefined
  /**
   * The active page
   */
  page?: number | undefined
  /**
   * Default active page
   * @default 1
   */
  defaultPage?: number | undefined
  /**
   * Called when the page number is changed
   */
  onPageChange?: ((details: PageChangeDetails) => void) | undefined
  /**
   * Called when the page size is changed
   */
  onPageSizeChange?: ((details: PageSizeChangeDetails) => void) | undefined
  /**
   * The type of the trigger element
   * @default "button"
   */
  type?: "button" | "link" | undefined
}

type PropsWithDefault = "defaultPageSize" | "defaultPage" | "siblingCount" | "translations" | "type" | "count"

interface PrivateContext {
  page: number
  pageSize: number
}

type ComputedContext = Readonly<{
  /**
   * Total number of pages
   */
  totalPages: number
  /**
   * Index of first and last data items on current page
   */
  pageRange: { start: number; end: number }
  /**
   * The previous page index
   */
  previousPage: number | null
  /**
   * The next page index
   */
  nextPage: number | null
  /**
   * Whether the current page is valid
   */
  isValidPage: boolean
}>

export interface PaginationSchema {
  state: "idle"
  props: RequiredBy<PaginationProps, PropsWithDefault>
  context: PrivateContext
  computed: ComputedContext
  event: EventObject
  action: string
  guard: string
  effect: string
}

export type PaginationService = Service<PaginationSchema>

/* -----------------------------------------------------------------------------
 * Component API
 * -----------------------------------------------------------------------------*/

export interface ItemProps {
  type: "page"
  value: number
}

export interface EllipsisProps {
  index: number
}

export type Pages = Array<{ type: "ellipsis" } | { type: "page"; value: number }>

interface PageRange {
  start: number
  end: number
}

export interface PaginationApi<T extends PropTypes = PropTypes> {
  /**
   * The current page.
   */
  page: number
  /**
   * The total number of data items.
   */
  count: number
  /**
   * The number of data items per page.
   */
  pageSize: number
  /**
   * The total number of pages.
   */
  totalPages: number
  /**
   * The page range. Represented as an array of page numbers (including ellipsis)
   */
  pages: Pages
  /**
   * The previous page.
   */
  previousPage: number | null
  /**
   * The next page.
   */
  nextPage: number | null
  /**
   * The page range. Represented as an object with `start` and `end` properties.
   */
  pageRange: PageRange
  /**
   * Function to slice an array of data based on the current page.
   */
  slice<V>(data: V[]): V[]
  /**
   * Function to set the page size.
   */
  setPageSize(size: number): void
  /**
   * Function to set the current page.
   */
  setPage(page: number): void
  /**
   * Function to go to the next page.
   */
  goToNextPage(): void
  /**
   * Function to go to the previous page.
   */
  goToPrevPage(): void
  /**
   * Function to go to the first page.
   */
  goToFirstPage(): void
  /**
   * Function to go to the last page.
   */
  goToLastPage(): void

  getRootProps(): T["element"]
  getEllipsisProps(props: EllipsisProps): T["element"]
  getItemProps(page: ItemProps): T["element"]
  getPrevTriggerProps(): T["element"]
  getNextTriggerProps(): T["element"]
}
